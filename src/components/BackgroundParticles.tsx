import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  baseSpeedX: number;
  baseSpeedY: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  parallaxFactor: number; // multiplier for mouse parallax
  wobbleSpeed: number;
  wobbleRange: number;
  wobbleAngle: number;
}

export const BackgroundParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollRef = useRef({ y: 0, lastY: 0, speed: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 20000)); // Cap for performance

    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    // Color definitions
    const colors = [
      'rgba(255, 215, 0, ', // Gold
      'rgba(255, 192, 203, ', // Soft Pink
      'rgba(255, 255, 255, ', // Warm White
    ];

    // Initialize particles
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 4 + 0.5; // Stardust sizes
        const isBokeh = Math.random() > 0.85; // 15% chance to be a large bokeh circle
        const pSize = isBokeh ? Math.random() * 45 + 15 : size;
        const colorBase = colors[Math.floor(Math.random() * colors.length)];
        const opacity = isBokeh ? Math.random() * 0.05 + 0.02 : Math.random() * 0.4 + 0.15;

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: pSize,
          baseSpeedX: (Math.random() - 0.5) * 0.3,
          baseSpeedY: -(Math.random() * 0.4 + 0.1), // Float upwards by default
          speedX: 0,
          speedY: 0,
          opacity: opacity,
          color: colorBase + opacity + ')',
          parallaxFactor: isBokeh ? 0.03 : Math.random() * 0.08 + 0.02,
          wobbleSpeed: Math.random() * 0.02 + 0.005,
          wobbleRange: Math.random() * 1.5 + 0.5,
          wobbleAngle: Math.random() * Math.PI * 2,
        });
      }
    };

    // Track Mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX - window.innerWidth / 2;
      mouseRef.current.targetY = e.clientY - window.innerHeight / 2;
    };

    // Track Scroll
    const handleScroll = () => {
      scrollRef.current.y = window.scrollY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    // Initial setup
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();

    // Loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse interpolation (easing)
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Smooth scroll calculation
      const scroll = scrollRef.current;
      scroll.speed = (scroll.y - scroll.lastY) * 0.1;
      scroll.lastY += (scroll.y - scroll.lastY) * 0.1;

      particles.forEach((p) => {
        // Wobble motion
        p.wobbleAngle += p.wobbleSpeed;
        const wobbleX = Math.sin(p.wobbleAngle) * p.wobbleRange;

        // Apply basic movement + scroll drift + mouse parallax
        p.x += p.baseSpeedX + wobbleX * 0.1 - mouse.x * p.parallaxFactor * 0.1;
        p.y += p.baseSpeedY - scroll.speed * p.parallaxFactor * 4 - mouse.y * p.parallaxFactor * 0.1;

        // Wrap around borders
        if (p.x < -p.size) p.x = canvas.width + p.size;
        if (p.x > canvas.width + p.size) p.x = -p.size;
        if (p.y < -p.size) p.y = canvas.height + p.size;
        if (p.y > canvas.height + p.size) p.y = -p.size;

        // Draw particle
        ctx.beginPath();
        if (p.size > 10) {
          // Large blurry bokeh circle: render radial gradient for realistic soft lighting
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, p.color);
          grad.addColorStop(0.3, p.color);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Sharp glowing stardust
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = p.size > 2 ? 8 : 0;
          ctx.shadowColor = 'rgba(255, 215, 0, 0.4)';
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none bg-dark-bg"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
