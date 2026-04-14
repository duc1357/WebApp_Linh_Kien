import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from dotenv import load_dotenv
from typing import Generator

load_dotenv()

# Database connection string from environment, fallback to a local mysql setup
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost/web_linh_kien")

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
