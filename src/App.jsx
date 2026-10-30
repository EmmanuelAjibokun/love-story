import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AudioPlayerPrompt from './components/AudioPlayerPrompt';
import StorySlider from './components/StorySlider';
import LoveStoryTimeline from './components/LoveStoryTimeline';
import WeddingDetails from './components/WeddingDetails';
import FullTranscriptModal from './components/FullTranscriptModal';
import MediaUploaderModal from './components/MediaUploaderModal';
import { STORY_SLIDES, COUPLE_INFO } from './data/storyScript';
import { fetchSlidesFromNeon, updateSlideMediaInNeon, resetAllSlidesInNeon } from './services/neonSlidesService';
import { Sparkles, Heart, BookOpen, Volume2, Calendar, MapPin, Database } from 'lucide-react';

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [slides, setSlides] = useState(STORY_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [uploaderSlideId, setUploaderSlideId] = useState(1);
  const [isLoadingSlides, setIsLoadingSlides] = useState(true);

  // Load slides from Neon database on mount
  useEffect(() => {
    async function loadNeonSlides() {
      try {
        const dbSlides = await fetchSlidesFromNeon();
        if (dbSlides && dbSlides.length > 0) {
          setSlides(dbSlides);
        }
      } catch (err) {
        console.warn("Using default slides:", err);
      } finally {
        setIsLoadingSlides(false);
      }
    }
    loadNeonSlides();
  }, []);

  // Update slide media in React state & Neon Postgres database
  const handleUpdateSlideMedia = async (slideId, newUrl, type) => {
    // 1. Optimistic local update
    setSlides(prev =>
      prev.map(s => (s.id === slideId ? { ...s, mediaUrl: newUrl, type, isCustomMedia: true } : s))
    );

    // 2. Persist to Neon Database
    try {
      const updated = await updateSlideMediaInNeon(slideId, newUrl, type);
      if (updated) {
        setSlides(prev =>
          prev.map(s => (s.id === slideId ? { ...s, ...updated } : s))
        );
      }
    } catch (err) {
      console.error("Failed to persist slide update to Neon:", err);
    }
  };

  const handleResetDefaults = async () => {
    try {
      const resetList = await resetAllSlidesInNeon();
      setSlides(resetList);
    } catch (err) {
      setSlides(STORY_SLIDES);
    }
  };

  const handleOpenUploaderForSlide = (slideId) => {
    setUploaderSlideId(slideId || slides[currentIndex]?.id || 1);
    setIsUploaderOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0908] text-stone-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Audio permission & background music system */}
      <AudioPlayerPrompt hasEntered={hasEntered} setHasEntered={setHasEntered} />

      {/* Navigation Header */}
      <Navbar 
        onOpenTranscript={() => setIsTranscriptOpen(true)}
        onOpenUploader={() => handleOpenUploaderForSlide(slides[currentIndex]?.id)}
      />

      {/* Main Landing Page Content */}
      <main className="flex-1">
        {/* Hero Introduction */}
        <section className="relative pt-12 pb-8 sm:pt-16 sm:pb-12 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs uppercase tracking-widest font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Our True Love Story</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>

            {/* Couple Main Heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-normal text-stone-100 tracking-wide mb-4">
              Titilayo <span className="font-script text-rose-400 text-5xl sm:text-7xl md:text-8xl">&</span> Oluwaseyi
            </h1>

            {/* Nicknames Subheading */}
            <p className="text-lg sm:text-xl md:text-2xl font-serif italic text-amber-200/90 mb-4">
              "{COUPLE_INFO.brideNickname} & {COUPLE_INFO.groomNickname}"
            </p>

            <p className="text-stone-300 text-sm sm:text-base max-w-2xl font-light leading-relaxed mb-6">
              "She entered my DM as my church cell group leader... and walked straight into my heart.
              From late-night talks at FUTA to her saying 'YES', explore our 5-year journey to forever."
            </p>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-stone-400 mb-8">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>First Met: July 10, 2021</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>Started Dating: Oct 25, 2023</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Wedding: Nov 10, 2026</span>
              </div>
            </div>
          </div>
        </section>

        {/* The Core Story Slider with Auto-Play & Synchronized Subtitles */}
        <section id="story-slider" className="px-4 sm:px-6 pb-20">
          <StorySlider
            slides={slides}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            onOpenTranscript={() => setIsTranscriptOpen(true)}
            onOpenUploader={handleOpenUploaderForSlide}
          />
        </section>

        {/* Interactive Milestones Road-Map */}
        <LoveStoryTimeline
          onSelectMilestone={(slideIndex) => setCurrentIndex(slideIndex)}
        />

        {/* Wedding Countdown, Scripture & Guest Blessing Wall */}
        <WeddingDetails />
      </main>

      {/* Footer */}
      <Footer />

      {/* Full Script Reading Modal */}
      <FullTranscriptModal
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
      />

      {/* Media Uploader Modal for real couple photos/videos in Neon S3 & DB */}
      <MediaUploaderModal
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        slides={slides}
        initialSlideId={uploaderSlideId}
        onUpdateSlideMedia={handleUpdateSlideMedia}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}
