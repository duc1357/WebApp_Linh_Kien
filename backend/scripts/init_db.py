import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import app.core.database as database
import app.models.models as models
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

def reset_database():
    with database.engine.connect() as conn:
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        result = conn.execute(text("SHOW TABLES;"))
        for row in result:
            conn.execute(text(f"DROP TABLE `{row[0]}`;"))
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        conn.commit()

def init_db():
    print("Dropping old tables force...")
    reset_database()
    
    print("Creating new e-commerce tables...")
    models.Base.metadata.create_all(bind=database.engine)
    
    db: Session = database.SessionLocal()
    try:
        print("Seeding PC Categories...")
        categories_data = ["CPU", "Mainboard", "RAM", "VGA", "Nguồn (PSU)", "Vỏ Case", "Ổ Cứng", "Tản Nhiệt"]
        category_map = {}
        for c_name in categories_data:
            cat = models.Category(name=c_name)
            db.add(cat)
            db.commit()
            db.refresh(cat)
            category_map[c_name] = cat.id

        print("Seeding PC Products (400 items)...")
        import db_seeder
        products_data = db_seeder.generate_products(category_map)

        for p_data in products_data:
            db.add(models.Product(**p_data))
        
        db.commit()

        # Seed Laptop Models (cho Giai đoạn 4 vẫn hoạt động)
        print("Seeding Laptop Models (For AI Chatbot backward compatibility)...")
        l_xps = models.LaptopModel(name="Dell XPS 9500", brand="Dell")
        l_tuf = models.LaptopModel(name="Asus TUF Dash F15", brand="Asus")
        db.add_all([l_xps, l_tuf])
        db.commit()
        
        # Product Compatibility
        comp1 = models.Product_Compatibility(product_id=7, model_id=l_tuf.id) # RAM cho TUF
        comp2 = models.Product_Compatibility(product_id=13, model_id=l_tuf.id) # SSD cho TUF
        db.add_all([comp1, comp2])
        db.commit()

        print("Seeding base User...")
        u_test = models.User(email="test@example.com", full_name="Test User", password_hash="hash")
        db.add(u_test)
        db.commit()
        
        print("Mock data for PC Builder seeded successfully!")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
