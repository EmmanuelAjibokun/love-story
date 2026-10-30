import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import fs from 'fs';
import { STORY_SLIDES } from '../src/data/storyScript.js';

// Load .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const sql = neon(envConfig.DATABASE_URL);

console.log("Setting up 'story_slides' table in Neon Postgres...");

await sql`
  CREATE TABLE IF NOT EXISTS story_slides (
    slide_id INT PRIMARY KEY,
    chapter VARCHAR(50) NOT NULL,
    chapter_title VARCHAR(255) NOT NULL,
    date_str VARCHAR(100),
    location VARCHAR(150),
    media_type VARCHAR(20) DEFAULT 'image',
    media_url TEXT NOT NULL,
    fallback_media TEXT,
    aspect_ratio VARCHAR(30) DEFAULT 'landscape',
    subtitle TEXT NOT NULL,
    reaction_emoji VARCHAR(50),
    tags TEXT[],
    is_custom_media BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

console.log("'story_slides' table verified.");

// Check if rows exist
const existingRows = await sql`SELECT count(*)::int as count FROM story_slides;`;
console.log(`Current slide count in DB: ${existingRows[0].count}`);

if (existingRows[0].count === 0) {
  console.log("Seeding all 15 story slides into Neon Postgres...");
  for (const s of STORY_SLIDES) {
    await sql`
      INSERT INTO story_slides (
        slide_id, chapter, chapter_title, date_str, location,
        media_type, media_url, fallback_media, aspect_ratio,
        subtitle, reaction_emoji, tags, is_custom_media
      ) VALUES (
        ${s.id}, ${s.chapter}, ${s.chapterTitle}, ${s.date}, ${s.location},
        ${s.type}, ${s.mediaUrl}, ${s.fallbackMedia}, ${s.aspectRatio},
        ${s.subtitle}, ${s.reactionEmoji}, ${s.tags}, FALSE
      )
      ON CONFLICT (slide_id) DO NOTHING;
    `;
  }
  console.log("Seeding complete!");
}

const all = await sql`SELECT slide_id, chapter_title, media_type, substring(media_url from 1 for 40) as media_url FROM story_slides ORDER BY slide_id ASC;`;
console.log("Neon Story Slides:", all);
