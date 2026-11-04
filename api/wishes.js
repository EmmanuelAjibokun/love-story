import { neon } from '@neondatabase/serverless';

const databaseUrl = 
  process.env.DATABASE_URL || 
  process.env.DATABASE_URL_UNPOOLED || 
  process.env.VITE_NEON_DATABASE_URL;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!databaseUrl) {
    return res.status(500).json({ error: 'Database URL not configured' });
  }

  const sql = neon(databaseUrl);

  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT id, guest_name AS name, message AS text, created_at
        FROM wedding_wishes
        ORDER BY created_at DESC
        LIMIT 100;
      `;
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
      const { name, message } = body || {};
      if (!name || !message) {
        return res.status(400).json({ error: 'Name and message are required' });
      }

      const result = await sql`
        INSERT INTO wedding_wishes (guest_name, message)
        VALUES (${name.trim()}, ${message.trim()})
        RETURNING id, guest_name AS name, message AS text, created_at;
      `;

      return res.status(200).json(result[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
