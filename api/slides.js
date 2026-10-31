import { neon } from '@neondatabase/serverless';

const databaseUrl = 
  process.env.DATABASE_URL || 
  process.env.DATABASE_URL_UNPOOLED || 
  process.env.VITE_NEON_DATABASE_URL || 
  "postgresql://neondb_owner:npg_CevnzV80kEFd@ep-dark-brook-b4othpqw-pooler.c-6.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = neon(databaseUrl);

  if (req.method === 'GET') {
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
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { slideId, mediaUrl, mediaType } = req.body || {};
      if (!slideId || !mediaUrl) {
        return res.status(400).json({ error: 'slideId and mediaUrl are required' });
      }

      const result = await sql`
        UPDATE story_slides
        SET 
          media_url = ${mediaUrl},
          media_type = ${mediaType || 'image'},
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
      return res.status(200).json(result[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
