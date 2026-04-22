from flask import Flask, render_template, jsonify, request, redirect, session, make_response
import mysql.connector
import random
import csv
import io
import os
from functools import wraps

app = Flask(__name__)
app.secret_key = 'super_secret_paytm_key_123'

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "paytm_db")

# Case Study Queries synchronized with paytm_queries.sql
QUERIES = {
    1: """SELECT U.user_id, CONCAT(U.first_name, ' ', U.last_name) AS full_name FROM Users U JOIN Transactions T ON U.user_id = T.user_id GROUP BY U.user_id, U.first_name, U.last_name HAVING COUNT(T.transaction_id) > 10 ORDER BY U.user_id;""",
    2: """SELECT DISTINCT U.user_id FROM Users U JOIN Transactions T ON U.user_id = T.user_id JOIN Payments P ON T.transaction_id = P.transaction_id;""",
    3: """SELECT DISTINCT T.* FROM Transactions T JOIN Merchants M ON T.merchant_id = M.merchant_id WHERE M.name = 'Amazon' AND YEAR(T.transaction_date) = 2023;""",
    4: """SELECT U.email, T.transaction_id FROM Users U JOIN Transactions T ON U.user_id = T.user_id ORDER BY T.transaction_id ASC;""",
    5: """SELECT DISTINCT M.merchant_id, M.name FROM Merchants M LEFT JOIN Transactions T ON M.merchant_id = T.merchant_id WHERE T.transaction_id IS NULL;""",
    6: """SELECT U.user_id, CONCAT(U.first_name, ' ', U.last_name) AS full_name FROM Users U JOIN Transactions T ON U.user_id = T.user_id JOIN Merchants M ON T.merchant_id = M.merchant_id WHERE M.name = 'Zomato' GROUP BY U.user_id, U.first_name, U.last_name ORDER BY U.last_name ASC;""",
    7: """SELECT M.merchant_id, CONCAT(U.first_name, ' ', U.last_name) AS full_name FROM Users U JOIN Transactions T ON U.user_id = T.user_id JOIN Merchants M ON T.merchant_id = M.merchant_id WHERE M.category = 'E-commerce' GROUP BY M.merchant_id, U.first_name, U.last_name ORDER BY full_name ASC;""",
    8: """SELECT merchant_id, AVG(amount) AS avg_transaction FROM Transactions GROUP BY merchant_id ORDER BY avg_transaction DESC LIMIT 1;""",
    9: """SELECT U.user_id AS customer_id, COUNT(P.payment_id) AS payment_count FROM Users U JOIN Transactions T ON U.user_id = T.user_id JOIN Payments P ON T.transaction_id = P.transaction_id GROUP BY U.user_id HAVING COUNT(P.payment_id) > 5;""",
    10: """SELECT merchant_id, SUM(amount * 0.02) AS total_commission FROM Transactions GROUP BY merchant_id;"""
}

def get_db_connection():
    try:
        conn = mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME)
        return conn, None
    except mysql.connector.Error as err:
        return None, str(err)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'): return redirect('/login')
        return f(*args, **kwargs)
    return decorated_function

# --- AUTH ROUTES ---
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        role = request.form.get('role', 'admin')
        pin = request.form.get('pin')
        if role == 'admin' and pin == 'admin123':
            session['logged_in'], session['role'] = True, 'admin'
            return redirect('/')
        elif role == 'user':
            email = request.form.get('email')
            conn, err = get_db_connection()
            if err: return render_template('login.html', error=f"DB Error: {err}", role='user')
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT user_id FROM Users WHERE email = %s", (email,))
            usr = cursor.fetchone()
            conn.close()
            if usr:
                session['logged_in'], session['role'], session['user_id'] = True, 'user', usr['user_id']
                return redirect('/customer')
        return render_template('login.html', error="Invalid Credentials", role=role)
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')

@app.route('/')
@login_required
def home():
    if session.get('role') == 'user': return redirect('/customer')
    return render_template("index.html")

@app.route('/customer')
@login_required
def customer_view():
    conn, err = get_db_connection()
    user_name, user_email = "User", ""
    if not err:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT first_name, last_name, email FROM Users WHERE user_id = %s", (session.get('user_id'),))
        u = cursor.fetchone()
        if u: user_name, user_email = f"{u['first_name']} {u['last_name']}", u['email']
        conn.close()
    return render_template("customer.html", user_name=user_name, user_email=user_email)

# --- ADMIN API ROUTES ---

@app.route('/api/status')
def get_db_status():
    conn, err = get_db_connection()
    if err: return jsonify({"status": "disconnected", "message": str(err)})
    try:
        cursor = conn.cursor()
        cursor.execute("SHOW TABLES")
        tables = [t[0] for t in cursor.fetchall()]
        required = ['Users', 'Merchants', 'Transactions', 'Accounts', 'Payments']
        if all(t in tables for t in required):
            return jsonify({"status": "connected", "message": "Database Online"})
        return jsonify({"status": "setup_required", "message": "Tables missing. Run setup script."})
    except Exception as e: return jsonify({"status": "error", "message": str(e)})
    finally: conn.close()

@app.route('/api/dashboard/metrics')
@login_required
def dashboard_metrics():
    conn, err = get_db_connection()
    if err: return jsonify({"error": err}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT SUM(amount) as total_volume FROM Transactions WHERE status='Completed'")
        vol = cursor.fetchone()['total_volume'] or 0
        cursor.execute("SELECT COUNT(*) as u_count FROM Users")
        users = cursor.fetchone()['u_count']
        cursor.execute("SELECT COUNT(*) as m_count FROM Merchants")
        merchants = cursor.fetchone()['m_count']
        cursor.execute("SELECT T.*, U.first_name as user, M.name as merchant FROM Transactions T JOIN Users U ON T.user_id=U.user_id JOIN Merchants M ON T.merchant_id=M.merchant_id ORDER BY transaction_date DESC LIMIT 5")
        recent = cursor.fetchall()
        cursor.execute("SELECT DATE(transaction_date) as t_date, SUM(amount) as daily_vol FROM Transactions GROUP BY DATE(transaction_date) ORDER BY t_date ASC LIMIT 10")
        chart = cursor.fetchall()
        conn.close()
        return jsonify({"metrics": {"volume": float(vol), "users": users, "merchants": merchants, "commission": float(vol)*0.02}, "recent_txns": recent, "chart_data": chart})
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/query/<int:query_id>')
@login_required
def run_query(query_id):
    if query_id not in QUERIES: return jsonify({"error": "Invalid query ID"}), 400
    conn, err = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(QUERIES[query_id])
        res = cursor.fetchall()
        cols = [i[0] for i in cursor.description] if cursor.description else []
        conn.close()
        return jsonify({"columns": cols, "data": res, "query_text": QUERIES[query_id]})
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/table/<table_name>')
@login_required
def get_table_data(table_name):
    allowed = ['Users', 'Merchants', 'Transactions', 'Accounts', 'Payments']
    if table_name not in allowed: return jsonify({"error": "Invalid table"}), 400
    conn, err = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        query = f"SELECT * FROM {table_name} LIMIT 500"
        cursor.execute(query)
        res = cursor.fetchall()
        cols = [i[0] for i in cursor.description] if cursor.description else []
        conn.close()
        return jsonify({"columns": cols, "data": res, "query_text": query})
    except Exception as e: return jsonify({"error": str(e)}), 500

# --- CUSTOMER API ROUTES ---

@app.route('/api/user/<int:user_id>/profile')
@login_required
def user_profile_api(user_id):
    conn, err = get_db_connection()
    if err: return jsonify({"error": str(err)}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        cursor.execute("SELECT COALESCE(balance, 0) as balance FROM Accounts WHERE user_id = %s", (user_id,))
        acc = cursor.fetchone()
        cursor.execute("SELECT T.*, M.name as merchant FROM Transactions T JOIN Merchants M ON T.merchant_id=M.merchant_id WHERE T.user_id=%s ORDER BY T.transaction_date DESC LIMIT 10", (user_id,))
        txns = cursor.fetchall()
        
        cursor.execute("SELECT COUNT(*) as txn_count, COALESCE(SUM(amount), 0) as total_spent FROM Transactions WHERE user_id = %s AND status = 'Completed'", (user_id,))
        stats = cursor.fetchone()
        
        conn.close()
        return jsonify({"user": user, "balance": float(acc['balance']) if acc else 0, "transactions": txns, "stats": stats})
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/user/pay', methods=['POST'])
@login_required
def process_user_payment():
    conn, err = get_db_connection()
    data = request.json
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT balance FROM Accounts WHERE user_id = %s", (data['user_id'],))
        acc = cursor.fetchone()
        if not acc or acc['balance'] < float(data['amount']): return jsonify({"error": "Insufficient balance"}), 400
        cursor.execute("UPDATE Accounts SET balance = balance - %s WHERE user_id = %s", (data['amount'], data['user_id']))
        cursor.execute("INSERT INTO Transactions (user_id, merchant_id, amount, status, transaction_date) VALUES (%s, %s, %s, 'Completed', NOW())",
                       (data['user_id'], data['merchant_id'], data['amount']))
        conn.commit(); conn.close()
        return jsonify({"success": True})
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/user/find')
@login_required
def find_user_by_phone():
    phone = request.args.get('phone')
    conn, err = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT user_id, CONCAT(first_name, ' ', last_name) as name FROM Users WHERE phone = %s", (phone,))
    u = cursor.fetchone(); conn.close()
    if u: return jsonify({"success": True, "user": u})
    return jsonify({"success": False, "error": "Not found"}), 404

@app.route('/api/user/p2p', methods=['POST'])
@login_required
def process_p2p():
    data = request.json
    conn, err = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("UPDATE Accounts SET balance = balance - %s WHERE user_id = %s", (data['amount'], data['sender_id']))
    cursor.execute("UPDATE Accounts SET balance = balance + %s WHERE user_id = %s", (data['amount'], data['receiver_id']))
    cursor.execute("INSERT INTO Transactions (user_id, merchant_id, amount, status) VALUES (%s, 1, %s, 'Completed')", (data['sender_id'], data['amount']))
    conn.commit(); conn.close(); return jsonify({"success": True})

@app.route('/api/user/add-money', methods=['POST'])
@login_required
def add_money():
    data = request.json
    conn, err = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE Accounts SET balance = balance + %s WHERE user_id = %s", (data['amount'], data['user_id']))
    cursor.execute("INSERT INTO Transactions (user_id, merchant_id, amount, status) VALUES (%s, 1, %s, 'Completed')", (data['user_id'], data['amount']))
    conn.commit(); conn.close(); return jsonify({"success": True})

@app.route('/api/user/bill-pay', methods=['POST'])
@login_required
def bill_pay():
    data = request.json
    conn, err = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE Accounts SET balance = balance - %s WHERE user_id = %s", (data['amount'], data['user_id']))
    cursor.execute("INSERT INTO Transactions (user_id, merchant_id, amount, status) VALUES (%s, 1, %s, 'Completed')", (data['user_id'], data['amount']))
    conn.commit(); conn.close(); return jsonify({"success": True})

# --- COMPLAINTS & BANKS ---

@app.route('/api/user/complaints/submit', methods=['POST'])
@login_required
def submit_complaint():
    conn, err = get_db_connection()
    data = request.json
    ticket_id = 'PTM-' + str(random.randint(100000, 999999))
    cursor = conn.cursor()
    cursor.execute("INSERT INTO Complaints (user_id, category, description, ticket_id) VALUES (%s, %s, %s, %s)",
                   (session['user_id'], data['category'], data['description'], ticket_id))
    conn.commit(); conn.close(); return jsonify({"success": True, "ticket_id": ticket_id})

@app.route('/api/user/complaints/list')
@login_required
def list_complaints():
    conn, err = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Complaints WHERE user_id = %s ORDER BY created_at DESC", (session['user_id'],))
    res = cursor.fetchall(); conn.close(); return jsonify({"success": True, "complaints": res})

@app.route('/api/user/banks/link', methods=['POST'])
@login_required
def link_bank():
    conn, err = get_db_connection()
    data = request.json
    acc_num = str(random.randint(1000000000, 9999999999))
    cursor = conn.cursor()
    cursor.execute("INSERT INTO UserBanks (user_id, bank_name, account_number, balance) VALUES (%s, %s, %s, %s)",
                   (session['user_id'], data['bank_name'], acc_num, round(random.uniform(1000, 50000), 2)))
    conn.commit(); conn.close(); return jsonify({"success": True, "account_number": acc_num})

@app.route('/api/user/banks/list')
@login_required
def list_banks():
    conn, err = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM UserBanks WHERE user_id = %s", (session['user_id'],))
    res = cursor.fetchall(); conn.close(); return jsonify({"success": True, "banks": res})

@app.route('/api/user/banks/balance/<int:bank_id>')
@login_required
def get_bank_balance(bank_id):
    conn, err = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT balance FROM UserBanks WHERE bank_id = %s AND user_id = %s", (bank_id, session['user_id']))
    bank = cursor.fetchone(); conn.close()
    if bank: return jsonify({"success": True, "balance": float(bank['balance'])})
    return jsonify({"error": "Bank not found"}), 404

# --- AUTH & REGISTRATION APIS ---

@app.route('/api/auth/users')
def get_auth_users():
    conn, err = get_db_connection()
    if err: return jsonify({"error": str(err)}), 500
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT email, CONCAT(first_name, ' ', last_name) as name FROM Users ORDER BY first_name ASC")
    users = cursor.fetchall()
    conn.close()
    return jsonify({"users": users})

@app.route('/api/user/register', methods=['POST'])
def register_user():
    data = request.json
    conn, err = get_db_connection()
    if err: return jsonify({"error": str(err)}), 500
    try:
        cursor = conn.cursor()
        # 1. Insert User
        cursor.execute("INSERT INTO Users (first_name, last_name, email, phone) VALUES (%s, %s, %s, %s)",
                       (data['first_name'], data['last_name'], data['email'], data['phone']))
        user_id = cursor.lastrowid
        # 2. Create Account with Bonus
        cursor.execute("INSERT INTO Accounts (user_id, balance) VALUES (%s, 5000.00)", (user_id,))
        # 3. Log initial transaction
        cursor.execute("INSERT INTO Transactions (user_id, merchant_id, amount, status, transaction_date) VALUES (%s, 1, 5000.00, 'Completed', NOW())", (user_id, 1))
        conn.commit(); conn.close()
        return jsonify({"success": True})
    except Exception as e:
        conn.rollback(); conn.close()
        return jsonify({"error": str(e)}), 500

# --- ADMIN SYSTEM APIS ---

@app.route('/api/admin/audit-logs')
@login_required
def get_audit_logs():
    logs = [
        {"timestamp": "2026-04-22 14:30:12", "user": "Super Admin", "action": "Database Backup", "status": "Success"},
        {"timestamp": "2026-04-22 13:15:45", "user": "Super Admin", "action": "Security Key Rotation", "status": "Success"},
        {"timestamp": "2026-04-22 11:05:00", "user": "Super Admin", "action": "Bulk User Export", "status": "Success"},
        {"timestamp": "2026-04-21 23:50:22", "user": "System", "action": "Automated Scaling", "status": "Completed"},
        {"timestamp": "2026-04-21 18:22:11", "user": "Super Admin", "action": "Schema Migration", "status": "Success"}
    ]
    return jsonify({"columns": ["timestamp", "user", "action", "status"], "data": logs, "query_text": "SELECT * FROM System_Audit_Logs ORDER BY timestamp DESC"})

if __name__ == '__main__':
    app.run(debug=True)
