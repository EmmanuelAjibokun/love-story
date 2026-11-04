/**
 * Wedding Wishes Service
 * All database operations go through the /api/wishes server endpoint.
 * No direct SQL or database credentials on the client side.
 */

// Default initial blessings (shown when API is unavailable)
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

export async function fetchWishesFromNeon() {
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
  } catch (err) {
    console.warn("[Wishes API] Fetch error:", err);
  }

  return SEED_WISHES;
}

export async function sendWishToNeon(guestName, message) {
  const trimmedName = guestName.trim();
  const trimmedMessage = message.trim();

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

  const errData = await apiRes.json().catch(() => ({}));
  throw new Error(errData.error || "Failed to send wish");
}

export function isNeonConfigured() {
  // The API handles DB configuration; the client just needs the API to be reachable
  return true;
}
