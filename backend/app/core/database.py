import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Database connection string from environment, fallback to a local mysql setup
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost/web_linh_kien")

connect_args = {}
if "aivencloud" in DATABASE_URL:
    connect_args = {"ssl": {"ssl_mode": "REQUIRED"}}

engine = create_engine(DATABASE_URL, echo=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
