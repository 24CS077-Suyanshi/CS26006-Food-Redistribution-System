-- Food Redistribution System (FRS) - Database Seed Script
-- Run this in MySQL Workbench to populate the tables with all registered users and donations!

USE food_redistribution_db;

-- 1. Insert Users
INSERT INTO users (id, name, email, password_hash, role, phone, address, organization_type, is_verified, created_at)
VALUES
(1, 'Grand Hyatt Hotel', 'donor@frs.org', 'password123', 'donor', '+91 9876543210', 'Downtown Center, Block 4', 'Hotel', 1, '2026-07-15 10:30:00'),
(2, 'Hope Shelter NGO', 'ngo@frs.org', 'password123', 'ngo', '+91 9876543211', 'Westside Care Center', 'NGO', 1, '2026-07-18 14:15:00'),
(3, 'Alex Smith', 'volunteer@frs.org', 'password123', 'volunteer', '+91 9876543212', 'City Center', 'Individual', 1, '2026-08-01 09:00:00'),
(4, 'System Administrator', 'admin@frs.org', 'password123', 'admin', '+91 9876543213', 'Central Command HQ', 'Admin', 1, '2026-01-01 00:00:00'),
(5, 'John', 'john@gamil.com', '123456', 'donor', '7984980454', '38 Navapara,Kosad Railway Station,Kosad Gam,Amaroli,Surat', 'Restaurant', 1, '2026-09-23 20:34:51'),
(6, 'Suyanshi Patel', 'suyanshipatel@gmail.com', '060906sp', 'admin', '+917984980454', '38 Navapara,Kosad Railway Station,Kosad Gam,Amaroli,Surat', 'Restaurant', 1, '2026-09-23 20:36:29'),
(7, 'Alex', 'alex@gmail.com', '234567', 'ngo', '1234567897', '38 Navapara,Kosad Railway Station,Kosad Gam,Amaroli,Surat', 'Restaurant', 1, '2026-10-04 16:48:34'),
(8, 'Liza', 'liza@gmail.com', '3456789', 'volunteer', '2345678912', 'anfhk,1324', 'Restaurant', 1, '2026-10-04 16:55:14'),
(9, 'Liza', 'lisa@gamil.com', '123456', 'volunteer', '2345678912', 'anfhk,1324', 'Restaurant', 1, '2026-10-10 15:27:33'),
(10, 'Liza Patel', 'lisa@gmail.com', '1234567', 'volunteer', '3463356432', '38 Navapara,Kosad Railway Station,Kosad Gam,Amaroli,Surat', 'Restaurant', 1, '2026-10-10 15:29:44')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Food Donations
INSERT INTO food_donations (id, donor_id, donor_name, title, category, quantity, prepared_time, expiry_hours, location, storage_type, status, image_url, created_at)
VALUES
(101, 1, 'Grand Hyatt Hotel', 'Surplus Banquet Meals (Buffet)', 'Veg', '45 Portions', '2 hours ago', 3, 'Downtown Center, Block 4', 'Refrigerated', 'Available', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60', '2026-08-10 12:00:00'),
(102, 1, 'BakeHouse Cafe', 'Fresh Artisan Bread & Pastries', 'Veg', '25 kg', '1 hour ago', 8, 'Westside Market Street', 'Room Temperature', 'Available', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60', '2026-08-10 13:00:00'),
(103, 5, 'John', 'Rice', 'Veg', '15kg', '1 hour ago', 4, 'Nadiad', 'Room Temperature', 'Delivered', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60', '2026-10-10 15:22:36')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 3. Verify
SELECT * FROM users;
