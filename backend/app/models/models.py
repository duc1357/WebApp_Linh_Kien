from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, index=True)
    full_name = Column(String(100))
    password_hash = Column(String(200))
    phone_number = Column(String(20), nullable=True)
    role = Column(String(50), default="customer")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    orders = relationship("Order", back_populates="user")

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(255), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    description = Column(Text, nullable=True)

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    price = Column(Float, default=0.0)
    stock = Column(Integer, default=0)
    image = Column(String(255), nullable=True) # URL ảnh sản phẩm
    specs = Column(Text, nullable=True) # Thông số kỹ thuật chi tiết
    is_active = Column(Boolean, default=True)
    
    category = relationship("Category", back_populates="products")
    compatibilities = relationship("Product_Compatibility", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("ProductReview", back_populates="product")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Float, default=0.0)
    status = Column(String(50), default="PENDING") # PENDING, SHIPPED, DELIVERED, CANCELLED
    payment_method = Column(String(50), default="COD") # COD, VNPAY, SEPAY
    payment_status = Column(String(50), default="UNPAID") # UNPAID, PAID, FAILED
    shipping_address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    price_at_purchase = Column(Float) # Lưu lại giá của sản phẩm tại thời điểm mua
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class LaptopModel(Base):
    __tablename__ = "laptop_models"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True)
    brand = Column(String(100), index=True) # Đưa thẳng Brand vào đây cho gọn theo yêu cầu
    
    compatibilities = relationship("Product_Compatibility", back_populates="laptop")

class Product_Compatibility(Base):
    __tablename__ = "product_compatibility"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    model_id = Column(Integer, ForeignKey("laptop_models.id"))
    
    product = relationship("Product", back_populates="compatibilities")
    laptop = relationship("LaptopModel", back_populates="compatibilities")

class ProductReview(Base):
    __tablename__ = "product_reviews"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, default=5)
    comment = Column(Text, nullable=True)
    image = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="reviews")
    user = relationship("User")
