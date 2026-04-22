import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="paytm_db"
)
cursor = conn.cursor()

print("Wiping improperly sequenced fake data...")

# Delete fake transactions associated with fake users
cursor.execute("DELETE FROM Transactions WHERE user_id > 5")

# Delete fake accounts
cursor.execute("DELETE FROM Accounts WHERE user_id > 5")

# Delete fake users
cursor.execute("DELETE FROM Users WHERE user_id > 5")

# Delete fake merchants
cursor.execute("DELETE FROM Merchants WHERE merchant_id > 5")

print("Resetting AUTO_INCREMENT counters...")
cursor.execute("ALTER TABLE Users AUTO_INCREMENT = 6")
cursor.execute("ALTER TABLE Merchants AUTO_INCREMENT = 6")
cursor.execute("ALTER TABLE Accounts AUTO_INCREMENT = 1")
cursor.execute("ALTER TABLE Transactions AUTO_INCREMENT = 1")

conn.commit()
conn.close()
print("Clean up successful. Ready for fresh seed.")
