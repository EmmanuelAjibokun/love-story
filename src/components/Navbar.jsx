import React from 'react';
import { Heart, Sparkles, BookOpen, Music, Image } from 'lucide-react';
import { COUPLE_INFO } from '../data/storyScript';

export default function Navbar({ onOpenTranscript, onOpenUploader }) {
  return (
    <header className="sticky top-0 z-30 w-full bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/80 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand / Couple Monogram */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600/30 via-rose-500/20 to-amber-500/30 ring-1 ring-rose-500/40 flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="font-serif text-lg font-bold text-amber-300">T&O</span>
          </div>
          <div>
            <span className="font-serif text-xl sm:text-2xl text-stone-100 font-normal tracking-wide block leading-none">
              Titilayo & Oluwaseyi
            </span>
            <span className="text-[11px] font-sans tracking-widest uppercase text-amber-400/80 font-medium">
              November 10, 2026
            </span>
          </div>
        </a>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider font-medium text-stone-300">
          <a href="#story-slider" className="hover:text-amber-300 transition-colors">
            Our Story
          </a>
          <a href="#timeline" className="hover:text-amber-300 transition-colors">
            Milestones
          </a>
          <a href="#wedding" className="hover:text-amber-300 transition-colors">
            Wedding Day
          </a>

          <button
            onClick={onOpenTranscript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700/80 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-rose-400" />
            <span>Full Script</span>
          </button>

          <button
            onClick={onOpenUploader}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border border-rose-500/30 transition-all"
          >
            <Image className="w-3.5 h-3.5 text-rose-400" />
            <span>Add Photos</span>
          </button>
        </nav>

        {/* Mobile quick actions */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenTranscript}
            className="p-2 rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:text-white"
            title="Read Story"
          >
            <BookOpen className="w-4 h-4 text-rose-400" />
          </button>
          <a
            href="#wedding"
            className="px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-semibold tracking-wider uppercase"
          >
            Save Date
          </a>
        </div>
      </div>
    </header>
  );
}
