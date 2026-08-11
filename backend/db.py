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
        "phone": "9876543210",
        "address": "Downtown Center, Block 4",
        "organization_type": "Hotel"
    },
    {
        "id": 2,
        "name": "Hope Shelter NGO",
        "email": "ngo@frs.org",
        "password": "password123",
        "role": "ngo",
        "phone": "9876543211",
        "address": "Westside Care Center",
        "organization_type": "NGO"
    },
    {
        "id": 3,
        "name": "Alex Smith",
        "email": "volunteer@frs.org",
        "password": "password123",
        "role": "volunteer",
        "phone": "9876543212",
        "address": "City Center",
        "organization_type": "Individual"
    },
    {
        "id": 4,
        "name": "System Administrator",
        "email": "admin@frs.org",
        "password": "password123",
        "role": "admin",
        "phone": "9876543213",
        "address": "HQ Office",
        "organization_type": "Admin"
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
        "created_at": "2026-08-02 12:00:00"
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
        "created_at": "2026-08-02 13:00:00"
    }
]

MOCK_REQUESTS = [
    {
        "id": 201,
        "donation_id": 101,
        "ngo_id": 2,
        "ngo_name": "Hope Shelter NGO",
        "volunteer_id": 3,
        "volunteer_name": "Alex Smith",
        "status": "Pending",
        "otp_code": "4829",
        "requested_at": "2026-08-02 13:30:00"
    }
]

MOCK_NOTIFICATIONS = [
    {
        "id": 301,
        "user_id": 1,
        "title": "New Food Request",
        "message": "Hope Shelter NGO has requested your donation: Surplus Banquet Meals.",
        "is_read": False,
        "created_at": "2026-08-02 13:31:00"
    }
]

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
