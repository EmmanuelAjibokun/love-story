import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Heart, Sparkles, Share2, Copy, Check, MessageSquare, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { COUPLE_INFO } from '../data/storyScript';

export default function WeddingDetails() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCelebration: false
  });
  const [copiedHashtag, setCopiedHashtag] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestWish, setGuestWish] = useState('');
  const [wishes, setWishes] = useState([
    { name: "Pastor & Fellowship Family", text: "What God has joined together, let no man put asunder. We remember the early days in fellowship cell group—so proud of you both!", date: "Just now" },
    { name: "Sister & Family (Lagos)", text: "Remembering the early morning trek phone calls! God's hand has been upon this journey from day one. Congratulations Seyi and Titi!", date: "Today" },
    { name: "Abuja Friends", text: "The tears of joy when Seyi visited Abuja said it all. You two are meant for each other! #TitiSeyiForever", date: "Yesterday" }
  ]);

  // Target Wedding Date: November 10, 2026
  useEffect(() => {
    const targetDate = new Date("2026-11-10T10:00:00");

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isCelebration: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isCelebration: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyHashtag = () => {
    navigator.clipboard?.writeText?.(COUPLE_INFO.hashtag);
    setCopiedHashtag(true);
    setTimeout(() => setCopiedHashtag(false), 2500);
  };

  const handleSendWish = (e) => {
    e.preventDefault();
    if (!guestName.trim() || !guestWish.trim()) return;

    const newWish = {
      name: guestName.trim(),
      text: guestWish.trim(),
      date: "Just now"
    };

    setWishes([newWish, ...wishes]);
    setGuestName('');
    setGuestWish('');

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#E05377', '#D4AF37', '#FAF7F2']
      });
    } catch (err) {}
  };

  const triggerLoveShower = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#E05377', '#D4AF37', '#ffffff']
      });
    } catch (e) {}
  };

  return (
    <section id="wedding" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-stone-800/80">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs uppercase tracking-widest font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Save The Date</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-light text-stone-100 tracking-wide mb-3">
          November 10, 2026
        </h2>
        <p className="text-rose-300 font-serif italic text-lg sm:text-xl">
          "From Church Cell Group to Forever Before God"
        </p>
      </div>

      {/* Countdown Card */}
      <div className="bg-gradient-to-br from-stone-900/90 via-stone-900/50 to-stone-950 p-8 sm:p-12 rounded-3xl border border-stone-800 shadow-2xl relative overflow-hidden mb-16">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto text-center mb-8">
            <div className="bg-stone-950/80 border border-stone-800 p-4 sm:p-6 rounded-2xl">
              <span className="block text-3xl sm:text-5xl font-serif text-amber-200 font-bold mb-1">
                {timeLeft.days}
              </span>
              <span className="text-xs uppercase tracking-widest text-stone-400 font-medium">Days</span>
            </div>

            <div className="bg-stone-950/80 border border-stone-800 p-4 sm:p-6 rounded-2xl">
              <span className="block text-3xl sm:text-5xl font-serif text-amber-200 font-bold mb-1">
                {timeLeft.hours}
              </span>
              <span className="text-xs uppercase tracking-widest text-stone-400 font-medium">Hours</span>
            </div>

            <div className="bg-stone-950/80 border border-stone-800 p-4 sm:p-6 rounded-2xl">
              <span className="block text-3xl sm:text-5xl font-serif text-amber-200 font-bold mb-1">
                {timeLeft.minutes}
              </span>
              <span className="text-xs uppercase tracking-widest text-stone-400 font-medium">Minutes</span>
            </div>

            <div className="bg-stone-950/80 border border-stone-800 p-4 sm:p-6 rounded-2xl">
              <span className="block text-3xl sm:text-5xl font-serif text-amber-200 font-bold mb-1">
                {timeLeft.seconds}
              </span>
              <span className="text-xs uppercase tracking-widest text-stone-400 font-medium">Seconds</span>
            </div>
          </div>

          {/* Scripture Citation */}
          <div className="max-w-xl mx-auto text-center border-t border-stone-800/80 pt-6">
            <p className="text-stone-300 font-serif italic text-base sm:text-lg mb-2">
              "Behold, I have received commandment to bless: and he hath blessed; and I cannot reverse it."
            </p>
            <span className="text-xs font-sans uppercase tracking-widest text-amber-400/90 font-medium">
              — Numbers 23:20
            </span>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <button
              onClick={handleCopyHashtag}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold tracking-wider transition-all border border-stone-700"
            >
              {copiedHashtag ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Hashtag Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-rose-400" />
                  <span>Copy {COUPLE_INFO.hashtag}</span>
                </>
              )}
            </button>

            <button
              onClick={triggerLoveShower}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-lg shadow-rose-900/30 hover:scale-105 active:scale-95"
            >
              <Heart className="w-4 h-4 fill-white text-white" />
              <span>Send Love & Confetti</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guest Wishes & Prayers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Wish Form */}
        <div className="lg:col-span-5 bg-stone-900/70 border border-stone-800 p-6 sm:p-8 rounded-3xl">
          <div className="flex items-center gap-2 mb-4 text-amber-300">
            <MessageSquare className="w-5 h-5" />
            <h3 className="text-xl font-serif text-white font-medium">
              Leave a Blessing for the Couple
            </h3>
          </div>
          <p className="text-xs text-stone-400 mb-6">
            Share your prayer, congratulations, or best memories with Titilayo and Oluwaseyi.
          </p>

          <form onSubmit={handleSendWish} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-stone-400 mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Sister Grace / Uncle David"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-rose-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-stone-400 mb-1.5">
                Your Prayer or Message
              </label>
              <textarea
                required
                rows={3}
                value={guestWish}
                onChange={(e) => setGuestWish(e.target.value)}
                placeholder="May God bless your union with peace, laughter, and fruitfulness..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-rose-400 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs tracking-wider uppercase transition-colors shadow-lg shadow-rose-950/50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Blessing</span>
            </button>
          </form>
        </div>

        {/* Wishes Wall */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
              Blessings Wall ({wishes.length})
            </h4>
            <span className="text-xs text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Recent Prayers
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
            {wishes.map((w, i) => (
              <div 
                key={i}
                className="bg-stone-900/50 border border-stone-800/80 p-5 rounded-2xl transition-all hover:border-rose-500/30"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-medium text-amber-200 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    {w.name}
                  </span>
                  <span className="text-[11px] text-stone-500">{w.date}</span>
                </div>
                <p className="text-stone-300 text-sm leading-relaxed font-light">
                  "{w.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
