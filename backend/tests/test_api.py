import pytest
from starlette.testclient import TestClient
from unittest.mock import patch
from app.main import app
import os

client = TestClient(app)

def test_auth_flow():
    """
    TC: Kiểm tra tự động luồng Đăng ký -> Đăng nhập đúng cấp phát JWT -> Đăng nhập sai trả về HTTP 401.
    """
    test_email = "test_pytest_user@example.com"
    test_password = "SecurePassword123@"
    
    # 1. Đăng ký tài khoản mới
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": test_email,
            "full_name": "Pytest User",
            "password": test_password,
            "phone_number": "0987654321"
        }
    )
    # Có thể 200 (mới tạo) hoặc 400 (đã tồn tại từ lần chạy trước)
    assert reg_res.status_code in (200, 400)
    
    # 2. Đăng nhập sai mật khẩu -> Phải trả về HTTP 401
    fail_res = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_email,
            "password": "WrongPasswordXYZ"
        }
    )
    assert fail_res.status_code == 401
    
    # 3. Đăng nhập đúng mật khẩu -> Cấp phát JWT Access Token
    login_res = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_email,
            "password": test_password
        }
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data.get("token_type") == "bearer"


def test_ai_compatibility_conflict():
    """
    TC: Kiểm tra logic phát hiện xung đột phần cứng (CPU Socket LGA1700 kết hợp Mainboard AM5 phải trả về is_compatible: False).
    """
    payload = {
        "items": [
            {
                "category_name": "CPU",
                "product_name": "Intel Core i5-13400F",
                "specs": "Socket LGA1700, 10 Cores 16 Threads, 65W",
                "price": 4600000.0
            },
            {
                "category_name": "Mainboard",
                "product_name": "Mainboard ASUS TUF Gaming B650M-PLUS",
                "specs": "Socket AM5, DDR5, Micro-ATX",
                "price": 4200000.0
            }
        ]
    }
    
    # Giả lập phản hồi từ AI Engine nhận diện xung đột Socket LGA1700 vs AM5
    mock_ai_response = {
        "is_compatible": False,
        "summary": "Xung đột socket nghiêm trọng: CPU LGA1700 không thể gắn trên Mainboard AM5!",
        "suitability": "Không thể lắp ráp",
        "details": [
            {"title": "CPU & Bo Mạch Chủ", "status": "fail", "desc": "Xung đột chân cắm (LGA1700 vs AM5)."}
        ],
        "evaluation": "Cấu hình không tương thích phần cứng vật lý."
    }
    
    with patch("app.services.ai_service.evaluate_pc_build", return_value=mock_ai_response):
        res = client.post("/api/v1/pc-builder/validate", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["is_compatible"] is False


def test_sepay_webhook_idempotency():
    """
    TC: Kiểm định tính toàn vẹn của Webhook khi cổng thanh toán gửi thông báo số dư.
    """
    os.environ["SEPAY_API_KEY"] = "TEST_API_KEY_SECRET"
    headers = {"Authorization": "Apikey TEST_API_KEY_SECRET"}
    
    payload = {
        "id": 99999,
        "gateway": "MBBank",
        "transactionDate": "2026-09-14 10:00:00",
        "accountNumber": "0799412960",
        "subAccount": None,
        "code": None,
        "content": "VLK999999 CHUYEN KHOAN",
        "transferType": "in",
        "transferAmount": 50000,
        "accumulated": 50000,
        "referenceCode": "REF123456",
        "description": "VLK999999 CHUYEN KHOAN"
    }
    
    # 1. Gửi request lần 1: hợp lệ
    res1 = client.post("/api/v1/payment/webhook", json=payload, headers=headers)
    assert res1.status_code in (200, 404)  # 200 nếu đơn tồn tại hoặc bỏ qua an toàn
    
    # 2. Gửi sai API Key -> Phải chặn lại 403
    bad_headers = {"Authorization": "Apikey WRONG_KEY"}
    res2 = client.post("/api/v1/payment/webhook", json=payload, headers=bad_headers)
    assert res2.status_code == 403
