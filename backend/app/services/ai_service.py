import os
import json
import re
from typing import Optional
from dotenv import load_dotenv
from google import genai  # type: ignore[import-untyped]

load_dotenv()


_MODELS = [
    "gemini-2.5-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
]

_client_instance: Optional[genai.Client] = None

def _get_genai_client() -> genai.Client:
    """Khởi tạo hoặc tái sử dụng Gemini Client (Singleton)."""
    global _client_instance
    if _client_instance is None:
        api_key = os.environ.get("GEMINI_API_KEY", "")
        _client_instance = genai.Client(api_key=api_key)
    return _client_instance

def _extract_json_string(raw: str) -> str:
    """Bóc tách chuỗi JSON sạch từ phản hồi thô của AI Gemini."""
    text = raw.strip()
    # 1. Bóc từ code block ```json ... ```
    if "```json" in text:
        match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
        if match:
            return match.group(1).strip()
    elif "```" in text:
        match = re.search(r'```\s*(.*?)\s*```', text, re.DOTALL)
        if match:
            return match.group(1).strip()

    # 2. Bóc từ dấu ngoặc nhọn { đầu tiên đến dấu } cuối cùng
    start_idx = text.find('{')
    end_idx = text.rfind('}')
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        return text[start_idx:end_idx + 1].strip()

    return text

def _call_gemini(prompt: str) -> str:
    """Gọi Gemini API, thử lần lượt các model cho đến khi thành công."""
    client = _get_genai_client()
    last_error = None

    for model in _MODELS:
        try:
            response = client.models.generate_content(model=model, contents=prompt)
            raw = response.text or ""
            return _extract_json_string(raw)
        except Exception as e:
            last_error = e
            err_str = str(e).upper()
            # Nếu model không tồn tại (404), hết quota (429), quá tải (503) hoặc tạm thời lỗi -> thử model tiếp theo
            if any(code in err_str for code in ["404", "429", "503", "500", "NOT_FOUND", "RESOURCE_EXHAUSTED", "UNAVAILABLE"]):
                continue
            # Lỗi khác (400 Bad Request) -> dừng
            raise

    # Tất cả model đều không khả dụng
    raise RuntimeError(f"Tất cả model Gemini đều không phản hồi: {last_error}")



def diagnose_laptop_issue(laptop_name: str, issue_description: str) -> dict:
    """Chẩn đoán lỗi laptop và gợi ý danh mục linh kiện cần mua."""
    prompt = f"""
    Bạn là một kỹ thuật viên phần cứng máy tính & laptop chuyên nghiệp của "Vua Linh Kiện".
    Khách hàng đang dùng Laptop '{laptop_name}' và gặp sự cố: '{issue_description}'.

    YÊU CẦU BẮT BỘC:
    1. Đưa ra chẩn đoán nguyên nhân kỹ thuật ngắn gọn, chính xác bằng tiếng Việt.
    2. QUY TẮC PHÂN LOẠI LINH KIỆN:
       - Nếu sự cố liên quan đến "tràn RAM / thiếu RAM / lag giật do mở nhiều tab web/ứng dụng": 
         + Với Laptop thông thường nâng cấp được (Dell, Asus, HP, Acer, Lenovo... có khe RAM rời): Đề xuất nâng cấp **RAM**.
         + Với MacBook M1/M2/M3 (Apple Silicon) hoặc máy hàn RAM cố định: Giải thích rõ máy dùng RAM hợp nhất (Unified Memory) hàn chết trên bo mạch nên KHÔNG THỂ nâng cấp RAM vật lý sau khi mua, khuyên khách tắt bớt app ngầm hoặc restart máy, và để "recommended_category_names" là [].
       - Nếu sự cố liên quan đến "đầy bộ nhớ lưu trữ / hết dung lượng ổ đĩa / ổ C báo đỏ": Đề xuất nâng cấp **Ổ Cứng** (SSD).
       - Nếu sự cố liên quan đến "nóng máy/nhiệt độ cao": Hướng dẫn khách vệ sinh tra keo tản nhiệt laptop hoặc dùng đế tản nhiệt. KHÔNG gợi ý RAM/Ổ Cứng, để "recommended_category_names" là [].

    Trong trường "recommended_category_names", CHỈ ĐƯỢC CHỌN từ: ["RAM", "Ổ Cứng"] hoặc để mảng rỗng [] nếu máy không nâng cấp được hoặc sự cố không cần thay linh kiện này.

    Trả về JSON raw (không markdown):
    {{
        "diagnosis": "lời chẩn đoán nguyên nhân và giải pháp kỹ thuật chuẩn xác bằng Tiếng Việt",
        "recommended_category_names": ["RAM"]
    }}
    """
    try:
        raw = _call_gemini(prompt)
        return json.loads(raw)
    except Exception as e:
        return {
            "diagnosis": f"Lỗi phân tích tự động: {str(e)[:50]}. Vui lòng thử lại sau!",
            "recommended_category_names": []
        }


def evaluate_pc_build(items_list: list) -> dict:
    """Đánh giá tính tương thích của bộ linh kiện PC Builder."""
    prompt = f"""
    Bạn là chuyên gia kỹ thuật phần cứng Build PC của "Vua Linh Kiện".
    Khách hàng đã chọn danh sách linh kiện sau:
    {json.dumps(items_list, ensure_ascii=False, indent=2)}

    Hãy phân tích và đánh giá tính tương thích phần cứng:
    1. Socket CPU và Mainboard (AM4/AM5/LGA1700...) có khớp không? (Sai socket -> is_compatible = false).
    2. Chuẩn RAM (DDR4 / DDR5) có khớp với Mainboard không?
    3. Nguồn (PSU) có đủ công suất gánh CPU + VGA + các linh kiện khác không?
    4. Tản nhiệt và Vỏ case đã đủ hoặc tối ưu chưa?

    YÊU CẦU: Trả về JSON raw chuẩn xác (không markdown text bên ngoài):
    {{
        "is_compatible": true,
        "summary": "Tóm tắt kết luận ngắn gọn trong 1 câu (VD: Cấu hình tương thích 100%, sẵn sàng lắp ráp và vận hành ổn định!)",
        "suitability": "Tác vụ phù hợp nhất (VD: Gaming 2K/4K max settings, Đồ họa 3D, Render video)",
        "details": [
            {{
                "title": "CPU & Bo Mạch Chủ",
                "status": "pass",
                "desc": "Mô tả ngắn gọn về Socket và độ tương thích giữa CPU và Main."
            }},
            {{
                "title": "RAM & Băng Thông",
                "status": "pass",
                "desc": "Mô tả ngắn về chuẩn DDR4/DDR5 và kênh bộ nhớ."
            }},
            {{
                "title": "Card Đồ Họa & Nguồn Điện",
                "status": "pass",
                "desc": "Mô tả ngắn về công suất nguồn so với TDP VGA."
            }},
            {{
                "title": "Tản Nhiệt & Vỏ Case",
                "status": "pass",
                "desc": "Đánh giá tản nhiệt/vỏ case hoặc nhắc nhở nếu chưa chọn."
            }}
        ],
        "evaluation": "Nhận xét tổng quan súc tích 2-3 câu bằng Tiếng Việt."
    }}
    (Lưu ý: Trường 'status' trong mỗi phần tử details chỉ được mang 1 trong 3 giá trị: "pass", "warning", "fail").
    """
    try:
        raw = _call_gemini(prompt)
        return json.loads(raw)
    except Exception as e:
        return {
            "is_compatible": False,
            "summary": "Không thể phân tích tương thích tự động lúc này.",
            "suitability": "Chưa xác định",
            "details": [],
            "evaluation": f"Lỗi phân tích AI: {str(e)[:50]}..."
        }


def recommend_pc_build(user_requirement: str) -> dict:
    """Phân tích yêu cầu Build PC và trả về ngân sách tối đa cho từng linh kiện."""
    prompt = f"""
    Bạn là chuyên gia tư vấn cấu hình PC của "Vua Linh Kiện" tại Việt Nam.
    Khách hàng yêu cầu: "{user_requirement}"

    Database cửa hàng có ĐÚNG 8 danh mục (dùng CHÍNH XÁC các tên sau):
    CPU, Mainboard, RAM, VGA, Nguồn (PSU), Vỏ Case, Ổ Cứng, Tản Nhiệt

    Phân tích ngân sách và mục đích sử dụng, phân bổ budget hợp lý cho mỗi linh kiện (VND).

    Trả về JSON raw (không markdown), bao gồm ĐỦ 8 linh kiện:
    {{
        "message": "Lời tư vấn thân thiện ngắn gọn về cấu hình này (2-3 câu tiếng Việt)",
        "use_case": "gaming",
        "components": [
            {{"category": "CPU", "price_max": 5000000}},
            {{"category": "Mainboard", "price_max": 3000000}},
            {{"category": "RAM", "price_max": 1500000}},
            {{"category": "VGA", "price_max": 8000000}},
            {{"category": "Nguồn (PSU)", "price_max": 1500000}},
            {{"category": "Vỏ Case", "price_max": 1000000}},
            {{"category": "Ổ Cứng", "price_max": 1000000}},
            {{"category": "Tản Nhiệt", "price_max": 500000}}
        ]
    }}
    """
    try:
        raw = _call_gemini(prompt)
        return json.loads(raw)
    except Exception as e:
        return {
            "message": f"Không thể phân tích yêu cầu do lỗi AI: {str(e)[:50]}.",
            "use_case": "general",
            "components": []
        }
