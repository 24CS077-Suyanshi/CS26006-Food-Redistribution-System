import mysql.connector
from mysql.connector import Error
from config import Config

# In-memory mock database for fallback
MOCK_USERS = [
    {
        "id": 1,
        "name": "Grand Hyatt Hotel",
        "email": "donor@frs.org",
        "password": "password123",
        "role": "donor",
        "phone": "+91 9876543210",
        "address": "Downtown Center, Block 4",
        "organization_type": "Hotel",
        "is_verified": True,
        "created_at": "2026-07-15 10:30:00"
    },
    {
        "id": 2,
        "name": "Hope Shelter NGO",
        "email": "ngo@frs.org",
        "password": "password123",
        "role": "ngo",
        "phone": "+91 9876543211",
        "address": "Westside Care Center",
        "organization_type": "NGO",
        "is_verified": True,
        "created_at": "2026-07-18 14:15:00"
    },
    {
        "id": 3,
        "name": "Alex Smith",
        "email": "volunteer@frs.org",
        "password": "password123",
        "role": "volunteer",
        "phone": "+91 9876543212",
        "address": "City Center",
        "organization_type": "Individual",
        "is_verified": True,
        "created_at": "2026-08-01 09:00:00"
    },
    {
        "id": 4,
        "name": "System Administrator",
        "email": "admin@frs.org",
        "password": "password123",
        "role": "admin",
        "phone": "+91 9876543213",
        "address": "Central Command HQ",
        "organization_type": "Admin",
        "is_verified": True,
        "created_at": "2026-01-01 00:00:00"
    },
    {
        "id": 5,
        "name": "Green Earth Foundation",
        "email": "greenearth@ngo.org",
        "password": "password123",
        "role": "ngo",
        "phone": "+91 9822334455",
        "address": "Sector 9, Green Avenue",
        "organization_type": "Community Organization",
        "is_verified": False,
        "created_at": "2026-08-05 11:20:00"
    },
    {
        "id": 6,
        "name": "Priya Sharma",
        "email": "priya.volunteer@frs.org",
        "password": "password123",
        "role": "volunteer",
        "phone": "+91 9811223344",
        "address": "South Extension, Block B",
        "organization_type": "Individual",
        "is_verified": True,
        "created_at": "2026-08-06 16:40:00"
    }
]

MOCK_DONATIONS = []

MOCK_REQUESTS = []

MOCK_NOTIFICATIONS = [
    {
        "id": 1,
        "user_id": 1,
        "title": "Donation Claimed",
        "message": "Hope Shelter NGO has claimed your donation 'Surplus Banquet Meals'.",
        "is_read": False,
        "created_at": "2026-08-10 14:45:00"
    },
    {
        "id": 2,
        "user_id": 2,
        "title": "Volunteer Assigned",
        "message": "Alex Smith has been assigned to pick up batch #103.",
        "is_read": False,
        "created_at": "2026-08-10 15:00:00"
    }
]

MOCK_ACTIVITIES = [
    {
        "id": 1,
        "type": "claim",
        "title": "Claim Request Submitted",
        "description": "Hope Shelter NGO claimed 'Surplus Banquet Meals (Buffet)'",
        "timestamp": "12 mins ago",
        "level": "info"
    },
    {
        "id": 2,
        "type": "donation",
        "title": "New Donation Listed",
        "description": "BakeHouse Cafe listed 'Fresh Artisan Bread & Pastries' (25 kg)",
        "timestamp": "45 mins ago",
        "level": "success"
    },
    {
        "id": 3,
        "type": "delivery",
        "title": "Delivery In-Transit",
        "description": "Alex Smith picked up batch #101 with verified OTP",
        "timestamp": "1 hour ago",
        "level": "warning"
    },
    {
        "id": 4,
        "type": "user",
        "title": "New NGO Registered",
        "description": "Green Earth Foundation registered and requires admin verification",
        "timestamp": "2 hours ago",
        "level": "accent"
    }
]

MOCK_SETTINGS = {
    "platform_name": "Food Redistribution System (FRS)",
    "support_email": "admin@frs.org",
    "emergency_broadcast": "",
    "broadcast_active": False,
    "ai_freshness_enabled": True,
    "auto_expiry_buffer_hours": 2,
    "refrigeration_shelf_multiplier": 2.0,
    "allow_public_registration": True
}

def get_db_connection():
    """Try to get MySQL Connection, fallback to None if MySQL is offline."""
    try:
        connection = mysql.connector.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print("[MySQL Error]:", e)
        pass
    return None
