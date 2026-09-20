from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
import os
import json
from config import Config
from db import MOCK_USERS, MOCK_DONATIONS, MOCK_REQUESTS, MOCK_NOTIFICATIONS, MOCK_ACTIVITIES, MOCK_SETTINGS, get_db_connection

USERS_FILE = os.path.join(os.path.dirname(__file__), 'users_data.json')

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

    return jsonify({
        "message": "Donation created successfully",
        "donation": new_donation
    }), 201

# --- DONATION REQUESTS ENDPOINTS (NGO -> Donor) ---
@app.route('/api/requests', methods=['GET'])
def get_requests():
    return jsonify(MOCK_REQUESTS)

@app.route('/api/requests', methods=['POST'])
def create_request():
    data = request.get_json() or {}
    donation_id = data.get('donation_id')
    ngo_name = data.get('ngo_name', 'Hope Shelter NGO')

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM food_donations WHERE id = %s", (donation_id,))
            donation = cursor.fetchone()
            
            if not donation:
                return jsonify({"error": "Donation not found"}), 404
                
            cursor.execute("UPDATE food_donations SET status = 'Requested' WHERE id = %s", (donation_id,))
            
            query = """INSERT INTO donation_requests 
                       (donation_id, ngo_id, ngo_name, status, otp_code) 
                       VALUES (%s, %s, %s, %s, %s)"""
            val = (donation_id, data.get('ngo_id', 2), ngo_name, 'Pending', '5921')
            cursor.execute(query, val)
            conn.commit()
            new_id = cursor.lastrowid
            
            cursor.execute("SELECT * FROM donation_requests WHERE id = %s", (new_id,))
            new_req = cursor.fetchone()
            
            # Include donation_title dynamically since it's joined
            new_req['donation_title'] = donation['title']

            cursor.close()
            conn.close()
            
            return jsonify({"message": "Donation request submitted successfully", "request": new_req}), 201
        except Exception as e:
            print("DB Error:", e)
            if conn: conn.close()

    donation = next((d for d in MOCK_DONATIONS if d['id'] == donation_id), None)
    if not donation:
        return jsonify({"error": "Donation not found"}), 404

    donation['status'] = 'Requested'

    new_req = {
        "id": len(MOCK_REQUESTS) + 201,
        "donation_id": donation_id,
        "donation_title": donation['title'],
        "ngo_id": data.get('ngo_id', 2),
        "ngo_name": ngo_name,
        "volunteer_id": 3,
        "volunteer_name": "Alex Smith",
        "status": "Pending",
        "otp_code": "5921",
        "requested_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    MOCK_REQUESTS.insert(0, new_req)

    return jsonify({
        "message": "Donation request submitted successfully",
        "request": new_req
    }), 201

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
