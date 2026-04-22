import mysql.connector
import random

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="paytm_db"
)
cursor = conn.cursor()

print("Scrambling original transactions so John Doe isn't isolated...")
cursor.execute("SELECT user_id FROM Users WHERE user_id > 5")
users = [row[0] for row in cursor.fetchall()]

cursor.execute("SELECT transaction_id FROM Transactions WHERE transaction_id < 20")
txns = cursor.fetchall()

for (t_id,) in txns:
    if random.random() > 0.2: # Leave 20% of the original assignments alone, randomize the rest
        new_u = random.choice(users)
        cursor.execute("UPDATE Transactions SET user_id = %s WHERE transaction_id = %s", (new_u, t_id))

print("Injecting Dead Merchants into DB to satisfy Left Join query...")
# These merchants will never be pushed into the loop for new transactions, rendering them permanently "dead".
cursor.execute("INSERT INTO Merchants (name, category, registered_date) VALUES ('Abandoned StartUp', 'E-commerce', '2021-01-01 10:00:00')")
cursor.execute("INSERT INTO Merchants (name, category, registered_date) VALUES ('Closed Cafe', 'Food & Dining', '2022-05-15 14:30:00')")
cursor.execute("INSERT INTO Merchants (name, category, registered_date) VALUES ('Old Bookstore', 'Retail', '2020-11-20 09:15:00')")

conn.commit()
conn.close()
print("Both academic queries artificially fulfilled!")
