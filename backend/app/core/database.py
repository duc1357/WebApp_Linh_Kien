import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from dotenv import load_dotenv
from typing import Generator

load_dotenv()

# Database connection string from environment, fallback to a local mysql setup
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost/web_linh_kien")

# Tự động gỡ lỗi chuỗi kết nối Aiven & Render
if DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

if "?ssl-mode=" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?")[0]  # Loại bỏ param gây crash PyMySQL

is_debug = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")

engine = create_engine(
    DATABASE_URL,
    echo=is_debug,
    pool_pre_ping=True,      # Tự động kiểm tra và kết nối lại nếu kết nối MySQL bị rớt (drop idle)
    pool_recycle=3600,       # Tự động làm mới kết nối sau 1 giờ
    pool_size=10,
    max_overflow=20
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

