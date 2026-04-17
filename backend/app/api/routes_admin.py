from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List
from datetime import datetime, timedelta
from fastapi import File, UploadFile
import os
import shutil
import uuid

import app.core.database as database
import app.models.models as models
import app.schemas.schemas as schemas
import app.core.auth as auth

router = APIRouter()

# Dependency: Chỉ cho phép admin
admin_deps = Depends(auth.get_current_admin)

@router.get("/stats", response_model=schemas.AdminStatsResponse)
def get_dashboard_stats(db: Session = Depends(database.get_db), current_admin: models.User = admin_deps):
    total_users = db.query(models.User).filter(models.User.role == "customer").count()
    total_orders = db.query(models.Order).count()
    
    # Calculate total revenue from PAID and DELIVERED orders
    revenue = db.query(func.sum(models.Order.total_amount)).filter(
        models.Order.status.in_(["PAID", "DELIVERED", "SHIPPED"])
    ).scalar() or 0.0

    low_stock = db.query(models.Product).filter(models.Product.stock < 10).count()

    # Generate last 14 days chart data
    chart_data = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=13)
    
    orders_14d = db.query(models.Order).filter(
        models.Order.created_at >= start_date,
        models.Order.status.in_(["PAID", "DELIVERED", "SHIPPED"])
    ).all()
    
    revenue_by_date = {}
    for d in range(14):
        date_str = (start_date + timedelta(days=d)).strftime("%d/%m")
        revenue_by_date[date_str] = 0.0
        
    for o in orders_14d:
        if o.created_at:
            o_date = o.created_at.strftime("%d/%m")
            if o_date in revenue_by_date:
                revenue_by_date[o_date] += o.total_amount
                
    for k, v in revenue_by_date.items():
        chart_data.append(schemas.DailyRevenue(date=k, revenue=v))

    return schemas.AdminStatsResponse(
        total_users=total_users,
        total_orders=total_orders,
        total_revenue=revenue,
        low_stock_products=low_stock,
        revenue_chart=chart_data
    )

@router.post("/upload-image")
def upload_image(file: UploadFile = File(...), current_admin: models.User = admin_deps):
    upload_dir = "static/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    new_filename = f"{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(upload_dir, new_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"/static/uploads/{new_filename}"}

@router.get("/users")
def get_all_users(
    page: int = 1,
    limit: int = 10,
    search: str = "",
    db: Session = Depends(database.get_db), 
    current_admin: models.User = admin_deps
):
    query = db.query(models.User)
    if search:
        query = query.filter(
            or_(models.User.email.ilike(f"%{search}%"), models.User.full_name.ilike(f"%{search}%"))
        )
        
    total = query.count()
    users = query.order_by(models.User.id.desc()).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "items": [schemas.UserResponse.model_validate(u) for u in users],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.put("/users/{user_id}/toggle-status", response_model=schemas.UserResponse)
def toggle_user_status(user_id: int, db: Session = Depends(database.get_db), current_admin: models.User = admin_deps):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy User")
    
    # Không tự khóa chính mình
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Không thể tự khóa tài khoản Admin của bạn")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user

@router.post("/users", response_model=schemas.UserResponse)
def create_user(
    user_data: schemas.AdminUserCreate,
    db: Session = Depends(database.get_db),
    current_admin: models.User = admin_deps
):
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email đã tồn tại trong hệ thống")
        
    hashed_pwd = auth.get_password_hash(user_data.password)
    new_user = models.User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_pwd,
        role=user_data.role,
        is_active=user_data.is_active,
        phone_number=user_data.phone_number
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_data: schemas.AdminUserUpdate,
    db: Session = Depends(database.get_db),
    current_admin: models.User = admin_deps
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
    if user_data.email and user_data.email != user.email:
        existing = db.query(models.User).filter(models.User.email == user_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email mới đã được sử dụng")
            
    if user_data.password:
        user.hashed_password = auth.get_password_hash(user_data.password)
        
    if user_data.full_name is not None: user.full_name = user_data.full_name
    if user_data.email is not None: user.email = user_data.email
    if user_data.role is not None: user.role = user_data.role
    if user_data.is_active is not None: user.is_active = user_data.is_active
    if user_data.phone_number is not None: user.phone_number = user_data.phone_number
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.User = admin_deps
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Không thể tự xóa chính mình")
        
    has_orders = db.query(models.Order).filter(models.Order.user_id == user_id).first()
    if has_orders:
        raise HTTPException(
            status_code=400, 
            detail="Tài khoản này đã phát sinh giao dịch. Hãy dùng tính năng KHÓA thay vì Xóa vĩnh viễn để bảo toàn lịch sử hóa đơn."
        )
        
    db.delete(user)
    db.commit()
    return {"message": "Đã xóa người dùng thành công"}

@router.get("/orders")
def get_all_orders(
    page: int = 1,
    limit: int = 10,
    search: str = "",
    status: str = "",
    db: Session = Depends(database.get_db), 
    current_admin: models.User = admin_deps
):
    query = db.query(models.Order)
    
    if status:
        query = query.filter(models.Order.status == status)
        
    if search:
        if search.isdigit():
            query = query.filter(models.Order.id == int(search))
        else:
            query = query.join(models.User, models.Order.user_id == models.User.id, isouter=True).filter(
                or_(
                    models.Order.shipping_address.ilike(f"%{search}%"),
                    models.User.email.ilike(f"%{search}%")
                )
            )

    total = query.count()
    orders = query.order_by(models.Order.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    result = []
    for order in orders:
        items_detail = []
        for oi in order.items:
            product = db.query(models.Product).filter(models.Product.id == oi.product_id).first()
            items_detail.append({
                "product_id": oi.product_id,
                "product_name": product.name if product else "Sản phẩm đã xóa",
                "product_image": product.image if product else None,
                "quantity": oi.quantity,
                "price_at_purchase": oi.price_at_purchase
            })
        
        # Thêm thông tin email của user để Admin tiện theo dõi
        user_email = order.user.email if order.user else "Khách vãng lai"
        
        result.append({
            "id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
            "shipping_address": order.shipping_address or user_email,
            "created_at": order.created_at.strftime("%d/%m/%Y %H:%M") if order.created_at else "",
            "items": items_detail
        })
        
    return {
        "items": result,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int, 
    update_data: schemas.OrderStatusUpdate, 
    db: Session = Depends(database.get_db), 
    current_admin: models.User = admin_deps
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
    
    valid_statuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]
    if update_data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Trạng thái không hợp lệ")

    order.status = update_data.status
    db.commit()
    db.refresh(order)
    return {"message": "Cập nhật trạng thái thành công", "new_status": order.status}

@router.put("/products/{product_id}/inventory", response_model=schemas.Product)
def update_product_inventory(
    product_id: int,
    update_data: schemas.ProductUpdateStock,
    db: Session = Depends(database.get_db),
    current_admin: models.User = admin_deps
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
    
    if update_data.stock < 0 or update_data.price < 0:
        raise HTTPException(status_code=400, detail="Giá trị không hợp lệ")

    product.stock = update_data.stock
    product.price = update_data.price
    db.commit()
    db.refresh(product)
    return product

@router.get("/products")
def get_admin_products(
    page: int = 1,
    limit: int = 10,
    search: str = "",
    category_id: int = None,
    db: Session = Depends(database.get_db),
    current_admin: models.User = admin_deps
):
    query = db.query(models.Product)
    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))
        
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    
    total = query.count()
    products = query.order_by(models.Product.id.desc()).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "items": [schemas.Product.model_validate(p) for p in products],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.post("/products", response_model=schemas.Product)
def create_product(
    product_data: schemas.ProductCreate,
    db: Session = Depends(database.get_db),
    current_admin: models.User = admin_deps
):
    # Dùng .model_dump() thay vì .dict() (pydantic v2)
    new_product = models.Product(**product_data.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/products/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    product_data: schemas.ProductUpdate,
    db: Session = Depends(database.get_db),
    current_admin: models.User = admin_deps
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
    
    update_data = product_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
        
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.User = admin_deps
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
    
    # Check if product is in any orders
    has_orders = db.query(models.OrderItem).filter(models.OrderItem.product_id == product_id).first()
    if has_orders:
        raise HTTPException(
            status_code=400, 
            detail="Sản phẩm đã phát sinh giao dịch, vui lòng dùng tính năng 'Ẩn' thay vì Xóa vĩnh viễn để bảo toàn lịch sử hóa đơn."
        )
    db.delete(product)
    db.commit()
    return {"message": "Đã xóa sản phẩm thành công"}

@router.get("/reviews")
def get_admin_reviews(
    page: int = 1,
    limit: int = 20,
    search: str = "",
    db: Session = Depends(database.get_db),
    current_admin: models.User = admin_deps
):
    query = db.query(models.ProductReview).join(models.Product).join(models.User)
    
    if search:
        query = query.filter(
            or_(
                models.Product.name.ilike(f"%{search}%"),
                models.User.email.ilike(f"%{search}%"),
                models.ProductReview.comment.ilike(f"%{search}%")
            )
        )
        
    total = query.count()
    reviews = query.order_by(models.ProductReview.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    result = []
    for r in reviews:
        result.append({
            "id": r.id,
            "product_name": r.product.name if r.product else "SP đã xóa",
            "user_email": r.user.email if r.user else "User đã xóa",
            "rating": r.rating,
            "comment": r.comment,
            "image": r.image,
            "created_at": r.created_at.strftime("%d/%m/%Y %H:%M") if r.created_at else ""
        })
        
    return {
        "items": result,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.delete("/reviews/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.User = admin_deps
):
    review = db.query(models.ProductReview).filter(models.ProductReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá")
        
    db.delete(review)
    db.commit()
    return {"message": "Đã xóa đánh giá thành công"}
