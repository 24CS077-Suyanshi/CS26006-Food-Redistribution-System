from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
from config import Config
from db import MOCK_USERS, MOCK_DONATIONS, MOCK_REQUESTS, MOCK_NOTIFICATIONS, get_db_connection

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
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', 'User')
    role = data.get('role', 'donor')
    phone = data.get('phone', '')
    address = data.get('address', '')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Check existing
    for u in MOCK_USERS:
        if u['email'] == email:
            return jsonify({"error": "User with this email already exists"}), 400

    new_user = {
        "id": len(MOCK_USERS) + 1,
        "name": name,
        "email": email,
        "password": password,
        "role": role,
        "phone": phone,
        "address": address,
        "organization_type": data.get('organization_type', role.capitalize())
    }
    MOCK_USERS.append(new_user)

    token = generate_token(new_user)
    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": {
            "id": new_user['id'],
            "name": new_user['name'],
            "email": new_user['email'],
            "role": new_user['role']
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    user = next((u for u in MOCK_USERS if u['email'] == email and u['password'] == password), None)
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(user)
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user['id'],
            "name": user['name'],
            "email": user['email'],
            "role": user['role'],
            "address": user.get('address', '')
        }
    })

# --- DONATIONS ENDPOINTS ---
@app.route('/api/donations', methods=['GET'])
def get_donations():
    status = request.args.get('status')
    category = request.args.get('category')

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

    # Trigger Notification for Donor
    MOCK_NOTIFICATIONS.insert(0, {
        "id": len(MOCK_NOTIFICATIONS) + 301,
        "user_id": donation['donor_id'],
        "title": "New Food Request!",
        "message": f"{ngo_name} requested donation: '{donation['title']}'.",
        "is_read": False,
        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

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
    return jsonify({
        "total_users": len(MOCK_USERS),
        "total_donations": len(MOCK_DONATIONS),
        "total_requests": len(MOCK_REQUESTS),
        "total_meals_served": 12480,
        "total_co2_saved_kg": 5820.5
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
