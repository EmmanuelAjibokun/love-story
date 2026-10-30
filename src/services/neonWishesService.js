import { neon } from '@neondatabase/serverless';

/**
 * Neon Serverless Database Service for Wedding Wishes
 * Uses Neon Postgres over HTTP via @neondatabase/serverless with automatic API fallback
 */

const NEON_CONNECTION_STRING = 
  import.meta.env.DATABASE_URL || 
  import.meta.env.DATABASE_URL_UNPOOLED || 
  import.meta.env.VITE_NEON_DATABASE_URL || 
  import.meta.env.VITE_DATABASE_URL || 
  '';

// Default initial blessings
export const SEED_WISHES = [
  {
    id: 'seed-1',
    name: "Pastor & Fellowship Family",
    text: "What God has joined together, let no man put asunder. We remember the early days in fellowship cell group—so proud of you both!",
    date: "Just now",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 'seed-2',
    name: "Sister & Family (Lagos)",
    text: "Remembering the early morning trek phone calls! God's hand has been upon this journey from day one. Congratulations Seyi and Titi!",
    date: "Today",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: 'seed-3',
    name: "Abuja Friends",
    text: "The tears of joy when Seyi visited Abuja said it all. You two are meant for each other! #TitiSeyiForever",
    date: "Yesterday",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

export function formatWishDate(dateString) {
  if (!dateString) return 'Just now';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 172800) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
}

function getSqlClient() {
  if (!NEON_CONNECTION_STRING) return null;
  return neon(NEON_CONNECTION_STRING);
}

export async function initWishesTable() {
  const sql = getSqlClient();
  if (!sql) return false;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS wedding_wishes (
        id SERIAL PRIMARY KEY,
        guest_name VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    return true;
  } catch (error) {
    console.warn("Table init warning:", error);
    return false;
  }
}

export async function fetchWishesFromNeon() {
  // Try /api/wishes endpoint first
  try {
    const apiRes = await fetch('/api/wishes');
    if (apiRes.ok) {
      const rows = await apiRes.json();
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map(row => ({
          id: row.id,
          name: row.name,
          text: row.text,
          date: formatWishDate(row.created_at),
          created_at: row.created_at,
        }));
      }
    }
  } catch (e) {
    // API not responding or client-only mode, fall back to direct SQL client
  }

  // Fallback to direct Neon Serverless client
  const sql = getSqlClient();
  if (!sql) {
    return SEED_WISHES;
  }

  try {
    await initWishesTable();
    const rows = await sql`
      SELECT 
        id, 
        guest_name AS name, 
        message AS text, 
        created_at 
      FROM wedding_wishes 
      ORDER BY created_at DESC 
      LIMIT 100;
    `;

    if (!rows || rows.length === 0) {
      return SEED_WISHES;
    }

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      text: row.text,
      date: formatWishDate(row.created_at),
      created_at: row.created_at
    }));
  } catch (err) {
    console.warn("Neon direct query fallback error:", err);
    return SEED_WISHES;
  }
}

export async function sendWishToNeon(guestName, message) {
  const trimmedName = guestName.trim();
  const trimmedMessage = message.trim();

  // Try API endpoint first
  try {
    const apiRes = await fetch('/api/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmedName, message: trimmedMessage }),
    });

    if (apiRes.ok) {
      const row = await apiRes.json();
      return {
        id: row.id,
        name: row.name,
        text: row.text,
        date: 'Just now',
        created_at: row.created_at
      };
    }
  } catch (e) {
    // API not available, proceed to direct client
  }

  const sql = getSqlClient();
  if (!sql) {
    throw new Error("Neon database connection string not available");
  }

  const result = await sql`
    INSERT INTO wedding_wishes (guest_name, message)
    VALUES (${trimmedName}, ${trimmedMessage})
    RETURNING id, guest_name AS name, message AS text, created_at;
  `;

  if (result && result.length > 0) {
    const row = result[0];
    return {
      id: row.id,
      name: row.name,
      text: row.text,
      date: 'Just now',
      created_at: row.created_at
    };
  }

  throw new Error("No record returned from Neon insert");
}

export function isNeonConfigured() {
  return Boolean(NEON_CONNECTION_STRING);
}
