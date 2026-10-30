import React from 'react';
import { 
  Heart, 
  MessageCircle, 
  Music, 
  Utensils, 
  Sparkles, 
  HeartHandshake, 
  Wine, 
  Plane, 
  Gem, 
  Church,
  ArrowRight
} from 'lucide-react';
import { TIMELINE_MILESTONES } from '../data/storyScript';

const iconMap = {
  MessageCircleHeart: MessageCircle,
  Music: Music,
  Utensils: Utensils,
  Sparkles: Sparkles,
  HeartHandshake: HeartHandshake,
  Wine: Wine,
  Plane: Plane,
  Gem: Gem,
  Church: Church,
};

export default function LoveStoryTimeline({ onSelectMilestone }) {
  // Mapping milestones to slide indices in STORY_SLIDES
  const milestoneToSlideIndex = [0, 3, 4, 6, 9, 11, 12, 13, 14];

  return (
    <section id="timeline" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs uppercase tracking-widest font-medium mb-4">
          <Heart className="w-3.5 h-3.5 fill-rose-400" />
          <span>Milestones of Love</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-light text-stone-100 tracking-wide mb-4">
          From A Church DM to Eternity
        </h2>
        <p className="text-stone-400 max-w-xl mx-auto text-sm sm:text-base font-light">
          Click on any chapter below to jump directly to that moment in our love story slider.
        </p>
      </div>

      <div className="relative">
        {/* Center vertical line on desktop */}
        <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-rose-500/40 via-amber-400/40 to-rose-500/40 -translate-x-1/2" />
        
        {/* Mobile vertical line */}
        <div className="md:hidden absolute left-6 top-4 bottom-4 w-px bg-rose-500/30" />

        <div className="space-y-10 sm:space-y-12">
          {TIMELINE_MILESTONES.map((item, index) => {
            const IconComponent = iconMap[item.icon] || Heart;
            const isEven = index % 2 === 0;
            const slideIdx = milestoneToSlideIndex[index] || 0;

            return (
              <div 
                key={index}
                className={`relative flex flex-col md:flex-row items-start md:items-center ${
                  isEven ? 'md:flex-row-reverse' : ''
                } group cursor-pointer`}
                onClick={() => {
                  onSelectMilestone(slideIdx);
                  const sliderElem = document.getElementById('story-slider');
                  if (sliderElem) {
                    sliderElem.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {/* Node marker icon */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-stone-900 border-2 border-amber-400/80 group-hover:border-rose-400 flex items-center justify-center text-amber-300 group-hover:text-rose-300 shadow-lg shadow-black/80 transition-all duration-300 group-hover:scale-110 z-10">
                  <IconComponent className="w-5 h-5" />
                </div>

                {/* Content Box */}
                <div className={`ml-16 md:ml-0 md:w-1/2 ${isEven ? 'md:pl-12' : 'md:pr-12'} w-full`}>
                  <div className="bg-stone-900/60 backdrop-blur-md border border-stone-800 group-hover:border-rose-500/40 p-6 rounded-2xl shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-stone-900/90">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs uppercase tracking-wider font-semibold text-rose-400">
                        {item.date}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-serif text-white font-medium mb-2 group-hover:text-amber-200 transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-stone-300 text-sm leading-relaxed mb-3">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-rose-300/80 group-hover:text-rose-200 transition-colors font-medium">
                      <span>View in slider</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
