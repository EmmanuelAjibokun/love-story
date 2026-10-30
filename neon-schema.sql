-- Neon Database Schema for Titilayo & Oluwaseyi's Wedding Website Wishes
-- Run this in your Neon SQL Editor or let the application automatically initialize it!

CREATE TABLE IF NOT EXISTS wedding_wishes (
  id SERIAL PRIMARY KEY,
  guest_name VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for speedy ordering by newest wishes
CREATE INDEX IF NOT EXISTS idx_wedding_wishes_created_at ON wedding_wishes(created_at DESC);

-- Optional: Initial blessings
INSERT INTO wedding_wishes (guest_name, message, created_at)
VALUES 
  ('Pastor & Fellowship Family', 'What God has joined together, let no man put asunder. We remember the early days in fellowship cell group—so proud of you both!', NOW() - INTERVAL '1 hour'),
  ('Sister & Family (Lagos)', 'Remembering the early morning trek phone calls! God''s hand has been upon this journey from day one. Congratulations Seyi and Titi!', NOW() - INTERVAL '3 hours'),
  ('Abuja Friends', 'The tears of joy when Seyi visited Abuja said it all. You two are meant for each other! #TitiSeyiForever', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;
