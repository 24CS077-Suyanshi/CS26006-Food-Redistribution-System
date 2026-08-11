-- Food Redistribution System (FRS) MySQL Database Schema
CREATE DATABASE IF NOT EXISTS food_redistribution_db;
USE food_redistribution_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('donor', 'ngo', 'volunteer', 'admin') NOT NULL DEFAULT 'donor',
    phone VARCHAR(50),
    address TEXT,
    organization_type VARCHAR(100), -- Hotel, Restaurant, Shelter, etc.
    license_number VARCHAR(100),
    is_verified TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Food Donations Table
CREATE TABLE IF NOT EXISTS food_donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    donor_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category ENUM('Veg', 'Non-Veg') NOT NULL DEFAULT 'Veg',
    quantity VARCHAR(100) NOT NULL,
    prepared_time VARCHAR(100),
    expiry_hours INT NOT NULL DEFAULT 4,
    location VARCHAR(255) NOT NULL,
    storage_type VARCHAR(100) DEFAULT 'Room Temperature',
    status ENUM('Available', 'Requested', 'Claimed', 'Picked Up', 'Delivered', 'Cancelled') DEFAULT 'Available',
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Donation Requests Table (NGO -> Donor)
CREATE TABLE IF NOT EXISTS donation_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id INT NOT NULL,
    ngo_id INT NOT NULL,
    ngo_name VARCHAR(255) NOT NULL,
    volunteer_id INT DEFAULT NULL,
    volunteer_name VARCHAR(255) DEFAULT NULL,
    status ENUM('Pending', 'Approved', 'Assigned', 'In Transit', 'Completed', 'Rejected') DEFAULT 'Pending',
    otp_code VARCHAR(10),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE CASCADE,
    FOREIGN KEY (ngo_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Feedback & Ratings Table
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id INT NOT NULL,
    from_user_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE CASCADE
);
