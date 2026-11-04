import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

const sql = neon(databaseUrl);

// Original media URLs from storyScript.js STORY_SLIDES
const ORIGINAL_SLIDES = [
  { id: 1, type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop' },
  { id: 2, type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1600&auto=format&fit=crop' },
  { id: 3, type: 'video', mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-couple-walking-in-a-forest-42878-large.mp4' },
  { id: 4, type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1600&auto=format&fit=crop' },
  { id: 5, type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1600&auto=format&fit=crop' },
  { id: 6, type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1600&auto=format&fit=crop' },
  { id: 7, type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1600&auto=format&fit=crop' },
  { id: 8, type: 'video', mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-couple-drinking-wine-together-43610-large.mp4' },
  { id: 9, type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1600&auto=format&fit=crop' },
  { id: 10, type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1600&auto=format&fit=crop' },
  { id: 11, type: 'video', mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-excited-woman-jumping-in-happiness-41484-large.mp4' },
  { id: 12, type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1600&auto=format&fit=crop' },
  { id: 13, type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1600&auto=format&fit=crop' },
  { id: 14, type: 'video', mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-man-putting-a-ring-on-a-womans-finger-41133-large.mp4' },
  { id: 15, type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1600&auto=format&fit=crop' },
];

async function resetSlides() {
  console.log(`🔄 Resetting ${ORIGINAL_SLIDES.length} slides to original media URLs...\n`);

  for (const slide of ORIGINAL_SLIDES) {
    try {
      const result = await sql`
        UPDATE story_slides
        SET 
          media_url = ${slide.mediaUrl},
          media_type = ${slide.type},
          is_custom_media = FALSE,
          updated_at = CURRENT_TIMESTAMP
        WHERE slide_id = ${slide.id}
        RETURNING slide_id, media_url;
      `;
      
      if (result.length > 0) {
        console.log(`  ✅ Slide ${slide.id} → reset to ${slide.type} (${slide.mediaUrl.substring(0, 60)}...)`);
      } else {
        console.log(`  ⚠️  Slide ${slide.id} → not found in database`);
      }
    } catch (err) {
      console.error(`  ❌ Slide ${slide.id} → error: ${err.message}`);
    }
  }

  console.log('\n✅ Done! All slides reset to original media URLs.');
}

resetSlides().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
