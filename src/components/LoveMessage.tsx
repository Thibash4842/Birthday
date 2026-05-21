import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const LoveMessage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const line1Ref = useRef<HTMLParagraphElement | null>(null);
  const line2Ref = useRef<HTMLParagraphElement | null>(null);
  const line3Ref = useRef<HTMLParagraphElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Golden halo breathing animation
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        scale: 1.25,
        opacity: 0.22,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    // ScrollTrigger line fade-ins
    const lines = [line1Ref.current, line2Ref.current, line3Ref.current];
    lines.forEach((line, idx) => {
      if (!line) return;
      gsap.fromTo(
        line,
        { opacity: 0, y: 30, filter: "blur(5px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.8,
          delay: idx * 0.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: line,
            start: "top 80%",
            toggleActions: "play none none reverse",
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === line1Ref.current || trigger.vars.trigger === line2Ref.current || trigger.vars.trigger === line3Ref.current) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[70vh] flex flex-col items-center justify-center py-20 px-6 bg-[#090909] overflow-hidden select-none"
      id="love-message-section"
    >
      {/* Slow breathing romantic glow halo */}
      <div
        ref={glowRef}
        className="absolute w-[280px] h-[280px] sm:w-[450px] sm:h-[450px] bg-gradient-to-tr from-gold to-pink-soft rounded-full opacity-10 filter blur-[100px] pointer-events-none -z-10"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Elegant Frame lines */}
      <div className="absolute w-[80%] max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent top-0" />
      <div className="absolute w-[80%] max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent bottom-0" />

      {/* Message content */}
      <div className="text-center max-w-3xl flex flex-col gap-6 md:gap-8 z-10 px-4">
        <p
          ref={line1Ref}
          className="font-script-love text-4xl md:text-6xl text-pink-soft font-light tracking-wide leading-snug drop-shadow-[0_0_10px_rgba(255,192,203,0.15)]"
        >
          No matter how much time passes,
        </p>
        <p
          ref={line2Ref}
          className="font-script-love text-4.5xl md:text-7xl text-white/95 font-medium tracking-wide leading-snug"
        >
          I wish your smile remains forever.
        </p>
        <p
          ref={line3Ref}
          className="font-script-love text-4.5xl md:text-7xl text-gold font-light tracking-wide leading-snug drop-shadow-[0_0_15px_rgba(255,215,0,0.15)]"
        >
          May every day become special for you.
        </p>
        <p
          ref={line3Ref}
          className="font-script-love text-2.5xl md:text-4xl text-white font-light tracking-wide leading-snug drop-shadow-[0_0_15px_rgba(255,215,0,0.15)]"
        >
          Every moment with you is a beautiful memory ✨, and today, I just want to celebrate YOU 🎂 – the light you are 🌟, the love you give ❤️, and the joy you bring into my world 😊
        </p>
        <p
          ref={line3Ref}
          className="font-script-love text-2.5xl md:text-4xl text-white font-light tracking-wide leading-snug drop-shadow-[0_0_15px_rgba(255,215,0,0.15)]"
        >
          On your special day 🎈, I wish you endless happiness 😄, good health 💪, and all the success your heart desires 🌈. May all your dreams come true 🌠, and may this year bring you even more love 💕, laughter 😂, and beautiful moments 🌸.
        </p>
        <p
          ref={line3Ref}
          className="font-script-love text-2.5xl md:text-4xl text-white font-light tracking-wide leading-snug drop-shadow-[0_0_15px_rgba(255,215,0,0.15)]"
        >
         Thank you for being you 🙏... for your kindness 🤍, your warmth 🔥, and your beautiful heart 💝. I feel so lucky 🍀 to have you in my life.
        </p>
      </div>
    </section>
  );
};
