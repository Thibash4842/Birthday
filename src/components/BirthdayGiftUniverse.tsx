import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import * as THREE from 'three';
import { Play, Pause, Volume2, VolumeX, Gift } from 'lucide-react';
import video from '../assets/gifts/video.mp4';
const giftData = [
  {
    id: 'chocolate',
    label: 'Chocolate Gift',
    image: 'https://www.giftacrossindia.com/media/catalog/product/g/a/gaicou0411_2.jpg',
    imageAlt: 'Luxury chocolate gift box',
    message: 'Have A Break, Have A KitKat® | KitKat®. 🍫 — A delicious surprise to sweeten your day ❤️',
    detail: 'May life give you more sweetness than worries ❤️',
  },
  {
    id: 'pikachu',
    label: 'Pikachu Gift',
    image: 'https://girliesgirl.in/wp-content/uploads/2025/08/12-1.png',
    imageAlt: 'Pikachu surprise gift',
    message: 'Pikachu 🐱 — A cute companion for your special day ❤️⚡',
    detail: 'A playful burst of electric cheer with hidden smiles.',
  },
  {
    id: 'teddy',
    label: 'Teddy Gift',
    image: 'https://perfectgiftadda.com/wp-content/uploads/2025/12/IMG_4426-scaled.jpeg',
    imageAlt: 'Teddy bear gift',
    message: 'Bouquet 💐 — A small gift of flowers and love 🌸',
    detail: 'A beautiful of flowers arranged together as a gift.',
  },
] as const;

type GiftKey = (typeof giftData)[number]['id'];

type GiftState = Record<GiftKey, boolean>;

const initialGiftState: GiftState = {
  chocolate: false,
  pikachu: false,
  teddy: false,
};

const videoSources = [
  { src: video, type: 'video/mp4' },
];

export const BirthdayGiftUniverse: React.FC = () => {
  const [step, setStep] = useState<'intro' | 'choose' | 'opened'>('intro');
  const [openedGifts, setOpenedGifts] = useState<GiftState>(initialGiftState);
  const [selectedGift, setSelectedGift] = useState<GiftKey | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cardRefs = useRef<Record<GiftKey, HTMLButtonElement | null>>({
    chocolate: null,
    pikachu: null,
    teddy: null,
  });

  const allOpened = useMemo(
    () => Object.values(openedGifts).every(Boolean),
    [openedGifts]
  );

  useEffect(() => {
    const introTimer = window.setTimeout(() => setStep('choose'), 1800);
    return () => window.clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    if (!allOpened) return;
    const finalGlow = document.querySelector('.gift-universe-final-gift');
    if (!finalGlow) return;
    gsap.fromTo(
      finalGlow,
      { scale: 0.92, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.2, ease: 'elastic.out(1, 0.7)' }
    );
  }, [allOpened]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);

    const pointLight = new THREE.PointLight(0xffc3f8, 1.2, 40, 2);
    pointLight.position.set(-4, 4, 6);
    scene.add(pointLight);

    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xf8e2ff, emissive: 0xffd6f2, emissiveIntensity: 0.4, roughness: 0.25 })
    );
    moon.position.set(5.2, 2.8, -1.5);
    scene.add(moon);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 140;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      starPositions[i * 3] = (Math.random() - 0.5) * 28;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.85 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const butterflies: THREE.Group[] = [];
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xffa8e8, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });

    for (let i = 0; i < 6; i += 1) {
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), new THREE.MeshStandardMaterial({ color: 0xffdfed, roughness: 0.2 }));
      body.position.set(0, 0, 0);
      group.add(body);

      const left = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.35), wingMaterial);
      const right = left.clone();
      left.position.set(-0.35, 0, 0);
      right.position.set(0.35, 0, 0);
      left.rotation.y = 0.25;
      right.rotation.y = -0.25;
      group.add(left, right);

      group.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6);
      scene.add(group);
      butterflies.push(group);
    }

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', resize);

    let frameId = 0;
    const animate = (time: number) => {
      frameId = requestAnimationFrame(animate);
      const elapsed = time * 0.001;
      stars.rotation.y = elapsed * 0.03;
      moon.position.x = 5.2 + Math.cos(elapsed * 0.45) * 0.3;
      butterflies.forEach((butterfly, index) => {
        const speed = 0.45 + index * 0.06;
        butterfly.position.x = Math.cos(elapsed * speed + index) * 6.5;
        butterfly.position.y = Math.sin(elapsed * speed * 1.2 + index) * 3.4;
        butterfly.rotation.z = Math.sin(elapsed * speed * 1.4 + index) * 0.2;
      });
      renderer.render(scene, camera);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, []);

  const onGiftClick = (giftId: GiftKey) => {
    setSelectedGift(giftId);
    setOpenedGifts((prev) => ({ ...prev, [giftId]: true }));
    const card = cardRefs.current[giftId];
    if (!card) return;

    gsap.fromTo(
      card,
      { y: 0, scale: 1 },
      { y: -16, scale: 1.03, duration: 0.4, ease: 'power3.out', yoyo: true, repeat: 1 }
    );
  };

  const handleVideoToggle = () => {
    if (!videoRef.current) return;
    if (videoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setVideoPlaying(!videoRef.current.paused);
  };

  const handleFinalGiftClick = () => {
    setShowVideo(true);
    window.setTimeout(() => {
      videoRef.current?.play().catch(() => {});
      setVideoPlaying(true);
    }, 50);
  };

  const activeGift = giftData.find((gift) => gift.id === selectedGift);

  return (
    <section className="relative overflow-hidden gift-universe-section px-6 py-24 sm:px-10 lg:px-20" id="birthday-gift-universe">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,182,193,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,216,255,0.18),_transparent_25%)] mix-blend-screen pointer-events-none" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: step !== 'intro' ? 1 : 0, y: step !== 'intro' ? 0 : 20 }}
            transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
            className="mb-4 text-4xl font-semibold tracking-tight text-pink-100 sm:text-5xl"
          >
            I saved one more surprise for you… <span className="text-rose-200">❤️</span>
          </motion.h2>
          <AnimatePresence>
            {step === 'choose' && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
                className="text-md mx-auto max-w-2xl leading-8 text-pink-100/90"
              >
                Pick one of the 3 gifts 🎁 Open it to unlock a hidden surprise wrapped in moonlight, butterflies, roses, and a little magic… 🌙🦋🌹✨
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: step === 'choose' ? 1 : 0, y: step === 'choose' ? 0 : 20 }}
          transition={{ duration: 1.2, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="grid gap-6 sm:grid-cols-3"
        >
          {giftData.map((gift) => {
            const opened = openedGifts[gift.id];
            return (
              <motion.button
                key={gift.id}
                type="button"
                ref={(el) => { cardRefs.current[gift.id] = el; }}
                onClick={() => onGiftClick(gift.id)}
                className="gift-card group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/10 p-6 text-left shadow-[0_20px_80px_rgba(255,182,193,0.08)] transition-all duration-500 hover:-translate-y-2 hover:border-pink-200/40 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-rose-300/70"
                aria-label={`Open ${gift.label}`}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.18),transparent_42%)] opacity-70 transition duration-500 group-hover:opacity-100" />
                <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-3xl bg-pink-200/20 shadow-[0_0_40px_rgba(255,192,203,0.35)]">
                      <img src={gift.image} alt={gift.imageAlt} className="h-full w-full object-contain p-1" />
                    </div>
                    <div>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{gift.label}</h3>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-pink-50/80">{gift.detail}</p>
                  <div className="mt-auto flex items-center justify-between gap-4">
                    <span className="rounded-full bg-pink-100/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-pink-100/90">
                      {opened ? 'Opened' : 'Tap to open'}
                    </span>
                    <span className="text-xl">{opened ? '✔️' : '✨'}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        <AnimatePresence>
          {selectedGift && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
              className="relative mx-auto max-w-3xl rounded-[40px] border border-white/10 bg-black/30 p-8 shadow-[0_30px_90px_rgba(255,192,203,0.15)] backdrop-blur-xl"
            >
              <div className="absolute inset-x-8 top-0 h-20 bg-gradient-to-b from-pink-200/20 to-transparent blur-2xl" />
              <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-center">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-pink-100">
                    {activeGift?.image && (
                      <img src={activeGift.image} alt={activeGift.imageAlt} className="h-14 w-14 object-contain" />
                    )}
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-pink-100/70">Gift opened</p>
                      <h3 className="text-3xl font-semibold text-white">{activeGift?.label}</h3>
                    </div>
                  </div>
                  <p className="text-lg leading-9 text-pink-50/90">{activeGift?.message}</p>
                 
                </div>
                <div className="flex h-full items-end justify-center">
                  <div className="rounded-[26px] bg-gradient-to-br from-pink-100/20 to-rose-200/10 p-5 shadow-[0_10px_50px_rgba(255,182,193,0.14)] backdrop-blur-xl">
                    <div className="relative h-48 w-48 rounded-[28px] border border-white/10 bg-white/5 p-5">
                      <div className="absolute inset-0 animate-gift-glow rounded-[28px]" />
                      <div className="relative flex h-full flex-col items-center justify-center gap-2 text-center text-white">
                        {activeGift?.image && (
                          <img src={activeGift.image} alt={activeGift.imageAlt} className="h-full w-full object-conver" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {allOpened && !showVideo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="gift-universe-final-gift mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-[40px] border border-pink-200/20 bg-white/10 p-8 shadow-[0_24px_90px_rgba(255,182,193,0.14)]"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <h3 className="text-4xl font-semibold text-white">One last surprise…</h3>
                <p className="max-w-2xl text-base leading-8 text-pink-100/80">A secret video is waiting inside a glowing gift, ready to reveal the final birthday emotion.</p>
              </div>
              <button
                type="button"
                onClick={handleFinalGiftClick}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-pink-200/30 bg-gradient-to-r from-pink-300 via-rose-300 to-violet-400 px-8 py-4 text-lg font-semibold text-white shadow-[0_18px_60px_rgba(255,158,185,0.3)] transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-pink-300/60"
              >
                <span className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.35),transparent_35%)] opacity-0 transition duration-500 group-hover:opacity-100" />
                <Gift className="mr-3 h-5 w-5 text-white" />
                Open the secret video
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showVideo && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
              className="relative mx-auto w-full max-w-5xl rounded-[40px] border border-white/10 bg-black/50 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            >
              <div className="absolute inset-0 rounded-[40px] border border-pink-200/10 bg-gradient-to-br from-pink-200/5 via-transparent to-rose-300/5 opacity-90" />
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex flex-col gap-2 text-center text-white sm:flex-row sm:items-end sm:justify-between sm:text-left">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-pink-100/70">Cinematic reveal</p>
                    <h3 className="text-3xl font-semibold text-white">Birthday video</h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-pink-100/85 backdrop-blur-sm">
                    {videoEnded ? 'Video complete' : 'Autoplay muted'}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#09050f] shadow-[0_30px_80px_rgba(255,182,193,0.15)]">
                  <video
                    ref={videoRef}
                    className="w-full min-h-[320px] bg-black object-cover"
                    playsInline
                    muted
                    onEnded={() => {
                      setVideoEnded(true);
                      setVideoPlaying(false);
                    }}
                    onPlay={() => setVideoPlaying(true)}
                    onPause={() => setVideoPlaying(false)}
                    onTimeUpdate={() => {
                      const video = videoRef.current;
                      if (!video || !video.duration) return;
                      setProgress((video.currentTime / video.duration) * 100);
                    }}
                  >
                    {videoSources.map((source) => (
                      <source key={source.src} src={source.src} type={source.type} />
                    ))}
                    Your browser does not support this video.
                  </video>
                  <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent px-6 py-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleVideoToggle}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
                          aria-label={videoPlaying ? 'Pause video' : 'Play video'}
                        >
                          {videoPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </button>
                        <button
                          type="button"
                          onClick={handleMuteToggle}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
                          aria-label="Toggle mute"
                        >
                          {videoRef.current?.muted ?? true ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </button>
                        <span className="text-sm text-pink-100/85">{videoEnded ? 'Ready to celebrate' : 'Muted until you tap play'}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 sm:max-w-[240px]">
                        <div className="h-full rounded-full bg-gradient-to-r from-pink-300 via-rose-400 to-violet-400" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
