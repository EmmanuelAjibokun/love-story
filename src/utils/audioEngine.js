/**
 * Romantic Wedding Audio Engine
 * Combines an HTML5 Audio streaming track with a smooth procedural Web Audio
 * synthesizer backup to ensure 100% reliable romantic background music.
 */

class RomanticAudioEngine {
  constructor() {
    this.audioContext = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.65;
    this.gainNode = null;
    this.sequenceTimer = null;
    this.externalAudio = null;
    this.useSynth = false;

    // Primary: local track served from /public — no CORS, no auth required
    this.trackUrl = "/You Was (1996 Digital Remaster).mp3";
    // Fallback: CDN track if local file fails to load
    this.fallbackTrackUrl = "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=gentle-piano-love-story-124008.mp3";

    this.listeners = new Set();
  }

  init() {
    if (!this.audioContext && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      this.gainNode.connect(this.audioContext.destination);
    }

    if (!this.externalAudio) {
      this.externalAudio = new Audio();
      this.externalAudio.src = this.trackUrl;
      this.externalAudio.loop = true;
      this.externalAudio.volume = this.volume;
      // Note: crossOrigin is intentionally omitted for Google Drive URLs,
      // as Drive does not send CORS headers. Audio plays via native <audio>
      // element volume control instead of routing through the Web Audio gainNode.

      // If network fails to load external track, seamlessly fall back to our procedural synthesizer
      this.externalAudio.addEventListener('error', () => {
        console.warn("External audio source blocked or unavailable, switching to procedural romantic synthesizer.");
        this.useSynth = true;
        if (this.isPlaying) {
          this.startSynthChords();
        }
      });
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn({
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume
    }));
  }

  async play() {
    this.init();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isPlaying = true;

    if (!this.useSynth && this.externalAudio) {
      try {
        await this.externalAudio.play();
      } catch (err) {
        console.warn("Audio element play error, falling back to Web Audio synthesizer:", err);
        this.useSynth = true;
        this.startSynthChords();
      }
    } else {
      this.startSynthChords();
    }

    this.notify();
  }

  pause() {
    this.isPlaying = false;
    if (this.externalAudio) {
      this.externalAudio.pause();
    }
    if (this.sequenceTimer) {
      clearInterval(this.sequenceTimer);
      this.sequenceTimer = null;
    }
    this.notify();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.externalAudio) {
      this.externalAudio.muted = muted;
    }
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setValueAtTime(muted ? 0 : this.volume, this.audioContext.currentTime);
    }
    this.notify();
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.externalAudio) {
      this.externalAudio.volume = this.volume;
    }
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioContext.currentTime);
    }
    this.notify();
  }

  // Romantic harmonic synthesizer (Plays warm Pachelbel / Einaudi style arpeggio in C Major)
  startSynthChords() {
    if (this.sequenceTimer) return;
    if (!this.audioContext) return;

    // Chord progressions: C - G/B - Am - F (Standard warm romantic progression)
    // Frequencies in Hz:
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C - E - G - C
      [246.94, 293.66, 392.00, 493.88], // B - D - G - B
      [220.00, 261.63, 329.63, 440.00], // A - C - E - A
      [174.61, 220.00, 261.63, 349.23], // F - A - C - F
    ];

    let chordIndex = 0;
    let noteIndex = 0;

    const playArpeggioStep = () => {
      if (!this.isPlaying) return;
      const currentChord = chords[chordIndex];
      const freq = currentChord[noteIndex % currentChord.length];
      this.playPianoNote(freq, 1.2);

      noteIndex++;
      if (noteIndex % currentChord.length === 0) {
        chordIndex = (chordIndex + 1) % chords.length;
      }
    };

    // Play initial note then loop every 450ms
    playArpeggioStep();
    this.sequenceTimer = setInterval(playArpeggioStep, 450);
  }

  playPianoNote(frequency, duration) {
    if (!this.audioContext || !this.gainNode || this.isMuted) return;

    try {
      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const noteGain = this.audioContext.createGain();

      // Triangle/Sine mix gives a gentle bell/electric piano tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);

      // Envelope: soft attack, gentle decay
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.25 * this.volume, now + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch (e) {
      // Audio context might be closing
    }
  }
}

export const audioEngine = new RomanticAudioEngine();
