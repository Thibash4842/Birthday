import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { BackgroundParticles } from './components/BackgroundParticles';
import { AudioPlayer } from './components/AudioPlayer';
import { CinematicLoader } from './components/CinematicLoader';
import { HeroSection } from './components/HeroSection';
import { MemoryTimeline } from './components/MemoryTimeline';
import { LoveMessage } from './components/LoveMessage';
import { BirthdayCakeSurprise } from './components/BirthdayCakeSurprise';
import { BirthdayGiftUniverse } from './components/BirthdayGiftUniverse';
// import { StarCountdown } from './components/StarCountdown';
import { FinalSurprise } from './components/FinalSurprise';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [loaded, setLoaded] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Initialize Lenis smooth scroll once the app is loaded
  useEffect(() => {
    if (!loaded) {
      document.body.style.overflow = 'hidden';
      return;
    }

    document.body.style.overflow = '';

    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom smooth exponential easing
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    });

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    // Integrate with GSAP ticker
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    // Clean up
    return () => {
      lenis.destroy();
      gsap.ticker.remove(updateLenis);
      document.body.style.overflow = '';
    };
  }, [loaded]);

  const handleBegin = () => {
    setAudioEnabled(true);
    setLoaded(true);
  };

  const handleReplay = () => {
    // 1. Smoothly scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    // 2. Wait for scroll transition and show loader again
    setTimeout(() => {
      setLoaded(false);
      setAudioEnabled(false);
      // Refresh ScrollTrigger to recalculate timelines on replay
      ScrollTrigger.refresh();
    }, 1200);
  };

  return (
    <>
      {/* 1. Global Interactive Canvas Particles */}
      <BackgroundParticles />

      {/* 2. Ambient Audio Controller */}
      <AudioPlayer isPlaying={audioEnabled} onTogglePlay={setAudioEnabled} />

      {/* 3. Cinematic Loading Screen */}
      <AnimatePresence>
        {!loaded && (
          <CinematicLoader onBegin={handleBegin} />
        )}
      </AnimatePresence>

      {/* 4. Luxury Story Sections */}
      {loaded && (
        <main className="w-full flex flex-col relative z-10 select-none overflow-hidden">
          {/* Hero Section */}
          <HeroSection />

          {/* Memory Timeline Section */}
          <MemoryTimeline />

          {/* Handwritten Love Message */}
          <LoveMessage />

          {/* Birthday Cake Surprise Section */}
          <BirthdayCakeSurprise />

          {/* Birthday Gift Universe Section */}
          <BirthdayGiftUniverse />

          {/* Interactive Stars & Countdown */}
          {/* <StarCountdown /> */}

          {/* Final Surprise with Fireworks & Confetti */}
          <FinalSurprise onReplay={handleReplay} />
        </main>
      )}
    </>
  );
}

export default App;
