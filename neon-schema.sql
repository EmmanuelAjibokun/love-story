-- Neon Database Schema for Titilayo & Oluwaseyi's Wedding Website
-- Run this in your Neon SQL Editor or let the application automatically initialize it!

-- 1. Table for Wedding Guest Prayers & Blessings
CREATE TABLE IF NOT EXISTS wedding_wishes (
  id SERIAL PRIMARY KEY,
  guest_name VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wedding_wishes_created_at ON wedding_wishes(created_at DESC);

-- 2. Table for Story Slider Chapters & Media (Linked to Neon Object Storage bucket: 'assets')
CREATE TABLE IF NOT EXISTS story_slides (
  slide_id INT PRIMARY KEY,
  chapter VARCHAR(50) NOT NULL,
  chapter_title VARCHAR(255) NOT NULL,
  date_str VARCHAR(100),
  location VARCHAR(150),
  media_type VARCHAR(20) DEFAULT 'image', -- 'image' or 'video'
  media_url TEXT NOT NULL,                -- Neon S3 URL or default image URL
  fallback_media TEXT,
  aspect_ratio VARCHAR(30) DEFAULT 'landscape',
  subtitle TEXT NOT NULL,
  reaction_emoji VARCHAR(50),
  tags TEXT[],
  is_custom_media BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_story_slides_id ON story_slides(slide_id ASC);
