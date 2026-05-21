import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const nameRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    // GSAP staggered character animation for title
    if (titleRef.current) {
      const chars = titleRef.current.innerText.split("");
      titleRef.current.innerHTML = chars
        .map((char) => `<span class="inline-block opacity-0 transform translate-y-6 filter blur-[4px]">${char === " " ? "&nbsp;" : char}</span>`)
        .join("");

      const spans = titleRef.current.querySelectorAll("span");
      gsap.to(spans, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.08,
        duration: 1.5,
        ease: "power4.out",
        delay: 0.5,
      });
    }

    // GSAP reveal for subtitle sentences
    if (subtitleRef.current && nameRef.current) {
      gsap.fromTo(
        nameRef.current,
        { opacity: 0, filter: 'blur(4px)', y: 10 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.5, delay: 1.8, ease: "power3.out" }
      );

      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 0.85, y: 0, duration: 1.8, delay: 2.2, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* Zooming background image with dark vignette overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center -z-20 transform scale-110 animate-[zoom-out_20s_ease-out_forwards]"
        style={{ backgroundImage: "url('/assets/hero_bg.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-dark-bg/40 -z-10" />

      {/* Floating Hearts particle field */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-soft/20 text-lg md:text-2xl"
            style={{
              left: `${15 + Math.random() * 70}%`,
              bottom: `-5%`,
            }}
            animate={{
              y: ['0vh', '-105vh'],
              x: [0, (Math.random() - 0.5) * 60],
              rotate: [0, (Math.random() - 0.5) * 90],
              opacity: [0, 0.4, 0.4, 0],
            }}
            transition={{
              duration: 12 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 2,
              ease: 'linear',
            }}
          >
            ❤️
          </motion.div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="text-center px-6 max-w-4xl z-10">
        <h1
          ref={titleRef}
          className="font-serif-elegant text-5xl md:text-8xl font-bold tracking-tight text-white mb-6 uppercase white-glow-text"
        >
          Happy Birthday ❤️
        </h1>

        <div className="flex flex-col items-center">
          <span
            ref={nameRef}
            className="font-serif-elegant text-2xl md:text-4xl text-gold font-light tracking-wide gold-glow-text mb-4"
          >
            KAMALI
          </span>
          <p
            ref={subtitleRef}
            className="font-sans-clean text-base md:text-xl font-light text-white/95 max-w-2xl leading-relaxed tracking-wider"
          >
            today is not just your birthday…
            <br />
            <span className="block mt-2 font-medium text-white">
              Today celebrates the existence of someone truly special.
            </span>
          </p>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ delay: 4, duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-10 z-10 flex flex-col items-center gap-2 cursor-pointer font-sans-clean"
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth',
          });
        }}
      >
        <span className="text-[10px] tracking-[0.3em] uppercase text-white/60">Scroll to Reveal</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gold/80 to-transparent" />
      </motion.div>

      {/* CSS Animation specifically for background zoom-out */}
      <style>{`
        @keyframes zoom-out {
          0% {
            transform: scale(1.15);
            filter: brightness(0.6) blur(2px);
          }
          100% {
            transform: scale(1.0);
            filter: brightness(0.85) blur(0px);
          }
        }
      `}</style>
    </div>
  );
};
