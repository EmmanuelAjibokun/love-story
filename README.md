# Titilayo & Oluwaseyi — Wedding & Love Story Website 💍✨

A landing page and interactive storybook built with **React**, **Vite**, and **Tailwind CSS**, capturing the journey of **Titilayo ("Bambi")** & **Oluwaseyi ("Bam Bam")** from their first church cell group DM in 2021 to their wedding on **November 10, 2026**.

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
   - Virtual guestbook / prayer wall where friends and family can leave blessings.

6. **Custom Media Uploader**:
   - Click "Custom Media" in the slider or navbar to upload real couple photos and video clips directly from phone/laptop or paste image URLs!

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies (already completed)
npm install

# 2. Start the local development server
npm run dev

# 3. Build for production deployment
npm run build
```

---

## 🎨 Project Structure

```
├── src/
│   ├── components/
│   │   ├── AudioPlayerPrompt.jsx   # Sound permission modal & floating music widget
│   │   ├── StorySlider.jsx          # Auto-playing image & video carousel with subtitles
│   │   ├── LoveStoryTimeline.jsx    # Interactive milestone roadmap
│   │   ├── WeddingDetails.jsx       # Countdown, Numbers 23:20, and guest blessings wall
│   │   ├── FullTranscriptModal.jsx  # Complete script reader modal
│   │   ├── MediaUploaderModal.jsx   # Tool to swap in real couple photos & clips
│   │   ├── Navbar.jsx               # Header with monogram & quick links
│   │   └── Footer.jsx               # Wedding footer & hashtag
│   ├── data/
│   │   └── storyScript.js           # 15 chronological slides, subtitles & milestone data
│   ├── utils/
│   │   └── audioEngine.js           # Audio playback & procedural romantic synth
│   ├── App.jsx                      # Main landing page assembly
│   ├── index.css                    # Tailwind & custom typography/glowing effects
│   └── main.jsx
├── index.html                       # Google Fonts (Cormorant Garamond, Great Vibes, Plus Jakarta)
├── tailwind.config.js
└── package.json
```
