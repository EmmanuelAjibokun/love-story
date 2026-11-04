import { neon } from '@neondatabase/serverless';

const databaseUrl = 
  process.env.DATABASE_URL || 
  process.env.DATABASE_URL_UNPOOLED || 
  process.env.VITE_NEON_DATABASE_URL;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!databaseUrl) {
    return res.status(500).json({ error: 'Database URL not configured' });
  }

  const sql = neon(databaseUrl);

  try {
    await sql`
      UPDATE story_slides
      SET 
        media_url = fallback_media,
        media_type = CASE WHEN fallback_media LIKE '%.mp4%' THEN 'video' ELSE 'image' END,
        is_custom_media = FALSE,
        updated_at = CURRENT_TIMESTAMP;
    `;

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

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
