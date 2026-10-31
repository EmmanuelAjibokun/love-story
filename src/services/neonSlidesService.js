import { neon } from '@neondatabase/serverless';
import { STORY_SLIDES } from '../data/storyScript';

const FALLBACK_DATABASE_URL = 
  "postgresql://neondb_owner:npg_CevnzV80kEFd@ep-dark-brook-b4othpqw-pooler.c-6.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

const NEON_CONNECTION_STRING = 
  import.meta.env.DATABASE_URL || 
  import.meta.env.DATABASE_URL_UNPOOLED || 
  import.meta.env.VITE_NEON_DATABASE_URL || 
  import.meta.env.VITE_DATABASE_URL || 
  FALLBACK_DATABASE_URL;

function getSqlClient() {
  if (!NEON_CONNECTION_STRING) return null;
  try {
    return neon(NEON_CONNECTION_STRING);
  } catch (err) {
    console.error("[Neon DB] Failed to initialize client:", err);
    return null;
  }
}

/**
 * Fetch all story slides from Neon Database
 * Prioritizes direct serverless query over HTTPS, with /api/slides fallback
 */
export async function fetchSlidesFromNeon() {
  // 1. Direct Neon Serverless query (fastest, direct connection)
  const sql = getSqlClient();
  if (sql) {
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
        console.log(`[Neon DB] Successfully fetched ${rows.length} slides from Neon Postgres.`);
        return rows;
      }
    } catch (err) {
      console.warn("[Neon DB] Direct query failed, trying API endpoint fallback:", err);
    }
  }

  // 2. Try /api/slides API endpoint as fallback
  try {
    const res = await fetch('/api/slides');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        console.log(`[Neon API] Successfully fetched ${data.length} slides from /api/slides.`);
        return data;
      }
    }
  } catch (err) {
    console.warn("[Neon API] /api/slides fetch error:", err);
  }

  // 3. Fallback to local default STORY_SLIDES if completely offline
  console.warn("[Neon DB] Falling back to default STORY_SLIDES from script");
  return STORY_SLIDES;
}

/**
 * Update media URL and type for a specific slide in Neon Database
 * (Called when a new picture/video is uploaded to the Neon Object Storage bucket)
 */
export async function updateSlideMediaInNeon(slideId, mediaUrl, mediaType = 'image') {
  // 1. Direct Neon SQL query (fastest & most reliable)
  const sql = getSqlClient();
  if (sql) {
    try {
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
    } catch (err) {
      console.warn("[Neon DB] Direct update error, trying API fallback:", err);
    }
  }

  // 2. Try /api/slides/update-media endpoint
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
    // fallback
  }

  throw new Error(`Slide with id ${slideId} could not be updated in database`);
}

/**
 * Reset all slides in Neon Database back to default
 */
export async function resetAllSlidesInNeon() {
  const sql = getSqlClient();
  if (sql) {
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
  } else {
    try {
      const res = await fetch('/api/slides/reset', { method: 'POST' });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {}
  }

  return await fetchSlidesFromNeon();
}
