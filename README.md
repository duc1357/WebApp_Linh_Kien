# Web_Linh_Kien - Thực hiện bởi Nhóm minhduc (2026)

Hệ thống Website bán giảng linh kiện điện tử chuyên nghiệp, đạt chuẩn thiết kế kiến trúc Modular (Standard 2025).

## Cấu trúc dự án
- `frontend/`: Ứng dụng ReactJS (Vite) đóng vai trò hiển thị và xử lý UI/UX.
- `backend/`: API Server FastAPI (Python) quản lý CSDL SQLite, xử lý tác vụ, và tích hợp AI.

## Triển khai dự án (Deploy & Run)
### 1. Khởi động Backend
```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate    | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API truy cập tại: `http://localhost:8000`

### 2. Khởi động Frontend
```bash
cd frontend
npm install
npm run dev
```
Giao diện chạy tại: `http://localhost:5173`

*(Generated automatically for the repository).*
