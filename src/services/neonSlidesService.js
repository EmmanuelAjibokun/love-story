import { STORY_SLIDES } from '../data/storyScript';

/**
 * Fetch all story slides from the server API (Neon Postgres backed).
 * Falls back to local STORY_SLIDES if the API is unavailable.
 */
export async function fetchSlidesFromNeon() {
  try {
    const res = await fetch('/api/slides');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        console.log(`[Slides API] Loaded ${data.length} slides from server.`);
        // Sanitize: replace any transient or cross-origin blob: URLs with default slide media
        return data.map(slide => {
          if (slide.mediaUrl && slide.mediaUrl.startsWith('blob:')) {
            const fallback = STORY_SLIDES.find(s => s.id === slide.id);
            return {
              ...slide,
              mediaUrl: slide.fallbackMedia || fallback?.mediaUrl || slide.mediaUrl,
              type: fallback?.type || 'image',
              isCustomMedia: false
            };
          }
          return slide;
        });
      }
    }
  } catch (err) {
    console.warn("[Slides API] /api/slides fetch error:", err);
  }

  // Fallback to local default STORY_SLIDES if completely offline
  console.warn("[Slides API] Falling back to default STORY_SLIDES from script");
  return STORY_SLIDES;
}

/**
 * Update media URL and type for a specific slide via the server API.
 * (Called when a new picture/video is uploaded)
 */
export async function updateSlideMediaInNeon(slideId, mediaUrl, mediaType = 'image') {
  if (typeof mediaUrl === 'string' && mediaUrl.startsWith('blob:')) {
    console.warn("[Slides API] Skipping database persistence for transient blob: URL");
    return null;
  }

  // Try /api/slides (POST) endpoint
  try {
    const res = await fetch('/api/slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slideId, mediaUrl, mediaType }),
    });

    if (res.ok) {
      return await res.json();
    }

    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Update failed with status ${res.status}`);
  } catch (err) {
    console.error("[Slides API] Failed to update slide media:", err);
    throw new Error(`Slide with id ${slideId} could not be updated in database`);
  }
}

/**
 * Reset all slides back to default via the server API.
 */
export async function resetAllSlidesInNeon() {
  try {
    const res = await fetch('/api/slides/reset', { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("[Slides API] Reset endpoint unavailable:", err);
  }

  return await fetchSlidesFromNeon();
}
