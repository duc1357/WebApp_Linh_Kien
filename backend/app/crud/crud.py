from sqlalchemy.orm import Session, joinedload
import app.models.models as models
import app.schemas.schemas as schemas

def get_products(db: Session, category_id: int = None, search: str = None):
    query = db.query(models.Product).filter(models.Product.is_active == True)
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))
    return query.all()

def get_categories(db: Session):
    return db.query(models.Category).all()

def get_laptops(db: Session, search: str = ""):
    if search:
        return db.query(models.LaptopModel).filter(models.LaptopModel.name.ilike(f"%{search}%")).all()
    return db.query(models.LaptopModel).all()

def create_order(db: Session, order_data: schemas.OrderCreate):
    # 1. Kiểm tra tồn kho của TẤT CẢ sản phẩm trước khi tạo đơn hàng (Atomic Check)
    products_to_update = []
    total = 0.0
    for item in order_data.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).with_for_update().first()
        if not product or product.stock < item.quantity:
            raise Exception(f"Sản phẩm {product.name if product else item.product_id} đã hết hàng hoặc không đủ số lượng tồn kho!")
        products_to_update.append((product, item.quantity))
        total += product.price * item.quantity

    # 2. Tìm hoặc tạo nhanh user tạm thời (Guest Checkout)
    user = db.query(models.User).filter(models.User.email == order_data.user_email).first()
    if not user:
        user = models.User(
            email=order_data.user_email,
            full_name=order_data.shipping_name or "Guest User",
            password_hash="",
            role="customer",
            is_active=True
        )
        db.add(user)
        db.flush()

    # 3. Tạo Hóa Đơn (Order Parent) với đầy đủ thông tin người nhận
    new_order = models.Order(
        user_id=user.id,
        receiver_name=order_data.shipping_name or user.full_name or "Khách hàng",
        receiver_phone=order_data.shipping_phone or user.phone_number or "",
        note=order_data.note,
        shipping_address=order_data.shipping_address,
        status="PENDING",
        payment_method=order_data.payment_method,
        payment_status="UNPAID",
        total_amount=total
    )
    db.add(new_order)
    db.flush()

    # 4. Trừ tồn kho và thêm OrderItems
    for product, qty in products_to_update:
        product.stock -= qty
        order_item = models.OrderItem(
            order_id=new_order.id,
            product_id=product.id,
            quantity=qty,
            price_at_purchase=product.price
        )
        db.add(order_item)
    
    # 5. Commit duy nhất toàn bộ giao dịch
    db.commit()
    db.refresh(new_order)
    
    return new_order

def get_user_orders(db: Session, user_id: int):
    """Lấy danh sách đơn hàng của user, kèm chi tiết sản phẩm và thông tin nhận hàng."""
    orders = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.product))
        .filter(models.Order.user_id == user_id)
        .order_by(models.Order.created_at.desc())
        .all()
    )
    result = []
    for order in orders:
        items_detail = []
        for oi in order.items:
            product = oi.product
            items_detail.append({
                "product_id": oi.product_id,
                "product_name": product.name if product else "Sản phẩm đã xóa",
                "product_image": product.image if product else None,
                "quantity": oi.quantity,
                "price_at_purchase": oi.price_at_purchase
            })
        result.append({
            "id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "shipping_address": order.shipping_address,
            "receiver_name": order.receiver_name,
            "receiver_phone": order.receiver_phone,
            "note": order.note,
            "created_at": order.created_at.strftime("%d/%m/%Y %H:%M") if order.created_at else "",
            "items": items_detail
        })
    return result

# Logic phụ trợ dành cho AI Plug-in (Giữ nguyên)
def get_laptop_compatibles(db: Session, laptop_id: int):
    compatibles = db.query(models.Product_Compatibility).filter(models.Product_Compatibility.model_id == laptop_id).all()
    
    product_ids = [c.product_id for c in compatibles]
    if not product_ids:
        return []
        
    products = db.query(models.Product).filter(models.Product.id.in_(product_ids)).all()
    categories = db.query(models.Category).all()
    
    result = []
    for cat in categories:
        cat_products = [p for p in products if p.category_id == cat.id]
        if cat_products:
            result.append({
                "category_id": cat.id,
                "category_name": cat.name,
                "products": [{"product": p, "notes": ""} for p in cat_products]
            })
    return result

# --- REVIEWS ---
def verify_user_purchased_item(db: Session, user_id: int, product_id: int) -> bool:
    # Check if any order item matches product_id and belongs to an order owned by user_id
    order_item = db.query(models.OrderItem).join(models.Order).filter(
        models.Order.user_id == user_id,
        models.OrderItem.product_id == product_id
    ).first()
    return order_item is not None

def create_review(db: Session, review_data: schemas.ReviewCreate, user_id: int):
    new_review = models.ProductReview(
        product_id=review_data.product_id,
        user_id=user_id,
        rating=review_data.rating,
        comment=review_data.comment,
        image=review_data.image
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review

def get_product_reviews(db: Session, product_id: int):
    reviews = (
        db.query(models.ProductReview)
        .options(joinedload(models.ProductReview.user))
        .filter(models.ProductReview.product_id == product_id)
        .order_by(models.ProductReview.created_at.desc())
        .all()
    )
    result = []
    for r in reviews:
        user = r.user
        result.append({
            "id": r.id,
            "product_id": r.product_id,
            "user_id": r.user_id,
            "user_name": user.full_name if user else "Khách",
            "rating": r.rating,
            "comment": r.comment,
            "image": r.image,
            "created_at": r.created_at.strftime("%d/%m/%Y %H:%M") if r.created_at else ""
        })
    return result
