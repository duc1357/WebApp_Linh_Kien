import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import app.core.database as database
import app.models.models as models
from sqlalchemy import text

def run():
    print("Creating missing tables...")
    models.Base.metadata.create_all(bind=database.engine)
    print("Done. Now trying to alter 'orders' table to add payment fields if they don't exist.")
    with database.engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'COD'"))
            conn.commit()
            print("payment_method added.")
        except Exception as e:
            print(e)
            
        try:
            conn.execute(text("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'UNPAID'"))
            conn.commit()
            print("payment_status added.")
        except Exception as e:
            print(e)
            
        try:
            conn.execute(text("ALTER TABLE product_reviews ADD COLUMN image VARCHAR(255) NULL"))
            conn.commit()
            print("image added to product_reviews.")
        except Exception as e:
            print(e)

if __name__ == "__main__":
    run()
