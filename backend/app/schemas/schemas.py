from pydantic import BaseModel, EmailStr
from typing import List, Optional

# --- AUTH ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    phone_number: Optional[str] = None

    class Config:
        from_attributes = True

class AdminUserCreate(UserBase):
    password: str
    role: str = "customer"
    is_active: bool = True
    phone_number: Optional[str] = None

class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    phone_number: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional["UserResponse"] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class UserUpdateProfile(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

# --- ECOMMERCE ---
class CategoryBase(BaseModel):
    name: str

class Category(CategoryBase):
    id: int
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    price: float
    stock: int
    image: Optional[str] = None
    specs: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    category_id: int

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    image: Optional[str] = None
    specs: Optional[str] = None
    is_active: Optional[bool] = None

class Product(ProductBase):
    id: int
    category_id: int
    class Config:
        from_attributes = True

# --- REVIEWS ---
class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    comment: Optional[str] = None
    image: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    user_name: str
    rating: int
    comment: Optional[str] = None
    image: Optional[str] = None
    created_at: str
    
    class Config:
        from_attributes = True

class LaptopModel(BaseModel):
    id: int
    name: str
    brand: str
    class Config:
        from_attributes = True

# --- ECOMMERCE CART & ORDER ---
class CheckoutItem(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    user_email: str
    shipping_address: str
    payment_method: str = "COD"
    items: List[CheckoutItem]

class OrderResponse(BaseModel):
    order_id: int
    total_amount: float
    status: str
    message: str

class OrderItemDetail(BaseModel):
    product_id: int
    product_name: str
    product_image: Optional[str] = None
    quantity: int
    price_at_purchase: float

    class Config:
        from_attributes = True

class OrderDetail(BaseModel):
    id: int
    total_amount: float
    status: str
    payment_method: str
    payment_status: str
    shipping_address: Optional[str] = None
    created_at: str
    items: List[OrderItemDetail]

    class Config:
        from_attributes = True

class SePayWebhookData(BaseModel):
    id: int
    gateway: str
    transactionDate: str
    accountNumber: str
    subAccount: Optional[str] = None
    code: Optional[str] = None
    content: str
    transferType: str
    transferAmount: int
    accumulated: int
    referenceCode: str
    description: str

# --- AI AUXILIARY ---
class DiagnoseRequest(BaseModel):
    laptop_id: int
    issue_description: str

class DiagnoseResponse(BaseModel):
    diagnosis: str
    recommended_categories: List[dict]

# --- PC BUILDER ---
class PCBuildItem(BaseModel):
    category_name: str
    product_name: str
    price: float
    specs: str

class PCBuildRequest(BaseModel):
    items: List[PCBuildItem]

class PCBuildResponse(BaseModel):
    total_price: float
    is_compatible: bool
    evaluation: str

# --- AI PC BUILD RECOMMENDATION ---
class BuildRecommendRequest(BaseModel):
    requirement: str

class BuildProductItem(BaseModel):
    id: int
    name: str
    price: float
    specs: Optional[str] = None
    image: Optional[str] = None
    stock: int
    category_id: int

    class Config:
        from_attributes = True

class BuildRecommendCategory(BaseModel):
    category: str
    product: BuildProductItem

class BuildRecommendResponse(BaseModel):
    message: str
    use_case: str
    products: List[BuildRecommendCategory]
    total: float

# --- ADMIN ---
class OrderStatusUpdate(BaseModel):
    status: str

class ProductUpdateStock(BaseModel):
    stock: int
    price: float

class DailyRevenue(BaseModel):
    date: str
    revenue: float

class AdminStatsResponse(BaseModel):
    total_users: int
    total_orders: int
    total_revenue: float
    low_stock_products: int
    revenue_chart: List[DailyRevenue] = []
