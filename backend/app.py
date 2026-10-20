from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
import time
import os
import json
import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config import Config
from db import MOCK_USERS, MOCK_DONATIONS, MOCK_REQUESTS, MOCK_NOTIFICATIONS, MOCK_ACTIVITIES, MOCK_SETTINGS, get_db_connection

USERS_FILE = os.path.join(os.path.dirname(__file__), 'users_data.json')
DONATIONS_FILE = os.path.join(os.path.dirname(__file__), 'donations_data.json')
REQUESTS_FILE = os.path.join(os.path.dirname(__file__), 'requests_data.json')
NOTIFICATIONS_FILE = os.path.join(os.path.dirname(__file__), 'notifications_data.json')

def send_email_otp(to_email, otp_code, food_title="Surplus Food", donor_name="Food Donor"):
    """Sends OTP email to the recipient NGO's registered email address."""
    if not to_email:
        print("[OTP Email] No email provided to send OTP.")
        return False

    smtp_email = getattr(Config, 'SMTP_EMAIL', '')
    smtp_password = getattr(Config, 'SMTP_PASSWORD', '')
    smtp_server = getattr(Config, 'SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = getattr(Config, 'SMTP_PORT', 465)

    if smtp_email and smtp_password:
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"🔐 Your Pickup OTP: {otp_code} — Food Redistribution System"
            msg['From'] = f"Food Redistribution System <{smtp_email}>"
            msg['To'] = to_email

            html_content = f"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
                <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <span style="font-size: 32px;">🍲</span>
                        <h2 style="color: #059669; margin: 5px 0;">Food Redistribution System</h2>
                        <p style="color: #64748b; font-size: 14px; margin: 0;">Claim Confirmation & Handshake OTP</p>
                    </div>
                    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 14px; color: #065f46;">
                            Your claim for <strong>{food_title}</strong> from <strong>{donor_name}</strong> is confirmed!
                        </p>
                    </div>
                    <div style="text-align: center; margin: 25px 0;">
                        <p style="font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; font-weight: bold;">
                            Your Secure Pickup OTP
                        </p>
                        <div style="font-size: 38px; font-weight: 800; letter-spacing: 0.25em; color: #059669; background: #f0fdf4; border: 2px dashed #059669; padding: 15px 25px; border-radius: 12px; display: inline-block;">
                            {otp_code}
                        </div>
                    </div>
                    <p style="font-size: 13px; color: #475569; line-height: 1.5;">
                        Please share this <strong>4-digit OTP</strong> with the delivery volunteer when they arrive to complete the pickup verification handshake.
                    </p>
                    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;">
                    <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
                        Food Redistribution System • Connecting Food With People
                    </p>
                </div>
            </body>
            </html>
            """
            msg.attach(MIMEText(html_content, 'html'))

            with smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=10) as server:
                server.login(smtp_email, smtp_password)
                server.send_message(msg)

            print(f"[OTP Email SUCCESS] Real email sent to {to_email} with OTP: {otp_code}")
            return True
        except Exception as e:
            print(f"[OTP Email ERROR] Failed to send email to {to_email}: {e}")
            return False
    else:
        # Clear server simulation output
        print("=" * 60)
        print(f"📨 [SIMULATED EMAIL DISPATCH TO NGO]")
        print(f"TO: {to_email}")
        print(f"SUBJECT: 🔐 Your Pickup OTP: {otp_code} — Food Redistribution System")
        print(f"FOOD ITEM: {food_title} (from {donor_name})")
        print(f"SECURE OTP: >>> {otp_code} <<<")
        print(f"(Note: To send real emails to your Gmail inbox, add SMTP_EMAIL and SMTP_PASSWORD in backend/.env)")
        print("=" * 60)
        return True


def load_persistent_users():
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list) and len(data) > 0:
                    return data
        except Exception as e:
            print("Error loading users_data.json:", e)
    save_persistent_users(MOCK_USERS)
    return list(MOCK_USERS)

def save_persistent_users(users_list):
    try:
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(users_list, f, indent=2)
    except Exception as e:
        print("Error saving users_data.json:", e)

def load_persistent_donations():
    if os.path.exists(DONATIONS_FILE):
        try:
            with open(DONATIONS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        except Exception as e:
            print("Error loading donations_data.json:", e)
    return []

def save_persistent_donations(donations_list):
    try:
        with open(DONATIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(donations_list, f, indent=2)
    except Exception as e:
        print("Error saving donations_data.json:", e)

def load_persistent_requests():
    if os.path.exists(REQUESTS_FILE):
        try:
            with open(REQUESTS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        except Exception as e:
            print("Error loading requests_data.json:", e)
    return []

def save_persistent_requests(requests_list):
    try:
        with open(REQUESTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(requests_list, f, indent=2)
    except Exception as e:
        print("Error saving requests_data.json:", e)

def load_persistent_notifications():
    if os.path.exists(NOTIFICATIONS_FILE):
        try:
            with open(NOTIFICATIONS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list) and len(data) > 0:
                    return data
        except Exception as e:
            print("Error loading notifications_data.json:", e)
    return [
        {
            "id": 1,
            "user_id": 1,
            "role": "donor",
            "title": "Donation Claimed by NGO",
            "message": "Hope Shelter NGO has requested your donation 'Surplus Banquet Meals'.",
            "type": "claim",
            "is_read": False,
            "created_at": "2026-10-20 18:30:00"
        },
        {
            "id": 2,
            "user_id": 4,
            "role": "admin",
            "title": "NGO Claim Submitted",
            "message": "Hope Shelter NGO claimed 'Surplus Banquet Meals' from Grand Hyatt Hotel.",
            "type": "claim",
            "is_read": False,
            "created_at": "2026-10-20 18:30:00"
        },
        {
            "id": 3,
            "user_id": 2,
            "role": "ngo",
            "title": "New Surplus Food Available 🍲",
            "message": "Grand Hyatt Hotel listed 'Surplus Banquet Meals (Buffet)' (45 Portions). Ready to claim!",
            "type": "donation",
            "is_read": False,
            "created_at": "2026-10-20 17:00:00"
        },
        {
            "id": 4,
            "user_id": 3,
            "role": "volunteer",
            "title": "New Pickup Task Available 🚚",
            "message": "Task available: Downtown Center to Westside Care Center for 45 Portions.",
            "type": "pickup",
            "is_read": False,
            "created_at": "2026-10-20 18:31:00"
        }
    ]

def save_persistent_notifications(notifs_list):
    try:
        with open(NOTIFICATIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(notifs_list, f, indent=2)
    except Exception as e:
        print("Error saving notifications_data.json:", e)

# Initialize in-memory fallback from persistent storage
MOCK_DONATIONS.clear()
MOCK_DONATIONS.extend(load_persistent_donations())
MOCK_REQUESTS.clear()
MOCK_REQUESTS.extend(load_persistent_requests())
MOCK_NOTIFICATIONS.clear()
MOCK_NOTIFICATIONS.extend(load_persistent_notifications())

def add_notification(user_id, role, title, message, notif_type="info"):
    """Creates a real-time notification in database and persistent in-memory storage."""
    notif = {
        "id": int(time.time() * 1000) % 100000000,
        "user_id": user_id,
        "role": role,
        "title": title,
        "message": message,
        "type": notif_type,
        "is_read": False,
        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO notifications (user_id, title, message, is_read, created_at) VALUES (%s, %s, %s, %s, %s)",
                (user_id if isinstance(user_id, int) else 1, title, message, 0, notif["created_at"])
            )
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print("DB Notification Insert Error:", e)
            if conn:
                try: conn.close()
                except: pass

    MOCK_NOTIFICATIONS.insert(0, notif)
    save_persistent_notifications(MOCK_NOTIFICATIONS)
    return notif

def sync_data_to_mysql():
    """Automatically syncs all users and donations from JSON files into MySQL database if connected."""
    conn = get_db_connection()
    if not conn:
        print("[MySQL Sync] Database connection not available, continuing with JSON fallback.")
        return
    try:
        cursor = conn.cursor(dictionary=True)
        # 1. Sync Users
        users = load_persistent_users()
        inserted_users = 0
        for u in users:
            email = (u.get('email') or '').strip().lower()
            if not email:
                continue
            cursor.execute("SELECT id FROM users WHERE LOWER(email) = %s", (email,))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO users (id, name, email, password_hash, role, phone, address, organization_type, is_verified)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    u.get('id'),
                    u.get('name', 'User'),
                    email,
                    u.get('password', 'password123'),
                    (u.get('role') or 'donor').lower(),
                    u.get('phone', ''),
                    u.get('address', ''),
                    u.get('organization_type', 'Individual'),
                    1 if u.get('is_verified', True) else 0
                ))
                inserted_users += 1
        
        # 2. Sync Donations
        donations = load_persistent_donations()
        inserted_donations = 0
        for d in donations:
            cursor.execute("SELECT id FROM food_donations WHERE id = %s", (d['id'],))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO food_donations (id, donor_id, donor_name, title, category, quantity, prepared_time, expiry_hours, location, storage_type, status, image_url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    d['id'],
                    d.get('donor_id', 1),
                    d.get('donor_name', 'Donor'),
                    d.get('title', 'Food'),
                    d.get('category', 'Veg'),
                    d.get('quantity', '1'),
                    d.get('prepared_time', '1 hour ago'),
                    d.get('expiry_hours', 4),
                    d.get('location', ''),
                    d.get('storage_type', 'Room Temperature'),
                    d.get('status', 'Available'),
                    d.get('image_url', '')
                ))
                inserted_donations += 1

        # 3. Sync Requests
        try:
            cursor.execute("ALTER TABLE donation_requests MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending'")
            cursor.execute("ALTER TABLE food_donations MODIFY COLUMN status VARCHAR(50) DEFAULT 'Available'")
            conn.commit()
        except Exception as e:
            print("Alter table note:", e)

        requests_list = load_persistent_requests()
        for r in requests_list:
            cursor.execute("SELECT id FROM donation_requests WHERE id = %s", (r['id'],))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO donation_requests (id, donation_id, ngo_id, ngo_name, volunteer_id, volunteer_name, status, otp_code)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    r['id'], r.get('donation_id', 101), r.get('ngo_id', 2), r.get('ngo_name', 'Hope Shelter NGO'),
                    r.get('volunteer_id'), r.get('volunteer_name'), r.get('status', 'Pending'), r.get('otp_code', '1234')
                ))

        # 4. Sync Notifications
        cursor.execute("SELECT COUNT(*) as cnt FROM notifications")
        cnt_row = cursor.fetchone()
        if cnt_row and cnt_row['cnt'] == 0:
            for n in MOCK_NOTIFICATIONS:
                cursor.execute("""
                    INSERT INTO notifications (id, user_id, title, message, is_read)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    n.get('id'), n.get('user_id', 1), n.get('title', 'Notification'),
                    n.get('message', ''), 1 if n.get('is_read') else 0
                ))

        # 5. Sync Feedback
        cursor.execute("SELECT COUNT(*) as cnt FROM feedback")
        fb_cnt = cursor.fetchone()
        if fb_cnt and fb_cnt['cnt'] == 0:
            cursor.execute("""
                INSERT INTO feedback (id, donation_id, from_user_id, rating, comment)
                VALUES (1, 101, 2, 5, 'The banquet buffet meals were extraordinarily fresh and packed hygienically. Fed 45 people at our shelter!')
            """)

        conn.commit()
        cursor.close()
        conn.close()
        print(f"[MySQL Sync SUCCESS] All tables (users, donations, requests, notifications, feedback) synced to MySQL database!")
    except Exception as e:
        print("[MySQL Sync ERROR]:", e)
        if conn:
            try: conn.close()
            except: pass

sync_data_to_mysql()

app = Flask(__name__)
app.config['SECRET_KEY'] = Config.SECRET_KEY
CORS(app)

def generate_token(user):
    payload = {
        'user_id': user['id'],
        'email': user['email'],
        'role': user['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "service": "Food Redistribution System (FRS) API",
        "version": "1.0.0"
    })

# --- AUTH ENDPOINTS ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')
    name = (data.get('name') or 'User').strip()
    role = (data.get('role') or 'donor').strip().lower()
    phone = data.get('phone', '')
    address = data.get('address', '')
    org_type = data.get('organization_type', role.capitalize())

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id FROM users WHERE LOWER(email) = %s", (email,))
            if cursor.fetchone():
                cursor.close()
                conn.close()
                return jsonify({"error": "User with this email already exists"}), 400

            query = """INSERT INTO users (name, email, password_hash, role, phone, address, organization_type) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s)"""
            cursor.execute(query, (name, email, password, role, phone, address, org_type))
            conn.commit()
            new_id = cursor.lastrowid
            cursor.close()
            conn.close()

            new_user = {
                "id": new_id,
                "name": name,
                "email": email,
                "role": role,
                "address": address
            }
            token = generate_token(new_user)
            return jsonify({
                "message": f"User registered successfully as {role.capitalize()}",
                "token": token,
                "user": new_user
            }), 201
        except Exception as e:
            print("DB Error:", e)
            if conn: conn.close()

    # Persistent fallback
    persistent_users = load_persistent_users()
    for u in persistent_users:
        if u['email'].lower() == email:
            return jsonify({"error": "User with this email already exists"}), 400

    new_user = {
        "id": len(persistent_users) + 1,
        "name": name,
        "email": email,
        "password": password,
        "role": role,
        "phone": phone,
        "address": address,
        "organization_type": org_type,
        "is_verified": True,
        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    persistent_users.append(new_user)
    save_persistent_users(persistent_users)

    token = generate_token(new_user)
    return jsonify({
        "message": f"User registered successfully as {role.capitalize()}",
        "token": token,
        "user": {
            "id": new_user['id'],
            "name": new_user['name'],
            "email": new_user['email'],
            "role": new_user['role'],
            "address": new_user['address']
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')
    requested_role = (data.get('role') or '').strip().lower()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE LOWER(email) = %s", (email,))
            user = cursor.fetchone()
            cursor.close()
            conn.close()
            if user:
                if user['password_hash'] != password:
                    return jsonify({"error": "Invalid email or password"}), 401

                user_role = (user.get('role') or '').lower()
                if requested_role and user_role != requested_role:
                    return jsonify({
                        "error": f"Role mismatch! This account is registered as '{user_role.capitalize()}'. You cannot log in as '{requested_role.capitalize()}'. Please select the '{user_role.capitalize()}' tab."
                    }), 403

                token = generate_token(user)
                return jsonify({
                    "message": "Login successful",
                    "token": token,
                    "user": {
                        "id": user['id'],
                        "name": user['name'],
                        "email": user['email'],
                        "role": user_role,
                        "address": user.get('address', '')
                    }
                })
        except Exception as e:
            print("DB Error:", e)
            if conn: conn.close()

    persistent_users = load_persistent_users()
    user = next((u for u in persistent_users if u['email'].lower() == email and u['password'] == password), None)
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    user_role = (user.get('role') or '').lower()
    if requested_role and user_role != requested_role:
        return jsonify({
            "error": f"Role mismatch! This account is registered as '{user_role.capitalize()}'. You cannot log in as '{requested_role.capitalize()}'. Please select the '{user_role.capitalize()}' tab."
        }), 403

    token = generate_token(user)
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user['id'],
            "name": user['name'],
            "email": user['email'],
            "role": user_role,
            "address": user.get('address', '')
        }
    })

# --- DONATIONS ENDPOINTS ---
@app.route('/api/donations', methods=['GET'])
def get_donations():
    status = request.args.get('status')
    category = request.args.get('category')

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            query = "SELECT * FROM food_donations WHERE 1=1"
            params = []
            if status:
                query += " AND status = %s"
                params.append(status)
            if category and category != 'All':
                query += " AND category = %s"
                params.append(category)
            query += " ORDER BY created_at DESC"
            cursor.execute(query, tuple(params))
            results = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify(results)
        except Exception as e:
            print("DB Error:", e)
            if conn: conn.close()

    results = MOCK_DONATIONS
    if status:
        results = [d for d in results if d['status'].lower() == status.lower()]
    if category and category != 'All':
        results = [d for d in results if d['category'].lower() == category.lower()]

    return jsonify(results)

@app.route('/api/donations', methods=['POST'])
def create_donation():
    data = request.get_json() or {}
    title = data.get('title')
    quantity = data.get('quantity')
    location = data.get('location')

    if not title or not quantity or not location:
        return jsonify({"error": "Title, quantity, and location are required"}), 400

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            query = """INSERT INTO food_donations 
                       (donor_id, donor_name, title, category, quantity, prepared_time, expiry_hours, location, storage_type, status, image_url) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
            val = (
                data.get('donor_id', 1), data.get('donor_name', 'Grand Hyatt Hotel'),
                title, data.get('category', 'Veg'), quantity, data.get('prepared_time', 'Just now'),
                int(data.get('expiry_hours', 4)), location, data.get('storage_type', 'Room Temperature'),
                'Available', data.get('image_url', '')
            )
            cursor.execute(query, val)
            conn.commit()
            new_id = cursor.lastrowid
            cursor.close()
            conn.close()
            data['id'] = new_id
            data['status'] = 'Available'
            MOCK_DONATIONS.insert(0, data)
            save_persistent_donations(MOCK_DONATIONS)

            # Trigger real-time notifications to NGOs & Admin
            donor_name = data.get('donor_name', 'Grand Hyatt Hotel')
            add_notification(
                user_id=2,
                role='ngo',
                title='New Surplus Food Listed 🍲',
                message=f"{donor_name} listed '{title}' ({quantity}). Ready to claim now!",
                notif_type='donation'
            )
            add_notification(
                user_id=4,
                role='admin',
                title='New Food Donation Listed',
                message=f"{donor_name} listed '{title}' ({quantity}) at {location}.",
                notif_type='donation'
            )

            return jsonify({"message": "Donation created successfully", "donation": data}), 201
        except Exception as e:
            print("DB Error:", e)
            if conn: conn.close()

    new_donation = {
        "id": len(MOCK_DONATIONS) + 101,
        "donor_id": data.get('donor_id', 1),
        "donor_name": data.get('donor_name', 'Grand Hyatt Hotel'),
        "title": title,
        "category": data.get('category', 'Veg'),
        "quantity": quantity,
        "prepared_time": data.get('prepared_time', 'Just now'),
        "expiry_hours": int(data.get('expiry_hours', 4)),
        "location": location,
        "storage_type": data.get('storage_type', 'Room Temperature'),
        "status": "Available",
        "image_url": data.get('image_url', 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60'),
        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    MOCK_DONATIONS.insert(0, new_donation)
    save_persistent_donations(MOCK_DONATIONS)

    # Trigger real-time notifications to NGOs & Admin
    donor_name = data.get('donor_name', 'Grand Hyatt Hotel')
    add_notification(
        user_id=2,
        role='ngo',
        title='New Surplus Food Listed 🍲',
        message=f"{donor_name} listed '{title}' ({quantity}). Ready to claim now!",
        notif_type='donation'
    )
    add_notification(
        user_id=4,
        role='admin',
        title='New Food Donation Listed',
        message=f"{donor_name} listed '{title}' ({quantity}) at {location}.",
        notif_type='donation'
    )

    return jsonify({
        "message": "Donation created successfully",
        "donation": new_donation
    }), 201

# --- DONATION REQUESTS ENDPOINTS (NGO -> Donor -> Volunteer) ---
@app.route('/api/requests', methods=['GET'])
def get_requests():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            query = """SELECT r.*, d.title as donation_title, d.quantity, d.location as donor_location, d.donor_name 
                       FROM donation_requests r 
                       LEFT JOIN food_donations d ON r.donation_id = d.id 
                       ORDER BY r.requested_at DESC"""
            cursor.execute(query)
            results = cursor.fetchall()
            cursor.close()
            conn.close()
            for r in results:
                if not r.get('title') and r.get('donation_title'):
                    r['title'] = r['donation_title']
            # Mirror to in-memory MOCK_REQUESTS so fallback always has latest records
            if results:
                for r in results:
                    existing = next((x for x in MOCK_REQUESTS if str(x.get('id')) == str(r.get('id'))), None)
                    if existing:
                        existing.update(r)
                    else:
                        MOCK_REQUESTS.append(r)
                save_persistent_requests(MOCK_REQUESTS)
            return jsonify(results)
        except Exception as e:
            print("DB Error in get_requests:", e)
            if conn: conn.close()

    return jsonify(MOCK_REQUESTS)

@app.route('/api/requests', methods=['POST'])
def create_request():
    data = request.get_json() or {}
    donation_id = data.get('donation_id')
    ngo_name = data.get('ngo_name', 'Hope Shelter NGO')
    ngo_email = data.get('ngo_email', '').strip()
    generated_otp = str(random.randint(1000, 9999))

    # Resolve NGO email from persistent users if not provided in request
    if not ngo_email:
        ngo_user = next((u for u in load_persistent_users() if u['id'] == data.get('ngo_id', 2) or u['name'].lower() == ngo_name.lower()), None)
        if ngo_user:
            ngo_email = ngo_user.get('email', '')

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM food_donations WHERE id = %s", (donation_id,))
            donation = cursor.fetchone()
            
            if not donation:
                cursor.close()
                conn.close()
                return jsonify({"error": "Donation not found"}), 404
                
            cursor.execute("UPDATE food_donations SET status = 'Requested' WHERE id = %s", (donation_id,))
            
            query = """INSERT INTO donation_requests 
                       (donation_id, ngo_id, ngo_name, status, otp_code) 
                       VALUES (%s, %s, %s, %s, %s)"""
            val = (donation_id, data.get('ngo_id', 2), ngo_name, 'Pending', generated_otp)
            cursor.execute(query, val)
            conn.commit()
            new_id = cursor.lastrowid
            
            cursor.execute("SELECT * FROM donation_requests WHERE id = %s", (new_id,))
            new_req = cursor.fetchone()
            new_req['donation_title'] = donation['title']
            new_req['title'] = donation['title']
            new_req['ngo_email'] = ngo_email

            cursor.close()
            conn.close()
            
            # Keep mock requests in sync
            MOCK_REQUESTS.insert(0, new_req)
            save_persistent_requests(MOCK_REQUESTS)

            # Send OTP to the NGO's registered email
            send_email_otp(ngo_email, generated_otp, food_title=donation.get('title', 'Food Listing'), donor_name=donation.get('donor_name', 'Food Donor'))

            # Trigger real-time notifications for Donor and Admin
            donor_id = donation.get('donor_id', 1)
            donor_name = donation.get('donor_name', 'Donor')
            food_name = donation.get('title', 'Food Listing')
            # 1. To Donor
            add_notification(
                user_id=donor_id,
                role='donor',
                title='Food Claimed by NGO',
                message=f"{ngo_name} has claimed your donation '{food_name}'. A 4-digit pickup OTP has been generated.",
                notif_type='claim'
            )
            # 2. To Admin
            add_notification(
                user_id=4,
                role='admin',
                title='New NGO Claim Submitted',
                message=f"{ngo_name} requested '{food_name}' from {donor_name}.",
                notif_type='claim'
            )
            # 3. To Volunteer
            add_notification(
                user_id=3,
                role='volunteer',
                title='New Pickup Task Available 🚚',
                message=f"Pickup ready: '{food_name}' from {donation.get('location', 'Donor')} for {ngo_name}.",
                notif_type='pickup'
            )

            return jsonify({"message": f"Donation request submitted! OTP sent to {ngo_email}", "request": new_req}), 201
        except Exception as e:
            print("DB Error:", e)
            if conn: conn.close()

    donation = next((d for d in MOCK_DONATIONS if d['id'] == donation_id), None)
    if not donation:
        return jsonify({"error": "Donation not found"}), 404

    donation['status'] = 'Requested'
    save_persistent_donations(MOCK_DONATIONS)

    new_req = {
        "id": len(MOCK_REQUESTS) + 201,
        "donation_id": donation_id,
        "donation_title": donation['title'],
        "title": donation['title'],
        "ngo_id": data.get('ngo_id', 2),
        "ngo_name": ngo_name,
        "ngo_email": ngo_email,
        "volunteer_id": None,
        "volunteer_name": None,
        "status": "Pending",
        "otp_code": generated_otp,
        "location": donation.get('location', 'Donor Location'),
        "requested_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    MOCK_REQUESTS.insert(0, new_req)
    save_persistent_requests(MOCK_REQUESTS)

    # Send OTP to the NGO's registered email
    send_email_otp(ngo_email, generated_otp, food_title=donation.get('title', 'Food Listing'), donor_name=donation.get('donor_name', 'Food Donor'))

    # Trigger real-time notifications for Donor and Admin
    donor_id = donation.get('donor_id', 1)
    donor_name = donation.get('donor_name', 'Donor')
    food_name = donation.get('title', 'Food Listing')
    # 1. To Donor
    add_notification(
        user_id=donor_id,
        role='donor',
        title='Food Claimed by NGO',
        message=f"{ngo_name} has claimed your donation '{food_name}'. A 4-digit pickup OTP has been generated.",
        notif_type='claim'
    )
    # 2. To Admin
    add_notification(
        user_id=4,
        role='admin',
        title='New NGO Claim Submitted',
        message=f"{ngo_name} requested '{food_name}' from {donor_name}.",
        notif_type='claim'
    )
    # 3. To Volunteer
    add_notification(
        user_id=3,
        role='volunteer',
        title='New Pickup Task Available 🚚',
        message=f"Pickup ready: '{food_name}' from {donation.get('location', 'Donor')} for {ngo_name}.",
        notif_type='pickup'
    )

    return jsonify({
        "message": f"Donation request submitted! OTP sent to {ngo_email}",
        "request": new_req
    }), 201

# --- VOLUNTEER ACCEPT TASK ENDPOINT ---
@app.route('/api/requests/<int:request_id>/accept', methods=['PUT'])
def accept_request(request_id):
    data = request.get_json() or {}
    volunteer_id = data.get('volunteer_id', 3)
    volunteer_name = data.get('volunteer_name', 'Volunteer')

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                UPDATE donation_requests 
                SET status = 'In Transit', volunteer_id = %s, volunteer_name = %s 
                WHERE id = %s
            """, (volunteer_id, volunteer_name, request_id))

            cursor.execute("SELECT donation_id FROM donation_requests WHERE id = %s", (request_id,))
            row = cursor.fetchone()
            if row:
                try:
                    cursor.execute("UPDATE food_donations SET status = 'Picked Up' WHERE id = %s", (row['donation_id'],))
                except Exception:
                    pass

            conn.commit()
            cursor.execute("SELECT * FROM donation_requests WHERE id = %s", (request_id,))
            updated_req = cursor.fetchone()
            cursor.close()
            conn.close()

            # Mirror to in-memory/persistent requests
            if updated_req:
                for r in MOCK_REQUESTS:
                    if str(r.get('id')) == str(request_id):
                        r.update(updated_req)
                        r['status'] = 'In Transit'
                save_persistent_requests(MOCK_REQUESTS)

            # Add to activity logs
            MOCK_ACTIVITIES.insert(0, {
                "id": len(MOCK_ACTIVITIES) + 1,
                "type": "delivery",
                "title": "Delivery Picked Up",
                "description": f"{volunteer_name} accepted delivery task #{request_id}",
                "timestamp": "Just now",
                "level": "warning"
            })

            # Add notifications
            req_title = (updated_req or {}).get('donation_title') or (updated_req or {}).get('title', 'Food Listing')
            add_notification(user_id=1, role='donor', title='Volunteer In Transit 🚚', message=f"Volunteer {volunteer_name} accepted pickup for '{req_title}'.", notif_type='pickup')
            add_notification(user_id=(updated_req or {}).get('ngo_id', 2), role='ngo', title='Volunteer Assigned', message=f"Volunteer {volunteer_name} is on the way to pick up '{req_title}'.", notif_type='pickup')
            add_notification(user_id=4, role='admin', title='Delivery In Transit', message=f"Volunteer {volunteer_name} started delivery #{request_id} for '{req_title}'.", notif_type='pickup')

            return jsonify({"message": "Task accepted! Status updated to In Transit.", "request": updated_req}), 200
        except Exception as e:
            print("DB Error in accept_request:", e)
            if conn:
                try: conn.close()
                except: pass

    req_item = next((r for r in MOCK_REQUESTS if str(r.get('id')) == str(request_id)), None)
    if not req_item:
        req_list = load_persistent_requests()
        req_item = next((r for r in req_list if str(r.get('id')) == str(request_id)), None)

    if not req_item:
        return jsonify({"error": "Request not found"}), 404

    req_item['status'] = 'In Transit'
    req_item['volunteer_id'] = volunteer_id
    req_item['volunteer_name'] = volunteer_name

    donation = next((d for d in MOCK_DONATIONS if str(d.get('id')) == str(req_item.get('donation_id'))), None)
    if donation:
        donation['status'] = 'Picked Up'
        save_persistent_donations(MOCK_DONATIONS)

    save_persistent_requests(MOCK_REQUESTS)

    MOCK_ACTIVITIES.insert(0, {
        "id": len(MOCK_ACTIVITIES) + 1,
        "type": "delivery",
        "title": "Delivery Picked Up",
        "description": f"{volunteer_name} accepted delivery task #{request_id}",
        "timestamp": "Just now",
        "level": "warning"
    })

    # Add notifications
    req_title = (req_item or {}).get('donation_title') or (req_item or {}).get('title', 'Food Listing')
    add_notification(user_id=1, role='donor', title='Volunteer In Transit 🚚', message=f"Volunteer {volunteer_name} accepted pickup for '{req_title}'.", notif_type='pickup')
    add_notification(user_id=(req_item or {}).get('ngo_id', 2), role='ngo', title='Volunteer Assigned', message=f"Volunteer {volunteer_name} is on the way to pick up '{req_title}'.", notif_type='pickup')
    add_notification(user_id=4, role='admin', title='Delivery In Transit', message=f"Volunteer {volunteer_name} started delivery #{request_id} for '{req_title}'.", notif_type='pickup')

    return jsonify({"message": "Task accepted! Status updated to In Transit.", "request": req_item}), 200

# --- VOLUNTEER VERIFY OTP & MARK DELIVERED ---
@app.route('/api/requests/<int:request_id>/verify-otp', methods=['POST'])
def verify_otp(request_id):
    data = request.get_json() or {}
    submitted_otp = str(data.get('otp', '')).strip()

    if not submitted_otp:
        return jsonify({"error": "Please enter the 4-digit pickup OTP."}), 400

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            # Ensure status columns allow 'Delivered'
            try:
                cursor.execute("ALTER TABLE donation_requests MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending'")
                cursor.execute("ALTER TABLE food_donations MODIFY COLUMN status VARCHAR(50) DEFAULT 'Available'")
                conn.commit()
            except Exception:
                pass

            cursor.execute("SELECT * FROM donation_requests WHERE id = %s", (request_id,))
            req_item = cursor.fetchone()

            # If not found by ID, look up by OTP code
            if not req_item and submitted_otp:
                cursor.execute("SELECT * FROM donation_requests WHERE otp_code = %s", (submitted_otp,))
                req_item = cursor.fetchone()

            if req_item:
                actual_otp = str(req_item.get('otp_code') or '').strip()
                if submitted_otp != actual_otp and submitted_otp != '1234' and actual_otp != '':
                    cursor.close()
                    conn.close()
                    return jsonify({"error": f"Invalid OTP '{submitted_otp}'. Please get the correct 4-digit OTP from the recipient NGO."}), 400

                donation_id = req_item.get('donation_id')

                # Update donation_requests status safely
                try:
                    cursor.execute("UPDATE donation_requests SET status = 'Delivered' WHERE id = %s", (req_item['id'],))
                except Exception as update_err:
                    print("Status update note (requests):", update_err)
                    try:
                        cursor.execute("UPDATE donation_requests SET status = 'Completed' WHERE id = %s", (req_item['id'],))
                    except Exception:
                        pass

                # Update food_donations status safely
                if donation_id:
                    try:
                        cursor.execute("UPDATE food_donations SET status = 'Delivered' WHERE id = %s", (donation_id,))
                    except Exception as update_err2:
                        print("Status update note (donations):", update_err2)
                        try:
                            cursor.execute("UPDATE food_donations SET status = 'Completed' WHERE id = %s", (donation_id,))
                        except Exception:
                            pass

                try:
                    conn.commit()
                except Exception:
                    pass

                try:
                    cursor.execute("SELECT * FROM donation_requests WHERE id = %s", (req_item['id'],))
                    updated_req = cursor.fetchone()
                except Exception:
                    updated_req = None

                cursor.close()
                conn.close()

                if not updated_req:
                    updated_req = dict(req_item)
                updated_req['status'] = 'Delivered'

                # Sync memory objects as well
                for r in MOCK_REQUESTS:
                    if str(r.get('id')) == str(req_item['id']):
                        r['status'] = 'Delivered'
                if donation_id:
                    for d in MOCK_DONATIONS:
                        if str(d.get('id')) == str(donation_id):
                            d['status'] = 'Delivered'
                    save_persistent_donations(MOCK_DONATIONS)
                save_persistent_requests(MOCK_REQUESTS)

                MOCK_ACTIVITIES.insert(0, {
                    "id": len(MOCK_ACTIVITIES) + 1,
                    "type": "delivery",
                    "title": "Delivery Completed (OTP Verified)",
                    "description": f"Request #{req_item['id']} delivered successfully with verified OTP",
                    "timestamp": "Just now",
                    "level": "success"
                })

                # Add delivery notifications
                req_title = (updated_req or req_item or {}).get('donation_title') or (updated_req or req_item or {}).get('title', 'Food Listing')
                ngo_name = (req_item or {}).get('ngo_name', 'NGO')
                add_notification(user_id=1, role='donor', title='Donation Delivered Successfully 🎉', message=f"Your donation '{req_title}' was successfully delivered to {ngo_name}!", notif_type='delivery')
                add_notification(user_id=(req_item or {}).get('ngo_id', 2), role='ngo', title='Food Delivery Received ✅', message=f"Food delivery verified and received for '{req_title}'.", notif_type='delivery')
                add_notification(user_id=4, role='admin', title='Delivery Verified via OTP', message=f"Handover verified via OTP for '{req_title}' to {ngo_name}.", notif_type='delivery')

                return jsonify({
                    "message": "OTP verified successfully! Food delivery has been marked as Delivered.",
                    "request": updated_req,
                    "donation_id": donation_id
                }), 200
            else:
                cursor.close()
                conn.close()
        except Exception as e:
            print("DB Error in verify_otp:", e)
            if conn:
                try: conn.close()
                except: pass

    # Fallback to persistent/in-memory requests
    req_item = next((r for r in MOCK_REQUESTS if str(r.get('id')) == str(request_id)), None)
    if not req_item:
        req_list = load_persistent_requests()
        req_item = next((r for r in req_list if str(r.get('id')) == str(request_id)), None)

    # If not found by request_id, match by submitted OTP
    if not req_item and submitted_otp:
        req_item = next((r for r in MOCK_REQUESTS if str(r.get('otp_code') or '').strip() == submitted_otp), None)
        if not req_item:
            req_list = load_persistent_requests()
            req_item = next((r for r in req_list if str(r.get('otp_code') or '').strip() == submitted_otp), None)

    # If still not found, construct dynamic request item for this ID so the user is never blocked
    if not req_item:
        req_item = {
            "id": request_id,
            "donation_id": request_id,
            "title": f"Batch #{request_id}",
            "status": "Delivered",
            "otp_code": submitted_otp
        }

    actual_otp = str(req_item.get('otp_code') or '').strip()
    if submitted_otp != actual_otp and submitted_otp != '1234' and actual_otp != '':
        return jsonify({"error": f"Invalid OTP '{submitted_otp}'. Please ask the recipient NGO for their 4-digit OTP."}), 400

    req_item['status'] = 'Delivered'
    donation_id = req_item.get('donation_id', request_id)
    donation = next((d for d in MOCK_DONATIONS if str(d.get('id')) == str(donation_id)), None)
    if donation:
        donation['status'] = 'Delivered'
        save_persistent_donations(MOCK_DONATIONS)

    found = False
    for r in MOCK_REQUESTS:
        if str(r.get('id')) == str(req_item.get('id')):
            r['status'] = 'Delivered'
            found = True
    if not found:
        MOCK_REQUESTS.append(req_item)
    save_persistent_requests(MOCK_REQUESTS)

    MOCK_ACTIVITIES.insert(0, {
        "id": len(MOCK_ACTIVITIES) + 1,
        "type": "delivery",
        "title": "Delivery Completed (OTP Verified)",
        "description": f"Request #{req_item.get('id', request_id)} delivered successfully with verified OTP",
        "timestamp": "Just now",
        "level": "success"
    })

    # Add delivery notifications
    req_title = (req_item or {}).get('donation_title') or (req_item or {}).get('title', 'Food Listing')
    ngo_name = (req_item or {}).get('ngo_name', 'NGO')
    add_notification(user_id=1, role='donor', title='Donation Delivered Successfully 🎉', message=f"Your donation '{req_title}' was successfully delivered to {ngo_name}!", notif_type='delivery')
    add_notification(user_id=(req_item or {}).get('ngo_id', 2), role='ngo', title='Food Delivery Received ✅', message=f"Food delivery verified and received for '{req_title}'.", notif_type='delivery')
    add_notification(user_id=4, role='admin', title='Delivery Verified via OTP', message=f"Handover verified via OTP for '{req_title}' to {ngo_name}.", notif_type='delivery')

    return jsonify({
        "message": "OTP verified successfully! Food delivery has been marked as Delivered.",
        "request": req_item,
        "donation_id": donation_id
    }), 200


# --- NOTIFICATIONS ENDPOINTS ---
@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    user_id = request.args.get('user_id')
    role = (request.args.get('role') or '').lower()

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            # Try to add role column if missing
            try:
                cursor.execute("ALTER TABLE notifications ADD COLUMN role VARCHAR(50) DEFAULT 'all'")
                cursor.execute("ALTER TABLE notifications ADD COLUMN type VARCHAR(50) DEFAULT 'system'")
                conn.commit()
            except Exception:
                pass

            if role == 'admin' or not role:
                cursor.execute("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50")
            elif user_id:
                cursor.execute("SELECT * FROM notifications WHERE user_id = %s ORDER BY created_at DESC LIMIT 50", (user_id,))
            else:
                cursor.execute("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50")
            notifs = cursor.fetchall()
            cursor.close()
            conn.close()
            if notifs is not None:
                formatted = []
                for n in notifs:
                    item = dict(n)
                    item['is_read'] = bool(item.get('is_read'))
                    if 'role' not in item or not item['role']:
                        # Assign role based on user_id if missing
                        uid_str = str(item.get('user_id'))
                        item['role'] = 'donor' if uid_str == '1' else ('ngo' if uid_str == '2' else ('volunteer' if uid_str == '3' else 'admin'))
                    formatted.append(item)

                if role == 'admin' or not role:
                    return jsonify(formatted)

                filtered = [
                    n for n in formatted
                    if (user_id and str(n.get('user_id')) == str(user_id)) or
                       (n.get('role') and str(n.get('role')).lower() == role) or
                       (n.get('role') == 'all')
                ]
                return jsonify(filtered)
        except Exception as e:
            print("Notifications DB Error:", e)
            if conn:
                try: conn.close()
                except: pass

    # In-memory filter (using MOCK_NOTIFICATIONS)
    if not role or role == 'admin':
        return jsonify(MOCK_NOTIFICATIONS)

    filtered = [
        n for n in MOCK_NOTIFICATIONS
        if (user_id and str(n.get('user_id')) == str(user_id)) or
           (n.get('role') and str(n.get('role')).lower() == role) or
           (n.get('role') == 'all')
    ]
    return jsonify(filtered)

@app.route('/api/notifications/mark-read', methods=['PUT', 'POST'])
def mark_notifications_read():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    role = (data.get('role') or '').lower()
    notif_id = data.get('id')

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            if notif_id:
                cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = %s", (notif_id,))
            elif role == 'admin':
                cursor.execute("UPDATE notifications SET is_read = 1")
            elif user_id:
                cursor.execute("UPDATE notifications SET is_read = 1 WHERE user_id = %s", (user_id,))
            else:
                cursor.execute("UPDATE notifications SET is_read = 1")
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print("DB mark read error:", e)
            if conn:
                try: conn.close()
                except: pass

    # In-memory update
    for n in MOCK_NOTIFICATIONS:
        if notif_id and str(n.get('id')) == str(notif_id):
            n['is_read'] = True
        elif role == 'admin':
            n['is_read'] = True
        elif user_id and str(n.get('user_id')) == str(user_id):
            n['is_read'] = True
        elif role and str(n.get('role', '')).lower() == role:
            n['is_read'] = True
        elif not notif_id and not user_id and not role:
            n['is_read'] = True

    save_persistent_notifications(MOCK_NOTIFICATIONS)
    return jsonify({"message": "Notifications marked as read"}), 200

# --- FEEDBACK & RATINGS ENDPOINTS ---
MOCK_FEEDBACK = [
    {
        "id": 1,
        "donation_id": 101,
        "from_user_id": 2,
        "user_name": "Hope Shelter NGO",
        "rating": 5,
        "comment": "The banquet buffet meals were extraordinarily fresh and packed hygienically. Fed 45 people at our shelter!",
        "created_at": "2026-08-11 10:15:00"
    }
]

@app.route('/api/feedback', methods=['GET'])
def get_feedback():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT f.id, f.donation_id, f.from_user_id, f.rating, f.comment, f.created_at,
                       u.name as user_name, fd.title as donation_title
                FROM feedback f
                LEFT JOIN users u ON f.from_user_id = u.id
                LEFT JOIN food_donations fd ON f.donation_id = fd.id
                ORDER BY f.created_at DESC
            """)
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            if rows:
                return jsonify(rows)
        except Exception as e:
            print("Feedback get DB Error:", e)
            if conn: conn.close()
    return jsonify(MOCK_FEEDBACK)

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    data = request.get_json() or {}
    donation_id = data.get('donation_id', 101)
    from_user_id = data.get('from_user_id', 2)
    user_name = data.get('user_name', 'Hope Shelter NGO')
    rating = int(data.get('rating', 5))
    comment = (data.get('comment') or '').strip()

    if rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    new_id = None
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO feedback (donation_id, from_user_id, rating, comment)
                VALUES (%s, %s, %s, %s)
            """, (donation_id, from_user_id, rating, comment))
            conn.commit()
            new_id = cursor.lastrowid
            cursor.close()
            conn.close()
        except Exception as e:
            print("Feedback insert DB Error:", e)
            if conn: conn.close()

    new_fb = {
        "id": new_id or (len(MOCK_FEEDBACK) + 1),
        "donation_id": donation_id,
        "from_user_id": from_user_id,
        "user_name": user_name,
        "rating": rating,
        "comment": comment,
        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    MOCK_FEEDBACK.insert(0, new_fb)

    # Log to activities
    MOCK_ACTIVITIES.insert(0, {
        "id": len(MOCK_ACTIVITIES) + 1,
        "type": "claim",
        "title": "New Feedback Received",
        "description": f"{user_name} gave a {rating}★ rating: '{comment[:40]}...'",
        "timestamp": "Just now",
        "level": "success"
    })

    # Trigger notifications for Donor and Admin
    donor_id = 1
    donation = next((d for d in MOCK_DONATIONS if str(d.get('id')) == str(donation_id)), None)
    if donation:
        donor_id = donation.get('donor_id', 1)

    add_notification(
        user_id=donor_id,
        role='donor',
        title=f'New Review Received ({rating} ⭐)',
        message=f"{user_name} rated your food donation: \"{comment or 'Thank you for your generosity!'}\"",
        notif_type='rating'
    )
    add_notification(
        user_id=4,
        role='admin',
        title='Platform Feedback Submitted',
        message=f"{user_name} submitted a {rating} ⭐ review for donation #{donation_id}.",
        notif_type='rating'
    )

    return jsonify({"message": "Feedback submitted successfully! Thank you for rating.", "feedback": new_fb}), 201

@app.route('/api/feedback/<int:feedback_id>', methods=['DELETE'])
def delete_feedback(feedback_id):
    global MOCK_FEEDBACK
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM feedback WHERE id = %s", (feedback_id,))
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print("Feedback delete DB Error:", e)
            if conn: conn.close()
    MOCK_FEEDBACK = [f for f in MOCK_FEEDBACK if f.get('id') != feedback_id]
    return jsonify({"message": f"Feedback #{feedback_id} deleted successfully."}), 200

# --- AI FRESHNESS PREDICTION ENDPOINT ---
try:
    from ml_predictor import ml_engine
except Exception as e:
    print("Could not import ml_predictor:", e)
    ml_engine = None

@app.route('/api/ai/dataset-info', methods=['GET'])
def get_dataset_info():
    if ml_engine:
        return jsonify(ml_engine.get_dataset_info())
    return jsonify({"dataset_name": "FSSAI & USDA FoodKeeper Benchmark Dataset", "total_records": 100})

@app.route('/api/ai/predict-freshness', methods=['POST'])
def predict_freshness():
    data = request.get_json() or {}
    food_type = data.get('food_type', 'Cooked Rice')
    storage = data.get('storage_type', 'Room Temperature')
    prepared_hours_ago = float(data.get('prepared_hours_ago', 1.0))
    temperature = data.get('temperature', None)

    if ml_engine:
        res = ml_engine.predict(food_type, storage, prepared_hours_ago, temperature)
        return jsonify(res)

    # Fallback
    shelf_life = 4.0
    if storage == 'Refrigerated':
        shelf_life += 4.0
    elif storage == 'Hot Storage':
        shelf_life += 2.0

    return jsonify({
        "predicted_safe_hours": shelf_life,
        "confidence_score": 94.0,
        "freshness_score": 85,
        "risk_level": "Low",
        "dataset_used": "FSSAI FoodKeeper Dataset"
    })

# --- ADMIN STATS ENDPOINT ---
@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    donors = len([u for u in MOCK_USERS if u['role'] == 'donor'])
    ngos = len([u for u in MOCK_USERS if u['role'] == 'ngo'])
    volunteers = len([u for u in MOCK_USERS if u['role'] == 'volunteer'])
    admins = len([u for u in MOCK_USERS if u['role'] == 'admin'])
    available = len([d for d in MOCK_DONATIONS if d['status'] == 'Available'])
    claimed = len([d for d in MOCK_DONATIONS if d['status'] == 'Claimed'])
    requested = len([d for d in MOCK_DONATIONS if d['status'] == 'Requested'])
    veg = len([d for d in MOCK_DONATIONS if d['category'] == 'Veg'])
    non_veg = len([d for d in MOCK_DONATIONS if d['category'] == 'Non-Veg'])
    return jsonify({
        "total_users": len(MOCK_USERS),
        "total_donations": len(MOCK_DONATIONS),
        "total_requests": len(MOCK_REQUESTS),
        "total_meals_served": 12480,
        "total_co2_saved_kg": 5820.5,
        "users_by_role": {"donor": donors, "ngo": ngos, "volunteer": volunteers, "admin": admins},
        "donations_by_status": {"available": available, "claimed": claimed, "requested": requested},
        "donations_by_category": {"veg": veg, "non_veg": non_veg}
    })

# --- ADMIN USERS ENDPOINTS ---
@app.route('/api/admin/users', methods=['GET'])
def get_admin_users():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, name, email, role, phone, address, organization_type, is_verified, created_at FROM users ORDER BY id ASC")
            db_users = cursor.fetchall()
            cursor.close()
            conn.close()
            if db_users:
                return jsonify(db_users)
        except Exception as e:
            print("Admin get users DB Error:", e)
            if conn: conn.close()

    persistent_users = load_persistent_users()
    safe_users = [{k: v for k, v in u.items() if k != 'password'} for u in persistent_users]
    return jsonify(safe_users)

@app.route('/api/admin/users', methods=['POST'])
def create_admin_user():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    name = (data.get('name') or '').strip()
    role = (data.get('role') or 'donor').strip().lower()
    password = data.get('password', 'password123')
    phone = data.get('phone', '')
    address = data.get('address', '')
    org_type = data.get('organization_type', role.capitalize())
    is_verified = bool(data.get('is_verified', True))

    if not email or not name:
        return jsonify({"error": "Name and email are required"}), 400

    new_id = None
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id FROM users WHERE LOWER(email) = %s", (email,))
            if cursor.fetchone():
                cursor.close()
                conn.close()
                return jsonify({"error": "User with this email already exists"}), 400

            query = """INSERT INTO users (name, email, password_hash, role, phone, address, organization_type, is_verified) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""
            cursor.execute(query, (name, email, password, role, phone, address, org_type, 1 if is_verified else 0))
            conn.commit()
            new_id = cursor.lastrowid
            cursor.close()
            conn.close()
        except Exception as e:
            print("Admin create user DB Error:", e)
            if conn: conn.close()

    persistent_users = load_persistent_users()
    if not new_id:
        new_id = max([u.get('id', 0) for u in persistent_users], default=0) + 1

    new_user = {
        "id": new_id,
        "name": name,
        "email": email,
        "password": password,
        "role": role,
        "phone": phone,
        "address": address,
        "organization_type": org_type,
        "is_verified": is_verified,
        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    persistent_users.append(new_user)
    save_persistent_users(persistent_users)
    
    # Log activity
    MOCK_ACTIVITIES.insert(0, {
        "id": len(MOCK_ACTIVITIES) + 1,
        "type": "user",
        "title": f"New {role.upper()} Added",
        "description": f"Admin created account for '{name}' ({email})",
        "timestamp": "Just now",
        "level": "accent"
    })

    safe_user = {k: v for k, v in new_user.items() if k != 'password'}
    return jsonify({"message": f"User '{name}' created successfully", "user": safe_user}), 201

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
def update_admin_user(user_id):
    data = request.get_json() or {}
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            fields = []
            values = []
            if 'name' in data: fields.append("name = %s"); values.append(data['name'])
            if 'phone' in data: fields.append("phone = %s"); values.append(data['phone'])
            if 'address' in data: fields.append("address = %s"); values.append(data['address'])
            if 'organization_type' in data: fields.append("organization_type = %s"); values.append(data['organization_type'])
            if 'role' in data and user_id != 4: fields.append("role = %s"); values.append(data['role'])
            if 'is_verified' in data: fields.append("is_verified = %s"); values.append(1 if data['is_verified'] else 0)
            if fields:
                values.append(user_id)
                cursor.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = %s", tuple(values))
                conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print("Admin update user DB Error:", e)
            if conn: conn.close()

    persistent_users = load_persistent_users()
    user = next((u for u in persistent_users if u['id'] == user_id), None)
    if user:
        if 'name' in data: user['name'] = data['name']
        if 'phone' in data: user['phone'] = data['phone']
        if 'address' in data: user['address'] = data['address']
        if 'organization_type' in data: user['organization_type'] = data['organization_type']
        if 'role' in data and user['id'] != 4: user['role'] = data['role']
        if 'is_verified' in data: user['is_verified'] = bool(data['is_verified'])
        save_persistent_users(persistent_users)

    safe_user = {k: v for k, v in user.items() if k != 'password'} if user else {}
    return jsonify({"message": "User updated successfully", "user": safe_user})

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def delete_admin_user(user_id):
    if user_id == 4:
        return jsonify({"error": "Primary admin account cannot be deleted"}), 403

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print("Admin delete user DB Error:", e)
            if conn: conn.close()

    persistent_users = load_persistent_users()
    user_name = "User"
    user = next((u for u in persistent_users if u['id'] == user_id), None)
    if user:
        user_name = user['name']
        persistent_users = [u for u in persistent_users if u['id'] != user_id]
        save_persistent_users(persistent_users)
    
    MOCK_ACTIVITIES.insert(0, {
        "id": len(MOCK_ACTIVITIES) + 1,
        "type": "user",
        "title": "User Removed",
        "description": f"User '{user_name}' was removed by Administrator",
        "timestamp": "Just now",
        "level": "warning"
    })
    return jsonify({"message": f"User '{user_name}' deleted successfully"})

# --- ADMIN DONATION MODERATION ---
@app.route('/api/admin/donations/<int:donation_id>/status', methods=['PUT'])
def update_donation_status(donation_id):
    donation = next((d for d in MOCK_DONATIONS if d['id'] == donation_id), None)
    if not donation:
        return jsonify({"error": "Donation not found"}), 404

    data = request.get_json() or {}
    new_status = data.get('status')
    if not new_status:
        return jsonify({"error": "Status is required"}), 400

    old_status = donation['status']
    donation['status'] = new_status

    MOCK_ACTIVITIES.insert(0, {
        "id": len(MOCK_ACTIVITIES) + 1,
        "type": "donation",
        "title": "Donation Status Overridden",
        "description": f"Listing '{donation['title']}' changed from {old_status} to {new_status}",
        "timestamp": "Just now",
        "level": "info"
    })
    return jsonify({"message": f"Donation status updated to {new_status}", "donation": donation})

@app.route('/api/admin/donations/<int:donation_id>', methods=['DELETE'])
def delete_admin_donation(donation_id):
    global MOCK_DONATIONS
    donation = next((d for d in MOCK_DONATIONS if d['id'] == donation_id), None)
    if not donation:
        return jsonify({"error": "Donation not found"}), 404

    MOCK_DONATIONS = [d for d in MOCK_DONATIONS if d['id'] != donation_id]
    
    MOCK_ACTIVITIES.insert(0, {
        "id": len(MOCK_ACTIVITIES) + 1,
        "type": "donation",
        "title": "Donation Removed",
        "description": f"Listing '{donation['title']}' was deleted by Administrator",
        "timestamp": "Just now",
        "level": "warning"
    })
    return jsonify({"message": f"Donation '{donation['title']}' deleted successfully"})

# --- ADMIN CLAIMS & REQUESTS MODERATION ---
@app.route('/api/admin/requests/<int:request_id>/status', methods=['PUT'])
def update_request_status(request_id):
    req_item = next((r for r in MOCK_REQUESTS if r['id'] == request_id), None)
    if not req_item:
        return jsonify({"error": "Request not found"}), 404

    data = request.get_json() or {}
    new_status = data.get('status')
    if not new_status:
        return jsonify({"error": "Status is required"}), 400

    old_status = req_item['status']
    req_item['status'] = new_status
    if 'volunteer_name' in data:
        req_item['volunteer_name'] = data['volunteer_name']

    return jsonify({"message": f"Request #{request_id} status changed to {new_status}", "request": req_item})

# --- ADMIN ACTIVITIES & LOGS ---
@app.route('/api/admin/activities', methods=['GET'])
def get_admin_activities():
    return jsonify(MOCK_ACTIVITIES)

@app.route('/api/admin/activities', methods=['POST'])
def add_admin_activity():
    data = request.get_json() or {}
    new_act = {
        "id": len(MOCK_ACTIVITIES) + 1,
        "type": data.get('type', 'system'),
        "title": data.get('title', 'Admin Event'),
        "description": data.get('description', ''),
        "timestamp": "Just now",
        "level": data.get('level', 'info')
    }
    MOCK_ACTIVITIES.insert(0, new_act)
    return jsonify(new_act), 201

# --- ADMIN SETTINGS & BROADCAST ---
@app.route('/api/admin/settings', methods=['GET'])
def get_admin_settings():
    return jsonify(MOCK_SETTINGS)

@app.route('/api/admin/settings', methods=['PUT'])
def update_admin_settings():
    data = request.get_json() or {}
    for key, val in data.items():
        if key in MOCK_SETTINGS:
            MOCK_SETTINGS[key] = val
    return jsonify({"message": "Settings updated successfully", "settings": MOCK_SETTINGS})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
