import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Star {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  angle: number;
  speed: number;
  brightness: number;
  color: string;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

export const StarCountdown: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const clockRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 8,
    minutes: 42,
    seconds: 15,
  });

  // Calculate dynamic target date (14 days from current date so it's always running)
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14);
    targetDate.setHours(targetDate.getHours() + 5);
    targetDate.setMinutes(targetDate.getMinutes() + 30);

    const timer = setInterval(() => {
      const difference = +targetDate - +new Date();
      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // GSAP animation for text & clock entrance
  useEffect(() => {
    if (titleRef.current && clockRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          }
        }
      );

      gsap.fromTo(
        clockRef.current,
        { opacity: 0, scale: 0.9, y: 40 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.8,
          ease: "power4.out",
          scrollTrigger: {
            trigger: clockRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }
  }, []);

  // Canvas Constellation & Sparks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    let sparks: Spark[] = [];
    const maxSparks = 100;
    const connectionDist = 120;
    const starCount = 60;

    const mouse = { x: -1000, y: -1000, active: false };

    const handleResize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || 600;
      initStars();
    };

    const initStars = () => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        stars.push({
          x,
          y,
          baseX: x,
          baseY: y,
          size: Math.random() * 2 + 1,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.01 + 0.002,
          brightness: Math.random() * 0.5 + 0.5,
          color: Math.random() > 0.7 ? '#FFD700' : '#FFFFFF', // Gold or white stars
        });
      }
    };

    const spawnSparks = (x: number, y: number) => {
      // Spawn golden/pink spark particles on hover
      for (let i = 0; i < 4; i++) {
        if (sparks.length < maxSparks) {
          sparks.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3 - 1, // slight float up
            size: Math.random() * 3 + 1,
            alpha: 1,
            decay: Math.random() * 0.03 + 0.01,
            color: Math.random() > 0.5 ? '#FFD700' : '#FFC0CB',
          });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;

      // Spawn sparks if mouse is close to any star
      stars.forEach(star => {
        const dx = mouse.x - star.x;
        const dy = mouse.y - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 40) {
          spawnSparks(star.x, star.y);
          star.brightness = 1.5; // Glow intensely on hover
        }
      });
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Init
    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || 600;
    initStars();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw constellation lines
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.05)';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            // Draw line, fade out based on distance
            const alpha = (1 - dist / connectionDist) * 0.15;
            ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update stars
      stars.forEach(star => {
        // Star breathing/sparkling effect
        star.angle += star.speed;
        const breathing = Math.sin(star.angle) * 0.3;

        // Slowly float star
        star.x = star.baseX + Math.sin(star.angle) * 5;
        star.y = star.baseY + Math.cos(star.angle) * 5;

        // Interaction with mouse position (pull slightly toward mouse or repulse)
        if (mouse.active) {
          const dx = mouse.x - star.x;
          const dy = mouse.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const force = (100 - dist) / 100;
            // Push stars slightly away from mouse
            star.x -= (dx / dist) * force * 15;
            star.y -= (dy / dist) * force * 15;
            star.brightness += (1.5 - star.brightness) * 0.1;
          } else {
            star.brightness += (Math.random() * 0.5 + 0.5 - star.brightness) * 0.02;
          }
        } else {
          star.brightness += (Math.random() * 0.5 + 0.5 - star.brightness) * 0.02;
        }

        ctx.fillStyle = star.color;
        ctx.shadowBlur = (star.size + breathing) * 6 * star.brightness;
        ctx.shadowColor = star.color === '#FFD700' ? 'rgba(255, 215, 0, 0.6)' : 'rgba(255, 255, 255, 0.4)';

        ctx.beginPath();
        ctx.arc(star.x, star.y, Math.max(0.5, star.size + breathing), 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0; // reset
      });

      // Update and draw sparks
      sparks = sparks.filter(spark => spark.alpha > 0.05);
      sparks.forEach(spark => {
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.alpha -= spark.decay;

        ctx.fillStyle = spark.color;
        ctx.globalAlpha = spark.alpha;
        ctx.shadowBlur = 5;
        ctx.shadowColor = spark.color;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0; // Reset alpha
      ctx.shadowBlur = 0; // Reset shadow

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-24 px-6 md:px-12 bg-dark-bg min-h-[600px] flex flex-col justify-center items-center overflow-hidden select-none"
      id="countdown-section"
    >
      {/* Constellation Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto"
      />

      <div className="relative z-10 max-w-4xl w-full text-center flex flex-col items-center gap-12 pointer-events-none">

        {/* Section Title */}
        <div ref={titleRef} className="flex flex-col gap-2">
          <h2 className="font-serif-elegant text-3xl md:text-5xl font-light text-white tracking-widest uppercase gold-glow-text">
            Birthday Countdown Stars
          </h2>
          <p className="font-sans-clean text-xs text-white/50 tracking-widest uppercase">
            Hover over the stars to see the night sky respond
          </p>
        </div>

        {/* Cinematic Celestial Clock Display */}
        <div
          ref={clockRef}
          className="glass-card rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-[0_0_50px_rgba(255,215,0,0.02)] border border-gold/15 flex flex-wrap justify-center items-center gap-8 md:gap-12 relative overflow-hidden"
        >
          {/* Subtle gold clock ticks behind text */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.03)_0%,transparent_70%)]" />

          {/* Time units */}
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Mins", value: timeLeft.minutes },
            { label: "Secs", value: timeLeft.seconds },
          ].map((unit, idx) => (
            <div key={idx} className="flex flex-col items-center min-w-[70px] md:min-w-[90px] relative z-10">
              <span className="font-serif-elegant text-4xl md:text-6xl font-light text-gold gold-glow-text tracking-normal tabular-nums animate-[pulse_2s_infinite]">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="font-sans-clean text-[10px] md:text-xs tracking-[0.2em] text-white/50 uppercase mt-2 font-medium">
                {unit.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
