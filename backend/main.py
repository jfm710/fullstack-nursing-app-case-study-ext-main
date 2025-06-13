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
    conn = None  # Initialize conn to None
    try:
        conn = get_db_connection()
        if conn:
            with conn.cursor() as cur:
                # Check if the table exists
                cur.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables
                        WHERE table_name = 'applications'
                    )
                """)
                table_exists = cur.fetchone().get("exists")

                if not table_exists:
                    print("Table 'applications' does not exist. Creating table...", file=sys.stderr)
                    # Define new fields as nullable
                    cur.execute('''CREATE TABLE applications
                                    (id SERIAL PRIMARY KEY,
                                     name TEXT NOT NULL,
                                     email TEXT NOT NULL,
                                     phone TEXT NOT NULL,
                                     gpa REAL NOT NULL,
                                     work_location TEXT,
                                     passed_nclex TEXT,
                                     nclex_state TEXT,
                                     submitted_at TIMESTAMP NOT NULL)''')
                    print("Table 'applications' created successfully.", file=sys.stderr)
                else:
                    print("Table 'applications' already exists. Checking for missing columns...", file=sys.stderr)
                    # Columns to check/add, defined as nullable
                    columns_to_ensure = {
                        "work_location": "TEXT",
                        "passed_nclex": "TEXT",
                        "nclex_state": "TEXT"
                    }

                    for column_name, column_definition in columns_to_ensure.items():
                        cur.execute("""
                            SELECT EXISTS (
                                SELECT FROM information_schema.columns
                                WHERE table_name = 'applications' AND column_name = %s
                            )
                        """, (column_name,))
                        column_exists = cur.fetchone().get("exists")
                        if not column_exists:
                            print(f"Column '{column_name}' does not exist. Adding column...", file=sys.stderr)
                            cur.execute(f"ALTER TABLE applications ADD COLUMN {column_name} {column_definition}")
                            print(f"Column '{column_name}' added successfully.", file=sys.stderr)
                        else:
                            # If column exists, you might want to ensure it's nullable
                            # This is more complex as it might involve dropping NOT NULL constraint
                            # For simplicity, we assume if it exists, its nullability is managed manually
                            # or was set correctly during a previous init_db run with this updated logic.
                            # To be fully robust, one could check and alter the NOT NULL constraint here.
                            print(f"Column '{column_name}' already exists.", file=sys.stderr)
            print("Database initialization check complete.", file=sys.stderr)
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

def get_nullable_text(form_data, key):
    """Helper to get text from form; returns None if key not present or value is empty string."""
    value = form_data.get(key)
    return value if value else None

def get_nullable_boolean(form_data, key):
    """Helper to get boolean from form; returns None if key not present or value is not 'true'/'false'."""
    value_str = form_data.get(key, '').lower() # Default to empty string, then lowercase
    if value_str == 'true':
        return True
    if value_str == 'false':
        return False
    return None # For empty string or any other value

@app.route("/applications", methods=['GET', 'POST'])
def applications():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        phone = request.form['phone']
        gpa = float(request.form['gpa']) # Assuming gpa is always provided and valid

        # Get nullable fields
        work_location = get_nullable_text(request.form, 'work_location')
        passed_nclex = get_nullable_boolean(request.form, 'passed_nclex')
        nclex_state = get_nullable_text(request.form, 'nclex_state')

        submitted_at = datetime.now()

        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute('INSERT INTO applications (name, email, phone, gpa, work_location, passed_nclex, nclex_state, submitted_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)',
                                (name, email, phone, gpa, work_location, passed_nclex, nclex_state, submitted_at))
            except Exception as e:
                print(f"Error inserting application: {e}", file=sys.stderr)
                return "Error creating application", 500 # Provide feedback
            finally:
                conn.close()
            return "Created", 201 # Return 201 Created status
        else:
            return "Database connection error", 500


    conn = get_db_connection()
    applications_list = [] # Renamed to avoid conflict with function name
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute('SELECT * FROM applications ORDER BY submitted_at DESC') # Added ORDER BY
                # Convert DictCursor results to a list of dictionaries
                applications_list = [
                    {
                        'id': row['id'],
                        'name': row['name'],
                        'email': row['email'],
                        'phone': row['phone'],
                        'gpa': float(row['gpa']),
                        'work_location': row['work_location'], # Will be None if NULL in DB
                        'passed_nclex': row['passed_nclex'],   # Will be None if NULL in DB
                        'nclex_state': row['nclex_state'],     # Will be None if NULL in DB
                        'submitted_at': row['submitted_at'].isoformat()
                    }
                    for row in cur.fetchall()
                ]
        except Exception as e:
            print(f"Error fetching applications: {e}", file=sys.stderr)
            return "Error fetching applications", 500 # Provide feedback
        finally:
            conn.close()

    return jsonify(applications_list)


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

        # Get nullable fields
        work_location = get_nullable_text(request.form, 'work_location')
        passed_nclex = get_nullable_boolean(request.form, 'passed_nclex')
        nclex_state = get_nullable_text(request.form, 'nclex_state')

        try:
            with conn.cursor() as cur:
                cur.execute('UPDATE applications SET name = %s, email = %s, phone = %s, gpa = %s, work_location = %s, passed_nclex = %s, nclex_state = %s WHERE id = %s',
                            (name, email, phone, gpa, work_location, passed_nclex, nclex_state, id))
        except Exception as e:
            print(f"Error updating application: {e}", file=sys.stderr)
            return "Error updating application", 500 # Provide feedback
        finally:
            conn.close()
        return jsonify({"message": f"Successfully edited application with ID {id}."}), 200

    # GET request part
    application = None
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM applications WHERE id = %s', (id,))
            application = cur.fetchone()
    except Exception as e:
        print(f"Error fetching application for edit: {e}", file=sys.stderr)
        # Connection is closed in finally block even on error
    finally:
        if conn: # Ensure conn is not None before closing, though get_db_connection handles this
            conn.close()

    if application is None:
        return jsonify({"message": "Application not found"}), 404

    # Ensure all fields are present, converting None from DB to JSON null
    # RealDictCursor already gives us a dict-like object where None values are Python None
    return jsonify({"message": "Found application", "data": application})

@app.route("/admin/delete/<int:id>", methods=['POST'])
def delete_application(id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection error"}), 500

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM applications WHERE id = %s RETURNING id', (id,))
            deleted_row = cur.fetchone()
            if deleted_row:
                return jsonify({"message": f"Successfully deleted application with ID {id}."}), 200
            else:
                return jsonify({"message": f"Application with ID {id} not found."}), 404
    except Exception as e:
        print(f"Error deleting application: {e}", file=sys.stderr)
        return jsonify({"message": "Error deleting application"}), 500
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)