import secrets
import random
import datetime as dt
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError
from sqlalchemy.orm import Session
from typing import Optional
import app.core.database as database
import app.models.models as models
import app.schemas.schemas as schemas
import app.core.auth as auth
import app.services.email_service as email_service

router = APIRouter()

# ─── REGISTER ───────────────────────────────────────────────────────────────

@router.post("/register", response_model=schemas.UserResponse)
def register(user_in: schemas.UserCreate, db: Session = Depends(database.get_db)):
    if db.query(models.User).filter(models.User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email này đã được đăng ký. Vui lòng dùng email khác!")

    new_user = models.User(
        email=user_in.email,
        full_name=user_in.full_name,
        password_hash=auth.get_password_hash(user_in.password),
        role="customer",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ─── LOGIN ───────────────────────────────────────────────────────────────────

@router.post("/login", response_model=schemas.Token)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng. Vui lòng thử lại!",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    refresh_token = auth.create_refresh_token(data={"sub": user.email})

    # Gửi refresh_token qua HttpOnly Cookie (chống XSS)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=7 * 24 * 3600,
        samesite="lax",
        secure=False  # Đổi thành True khi deploy HTTPS
    )

    return schemas.Token(
        access_token=access_token,
        token_type="bearer",
        user=schemas.UserResponse.model_validate(user)
    )

# ─── REFRESH TOKEN ────────────────────────────────────────────────────────────

@router.post("/refresh", response_model=schemas.Token)
def refresh_token(
    response: Response,
    refresh_token: Optional[str] = Cookie(default=None),
    db: Session = Depends(database.get_db)
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Không tìm thấy refresh token. Vui lòng đăng nhập lại!")

    try:
        payload = auth.decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise JWTError("Not a refresh token")
        email: str = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Refresh token không hợp lệ hoặc đã hết hạn!")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Tài khoản không tồn tại hoặc đã bị khóa!")

    new_access = auth.create_access_token(data={"sub": user.email, "role": user.role})
    return schemas.Token(access_token=new_access, token_type="bearer")

# ─── LOGOUT ──────────────────────────────────────────────────────────────────

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="refresh_token", samesite="lax")
    return {"message": "Đăng xuất thành công!"}

# ─── GET ME ──────────────────────────────────────────────────────────────────

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# ─── FORGOT PASSWORD ─────────────────────────────────────────────────────────

@router.post("/forgot-password")
def forgot_password(
    request: schemas.ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    # Luôn trả success để không lộ email có tồn tại không (security best practice)
    if not user:
        return {"message": "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được mã OTP đặt lại mật khẩu!"}

    # Tạo OTP ngẫu nhiên 6 số, hết hạn sau 15 phút
    otp_code = str(random.randint(100000, 999999))
    expires_at = dt.datetime.utcnow() + dt.timedelta(minutes=15)

    # Xóa token cũ chưa dùng của user này
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.user_id == user.id,
        models.PasswordResetToken.is_used == False
    ).delete()

    reset_token = models.PasswordResetToken(
        token=otp_code,
        user_id=user.id,
        expires_at=expires_at
    )
    db.add(reset_token)
    db.commit()

    # Bắn sự kiện gửi Email xuống background (không làm lag luồng request hiện tại)
    background_tasks.add_task(email_service.send_reset_password_email, user.email, otp_code)

    return {"message": "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được mã OTP đặt lại mật khẩu!"}

# ─── RESET PASSWORD ───────────────────────────────────────────────────────────

@router.post("/reset-password")
def reset_password(
    request: schemas.ResetPasswordRequest,
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Người dùng không tồn tại!")

    reset_record = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.user_id == user.id,
        models.PasswordResetToken.token == request.otp
    ).first()

    if not reset_record:
        raise HTTPException(status_code=400, detail="Mã OTP không hợp lệ. Vui lòng yêu cầu lại!")
    if reset_record.is_used:
        raise HTTPException(status_code=400, detail="Mã OTP này đã được sử dụng rồi. Vui lòng yêu cầu mã mới!")
    if dt.datetime.utcnow() > reset_record.expires_at:
        raise HTTPException(status_code=400, detail="Mã OTP đã hết hạn (15 phút). Vui lòng yêu cầu mã mới!")

    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="Mật khẩu mới phải có ít nhất 6 ký tự!")

    user.password_hash = auth.get_password_hash(request.new_password)

    reset_record.is_used = True
    db.commit()

    return {"message": "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại."}
