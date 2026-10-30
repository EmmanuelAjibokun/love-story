import React, { useState, useEffect } from 'react';
import { X, Upload, Image, Video, Check, RotateCcw, AlertCircle, Loader2, CloudUpload, Database } from 'lucide-react';
import { uploadToNeonStorage } from '../services/neonStorageService';

export default function MediaUploaderModal({ 
  isOpen, 
  onClose, 
  slides, 
  initialSlideId,
  onUpdateSlideMedia,
  onResetDefaults 
}) {
  const [selectedSlideId, setSelectedSlideId] = useState(initialSlideId || slides[0]?.id || 1);
  const [customUrl, setCustomUrl] = useState('');
  const [selectedType, setSelectedType] = useState('image');
  const [successMsg, setSuccessMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialSlideId) {
      setSelectedSlideId(initialSlideId);
    }
  }, [initialSlideId, isOpen]);

  if (!isOpen) return null;

  const currentSlide = slides.find(s => s.id === selectedSlideId) || slides[0];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    setIsUploading(true);
    setSuccessMsg('');

    try {
      // 1. Upload directly to Neon Object Storage bucket 'assets' with slideId
      const uploadRes = await uploadToNeonStorage(file, selectedSlideId);
      const mediaUrl = uploadRes.url;

      // 2. Update slide in Neon Postgres database & React state
      await onUpdateSlideMedia(selectedSlideId, mediaUrl, isVideo ? 'video' : 'image');
      setSuccessMsg(`Uploaded to Neon S3 bucket & saved to database for ${currentSlide.chapterTitle}!`);
    } catch (err) {
      console.warn("Neon storage upload warning, falling back to local preview URL:", err);
      const localUrl = URL.createObjectURL(file);
      onUpdateSlideMedia(selectedSlideId, localUrl, isVideo ? 'video' : 'image');
      setSuccessMsg(`Loaded local preview for ${currentSlide.chapterTitle}!`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setSuccessMsg(''), 4500);
    }
  };

  const handleApplyUrl = async (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    try {
      await onUpdateSlideMedia(selectedSlideId, customUrl.trim(), selectedType);
      setSuccessMsg(`Saved image URL to Neon database for ${currentSlide.chapterTitle}!`);
      setCustomUrl('');
    } catch (err) {
      setSuccessMsg(`Failed to save to database: ${err.message}`);
    } finally {
      setTimeout(() => setSuccessMsg(''), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-2xl w-full max-h-[90vh] bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-800 bg-stone-950 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-serif text-white font-medium">
                Upload Story Picture / Video
              </h3>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>Neon S3 + DB</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Uploaded media is permanently stored in your Neon Object Storage bucket (<code>assets</code>) and saved to the <code>story_slides</code> table.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Select Slide */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-2">
              1. Choose Story Chapter to Update:
            </label>
            <select
              value={selectedSlideId}
              onChange={(e) => setSelectedSlideId(Number(e.target.value))}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-200 focus:outline-none focus:border-rose-400"
            >
              {slides.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.chapter}: {s.chapterTitle} ({s.date}) {s.isCustomMedia ? '★ (Neon S3)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Current Slide Preview */}
          <div className="border border-stone-800 rounded-2xl p-4 bg-stone-950 flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden bg-black shrink-0 relative">
              {currentSlide.type === 'video' ? (
                <video src={currentSlide.mediaUrl} className="w-full h-full object-cover" muted autoPlay loop />
              ) : (
                <img src={currentSlide.mediaUrl} alt="" className="w-full h-full object-cover" />
              )}
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] bg-black/70 text-stone-300 uppercase">
                {currentSlide.type}
              </span>
              {currentSlide.isCustomMedia && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 font-medium">
                  Neon S3
                </span>
              )}
            </div>
            <div className="text-xs text-stone-400 space-y-1">
              <p className="text-white font-medium text-sm">{currentSlide.chapterTitle}</p>
              <p className="italic text-stone-400 line-clamp-2">"{currentSlide.subtitle}"</p>
            </div>
          </div>

          {/* Upload File to Neon Object Storage */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-2">
              2. Upload Photo or Video (Saved to Neon Bucket & Database):
            </label>
            <label className={`border-2 border-dashed ${isUploading ? 'border-amber-400 bg-amber-950/20 cursor-wait' : 'border-stone-700 hover:border-rose-400/80 hover:bg-stone-950/80 cursor-pointer'} rounded-2xl p-6 flex flex-col items-center justify-center transition-colors bg-stone-950/40`}>
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-amber-400 mb-2 animate-spin" />
                  <span className="text-sm text-amber-200 font-medium">Uploading to Neon Object Storage bucket...</span>
                  <span className="text-xs text-stone-400 mt-1">Connecting to Neon S3 & updating PostgreSQL...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-8 h-8 text-rose-400 mb-2 animate-bounce" />
                  <span className="text-sm text-stone-200 font-medium">Click to select photo or video for this slide</span>
                  <span className="text-xs text-stone-500 mt-1">Saves to bucket <code>assets/story-slides/</code> & links to database</span>
                </>
              )}
              <input
                type="file"
                disabled={isUploading}
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Or Paste URL Option */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-2">
              Or Save Custom URL in Database:
            </label>
            <form onSubmit={handleApplyUrl} className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/our-photo.jpg"
                className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-rose-400"
              />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs tracking-wider uppercase transition-colors shrink-0"
              >
                Save to DB
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <button
            onClick={async () => {
              if (onResetDefaults) {
                await onResetDefaults();
                setSuccessMsg("Reset all slides to original database defaults.");
                setTimeout(() => setSuccessMsg(''), 3000);
              }
            }}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
