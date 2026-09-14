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

from sqlalchemy import inspect, text

# Auto-migrate tables (tạo bảng mới nếu chưa có)
models.Base.metadata.create_all(bind=engine)

def ensure_db_schema():
    """Tự động kiểm tra và bổ sung các cột còn thiếu trong bảng đã tồn tại (dành cho Aiven/Production)."""
    try:
        inspector = inspect(engine)
        if "orders" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("orders")]
            with engine.connect() as conn:
                if "receiver_name" not in columns:
                    conn.execute(text("ALTER TABLE orders ADD COLUMN receiver_name VARCHAR(100) NULL"))
                if "receiver_phone" not in columns:
                    conn.execute(text("ALTER TABLE orders ADD COLUMN receiver_phone VARCHAR(20) NULL"))
                if "note" not in columns:
                    conn.execute(text("ALTER TABLE orders ADD COLUMN note TEXT NULL"))
                conn.commit()
    except Exception as e:
        import logging
        logging.warning(f"Schema migration warning: {e}")

ensure_db_schema()

app = FastAPI(title="Website Linh Kiện E-commerce")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log traceback chi tiết ra server để điều tra lỗi
    import logging
    logging.error(f"SERVER ERROR: {str(exc)}")
    traceback.print_exc()
    
    is_debug = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    if is_debug:
        return JSONResponse(
            status_code=500,
            content={"detail": f"SERVER ERROR: {str(exc)}"}
        )
        
    return JSONResponse(
        status_code=500,
        content={"detail": "Đã xảy ra sự cố hệ thống. Vui lòng thử lại sau hoặc liên hệ hỗ trợ!"}
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
        
    new_r = crud.create_review(db, review, current_user.id)
    return {
        "id": new_r.id,
        "product_id": new_r.product_id,
        "user_id": new_r.user_id,
        "user_name": current_user.full_name or "Khách",
        "rating": new_r.rating,
        "comment": new_r.comment,
        "image": new_r.image,
        "created_at": new_r.created_at.strftime("%d/%m/%Y %H:%M") if new_r.created_at else ""
    }

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


@app.get("/api/v1/payment/config")
def get_payment_config():
    return {
        "bank_bin": os.getenv("BANK_BIN", "MBBank"),
        "bank_account": os.getenv("BANK_ACCOUNT", "0799412960"),
        "bank_account_name": os.getenv("BANK_ACCOUNT_NAME", "Vua Linh Kiện")
    }


@app.post("/api/v1/payment/webhook")
@app.post("/api/webhook/sepay-webhook")
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
    laptop_name = request.laptop_name or "Laptop Cá Nhân"
    all_compatibles = []
    
    if request.laptop_id:
        db_laptop = db.query(models.LaptopModel).filter(models.LaptopModel.id == request.laptop_id).first()
        if db_laptop:
            laptop_name = db_laptop.name
            all_compatibles = crud.get_laptop_compatibles(db, request.laptop_id)

    import app.services.ai_service as ai_service
    try:
        ai_result = ai_service.diagnose_laptop_issue(laptop_name, request.issue_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Lỗi kết nối hoặc xử lý từ bộ máy AI Gemini.")
        
    recommended_names_lower = [name.lower() for name in ai_result.get("recommended_category_names", [])]
    
    if all_compatibles:
        filtered_compatibles = [c for c in all_compatibles if any(rec_name in c["category_name"].lower() for rec_name in recommended_names_lower)]
    else:
        # Lấy danh mục gợi ý linh kiện thực sự cần thiết từ kho sản phẩm Vua Linh Kiện (Ổ cứng, RAM)
        filtered_compatibles = []
        if recommended_names_lower:
            categories = db.query(models.Category).all()
            for cat in categories:
                if any(rec_name in cat.name.lower() for rec_name in recommended_names_lower):
                    # Nếu là danh mục Ổ Cứng, ưu tiên chọn đúng sản phẩm SSD cho Laptop
                    if "ổ cứng" in cat.name.lower() or "ssd" in cat.name.lower():
                        sample_product = db.query(models.Product).filter(
                            models.Product.category_id == cat.id, 
                            models.Product.is_active == True,
                            models.Product.name.ilike("%SSD%")
                        ).first()
                        if not sample_product:
                            sample_product = db.query(models.Product).filter(models.Product.category_id == cat.id, models.Product.is_active == True).first()
                    else:
                        sample_product = db.query(models.Product).filter(models.Product.category_id == cat.id, models.Product.is_active == True).first()

                    if sample_product:
                        filtered_compatibles.append({
                            "category_id": cat.id,
                            "category_name": cat.name,
                            "sample_product": sample_product.name
                        })

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
        evaluation=ai_res.get("evaluation", "Máy chủ AI đã hoàn tất phân tích."),
        summary=ai_res.get("summary"),
        suitability=ai_res.get("suitability"),
        details=ai_res.get("details")
    )

@app.post("/api/v1/ai/recommend-build", response_model=schemas.BuildRecommendResponse)
def recommend_build(request: schemas.BuildRecommendRequest, db: Session = Depends(get_db)):
    """Nhận yêu cầu build PC từ chat, gọi AI phân tích, rồi truy DB lấy sản phẩm thực tế theo độ tương thích phần cứng chuẩn xác."""
    import re
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

    components_budget = {comp.get("category"): comp.get("price_max", 99_999_999) for comp in ai_result.get("components", [])}
    categories = {c.name: c.id for c in db.query(models.Category).all()}

    def _extract_socket(specs: str):
        if not specs: return None
        for s in ['AM5', 'AM4', 'LGA1700', 'LGA1200', 'LGA1151']:
            if s in specs.upper(): return s
        return None

    def _extract_ddr(specs: str):
        if not specs: return None
        if 'DDR5' in specs.upper(): return 'DDR5'
        if 'DDR4' in specs.upper(): return 'DDR4'
        return None

    def _extract_wattage(specs: str):
        if not specs: return 0
        match = re.search(r'(\d+)\s*W', specs, re.IGNORECASE)
        return int(match.group(1)) if match else 0

    selected_map = {}

    # 1. Chọn CPU (Ưu tiên theo ngân sách)
    cpu_max = components_budget.get("CPU", 99_999_999)
    cpu_cat_id = categories.get("CPU")
    cpu = (
        db.query(models.Product)
        .filter(models.Product.category_id == cpu_cat_id, models.Product.price <= cpu_max, models.Product.stock > 0)
        .order_by(models.Product.price.desc())
        .first()
    )
    if not cpu:
        cpu = db.query(models.Product).filter(models.Product.category_id == cpu_cat_id, models.Product.stock > 0).order_by(models.Product.price.asc()).first()
    selected_map["CPU"] = cpu

    cpu_socket = _extract_socket(cpu.specs if cpu else "")

    # 2. Chọn Mainboard (BẮT BUỘC khớp đúng Socket với CPU)
    mb_max = components_budget.get("Mainboard", 99_999_999)
    mb_cat_id = categories.get("Mainboard")
    mb_q = db.query(models.Product).filter(models.Product.category_id == mb_cat_id, models.Product.stock > 0)
    if cpu_socket:
        mb_q = mb_q.filter(models.Product.specs.like(f"%{cpu_socket}%"))
    mb = mb_q.filter(models.Product.price <= mb_max).order_by(models.Product.price.desc()).first()
    if not mb:
        mb = mb_q.order_by(models.Product.price.asc()).first()
    if not mb:
        mb = db.query(models.Product).filter(models.Product.category_id == mb_cat_id, models.Product.stock > 0).first()
    selected_map["Mainboard"] = mb

    mb_ddr = _extract_ddr(mb.specs if mb else "")

    # 3. Chọn RAM (BẮT BUỘC khớp chuẩn DDR4 / DDR5 với Mainboard)
    ram_max = components_budget.get("RAM", 99_999_999)
    ram_cat_id = categories.get("RAM")
    ram_q = db.query(models.Product).filter(models.Product.category_id == ram_cat_id, models.Product.stock > 0)
    if mb_ddr:
        ram_q = ram_q.filter(models.Product.specs.like(f"%{mb_ddr}%"))
    ram = ram_q.filter(models.Product.price <= ram_max).order_by(models.Product.price.desc()).first()
    if not ram:
        ram = ram_q.order_by(models.Product.price.asc()).first()
    if not ram:
        ram = db.query(models.Product).filter(models.Product.category_id == ram_cat_id, models.Product.stock > 0).first()
    selected_map["RAM"] = ram

    # 4. Chọn Card Đồ Họa (VGA)
    vga_max = components_budget.get("VGA", 99_999_999)
    vga_cat_id = categories.get("VGA")
    vga = (
        db.query(models.Product)
        .filter(models.Product.category_id == vga_cat_id, models.Product.price <= vga_max, models.Product.stock > 0)
        .order_by(models.Product.price.desc())
        .first()
    )
    if not vga:
        vga = db.query(models.Product).filter(models.Product.category_id == vga_cat_id, models.Product.stock > 0).order_by(models.Product.price.asc()).first()
    selected_map["VGA"] = vga

    # 5. Chọn Nguồn (PSU) - Đảm bảo đủ công suất tổng TDP CPU + VGA + 150W
    cpu_tdp = _extract_wattage(cpu.specs if cpu else "") or 65
    vga_tdp = _extract_wattage(vga.specs if vga else "") or 150
    min_psu_watt = cpu_tdp + vga_tdp + 150

    psu_max = components_budget.get("Nguồn (PSU)", 99_999_999)
    psu_cat_id = categories.get("Nguồn (PSU)")
    psu_prods = db.query(models.Product).filter(models.Product.category_id == psu_cat_id, models.Product.stock > 0).all()
    valid_psus = [p for p in psu_prods if _extract_wattage(p.specs or p.name) >= min_psu_watt]
    if not valid_psus:
        valid_psus = psu_prods
    
    valid_psus_in_budget = [p for p in valid_psus if p.price <= psu_max]
    if valid_psus_in_budget:
        psu = max(valid_psus_in_budget, key=lambda p: p.price)
    elif valid_psus:
        psu = min(valid_psus, key=lambda p: p.price)
    else:
        psu = None
    selected_map["Nguồn (PSU)"] = psu

    # 6. Các linh kiện còn lại: Ổ Cứng, Vỏ Case, Tản Nhiệt
    for cat_name in ["Ổ Cứng", "Vỏ Case", "Tản Nhiệt"]:
        c_max = components_budget.get(cat_name, 99_999_999)
        c_id = categories.get(cat_name)
        prod = (
            db.query(models.Product)
            .filter(models.Product.category_id == c_id, models.Product.price <= c_max, models.Product.stock > 0)
            .order_by(models.Product.price.desc())
            .first()
        )
        if not prod:
            prod = db.query(models.Product).filter(models.Product.category_id == c_id, models.Product.stock > 0).order_by(models.Product.price.asc()).first()
        selected_map[cat_name] = prod

    # Build final list preserving standard category order
    ORDERED_CATEGORIES = ["CPU", "Mainboard", "RAM", "VGA", "Nguồn (PSU)", "Ổ Cứng", "Vỏ Case", "Tản Nhiệt"]
    result_products = []
    for cat_name in ORDERED_CATEGORIES:
        product = selected_map.get(cat_name)
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

