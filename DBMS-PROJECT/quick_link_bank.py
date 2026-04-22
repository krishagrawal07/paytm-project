import mysql.connector

def link_aarti_bank():
    try:
        conn = mysql.connector.connect(host='localhost', user='root', password='', database='paytm_db')
        cursor = conn.cursor()
        
        # Find Aarti Jain
        cursor.execute("SELECT user_id FROM Users WHERE first_name='Aarti' AND last_name='Jain' LIMIT 1")
        res = cursor.fetchone()
        
        if res:
            u_id = res[0]
            print(f"Linking bank for Aarti Jain (ID: {u_id})...")
            cursor.execute("INSERT IGNORE INTO UserBanks (user_id, bank_name, account_number, balance) VALUES (%s, 'HDFC Bank', '501004523910', 45000.50)", (u_id,))
            conn.commit()
            print("Successfully linked HDFC Bank to Aarti's profile!")
        else:
            print("User 'Aarti Jain' not found. Please register first.")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    link_aarti_bank()
