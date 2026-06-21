import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  Globe,
  Sparkles,
  Clock,
  Coins,
  TrendingUp,
  Leaf,
  DollarSign,
  TreeDeciduous,
  Volume2,
  Mic,
  Plus,
  Users,
  Award,
  Trophy,
  Zap,
  Droplet,
  Trash2,
  Flame,
  CheckCircle,
  HelpCircle,
  Activity,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const CarbonTwin: React.FC = () => {
  const { user, logActivity } = useAuth();

  // What-If Simulator variables
  const [simulationInputs, setSimulationInputs] = useState({
    vegetarian: false,
    cycle3Days: false,
    noPlasticBottles: false,
    solarPanels: false,
    publicTransit: false,
    reduceElectric20: false,
    familyJoins: false
  });

  // Slider period for predictions
  const [selectedPeriod, setSelectedPeriod] = useState<'1m' | '3m' | '6m' | '1y' | '5y' | '10y'>('6m');
  const [targetYear, setTargetYear] = useState<2030 | 2040 | 2050>(2030);

  // Twin states loaded from backend
  const [twinData, setTwinData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Voice Assistant states
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceReply, setVoiceReply] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  // Call backend API on simulator changes
  const fetchTwinData = async () => {
    try {
      setError(null);
      const endpoint = '/api/ai/carbon-twin';
      const token = localStorage.getItem('carbonmind_token');
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userProfile: user || { ecoScore: 75 },
          simulationInputs
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTwinData(data);
        } else {
          throw new Error(data.message || "Failed to generate twin projections");
        }
      } else {
        throw new Error("Server returned an error status");
      }
    } catch (err: any) {
      console.error("Failed to load Carbon Twin projections:", err);
      setError(err.message || "Connection to AI Twin failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTwinData();
  }, [simulationInputs, user]);

  const handleToggleSimulation = (key: keyof typeof simulationInputs) => {
    setSimulationInputs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Voice Assistant queries
  const handleVoiceQuery = (query: string) => {
    setVoiceQuery(query);
    setIsAnswering(true);

    setTimeout(() => {
      let reply = "";
      const lower = query.toLowerCase();

      if (lower.includes("future")) {
        const score = twinData?.twinProfile?.planetImpactScore || 750;
        reply = `Your twin projects a Future Planet Score of ${score}/1000. Under current simulations, you will offset ${twinData?.timelinePredictions?.[selectedPeriod]?.carbonOffsetKg || 120}kg of carbon footprint within the year.`;
      } else if (lower.includes("meat")) {
        reply = "Going vegetarian offsets 65kg of CO₂ and saves 350 liters of water monthly, which equals planting 35 trees over the next decade.";
      } else if (lower.includes("solar")) {
        reply = "Installing solar panels offsets 125kg of CO₂ monthly, dropping your grid power emissions to near-zero and paying back in under 5 years.";
      } else if (lower.includes("save")) {
        const savings = twinData?.timelinePredictions?.['1y']?.moneySaved || 12000;
        reply = `By 2030, your accumulated eco savings are projected to reach ${user?.onboardingData?.basicInfo?.currency || '₹'} ${savings * 4}, while planting ${Math.round(savings / 200)} virtual trees.`;
      } else if (lower.includes("95")) {
        reply = "To scale your EcoScore to 95, cycle commute at least 3 days a week, transition completely to organic vegan foods, and eliminate single-use plastics.";
      } else {
        reply = "I am your carbon twin advisor. You can ask me about your future, solar panel savings, or how to optimize your score.";
      }

      setVoiceReply(reply);
      setIsAnswering(false);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(reply);
        window.speechSynthesis.speak(utterance);
      }
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <RefreshCw className="h-10 w-10 text-primary-500 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500">Syncing Carbon Twin profile model...</p>
      </div>
    );
  }

  if (error || !twinData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6 space-y-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md mx-auto my-12 shadow-md">
        <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-2xl">⚠️</div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Carbon Twin Connection Failed</h3>
        <p className="text-xs text-slate-450 leading-relaxed">
          {error || "Could not synchronize projections from the server. Please verify your backend server connection."}
        </p>
        <button 
          onClick={() => { setLoading(true); fetchTwinData(); }}
          className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors"
        >
          Try Syncing Again
        </button>
      </div>
    );
  }

  const activePrediction = twinData?.timelinePredictions?.[selectedPeriod] || {
    carbonEmittedKg: 0,
    moneySaved: 0,
    waterSavedL: 0,
    treesEquivalent: 0,
    achievements: []
  };
  const activeYearPrediction = twinData?.climateSimulator?.[`yr${targetYear}`] || {
    projectedCarbonKg: 0,
    legacyScore: 0,
    globalRank: 0
  };

  // Helper colors for Recharts
  const CHART_COLORS = ['#10b981', '#64748b'];

  return (
    <div className="w-full max-w-7xl mx-auto font-sans text-slate-800 dark:text-slate-200">
      
      {/* Premium Glass Header banner */}
      <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-r from-teal-500/20 to-sky-500/10 dark:from-teal-950/40 dark:to-sky-950/20 p-8 border border-teal-500/10 dark:border-teal-500/5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400 mb-3 border border-teal-500/20">
              <Globe className="h-3.5 w-3.5" /> Flagship Module
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Carbon Twin™ <span className="text-xs font-bold bg-teal-500 text-white px-2 py-0.5 rounded-full tracking-widest">LIVE AI</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Futuristic living digital representation of your ecological lifestyle. Models what-if changes and forecasts your legacy.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md px-5 py-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50">
            <div className="h-10 w-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">Rank Level</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                🏆 {twinData?.twinProfile?.environmentalRank || 'Eco Explorer'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Twin Profile & Earth Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Panel 1: Profile Details */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Digital Twin Profile</h3>
            
            <div className="space-y-5">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Carbon Personality</span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{twinData?.twinProfile?.personality || 'Eco Pioneer'}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Lifestyle Type</span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-350 mt-0.5">{twinData?.twinProfile?.lifestyleType || 'Conscious Consumer'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Carbon Age</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{twinData?.twinProfile?.carbonAge !== undefined ? twinData.twinProfile.carbonAge : 30} Years</p>
                  <p className="text-[9px] text-slate-400 font-medium">Lower is better</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Sustainability Level</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{twinData?.twinProfile?.sustainabilityLevel || 'Intermediate'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Planet Impact Score</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-teal-500">{twinData?.twinProfile?.planetImpactScore !== undefined ? twinData.twinProfile.planetImpactScore : 750}</span>
              <span className="text-sm text-slate-400">/ 1000 Pts</span>
            </div>
            
            {/* Visual Score progress bar */}
            <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: `${((twinData?.twinProfile?.planetImpactScore || 750) / 1000) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Panel 2: Animated Digital Earth SVG */}
        <div className="bg-slate-900 border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[350px]">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider absolute top-6 left-6">Digital Earth Sandbox</h3>
          
          {/* Futuristic glowing rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 rounded-full border border-teal-500/10 animate-ping" />
            <div className="w-80 h-80 rounded-full border border-sky-500/5 animate-pulse" />
          </div>

          {/* SVG Digital Earth Container */}
          <div className="relative w-48 h-48 rounded-full shadow-2xl flex items-center justify-center overflow-hidden border-2 border-teal-500/20 bg-slate-950">
            
            {/* Animated cloud layers */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 via-sky-900 to-transparent pointer-events-none"
            />

            {/* Changing Earth globe details */}
            <svg viewBox="0 0 100 100" className="w-40 h-40">
              {/* Atmosphere glow ring */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" className="animate-spin" />
              
              {/* Sea base */}
              <circle cx="50" cy="50" r="40" fill="#0f172a" />
              
              {/* Continent paths shifting colors based on score */}
              <path
                d="M30 40 Q40 30 50 35 T70 30 T85 45 Q75 55 50 50 T30 40 Z"
                fill={(twinData?.twinProfile?.planetImpactScore || 750) >= 800 ? '#10b981' : '#f59e0b'}
                className="opacity-70 transition-all duration-1000"
              />
              
              <path
                d="M20 60 Q30 55 45 65 T75 60 Q65 75 40 75 Z"
                fill={(twinData?.twinProfile?.planetImpactScore || 750) >= 700 ? '#10b981' : '#b45309'}
                className="opacity-60 transition-all duration-1000"
              />

              {/* Polar Ice caps - shrinking/expanding based on score */}
              <ellipse
                cx="50"
                cy="14"
                rx={Math.max(5, Math.round(10 + ((twinData?.twinProfile?.planetImpactScore || 750) - 500) * 0.05))}
                ry="4"
                fill="#f8fafc"
                className="transition-all duration-1000"
              />
              <ellipse
                cx="50"
                cy="86"
                rx={Math.max(5, Math.round(8 + ((twinData?.twinProfile?.planetImpactScore || 750) - 500) * 0.04))}
                ry="4"
                fill="#f8fafc"
                className="transition-all duration-1000"
              />

              {/* Visual forest growth pins */}
              {(twinData?.twinProfile?.planetImpactScore || 750) >= 750 && (
                <>
                  <circle cx="45" cy="40" r="1.5" fill="#34d399" />
                  <circle cx="52" cy="42" r="2.0" fill="#059669" />
                  <circle cx="60" cy="38" r="1.2" fill="#10b981" />
                </>
              )}
            </svg>
            
            {/* Overlay score display */}
            <div className="absolute bottom-4 flex flex-col items-center">
              <span className="text-[9px] font-bold text-teal-400 tracking-widest uppercase">Stability</span>
              <span className="text-xs font-black text-white mt-0.5">{twinData?.digitalEarth?.iceCapStabilityPct !== undefined ? twinData.digitalEarth.iceCapStabilityPct : 50}%</span>
            </div>
          </div>

          <div className="mt-6 text-center z-10">
            <p className="text-white text-xs font-bold">Atmosphere Clarity: {twinData?.digitalEarth?.atmosphereClarityPct !== undefined ? twinData.digitalEarth.atmosphereClarityPct : 60}%</p>
            <p className="text-slate-400 text-[10px] mt-1.5 leading-relaxed">
              Active Animals: {twinData?.digitalEarth?.animalsPresent ? twinData.digitalEarth.animalsPresent.join(', ') : 'None'}
            </p>
          </div>
        </div>

        {/* Panel 3: Virtual Forest */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Your Virtual Forest</h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">Every simulated carbon reduction expands your private forest reserve.</p>
            
            <div className="space-y-4">
              {(twinData?.personalForest?.species || []).map((sp: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50/50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🌲</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{sp.name}</p>
                      <p className="text-[9px] text-slate-450 mt-0.5">Offset: {sp.offsetPerYear} kg CO₂ / yr</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">x{sp.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex justify-between items-center text-xs">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Trees Grown</p>
              <p className="text-base font-black text-slate-800 dark:text-slate-200 mt-0.5">🌲 {twinData?.personalForest?.treeCount || 0} Trees</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Forest Health</p>
              <p className="text-xs font-extrabold text-emerald-500 mt-1">{twinData?.personalForest?.forestHealth || 'Healthy'}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Timeline predictions & Simulated scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left Side: What-If Simulator checkboxes */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-amber-500" /> What-If Simulator
              </h3>
              <span className="text-[9px] font-bold text-primary-500 uppercase tracking-wider">Combine choices</span>
            </div>

            <div className="space-y-3.5">
              {[
                { key: 'vegetarian', label: 'Adopt vegetarian meals', desc: 'Saves 65kg CO₂ monthly' },
                { key: 'cycle3Days', label: 'Cycle commute 3 days/wk', desc: 'Reduces private fuel demands' },
                { key: 'noPlasticBottles', label: 'Zero plastic water bottles', desc: 'Diverts 950g packaging waste' },
                { key: 'solarPanels', label: 'Install rooftop solar array', desc: 'Saves ₹2,200 grid billing' },
                { key: 'publicTransit', label: 'Use public transit buses', desc: 'Shared commuter offloads' },
                { key: 'reduceElectric20', label: 'Reduce electricity by 20%', desc: 'Cuts household grids draw' },
                { key: 'familyJoins', label: 'Family members join CarbonMind', desc: 'Multiplies savings rate x3.5' }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => handleToggleSimulation(item.key as any)}
                  className={`w-full text-left p-3.5 rounded-2xl border text-xs flex justify-between items-start transition-all active:scale-98 ${
                    (simulationInputs as any)[item.key]
                      ? 'border-primary-500 bg-primary-500/5 text-primary-950 dark:text-primary-300'
                      : 'border-slate-100 hover:border-slate-300 dark:border-zinc-800/80 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/30 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-bold">{item.label}</p>
                    <p className="text-[10px] text-slate-450 mt-1 font-medium">{item.desc}</p>
                  </div>
                  <div className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                    (simulationInputs as any)[item.key] ? 'border-primary-500 bg-primary-500 text-white' : 'border-slate-300 dark:border-zinc-700'
                  }`}>
                    {(simulationInputs as any)[item.key] && '✓'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Environmental Legacy info */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Environmental Legacy Index</h3>
            
            <div className="text-center py-4 bg-slate-50/50 dark:bg-zinc-850/50 rounded-2xl border border-slate-100 dark:border-zinc-800">
              <span className="text-[10px] text-slate-450 font-bold uppercase">If everyone lived like you, we would need:</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{twinData?.legacyIndex?.earthsNeeded !== undefined ? twinData.legacyIndex.earthsNeeded : 1.5} Earths</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">Legacy Rating: <span className="font-bold text-emerald-500">{twinData?.legacyIndex?.legacyRating || 'Balanced Inhabitant'}</span></p>
            </div>
          </div>
        </div>

        {/* Right Side: Projections timeline sliders & chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Milestone timeline sliders */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-6">Future Prediction Timeline</h3>
            
            <div className="flex gap-2 mb-8 border-b border-slate-100 dark:border-zinc-800 pb-3 overflow-x-auto">
              {[
                { id: '1m', label: '1 Month' },
                { id: '3m', label: '3 Months' },
                { id: '6m', label: '6 Months' },
                { id: '1y', label: '1 Year' },
                { id: '5y', label: '5 Years' },
                { id: '10y', label: '10 Years' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPeriod(p.id as any)}
                  className={`px-4.5 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                    selectedPeriod === p.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-50/50 dark:bg-zinc-850/50 text-slate-450 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Milestones dynamic values grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Carbon Footprint", value: `${activePrediction.carbonEmittedKg} kg`, desc: "Projected output", icon: <Leaf className="h-4.5 w-4.5" />, color: "text-rose-500 bg-rose-500/10" },
                { label: "Accumulated Savings", value: `${user?.onboardingData?.basicInfo?.currency || '₹'}${activePrediction.moneySaved.toLocaleString()}`, desc: "Bill overheads avoided", icon: <DollarSign className="h-4.5 w-4.5" />, color: "text-emerald-500 bg-emerald-500/10" },
                { label: "Water Preserved", value: `${activePrediction.waterSavedL} Liters`, desc: "Dietary savings", icon: <Droplet className="h-4.5 w-4.5" />, color: "text-blue-500 bg-blue-500/10" },
                { label: "Trees Equivalent", value: `${activePrediction.treesEquivalent} Trees`, desc: "Forest absorption", icon: <TreeDeciduous className="h-4.5 w-4.5" />, color: "text-teal-500 bg-teal-500/10" }
              ].map((m, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-855/50 border border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between items-start">
                    <div className={`p-2 rounded-lg ${m.color}`}>{m.icon}</div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{m.label}</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-4">{m.value}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{m.desc}</p>
                </div>
              ))}
            </div>
            
            {/* Timeline Achievements alert */}
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-transparent border-l-4 border-amber-500 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-amber-800 dark:text-amber-400">Milestone Achievements Unlocked</p>
                <p className="text-[10px] text-slate-450 mt-0.5">Under current rates: {activePrediction.achievements ? activePrediction.achievements.join(', ') : 'None'}</p>
              </div>
              <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
            </div>
          </div>

          {/* Line Chart showing predicted emissions comparison */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-450 uppercase tracking-wider mb-6">Future Carbon Emissions Trend Projections</h3>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={twinData?.futureTrends || []} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-zinc-800/80" />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} stroke="#94a3b8" />
                  <YAxis fontSize={11} tickLine={false} stroke="#94a3b8" unit="kg" />
                  <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Line type="monotone" dataKey="Baseline Emissions" stroke="#64748b" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Projected Emissions" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* Grid: Climate Sim 2050 & Voice Assistant Coaching */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left Side: Voice coaching panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-teal-500/10 to-sky-500/5 border border-teal-500/10 rounded-3xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-teal-700 dark:text-teal-400 mb-2 flex items-center gap-1.5">
              <Volume2 className="h-5 w-5" /> AI Twin voice consultant
            </h3>
            <p className="text-xs text-slate-450 mb-6">
              Ask queries about your futuristic digital representation:
            </p>

            <div className="grid grid-cols-1 gap-2">
              {[
                "How will my future look?",
                "What if I stop eating meat?",
                "Will solar reduce my emissions?",
                "How can I reach EcoScore 95?",
                "How much can I save by 2030?"
              ].map((q, i) => (
                <button
                  key={i}
                  disabled={isAnswering}
                  onClick={() => handleVoiceQuery(q)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:bg-white hover:border-teal-500 transition-all flex items-center justify-between"
                >
                  <span>{q}</span>
                  <Volume2 className="h-3.5 w-3.5 text-slate-400" />
                </button>
              ))}
            </div>

            {voiceQuery && (
              <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-teal-500/10">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">You asked</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic">"{voiceQuery}"</p>
                <p className="text-[10px] font-bold uppercase text-teal-500 tracking-wide mt-3">AI Twin Answer</p>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed mt-0.5">
                  {isAnswering ? "Querying Prediction Engine..." : voiceReply}
                </p>
              </div>
            )}
          </div>

          {/* AI Tailored Insights */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">AI Projections Insights</h3>
            <div className="space-y-3">
              {(twinData?.insights || []).map((insight: string, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50/50 dark:bg-zinc-850/50 rounded-xl border border-slate-100 dark:border-zinc-800/80 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {insight}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Climate simulator 2030 / 2040 / 2050 */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-450 uppercase tracking-wider mb-6">Futuristic Environmental Legacy Simulator</h3>
            
            <div className="flex gap-2 mb-8 border-b border-slate-100 dark:border-zinc-800 pb-3">
              {[2030, 2040, 2050].map(y => (
                <button
                  key={y}
                  onClick={() => setTargetYear(y as any)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    targetYear === y
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-50/50 dark:bg-zinc-850/50 text-slate-450 hover:text-slate-700'
                  }`}
                >
                  Year {y}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Projected Cumulative Carbon</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{activeYearPrediction.projectedCarbonKg.toLocaleString()} kg</p>
                <p className="text-[9px] text-slate-450 mt-1">Emissions output baseline</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Twin Legacy Score</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{activeYearPrediction.legacyScore} Pts</p>
                <p className="text-[9px] text-slate-450 mt-1">Sustainability index</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Global Legacy Rank</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">#{activeYearPrediction.globalRank}</p>
                <p className="text-[9px] text-slate-450 mt-1">Among community cohorts</p>
              </div>
            </div>

            {/* AI Advisor coaching box */}
            <div className="mt-6 p-5 bg-gradient-to-r from-teal-500/10 via-sky-500/5 to-transparent border-l-4 border-teal-500 rounded-r-2xl">
              <h4 className="text-xs font-bold text-teal-800 dark:text-teal-400 flex items-center gap-1.5 mb-2">
                <Sparkles className="h-4.5 w-4.5" /> AI Coach Projections
              </h4>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                {twinData?.aiCoaching}
              </p>
            </div>
          </div>

          {/* Community comparisons rankings */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-450 uppercase tracking-wider mb-6">Community Twin Rankings Comparison</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Friends & Family rankings tables */}
              <div>
                <p className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1"><Users className="h-4 w-4 text-primary-500" /> Peer Cohorts Group</p>
                <div className="space-y-3.5">
                  {(twinData?.communityRankings?.friends || []).map((friend: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-650 dark:text-slate-350">{friend.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-medium">Rank {friend.rank}</span>
                        <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg text-slate-600 dark:text-slate-300 font-bold">{friend.score} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regions stats */}
              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-450 mb-3">Regional Participant cohort averages</p>
                  <p className="text-xs text-slate-500 font-medium">You are ranked <span className="font-bold text-teal-500">#{twinData?.communityRankings?.city?.rank || 1}</span> out of {twinData?.communityRankings?.city?.totalParticipants || 100} participants in your metropolitan area.</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-450">Global Average Score</span>
                  <span className="text-slate-800 dark:text-slate-200">{twinData?.communityRankings?.globalAverage || 500} Pts</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default CarbonTwin;
