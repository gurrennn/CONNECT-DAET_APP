-- CONNECT-DAET Analytics Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Shop Transactions Table (Team 7)
CREATE TABLE IF NOT EXISTS shop_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tours Bookings Table (Team 8)
CREATE TABLE IF NOT EXISTS tours_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  tour_id UUID,
  tour_name VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  booking_date DATE,
  status VARCHAR(50) DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Museum Scans Table (Team 3)
CREATE TABLE IF NOT EXISTS museum_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  qr_code VARCHAR(255),
  scan_location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Experience Check-ins Table (Team 4)
CREATE TABLE IF NOT EXISTS experiences_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  experience_id UUID,
  experience_name VARCHAR(255),
  checkin_location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Reward History Table (Team 11)
CREATE TABLE IF NOT EXISTS reward_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  reward_id UUID,
  reward_name VARCHAR(255),
  points_earned INTEGER,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Feedback Table (Team 9)
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  subsystem VARCHAR(100),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. User Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  full_name VARCHAR(255),
  age INTEGER,
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Facility Usage Table
CREATE TABLE IF NOT EXISTS facility_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_name VARCHAR(255) NOT NULL,
  usage_percentage INTEGER CHECK (usage_percentage >= 0 AND usage_percentage <= 100),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  energy_usage DECIMAL(10,2),
  water_usage DECIMAL(10,2)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_shop_transactions_created_at ON shop_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_shop_transactions_user_id ON shop_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tours_bookings_created_at ON tours_bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_tours_bookings_user_id ON tours_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_museum_scans_created_at ON museum_scans(created_at);
CREATE INDEX IF NOT EXISTS idx_experiences_checkins_created_at ON experiences_checkins(created_at);
CREATE INDEX IF NOT EXISTS idx_reward_history_claimed_at ON reward_history(claimed_at);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_sentiment ON feedback(sentiment);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);
CREATE INDEX IF NOT EXISTS idx_facility_usage_recorded_at ON facility_usage(recorded_at);

-- Enable Row Level Security (RLS)
ALTER TABLE shop_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE museum_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_usage ENABLE ROW LEVEL SECURITY;

-- Restrict analytics reads to the configured administrator account.
DROP POLICY IF EXISTS "Public read access for analytics" ON shop_transactions;
DROP POLICY IF EXISTS "Public read access for analytics" ON tours_bookings;
DROP POLICY IF EXISTS "Public read access for analytics" ON museum_scans;
DROP POLICY IF EXISTS "Public read access for analytics" ON experiences_checkins;
DROP POLICY IF EXISTS "Public read access for analytics" ON reward_history;
DROP POLICY IF EXISTS "Public read access for analytics" ON feedback;
DROP POLICY IF EXISTS "Public read access for analytics" ON profiles;
DROP POLICY IF EXISTS "Public read access for analytics" ON facility_usage;

DROP POLICY IF EXISTS "Admin read access for analytics" ON shop_transactions;
DROP POLICY IF EXISTS "Admin read access for analytics" ON tours_bookings;
DROP POLICY IF EXISTS "Admin read access for analytics" ON museum_scans;
DROP POLICY IF EXISTS "Admin read access for analytics" ON experiences_checkins;
DROP POLICY IF EXISTS "Admin read access for analytics" ON reward_history;
DROP POLICY IF EXISTS "Admin read access for analytics" ON feedback;
DROP POLICY IF EXISTS "Admin read access for analytics" ON profiles;
DROP POLICY IF EXISTS "Admin read access for analytics" ON facility_usage;

CREATE POLICY "Admin read access for analytics" ON shop_transactions FOR SELECT USING (auth.uid() = 'c89843cd-b551-4925-b777-6c5c5cd3cb65'::uuid);
CREATE POLICY "Admin read access for analytics" ON tours_bookings FOR SELECT USING (auth.uid() = 'c89843cd-b551-4925-b777-6c5c5cd3cb65'::uuid);
CREATE POLICY "Admin read access for analytics" ON museum_scans FOR SELECT USING (auth.uid() = 'c89843cd-b551-4925-b777-6c5c5cd3cb65'::uuid);
CREATE POLICY "Admin read access for analytics" ON experiences_checkins FOR SELECT USING (auth.uid() = 'c89843cd-b551-4925-b777-6c5c5cd3cb65'::uuid);
CREATE POLICY "Admin read access for analytics" ON reward_history FOR SELECT USING (auth.uid() = 'c89843cd-b551-4925-b777-6c5c5cd3cb65'::uuid);
CREATE POLICY "Admin read access for analytics" ON feedback FOR SELECT USING (auth.uid() = 'c89843cd-b551-4925-b777-6c5c5cd3cb65'::uuid);
CREATE POLICY "Admin read access for analytics" ON profiles FOR SELECT USING (auth.uid() = 'c89843cd-b551-4925-b777-6c5c5cd3cb65'::uuid);
CREATE POLICY "Admin read access for analytics" ON facility_usage FOR SELECT USING (auth.uid() = 'c89843cd-b551-4925-b777-6c5c5cd3cb65'::uuid);
