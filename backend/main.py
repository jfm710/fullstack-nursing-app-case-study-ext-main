import os
import sys
from flask import Flask, request, redirect, url_for, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default_secret_key')

# Configure CORS to allow specific origins with ports
CORS(app, origins=["http://app-frontend", "http://localhost:3000"])

# Use the DATABASE_URL environment variable
DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        conn.autocommit = True
        print("Database connection successful", file=sys.stderr)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}", file=sys.stderr)
        return None

def init_db():
    try:
        conn = get_db_connection()
        if conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables
                        WHERE table_name = 'applications'
                    )
                """)
                table_exists = cur.fetchone().get("exists")
                if not table_exists:
                    cur.execute('''CREATE TABLE applications
                                    (id SERIAL PRIMARY KEY,
                                     name TEXT NOT NULL,
                                     email TEXT NOT NULL,
                                     phone TEXT NOT NULL,
                                     gpa REAL NOT NULL,
                                     submitted_at TIMESTAMP NOT NULL)''')
            print("Database initialized successfully.", file=sys.stderr)
        else:
            print("Failed to initialize database: No connection available.", file=sys.stderr)
    except Exception as e:
        print(f"Database initialization error: {e}", file=sys.stderr)
    finally:
        if conn:
            conn.close()

init_db()
@app.route("/")
def index():
    return {"msg": "Welcome to the BE API."}

@app.route("/applications", methods=['GET', 'POST'])
def applications():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        phone = request.form['phone']
        gpa = float(request.form['gpa'])
        submitted_at = datetime.now()

        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute('INSERT INTO applications (name, email, phone, gpa, submitted_at) VALUES (%s, %s, %s, %s, %s)',
                                (name, email, phone, gpa, submitted_at))
            except Exception as e:
                print(f"Error inserting application: {e}", file=sys.stderr)
            finally:
                conn.close()

        return "Created"

    conn = get_db_connection()
    applications = []
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute('SELECT * FROM applications')
                # Convert DictCursor results to a list of dictionaries
                applications = [
                    {
                        'id': row['id'],
                        'name': row['name'],
                        'email': row['email'],
                        'phone': row['phone'],
                        'gpa': float(row['gpa']),
                        'submitted_at': row['submitted_at'].isoformat()
                    }
                    for row in cur.fetchall()
                ]
        except Exception as e:
            print(f"Error fetching applications: {e}", file=sys.stderr)
        finally:
            conn.close()

    return jsonify(applications)  # Return JSON response


@app.route("/admin/edit/<int:id>", methods=['GET', 'POST'])
def edit_application(id):
    conn = get_db_connection()
    if not conn:
        return "Database connection error", 500

    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        phone = request.form['phone']
        gpa = float(request.form['gpa'])
        
        try:
            with conn.cursor() as cur:
                cur.execute('UPDATE applications SET name = %s, email = %s, phone = %s, gpa = %s WHERE id = %s',
                            (name, email, phone, gpa, id))
        except Exception as e:
            print(f"Error updating application: {e}", file=sys.stderr)
        finally:
            conn.close()
        return f"Successfully edited application with ID {id}."
    
    application = None
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM applications WHERE id = %s', (id,))
            application = cur.fetchone()
    except Exception as e:
        print(f"Error fetching application for edit: {e}", file=sys.stderr)
    finally:
        conn.close()
    
    if application is None:
        return "Application not found", 404
    
    return jsonify({"message": "Found application", "data": application})

@app.route("/admin/delete/<int:id>", methods=['POST'])
def delete_application(id):
    # TODO
    return {}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
