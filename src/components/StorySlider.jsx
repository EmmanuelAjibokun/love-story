import React, { useState, useEffect, useRef } from 'react';
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
  BookOpen
} from 'lucide-react';

export default function StorySlider({ 
  slides, 
  currentIndex, 
  setCurrentIndex, 
  onOpenTranscript,
  onOpenUploader 
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [slideDuration, setSlideDuration] = useState(8500); // 8.5 seconds per slide for comfortable reading
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const currentSlide = slides[currentIndex] || slides[0];

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
        setCurrentIndex((prev) => (prev + 1) % slides.length);
        stepCount = 0;
        setProgress(0);
      }
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, slideDuration, slides.length, setCurrentIndex]);

  // Restart video when slide changes to video
  useEffect(() => {
    setProgress(0);
    if (videoRef.current && currentSlide.type === 'video') {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex, currentSlide.type]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 60) {
      goToNext();
    }
    if (touchEndX.current - touchStartX.current > 60) {
      goToPrev();
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

  return (
    <div 
      ref={containerRef}
      className={`relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-rose-950/20 border border-stone-800 bg-stone-950 transition-all duration-500 ${
        isFullscreen ? 'fixed inset-0 z-50 max-w-none rounded-none' : ''
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Media Window */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-black select-none">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {slide.type === 'video' ? (
                <div className="relative w-full h-full">
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
                  {/* Video mute toggle badge */}
                  <button
                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 backdrop-blur-md text-stone-200 hover:text-white hover:bg-black/80 transition-colors"
                    title={isVideoMuted ? "Unmute video audio" : "Mute video audio"}
                  >
                    {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
                  </button>
                </div>
              ) : (
                <div className="relative w-full h-full overflow-hidden">
                  <img
                    src={slide.mediaUrl}
                    alt={slide.chapterTitle}
                    onError={(e) => {
                      if (e.target.src !== slide.fallbackMedia) {
                        e.target.src = slide.fallbackMedia;
                      }
                    }}
                    className={`w-full h-full object-cover object-center transform transition-transform duration-[9000ms] ease-out ${
                      isActive ? 'scale-110 translate-x-1' : 'scale-100'
                    }`}
                  />
                </div>
              )}

              {/* Atmospheric Gradient Overlays for Cinematic Wedding Vibe */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/30 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/40 via-transparent to-stone-950/40 pointer-events-none" />
            </div>
          );
        })}

        {/* Top Header Floating Badges */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20 flex flex-wrap items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-rose-500/25 border border-rose-400/40 text-rose-200 backdrop-blur-md shadow-md flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 animate-pulse" />
            {currentSlide.chapter}
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/50 border border-stone-700/60 text-stone-300 backdrop-blur-md flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-amber-300" />
            {currentSlide.date}
          </span>
          <span className="hidden md:flex px-3 py-1.5 rounded-full text-xs font-medium bg-black/50 border border-stone-700/60 text-stone-300 backdrop-blur-md items-center gap-1.5">
            <MapPin className="w-3 h-3 text-rose-300" />
            {currentSlide.location}
          </span>
        </div>

        {/* Top Right Controls (Custom media / Fullscreen) */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 flex items-center gap-2">
          {onOpenUploader && (
            <button
              onClick={onOpenUploader}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-700/80 backdrop-blur-md transition-all shadow-md flex items-center gap-1.5"
              title="Replace or add your own couple photos and clips"
            >
              <span>Custom Media</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-stone-300 hover:text-white border border-stone-700/60 backdrop-blur-md transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Experience"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Left / Right Slide Arrow Buttons */}
        <button
          onClick={goToPrev}
          aria-label="Previous story chapter"
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-rose-900/60 text-stone-200 hover:text-white border border-white/10 backdrop-blur-md flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={goToNext}
          aria-label="Next story chapter"
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-rose-900/60 text-stone-200 hover:text-white border border-white/10 backdrop-blur-md flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg group"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Story Subtitle Overlay Bar */}
        <div className="absolute bottom-0 inset-x-0 z-20 p-4 sm:p-6 md:p-8 bg-gradient-to-t from-stone-950 via-stone-950/90 to-transparent">
          <div className="max-w-4xl mx-auto">
            {/* Story Title & Tags */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-white font-medium tracking-wide text-glow">
                {currentSlide.chapterTitle}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <span>{currentIndex + 1}</span>
                <span className="text-stone-600">/</span>
                <span>{slides.length}</span>
              </div>
            </div>

            {/* The Subtitle Text Box with Tasteful Reaction Emojis */}
            <div className="relative bg-black/60 backdrop-blur-xl border border-rose-500/25 rounded-2xl p-4 sm:p-5 shadow-2xl">
              <p className="text-stone-100 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
                "{currentSlide.subtitle}"
              </p>
              
              <div className="mt-2.5 flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/80 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-base select-none">{currentSlide.reactionEmoji}</span>
                  <span className="text-amber-300/80 italic font-serif">
                    Narrated by Seyi with love
                  </span>
                </div>

                {onOpenTranscript && (
                  <button
                    onClick={onOpenTranscript}
                    className="flex items-center gap-1 text-rose-300 hover:text-rose-200 underline decoration-rose-500/50 underline-offset-4 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Full Script</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slider Controls & Progress Timeline */}
      <div className="bg-stone-900/90 border-t border-stone-800 px-4 sm:px-8 py-3.5 flex flex-col gap-3">
        {/* Progress Bar of active slide */}
        <div className="w-full bg-stone-800/80 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400 transition-all duration-75 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Lower Toolbar: Play/Pause, Speed, Dots */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-medium transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pause Story</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-rose-400" />
                  <span>Auto Play</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setCurrentIndex(0);
                setProgress(0);
              }}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title="Restart Story"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 max-w-md overflow-x-auto py-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  setProgress(0);
                }}
                aria-label={`Jump to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  i === currentIndex
                    ? 'w-6 h-2 bg-gradient-to-r from-rose-400 to-amber-400'
                    : 'w-2 h-2 bg-stone-700 hover:bg-stone-500'
                }`}
              />
            ))}
          </div>

          {/* Pace selector */}
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="hidden md:inline">Pacing:</span>
            <select
              value={slideDuration}
              onChange={(e) => setSlideDuration(Number(e.target.value))}
              className="bg-stone-800 text-stone-200 rounded-md px-2 py-1 text-xs border border-stone-700 focus:outline-none focus:border-rose-400"
            >
              <option value={6000}>Brisk (6s)</option>
              <option value={8500}>Normal (8.5s)</option>
              <option value={12000}>Relaxed (12s)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
