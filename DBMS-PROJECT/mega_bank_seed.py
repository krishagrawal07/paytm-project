import mysql.connector
import random

def mega_bank_seed():
    try:
        conn = mysql.connector.connect(host='localhost', user='root', password='', database='paytm_db')
        cursor = conn.cursor()
        
        # 1. Ensure Table exists
        print("Ensuring UserBanks table exists...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS UserBanks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                bank_name VARCHAR(100),
                account_number VARCHAR(20),
                balance DECIMAL(15,2) DEFAULT 10000.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(user_id)
            )
        """)
        
        # 2. Get all Users
        cursor.execute("SELECT user_id FROM Users")
        users = cursor.fetchall()
        print(f"Found {len(users)} users. Seeding banks...")
        
        banks = ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Bank", "PNB", "Canara Bank"]
        
        # 3. Seed for EVERY user
        for (u_id,) in users:
            # Check if already has banks
            cursor.execute("SELECT COUNT(*) FROM UserBanks WHERE user_id = %s", (u_id,))
            if cursor.fetchone()[0] == 0:
                num = random.randint(1, 2)
                for _ in range(num):
                    b_name = random.choice(banks)
                    acc = "".join([str(random.randint(0,9)) for _ in range(12)])
                    bal = round(random.uniform(5000, 95000), 2)
                    cursor.execute("INSERT INTO UserBanks (user_id, bank_name, account_number, balance) VALUES (%s, %s, %s, %s)", 
                                   (u_id, b_name, acc, bal))
        
        conn.commit()
        conn.close()
        print("Mega Bank Seed Complete! Every user now has at least 1 linked bank.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    mega_bank_seed()
