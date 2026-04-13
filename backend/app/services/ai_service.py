import os
import json
from google import genai  # type: ignore[import-untyped]

# Danh sách model theo thứ tự ưu tiên (thử từng cái cho đến khi thành công)
_MODELS = [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
]


def _call_gemini(prompt: str) -> str:
    """Gọi Gemini API, thử lần lượt các model cho đến khi thành công."""
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))
    last_error = None

    for model in _MODELS:
        try:
            response = client.models.generate_content(model=model, contents=prompt)
            raw = response.text.strip()
            # Loại bỏ markdown code block nếu có
            if raw.startswith("```json"):
                raw = raw[7:]
                if raw.endswith("```"):
                    raw = raw[:-3]
            elif raw.startswith("```"):
                raw = raw[3:]
                if raw.endswith("```"):
                    raw = raw[:-3]
            return raw.strip()
        except Exception as e:
            last_error = e
            err_str = str(e)
            # Nếu quota hết (429) hoặc quá tải (503) → thử model tiếp theo
            if any(code in err_str for code in ["429", "503", "RESOURCE_EXHAUSTED", "UNAVAILABLE"]):
                continue
            # Lỗi khác (400, 404) → không thử tiếp
            raise

    # Tất cả model đều bị quota/quá tải
    raise RuntimeError(f"quota_exhausted: {last_error}")


def diagnose_laptop_issue(laptop_name: str, issue_description: str) -> dict:
    """Chẩn đoán lỗi laptop và gợi ý danh mục linh kiện cần mua."""
    prompt = f"""
    Bạn là một kỹ thuật viên sửa chữa máy tính chuyên nghiệp của "Vua Linh Kiện".
    Khách hàng đang dùng máy '{laptop_name}' và gặp vấn đề: '{issue_description}'.

    Hãy đưa ra chẩn đoán nguyên nhân ngắn gọn bằng tiếng Việt.
    Sau đó đề xuất danh mục linh kiện cần mua từ danh sách:
    RAM, Ổ Cứng, Tản Nhiệt, VGA, CPU, Mainboard, Nguồn (PSU), Vỏ Case

    Trả về JSON raw (không markdown):
    {{
        "diagnosis": "lời chẩn đoán nguyên nhân bằng TV",
        "recommended_category_names": ["RAM", "Ổ Cứng"]
    }}
    """
    try:
        raw = _call_gemini(prompt)
        return json.loads(raw)
    except (json.JSONDecodeError, ValueError):
        return {
            "diagnosis": "Không thể chẩn đoán tự động. Vui lòng mô tả chi tiết hơn!",
            "recommended_category_names": []
        }


def evaluate_pc_build(items_list: list) -> dict:
    """Đánh giá tính tương thích của bộ linh kiện PC Builder."""
    prompt = f"""
    Bạn là chuyên gia phần cứng Build PC của "Vua Linh Kiện".
    Khách hàng đã chọn các linh kiện sau:
    {json.dumps(items_list, ensure_ascii=False, indent=2)}

    Hãy đánh giá:
    1. Bộ linh kiện có ráp lại CHẠY ĐƯỢC không? (Xét Socket CPU/Main, RAM DDR4/DDR5, Nguồn đủ W)
    2. Cấu hình phù hợp để làm gì (game/đồ họa/văn phòng)?

    Lưu ý: Thiếu Vỏ Case hoặc Tản Nhiệt vẫn coi là "chạy được" nhưng cần nhắc nhở.
    Sai Socket CPU/Main = is_compatible: false tuyệt đối.

    Trả về JSON raw (không markdown):
    {{
        "is_compatible": true,
        "evaluation": "Nhận xét chi tiết bằng tiếng Việt."
    }}
    """
    try:
        raw = _call_gemini(prompt)
        return json.loads(raw)
    except (json.JSONDecodeError, ValueError):
        return {
            "is_compatible": False,
            "evaluation": "Lỗi phân tích AI. Không thể đánh giá ngay lúc này."
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
    except (json.JSONDecodeError, ValueError):
        return {
            "message": "Không thể phân tích yêu cầu. Vui lòng thử lại với mô tả rõ hơn!",
            "use_case": "general",
            "components": []
        }
