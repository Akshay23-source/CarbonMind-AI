import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, X, Bot, Award, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from './Badge';
import { Button } from './Button';

interface DemoTourGuideProps {
  active: boolean;
  setActive: (val: boolean) => void;
  step: number;
  setStep: (step: number) => void;
  setCopilotOpen: (val: boolean) => void;
}

interface TourStep {
  title: string;
  path: string;
  badge: string;
  explanation: string;
  techNotes: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Platform Landing',
    path: '/',
    badge: 'Marketing',
    explanation: 'Welcome to CarbonMind. Our landing page showcases aggregated ecological statistics, key feature definitions, and the project roadmap.',
    techNotes: 'Built using React, Framer Motion, and Tailwind CSS.'
  },
  {
    title: 'Secure Access Gateway',
    path: '/login',
    badge: 'Credentials',
    explanation: 'We support Firebase Authentication and Google Sign-In. Clicking "Demo Tour Login" bypasses credentials and pre-seeds the user profile.',
    techNotes: 'JWT verification middleware acts as the gateway protector.'
  },
  {
    title: 'Executive Scorecard Dashboard',
    path: '/dashboard',
    badge: 'Overview',
    explanation: 'Your daily center. Features morning briefing cards, streak counters, carbon footprint predictions, and progress indicators.',
    techNotes: 'Uses local cache services and custom Recharts charts.'
  },
  {
    title: 'AI Carbon Scanner',
    path: '/tracker',
    badge: 'NLP Logging',
    explanation: 'Describe actions in natural language (e.g. "I rode my bicycle for 10 km"). The scanner extracts categories and calculates offsets.',
    techNotes: 'Gemini 1.5 Flash models analyze inputs with regex local fallbacks.'
  },
  {
    title: 'OCR Receipt Scanner',
    path: '/scanner',
    badge: 'Vision Audits',
    explanation: 'Upload grocery bills to analyze purchase items, assign eco-ratings, and recommend greener alternative swaps.',
    techNotes: 'Powered by Gemini Vision OCR APIs and Firestore collection syncs.'
  },
  {
    title: 'AI Meal Analyzer',
    path: '/meals',
    badge: 'Nutrition Eco-Audit',
    explanation: 'Upload photos of your food. AI parses ingredients, nutrition benchmarks, and water footprints to calculate meal sustainability.',
    techNotes: 'Direct Gemini Vision JSON schema responses with local mock presets.'
  },
  {
    title: 'Smart Travel Planner',
    path: '/travel',
    badge: 'Clean Routing',
    explanation: 'Define travel paths. Copilot compares cycling, transit, and EV carbon outputs with standard driving averages.',
    techNotes: 'Leaflet Maps, coordinate polyline tracings, and distance factors.'
  },
  {
    title: 'Home Energy Intelligence',
    path: '/energy',
    badge: 'Utility Audits',
    explanation: 'Audit electricity statements. Model appliance usage, review solar savings tariffs, and simulate reduction offsets.',
    techNotes: 'Tariff engine formulas, chart overlays, and appliance profiles.'
  },
  {
    title: 'Futuristic Carbon Twin™',
    path: '/twin',
    badge: 'Digital Identity',
    explanation: 'Your green avatar. Simulates lifestyle what-if choices, tracks digital earth parameters, and visualizes carbon forest growth.',
    techNotes: 'Twin personality classification models and personal forest syncs.'
  },
  {
    title: 'Live Community Map',
    path: '/map',
    badge: 'OSM Leaflet Map',
    explanation: 'Display local charging spots, recycling hubs, NGOs, and cleanup drives. Filter by distance or volunteer type.',
    techNotes: 'React-Leaflet, custom Map icons, clustering, and map filters.'
  },
  {
    title: 'CarbonMind Copilot OS',
    path: '/dashboard', // we will navigate to dashboard and open copilot
    badge: 'Central AI OS',
    explanation: 'We have automatically opened CarbonMind Copilot! Try out the multi-language voice dictation, search logs, and PDF reports.',
    techNotes: 'Web Speech recognition, SpeechSynthesis, and Markdown PDF exports.'
  },
  {
    title: 'Final Walkthrough Impact Summary',
    path: '/dashboard',
    badge: 'Success',
    explanation: 'Congratulations! You have completed the guided tour. You explored all modules and logged carbon offsets successfully.',
    techNotes: 'Pioneer certificate initialized. Thank you for evaluating CarbonMind.'
  }
];

export const DemoTourGuide: React.FC<DemoTourGuideProps> = ({
  active,
  setActive,
  step,
  setStep,
  setCopilotOpen
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsDemoUser } = useAuth();

  const currentStepData = TOUR_STEPS[step - 1];

  // Route syncing logic
  useEffect(() => {
    if (!active || !currentStepData) return;

    // Redirect if they are on a different page than the step requirements
    if (location.pathname !== currentStepData.path) {
      navigate(currentStepData.path);
    }

    // Force open Copilot Chat on Step 11
    if (step === 11) {
      setCopilotOpen(true);
    } else {
      setCopilotOpen(false);
    }
  }, [step, active]);

  if (!active || !currentStepData) return null;

  const handleNext = async () => {
    if (step === 2) {
      // Automatically log in as demo user when moving from Step 2 to Step 3
      await loginAsDemoUser();
      setStep(3);
    } else if (step < TOUR_STEPS.length) {
      setStep(step + 1);
    } else {
      // End of tour
      setActive(false);
      localStorage.removeItem('carbonmind_demo_active');
      localStorage.removeItem('carbonmind_demo_step');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit the guided tour?')) {
      setActive(false);
      localStorage.removeItem('carbonmind_demo_active');
      localStorage.removeItem('carbonmind_demo_step');
      setCopilotOpen(false);
    }
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 z-40 sm:w-[92%] sm:max-w-3xl pointer-events-none">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="pointer-events-auto p-5 rounded-2xl glass-card border border-primary-500/35 shadow-2xl space-y-4 text-left relative overflow-hidden"
      >
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-900/60 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-primary-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Guided Walkthrough Tour • Step {step} of 12
            </span>
            <Badge variant="premium" size="sm" className="text-[8px] py-0 bg-primary-500/20 text-primary-600 dark:text-primary-400 border-none font-black uppercase">
              {currentStepData.badge}
            </Badge>
          </div>
          <button
            onClick={handleExit}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content explanation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
          <div className="md:col-span-2 space-y-1.5">
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">
              {currentStepData.title}
            </h4>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-350">
              {currentStepData.explanation}
            </p>
          </div>

          {/* Technical Info Box */}
          <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-905 border border-slate-100 dark:border-zinc-800/80 space-y-1 flex flex-col justify-center">
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-550 block">
              Developer Notes
            </span>
            <p className="text-[10px] text-slate-550 dark:text-zinc-400 leading-normal font-sans italic">
              {currentStepData.techNotes}
            </p>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="flex justify-between items-center pt-1">
          {/* Progress bar */}
          <div className="flex-1 max-w-[200px] h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mr-4">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-550"
              style={{ width: `${(step / 12) * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Back button */}
            <Button
              variant="glass"
              size="sm"
              onClick={handleBack}
              disabled={step === 1}
              className="h-9 py-1 px-3 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border-slate-150 dark:border-zinc-800"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </Button>

            {/* Next / Proceed button */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              className="h-9 py-1 px-4.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 border-none shadow-md"
            >
              {step === 12 ? 'Complete Tour' : 'Next Step'}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default DemoTourGuide;
