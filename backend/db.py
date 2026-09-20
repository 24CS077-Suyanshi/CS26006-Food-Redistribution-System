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

MOCK_DONATIONS = [
    {
        "id": 101,
        "donor_id": 1,
        "donor_name": "Grand Hyatt Hotel",
        "title": "Surplus Banquet Meals (Buffet)",
        "category": "Veg",
        "quantity": "45 Portions",
        "prepared_time": "2 hours ago",
        "expiry_hours": 3,
        "location": "Downtown Center, Block 4",
        "storage_type": "Refrigerated",
        "status": "Available",
        "image_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60",
        "created_at": "2026-08-10 12:00:00"
    },
    {
        "id": 102,
        "donor_id": 1,
        "donor_name": "BakeHouse Cafe",
        "title": "Fresh Artisan Bread & Pastries",
        "category": "Veg",
        "quantity": "25 kg",
        "prepared_time": "1 hour ago",
        "expiry_hours": 8,
        "location": "Westside Market Street",
        "storage_type": "Room Temperature",
        "status": "Available",
        "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60",
        "created_at": "2026-08-10 13:00:00"
    },
    {
        "id": 103,
        "donor_id": 2,
        "donor_name": "TechPark Cafeteria",
        "title": "Catered Packed Meals",
        "category": "Non-Veg",
        "quantity": "60 Boxes",
        "prepared_time": "30 mins ago",
        "expiry_hours": 4,
        "location": "Innovation Hub, Building B",
        "storage_type": "Hot Storage",
        "status": "Claimed",
        "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
        "created_at": "2026-08-10 14:00:00"
    }
]

MOCK_REQUESTS = [
    {
        "id": 201,
        "donation_id": 103,
        "donation_title": "Catered Packed Meals",
        "title": "Catered Packed Meals",
        "ngo_id": 2,
        "ngo_name": "Hope Shelter NGO",
        "volunteer_id": 3,
        "volunteer_name": "Alex Smith",
        "status": "In Transit",
        "otp_code": "5921",
        "requested_at": "2026-08-10 14:30:00"
    },
    {
        "id": 202,
        "donation_id": 101,
        "donation_title": "Surplus Banquet Meals (Buffet)",
        "title": "Surplus Banquet Meals (Buffet)",
        "ngo_id": 2,
        "ngo_name": "Hope Shelter NGO",
        "volunteer_id": None,
        "volunteer_name": None,
        "status": "Pending",
        "otp_code": "8432",
        "requested_at": "2026-08-10 15:10:00"
    }
]

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
        pass
    return None
