import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import * as THREE from 'three';

interface StarMemory {
  id: number;
  title: string;
  caption: string;
  image: string;
  label: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface HeartBurst {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  delay: number;
  color: string;
}

const starMemories: StarMemory[] = [
  {
    id: 1,
    title: 'That Cute Smile 🩷',
    caption: 'Your smile deserves to stay forever, because somewhere along the way… it became my favorite place to find happiness. ✨❤️',
    image: '/assets/memory_1.png',
    label: 'Cutie Smile',
    x: 14,
    y: 26,
    size: 26,
    color: '#FFE7FF',
  },
  {
    id: 2,
    title: 'Little Sunshine ☀️',
    caption: 'Some people carry happiness without knowing, and you unknowingly became the place where my heart feels safest. ✨❤️',
    image: '/assets/memory_2.png',
    label: 'Sunshine Girl',
    x: 28,
    y: 58,
    size: 20,
    color: '#FFD8E2',
  },
  {
    id: 3,
    title: 'Princess Moment 👑',
    caption: 'This photo looks like happiness in human form, carrying the smile that quietly became my favorite part of every day. ✨❤️',
    image: '/assets/memory_3.png',
    label: 'Pretty Princess',
    x: 62,
    y: 18,
    size: 24,
    color: '#FFF2C8',
  },
  {
    id: 4,
    title: 'Butterfly Energy 🦋',
    caption: 'This photo looks like happiness in human form, carrying a smile that makes everything feel brighter. ✨💖',
    image: '/assets/memory_4.png',
    label: 'Butterfly Girl',
    x: 78,
    y: 56,
    size: 16,
    color: '#DCE8FF',
  },
  {
    id: 5,
    title: 'Moonlight Beauty 🌙',
    caption: 'Even stars would pause for this smile, but my heart stayed… because it found something worth loving forever. ✨❤️',
    image: '/assets/memory_5.png',
    label: 'Moonlight',
    x: 48,
    y: 42,
    size: 18,
    color: '#FFEBE9',
  },
  {
    id: 6,
    title: 'Pikachu Energy ⚡',
    caption: 'Tiny smile. Huge happiness… and somewhere between those smiles, my heart quietly chose you forever. ✨❤️',
    image: '/assets/memory_6.png',
    label: 'Cute Spark',
    x: 18,
    y: 74,
    size: 30,
    color: '#FFF4D8',
  },
  {
    id: 7,
    title: 'Birthday Angel 🎂✨',
    caption: 'May your smile stay forever, and your heart stay light… because if I ever prayed for something, it would always be your happiness. ❤️✨',
    image: '/assets/memory_7.png',
    label: 'Special Girl',
    x: 82,
    y: 32,
    size: 22,
    color: '#FFD6F1',
  },
];

const createLineConnections = (stars: StarMemory[]) => {
  const connections = [] as Array<{ from: StarMemory; to: StarMemory; alpha: number }>;
  const threshold = 30;

  for (let i = 0; i < stars.length; i += 1) {
    for (let j = i + 1; j < stars.length; j += 1) {
      const dx = stars[i].x - stars[j].x;
      const dy = stars[i].y - stars[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < threshold) {
        connections.push({
          from: stars[i],
          to: stars[j],
          alpha: Number((1 - distance / threshold).toFixed(2)),
        });
      }
    }
  }

  return connections;
};

const createHeartBursts = (star: StarMemory): HeartBurst[] => {
  return Array.from({ length: 7 }, (_, index) => ({
    id: `${star.id}-${index}-${Date.now()}`,
    x: star.x,
    y: star.y,
    dx: (Math.random() - 0.5) * 120,
    dy: (Math.random() - 0.5) * 120 - 20,
    delay: Math.random() * 0.12,
    color: Math.random() > 0.5 ? '#FFD700' : '#FF85C1',
  }));
};

export const MemoryTimeline: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const bgCanvasRef = useRef<HTMLDivElement | null>(null);
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [discovered, setDiscovered] = useState<Record<number, boolean>>({});
  const [heartBursts, setHeartBursts] = useState<HeartBurst[]>([]);
  const [showCollage, setShowCollage] = useState(false);

  const discoveredCount = Object.keys(discovered).length;
  const allDiscovered = discoveredCount === starMemories.length;
  const activeStar = starMemories.find((star) => star.id === selectedStar) ?? null;
  const connections = useMemo(() => createLineConnections(starMemories), []);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
    );
  }, []);

  useEffect(() => {
    const container = bgCanvasRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1200;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const phases = new Float32Array(starCount);

    for (let i = 0; i < starCount; i += 1) {
      const radius = Math.random() * 80 + 10;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.random() * Math.PI;
      positions[i * 3] = Math.cos(theta) * Math.sin(phi) * radius;
      positions[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * radius;
      positions[i * 3 + 2] = Math.cos(phi) * radius * 0.3;

      const color = new THREE.Color(Math.random() > 0.5 ? '#ffe6f2' : '#e8f0ff');
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const baseColors = new Float32Array(colors);
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starTextureCanvas = document.createElement('canvas');
    starTextureCanvas.width = 256;
    starTextureCanvas.height = 256;
    const starTextureCtx = starTextureCanvas.getContext('2d');

    if (starTextureCtx) {
      const gradient = starTextureCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.18, 'rgba(255,245,255,0.95)');
      gradient.addColorStop(0.35, 'rgba(255,210,255,0.75)');
      gradient.addColorStop(1, 'rgba(255,210,255,0)');
      starTextureCtx.clearRect(0, 0, 256, 256);
      starTextureCtx.beginPath();
      starTextureCtx.arc(128, 128, 128, 0, Math.PI * 2);
      starTextureCtx.fillStyle = gradient;
      starTextureCtx.fill();
    }

    const starTexture = new THREE.CanvasTexture(starTextureCanvas);
    starTexture.needsUpdate = true;
    starTexture.magFilter = THREE.LinearFilter;
    starTexture.minFilter = THREE.LinearMipmapLinearFilter;
    starTexture.generateMipmaps = true;

    const starMaterial = new THREE.PointsMaterial({
      size: 1.4,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      sizeAttenuation: true,
      alphaTest: 0.2,
      blending: THREE.AdditiveBlending,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const pointLight = new THREE.PointLight(0xffd6e8, 0.8, 200);
    pointLight.position.set(40, 40, 40);
    scene.add(pointLight);

    const clock = new THREE.Clock();
    const frameRef = { id: 0 };

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      stars.rotation.y = elapsed * 0.03;
      stars.rotation.x = Math.sin(elapsed * 0.05) * 0.08;
      const twinkle = 1.35 + Math.sin(elapsed * 2.4) * 0.07;
      const pointsMaterial = stars.material as THREE.PointsMaterial;
      pointsMaterial.size = twinkle;
      pointsMaterial.opacity = 0.82 + Math.sin(elapsed * 1.8) * 0.045;

      const colorAttr = starGeometry.getAttribute('color');
      for (let i = 0; i < starCount; i += 1) {
        const phase = phases[i];
        const brightness = 0.72 + Math.sin(elapsed * 1.9 + phase) * 0.18;
        const idx = i * 3;
        colorAttr.array[idx] = baseColors[idx] * brightness;
        colorAttr.array[idx + 1] = baseColors[idx + 1] * brightness;
        colorAttr.array[idx + 2] = baseColors[idx + 2] * brightness;
      }
      colorAttr.needsUpdate = true;

      renderer.render(scene, camera);
      frameRef.id = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.id) {
        cancelAnimationFrame(frameRef.id);
      }
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      starTexture.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!allDiscovered) {
      setShowCollage(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowCollage(true);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [allDiscovered]);

  const handleRevealStar = (star: StarMemory) => {
    setSelectedStar(star.id);
    setDiscovered((prev) => ({ ...prev, [star.id]: true }));
    setHeartBursts(createHeartBursts(star));

    window.setTimeout(() => {
      setHeartBursts([]);
    }, 1200);
  };

  const handleClose = () => setSelectedStar(null);

  return (
    <section
      ref={sectionRef}
      className="relative w-full max-w-7xl mx-auto py-24 px-6 md:px-12 min-h-[900px] overflow-hidden select-none"
      id="memory-timeline-section"
    >
      <div ref={bgCanvasRef} className="absolute inset-0 -z-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,192,203,0.08),transparent_28%)] pointer-events-none" />
      <div className="absolute -left-10 top-16 w-48 h-48 bg-pink-soft/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute right-8 top-32 w-64 h-64 bg-gold/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute left-1/4 bottom-10 w-72 h-72 bg-white/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-10">
        <div className="text-center max-w-3xl mx-auto">
          <p className="font-sans-clean text-[11px] md:text-xs tracking-[0.32em] uppercase text-pink-soft/70 mb-4">
            Hidden Memories
          </p>
          <h2 className="font-serif-elegant text-3xl md:text-5xl text-white font-light uppercase tracking-[0.18em] gold-glow-text leading-tight">
            Explore the gallery
          </h2>
          <p className="mt-5 text-sm md:text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
            Each circle keeps a secret moment. Tap or hover to watch a hidden memory bloom into glassmorphism light.
          </p>
        </div>

        <div className="relative w-full min-h-[720px] rounded-[40px] border border-white/5 overflow-hidden shadow-[0_0_80px_rgba(255,215,0,0.12)]">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
            {connections.map((line, idx) => (
              <line
                key={idx}
                x1={`${line.from.x}%`}
                y1={`${line.from.y}%`}
                x2={`${line.to.x}%`}
                y2={`${line.to.y}%`}
                stroke="rgba(255,215,0,0.17)"
                strokeWidth="1"
                opacity={line.alpha}
              />
            ))}
          </svg>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_55%),linear-gradient(180deg,rgba(10,10,20,0.0),rgba(0,0,0,0.25))] pointer-events-none" />

          <motion.span
            className="absolute z-10 text-pink-soft text-[18px]"
            style={{ top: '18%', left: '12%' }}
            initial={{ opacity: 0.35, y: 0, rotate: 0 }}
            animate={{ opacity: [0.35, 0.85, 0.35], y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          >
            🦋
          </motion.span>
          <motion.span
            className="absolute z-10 text-white text-[18px]"
            style={{ top: '32%', left: '76%' }}
            initial={{ opacity: 0.4, y: 0, rotate: 0 }}
            animate={{ opacity: [0.4, 0.85, 0.4], y: [0, -18, 0], rotate: [0, -10, 10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          >
            🦋
          </motion.span>
          <motion.span
            className="absolute z-10 text-pink-soft text-[16px]"
            style={{ top: '60%', left: '26%' }}
            initial={{ opacity: 0.25, y: 0, rotate: 0 }}
            animate={{ opacity: [0.25, 0.9, 0.25], y: [0, -12, 0], rotate: [0, 7, -7, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          >
            🦋
          </motion.span>
          <motion.span
            className="absolute z-10 text-pink-soft text-[14px]"
            style={{ top: '72%', left: '82%' }}
            initial={{ opacity: 0.3, y: 0, rotate: 0 }}
            animate={{ opacity: [0.3, 0.8, 0.3], y: [0, -10, 0], rotate: [0, -6, 6, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2.1 }}
          >
            🦋
          </motion.span>
          <motion.span
            className="absolute z-10 text-pink-soft text-[18px]"
            style={{ top: '14%', left: '82%' }}
            initial={{ opacity: 0.15, y: 0, rotate: 0 }}
            animate={{ opacity: [0.15, 0.75, 0.15], y: [0, -10, 0], rotate: [0, 4, -4, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          >
            🌹
          </motion.span>
          <motion.span
            className="absolute z-10 text-gold text-[20px]"
            style={{ top: '50%', left: '10%' }}
            initial={{ opacity: 0.18, y: 0, rotate: 0 }}
            animate={{ opacity: [0.18, 0.8, 0.18], y: [0, -8, 0], rotate: [0, 6, -6, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          >
            🌹
          </motion.span>

          {starMemories.map((star) => {
            const isOpen = star.id === selectedStar;
            return (
              <button
                type="button"
                key={star.id}
                onClick={() => handleRevealStar(star)}
                onTouchStart={() => handleRevealStar(star)}
                className={`absolute z-20 rounded-full border-2 transition-transform duration-500 focus:outline-none focus:ring-2 focus:ring-pink-soft/60 ${
                  isOpen ? 'scale-[1.2] border-pink-soft/80' : discovered[star.id] ? 'border-gold/60' : 'border-white/10'
                } ${selectedStar !== null && !isOpen ? 'opacity-70' : 'opacity-100'} hover:scale-[1.15]`}
                style={{
                  top: `${star.y}%`,
                  left: `${star.x}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  transform: 'translate(-50%, -50%)',
                  background: `radial-gradient(circle, ${star.color} 0%, rgba(255,255,255,0.14) 42%, rgba(255,255,255,0.02) 100%)`,
                }}
                aria-label={`Reveal memory ${star.label}`}
              >
                <span className="absolute inset-0 rounded-full shadow-[0_0_30px_rgba(255,215,0,0.18)]" />
                <span className="absolute inset-2 rounded-full bg-white/0" />
                <span className="absolute inset-0 rounded-full mix-blend-screen" />
                <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.9)] transform -translate-x-1/2 -translate-y-1/2" />
                <span className="pointer-events-none absolute -top-10 left-1/2 w-max -translate-x-1/2 text-[10px] tracking-[0.24em] uppercase text-white/50 hidden md:block">
                  {star.label}
                </span>
              </button>
            );
          })}

          {heartBursts.map((heart) => (
            <motion.span
              key={heart.id}
              className="absolute z-30 inline-flex h-5 w-5 items-center justify-center text-pink-soft"
              style={{ top: `${heart.y}%`, left: `${heart.x}%`, transform: 'translate(-50%, -50%)' }}
              initial={{ opacity: 1, scale: 0.7 }}
              animate={{ opacity: 0, x: heart.dx, y: heart.dy, scale: 1.25 }}
              transition={{ delay: heart.delay, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-[18px]">❤️</span>
            </motion.span>
          ))}

          <div className="absolute left-8 top-10 h-14 w-14 rounded-full bg-white/5 shadow-[0_0_40px_rgba(255,255,255,0.06)] blur-sm animate-[float_7s_ease-in-out_infinite] pointer-events-none" />
          <div className="absolute right-8 top-24 h-20 w-20 rounded-full bg-pink-soft/10 shadow-[0_0_40px_rgba(255,192,203,0.12)] blur-[30px] animate-[float_9s_ease-in-out_infinite] pointer-events-none" />
          <div className="absolute left-[35%] bottom-16 h-16 w-16 rounded-full bg-gold/10 shadow-[0_0_30px_rgba(255,215,0,0.15)] blur-[25px] animate-[float_10s_ease-in-out_infinite] pointer-events-none" />

          <div className="absolute -left-6 top-36 h-16 w-16 rotate-12 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.7),rgba(255,192,203,0.1),transparent)] blur-2xl animate-[float_11s_ease-in-out_infinite] pointer-events-none" />
          <div className="absolute right-[18%] bottom-28 h-16 w-16 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.4),rgba(255,215,0,0.12),transparent)] blur-2xl animate-[float_12s_ease-in-out_infinite] pointer-events-none" />

          <div className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none">
            <div className="glass-card rounded-full border border-white/10 px-6 py-3 backdrop-blur-2xl shadow-[0_0_40px_rgba(255,215,0,0.12)]">
              <p className="font-sans-clean text-sm text-white/70 tracking-[0.16em] uppercase mb-2">
                Memories discovered {discoveredCount} / {starMemories.length}
              </p>
              <div className="h-2 w-[320px] rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-pink-soft to-gold" style={{ width: `${(discoveredCount / starMemories.length) * 100}%` }} />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {activeStar && (
              <motion.div
                key={activeStar.id}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-1/2 top-1/2 z-40 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 px-6 md:px-0"
              >
                <div className="relative rounded-[40px] border border-white/10 bg-black/55 backdrop-blur-[24px] shadow-[0_0_90px_rgba(255,215,0,0.18)] overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_55%)] pointer-events-none" />
                  <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] p-6 md:p-8 lg:p-10 relative">
                    <motion.img
                      src={activeStar.image}
                      alt={activeStar.title}
                      className="rounded-[30px] object-cover w-full min-h-[320px] md:min-h-[420px]"
                      initial={{ opacity: 0, scale: 0.92, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <div className="flex flex-col justify-between gap-6">
                      <div>
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <span className="text-[11px] uppercase tracking-[0.4em] text-gold/80 font-semibold">
                            {activeStar.label}
                          </span>
                          <h3 className="mt-4 font-serif-elegant text-3xl md:text-4xl text-white leading-tight">
                            {activeStar.title}
                          </h3>
                        </motion.div>
                        <motion.p
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className="mt-5 text-white/70 leading-relaxed text-sm md:text-base"
                        >
                          {activeStar.caption}
                        </motion.p>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
                          Memory found
                        </span>
                        
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="absolute right-6 top-6 inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-black/70 px-5 text-sm uppercase tracking-[0.3em] text-white/80 transition hover:border-pink-soft/50 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showCollage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-10"
              >
                <div className="relative w-full max-w-5xl rounded-[36px] border border-white/10 bg-black/80 p-8 md:p-12 shadow-[0_0_120px_rgba(255,215,0,0.22)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,192,203,0.18),transparent_55%)]" />
                  <div className="relative flex flex-col items-center gap-8">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <span className="font-sans-clean text-xs uppercase tracking-[0.4em] text-pink-soft/80">
                        Final surprise unlocked
                      </span>
                      <h3 className="font-serif-elegant text-4xl md:text-6xl text-white uppercase gold-glow-text leading-tight">
                        HAPPY BIRTHDAY ❤️
                      </h3>
                      <p className="max-w-2xl text-sm md:text-base text-white/70 leading-relaxed">
                        All the hidden stars have revealed their memories. Your moments are now woven into one glowing heart of love.
                      </p>
                    </div>

                    <div className="relative w-full max-w-[420px] h-[420px]">
                      {starMemories.map((star, index) => {
                        const positions = [
                          { top: '14%', left: '50%' },
                          { top: '8%', left: '30%' },
                          { top: '8%', left: '70%' },
                          { top: '38%', left: '14%' },
                          { top: '38%', left: '86%' },
                          { top: '68%', left: '36%' },
                          { top: '68%', left: '64%' },
                        ];
                        const sizes = [
                          'w-[170px] h-[140px]',
                          'w-[110px] h-[90px]',
                          'w-[110px] h-[90px]',
                          'w-[100px] h-[82px]',
                          'w-[100px] h-[82px]',
                          'w-[118px] h-[96px]',
                          'w-[118px] h-[96px]',
                        ];
                        return (
                          <motion.div
                            key={`collage-${star.id}`}
                            className={`absolute overflow-hidden rounded-3xl border border-white/10 bg-black/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] ${sizes[index]}`}
                            style={{ ...positions[index], transform: 'translate(-50%, -50%)' }}
                            initial={{ opacity: 0.7, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
                          >
                            <img
                              src={star.image}
                              alt={star.title}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          </motion.div>
                        );
                      })}

                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-gradient-to-br from-pink-soft/35 via-transparent to-transparent shadow-[0_0_110px_rgba(255,85,167,0.3)]">
                        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.75),rgba(255,192,203,0.08),transparent)]" />
                      </div>

                      <motion.div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[56px]"
                        initial={{ scale: 0.92, opacity: 0.65, rotate: -12 }}
                        animate={{ scale: 1.08, opacity: 1, rotate: 0 }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      >
                        ❤️
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
