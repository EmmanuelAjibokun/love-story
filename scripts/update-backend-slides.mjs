import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import fs from 'fs';
import { STORY_SLIDES } from '../src/data/storyScript.js';

// Load .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const databaseUrl = envConfig.DATABASE_URL || envConfig.DATABASE_URL_UNPOOLED;

if (!databaseUrl) {
  console.error("No DATABASE_URL found in .env.local");
  process.exit(1);
}

const sql = neon(databaseUrl);

console.log("Connecting to Neon Postgres...");

// Ensure table exists
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

// Fetch existing slides from DB to preserve uploaded media
const existingSlides = await sql`
  SELECT slide_id, media_url, media_type, is_custom_media 
  FROM story_slides 
  ORDER BY slide_id ASC;
`;

const existingMap = new Map();
for (const row of existingSlides) {
  existingMap.set(row.slide_id, row);
}

console.log(`Found ${existingSlides.length} existing slides in Neon DB.`);

for (const s of STORY_SLIDES) {
  const existing = existingMap.get(s.id);

  if (existing) {
    // Preserve existing media_url, media_type, is_custom_media
    console.log(`Updating slide ${s.id}: "${s.chapterTitle}" (preserving media_url: ${existing.media_url?.substring(0, 40)}...)`);
    await sql`
      UPDATE story_slides
      SET 
        chapter = ${s.chapter},
        chapter_title = ${s.chapterTitle},
        date_str = ${s.date},
        location = ${s.location},
        fallback_media = ${s.fallbackMedia},
        aspect_ratio = ${s.aspectRatio || 'landscape'},
        subtitle = ${s.subtitle},
        reaction_emoji = ${s.reactionEmoji},
        tags = ${s.tags},
        updated_at = CURRENT_TIMESTAMP
      WHERE slide_id = ${s.id};
    `;
  } else {
    // Insert new slide
    console.log(`Inserting new slide ${s.id}: "${s.chapterTitle}"`);
    await sql`
      INSERT INTO story_slides (
        slide_id, chapter, chapter_title, date_str, location,
        media_type, media_url, fallback_media, aspect_ratio,
        subtitle, reaction_emoji, tags, is_custom_media
      ) VALUES (
        ${s.id}, ${s.chapter}, ${s.chapterTitle}, ${s.date}, ${s.location},
        ${s.type}, ${s.mediaUrl}, ${s.fallbackMedia}, ${s.aspectRatio || 'landscape'},
        ${s.subtitle}, ${s.reactionEmoji}, ${s.tags}, FALSE
      );
    `;
  }
}

console.log("\nAll slides synchronized in Neon Postgres!");

const currentRows = await sql`
  SELECT slide_id, chapter, chapter_title, media_type, is_custom_media, substring(media_url from 1 for 50) as media_preview 
  FROM story_slides 
  ORDER BY slide_id ASC;
`;
console.table(currentRows);
