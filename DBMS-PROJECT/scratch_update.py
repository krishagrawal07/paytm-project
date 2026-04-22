import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="paytm_db"
)
cursor = conn.cursor()
cursor.execute("UPDATE Merchants SET registered_date = NOW() WHERE registered_date IS NULL")
conn.commit()
conn.close()
print("Merchants registered_date fixed.")
