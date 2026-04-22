import mysql.connector
import os

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "paytm_db")

def migrate():
    conn = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    cursor = conn.cursor()

    print("--- STARTING DATABASE MIGRATION ---")

    # 1. Create Complaints Table
    print("Creating Complaints table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Complaints (
            complaint_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            category VARCHAR(100),
            description TEXT,
            status VARCHAR(50) DEFAULT 'Open',
            ticket_id VARCHAR(50) UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
    """)

    # 2. Create UserBanks Table
    print("Creating UserBanks table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS UserBanks (
            bank_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            bank_name VARCHAR(100),
            account_number VARCHAR(20),
            balance DECIMAL(15, 2) DEFAULT 0.00,
            is_primary BOOLEAN DEFAULT FALSE,
            linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
    """)

    conn.commit()
    conn.close()
    print("--- MIGRATION COMPLETE ---")

if __name__ == "__main__":
    migrate()
