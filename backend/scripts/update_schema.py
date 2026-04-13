import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import sqlite3

def upgrade():
    conn = sqlite3.connect('vualinhkien.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'COD'")
        cursor.execute("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'UNPAID'")
        conn.commit()
        print("Updated orders table successfully")
    except Exception as e:
        print("Orders table possibly already updated or error:", e)

    try:
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS product_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            rating INTEGER DEFAULT 5,
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(product_id) REFERENCES products(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        ''')
        conn.commit()
        print("Created product_reviews table successfully")
    except Exception as e:
        print("Reviews table error:", e)

    conn.close()

if __name__ == "__main__":
    upgrade()
