import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Heart, 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  MessageSquare, 
  Send,
  Loader2,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { COUPLE_INFO } from '../data/storyScript';
import { 
  fetchWishesFromNeon, 
  sendWishToNeon, 
  isNeonConfigured 
} from '../services/neonWishesService';

export default function WeddingDetails() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCelebration: false
  });
  const [copiedHashtag, setCopiedHashtag] = useState(false);
  
  // Wishes & Neon DB State
  const [guestName, setGuestName] = useState('');
  const [guestWish, setGuestWish] = useState('');
  const [wishes, setWishes] = useState([]);
  const [isLoadingWishes, setIsLoadingWishes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const neonActive = isNeonConfigured();

  // Load wishes from Neon on component mount
  const loadWishes = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoadingWishes(true);
    setErrorMessage('');
    try {
      const data = await fetchWishesFromNeon();
      setWishes(data);
    } catch (err) {
      console.error("Error loading wishes from Neon:", err);
      setErrorMessage("Could not load latest wishes from the database.");
    } finally {
      setIsLoadingWishes(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWishes();
  }, []);

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

  const handleSendWish = async (e) => {
    e.preventDefault();
    if (!guestName.trim() || !guestWish.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Send directly to Neon database
      const savedWish = await sendWishToNeon(guestName, guestWish);

      // Optimistically insert the new wish at top
      setWishes(prev => [savedWish, ...prev.filter(w => w.id !== savedWish.id)]);
      setGuestName('');
      setGuestWish('');
      setSubmitSuccess(true);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 65,
          spread: 85,
          origin: { y: 0.7 },
          colors: ['#E05377', '#D4AF37', '#FAF7F2']
        });
      } catch (err) {}

      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to save wish to Neon:", err);
      setErrorMessage("Could not send blessing to Neon database. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefreshWishes = () => {
    setIsRefreshing(true);
    loadWishes(false);
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

      {/* Guest Wishes & Prayers Section (Powered by Neon Database) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Wish Form */}
        <div className="lg:col-span-5 bg-stone-900/70 border border-stone-800 p-6 sm:p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-amber-300">
              <MessageSquare className="w-5 h-5" />
              <h3 className="text-xl font-serif text-white font-medium">
                Leave a Blessing for the Couple
              </h3>
            </div>
          </div>

          {/* Database Connection Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium mb-5 w-fit border bg-emerald-950/40 border-emerald-500/30 text-emerald-300">
            <Database className="w-3 h-3 text-emerald-400" />
            <span>Connected to Neon Database</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </div>

          <p className="text-xs text-stone-400 mb-6 leading-relaxed">
            Share your prayer, congratulations, or best memories with Titilayo and Oluwaseyi. Your blessing will be permanently saved in our Neon guestbook.
          </p>

          {/* Success Banner */}
          {submitSuccess && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Your blessing has been saved to the database! Thank you!</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSendWish} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-stone-400 mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Sister Grace / Uncle David"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-rose-400 disabled:opacity-50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-stone-400 mb-1.5">
                Your Prayer or Message
              </label>
              <textarea
                required
                rows={3}
                disabled={isSubmitting}
                value={guestWish}
                onChange={(e) => setGuestWish(e.target.value)}
                placeholder="May God bless your union with peace, laughter, and fruitfulness..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-rose-400 disabled:opacity-50 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.99] disabled:opacity-50 text-white font-medium text-xs tracking-wider uppercase transition-all shadow-lg shadow-rose-950/50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving to Neon...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Blessing</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Wishes Wall */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <span>Blessings Wall</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-stone-800 text-stone-300 border border-stone-700">
                {wishes.length}
              </span>
            </h4>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshWishes}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-300 transition-colors"
                title="Refresh from Neon database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Live Prayers
              </span>
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoadingWishes ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-stone-900/40 border border-stone-800/60 p-5 rounded-2xl animate-pulse space-y-2">
                  <div className="h-4 bg-stone-800 rounded w-1/3" />
                  <div className="h-3 bg-stone-800/60 rounded w-full" />
                  <div className="h-3 bg-stone-800/40 rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : wishes.length === 0 ? (
            <div className="bg-stone-900/40 border border-dashed border-stone-800 p-8 rounded-2xl text-center">
              <Heart className="w-8 h-8 text-rose-500/50 mx-auto mb-2" />
              <p className="text-sm text-stone-300 font-medium">No blessings yet</p>
              <p className="text-xs text-stone-500 mt-1">
                Be the first to leave a prayer or congratulatory wish for the couple!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-2">
              {wishes.map((w, i) => (
                <div 
                  key={w.id || i}
                  className="bg-stone-900/50 border border-stone-800/80 p-5 rounded-2xl transition-all hover:border-rose-500/30 hover:bg-stone-900/70 shadow-sm"
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
          )}
        </div>
      </div>
    </section>
  );
}
