from dotenv import load_dotenv
load_dotenv()  # Nạp biến môi trường từ .env TRƯỚC khi import ai_service
import os

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import traceback
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from app.core.database import engine, get_db
import app.models.models as models
import app.schemas.schemas as schemas
import app.crud.crud as crud
import app.core.auth as auth
from app.api.routes_auth import router as auth_router
from app.api.routes_user import router as user_router
from app.api.routes_admin import router as admin_router
import app.services.email_service as email_service

# Auto-migrate tables (tạo bảng mới nếu chưa có, bao gồm PasswordResetToken)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Website Linh Kiện E-commerce")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Trả về chuỗi traceback chi tiết lên frontend để debug Render
    return JSONResponse(
        status_code=500,
        content={"detail": f"SERVER ERROR: {str(exc)}"}
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Nextjs fallback
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+",
    allow_credentials=True,   # Bắt buộc để HttpOnly Cookie hoạt động
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(user_router, prefix="/api/v1/user", tags=["User"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["Admin"])

os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
# ======= 🛒 E-COMMERCE CORE ENDPOINTS =======

@app.get("/api/v1/categories", response_model=list[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)

@app.get("/api/v1/products", response_model=list[schemas.Product])
def get_products(category_id: int = None, search: str = None, db: Session = Depends(get_db)):
    return crud.get_products(db, category_id, search)

@app.get("/api/v1/products/{product_id}", response_model=schemas.Product)
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại!")
    return product

@app.get("/api/v1/products/{product_id}/reviews", response_model=list[schemas.ReviewResponse])
def get_reviews(product_id: int, db: Session = Depends(get_db)):
    return crud.get_product_reviews(db, product_id)

@app.post("/api/v1/products/{product_id}/reviews", response_model=schemas.ReviewResponse)
def create_review(
    product_id: int, 
    review: schemas.ReviewCreate, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if review.product_id != product_id:
        raise HTTPException(status_code=400, detail="Mismatched product ID")
    
    if not crud.verify_user_purchased_item(db, current_user.id, product_id):
        raise HTTPException(status_code=403, detail="Chỉ khách hàng đã mua sản phẩm này mới được đánh giá!")
        
    return crud.create_review(db, review, current_user.id)

@app.post("/api/v1/orders/checkout", response_model=schemas.OrderResponse)
def checkout(order_data: schemas.OrderCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        new_order = crud.create_order(db, order_data)
        
        # Bắn sự kiện gửi Hóa đơn điện tử qua Email xuống chạy ngầm
        background_tasks.add_task(
            email_service.send_order_confirmation,
            to_email=order_data.user_email,
            order_id=new_order.id,
            total_amount=new_order.total_amount,
            shipping_address=new_order.shipping_address
        )
        
        return schemas.OrderResponse(
            order_id=new_order.id,
            total_amount=new_order.total_amount,
            status=new_order.status,
            message="Đặt hàng thành công! Đơn hàng đã được lưu."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/payment/webhook")
async def payment_webhook(request: Request, data: schemas.SePayWebhookData, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Apikey "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    api_key_from_header = auth_header.split(" ")[1]
    
    # Verify API Key from environment variables
    valid_api_key = os.getenv("SEPAY_API_KEY")
    if not valid_api_key or api_key_from_header != valid_api_key:
        raise HTTPException(status_code=403, detail="Forbidden API Key")

    # Transaction is money IN
    if data.transferType == "in":
        # Extract order ID from content which should be matching "VLK[ID]"
        content = data.content.upper()
        if "VLK" in content:
            # simple parse, ideally regex
            try:
                # Find VLK position
                idx = content.find("VLK")
                order_id_str = ""
                # Iterate from VLK+3 until a non-digit is hit or end of string
                for char in content[idx+3:]:
                    if char.isdigit():
                        order_id_str += char
                    else:
                        break
                
                order_id = int(order_id_str)
                order = db.query(models.Order).filter(models.Order.id == order_id).first()
                if order:
                    # Check if enough money transferred
                    if data.transferAmount >= order.total_amount:
                        order.payment_status = "PAID"
                        order.status = "PAID"
                        db.commit()
                        return {"success": True, "message": "Webhook processed successfully", "order_id": order.id}
                    elif data.transferAmount >= order.total_amount * 0.3:
                        order.payment_status = "DEPOSITED"
                        order.status = "PROCESSING"
                        db.commit()
                        return {"success": True, "message": "Webhook processed successfully (DEPOSITED)", "order_id": order.id}
                    else:
                        return {"success": False, "message": "Amount transferred is less than required deposit (30%)"}
                else:
                    return {"success": False, "message": "Order not found parsed"}
            except Exception as e:
                return {"success": False, "message": "Parse error", "err": str(e)}

    return {"success": True, "message": "Ignored"}

@app.get("/api/v1/orders/{order_id}/status")
def get_order_status(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": order.status, "payment_status": order.payment_status}

# ======= 🤖 SUPPLEMENTARY AI & LAPTOP ENDPOINTS =======

@app.get("/api/v1/laptops", response_model=list[schemas.LaptopModel])
def search_laptops(search: str = "", db: Session = Depends(get_db)):
    return crud.get_laptops(db, search)

@app.get("/api/v1/laptops/{laptop_id}/compatibles")
def read_laptop_compatibles(laptop_id: int, db: Session = Depends(get_db)):
    db_laptop = db.query(models.LaptopModel).filter(models.LaptopModel.id == laptop_id).first()
    if not db_laptop:
        raise HTTPException(status_code=404, detail="Laptop not found")
    return crud.get_laptop_compatibles(db, laptop_id)

@app.post("/api/v1/ai/diagnose", response_model=schemas.DiagnoseResponse)
def diagnose_laptop(request: schemas.DiagnoseRequest, db: Session = Depends(get_db)):
    db_laptop = db.query(models.LaptopModel).filter(models.LaptopModel.id == request.laptop_id).first()
    if not db_laptop:
        raise HTTPException(status_code=404, detail="Laptop not found")
        
    import app.services.ai_service as ai_service
    try:
        ai_result = ai_service.diagnose_laptop_issue(db_laptop.name, request.issue_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Lỗi kết nối hoặc xử lý từ bộ máy AI Gemini.")
        
    all_compatibles = crud.get_laptop_compatibles(db, request.laptop_id)
    recommended_names_lower = [name.lower() for name in ai_result.get("recommended_category_names", [])]
    filtered_compatibles = [c for c in all_compatibles if c["category_name"].lower() in recommended_names_lower]
    return schemas.DiagnoseResponse(
        diagnosis=ai_result.get("diagnosis", "Vua Linh Kiện AI đã hoàn tất."),
        recommended_categories=filtered_compatibles
    )
# ======= 🛒 PC BUILDER ENDPOINTS =======

@app.post("/api/v1/pc-builder/validate", response_model=schemas.PCBuildResponse)
def validate_pc_build(request: schemas.PCBuildRequest):
    import app.services.ai_service as ai_service
    
    total = sum([item.price for item in request.items])
    items_dump = [{"category": i.category_name, "product": i.product_name, "specs": i.specs} for i in request.items]
    
    try:
        ai_res = ai_service.evaluate_pc_build(items_dump)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Lỗi AI Server Component Validator")
        
    return schemas.PCBuildResponse(
        total_price=total,
        is_compatible=ai_res.get("is_compatible", False),
        evaluation=ai_res.get("evaluation", "Máy chủ AI gặp sự cố.")
    )

@app.post("/api/v1/ai/recommend-build", response_model=schemas.BuildRecommendResponse)
def recommend_build(request: schemas.BuildRecommendRequest, db: Session = Depends(get_db)):
    """Nhận yêu cầu build PC từ chat, gọi AI phân tích, rồi truy DB lấy sản phẩm thực tế."""
    import app.services.ai_service as ai_service

    try:
        ai_result = ai_service.recommend_pc_build(request.requirement)
    except Exception as e:
        err_str = str(e).lower()
        is_quota = (
            '429' in str(e) or
            'quota_exhausted' in err_str or
            'quota' in err_str or
            'resource_exhausted' in err_str or
            'unavailable' in err_str
        )
        if is_quota:
            raise HTTPException(
                status_code=429,
                detail="⏳ AI đang bận (tất cả model đã vượt quota). Vui lòng thử lại sau 1 phút!"
            )
        raise HTTPException(status_code=500, detail=f"AI Service lỗi: {str(e)[:100]}")

    result_products = []
    components = ai_result.get("components", [])

    for comp in components:
        cat_name = comp.get("category", "")
        price_max = comp.get("price_max", 99_999_999)

        cat = db.query(models.Category).filter(models.Category.name == cat_name).first()
        if not cat:
            continue

        # Lấy sản phẩm có giá tốt nhất (cao nhất trong ngưỡng) còn hàng
        product = (
            db.query(models.Product)
            .filter(
                models.Product.category_id == cat.id,
                models.Product.price <= price_max,
                models.Product.stock > 0
            )
            .order_by(models.Product.price.desc())
            .first()
        )

        # Fallback: lấy rẻ nhất trong danh mục nếu không tìm thấy trong ngưỡng
        if not product:
            product = (
                db.query(models.Product)
                .filter(models.Product.category_id == cat.id, models.Product.stock > 0)
                .order_by(models.Product.price.asc())
                .first()
            )

        if product:
            result_products.append({
                "category": cat_name,
                "product": product
            })

    total = sum(item["product"].price for item in result_products)

    return schemas.BuildRecommendResponse(
        message=ai_result.get("message", "Đây là cấu hình gợi ý từ Vua Linh Kiện!"),
        use_case=ai_result.get("use_case", "general"),
        products=result_products,
        total=total
    )
