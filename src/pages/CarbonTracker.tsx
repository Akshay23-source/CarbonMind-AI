import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Mic,
  MicOff,
  Flame,
  Search,
  Star,
  Leaf,
  Calendar,
  X,
  Compass,
  Zap,
  Car,
  Utensils,
  Droplet,
  Trash2,
  Bookmark,
  Share2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SectionHeader } from '../components/SectionHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { StatCard } from '../components/StatCard';
import { Loader } from '../components/Loader';
import { formatCarbon, formatPoints } from '../utils/format';

export const CarbonTracker: React.FC = () => {
  const { user, logActivity, toggleFavorite } = useAuth();
  
  // Scanner state
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scannedResult, setScannedResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTimeframe, setActiveTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Favorites quick actions
  const defaultFavorites = ['I biked 10 km', 'Had a vegan lunch', 'Recycled 5 plastic bottles', 'Unplugged AC for 4 hours'];
  const userFavorites = user?.favorites || [];
  const allFavorites = useMemo(() => {
    return Array.from(new Set([...defaultFavorites, ...userFavorites]));
  }, [userFavorites]);

  // Voice Input Speech recognition
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice speech recognition is not supported in this browser. Please type naturally.');
      setTimeout(() => setError(null), 3500);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
    };
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setQuery(transcript);
    };
    recognition.onerror = (e: any) => {
      console.error(e);
      setError('Failed to record speech. Check browser microphone permissions.');
      setIsRecording(false);
      setTimeout(() => setError(null), 3500);
    };
    recognition.onend = () => {
      setIsRecording(false);
    };
    recognition.start();
  };

  // Submit scan to backend endpoint
  const handleScan = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setScannedResult(null);

    try {
      const token = localStorage.getItem('carbonmind_token');
      const response = await fetch('/api/ai/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('API server returned an error during calculation.');
      }

      const result = await response.json();
      setScannedResult(result);
      
      // Auto update dashboard state, awards XP/Coins
      await logActivity(result);
      setQuery('');
    } catch (err: any) {
      setError(err.message || 'Verification calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered History list
  const filteredActivities = useMemo(() => {
    let logs = user?.activities || [];

    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      logs = logs.filter(
        (log) => log.title.toLowerCase().includes(q) || log.reasoning.toLowerCase().includes(q)
      );
    }

    // Category matching
    if (activeCategory !== 'all') {
      logs = logs.filter((log) => log.category === activeCategory);
    }

    // Timeframe matching
    if (activeTimeframe !== 'all') {
      const now = new Date();
      logs = logs.filter((log) => {
        const logDate = new Date(log.date);
        const diffTime = Math.abs(now.getTime() - logDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (activeTimeframe === 'today') return diffDays <= 1;
        if (activeTimeframe === 'week') return diffDays <= 7;
        if (activeTimeframe === 'month') return diffDays <= 30;
        return true;
      });
    }

    return logs;
  }, [user?.activities, searchQuery, activeCategory, activeTimeframe]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'travel', label: 'Transportation' },
    { id: 'food', label: 'Meals' },
    { id: 'energy', label: 'Electricity' },
    { id: 'waste', label: 'Waste / Recycling' },
    { id: 'trees', label: 'Tree Plantations' }
  ];

  // UN SDG helper mapping
  const getSDGForCategory = (cat: string) => {
    switch (cat) {
      case 'travel':
        return [
          { num: 11, label: 'SDG 11: Sustainable Cities', style: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20' },
          { num: 13, label: 'SDG 13: Climate Action', style: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20' }
        ];
      case 'food':
        return [
          { num: 3, label: 'SDG 3: Good Health', style: 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20' },
          { num: 12, label: 'SDG 12: Resp. Consumption', style: 'bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/20' }
        ];
      case 'energy':
        return [
          { num: 7, label: 'SDG 7: Clean Energy', style: 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20' },
          { num: 13, label: 'SDG 13: Climate Action', style: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20' }
        ];
      case 'waste':
        return [
          { num: 6, label: 'SDG 6: Clean Water', style: 'bg-sky-500/10 text-sky-500 dark:text-sky-400 border-sky-500/20' },
          { num: 12, label: 'SDG 12: Resp. Consumption', style: 'bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/20' },
          { num: 15, label: 'SDG 15: Life on Land', style: 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20' }
        ];
      case 'trees':
        return [
          { num: 15, label: 'SDG 15: Life on Land', style: 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20' },
          { num: 13, label: 'SDG 13: Climate Action', style: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20' }
        ];
      default:
        return [
          { num: 13, label: 'SDG 13: Climate Action', style: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20' }
        ];
    }
  };

  return (
    <main className="space-y-8 text-left animate-in fade-in duration-300 font-sans">
      <SectionHeader
        title="AI Carbon Scanner"
        description="Type naturally or record your voice to analyze carbon emissions, earn XP, and unlock green rewards."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Input bar & Scanned result */}
        <section className="lg:col-span-2 space-y-6" aria-label="Carbon Scan Input and Analysis Details">
          <Card variant="glass" className="p-6 relative overflow-hidden">
            {/* Input Form */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider block">
                Describe your green action or carbon footprint source
              </label>

              {error && (
                <div role="alert" aria-live="polite" className="p-3 bg-red-500/10 border border-red-500/20 text-red-655 dark:text-red-400 rounded-xl text-xs flex gap-2 animate-pulse">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="relative flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan(query)}
                  placeholder='e.g., "I rode my bicycle for 10 kilometers today."'
                  aria-label="Describe green action or carbon footprint source"
                  className="w-full pl-4 pr-24 py-3.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm text-slate-850 dark:text-slate-200"
                />

                <div className="absolute right-3 flex items-center gap-1.5">
                  {/* Microphone */}
                  <button
                    onClick={handleVoiceInput}
                    aria-label={isRecording ? "Stop recording voice input" : "Record voice input"}
                    className={`p-2 rounded-xl transition-all ${
                      isRecording
                        ? 'bg-red-500 text-white animate-ping'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                    title="Record voice input"
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleScan(query)}
                    isLoading={loading}
                    className="px-4.5 py-2 font-bold"
                  >
                    Scan
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Favorites buttons */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-900">
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider mb-2">
                Favorites & Quick Templates
              </p>
              <div className="flex flex-wrap gap-2">
                {allFavorites.map((fav, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleScan(fav)}
                    aria-label={`Log template activity: ${fav}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-xs font-semibold text-slate-550 dark:text-zinc-400 hover:border-primary-500/30 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
                  >
                    <span>{fav}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* DYNAMIC SCANNED RESULT visualizer */}
          <AnimatePresence mode="wait">
            {loading && (
              <Card variant="glass" role="status" aria-live="polite" className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative flex items-center justify-center h-20 w-20">
                  <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 border-r-transparent border-b-primary-200 border-l-transparent animate-spin" />
                  <Sparkles className="h-8 w-8 text-primary-500 animate-pulse" />
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans">
                  AI Coach calculations active...
                </h4>
                <p className="text-xs text-slate-400 dark:text-zinc-500 animate-pulse">
                  Extracting parameters & computing Tailored offsets
                </p>
              </Card>
            )}

            {scannedResult && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
                role="region"
                aria-label="Scan Results Details"
              >
                {/* Result Summary Card */}
                <Card
                  variant="glass"
                  glow={scannedResult.metrics.carbonSaved > 0}
                  className={`p-6 border relative overflow-hidden ${
                    scannedResult.metrics.carbonSaved > 0
                      ? 'bg-gradient-to-br from-emerald-500/10 via-primary-500/5 to-secondary-500/10 border-primary-500/20'
                      : 'bg-red-500/5 border-red-500/10'
                  }`}
                >
                  {/* Visual leaf particle indicators */}
                  {scannedResult.metrics.carbonSaved > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none opacity-20 animate-spin-slow">
                      <Leaf className="h-64 w-64 text-emerald-500 fill-emerald-500/10" />
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant={scannedResult.metrics.carbonSaved > 0 ? 'success' : 'error'} size="md">
                        {scannedResult.metrics.carbonSaved > 0 ? 'Positive Impact Action' : 'Emissive Activity'}
                      </Badge>
                      <h3 className="text-xl font-extrabold text-slate-805 dark:text-slate-100 font-sans mt-2 capitalize">
                        {scannedResult.queryText}
                      </h3>
                      <p className="text-xs text-slate-405 dark:text-zinc-500 font-bold uppercase tracking-wider mt-1">
                        Category: {scannedResult.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => toggleFavorite(scannedResult.queryText)}
                        aria-label={userFavorites.includes(scannedResult.queryText) ? "Remove action from favorites" : "Add action to favorites"}
                        className="p-2 border-slate-150 dark:border-zinc-800"
                      >
                        <Star className={`h-4.5 w-4.5 ${userFavorites.includes(scannedResult.queryText) ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                      </Button>
                      <Button 
                        variant="glass" 
                        size="sm" 
                        aria-label="Share carbon impact report"
                        className="p-2 border-slate-150 dark:border-zinc-800"
                      >
                        <Share2 className="h-4.5 w-4.5 text-slate-400" />
                      </Button>
                    </div>
                  </div>

                  {/* Calculations breakdown grids */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-zinc-900">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">Carbon Emitted</span>
                      <p className="text-lg font-bold text-slate-800 dark:text-slate-150">{formatCarbon(scannedResult.metrics.carbonEmitted)}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">Carbon Saved</span>
                      <p className="text-lg font-bold text-emerald-500">{formatCarbon(scannedResult.metrics.carbonSaved)}</p>
                    </div>
                    {scannedResult.metrics.moneySaved > 0 && (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">Money Saved</span>
                        <p className="text-lg font-bold text-amber-500">${scannedResult.metrics.moneySaved}</p>
                      </div>
                    )}
                    {scannedResult.metrics.waterSaved > 0 && (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">Water Saved</span>
                        <p className="text-lg font-bold text-blue-500">{scannedResult.metrics.waterSaved} gal</p>
                      </div>
                    )}
                    {scannedResult.metrics.treesEquivalent > 0 && (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">Tree Absorption Equiv.</span>
                        <p className="text-lg font-bold text-teal-500">{scannedResult.metrics.treesEquivalent} trees</p>
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">Eco Progression</span>
                      <p className="text-lg font-bold text-primary-500 flex items-center gap-1">
                        +{scannedResult.metrics.xpEarned} XP
                      </p>
                    </div>
                  </div>

                  {/* SDG Goal badges for scanned item */}
                  <div className="mt-4 pt-4 border-t border-dashed border-white/10">
                    <span className="text-[10px] font-bold text-slate-450 dark:text-zinc-500 uppercase tracking-wider block mb-2">United Nations SDG Impact Alignment:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {getSDGForCategory(scannedResult.category).map((sdg) => (
                        <span key={sdg.num} className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${sdg.style}`}>
                          {sdg.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Reasoning advice */}
                  <div className="p-4 bg-white/40 dark:bg-zinc-950/40 rounded-2xl border border-white/10 mt-6 text-xs text-slate-450 dark:text-zinc-400 font-sans leading-relaxed">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">AI Calculation Reasoning:</p>
                    <p>{scannedResult.reasoning}</p>
                  </div>
                </Card>

                {/* Recommendations alternative action suggested */}
                <Card variant="glass" className="p-6 border-primary-500/10">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 font-sans mb-3">
                    <Sparkles className="h-4.5 w-4.5 text-emerald-500 animate-pulse" />
                    AI Alternatives Suggestions
                  </h4>
                  <p className="text-xs text-slate-450 dark:text-zinc-455 leading-relaxed font-sans mb-4">
                    {scannedResult.recommendation}
                  </p>
                  {scannedResult.metrics.carbonSaved === 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex justify-between items-center text-[11px] font-bold font-sans">
                      <span className="text-slate-450">Greener Alternative Target savings:</span>
                      <span className="text-emerald-500">Estimated -18kg CO₂ Monthly</span>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* RIGHT COLUMN: Scanners history logging timeline list */}
        <section className="space-y-6" aria-label="Activity Filters and History Logs">
          <Card variant="glass" className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 font-sans">
              <Calendar className="h-4.5 w-4.5 text-primary-500" />
              Activity Filters
            </h3>

            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search logs..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs text-slate-800"
                />
              </div>

              {/* Category selector */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">Category</span>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Timeframe selector */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">Timeframe</span>
                <div className="grid grid-cols-4 bg-slate-50 dark:bg-zinc-900 p-1 rounded-xl border border-slate-100 dark:border-zinc-800 text-[10px] font-semibold text-slate-400">
                  {['today', 'week', 'month', 'all'].map((time) => (
                    <button
                      key={time}
                      onClick={() => setActiveTimeframe(time as any)}
                      className={`py-1.5 rounded-lg capitalize transition-all ${
                        activeTimeframe === time
                          ? 'bg-white dark:bg-zinc-950 text-primary-500 shadow-sm'
                          : 'hover:text-slate-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline lists */}
          <Card variant="glass" className="p-5 space-y-4 max-h-[500px] overflow-y-auto font-sans">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Log History ({filteredActivities.length})
            </h3>

            <div className="space-y-3">
              {filteredActivities.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No logged activities matches selected filters.
                </div>
              ) : (
                filteredActivities.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50/50 dark:bg-zinc-900/30 rounded-xl border border-slate-100 dark:border-zinc-850 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 capitalize truncate max-w-[70%]">
                        {log.title}
                      </span>
                      <span className={`font-bold ${log.savedKg > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {log.savedKg > 0 ? `-${formatCarbon(log.savedKg)}` : `+${formatCarbon(log.valueKg)}`}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-550 leading-normal">
                      {log.reasoning}
                    </p>

                    {/* Render SDG Badges */}
                    <div className="flex flex-wrap gap-1">
                      {getSDGForCategory(log.category).map((sdg) => (
                        <span key={sdg.num} className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${sdg.style}`}>
                          {sdg.label}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-zinc-650 mt-2 pt-2 border-t border-slate-100/50 dark:border-zinc-900 font-sans">
                      <span className="uppercase text-primary-500 font-semibold">{log.category}</span>
                      <span>{log.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </section>

      </div>
    </main>
  );
};
export default CarbonTracker;
