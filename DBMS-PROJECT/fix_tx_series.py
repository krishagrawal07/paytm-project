import mysql.connector
import random
from datetime import datetime, timedelta

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="paytm_db"
)
cursor = conn.cursor()

print("Wiping bad transaction sequences...")
try:
    cursor.execute("DELETE FROM Payments WHERE transaction_id > 19")
except Exception:
    pass # In case Payments is not mapped
cursor.execute("DELETE FROM Transactions WHERE transaction_id > 19")

print("Resetting AUTO_INCREMENT to 20...")
cursor.execute("ALTER TABLE Transactions AUTO_INCREMENT = 20")

print("Re-generating 3000 perfectly sequenced transactions...")
cursor.execute("SELECT user_id FROM Users")
valid_users = [row[0] for row in cursor.fetchall()]

cursor.execute("SELECT merchant_id FROM Merchants")
valid_merchants = [row[0] for row in cursor.fetchall()]

today = datetime.now()
statuses = ["Completed", "Completed", "Completed", "Pending", "Failed"]

for i in range(3000):
    u_id = random.choice(valid_users)
    m_id = random.choice(valid_merchants)
    amount = round(random.uniform(50.0, 5000.0), 2)
    status = random.choice(statuses)
    days_ago = random.randint(0, 30)
    t_date = today - timedelta(days=days_ago)
    
    cursor.execute("""
        INSERT INTO Transactions (user_id, merchant_id, amount, status, transaction_date) 
        VALUES (%s, %s, %s, %s, %s)
    """, (u_id, m_id, amount, status, t_date.strftime('%Y-%m-%d %H:%M:%S')))

conn.commit()
conn.close()
print("Transactions fixed. Refresh Dashboard!")
