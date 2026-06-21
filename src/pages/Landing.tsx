import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  Globe,
  TrendingDown,
  Sparkles,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  CheckCircle2,
  Users,
  Play
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Footer } from '../components/Footer';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleStartDemo = () => {
    navigate('/experience');
  };

  const stats = [
    { value: '14,824 tons', label: 'CO₂ Offsets Tracked', icon: <TrendingDown className="h-5 w-5 text-emerald-500" /> },
    { value: '62,400+', label: 'Eco Pioneers Active', icon: <Users className="h-5 w-5 text-blue-500" /> },
    { value: '185,000+', label: 'Trees Planted & Logged', icon: <Leaf className="h-5 w-5 text-teal-500" /> },
  ];

  const features = [
    {
      title: 'AI Carbon Coach',
      desc: 'Connect with an intelligent AI model tailored to analyze your consumption metrics and build dynamic habits.',
      icon: <Sparkles className="h-6 w-6 text-emerald-500" />
    },
    {
      title: 'Predictive Analytics',
      desc: 'Map footprint paths. Forecast monthly trends and evaluate which lifestyle upgrades yield massive emission drops.',
      icon: <TrendingDown className="h-6 w-6 text-blue-500" />
    },
    {
      title: 'EV & Recycling Maps',
      desc: 'Find eco centers, public compost hubs, tree planting gatherings, and EV charging points dynamically.',
      icon: <MapPin className="h-6 w-6 text-teal-500" />
    },
    {
      title: 'Smart OCR Scanner',
      desc: 'Upload grocery, utility, or travel bills. Let AI catalog carbon impacts item-by-item instantly.',
      icon: <Zap className="h-6 w-6 text-amber-500" />
    }
  ];

  const roadmap = [
    { phase: 'Phase 1', title: 'Platform Core', desc: 'Secure Firebase client architectures, responsive premium dashboard layout, and Recharts core modules.', status: 'completed' },
    { phase: 'Phase 2', title: 'AI Module Rollout', desc: 'Plug-in backend Gemini controllers for Coach, predictions, receipts OCR scans, and intelligent tips.', status: 'current' },
    { phase: 'Phase 3', title: 'Maps & Web3 Rewards', desc: 'Lazy load Google Maps services and integrate digital wallets for verified green token transactions.', status: 'upcoming' },
  ];

  const faqs = [
    { q: 'How does CarbonMind AI calculate my carbon footprint?', a: 'CarbonMind combines user logged activities (travel, diet, utility consumption) with standardized Greenhouse Gas Protocol emissions calculations. Our AI model refines this baseline by examining local grid data and weather habits.' },
    { q: 'Is my data secure on the platform?', a: 'Yes. All authentication operations use Firebase Auth combined with JWT structures. Personal information is completely secure, and we comply with regional data privacy guidelines.' },
    { q: 'Can I integrate my team or business?', a: 'Definitely. We support Communities, Families, and College guilds where teams can compete in group challenges, share leaderboards, and aggregate total offsets.' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-darkBg transition-colors duration-300 relative overflow-hidden">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary-500/10 dark:bg-primary-500/5 blur-3xl -z-10" />
      <div className="absolute top-40 right-1/4 w-96 h-96 rounded-full bg-secondary-500/10 dark:bg-secondary-500/5 blur-3xl -z-10" />

      {/* HEADER NAVBAR (Landing Spec) */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/60 dark:bg-darkBg/60 backdrop-blur-md border-b border-slate-100 dark:border-zinc-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight font-sans">
              CarbonMind <span className="text-xs text-primary-500 font-bold uppercase">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center min-h-[90vh]">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-bold font-sans">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Phase One Core Architecture Active
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 font-sans leading-tight">
            Small Actions. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500">
              Massive Impact.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 dark:text-zinc-400 max-w-xl font-sans leading-relaxed">
            The foundation for an AI-powered sustainability ecosystem. Track, analyze, and offset your carbon footprints using advanced algorithms, community challenges, and interactive AI coaches.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/register">
              <Button variant="primary" size="lg" className="flex items-center gap-2">
                Join the Pioneer Network <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="glass"
              size="lg"
              onClick={handleStartDemo}
              className="flex items-center gap-2 border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold animate-pulse"
            >
              <Play className="h-4 w-4 text-emerald-500 fill-emerald-500" />
              Interactive Platform Tour
            </Button>
            <Link to="/login">
              <Button variant="glass" size="lg">Explore Platform</Button>
            </Link>
          </div>
        </motion.div>

        {/* NEON EARTH WIREFRAME CONTAINER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative flex items-center justify-center min-h-[360px]"
        >
          {/* Neon Globe sphere */}
          <div className="relative w-80 h-80 rounded-full border border-primary-500/25 flex items-center justify-center glow-emerald animate-spin-slow">
            <div className="absolute inset-4 rounded-full border border-dashed border-secondary-500/20" />
            <div className="absolute inset-12 rounded-full border border-primary-500/10 flex items-center justify-center earth-grid h-[70%] w-[70%]" />
            <Globe className="h-28 w-28 text-primary-500/60 dark:text-primary-400/40" />
          </div>

          {/* Floating glass cards */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 -left-6 glass-card bg-white/70 dark:bg-zinc-950/70 p-3 rounded-2xl border border-white/20 shadow-lg flex items-center gap-2.5 z-10"
          >
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-sm">🚴</span>
            <div className="text-left font-sans text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-100">Biked to Work</p>
              <p className="text-[10px] text-emerald-500 font-semibold">-2.4 kg CO₂ saved</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-10 -right-6 glass-card bg-white/70 dark:bg-zinc-950/70 p-3 rounded-2xl border border-white/20 shadow-lg flex items-center gap-2.5 z-10"
          >
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500 text-sm">🥗</span>
            <div className="text-left font-sans text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-100">Meatless Lunch</p>
              <p className="text-[10px] text-emerald-500 font-semibold">-1.8 kg CO₂ saved</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* STATISTICS */}
      <section className="bg-slate-50/50 dark:bg-zinc-950/10 py-16 transition-colors border-y border-slate-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <Card key={idx} variant="glass" className="flex items-center gap-4 py-8 px-6 text-left group">
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-sans">
                  {stat.value}
                </h3>
                <p className="text-xs text-slate-400 dark:text-zinc-550 font-bold uppercase tracking-wider mt-0.5">
                  {stat.label}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* WHY CARBONMIND */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-sans text-slate-800 dark:text-slate-100">
            Why CarbonMind AI?
          </h2>
          <p className="text-sm text-slate-450 dark:text-zinc-500 max-w-xl mx-auto">
            Our platform features premium tools to make carbon footprint tracking interactive, rewarding, and highly predictive.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <Card key={idx} variant="glass" hoverable className="text-left p-6 space-y-4">
              <div className="p-3.5 w-fit rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-slate-200">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans">
                {feat.title}
              </h3>
              <p className="text-xs leading-relaxed text-slate-450 dark:text-zinc-500 font-sans">
                {feat.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* TIMELINE ROADMAP */}
      <section className="bg-slate-50/50 dark:bg-zinc-950/10 py-24 border-y border-slate-100 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight font-sans text-slate-800 dark:text-slate-100">
              Platform Roadmap
            </h2>
            <p className="text-sm text-slate-450 dark:text-zinc-500">
              Where we are, and where our sustainable AI solutions are heading.
            </p>
          </div>

          <div className="relative border-l-2 border-slate-150 dark:border-zinc-800 text-left pl-6 space-y-10 ml-4 sm:ml-6">
            {roadmap.map((item, idx) => (
              <div key={idx} className="relative">
                {/* Node Dot */}
                <span className={`absolute -left-[31px] top-1.5 block w-4 h-4 rounded-full border-2 ${
                  item.status === 'completed'
                    ? 'bg-emerald-500 border-emerald-300'
                    : item.status === 'current'
                    ? 'bg-blue-500 border-blue-300 animate-pulse'
                    : 'bg-slate-200 border-slate-100 dark:bg-zinc-800 dark:border-zinc-900'
                }`} />
                
                <div className="space-y-1 font-sans">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded">
                    {item.phase}
                  </span>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-450 dark:text-zinc-450 leading-relaxed max-w-2xl">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight font-sans text-slate-800 dark:text-slate-100">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-400 dark:text-zinc-550">
            Everything you need to know about the platform's features and setup.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Card
              key={idx}
              variant="glass"
              className="text-left cursor-pointer p-5 transition-all"
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-sans">
                  {faq.q}
                </h4>
                <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </div>
              
              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="overflow-hidden text-xs text-slate-450 dark:text-zinc-450 leading-relaxed font-sans"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Card
          variant="glass"
          glow
          className="bg-gradient-to-br from-emerald-500/15 via-primary-500/5 to-secondary-500/15 border-primary-500/20 p-12 md:p-16 flex flex-col items-center gap-6"
        >
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-md">
            <Leaf className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 font-sans leading-tight">
            Ready to track, reduce, <br />
            and improve your impact?
          </h2>
          <p className="text-sm text-slate-450 dark:text-zinc-400 max-w-md font-sans">
            Start logging your activities today and collaborate with thousands of sustainability pioneers globally.
          </p>
          <Link to="/register" className="mt-2">
            <Button variant="primary" size="lg" className="flex items-center gap-2">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </section>



      {/* FOOTER */}
      <Footer />
    </div>
  );
};
export default Landing;
