import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { COUPLE_INFO } from '../data/storyScript';

export default function Footer() {
  return (
    <footer className="w-full bg-stone-950 border-t border-stone-900 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl text-stone-200 font-light mb-2">
          Titilayo & Oluwaseyi
        </h3>

        <p className="text-amber-300 font-script text-2xl mb-4">
          "From Cell Group Leader to Soulmate Forever"
        </p>

        <p className="text-stone-400 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
          Celebrating 5 phenomenal years together, 3 years of loving devotion, and a lifetime of happiness ahead starting November 10, 2026.
        </p>

        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-stone-400 font-medium border-t border-stone-800/80 pt-6 w-full justify-center">
          <span>{COUPLE_INFO.hashtag}</span>
          <span>•</span>
          <span>Numbers 23:20</span>
          <span>•</span>
          <span>Forever & Always</span>
        </div>
      </div>
    </footer>
  );
}
