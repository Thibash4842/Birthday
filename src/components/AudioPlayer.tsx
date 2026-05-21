import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  isPlaying: boolean;
  onTogglePlay?: (playing: boolean) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ isPlaying, onTogglePlay }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [useSynth, setUseSynth] = useState(false);
  
  // Web Audio Synth Fallback References
  const synthIntervalRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Audio
  useEffect(() => {
    const audio = new Audio('https://upload.wikimedia.org/wikipedia/commons/d/dd/Gymnopedie_No._1.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    // Handle error - if loading the MP3 fails, switch to custom synth fallback
    audio.onerror = () => {
      console.warn("Failed to load audio MP3, falling back to procedural synthesizer.");
      setUseSynth(true);
    };

    return () => {
      audio.pause();
      if (synthIntervalRef.current) {
        window.clearInterval(synthIntervalRef.current);
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Web Audio API Synthesizer (Procedural ambient background chords)
  const startSynth = () => {
    if (synthIntervalRef.current) return;
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Romantic/emotional chord progression: Dmaj7 -> Amajor7 -> Gmaj7 -> F#m7
      // Play notes slow, soft, with long attack/release
      const chords = [
        [50, 57, 61, 64, 69], // Dmaj9 (D3, A3, C#4, E4, A4)
        [45, 52, 56, 61, 64], // Amaj9 (A2, E3, G#3, C#4, E4)
        [47, 54, 57, 60, 66], // Gmaj9 (G2, D3, F#3, B3, F#4)
        [42, 49, 52, 57, 61]  // F#m7  (F#2, C#3, E3, A3, C#4)
      ];

      let chordIndex = 0;

      const playChord = () => {
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const now = ctx.currentTime;
        const chordNotes = chords[chordIndex];
        
        chordNotes.forEach((midiNote, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          // Smooth sine/triangle wave for soft tone
          osc.type = idx === 0 ? 'sine' : 'triangle';
          // Convert MIDI note to frequency
          osc.frequency.setValueAtTime(440 * Math.pow(2, (midiNote - 69) / 12), now);

          // Dark lowpass filter for warmth
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(idx === 0 ? 300 : 500, now);
          filter.Q.setValueAtTime(1, now);

          // Gain envelope (long attack, long sustain, long release)
          // Total duration: 8 seconds per chord
          gain.gain.setValueAtTime(0, now);
          // Stagger note triggers slightly for realistic human piano sound
          const delay = idx * 0.15;
          gain.gain.linearRampToValueAtTime(idx === 0 ? 0.08 : 0.03, now + 1.5 + delay); // Soft
          gain.gain.setValueAtTime(idx === 0 ? 0.08 : 0.03, now + 5.5);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 7.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 8.0);
        });

        chordIndex = (chordIndex + 1) % chords.length;
      };

      // Play first chord immediately
      playChord();
      
      // Schedule chords every 8 seconds
      synthIntervalRef.current = window.setInterval(playChord, 8000);
    } catch (e) {
      console.error("Web Audio API not supported or failed to initialize", e);
    }
  };

  const stopSynth = () => {
    if (synthIntervalRef.current) {
      window.clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.suspend();
    }
  };

  // Play / Pause / Mute logic triggered by state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && !muted) {
      if (useSynth) {
        startSynth();
      } else {
        audio.play().catch((err) => {
          console.warn("Autoplay blocked or failed, falling back to synth", err);
          setUseSynth(true);
        });
      }
    } else {
      if (useSynth) {
        stopSynth();
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, muted, useSynth]);

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    if (onTogglePlay) {
      onTogglePlay(!newMuted);
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
      {isPlaying && !muted && (
        <span className="hidden sm:inline-block font-sans-clean text-xs tracking-widest text-gold opacity-60 uppercase gold-glow-text">
          {useSynth ? "Procedural Ambient Pad" : "Gymnopédie No. 1"}
        </span>
      )}
      <button
        onClick={toggleMute}
        className="w-12 h-12 rounded-full border border-gold/20 flex items-center justify-center glass-card glass-card-hover cursor-pointer group transition-all duration-300 relative overflow-hidden"
        title={muted || !isPlaying ? "Play Background Music" : "Mute Background Music"}
        id="audio-toggle-btn"
      >
        {muted || !isPlaying ? (
          <VolumeX className="w-5 h-5 text-pink-soft group-hover:text-gold transition-colors duration-300" />
        ) : (
          <div className="flex items-center justify-center relative">
            <Volume2 className="w-5 h-5 text-gold group-hover:text-white transition-colors duration-300" />
            {/* Ambient Pulse Ring */}
            <div className="absolute -inset-2 rounded-full border border-gold/30 animate-ping opacity-75" />
          </div>
        )}
      </button>
    </div>
  );
};
