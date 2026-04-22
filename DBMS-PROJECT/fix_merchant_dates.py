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

cursor.execute("SELECT merchant_id FROM Merchants WHERE merchant_id > 5")
merchants = cursor.fetchall()

today = datetime.now()

for (m_id,) in merchants:
    days_ago = random.randint(30, 1500)
    random_date = today - timedelta(days=days_ago)
    random_date = random_date.replace(hour=random.randint(0,23), minute=random.randint(0,59), second=random.randint(0,59))
    
    cursor.execute("UPDATE Merchants SET registered_date = %s WHERE merchant_id = %s", (random_date.strftime('%Y-%m-%d %H:%M:%S'), m_id))

conn.commit()
conn.close()
print("Merchants registered_date fully randomized.")
