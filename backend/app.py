from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
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

# Initialize in-memory fallback from persistent storage
MOCK_DONATIONS.clear()
MOCK_DONATIONS.extend(load_persistent_donations())
MOCK_REQUESTS.clear()
MOCK_REQUESTS.extend(load_persistent_requests())


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
            
            # Send OTP to the NGO's registered email
            send_email_otp(ngo_email, generated_otp, food_title=donation.get('title', 'Food Listing'), donor_name=donation.get('donor_name', 'Food Donor'))

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
                cursor.execute("UPDATE food_donations SET status = 'Picked Up' WHERE id = %s", (row['donation_id'],))

            conn.commit()
            cursor.execute("SELECT * FROM donation_requests WHERE id = %s", (request_id,))
            updated_req = cursor.fetchone()
            cursor.close()
            conn.close()

            # Add to activity logs
            MOCK_ACTIVITIES.insert(0, {
                "id": len(MOCK_ACTIVITIES) + 1,
                "type": "delivery",
                "title": "Delivery Picked Up",
                "description": f"{volunteer_name} accepted delivery task #{request_id}",
                "timestamp": "Just now",
                "level": "warning"
            })

            return jsonify({"message": "Task accepted! Status updated to In Transit.", "request": updated_req}), 200
        except Exception as e:
            print("DB Error in accept_request:", e)
            if conn: conn.close()

    req_item = next((r for r in MOCK_REQUESTS if r['id'] == request_id), None)
    if not req_item:
        return jsonify({"error": "Request not found"}), 404

    req_item['status'] = 'In Transit'
    req_item['volunteer_id'] = volunteer_id
    req_item['volunteer_name'] = volunteer_name

    donation = next((d for d in MOCK_DONATIONS if d['id'] == req_item['donation_id']), None)
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
            cursor.execute("SELECT * FROM donation_requests WHERE id = %s", (request_id,))
            req_item = cursor.fetchone()
            if not req_item:
                cursor.close()
                conn.close()
                return jsonify({"error": "Request not found."}), 404

            actual_otp = str(req_item.get('otp_code', '')).strip()
            if submitted_otp != actual_otp:
                cursor.close()
                conn.close()
                return jsonify({"error": f"Invalid OTP '{submitted_otp}'. Please get the correct 4-digit OTP from the recipient NGO."}), 400

            # Valid OTP! Mark Delivered
            cursor.execute("UPDATE donation_requests SET status = 'Delivered' WHERE id = %s", (request_id,))
            cursor.execute("UPDATE food_donations SET status = 'Delivered' WHERE id = %s", (req_item['donation_id'],))
            conn.commit()

            cursor.execute("SELECT * FROM donation_requests WHERE id = %s", (request_id,))
            updated_req = cursor.fetchone()
            cursor.close()
            conn.close()

            MOCK_ACTIVITIES.insert(0, {
                "id": len(MOCK_ACTIVITIES) + 1,
                "type": "delivery",
                "title": "Delivery Completed (OTP Verified)",
                "description": f"Request #{request_id} delivered successfully with verified OTP",
                "timestamp": "Just now",
                "level": "success"
            })

            return jsonify({
                "message": "OTP verified successfully! Food delivery has been marked as Delivered.",
                "request": updated_req,
                "donation_id": req_item['donation_id']
            }), 200
        except Exception as e:
            print("DB Error in verify_otp:", e)
            if conn: conn.close()

    req_item = next((r for r in MOCK_REQUESTS if r['id'] == request_id), None)
    if not req_item:
        return jsonify({"error": "Request not found."}), 404

    actual_otp = str(req_item.get('otp_code', '')).strip()
    if submitted_otp != actual_otp:
        return jsonify({"error": f"Invalid OTP '{submitted_otp}'. Please ask the recipient NGO for their 4-digit OTP."}), 400

    req_item['status'] = 'Delivered'
    donation = next((d for d in MOCK_DONATIONS if d['id'] == req_item['donation_id']), None)
    if donation:
        donation['status'] = 'Delivered'
        save_persistent_donations(MOCK_DONATIONS)

    save_persistent_requests(MOCK_REQUESTS)

    MOCK_ACTIVITIES.insert(0, {
        "id": len(MOCK_ACTIVITIES) + 1,
        "type": "delivery",
        "title": "Delivery Completed (OTP Verified)",
        "description": f"Request #{request_id} delivered successfully with verified OTP",
        "timestamp": "Just now",
        "level": "success"
    })

    return jsonify({
        "message": "OTP verified successfully! Food delivery has been marked as Delivered.",
        "request": req_item,
        "donation_id": req_item['donation_id']
    }), 200


# --- NOTIFICATIONS ENDPOINTS ---
@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    return jsonify(MOCK_NOTIFICATIONS)

# --- AI FRESHNESS PREDICTION ENDPOINT ---
@app.route('/api/ai/predict-freshness', methods=['POST'])
def predict_freshness():
    data = request.get_json() or {}
    food_type = data.get('food_type', 'Veg')
    storage = data.get('storage_type', 'Room Temperature')

    # Basic ML logic rule simulation
    shelf_life = 4.0
    if storage == 'Refrigerated':
        shelf_life += 4.0
    elif storage == 'Hot Storage':
        shelf_life += 2.0

    if food_type == 'Non-Veg':
        shelf_life -= 1.0

    return jsonify({
        "food_type": food_type,
        "storage_type": storage,
        "predicted_fresh_hours": shelf_life,
        "confidence_score": 0.94,
        "recommendation": f"Best consumed within {shelf_life} hours. Keep under {storage}."
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
    safe_users = [{k: v for k, v in u.items() if k != 'password'} for u in MOCK_USERS]
    return jsonify(safe_users)

@app.route('/api/admin/users', methods=['POST'])
def create_admin_user():
    data = request.get_json() or {}
    email = data.get('email')
    name = data.get('name')
    role = data.get('role', 'donor')

    if not email or not name:
        return jsonify({"error": "Name and email are required"}), 400

    for u in MOCK_USERS:
        if u['email'] == email:
            return jsonify({"error": "User with this email already exists"}), 400

    new_user = {
        "id": max([u['id'] for u in MOCK_USERS], default=0) + 1,
        "name": name,
        "email": email,
        "password": data.get('password', 'password123'),
        "role": role,
        "phone": data.get('phone', ''),
        "address": data.get('address', ''),
        "organization_type": data.get('organization_type', role.capitalize()),
        "is_verified": data.get('is_verified', True),
        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    MOCK_USERS.append(new_user)
    
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
    user = next((u for u in MOCK_USERS if u['id'] == user_id), None)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    if 'name' in data: user['name'] = data['name']
    if 'phone' in data: user['phone'] = data['phone']
    if 'address' in data: user['address'] = data['address']
    if 'organization_type' in data: user['organization_type'] = data['organization_type']
    if 'role' in data and user['id'] != 4: user['role'] = data['role']
    if 'is_verified' in data: user['is_verified'] = bool(data['is_verified'])

    safe_user = {k: v for k, v in user.items() if k != 'password'}
    return jsonify({"message": f"User '{user['name']}' updated successfully", "user": safe_user})

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def delete_admin_user(user_id):
    global MOCK_USERS
    user = next((u for u in MOCK_USERS if u['id'] == user_id), None)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user['role'] == 'admin' or user['id'] == 4:
        return jsonify({"error": "Primary admin account cannot be deleted"}), 403

    MOCK_USERS = [u for u in MOCK_USERS if u['id'] != user_id]
    
    MOCK_ACTIVITIES.insert(0, {
        "id": len(MOCK_ACTIVITIES) + 1,
        "type": "user",
        "title": "User Removed",
        "description": f"User '{user['name']}' was removed by Administrator",
        "timestamp": "Just now",
        "level": "warning"
    })
    return jsonify({"message": f"User '{user['name']}' deleted successfully"})

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
