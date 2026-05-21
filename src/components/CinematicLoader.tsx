import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CinematicLoaderProps {
  onBegin: () => void;
}

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({ onBegin }) => {
  const [showButton, setShowButton] = useState(false);

  const text = "A special day because someone special was born today… ❤️";
  
  // Staggered word animation
  const words = text.split(" ");

  useEffect(() => {
    // Show the "Begin" button shortly after the text completes revealing
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 3500); // Give plenty of time for words to animate
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] overflow-hidden select-none">
      {/* Background ambient lighting glow */}
      <div className="absolute w-[300px] h-[300px] bg-gold/5 rounded-full blur-[100px] glow-circle animate-pulse-slow" />
      <div className="absolute w-[200px] h-[200px] bg-pink-soft/5 rounded-full blur-[80px] glow-circle animate-float-slow" />

      {/* Cinematic Text Reveal */}
      <div className="text-center px-6 max-w-xl z-10 select-none">
        <h2 className="font-serif-elegant text-2xl md:text-3xl text-white/90 font-light leading-relaxed tracking-wider gold-glow-text mb-8">
          {words.map((word, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: 1.8,
                delay: idx * 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="inline-block mr-2 md:mr-3"
            >
              {word}
            </motion.span>
          ))}
        </h2>
      </div>

      {/* Subtitle / Interaction unlock button */}
      <div className="h-20 flex items-center justify-center z-10">
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(5px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-4"
            >
              <button
                onClick={onBegin}
                className="px-8 py-3 rounded-full border border-gold/30 font-sans-clean text-xs uppercase tracking-[0.25em] text-gold hover:text-white bg-gold/5 hover:bg-gold/15 transition-all duration-700 cursor-pointer shadow-[0_0_15px_rgba(255,215,0,0.05)] hover:shadow-[0_0_25px_rgba(255,215,0,0.2)] hover:border-gold/60 font-medium active:scale-95"
                id="enter-experience-btn"
              >
                Begin Experience
              </button>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 1, duration: 1 }}
                className="text-[10px] uppercase tracking-[0.15em] text-white/70 font-sans-clean font-light"
              >
                Turn on sound for the best experience
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating particles specific to loading screen */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100 - Math.random() * 100],
              opacity: [0, 0.7, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 8 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
};
