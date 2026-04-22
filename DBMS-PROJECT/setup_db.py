import mysql.connector
import os

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

def run_sql_script(filename):
    try:
        # Connect to MySQL (without specifying database first, in case it needs to be created)
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()

        print(f"Reading {filename}...")
        with open(filename, 'r') as f:
            sql_script = f.read()

        # Split statements by ';' taking care of basic formatting
        statements = sql_script.split(';')
        for stmt in statements:
            if stmt.strip():
                cursor.execute(stmt)

        conn.commit()
        print("Database setup completed successfully!")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    script_path = os.path.join(os.path.dirname(__file__), "paytm_db_setup.sql")
    if os.path.exists(script_path):
        run_sql_script(script_path)
    else:
        print(f"Could not find {script_path}")
