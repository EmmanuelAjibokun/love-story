import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Sparkles, Heart } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import confetti from 'canvas-confetti';

export default function AudioPlayerPrompt({ hasEntered, setHasEntered }) {
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    isMuted: false,
    volume: 0.65
  });
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    const unsubscribe = audioEngine.subscribe(setAudioState);
    return () => unsubscribe();
  }, []);

  const handleEnterWithSound = () => {
    setHasEntered(true);
    audioEngine.play();
    
    // Heart confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E05377', '#D4AF37', '#FAF7F2']
      });
    } catch (e) {
      // ignore
    }
  };

  const handleEnterSilent = () => {
    setHasEntered(true);
    audioEngine.setMuted(true);
  };

  return (
    <>
      {/* Welcome Audio Permission Modal (Required by browsers for audio autoplay) */}
      {!hasEntered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-lg w-full bg-stone-900/95 border border-rose-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl text-center overflow-hidden">
            {/* Background glowing orbs */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500/30 to-amber-500/30 flex items-center justify-center mb-6 ring-1 ring-rose-400/40 shadow-inner">
                <Music className="w-8 h-8 text-rose-300 animate-bounce" />
              </div>

              <span className="text-xs uppercase tracking-widest text-amber-300/90 font-medium mb-2">
                A Journey of Two Souls
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-stone-100 font-normal tracking-wide mb-3">
                Titilayo & Oluwaseyi
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-8 max-w-sm">
                Our love story is best experienced with gentle music. Would you like to play the background wedding soundtrack?
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button
                  onClick={handleEnterWithSound}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white font-medium text-sm tracking-wide shadow-lg shadow-rose-900/40 hover:scale-105 active:scale-95 transition-all duration-300 group"
                >
                  <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
                  <span>Enter with Music</span>
                </button>

                <button
                  onClick={handleEnterSilent}
                  className="px-6 py-3.5 rounded-full border border-stone-700 bg-stone-800/60 text-stone-300 hover:text-white hover:bg-stone-800 font-medium text-sm tracking-wide transition-all duration-200"
                >
                  Enter in Silence
                </button>
              </div>

              <p className="text-[11px] text-stone-400 mt-5 flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                You can toggle audio anytime using the floating player
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Audio Controller for visitor convenience */}
      {hasEntered && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <div 
            className="flex items-center gap-2 bg-stone-900/90 backdrop-blur-xl border border-rose-500/20 px-4 py-2.5 rounded-full shadow-xl shadow-black/50 text-stone-200"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            {/* Visualizer bars */}
            <div className="flex items-end gap-0.5 h-4 w-4 mr-1">
              <span className={`w-1 bg-rose-400 rounded-full transition-all duration-300 ${audioState.isPlaying && !audioState.isMuted ? 'h-3 animate-pulse' : 'h-1'}`} />
              <span className={`w-1 bg-amber-400 rounded-full transition-all duration-300 ${audioState.isPlaying && !audioState.isMuted ? 'h-4 animate-pulse delay-100' : 'h-1'}`} />
              <span className={`w-1 bg-rose-400 rounded-full transition-all duration-300 ${audioState.isPlaying && !audioState.isMuted ? 'h-2 animate-pulse delay-200' : 'h-1'}`} />
            </div>

            <button
              onClick={() => audioEngine.togglePlay()}
              className="p-1.5 hover:text-rose-300 rounded-full hover:bg-white/5 transition-colors"
              title={audioState.isPlaying ? "Pause Music" : "Play Music"}
            >
              {audioState.isPlaying ? (
                <Pause className="w-4 h-4 text-rose-400" />
              ) : (
                <Play className="w-4 h-4 text-stone-300" />
              )}
            </button>

            <button
              onClick={() => audioEngine.toggleMute()}
              className="p-1.5 hover:text-rose-300 rounded-full hover:bg-white/5 transition-colors"
              title={audioState.isMuted ? "Unmute" : "Mute"}
            >
              {audioState.isMuted ? (
                <VolumeX className="w-4 h-4 text-stone-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-300" />
              )}
            </button>

            {/* Subtle Volume Slider that expands on hover */}
            {showVolumeSlider && (
              <div className="flex items-center pl-2 animate-fade-in">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioState.isMuted ? 0 : audioState.volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (audioState.isMuted) audioEngine.setMuted(false);
                    audioEngine.setVolume(val);
                  }}
                  className="w-16 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
              </div>
            )}

            <span className="text-[11px] font-medium tracking-wider uppercase text-stone-400 pl-1 hidden sm:inline">
              Soundtrack
            </span>
          </div>
        </div>
      )}
    </>
  );
}
