import mysql.connector
import random
from datetime import datetime, timedelta

def generate_mock_data():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="paytm_db"
    )
    cursor = conn.cursor()

    print("--- STARTING MEGA DATA SEED ---")
    
    # Get current max user to avoid unique constraints when looping
    cursor.execute("SELECT MAX(user_id) FROM Users")
    max_user = cursor.fetchone()[0] or 0

    # 1. GENERATE USERS
    print("Generating 500 mock Users...")
    first_names = ["Rahul", "Priya", "Amit", "Sneha", "Karan", "Pooja", "Vikram", "Anjali", "Rohan", "Neha", 
                   "Sameer", "Aditi", "Ravi", "Divya", "Suresh", "Kavita", "Deepak", "Aarti", "Manish", "Swati"]
    last_names = ["Sharma", "Verma", "Singh", "Gupta", "Patel", "Kumar", "Reddy", "Rao", "Jain", "Das"]
    streets = ["MG Road", "Link Road", "Station Road", "Main Street", "Ring Road", "Airport Road", "Park Street"]
    cities = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow"]
    states = ["MH", "DL", "KA", "MH", "TS", "TN", "WB", "GJ", "RJ", "UP"]

    unique_counter = max_user + 1
    for i in range(500):
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        email = f"{fn.lower()}{ln.lower()}{unique_counter}@example.com"
        phone = str(9000000000 + unique_counter)
        city_idx = random.randint(0, len(cities)-1)
        addr = f"{random.randint(10, 999)} {random.choice(streets)}, {cities[city_idx]}, {states[city_idx]} {random.randint(400000, 800000)}"
        cursor.execute("INSERT IGNORE INTO Users (first_name, last_name, email, phone, address) VALUES (%s, %s, %s, %s, %s)", (fn, ln, email, phone, addr))
        unique_counter += 1
    
    # 2. GENERATE MERCHANTS (Use Ignore to prevent unique constraint crashes)
    print("Generating 20 mock Merchants...")
    merchants = [
        ("Zomato", "Food & Dining"), ("Swiggy", "Food & Dining"), ("Amazon", "E-commerce"),
        ("Flipkart", "E-commerce"), ("Myntra", "E-commerce"), ("MakeMyTrip", "Travel"),
        ("IRCTC", "Travel"), ("BookMyShow", "Entertainment"), ("Netflix", "Entertainment"),
        ("Spotify", "Entertainment"), ("Uber", "Travel"), ("Ola", "Travel"),
        ("JioRecharge", "Utilities"), ("AirtelBill", "Utilities"), ("TataPower", "Utilities"),
        ("BigBasket", "E-commerce"), ("Blinkit", "E-commerce"), ("Nykaa", "E-commerce"),
        ("PVR", "Entertainment"), ("Domino's", "Food & Dining")
    ]
    today = datetime.now()
    for name, cat in merchants:
        r_days = random.randint(30, 1500)
        r_date = today - timedelta(days=r_days)
        cursor.execute("INSERT IGNORE INTO Merchants (name, category, registered_date) VALUES (%s, %s, %s)", (name, cat, r_date.strftime('%Y-%m-%d %H:%M:%S')))

    # Recalculate max IDs for linking
    cursor.execute("SELECT MAX(user_id) FROM Users")
    final_max_user = cursor.fetchone()[0] or 1
    cursor.execute("SELECT MAX(merchant_id) FROM Merchants")
    final_max_merchant = cursor.fetchone()[0] or 1

    # 3. GENERATE ACCOUNTS
    print("Generating Accounts for newest users...")
    cursor.execute("SELECT user_id FROM Users WHERE user_id > %s", (max_user,))
    new_users = cursor.fetchall()
    for (u_id,) in new_users:
        balance = round(random.uniform(500.0, 50000.0), 2)
        cursor.execute("INSERT INTO Accounts (user_id, balance) VALUES (%s, %s)", (u_id, balance))

    # 4. GENERATE TRANSACTIONS (Spanning last 60 days)
    print("Generating 3,000 mock Transactions for Charts...")
    statuses = ["Completed", "Completed", "Completed", "Pending", "Failed"]
    
    cursor.execute("SELECT user_id FROM Users")
    valid_users = [row[0] for row in cursor.fetchall()]
    
    cursor.execute("SELECT merchant_id FROM Merchants")
    valid_merchants = [row[0] for row in cursor.fetchall()]

    today = datetime.now()
    
    for i in range(3000):
        # Pick randomly from valid list
        u_id = random.choice(valid_users)
        m_id = random.choice(valid_merchants)
        amount = round(random.uniform(50.0, 5000.0), 2)
        status = random.choice(statuses)
        
        # Random date in last 30 days
        days_ago = random.randint(0, 30)
        t_date = today - timedelta(days=days_ago)
        
        cursor.execute("""
            INSERT INTO Transactions (user_id, merchant_id, amount, status, transaction_date) 
            VALUES (%s, %s, %s, %s, %s)
        """, (u_id, m_id, amount, status, t_date.strftime('%Y-%m-%d %H:%M:%S')))

    # 5. GENERATE USER BANKS (New)
    print("Linking 1-2 random Banks for each user...")
    banks = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank"]
    for u_id in valid_users[:100]: # Seed first 100 users for speed
        num_banks = random.randint(1, 2)
        for _ in range(num_banks):
            b_name = random.choice(banks)
            acc_num = "".join([str(random.randint(0, 9)) for _ in range(12)])
            cursor.execute("INSERT IGNORE INTO UserBanks (user_id, bank_name, account_number, balance) VALUES (%s, %s, %s, %s)", 
                           (u_id, b_name, acc_num, round(random.uniform(10000.0, 90000.0), 2)))

    conn.commit()
    conn.close()
    print("--- SEEDING COMPLETE! Refresh your Dashboard. ---")

if __name__ == "__main__":
    generate_mock_data()
