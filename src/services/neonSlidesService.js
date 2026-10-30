import { neon } from '@neondatabase/serverless';
import { STORY_SLIDES } from '../data/storyScript';

const NEON_CONNECTION_STRING = 
  import.meta.env.DATABASE_URL || 
  import.meta.env.DATABASE_URL_UNPOOLED || 
  import.meta.env.VITE_NEON_DATABASE_URL || 
  import.meta.env.VITE_DATABASE_URL || 
  '';

function getSqlClient() {
  if (!NEON_CONNECTION_STRING) return null;
  return neon(NEON_CONNECTION_STRING);
}

/**
 * Fetch all story slides from Neon Database
 */
export async function fetchSlidesFromNeon() {
  // 1. Try /api/slides API endpoint first
  try {
    const res = await fetch('/api/slides');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    // API not running or network fallback
  }

  // 2. Direct Neon Serverless query
  const sql = getSqlClient();
  if (!sql) {
    return STORY_SLIDES;
  }

  try {
    const rows = await sql`
      SELECT 
        slide_id AS id,
        chapter,
        chapter_title AS "chapterTitle",
        date_str AS date,
        location,
        media_type AS type,
        media_url AS "mediaUrl",
        fallback_media AS "fallbackMedia",
        aspect_ratio AS "aspectRatio",
        subtitle,
        reaction_emoji AS "reactionEmoji",
        tags,
        is_custom_media AS "isCustomMedia"
      FROM story_slides
      ORDER BY slide_id ASC;
    `;

    if (rows && rows.length > 0) {
      return rows;
    }
    return STORY_SLIDES;
  } catch (err) {
    console.warn("Direct Neon slides query error:", err);
    return STORY_SLIDES;
  }
}

/**
 * Update media URL and type for a specific slide in Neon Database
 * (Called when a new picture/video is uploaded to the Neon Object Storage bucket)
 */
export async function updateSlideMediaInNeon(slideId, mediaUrl, mediaType = 'image') {
  // 1. Try /api/slides/update-media endpoint
  try {
    const res = await fetch('/api/slides/update-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slideId, mediaUrl, mediaType }),
    });

    if (res.ok) {
      const updated = await res.json();
      return updated;
    }
  } catch (err) {
    // fallback to direct client
  }

  // 2. Direct Neon SQL query
  const sql = getSqlClient();
  if (!sql) {
    throw new Error("Neon database connection not available");
  }

  const result = await sql`
    UPDATE story_slides
    SET 
      media_url = ${mediaUrl},
      media_type = ${mediaType},
      is_custom_media = TRUE,
      updated_at = CURRENT_TIMESTAMP
    WHERE slide_id = ${Number(slideId)}
    RETURNING 
      slide_id AS id,
      chapter,
      chapter_title AS "chapterTitle",
      date_str AS date,
      location,
      media_type AS type,
      media_url AS "mediaUrl",
      fallback_media AS "fallbackMedia",
      aspect_ratio AS "aspectRatio",
      subtitle,
      reaction_emoji AS "reactionEmoji",
      tags,
      is_custom_media AS "isCustomMedia";
  `;

  if (result && result.length > 0) {
    return result[0];
  }

  throw new Error(`Slide with id ${slideId} not found in database`);
}

/**
 * Reset all slides in Neon Database back to default
 */
export async function resetAllSlidesInNeon() {
  try {
    const res = await fetch('/api/slides/reset', { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {}

  const sql = getSqlClient();
  if (!sql) return STORY_SLIDES;

  for (const s of STORY_SLIDES) {
    await sql`
      UPDATE story_slides
      SET 
        media_url = ${s.mediaUrl},
        media_type = ${s.type},
        is_custom_media = FALSE,
        updated_at = CURRENT_TIMESTAMP
      WHERE slide_id = ${s.id};
    `;
  }

  return await fetchSlidesFromNeon();
}
