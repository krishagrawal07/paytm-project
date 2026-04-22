import mysql.connector
import random

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="paytm_db"
)
cursor = conn.cursor()

print("Fetching all transactions...")
cursor.execute("SELECT transaction_id, user_id FROM Transactions")
transactions = cursor.fetchall()

gateways = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Paytm Wallet", "Amazon Pay", "Google Pay"]

print(f"Seeding {len(transactions)} Payments...")

user_gateways = {}

for (t_id, u_id) in transactions:
    if u_id not in user_gateways:
        # Most users use 1 gateway, some use 2
        num_gateways = random.choices([1, 2], weights=[0.8, 0.2])[0]
        user_gateways[u_id] = random.sample(gateways, num_gateways)
        
    gateway = random.choice(user_gateways[u_id])
    # Using INSERT IGNORE to skip the few initial ones that already exist from your first assignments
    cursor.execute("INSERT IGNORE INTO Payments (transaction_id, gateway_name) VALUES (%s, %s)", (t_id, gateway))

conn.commit()
conn.close()
print("Massive Payments seeded successfully!")
