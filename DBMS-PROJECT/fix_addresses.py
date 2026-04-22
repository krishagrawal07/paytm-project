import mysql.connector
import random

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="paytm_db"
)
cursor = conn.cursor()

cursor.execute("SELECT user_id FROM Users WHERE user_id > 5")
users = cursor.fetchall()

streets = ["MG Road", "Link Road", "Station Road", "Main Street", "Ring Road", "Airport Road", "Park Street", "Gandhi Marg", "Residency Road"]
cities = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow"]
states = ["MH", "DL", "KA", "MH", "TS", "TN", "WB", "GJ", "RJ", "UP"]

for (u_id,) in users:
    city_idx = random.randint(0, len(cities)-1)
    addr = f"{random.randint(10, 999)} {random.choice(streets)}, {cities[city_idx]}, {states[city_idx]} {random.randint(400000, 800000)}"
    cursor.execute("UPDATE Users SET address = %s WHERE user_id = %s", (addr, u_id))

conn.commit()
conn.close()
print("Randomized addresses assigned successfully.")
