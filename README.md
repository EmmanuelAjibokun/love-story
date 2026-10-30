# Titilayo & Oluwaseyi — Wedding & Love Story Website 💍✨

A landing page and interactive storybook built with **React**, **Vite**, and **Tailwind CSS**, capturing the journey of **Titilayo ("Bambi")** & **Oluwaseyi ("Bam Bam")** from their first church cell group DM in 2021 to their wedding on **November 10, 2026**.

---

## 🐘 Neon Serverless Database Integration

The Guest Blessings & Prayers section is wired to **Neon Serverless Postgres** via `@neondatabase/serverless` over HTTP:

1. **Automatic Table Creation**: Automatically creates `wedding_wishes` if it doesn't exist yet:
   ```sql
   CREATE TABLE IF NOT EXISTS wedding_wishes (
     id SERIAL PRIMARY KEY,
     guest_name VARCHAR(150) NOT NULL,
     message TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```
2. **Environment Variable**: Set your Neon connection string in `.env.local` or `.env`:
   ```env
   VITE_NEON_DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require"
   ```
3. **Features**:
   - Live real-time fetch from Neon with shimmer loading skeleton.
   - Optimistic UI updates on submission with double-submit protection (`Saving to Neon...`).
   - "Refresh" button to sync latest prayers across guests.
   - Graceful fallback with local backup if the database is temporarily unreachable.

---

## ✨ Features Included

1. **Auto-Playing Media Slider with Images & Short Video Clips**:
   - Smooth Ken-Burns cinematic zoom effect on photography.
   - HTML5 video playback support for romantic clips.
   - Dynamic progress bar, play/pause controls, pace selector (Brisk, Normal, Relaxed), and fullscreen mode.
   - Left/Right controls and touch swipe support for mobile.

2. **Synchronized Subtitles with Reaction Emojis**:
   - Displays the narrative script sentence-by-sentence in synced glassmorphism subtitle cards as each slide plays.
   - Includes reaction emojis (`💬✨`, `🎓😄`, `🍲🍠`, `🦌🧸`, `🍦💝`, `😭💍`, `🌹👗`, `👰‍♀️🤵‍♂️🎉`).
   - "Read Full Script" button opens the complete heartfelt letter written by Oluwaseyi.

3. **Background Wedding Soundtrack & Audio Permission Prompt**:
   - Complies with modern browser autoplay policies with an interactive permission modal: *"Enter with Music"* or *"Enter in Silence"*.
   - Romantic piano & strings soundtrack with Web Audio API procedural backup (plays without CDN failure).
   - Floating music widget with visual sound wave animation, mute/unmute, play/pause, and volume slider.

4. **Interactive Love Milestones Roadmap**:
   - Visual timeline from July 10, 2021 to November 10, 2026.
   - Clicking any milestone jumps the hero slider straight to that chapter in their story.

5. **Wedding Day & Save The Date Countdown**:
   - Live real-time countdown to **November 10, 2026** (Days, Hours, Minutes, Seconds).
   - Numbers 23:20 scripture citation.
   - One-click copy for the official wedding hashtag (`#TitiSeyiForever`).
   - Interactive heart confetti celebration shower.

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Add your Neon Database URL to .env.local (Optional, fallback provided)
cp .env.example .env.local

# 3. Start the local development server
npm run dev

# 4. Build for production deployment
npm run build
```
