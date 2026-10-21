-- Sample Data for CONNECT-DAET Analytics
-- Run this after creating the schema to populate with test data

-- Insert sample shop transactions
INSERT INTO shop_transactions (user_id, amount, items, created_at) VALUES
  (NULL, 1500.00, '{"item": "souvenir_magnet", "quantity": 2}'::jsonb, NOW() - INTERVAL '5 months'),
  (NULL, 2500.00, '{"item": "local_craft", "quantity": 1}'::jsonb, NOW() - INTERVAL '5 months'),
  (NULL, 1800.00, '{"item": "tshirt", "quantity": 3}'::jsonb, NOW() - INTERVAL '4 months'),
  (NULL, 3200.00, '{"item": "art_piece", "quantity": 1}'::jsonb, NOW() - INTERVAL '4 months'),
  (NULL, 1200.00, '{"item": "postcards", "quantity": 10}'::jsonb, NOW() - INTERVAL '3 months'),
  (NULL, 4500.00, '{"item": "premium_gift", "quantity": 1}'::jsonb, NOW() - INTERVAL '3 months'),
  (NULL, 2800.00, '{"item": "local_food", "quantity": 5}'::jsonb, NOW() - INTERVAL '2 months'),
  (NULL, 1900.00, '{"item": "book", "quantity": 2}'::jsonb, NOW() - INTERVAL '2 months'),
  (NULL, 5200.00, '{"item": "artwork", "quantity": 1}'::jsonb, NOW() - INTERVAL '1 month'),
  (NULL, 3400.00, '{"item": "craft_set", "quantity": 2}'::jsonb, NOW() - INTERVAL '1 month'),
  (NULL, 2100.00, '{"item": "souvenir_pack", "quantity": 1}'::jsonb, NOW() - INTERVAL '2 weeks'),
  (NULL, 3800.00, '{"item": "local_art", "quantity": 1}'::jsonb, NOW() - INTERVAL '1 week'),
  (NULL, 1600.00, '{"item": "magnet", "quantity": 4}'::jsonb, NOW() - INTERVAL '3 days'),
  (NULL, 2900.00, '{"item": "craft_item", "quantity": 2}'::jsonb, NOW() - INTERVAL '2 days'),
  (NULL, 4200.00, '{"item": "premium_item", "quantity": 1}'::jsonb, NOW());

-- Insert sample tour bookings
INSERT INTO tours_bookings (user_id, tour_name, price, booking_date, status, created_at) VALUES
  (NULL, 'Heritage Walking Tour', 500.00, NOW() - INTERVAL '5 months', 'completed', NOW() - INTERVAL '5 months'),
  (NULL, 'Beach Adventure Tour', 1200.00, NOW() - INTERVAL '5 months', 'completed', NOW() - INTERVAL '5 months'),
  (NULL, 'Cultural Museum Tour', 450.00, NOW() - INTERVAL '4 months', 'completed', NOW() - INTERVAL '4 months'),
  (NULL, 'Food Tour', 800.00, NOW() - INTERVAL '4 months', 'completed', NOW() - INTERVAL '4 months'),
  (NULL, 'Nature Trail Tour', 650.00, NOW() - INTERVAL '3 months', 'completed', NOW() - INTERVAL '3 months'),
  (NULL, 'Historical Sites Tour', 550.00, NOW() - INTERVAL '3 months', 'completed', NOW() - INTERVAL '3 months'),
  (NULL, 'Sunset Beach Tour', 900.00, NOW() - INTERVAL '2 months', 'completed', NOW() - INTERVAL '2 months'),
  (NULL, 'Local Artisan Tour', 700.00, NOW() - INTERVAL '2 months', 'completed', NOW() - INTERVAL '2 months'),
  (NULL, 'Adventure Package', 1500.00, NOW() - INTERVAL '1 month', 'completed', NOW() - INTERVAL '1 month'),
  (NULL, 'Family Tour Package', 2000.00, NOW() - INTERVAL '1 month', 'completed', NOW() - INTERVAL '1 month'),
  (NULL, 'Private Tour', 2500.00, NOW() - INTERVAL '2 weeks', 'confirmed', NOW() - INTERVAL '2 weeks'),
  (NULL, 'Group Tour', 1800.00, NOW() - INTERVAL '1 week', 'confirmed', NOW() - INTERVAL '1 week'),
  (NULL, 'Special Event Tour', 1200.00, NOW() - INTERVAL '3 days', 'confirmed', NOW() - INTERVAL '3 days'),
  (NULL, 'Weekend Tour', 850.00, NOW() - INTERVAL '2 days', 'pending', NOW() - INTERVAL '2 days'),
  (NULL, 'Custom Tour', 3000.00, NOW(), 'pending', NOW());

-- Insert sample museum scans
INSERT INTO museum_scans (user_id, qr_code, scan_location, created_at) VALUES
  (NULL, 'QR001', 'Main Entrance', NOW() - INTERVAL '7 days'),
  (NULL, 'QR002', 'Exhibit Hall A', NOW() - INTERVAL '7 days'),
  (NULL, 'QR003', 'Exhibit Hall B', NOW() - INTERVAL '6 days'),
  (NULL, 'QR004', 'Main Entrance', NOW() - INTERVAL '6 days'),
  (NULL, 'QR005', 'Special Exhibition', NOW() - INTERVAL '5 days'),
  (NULL, 'QR006', 'Exhibit Hall A', NOW() - INTERVAL '5 days'),
  (NULL, 'QR007', 'Main Entrance', NOW() - INTERVAL '4 days'),
  (NULL, 'QR008', 'Exhibit Hall C', NOW() - INTERVAL '4 days'),
  (NULL, 'QR009', 'Gift Shop', NOW() - INTERVAL '3 days'),
  (NULL, 'QR010', 'Main Entrance', NOW() - INTERVAL '3 days'),
  (NULL, 'QR011', 'Exhibit Hall B', NOW() - INTERVAL '2 days'),
  (NULL, 'QR012', 'Special Exhibition', NOW() - INTERVAL '2 days'),
  (NULL, 'QR013', 'Main Entrance', NOW() - INTERVAL '1 day'),
  (NULL, 'QR014', 'Exhibit Hall A', NOW() - INTERVAL '1 day'),
  (NULL, 'QR015', 'Main Entrance', NOW());

-- Insert sample experience check-ins
INSERT INTO experiences_checkins (user_id, experience_name, checkin_location, created_at) VALUES
  (NULL, 'Beach Volleyball', 'Beach Area 1', NOW() - INTERVAL '7 days'),
  (NULL, 'Local Cooking Class', 'Kitchen Pavilion', NOW() - INTERVAL '6 days'),
  (NULL, 'Snorkeling Experience', 'Beach Area 2', NOW() - INTERVAL '6 days'),
  (NULL, 'Craft Workshop', 'Art Center', NOW() - INTERVAL '5 days'),
  (NULL, 'Sunset Yoga', 'Beach Area 1', NOW() - INTERVAL '5 days'),
  (NULL, 'Fishing Experience', 'Fishing Spot', NOW() - INTERVAL '4 days'),
  (NULL, 'Hiking Trail', 'Nature Trail', NOW() - INTERVAL '4 days'),
  (NULL, 'Photography Tour', 'Scenic Points', NOW() - INTERVAL '3 days'),
  (NULL, 'Local Dance Class', 'Cultural Center', NOW() - INTERVAL '3 days'),
  (NULL, 'Beach Cleanup', 'Beach Area 3', NOW() - INTERVAL '2 days'),
  (NULL, 'Bird Watching', 'Nature Reserve', NOW() - INTERVAL '2 days'),
  (NULL, 'Surfing Lesson', 'Beach Area 2', NOW() - INTERVAL '1 day'),
  (NULL, 'Kayaking Adventure', 'Water Sports Area', NOW() - INTERVAL '1 day'),
  (NULL, 'Campfire Night', 'Campground', NOW()),
  (NULL, 'Stargazing Event', 'Observation Deck', NOW());

-- Insert sample reward history
INSERT INTO reward_history (user_id, reward_name, points_earned, claimed_at) VALUES
  (NULL, 'Free Tour Voucher', 100, NOW() - INTERVAL '4 weeks'),
  (NULL, 'Discount Coupon', 50, NOW() - INTERVAL '4 weeks'),
  (NULL, 'Exclusive Merchandise', 200, NOW() - INTERVAL '3 weeks'),
  (NULL, 'Free Meal Voucher', 75, NOW() - INTERVAL '3 weeks'),
  (NULL, 'Priority Access Pass', 150, NOW() - INTERVAL '2 weeks'),
  (NULL, 'Souvenir Pack', 80, NOW() - INTERVAL '2 weeks'),
  (NULL, 'Experience Upgrade', 250, NOW() - INTERVAL '1 week'),
  (NULL, 'Gift Card', 100, NOW() - INTERVAL '1 week'),
  (NULL, 'VIP Treatment', 300, NOW() - INTERVAL '3 days'),
  (NULL, 'Special Event Access', 120, NOW() - INTERVAL '3 days'),
  (NULL, 'Free Parking', 40, NOW() - INTERVAL '2 days'),
  (NULL, 'Local Product Sample', 60, NOW() - INTERVAL '2 days'),
  (NULL, 'Tour Extension', 180, NOW() - INTERVAL '1 day'),
  (NULL, 'Photo Package', 90, NOW() - INTERVAL '1 day'),
  (NULL, 'Welcome Kit', 70, NOW());

-- Insert sample feedback
INSERT INTO feedback (user_id, subsystem, rating, comment, sentiment, created_at) VALUES
  (NULL, 'museum', 5, 'Amazing exhibits! Very educational.', 'positive', NOW() - INTERVAL '5 days'),
  (NULL, 'tours', 4, 'Great tour guide, learned a lot.', 'positive', NOW() - INTERVAL '5 days'),
  (NULL, 'shop', 5, 'Beautiful local crafts, good prices.', 'positive', NOW() - INTERVAL '4 days'),
  (NULL, 'experiences', 4, 'Fun activities, well organized.', 'positive', NOW() - INTERVAL '4 days'),
  (NULL, 'museum', 3, 'Good but could use more interactive displays.', 'neutral', NOW() - INTERVAL '3 days'),
  (NULL, 'tours', 5, 'Best tour experience ever!', 'positive', NOW() - INTERVAL '3 days'),
  (NULL, 'shop', 4, 'Nice selection, friendly staff.', 'positive', NOW() - INTERVAL '2 days'),
  (NULL, 'experiences', 3, 'Activities were okay, a bit crowded.', 'neutral', NOW() - INTERVAL '2 days'),
  (NULL, 'museum', 2, 'Some exhibits were closed, disappointing.', 'negative', NOW() - INTERVAL '1 day'),
  (NULL, 'tours', 5, 'Excellent service, highly recommend!', 'positive', NOW() - INTERVAL '1 day'),
  (NULL, 'shop', 4, 'Good quality products.', 'positive', NOW() - INTERVAL '12 hours'),
  (NULL, 'experiences', 5, 'Incredible experience, will come back!', 'positive', NOW() - INTERVAL '12 hours'),
  (NULL, 'museum', 4, 'Informative and well-maintained.', 'positive', NOW() - INTERVAL '6 hours'),
  (NULL, 'tours', 3, 'Tour was good but a bit long.', 'neutral', NOW() - INTERVAL '6 hours'),
  (NULL, 'shop', 5, 'Perfect souvenirs to remember the trip!', 'positive', NOW());

-- Insert sample user profiles
INSERT INTO profiles (user_id, full_name, age, location, created_at) VALUES
  (NULL, 'Juan dela Cruz', 25, 'Daet, Camarines Norte', NOW() - INTERVAL '6 months'),
  (NULL, 'Maria Santos', 32, 'Daet, Camarines Norte', NOW() - INTERVAL '5 months'),
  (NULL, 'Jose Reyes', 28, 'Naga City', NOW() - INTERVAL '5 months'),
  (NULL, 'Ana Garcia', 45, 'Daet, Camarines Norte', NOW() - INTERVAL '4 months'),
  (NULL, 'Pedro Martinez', 38, 'Legazpi City', NOW() - INTERVAL '4 months'),
  (NULL, 'Sofia Rodriguez', 22, 'Daet, Camarines Norte', NOW() - INTERVAL '3 months'),
  (NULL, 'Miguel Fernandez', 35, 'Daet, Camarines Norte', NOW() - INTERVAL '3 months'),
  (NULL, 'Isabella Lopez', 29, 'Naga City', NOW() - INTERVAL '2 months'),
  (NULL, 'Carlos Gonzalez', 52, 'Daet, Camarines Norte', NOW() - INTERVAL '2 months'),
  (NULL, 'Elena Morales', 41, 'Legazpi City', NOW() - INTERVAL '1 month'),
  (NULL, 'Diego Torres', 26, 'Daet, Camarines Norte', NOW() - INTERVAL '1 month'),
  (NULL, 'Laura Ramirez', 33, 'Daet, Camarines Norte', NOW() - INTERVAL '3 weeks'),
  (NULL, 'Antonio Flores', 48, 'Naga City', NOW() - INTERVAL '3 weeks'),
  (NULL, 'Carmen Rivera', 24, 'Daet, Camarines Norte', NOW() - INTERVAL '2 weeks'),
  (NULL, 'Ricardo Castillo', 31, 'Daet, Camarines Norte', NOW() - INTERVAL '1 week');

-- Insert sample facility usage
INSERT INTO facility_usage (facility_name, usage_percentage, energy_usage, water_usage, recorded_at) VALUES
  ('Beach Areas', 85, 450.50, 320.00, NOW() - INTERVAL '7 days'),
  ('Museum', 67, 280.30, 150.20, NOW() - INTERVAL '7 days'),
  ('Tour Routes', 92, 120.00, 80.50, NOW() - INTERVAL '7 days'),
  ('Parking Areas', 78, 90.00, 45.00, NOW() - INTERVAL '7 days'),
  ('Beach Areas', 88, 470.20, 340.00, NOW() - INTERVAL '6 days'),
  ('Museum', 72, 300.50, 165.00, NOW() - INTERVAL '6 days'),
  ('Tour Routes', 95, 130.00, 85.00, NOW() - INTERVAL '6 days'),
  ('Parking Areas', 82, 95.00, 48.00, NOW() - INTERVAL '6 days'),
  ('Beach Areas', 90, 490.00, 360.00, NOW() - INTERVAL '5 days'),
  ('Museum', 75, 310.00, 170.00, NOW() - INTERVAL '5 days'),
  ('Tour Routes', 89, 125.00, 82.00, NOW() - INTERVAL '5 days'),
  ('Parking Areas', 80, 92.00, 46.00, NOW() - INTERVAL '5 days'),
  ('Beach Areas', 87, 460.00, 330.00, NOW() - INTERVAL '4 days'),
  ('Museum', 70, 290.00, 155.00, NOW() - INTERVAL '4 days'),
  ('Tour Routes', 93, 128.00, 84.00, NOW() - INTERVAL '4 days'),
  ('Parking Areas', 85, 98.00, 50.00, NOW() - INTERVAL '4 days'),
  ('Beach Areas', 91, 500.00, 370.00, NOW() - INTERVAL '3 days'),
  ('Museum', 68, 275.00, 148.00, NOW() - INTERVAL '3 days'),
  ('Tour Routes', 96, 135.00, 88.00, NOW() - INTERVAL '3 days'),
  ('Parking Areas', 79, 93.00, 47.00, NOW() - INTERVAL '3 days'),
  ('Beach Areas', 86, 455.00, 325.00, NOW() - INTERVAL '2 days'),
  ('Museum', 74, 305.00, 168.00, NOW() - INTERVAL '2 days'),
  ('Tour Routes', 94, 132.00, 86.00, NOW() - INTERVAL '2 days'),
  ('Parking Areas', 83, 96.00, 49.00, NOW() - INTERVAL '2 days'),
  ('Beach Areas', 89, 480.00, 350.00, NOW() - INTERVAL '1 day'),
  ('Museum', 71, 295.00, 160.00, NOW() - INTERVAL '1 day'),
  ('Tour Routes', 97, 140.00, 90.00, NOW() - INTERVAL '1 day'),
  ('Parking Areas', 81, 94.00, 48.00, NOW() - INTERVAL '1 day'),
  ('Beach Areas', 92, 510.00, 380.00, NOW()),
  ('Museum', 73, 300.00, 162.00, NOW()),
  ('Tour Routes', 98, 142.00, 92.00, NOW()),
  ('Parking Areas', 84, 97.00, 50.00, NOW());
