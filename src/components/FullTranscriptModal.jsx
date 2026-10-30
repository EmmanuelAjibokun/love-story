import React from 'react';
import { X, Heart, Sparkles, BookOpen, Quote } from 'lucide-react';
import { COUPLE_INFO } from '../data/storyScript';

export default function FullTranscriptModal({ isOpen, onClose, onSelectChapter }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-3xl w-full max-h-[90vh] bg-stone-900 border border-amber-500/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-rose-500/10 text-rose-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif text-stone-100 font-medium">
                Our Complete Love Story Script
              </h3>
              <p className="text-xs text-amber-300/80">
                In Oluwaseyi's own words • For {COUPLE_INFO.bride} ("{COUPLE_INFO.brideNickname}")
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-300 leading-relaxed font-serif text-base sm:text-lg">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15">
            <Quote className="w-8 h-8 text-amber-400 shrink-0 mt-1" />
            <p className="text-amber-100/90 text-sm italic font-sans">
              "Genuinely I can say she's the closest person to my soul and I can tell her anything. She can tell me anything. It started as her being my leader, towards being friends, towards us dating, and now we are getting married..."
            </p>
          </div>

          <div className="space-y-5 text-stone-200">
            <p>
              <strong className="text-rose-300 font-sans text-sm uppercase tracking-wider block mb-1">
                July 10, 2021 — The Cell Group DM 💬
              </strong>
              We met on the 10th of July 2021, and it was one evening like that. She entered my DM, and it was like she was my leader in church, so she just checked up because she was leading me. We were like in a cell group based on location, so we lived around the same area, and she just checked up on me. She introduced herself and all of that, and I'm like, "Oh." So we started talking just like that.
            </p>

            <p>
              <strong className="text-rose-300 font-sans text-sm uppercase tracking-wider block mb-1">
                Geology & Statistics 🎓
              </strong>
              It was a year of love emotions for me, so I was not even willing to talk to anybody or look at anybody. So we started just talking. I remember I was asking her why she's studying statistics, and she was like she didn't want to study statistics, she wanted to study pharmacy, and that was really intriguing, like how did you move from studying pharmacy to studying statistics in FUTA? She was like, "Oh, that was not even enough. I was in the computer science department." I'm like, "Wow, that's a lot." So we started talking about geology too, just normal basic things.
            </p>

            <p>
              <strong className="text-rose-300 font-sans text-sm uppercase tracking-wider block mb-1">
                The Reversed Call 📞
              </strong>
              Then she traveled one time, right? Normally, as she'd been my leader, she's supposed to be the one to check up on me, so I checked up on her that evening. I called her because she told me that she was traveling, and I'm like, "Oh, are you home? How was the trip?" I knew where I stood in my house that time. I knew that she was surprised! So we just started talking...
            </p>

            <p>
              <strong className="text-rose-300 font-sans text-sm uppercase tracking-wider block mb-1">
                Birthday Song & Numbers 23 🎹🙏
              </strong>
              Then the next year, she asked me, this one that we were talking a lot, like what's going on, right? So I told her that I liked her. On her birthday in 2022, I sang for her. I played the keyboard and I sang for her, and I prayed for her with a scripture in the book of Numbers, chapter 23.
            </p>

            <p>
              <strong className="text-rose-300 font-sans text-sm uppercase tracking-wider block mb-1">
                The Park Date & Home-Cooked Food 🍲
              </strong>
              I used to give her food a lot, bring food to her at night. We had our first date in a park. I prepared food for the occasion: fried potato, fried plantain, boiled egg, then a sauce made with veggies and diced meats. It was nice!
            </p>

            <p>
              <strong className="text-rose-300 font-sans text-sm uppercase tracking-wider block mb-1">
                "Bambi" & "Bam Bam" 🦌🧸
              </strong>
              I used to stare at her in church just to observe her: Is she really pretty? Until I began to see the true beauty in her. I changed her name on my phone to Bambi. Then she started calling me Bam Bam. We spoke for two years, sharing late-night talks and asking questions to get to each other's roots.
            </p>

            <p>
              <strong className="text-rose-300 font-sans text-sm uppercase tracking-wider block mb-1">
                The Proposal with the 2019 Saved GIF 💍
              </strong>
              On the 25th of October 2023, I came to Akure with popsicles and ordered two matching necklaces forming a heart shape inside a jewelry case infused with my perfume. I told her I loved her: 'If it is a yes, open it. If it is a no, return it.' Later she texted me a video GIF saying YES that she had saved on her phone since 2019 waiting for her future husband!
            </p>

            <p>
              <strong className="text-rose-300 font-sans text-sm uppercase tracking-wider block mb-1">
                Surprise in Abuja & The Big Question 🌹✨
              </strong>
              Through NYSC in Kogi, Abuja, Kwara, and Lagos, we never stopped speaking every single day. When I surprised her in Abuja, she cried tears of joy. And on October 25, 2026, I proposed. She said YES!
            </p>

            <p className="text-amber-200 font-medium">
              And now, on November 10, 2026, Titilayo and Oluwaseyi are getting married. Two hearts, blessed by God, bound for a lifetime of joy and devotion.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>#TitiSeyiForever</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Back to Slideshow
          </button>
        </div>
      </div>
    </div>
  );
}
