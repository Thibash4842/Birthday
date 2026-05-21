import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';

gsap.registerPlugin(ScrollTrigger);

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  gravity: number;
  friction: number;
}

interface Rocket {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  color: string;
  exploded: boolean;
}

export const FinalSurprise: React.FC<{ onReplay: () => void }> = ({ onReplay }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textRef = useRef<HTMLHeadingElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // States
  const [active, setActive] = useState(false);

  // Confetti intervals
  useEffect(() => {
    if (!active) return;

    // Standard high-quality confetti bursts
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: number = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);
      // Confetti from two sides
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, [active]);

  // GSAP trigger for activation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    ScrollTrigger.create({
      trigger: container,
      start: "top 40%",
      onEnter: () => {
        setActive(true);
      },
      onLeaveBack: () => {
        setActive(false);
      }
    });

    if (textRef.current && buttonRef.current) {
      gsap.fromTo(
        textRef.current,
        { opacity: 0, scale: 0.95, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 2.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: container,
            start: "top 40%",
            toggleActions: "play none none reverse",
          }
        }
      );

      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          delay: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: container,
            start: "top 40%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }
  }, []);

  // Canvas Fireworks simulation loop
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rockets: Rocket[] = [];
    let particles: FireworkParticle[] = [];

    const colors = ['#FFD700', '#FFC0CB', '#FF1493', '#FFFFFF', '#FFA500'];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const spawnRocket = () => {
      const x = Math.random() * canvas.width;
      const y = canvas.height;
      const tx = Math.random() * canvas.width;
      const ty = Math.random() * (canvas.height * 0.5); // Explode in top half
      
      const angle = Math.atan2(ty - y, tx - x);
      const speed = Math.random() * 5 + 10;
      
      rockets.push({
        x,
        y,
        tx,
        ty,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        exploded: false,
      });
    };

    const explode = (x: number, y: number, color: string) => {
      const count = Math.random() * 40 + 60;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1.0,
          color,
          size: Math.random() * 2 + 1,
          gravity: 0.08,
          friction: 0.97,
        });
      }
    };

    const draw = () => {
      // Dark translucent background to create trails
      ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Spawn rockets randomly
      if (Math.random() < 0.04) {
        spawnRocket();
      }

      // 2. Update rockets
      rockets = rockets.filter(r => !r.exploded);
      rockets.forEach(r => {
        r.x += r.vx;
        r.y += r.vy;

        // Draw rocket trail
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Check if rocket reached explosion height
        if (r.vy >= 0 || r.y <= r.ty) {
          explode(r.x, r.y, r.color);
          r.exploded = true;
        }
      });

      // 3. Update particles
      particles = particles.filter(p => p.alpha > 0.02);
      particles.forEach(p => {
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015; // Fade out

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = p.size * 6;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen flex flex-col justify-center items-center bg-[#090909] overflow-hidden select-none"
      id="final-surprise-section"
    >
      {/* Zooming background glow */}
      <div 
        className="absolute inset-0 bg-cover bg-center -z-20 transform scale-100 transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: "url('/assets/hero_bg.png')",
          transform: active ? 'scale(1.1)' : 'scale(1.0)',
          filter: 'brightness(0.3) blur(2px)',
        }}
      />
      <div className="absolute inset-0 bg-black/60 -z-10" />

      {/* Fireworks Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Greeting message and CTA */}
      <div className="z-10 text-center px-6 max-w-4xl flex flex-col items-center gap-10">
        
        {/* Title greeting */}
        <h2
          ref={textRef}
          className="font-serif-elegant text-3xl sm:text-5xl md:text-6xl font-light text-white leading-relaxed tracking-wider drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        >
          You deserve happiness not only today,
          <br />
          <span className="font-semibold text-gold gold-glow-text mt-4 block">
            but every day of your life.
          </span>
        </h2>

        {/* Action Button */}
        <button
          ref={buttonRef}
          onClick={onReplay}
          className="px-8 py-3 rounded-full border border-gold/40 bg-gold/10 hover:bg-gold/20 text-gold hover:text-white font-sans-clean text-xs uppercase tracking-[0.25em] transition-all duration-500 cursor-pointer shadow-[0_0_15px_rgba(255,215,0,0.1)] hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:border-gold active:scale-95"
          id="replay-experience-btn"
        >
          Replay Story
        </button>

      </div>
    </section>
  );
};
