from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
import app.core.database as database
import app.models.models as models
import app.schemas.schemas as schemas
import app.core.auth as auth
import os
import shutil
import uuid

router = APIRouter()

@router.post("/upload-image")
def upload_image_user(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user)):
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
    
    ext = file.filename.split('.')[-1].lower() if '.' in file.filename else 'jpg'
    if ext not in ALLOWED_EXTENSIONS or not (file.content_type or '').startswith('image/'):
        raise HTTPException(
            status_code=400, 
            detail="Định dạng file không hợp lệ! Chỉ cho phép upload ảnh (png, jpg, jpeg, gif, webp)."
        )
        
    upload_dir = "static/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    new_filename = f"{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(upload_dir, new_filename)
    
    # Đọc và kiểm tra kích thước file an toàn
    contents = file.file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Dung lượng file vượt quá giới hạn tối đa cho phép (5MB)!"
        )
        
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
        
    return {"url": f"/static/uploads/{new_filename}"}

@router.get("/profile", response_model=schemas.UserResponse)
def get_profile(current_user: models.User = Depends(auth.get_current_user)):
    """Lấy thông tin hồ sơ người dùng hiện tại."""
    return current_user

@router.put("/profile", response_model=schemas.UserResponse)
def update_profile(
    update: schemas.UserUpdateProfile,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Cập nhật full_name và phone_number."""
    if update.full_name is not None:
        current_user.full_name = update.full_name
    if update.phone_number is not None:
        current_user.phone_number = update.phone_number
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/change-password")
def change_password(
    request: schemas.ChangePasswordRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Đổi mật khẩu sau khi đã đăng nhập."""
    if not auth.verify_password(request.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không đúng!")

    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="Mật khẩu mới phải có ít nhất 8 ký tự!")

    if request.old_password == request.new_password:
        raise HTTPException(status_code=400, detail="Mật khẩu mới phải khác mật khẩu hiện tại!")

    current_user.password_hash = auth.get_password_hash(request.new_password)
    db.commit()
    return {"message": "Đổi mật khẩu thành công!"}

@router.get("/orders", response_model=list[schemas.OrderDetail])
def get_my_orders(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Lấy lịch sử đơn hàng của người dùng hiện tại."""
    import app.crud.crud as crud
    return crud.get_user_orders(db, current_user.id)

@router.put("/orders/{order_id}/cancel")
def cancel_my_order(
    order_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Khách hàng tự hủy đơn hàng của chính mình khi đơn còn ở trạng thái PENDING."""
    from sqlalchemy.orm import joinedload
    order = db.query(models.Order).options(joinedload(models.Order.items)).filter(
        models.Order.id == order_id,
        models.Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng của bạn!")
        
    if order.status != "PENDING":
        raise HTTPException(status_code=400, detail="Chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xác nhận (PENDING)!")
        
    # Hoàn kho sản phẩm (Restock)
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            product.stock += item.quantity
            
    order.status = "CANCELLED"
    db.commit()
    return {"message": "Hủy đơn hàng thành công và đã hoàn trả tồn kho sản phẩm!"}

