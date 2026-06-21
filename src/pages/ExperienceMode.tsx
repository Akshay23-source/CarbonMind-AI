import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, SkipForward, SkipBack, Volume2, VolumeX,
  Sparkles, Bot, Globe, Award, Leaf, Navigation,
  Mic, HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

interface SceneData {
  title: string;
  badge: string;
  narratorText: string;
}

const SCENE_DETAILS: SceneData[] = [
  {
    title: 'Welcome to Planet Earth',
    badge: 'State of Nature',
    narratorText: 'Our planet is experiencing rapid ecological changes. Carbon emissions have crossed forty-one billion tons, and global warming threats require immediate actions. CarbonMind AI is designed to aggregate your daily choices into massive global offsets.'
  },
  {
    title: 'Your Carbon Twin™',
    badge: 'Digital Identity',
    narratorText: 'This is your Carbon Twin—a real-time digital representation of your sustainability profile. It learns from your transport, diet, and electricity statements to project your lifestyle impact.'
  },
  {
    title: 'AI Carbon Scanner',
    badge: 'NLP Logging',
    narratorText: 'Simply type or speak your actions. When we simulate riding a bicycle for fifteen kilometers, the Copilot engine instantly parses your travel categories, calculates offsets, and updates metrics in real-time.'
  },
  {
    title: 'OCR Receipt Scanner',
    badge: 'Vision Audits',
    narratorText: 'Upload any grocery receipt. The Gemini Vision scanner itemizes your purchases, reviews plastic packaging weights, and suggests greener seasonal swaps to save carbon and coins next trip.'
  },
  {
    title: 'AI Meal Analyzer',
    badge: 'Nutrition Eco-Audit',
    narratorText: 'Taking photos of meals parses nutrition facts and water footprints. Our model flags high carbon items, suggesting plant-based alternatives like tofu to reduce emissions by eighty-five percent.'
  },
  {
    title: 'Smart Travel Planner',
    badge: 'Clean Routing',
    narratorText: 'Planning commutes displays ecological routes on Leaflet maps. Compare walking, cycling, transit, and combustion vehicles to find the greenest path suggested by Copilot.'
  },
  {
    title: 'Home Energy Intelligence',
    badge: 'Utility Audits',
    narratorText: 'Uploading electricity bills monitors standby electrical draw, maps appliance performance, and simulates solar panel installations to offset grid consumption.'
  },
  {
    title: 'Carbon Twin Projections',
    badge: 'Future Simulation',
    narratorText: 'See your future if you continue making sustainable choices. Over the next fifteen years, your forest will grow, carbon footprints will drop by eighty percent, and you will save thousands in utility costs.'
  },
  {
    title: 'Live Community Map',
    badge: 'OSM Map Drives',
    narratorText: 'Sustainability is a collective movement. View charging hubs, recycling spots, tree plantations, and clean-up drives happening only a few kilometers away.'
  },
  {
    title: 'Gamification & Rewards',
    badge: 'Green Wallet',
    narratorText: 'Earn XP, level up, and accumulate Green Coins for every positive action. Redeem coins to plant real trees or unlock EV charging credentials.'
  },
  {
    title: 'CarbonMind Copilot OS',
    badge: 'Central Assistant',
    narratorText: 'I am always listening. I audit your complete environmental profile, summarizing your top strengths, plastic weaknesses, and today\'s recommended mission.'
  },
  {
    title: 'AI Decision Assistant',
    badge: 'Direct Comparisons',
    narratorText: 'Ask me anything: Should I buy this product? Should I replace my refrigerator? I generate clear comparisons and explain the exact carbon trade-offs.'
  },
  {
    title: 'The Living Planet',
    badge: 'Unified Ecosystem',
    narratorText: 'Every dietary swap, clean commute, and recycled container alters the future. Your digital forest and carbon twin directly shape a healthier living earth.'
  },
  {
    title: 'Final Impact Summary',
    badge: 'Audited Results',
    narratorText: 'Congratulations! You have completed the experience mode. In just a short walkthrough, you have audited all modules and witnessed the future of sustainable intelligence. Welcome to CarbonMind AI.'
  }
];

export const ExperienceMode: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemoUser } = useAuth();

  // Core Experience States
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentScene, setCurrentScene] = useState(0); // 0 to 13
  const [timer, setTimer] = useState(0); // 0 to 84 (6s per scene)
  const [muteAudio, setMuteAudio] = useState(false);
  const [introMode, setIntroMode] = useState(true);
  const [typingText, setTypingText] = useState('');

  // Simulation internal states
  const [simQuery, setSimQuery] = useState('');
  const [simScanned, setSimScanned] = useState(false);
  const [simYear, setSimYear] = useState(2025);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiRef = useRef<HTMLCanvasElement | null>(null);
  const speechRef = useRef<any>(null);

  const SECONDS_PER_SCENE = 6;
  const TOTAL_DURATION = SCENE_DETAILS.length * SECONDS_PER_SCENE;

  // Background Starfield & Leaf Particle System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle Array
    const stars: any[] = [];
    const leaves: any[] = [];

    // Initialize stars
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5,
        alpha: Math.random(),
        speed: 0.2 + Math.random() * 0.3
      });
    }

    // Initialize leaves
    for (let i = 0; i < 15; i++) {
      leaves.push({
        x: Math.random() * width,
        y: height + Math.random() * 100,
        radius: 4 + Math.random() * 8,
        speedY: -(0.5 + Math.random() * 0.8),
        speedX: -0.3 + Math.random() * 0.6,
        rotation: Math.random() * Math.PI,
        rotSpeed: -0.01 + Math.random() * 0.02
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Radial Aurora sweep background
      const grad = ctx.createRadialGradient(
        width / 2, height / 2, 50,
        width / 2, height / 2, width
      );
      grad.addColorStop(0, 'rgba(17, 24, 39, 1)'); // Dark gray
      grad.addColorStop(0.5, 'rgba(12, 45, 30, 0.6)'); // Emerald tint
      grad.addColorStop(1, 'rgba(17, 24, 39, 1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      ctx.fillStyle = '#ffffff';
      stars.forEach(s => {
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();

        // Update
        s.alpha += s.speed * 0.02 * (Math.random() > 0.5 ? 1 : -1);
        if (s.alpha < 0) s.alpha = 0;
        if (s.alpha > 1) s.alpha = 1;
      });

      // Draw leaves
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)'; // Semitransparent emerald
      ctx.globalAlpha = 0.6;
      leaves.forEach(l => {
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rotation);

        ctx.beginPath();
        // Leaf shape vector drawing
        ctx.moveTo(0, -l.radius);
        ctx.quadraticCurveTo(l.radius / 2, -l.radius / 2, 0, l.radius);
        ctx.quadraticCurveTo(-l.radius / 2, -l.radius / 2, 0, -l.radius);
        ctx.fill();

        ctx.restore();

        // Update
        l.y += l.speedY;
        l.x += l.speedX;
        l.rotation += l.rotSpeed;

        if (l.y < -20) {
          l.y = height + 20;
          l.x = Math.random() * width;
        }
      });
      ctx.globalAlpha = 1.0;

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Simple Confetti engine for Step 10
  useEffect(() => {
    if (currentScene !== 9) return; // Confetti triggers on scene index 9 (Scene 10)
    
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const confetti: any[] = [];
    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

    for (let i = 0; i < 100; i++) {
      confetti.push({
        x: Math.random() * width,
        y: -10 - Math.random() * height,
        size: 5 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: 2 + Math.random() * 4,
        speedX: -1 + Math.random() * 2,
        rotation: Math.random() * 360,
        rotationSpeed: -2 + Math.random() * 4
      });
    }

    const drawConfetti = () => {
      ctx.clearRect(0, 0, width, height);

      confetti.forEach(c => {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rotation * Math.PI) / 180);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
        ctx.restore();

        c.y += c.speedY;
        c.x += c.speedX;
        c.rotation += c.rotationSpeed;

        if (c.y > height) {
          c.y = -10;
          c.x = Math.random() * width;
        }
      });

      animationId = requestAnimationFrame(drawConfetti);
    };

    drawConfetti();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [currentScene]);

  // Main Timer progression interval loop
  useEffect(() => {
    if (introMode || !isPlaying) return;

    const timerInterval = setInterval(() => {
      setTimer(prev => {
        if (prev >= TOTAL_DURATION - 1) {
          // Experience completes
          clearInterval(timerInterval);
          handleCompleteExperience();
          return TOTAL_DURATION;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [introMode, isPlaying]);

  // Keyboard navigation shortcuts for accessibility (WCAG AA+)
  useEffect(() => {
    if (introMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowright':
          e.preventDefault();
          handleSkip();
          break;
        case 'arrowleft':
          e.preventDefault();
          handleBack();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [introMode, isPlaying, currentScene, muteAudio, timer]);

  // Sync Timer with Current Scene index
  useEffect(() => {
    if (introMode) return;
    const newSceneIdx = Math.min(
      SCENE_DETAILS.length - 1,
      Math.floor(timer / SECONDS_PER_SCENE)
    );
    setCurrentScene(newSceneIdx);
  }, [timer, introMode]);

  // Narrator Speech Synthesis & Text Typing animation
  useEffect(() => {
    if (introMode) return;
    const sceneData = SCENE_DETAILS[currentScene];
    if (!sceneData) return;

    // Reset typing
    setTypingText('');
    let charIndex = 0;
    const textToType = sceneData.narratorText;
    let accumulatedText = '';
    
    // Animate typing text
    const typingInterval = setInterval(() => {
      if (charIndex < textToType.length) {
        accumulatedText += textToType.charAt(charIndex);
        setTypingText(accumulatedText);
        charIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 12); // fast typing speed

    // Voice Narration speechSynthesis
    if ('speechSynthesis' in window && !muteAudio) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToType);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;

      // Choose standard female voice if available
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('samantha')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      window.speechSynthesis.speak(utterance);
    }

    return () => {
      clearInterval(typingInterval);
      window.speechSynthesis.cancel();
    };
  }, [currentScene, introMode, muteAudio]);

  // Automated typing simulation helpers inside scenes
  useEffect(() => {
    // Scene 3 typing simulation
    if (currentScene === 2 && !introMode) {
      setSimQuery('');
      setSimScanned(false);
      let queryIndex = 0;
      const targetStr = 'I travelled 15 km by bicycle.';
      let accumulatedQuery = '';
      
      const typeQueryTimer = setTimeout(() => {
        const queryInterval = setInterval(() => {
          if (queryIndex < targetStr.length) {
            accumulatedQuery += targetStr.charAt(queryIndex);
            setSimQuery(accumulatedQuery);
            queryIndex++;
          } else {
            clearInterval(queryInterval);
            // Simulate scan completion after 1.5s
            setTimeout(() => setSimScanned(true), 1200);
          }
        }, 35);
        return () => clearInterval(queryInterval);
      }, 500);

      return () => clearTimeout(typeQueryTimer);
    }

    // Scene 8 timeline simulation
    if (currentScene === 7 && !introMode) {
      setSimYear(2025);
      const interval = setInterval(() => {
        setSimYear(prev => {
          if (prev >= 2040) return 2040;
          return prev + 5;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentScene, introMode]);

  const handleStartExperience = async () => {
    setIntroMode(false);
    setTimer(0);
    setCurrentScene(0);
    // Auto sync demo user credentials so they are logged in behind the scenes
    await loginAsDemoUser();
  };

  const handleCompleteExperience = () => {
    window.speechSynthesis.cancel();
    navigate('/dashboard');
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => {
    const prevMute = muteAudio;
    setMuteAudio(!muteAudio);
    if (!prevMute) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSkip = () => {
    if (currentScene < SCENE_DETAILS.length - 1) {
      setTimer((currentScene + 1) * SECONDS_PER_SCENE);
    } else {
      handleCompleteExperience();
    }
  };

  const handleBack = () => {
    if (currentScene > 0) {
      setTimer((currentScene - 1) * SECONDS_PER_SCENE);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans select-none flex flex-col justify-between">
      {/* Background GPU-Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 -z-20 w-full h-full block" />
      
      {/* Confetti Overlay Canvas */}
      <canvas ref={confettiRef} className="absolute inset-0 -z-10 w-full h-full block pointer-events-none" />

      {/* 1. INTRO MODE WELCOME PANEL */}
      <AnimatePresence>
        {introMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-30"
          >
            {/* Holographic Logo ring */}
            <div className="relative w-28 h-28 rounded-full border border-primary-500/30 flex items-center justify-center glow-emerald animate-spin-slow mb-6">
              <div className="absolute inset-2 rounded-full border border-dashed border-secondary-500/20" />
              <div className="absolute inset-6 rounded-full border border-primary-500/10 flex items-center justify-center earth-grid h-[70%] w-[70%]" />
              <Leaf className="h-10 w-10 text-primary-500 animate-pulse" />
            </div>

            <div className="max-w-2xl space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-500 bg-primary-500/10 px-3 py-1 rounded-full border border-primary-500/25">
                CarbonMind Experience Mode™
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight font-sans">
                Welcome to <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-primary-400 to-sky-400">
                  CarbonMind AI
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto font-sans leading-relaxed">
                Take a 90-second cinematic, AI-narrated tour. Watch every scanner, routing map, and digital carbon twin simulate in real-time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 mt-8 w-full max-w-sm">
              <Button
                variant="primary"
                onClick={handleStartExperience}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-primary-500 border-none font-bold tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <Play className="h-4 w-4 fill-white text-white" />
                Start Experience
              </Button>
              <button
                onClick={() => navigate('/login')}
                className="py-3 px-6 rounded-2xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all backdrop-blur-md"
              >
                Explore App
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. CINEMATIC NARRATION INTERACTION SECTION */}
      {!introMode && (
        <>
          {/* Header Panel */}
          <div className="px-6 py-4 flex items-center justify-between z-10 w-full max-w-7xl mx-auto border-b border-white/5 bg-gradient-to-b from-black/20 to-transparent">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-gradient-to-br from-emerald-500 to-primary-500 text-white">
                <Leaf className="h-4.5 w-4.5" />
              </div>
              <span className="text-sm font-black text-white tracking-tight">
                CarbonMind <span className="text-[10px] text-primary-500 font-bold uppercase">AI</span>
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="premium" className="text-[9px] font-black uppercase tracking-wider bg-primary-500/20 text-primary-400 border-none">
                WWDC Product Launch Mode
              </Badge>
              <button
                onClick={handleCompleteExperience}
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Exit Tour
              </button>
            </div>
          </div>

          {/* Central Stage Visualizer */}
          <div className="flex-1 w-full max-w-5xl mx-auto p-4 flex flex-col md:flex-row gap-6 items-center justify-center z-10">
            {/* Left Box: Visualizer stage */}
            <div className="flex-1 w-full flex items-center justify-center min-h-[340px] relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScene}
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="w-full"
                >
                  {/* SCENE 1: EARTH PORTAL */}
                  {currentScene === 0 && (
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="w-48 h-48 rounded-full border border-primary-500/30 flex items-center justify-center glow-emerald animate-spin-slow">
                        <div className="absolute inset-2 rounded-full border border-dashed border-secondary-500/20" />
                        <div className="absolute inset-8 rounded-full border border-primary-500/10 flex items-center justify-center earth-grid h-[75%] w-[75%]" />
                        <Globe className="h-20 w-20 text-primary-400/80" />
                      </div>
                      <div className="grid grid-cols-3 gap-3 w-full max-w-md text-center text-xs">
                        <div className="p-3 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
                          <span className="block font-bold text-slate-400 uppercase text-[8px] tracking-wider">CO₂ Emitted</span>
                          <span className="block text-sm font-black text-red-500 mt-0.5">41.2B T</span>
                        </div>
                        <div className="p-3 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
                          <span className="block font-bold text-slate-400 uppercase text-[8px] tracking-wider">Forests Lost</span>
                          <span className="block text-sm font-black text-amber-500 mt-0.5">15.3M Ha</span>
                        </div>
                        <div className="p-3 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
                          <span className="block font-bold text-slate-400 uppercase text-[8px] tracking-wider">Saved Offsets</span>
                          <span className="block text-sm font-black text-emerald-500 mt-0.5">185K Trees</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCENE 2: MEET YOUR CARBON TWIN */}
                  {currentScene === 1 && (
                    <div className="glass-card max-w-sm mx-auto p-5 rounded-2xl border border-white/10 text-left space-y-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80" alt="avatar" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">Eco Pioneer</h4>
                          <span className="text-[10px] text-slate-400">Carbon Twin: net-zero explorer</span>
                        </div>
                      </div>
                      <hr className="border-white/5" />
                      <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed">
                        <div>
                          <p className="text-slate-450 uppercase text-[9px] font-bold">EcoScore Status</p>
                          <p className="text-emerald-400 font-extrabold text-sm">84 / 100</p>
                        </div>
                        <div>
                          <p className="text-slate-450 uppercase text-[9px] font-bold">Carbon Age</p>
                          <p className="text-indigo-400 font-extrabold text-sm">28 Years</p>
                        </div>
                        <div>
                          <p className="text-slate-450 uppercase text-[9px] font-bold">Baskets Audited</p>
                          <p className="text-white font-semibold">12 Receipts</p>
                        </div>
                        <div>
                          <p className="text-slate-450 uppercase text-[9px] font-bold">Missions Solved</p>
                          <p className="text-white font-semibold">18 Challenges</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCENE 3: CARBON SCANNER SCAN */}
                  {currentScene === 2 && (
                    <div className="glass-card max-w-md mx-auto p-5 rounded-2xl border border-white/10 text-left space-y-4 shadow-xl">
                      <span className="text-[9px] uppercase font-bold text-primary-400 tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI Natural Language Scanner
                      </span>
                      <div className="relative">
                        <input
                          type="text"
                          value={simQuery}
                          readOnly
                          className="w-full pl-4 pr-12 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                          <Mic className="h-3.5 w-3.5 text-slate-450 animate-pulse" />
                        </span>
                      </div>

                      <AnimatePresence>
                        {simScanned && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-2 text-left leading-relaxed text-slate-200"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-400">Scan Complete</span>
                              <span className="text-emerald-400 font-extrabold">-4.2kg CO₂ saved</span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Swapped commuting via gasoline driving with cycling logs. Earned +30 XP and +10 Coins.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* SCENE 4: RECEIPT SCANNER OCR */}
                  {currentScene === 3 && (
                    <div className="glass-card max-w-md mx-auto p-5 rounded-2xl border border-white/10 text-left space-y-4 shadow-xl relative overflow-hidden">
                      {/* OCR scan line animation */}
                      <motion.div
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute left-0 right-0 h-0.5 bg-primary-500 opacity-60 shadow-lg"
                      />

                      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 pb-2 border-b border-white/5">
                        <span>Trader Joe's Receipt</span>
                        <span className="text-primary-400">Gemini Vision OCR</span>
                      </div>

                      <div className="space-y-2 text-xs leading-relaxed text-slate-300">
                        <div className="flex justify-between items-center">
                          <span>Organic Soy Milk 1L</span>
                          <span className="text-emerald-400 font-bold">Eco A</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Prime Beef Steak 500g</span>
                          <span className="text-red-500 font-bold">Eco F</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Fresh Avocados 4-Pack</span>
                          <span className="text-amber-500 font-bold">Eco C</span>
                        </div>
                      </div>

                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-slate-400 leading-normal">
                        <span className="font-bold text-red-400 block mb-0.5">AI Suggestion:</span>
                        Swapping beef ribeye with plant patties saves 7.5kg CO₂ and $2.50.
                      </div>
                    </div>
                  )}

                  {/* SCENE 5: MEAL ANALYZER */}
                  {currentScene === 4 && (
                    <div className="glass-card max-w-sm mx-auto p-5 rounded-2xl border border-white/10 text-left space-y-4 shadow-xl">
                      <div className="flex items-center justify-between">
                        <Badge variant="premium" className="text-[9px] uppercase border-none py-0.5 bg-primary-500/20 text-primary-400 font-bold">Meal: Dinner</Badge>
                        <span className="text-xs font-black text-slate-200">Chicken Biryani</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
                          <span className="block font-semibold text-slate-400 uppercase text-[8px]">Carbon footprint</span>
                          <span className="block text-xs font-extrabold text-red-500 mt-0.5">2.8 kg CO₂</span>
                        </div>
                        <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
                          <span className="block font-semibold text-slate-400 uppercase text-[8px]">Water usage</span>
                          <span className="block text-xs font-extrabold text-blue-400 mt-0.5">450 Liters</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/25 rounded-xl text-[11px] text-slate-300 leading-relaxed">
                        <span className="font-extrabold text-emerald-400 block mb-0.5">Alternative Solution:</span>
                        Try jackfruit biryani. Saves 2.2kg CO₂ emissions.
                      </div>
                    </div>
                  )}

                  {/* SCENE 6: TRAVEL MAP PLANNER */}
                  {currentScene === 5 && (
                    <div className="glass-card max-w-md mx-auto p-4 rounded-2xl border border-white/10 text-left space-y-3 shadow-xl">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                        <span>Commute Route Comparison</span>
                        <span className="text-primary-400 flex items-center gap-1">
                          <Navigation className="h-3.5 w-3.5" /> Route Option
                        </span>
                      </div>
                      
                      <div className="h-28 rounded-xl bg-slate-900 border border-white/5 relative overflow-hidden flex items-center justify-center">
                        {/* Mock SVG Path Drawing */}
                        <svg className="absolute inset-0 w-full h-full stroke-primary-500/30" strokeWidth="2.5" fill="none">
                          <path d="M 40 80 Q 150 20 280 90" />
                          <motion.path
                            d="M 40 80 Q 150 20 280 90"
                            stroke="#10B981"
                            strokeWidth="3"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 4, repeat: Infinity }}
                          />
                        </svg>
                        <span className="absolute top-14 left-7 text-[9px] bg-slate-950/80 px-2 py-0.5 border border-white/10 rounded font-bold text-white">Start</span>
                        <span className="absolute bottom-6 right-7 text-[9px] bg-slate-950/80 px-2 py-0.5 border border-white/10 rounded font-bold text-white">Office</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-center font-bold">
                        <div className="p-2 rounded bg-white/5 border border-white/5 text-red-500">
                          Car: +1.8kg CO₂
                        </div>
                        <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          Bicycle: 0kg CO₂ (AI Best Choice)
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCENE 7: ENERGY AUDIT Scan */}
                  {currentScene === 6 && (
                    <div className="glass-card max-w-sm mx-auto p-5 rounded-2xl border border-white/10 text-left space-y-4 shadow-xl">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                        <span>PGE Electricity Bill</span>
                        <span className="text-emerald-400">Tariff Scanned</span>
                      </div>
                      
                      <div className="space-y-1.5 leading-relaxed text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Units Consumed</span>
                          <span className="text-white font-bold">280 kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tariff Detail</span>
                          <span className="text-white font-bold">Time-Of-Use Residential</span>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-slate-300 leading-normal flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-emerald-400 block">Solar Prediction:</span>
                          Solar installation offsets grid draw by 85%, saving $120 monthly.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCENE 8: DIGITAL CARBON TWIN FUTURE HERO MOMENT */}
                  {currentScene === 7 && (
                    <div className="flex flex-col items-center space-y-5">
                      {/* Stylized Growing forest trees */}
                      <div className="flex items-end justify-center gap-4 h-24">
                        <motion.div
                          animate={{ height: simYear >= 2030 ? [10, 48] : [10, 24] }}
                          className="w-4 bg-emerald-500 rounded-t-full glow-emerald"
                        />
                        <motion.div
                          animate={{ height: simYear >= 2035 ? [10, 72] : [10, 36] }}
                          className="w-5 bg-teal-500 rounded-t-full"
                        />
                        <motion.div
                          animate={{ height: simYear >= 2040 ? [10, 96] : [10, 48] }}
                          className="w-6 bg-emerald-600 rounded-t-full glow-emerald"
                        />
                      </div>

                      {/* Slider controls info */}
                      <div className="p-4 bg-white/5 border border-white/5 rounded-2xl w-full max-w-sm text-left font-sans space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                          <span>Simulation projection year</span>
                          <span className="text-primary-400 text-xs font-black">{simYear}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <span className="text-slate-500 block">Footprint Emitted</span>
                            <span className="text-red-400 font-bold block text-xs">
                              {simYear === 2025 ? '320kg' : simYear === 2030 ? '180kg' : '48kg'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Forest size</span>
                            <span className="text-emerald-400 font-bold block text-xs">
                              {simYear === 2025 ? '12 trees' : simYear === 2030 ? '48 trees' : '150 trees'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCENE 9: COMMUNITY MAP PLACES */}
                  {currentScene === 8 && (
                    <div className="glass-card max-w-md mx-auto p-4 rounded-2xl border border-white/10 text-left space-y-3 shadow-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Community eco map spots</span>
                      
                      <div className="h-28 rounded-xl bg-slate-900 border border-white/5 relative overflow-hidden flex items-center justify-center">
                        {/* Draw flashing dots to represent community centers */}
                        <div className="absolute top-5 left-12 w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
                        <div className="absolute top-5 left-12 w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="absolute top-10 left-8 text-[8px] bg-slate-950/80 p-1 rounded font-bold border border-white/10 text-white">Tree Plantation</span>

                        <div className="absolute bottom-6 right-16 w-3.5 h-3.5 rounded-full bg-blue-500 animate-ping" />
                        <div className="absolute bottom-6 right-16 w-2 h-2 rounded-full bg-blue-500" />
                        <span className="absolute bottom-1 right-12 text-[8px] bg-slate-950/80 p-1 rounded font-bold border border-white/10 text-white">Recycling Center</span>
                      </div>
                    </div>
                  )}

                  {/* SCENE 10: GAMIFICATION CONFETTI CELEBRATION */}
                  {currentScene === 9 && (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 bg-gradient-to-tr from-amber-500 to-yellow-500 text-white rounded-3xl glow-amber animate-bounce shadow-xl">
                        <Award className="h-10 w-10 text-white" />
                      </div>
                      
                      <div className="text-center space-y-1">
                        <Badge variant="premium" className="text-[10px] tracking-wide font-black uppercase bg-amber-500/20 text-amber-500 border-none">Level 12 Reached</Badge>
                        <h4 className="text-base font-extrabold text-white">Pioneer Level Up!</h4>
                        <p className="text-[11px] text-slate-400 font-sans">
                          Unlocked Cycling Champion badge. Earned +150 Coins.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SCENE 11: COPILOT AI OS SUMMARY */}
                  {currentScene === 10 && (
                    <div className="glass-card max-w-sm mx-auto p-5 rounded-2xl border border-white/10 text-left space-y-3.5 shadow-xl font-sans text-xs">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary-400" />
                        <span className="font-bold text-white">Copilot Profiler Insights</span>
                      </div>

                      <div className="space-y-2">
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                          <span className="block font-bold text-emerald-400 uppercase text-[8px]">Top Strength</span>
                          Clean travel commutes logged via bicycle planner
                        </div>
                        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/25">
                          <span className="block font-bold text-red-400 uppercase text-[8px]">Weakness to solve</span>
                          Single-use plastic packages from Trader Joe's scans
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCENE 12: DECISION MAKING ADVISORY */}
                  {currentScene === 11 && (
                    <div className="glass-card max-w-md mx-auto p-5 rounded-2xl border border-white/10 text-left space-y-4 shadow-xl text-xs font-sans">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">AI Decision comparison</span>
                      
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1.5 leading-relaxed">
                        <p className="font-bold text-white flex items-center gap-1.5">
                          <HelpCircle className="h-4.5 w-4.5 text-primary-500" />
                          Should I drive or take the bus?
                        </p>
                        <p className="text-slate-350 text-[11px]">
                          Taking the bus saves approximately 1.4kg CO₂ emissions per commute. Over a year, this offsets equivalent carbon matching 15 tree seedlings.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SCENE 13: THE LIVING PLANET */}
                  {currentScene === 12 && (
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="relative w-44 h-44 rounded-full border border-emerald-500/20 flex items-center justify-center glow-emerald">
                        {/* Spinning earth lines */}
                        <div className="absolute inset-1 rounded-full border border-emerald-500/10 animate-spin-slow" />
                        <div className="absolute inset-4 rounded-full border border-dashed border-teal-500/10" />
                        <Globe className="h-24 w-24 text-emerald-400 animate-pulse" />
                      </div>
                      <p className="text-[11px] text-slate-450 uppercase font-black tracking-widest text-center">
                        Unified Ecological Ecosystem
                      </p>
                    </div>
                  )}

                  {/* SCENE 14: FINAL IMPACT SUMMARY COUNTERS */}
                  {currentScene === 13 && (
                    <div className="glass-card max-w-sm mx-auto p-5 rounded-2xl border border-white/10 text-left space-y-4 shadow-xl">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 pb-2 border-b border-white/5">
                        <span>Total Walkthrough Offsets</span>
                        <span className="text-emerald-400">Audited Summary</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                        <div>
                          <span className="text-slate-500 block">Carbon Saved</span>
                          <span className="text-emerald-400 font-extrabold text-sm mt-0.5">42.5 kg CO₂</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Water Saved</span>
                          <span className="text-blue-400 font-extrabold text-sm mt-0.5">2,450 Liters</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Money Saved</span>
                          <span className="text-amber-500 font-extrabold text-sm mt-0.5">$68.20</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Trees Planted</span>
                          <span className="text-teal-400 font-extrabold text-sm mt-0.5">12 Saplings</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Box: AI Narrator Speech bubble */}
            <div className="w-full md:w-80 flex flex-col gap-4">
              <div className="p-4 rounded-2xl glass-card border border-primary-500/20 text-left space-y-3.5 relative overflow-hidden flex-1 shadow-lg min-h-[160px]">
                {/* Background glow */}
                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-16 h-16 bg-primary-500/10 rounded-full blur-xl pointer-events-none" />

                {/* Narrator Profile info */}
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-gradient-to-tr from-indigo-500 to-primary-500 text-white">
                    <Bot className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div className="text-left leading-tight">
                    <h5 className="text-xs font-black text-white font-sans">Copilot OS Narrator</h5>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold">AI Dialogue Engine</span>
                  </div>
                </div>

                {/* Typed narrative dialogue text */}
                <p className="text-xs text-slate-350 leading-relaxed font-sans min-h-[80px]">
                  {typingText}
                </p>
              </div>

              {/* End Card triggers */}
              {currentScene === 13 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2 text-center"
                >
                  <p className="text-[11px] italic font-black text-slate-400 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-sky-400">
                    "Together, we don't just measure sustainability. We create it."
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleCompleteExperience}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 border-none font-bold text-xs"
                  >
                    Enter Application
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Tour Controller Slider bar */}
          <div className="p-6 bg-gradient-to-t from-black/35 to-transparent z-10 w-full">
            <div className="max-w-4xl mx-auto p-4 rounded-2xl glass-card border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              
              {/* Left: Playback Controls */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleBack}
                  disabled={currentScene === 0}
                  aria-label="Previous Scene (Left Arrow)"
                  className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause Tour (Spacebar)" : "Play Tour (Spacebar)"}
                  className="p-3.5 rounded-full bg-primary-500 text-white hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                  {isPlaying ? <Pause className="h-4.5 w-4.5 fill-white text-white" /> : <Play className="h-4.5 w-4.5 fill-white text-white" />}
                </button>
                <button
                  onClick={handleSkip}
                  aria-label="Next Scene (Right Arrow)"
                  className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTimer(0)}
                  aria-label="Replay Tour from Start"
                  className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-slate-450 hover:text-white transition-colors"
                  title="Replay from start"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* Center: Timeline Progress slider */}
              <div className="flex-1 w-full flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 tracking-wide font-sans">
                  {timer}s
                </span>
                <input
                  type="range"
                  min="0"
                  max={TOTAL_DURATION}
                  value={timer}
                  onChange={(e) => setTimer(parseInt(e.target.value))}
                  aria-label="Tour Timeline Progress"
                  className="flex-1 accent-primary-500 bg-white/10 rounded-lg h-1.5 focus:outline-none"
                />
                <span className="text-[10px] font-bold text-slate-400 tracking-wide font-sans">
                  {TOTAL_DURATION}s
                </span>
              </div>

              {/* Right: Audio Volume toggles */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  aria-label={muteAudio ? "Unmute Voice Narration (Key M)" : "Mute Voice Narration (Key M)"}
                  className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                  {muteAudio ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
                </button>
                <Badge variant="premium" size="sm" className="text-[9px] uppercase tracking-wider py-1 font-black bg-primary-500/10 text-primary-400 border-none">
                  90s Tour
                </Badge>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
};
export default ExperienceMode;
