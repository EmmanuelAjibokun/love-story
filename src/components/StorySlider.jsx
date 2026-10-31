import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Calendar,
  MapPin,
  Heart,
  Volume2,
  VolumeX,
  BookOpen,
  Database,
  CloudUpload,
  Sparkles,
  Quote,
  SkipForward,
  SkipBack
} from 'lucide-react';

export default function StorySlider({ 
  slides, 
  currentIndex, 
  setCurrentIndex, 
  onOpenTranscript,
  onOpenUploader 
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [slideDuration, setSlideDuration] = useState(8500); // 8.5 seconds per slide
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [playActionFeedback, setPlayActionFeedback] = useState(null); // 'play' | 'pause' | null

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);

  const currentSlide = slides[currentIndex] || slides[0];

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
  }, [slides.length, setCurrentIndex]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  }, [slides.length, setCurrentIndex]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      setPlayActionFeedback(next ? 'play' : 'pause');
      setTimeout(() => setPlayActionFeedback(null), 700);
      return next;
    });
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying) {
      setProgress(0);
      return;
    }

    const intervalStep = 50; // update progress every 50ms
    const totalSteps = slideDuration / intervalStep;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      const currentPct = Math.min(100, (stepCount / totalSteps) * 100);
      setProgress(currentPct);

      if (stepCount >= totalSteps) {
        goToNext();
        stepCount = 0;
        setProgress(0);
      }
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, slideDuration, goToNext]);

  // Restart video when slide changes to video
  useEffect(() => {
    setProgress(0);
    if (videoRef.current && currentSlide.type === 'video') {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex, currentSlide.type]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if ((e.key === 'm' || e.key === 'M') && currentSlide.type === 'video') {
        setIsVideoMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, togglePlay, currentSlide.type]);

  // Touch Swipe Handlers with directional angle check
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;

    // Only swipe horizontally if horizontal displacement is significantly greater than vertical scroll
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
      if (diffX > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-rose-950/25 border border-stone-800/90 bg-stone-950 flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 max-w-none rounded-none h-screen' : ''
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* =========================================================================
          TOP STORY HEADER: Segmented Progress Bar & Meta Bar (Instagram / Mobile Story Style)
          ========================================================================= */}
      <div className="relative z-30 bg-stone-950/95 backdrop-blur-md border-b border-stone-800/70 px-3.5 sm:px-6 pt-3.5 pb-2.5">
        {/* Story Segments (Tappable for Quick Scrubbing) */}
        <div className="flex items-center gap-1 sm:gap-1.5 w-full mb-2.5">
          {slides.map((s, idx) => {
            const isPassed = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={s.id || idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setProgress(0);
                }}
                className="group relative flex-1 h-3 flex items-center cursor-pointer focus:outline-none"
                aria-label={`Jump to chapter ${idx + 1}: ${s.chapterTitle}`}
                title={`Chapter ${idx + 1}: ${s.chapterTitle}`}
              >
                <div className="w-full h-1 sm:h-1.5 bg-stone-800/90 rounded-full overflow-hidden transition-all duration-200 group-hover:h-2">
                  <div
                    className={`h-full rounded-full transition-all duration-75 ${
                      isPassed
                        ? 'bg-rose-400 w-full'
                        : isCurrent
                        ? 'bg-gradient-to-r from-rose-400 via-rose-300 to-amber-300'
                        : 'w-0'
                    }`}
                    style={{
                      width: isPassed ? '100%' : isCurrent ? `${progress}%` : '0%'
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Top Meta Bar: Badges & Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Chapter & Milestone details */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-500/20 border border-rose-500/40 text-rose-200 shadow-sm shrink-0">
              <Heart className="w-3 h-3 fill-rose-400 text-rose-400 animate-pulse" />
              <span>{currentSlide.chapter}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-900 border border-stone-800 text-stone-300 shrink-0">
              <Calendar className="w-3 h-3 text-amber-300" />
              <span>{currentSlide.date}</span>
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-900 border border-stone-800 text-stone-300 shrink-0">
              <MapPin className="w-3 h-3 text-rose-300" />
              <span className="truncate max-w-[140px] md:max-w-none">{currentSlide.location}</span>
            </span>

            {/* Neon Storage status badge */}
            {currentSlide.isCustomMedia ? (
              <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shrink-0">
                <Database className="w-2.5 h-2.5 text-emerald-400" />
                <span>Custom Photo</span>
              </span>
            ) : null}
          </div>

          {/* Right: Quick Actions (Upload & Fullscreen) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenUploader && (
              <button
                onClick={() => onOpenUploader(currentSlide.id)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium bg-rose-600/20 hover:bg-rose-600/35 text-rose-200 border border-rose-500/30 transition-all active:scale-95 shadow-sm"
                title="Upload custom photo or video to Neon S3 storage"
              >
                <CloudUpload className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Upload Photo</span>
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Theater (F)"}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN BODY: Responsive Split Layout
          Mobile: Stacked (Media on top, full visibility, narrative card comfortably below)
          Tablet & Desktop: Side-by-side Editorial Spread (Left: Visual Canvas, Right: Editorial Story)
          Fullscreen: Cinematic Theater view
          ========================================================================= */}
      <div className={`relative flex-1 ${
        isFullscreen 
          ? 'flex flex-col justify-between overflow-hidden' 
          : 'grid grid-cols-1 md:grid-cols-12 min-h-0'
      }`}>
        
        {/* =====================================================================
            LEFT / TOP: Visual Media Theater (Unobstructed Couple Media)
            ===================================================================== */}
        <div className={`relative overflow-hidden bg-black select-none flex items-center justify-center ${
          isFullscreen 
            ? 'w-full h-full' 
            : 'md:col-span-7 aspect-[4/3] xs:aspect-[16/10] md:aspect-auto md:min-h-[440px] lg:min-h-[500px]'
        }`}>
          {/* Slide Media (Images & Videos with Ken Burns effect) */}
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={slide.id || index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {slide.type === 'video' ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-stone-950">
                    <video
                      ref={isActive ? videoRef : null}
                      src={slide.mediaUrl}
                      poster={slide.fallbackMedia}
                      autoPlay={isActive}
                      loop
                      muted={isVideoMuted}
                      playsInline
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full overflow-hidden bg-stone-950">
                    <img
                      src={slide.mediaUrl}
                      alt={slide.chapterTitle}
                      onError={(e) => {
                        if (e.target.src !== slide.fallbackMedia) {
                          e.target.src = slide.fallbackMedia;
                        }
                      }}
                      className={`w-full h-full object-cover object-center transform transition-transform duration-[8500ms] ease-out ${
                        isActive ? 'scale-105' : 'scale-100'
                      }`}
                    />
                  </div>
                )}

                {/* Subtle Cinematic Vignette (Preserves full image visibility while framing) */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-stone-950/20 pointer-events-none" />
              </div>
            );
          })}

          {/* Tap Zones for Mobile Navigation */}
          <div 
            onClick={goToPrev}
            className="absolute left-0 top-0 bottom-0 w-1/4 z-20 cursor-pointer"
            title="Tap for Previous"
          />
          <div 
            onClick={togglePlay}
            className="absolute left-1/4 top-0 bottom-0 w-2/4 z-20 cursor-pointer"
            title={isPlaying ? "Tap to Pause" : "Tap to Play"}
          />
          <div 
            onClick={goToNext}
            className="absolute right-0 top-0 bottom-0 w-1/4 z-20 cursor-pointer"
            title="Tap for Next"
          />

          {/* Play / Pause Tap Feedback Animation */}
          {playActionFeedback && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-fade-in">
              <div className="p-4 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-2xl animate-scale-up">
                {playActionFeedback === 'play' ? (
                  <Play className="w-8 h-8 fill-rose-400 text-rose-400" />
                ) : (
                  <Pause className="w-8 h-8 fill-amber-300 text-amber-300" />
                )}
              </div>
            </div>
          )}

          {/* Navigation Chevron Buttons */}
          <button
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            aria-label="Previous chapter"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-rose-900/70 text-stone-200 hover:text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg group"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            aria-label="Next chapter"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-rose-900/70 text-stone-200 hover:text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg group"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Video Audio Mute Toggle Button (Visible only for videos) */}
          {currentSlide.type === 'video' && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsVideoMuted(!isVideoMuted); }}
              className="absolute bottom-3 right-3 z-20 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-stone-200 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              title={isVideoMuted ? "Unmute video sound" : "Mute video sound"}
            >
              {isVideoMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-[11px]">Unmute Video</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-[11px] text-amber-200">Video Audio On</span>
                </>
              )}
            </button>
          )}

          {/* Slide Index Badge on Visual Area for Mobile */}
          <div className="md:hidden absolute bottom-3 left-3 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-medium text-stone-300">
            <span>{currentIndex + 1}</span>
            <span className="text-stone-500 mx-1">/</span>
            <span>{slides.length}</span>
          </div>
        </div>

        {/* =====================================================================
            RIGHT / BOTTOM: Editorial Story Narrative Column
            On Mobile: Sits directly below the media with generous breathing space.
            On Tablet/Desktop: Refined luxury wedding editorial column.
            In Fullscreen: Translucent floating glass overlay at the bottom.
            ===================================================================== */}
        <div className={`${
          isFullscreen
            ? 'relative z-20 max-w-4xl mx-auto w-full p-4 sm:p-6 bg-stone-950/85 backdrop-blur-xl border-t border-rose-500/20 rounded-t-3xl shadow-2xl'
            : 'md:col-span-5 flex flex-col justify-between p-4 sm:p-6 md:p-8 bg-gradient-to-b from-stone-900/60 via-stone-950/90 to-stone-950 border-t md:border-t-0 md:border-l border-stone-800/80'
        }`}>
          <div>
            {/* Chapter Milestone Kicker & Title */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest text-amber-400/90 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Chapter {currentIndex + 1} of {slides.length}</span>
              </span>

              {/* Read Full Script link for desktop header */}
              {onOpenTranscript && (
                <button
                  onClick={onOpenTranscript}
                  className="hidden md:inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200 underline decoration-rose-500/40 underline-offset-4 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Full Script</span>
                </button>
              )}
            </div>

            {/* Chapter Headline */}
            <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-normal text-stone-100 tracking-wide mb-3 leading-snug">
              {currentSlide.chapterTitle}
            </h3>

            {/* Sub-meta tags for context on mobile/tablet */}
            <div className="sm:hidden flex items-center gap-2 text-xs text-stone-400 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-300" />
                {currentSlide.location}
              </span>
            </div>

            {/* The Story Narrative Card */}
            <div className="relative bg-stone-900/70 backdrop-blur-md border border-rose-500/25 rounded-2xl p-4 sm:p-5 shadow-lg transition-all duration-300">
              {/* Decorative Quote Watermark */}
              <Quote className="absolute top-2 right-3 w-8 h-8 text-rose-500/10 pointer-events-none" />

              <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-normal relative z-10">
                "{currentSlide.subtitle}"
              </p>

              {/* Narration Signature & Reaction Emojis */}
              <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400">
                <div className="flex items-center gap-2">
                  <span className="text-base select-none">{currentSlide.reactionEmoji}</span>
                  <span className="text-amber-300/90 italic font-serif text-xs sm:text-sm">
                    Narrated by Seyi with love
                  </span>
                </div>

                {/* Mobile Read Full Script button */}
                {onOpenTranscript && (
                  <button
                    onClick={onOpenTranscript}
                    className="md:hidden flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200 underline decoration-rose-500/40 underline-offset-2 transition-colors py-0.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Script</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tags Pills (Discreet milestone badges) */}
            {currentSlide.tags && currentSlide.tags.length > 0 && (
              <div className="hidden sm:flex flex-wrap items-center gap-1.5 mt-3.5">
                {currentSlide.tags.map((tag, tIdx) => (
                  <span 
                    key={tIdx} 
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-900 border border-stone-800/80 text-stone-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Chapter Navigation Stepper (Desktop / Tablet) */}
          <div className="hidden md:flex items-center justify-between pt-6 border-t border-stone-800/60 mt-6 text-xs text-stone-400">
            <button
              onClick={goToPrev}
              className="flex items-center gap-1.5 hover:text-stone-200 transition-colors py-1 px-2 rounded-lg hover:bg-stone-800/50"
            >
              <SkipBack className="w-3.5 h-3.5 text-rose-400" />
              <span>Previous Chapter</span>
            </button>

            <span className="font-serif italic text-amber-200/80">
              {currentIndex + 1} of {slides.length}
            </span>

            <button
              onClick={goToNext}
              className="flex items-center gap-1.5 hover:text-stone-200 transition-colors py-1 px-2 rounded-lg hover:bg-stone-800/50"
            >
              <span>Next Chapter</span>
              <SkipForward className="w-3.5 h-3.5 text-rose-400" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM TOOLBAR: Play/Pause, Restart, Pacing, Fullscreen
          Cleanly engineered so it NEVER overflows or clips on 375px mobile screens!
          ========================================================================= */}
      <div className="relative z-30 bg-stone-950/95 border-t border-stone-800/80 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Left: Play/Pause & Restart */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 shadow-md ${
              isPlaying
                ? 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
            }`}
            title={isPlaying ? "Pause auto-advance (Space)" : "Start auto-advance (Space)"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>Play Story</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setCurrentIndex(0);
              setProgress(0);
            }}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 border border-transparent hover:border-stone-700 transition-colors active:scale-95"
            title="Restart Story from Chapter 1"
            aria-label="Restart Story"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Slide indicator (visible on tablet/desktop) */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-400">
          <span className="text-stone-300 font-medium">Chapter {currentIndex + 1}</span>
          <span className="text-stone-600">/</span>
          <span>{slides.length}</span>
        </div>

        {/* Right: Pacing Speed Selector & Script/Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Pacing Speed Pill */}
          <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-full px-2.5 py-1 text-xs text-stone-300 shadow-inner">
            <span className="hidden sm:inline text-stone-400 text-[11px] font-medium">Speed:</span>
            <select
              value={slideDuration}
              onChange={(e) => setSlideDuration(Number(e.target.value))}
              className="bg-transparent text-stone-200 text-xs font-medium focus:outline-none cursor-pointer"
              aria-label="Story advance speed"
            >
              <option value={6000} className="bg-stone-900 text-stone-200">Brisk (6s)</option>
              <option value={8500} className="bg-stone-900 text-stone-200">Normal (8.5s)</option>
              <option value={12000} className="bg-stone-900 text-stone-200">Relaxed (12s)</option>
            </select>
          </div>

          {/* Fullscreen Button in Bottom Bar */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors hidden xs:flex items-center justify-center"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            aria-label="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
