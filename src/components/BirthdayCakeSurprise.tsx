import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import * as THREE from 'three';
import { Mic2, Scissors, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

type Stage = 'intro' | 'blown' | 'readyToCut' | 'cutting' | 'reveal' | 'complete';

export const BirthdayCakeSurprise: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sliceMeshRef = useRef<THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial> | null>(null);
  const butterflyGroupsRef = useRef<THREE.Group[]>([]);
  const [stage, setStage] = useState<Stage>('intro');
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [cutProgress, setCutProgress] = useState(0);
  const [smokeActive, setSmokeActive] = useState(false);
  const [finalGlow, setFinalGlow] = useState(false);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const stageRef = useRef<Stage>('intro');

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSecondLine(true);
    }, 2600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05080f, 0.07);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const camera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 2.1, 6.2);

    const ambient = new THREE.AmbientLight(0xc8d8ff, 0.8);
    scene.add(ambient);

    const spotlight = new THREE.PointLight(0xffe8d2, 2.4, 18, 2);
    spotlight.position.set(0, 5.4, 5);
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.set(1024, 1024);
    scene.add(spotlight);

    const moonlight = new THREE.DirectionalLight(0xa8d2ff, 0.9);
    moonlight.position.set(-4, 6, -3);
    scene.add(moonlight);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(12, 64),
      new THREE.MeshStandardMaterial({ color: 0x09121f, roughness: 0.8, metalness: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.9;
    scene.add(ground);

    const cakeGroup = new THREE.Group();

    const cakeBaseMaterial = new THREE.MeshStandardMaterial({ color: 0xffc4d3, roughness: 0.45, metalness: 0.1 });
    const cakeCreamMaterial = new THREE.MeshStandardMaterial({ color: 0xfff4e6, roughness: 0.35, metalness: 0.05 });
    const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 1 });
    const pinkMaterial = new THREE.MeshStandardMaterial({ color: 0xffbfd4, roughness: 0.3, metalness: 0.05 });

    const baseCake = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 1.1, 64), cakeBaseMaterial);
    baseCake.castShadow = true;
    baseCake.receiveShadow = true;
    cakeGroup.add(baseCake);

    const creamLayer = new THREE.Mesh(new THREE.CylinderGeometry(2.72, 2.72, 0.5, 64), cakeCreamMaterial);
    creamLayer.position.y = 0.8;
    creamLayer.castShadow = true;
    cakeGroup.add(creamLayer);

    const topFrosting = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.25, 64), pinkMaterial);
    topFrosting.position.y = 1.1;
    cakeGroup.add(topFrosting);

    const goldRing = new THREE.Mesh(new THREE.TorusGeometry(2.92, 0.08, 16, 100), goldMaterial);
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.y = 0.86;
    cakeGroup.add(goldRing);

    const candleMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.2 });
    const flameMaterial = new THREE.MeshStandardMaterial({ color: 0xfff3a0, emissive: 0xffe7a6, emissiveIntensity: 1, transparent: true, opacity: 0.92 });
    const candleGroup = new THREE.Group();
    const candleCount = 6;

    for (let i = 0; i < candleCount; i += 1) {
      const angle = (i / candleCount) * Math.PI * 2;
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.75, 16), candleMaterial);
      candle.position.set(Math.cos(angle) * 1.6, 1.8, Math.sin(angle) * 1.6);
      candle.castShadow = true;
      candleGroup.add(candle);

      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), flameMaterial.clone());
      flame.position.set(0, 0.5, 0);
      candle.add(flame);
    }
    cakeGroup.add(candleGroup);

    const teddy = new THREE.Group();
    const teddyBody = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), new THREE.MeshStandardMaterial({ color: 0xe5b28d, roughness: 0.75 }));
    teddyBody.position.set(-0.7, 1.58, 0.2);
    teddy.add(teddyBody);
    const teddyHead = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 24), new THREE.MeshStandardMaterial({ color: 0xd2a07e, roughness: 0.75 }));
    teddyHead.position.set(-0.7, 1.97, 0.2);
    teddy.add(teddyHead);
    const teddyEarLeft = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshStandardMaterial({ color: 0xd2a07e, roughness: 0.8 }));
    teddyEarLeft.position.set(-0.95, 2.15, 0.05);
    teddy.add(teddyEarLeft);
    const teddyEarRight = teddyEarLeft.clone();
    teddyEarRight.position.x = -0.45;
    teddy.add(teddyEarRight);
    cakeGroup.add(teddy);

    const pikachu = new THREE.Group();
    const pikaBody = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 24), new THREE.MeshStandardMaterial({ color: 0xffd13e, roughness: 0.4 }));
    pikaBody.position.set(0.9, 1.4, 0.3);
    pikachu.add(pikaBody);
    const pikaEarLeft = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 12), new THREE.MeshStandardMaterial({ color: 0xffd13e, roughness: 0.4 }));
    pikaEarLeft.position.set(0.78, 1.75, 0.15);
    pikaEarLeft.rotation.z = 0.16;
    pikachu.add(pikaEarLeft);
    const pikaEarRight = pikaEarLeft.clone();
    pikaEarRight.position.set(1.02, 1.75, 0.15);
    pikaEarRight.rotation.z = -0.16;
    pikachu.add(pikaEarRight);
    cakeGroup.add(pikachu);

    const kitkatGroup = new THREE.Group();
    const kitkatMaterial = new THREE.MeshStandardMaterial({ color: 0xb12d2d, roughness: 0.55, metalness: 0.1 });
    for (let i = 0; i < 5; i += 1) {
      const piece = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.65), kitkatMaterial);
      const angle = (i / 5) * Math.PI * 2;
      piece.position.set(Math.cos(angle) * 2.18, 0.68, Math.sin(angle) * 2.18);
      piece.rotation.y = -angle;
      kitkatGroup.add(piece);
    }
    cakeGroup.add(kitkatGroup);

    const sliceMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 2.8, 1.1, 64, 1, false, 0, Math.PI * 0.35),
      cakeBaseMaterial
    );
    sliceMesh.position.y = 0;
    sliceMeshRef.current = sliceMesh;
    scene.add(sliceMesh);
    sliceMesh.visible = false;

    cakeGroup.position.y = -0.1;
    scene.add(cakeGroup);

    const stars: THREE.Points[] = [];
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 120;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      starPositions[i * 3] = (Math.random() - 0.5) * 18;
      starPositions[i * 3 + 1] = Math.random() * 5 + 2;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starPoints = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, opacity: 0.85, transparent: true }));
    stars.push(starPoints);
    scene.add(starPoints);

    const butterflyGroups: THREE.Group[] = [];
    for (let index = 0; index < 6; index += 1) {
      const butterfly = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), new THREE.MeshStandardMaterial({ color: 0xff9ff3, roughness: 0.4 }));
      body.position.z = 0.02;
      butterfly.add(body);
      const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xffcee0, opacity: 0.92, transparent: true, side: THREE.DoubleSide });
      const wingLeft = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.14), wingMaterial);
      const wingRight = wingLeft.clone();
      wingLeft.position.set(-0.15, 0, 0);
      wingLeft.rotation.y = Math.PI / 6;
      wingRight.position.set(0.15, 0, 0);
      wingRight.rotation.y = -Math.PI / 6;
      butterfly.add(wingLeft, wingRight);
      scene.add(butterfly);
      butterflyGroups.push(butterfly);
    }
    butterflyGroupsRef.current = butterflyGroups;

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener('resize', resize);

    let frameId = 0;
    let elapsed = 0;
    let flameIntensity = 1;

    const animate = (time: number) => {
      frameId = window.requestAnimationFrame(animate);
      elapsed = time * 0.001;

      cakeGroup.rotation.y = Math.sin(elapsed * 0.45) * 0.05;
      cakeGroup.position.y = -0.12 + Math.sin(elapsed * 1.2) * 0.02;

      starPoints.rotation.y += 0.00025;

      butterflyGroups.forEach((butterfly, index) => {
        const speed = 0.24 + (index * 0.02);
        const orbit = 2.8 + Math.sin(elapsed * 0.85 + index) * 0.4;
        butterfly.position.set(Math.cos(elapsed * speed + index) * orbit, 0.9 + Math.sin(elapsed * speed * 1.2 + index) * 0.22, Math.sin(elapsed * speed + index) * orbit * 0.6);
        butterfly.rotation.y = Math.sin(elapsed * 2 + index) * 0.45;
      });

      const targetIntensity = stageRef.current === 'blown' || stageRef.current === 'readyToCut' || stageRef.current === 'cutting' || stageRef.current === 'reveal' ? 0 : 1;
      flameIntensity += (targetIntensity - flameIntensity) * 0.08;
      candleGroup.children.forEach((candle) => {
        const flame = candle.children[0] as THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
        flame.scale.setScalar(0.9 + Math.sin(elapsed * 20) * 0.07);
        flame.material.emissiveIntensity = flameIntensity;
        flame.material.opacity = 0.85 + Math.sin(elapsed * 12) * 0.05;
      });

      if (sliceMeshRef.current) {
        sliceMeshRef.current.visible = stageRef.current !== 'intro';
        const progress = cutProgress;
        sliceMeshRef.current.position.x = 1.8 * progress;
        sliceMeshRef.current.rotation.z = -0.3 * progress;
        sliceMeshRef.current.material.opacity = 0.95 - progress * 0.15;
      }

      if (stageRef.current === 'reveal' || stageRef.current === 'complete') {
        const pulse = Math.sin(elapsed * 2.4) * 0.12 + 0.9;
        moonlight.intensity = 0.9 * pulse;
      }

      renderer.render(scene, camera);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      scene.clear();
    };
  }, [cutProgress]);

  useEffect(() => {
    if (stage === 'blown') {
      setSmokeActive(true);
      gsap.to({}, {
        duration: 1.2,
        onComplete: () => {
          setSmokeActive(false);
          setStage('readyToCut');
        }
      });
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'reveal') {
      confetti({
        particleCount: 150,
        spread: 140,
        startVelocity: 34,
        colors: ['#ffb6c1', '#ffd700', '#ffffff', '#f8c0ff'],
        scalar: 1.1,
      });
      setFinalGlow(true);
      const timer = window.setTimeout(() => {
        setStage('complete');
      }, 2400);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [stage]);

  const handleBlowCandles = () => {
    if (stage !== 'intro' && stage !== 'readyToCut') return;
    setStage('blown');
  };

  const triggerCakeCut = () => {
    if (stage !== 'readyToCut') return;
    setStage('cutting');
    const tween = { value: 0 };
    gsap.to(tween, {
      value: 1,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => setCutProgress(tween.value),
      onComplete: () => setStage('reveal'),
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (stage !== 'readyToCut') return;
    draggingRef.current = true;
    startXRef.current = event.clientX;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const clientX = event.clientX;
    if (Math.abs(clientX - startXRef.current) > 110) {
      draggingRef.current = false;
      triggerCakeCut();
    }
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden bg-gradient-to-b from-[#060713] via-[#090c1f] to-[#030308] text-white"
      id="birthday-cake-surprise"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_36%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(255,182,193,0.12),_transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,25,51,0.42),transparent_45%,rgba(1,5,12,0.95))]" />
      <div className="absolute top-8 right-8 z-10 flex flex-col items-end gap-3 sm:top-12 sm:right-12">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.3em] text-white/75 shadow-[0_0_25px_rgba(255,255,255,0.06)]">
          <Sparkles className="w-4 h-4 text-pink-200" />
          Moonlit Birthday Garden
        </div>
      </div>

      <div className="absolute left-0 top-0 w-full h-full overflow-hidden">
        {[...Array(10)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full bg-white/10"
            style={{
              width: 12 + Math.random() * 18,
              height: 12 + Math.random() * 18,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(1px)',
            }}
            animate={{
              y: [0, -18, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 lg:py-24">
        <div className="max-w-4xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="text-3xl sm:text-4xl md:text-5xl font-serif-elegant tracking-[0.04em] leading-tight text-white"
          >
            Someone special has one more surprise… <span className="text-pink-200">❤️</span>
          </motion.h2>
          <AnimatePresence>
            {showSecondLine && (
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }}
                className="mt-6 text-base sm:text-lg md:text-xl text-white/80"
              >
                Make a wish first <span className="text-gold">✨</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="relative mt-16 w-full max-w-5xl rounded-[40px] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(255,200,250,0.06)] backdrop-blur-xl sm:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.1),transparent_25%)] pointer-events-none" />
          <div className="absolute -left-10 top-14 h-28 w-28 rounded-full bg-pink-400/10 blur-3xl" />
          <div className="absolute right-0 top-20 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-[32px] bg-[#05060f]/80 border border-white/10 p-4 md:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),transparent_35%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(243, 174, 255, 0.08),transparent_42%)]" />
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle,_rgba(255,255,255,0.18),transparent_45%)]" />

            <div className="relative flex flex-col items-center justify-center gap-6 py-6">
              <div className="relative h-[420px] w-full max-w-4xl rounded-[28px] border border-white/10 bg-[#051026] shadow-[0_30px_80px_rgba(0,0,0,0.25)] md:h-[520px]">
                <canvas ref={canvasRef} className="h-full w-full" />
                <div
                  className="absolute inset-0"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                />
                <AnimatePresence>
                  {smokeActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 0.8, y: -90, scale: 1.05 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 2.3, ease: 'easeOut' }}
                      className="absolute left-1/2 top-16 h-52 w-52 -translate-x-1/2 rounded-full bg-white/10 backdrop-blur-xl"
                    />
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-sm uppercase tracking-[0.4em] text-white/40">Birthday candle ritual</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(stage === 'intro' || stage === 'blown') && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBlowCandles}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-pink-500/20 px-5 py-3 text-sm font-semibold text-pink-100 ring-1 ring-pink-300/20 backdrop-blur-xl transition-all duration-300 hover:bg-pink-400/20"
                    >
                      <Mic2 className="h-5 w-5 text-pink-100" />
                      Blow candles <span className="ml-1">💨</span>
                    </motion.button>
                  )}
                  {stage === 'readyToCut' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={triggerCakeCut}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gold/20 px-5 py-3 text-sm font-semibold text-gold ring-1 ring-gold/20 backdrop-blur-xl transition-all duration-300 hover:bg-gold/30"
                    >
                      <Scissors className="h-5 w-5 text-gold" />
                      Cut the Cake <span className="ml-1">🎂</span>
                    </motion.button>
                  )}
                  {stage === 'cutting' && (
                    <div className="rounded-full bg-white/5 px-5 py-3 text-sm text-white/80 ring-1 ring-white/10">
                      Cutting the cake... <span className="font-semibold">{Math.round(cutProgress * 100)}%</span>
                    </div>
                  )}
                  {stage === 'reveal' && (
                    <div className="rounded-full bg-white/10 px-5 py-3 text-sm text-gold ring-1 ring-gold/20 backdrop-blur-xl">
                      Portal surprise unlocking... <Heart className="inline-block h-4 w-4 align-middle text-pink-200" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {stage !== 'intro' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="mt-12 grid w-full gap-4 sm:grid-cols-3"
            >
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-center backdrop-blur-xl">
                <h3 className="text-base font-semibold text-white">Fairy lights</h3>
                <p className="mt-2 text-sm text-white/70">Glowing lanterns weave the sky.</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-center backdrop-blur-xl">
                <h3 className="text-base font-semibold text-white">Butterflies</h3>
                <p className="mt-2 text-sm text-white/70">Soft wings drift around the cake.</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-center backdrop-blur-xl">
                <h3 className="text-base font-semibold text-white">Dreamy garden</h3>
                <p className="mt-2 text-sm text-white/70">Moonlit roses bloom gently.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(stage === 'reveal' || stage === 'complete') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="mt-14 rounded-[36px] border border-pink-300/15 bg-white/5 px-6 py-8 shadow-[0_40px_120px_rgba(246,147,255,0.09)] backdrop-blur-xl"
            >
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-pink-200/80">Magical surprise revealed</p>
                <h3 className="mt-5 text-4xl font-serif-elegant leading-tight text-white sm:text-5xl">
                  Happy Birthday <span className="text-pink-300">❤️</span>
                </h3>
                <p className="mt-6 whitespace-pre-line text-base leading-8 text-white/80 sm:text-lg">
                  You deserve more smiles,
                  <br />
                  more happiness,
                  <br />
                  more beautiful surprises.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {stage === 'complete' && finalGlow && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-3xl flex-col items-center gap-2 px-6 pb-10 text-center"
            >
              <div className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-xl ring-1 ring-white/10">
                <Sparkles className="h-4 w-4 text-pink-200" />
                Thank you for existing <span className="text-pink-200">❤️</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {['Butterflies', 'Roses', 'Stars'].map((label) => (
                  <div key={label} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 backdrop-blur-xl">
                    {label} bloom softly
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
