import mysql.connector

def check_data():
    try:
        conn = mysql.connector.connect(host='localhost', user='root', password='', database='paytm_db')
        cursor = conn.cursor(dictionary=True)
        
        print("--- USER BANKS ---")
        cursor.execute("SELECT * FROM UserBanks")
        banks = cursor.fetchall()
        for b in banks:
            print(f"ID: {b['id']}, UserID: {b['user_id']}, Bank: {b['bank_name']}, Acc: {b['account_number']}")
            
        print("\n--- CURRENT USER INFO ---")
        cursor.execute("SELECT user_id, first_name, last_name, email FROM Users WHERE first_name='Aarti'")
        user = cursor.fetchone()
        if user:
            print(f"Found Aarti: ID={user['user_id']}, Name={user['first_name']} {user['last_name']}")
        else:
            print("Aarti not found in Users table")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_data()
