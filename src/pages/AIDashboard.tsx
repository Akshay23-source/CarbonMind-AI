import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Bot, Globe, Award, Leaf, Zap, HelpCircle, Mic, MicOff,
  Volume2, VolumeX, Search, MessageSquare, Terminal, ChevronRight, BarChart2
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

export const AIDashboard: React.FC = () => {
  // Global States
  const [ecoScore, setEcoScore] = useState(84); // 0 to 100 slider
  const [sustainabilityIQ, setSustainabilityIQ] = useState(1320); // Score rating
  const [aiConfidence, setAiConfidence] = useState(98);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);

  // Prompt / Command console state
  const [commandInput, setCommandInput] = useState('');
  const [intelligenceReport, setIntelligenceReport] = useState<string | null>(null);

  // Decision Advisor state
  const [selectedDecision, setSelectedDecision] = useState<'solar' | 'drive' | 'beef' | null>(null);

  // Voice AI States
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceReply, setVoiceReply] = useState<string | null>(null);
  const [muteVoice, setMuteVoice] = useState(false);

  // AI Thinking Heuristics stages
  const THINKING_STAGES = [
    'Accessing user lifestyle profiles...',
    'Fetching local weather & grid metrics...',
    'Evaluating transportation offsets equations...',
    'Running carbon-impact projection logic...',
    'Formulating optimal recommendations...'
  ];

  useEffect(() => {
    if (!isThinking) return;
    setThinkingStep(0);
    const interval = setInterval(() => {
      setThinkingStep(prev => {
        if (prev >= THINKING_STAGES.length - 1) {
          clearInterval(interval);
          setIsThinking(false);
          return THINKING_STAGES.length - 1;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isThinking]);

  // Voice AI simulation
  const handleVoiceToggle = () => {
    if (!voiceActive) {
      setVoiceActive(true);
      setVoiceReply('Listening...');
      setTimeout(() => {
        setVoiceReply('Dictated: "Should I commute by bicycle today?"');
        setTimeout(() => {
          const replyText = 'Yes, Akshay. Today is sunny and dry. Commuting by bicycle saves 2.1kg of carbon emissions and ₹120. I highly recommend updating your travel route.';
          setVoiceReply(replyText);
          speakVoice(replyText);
        }, 1200);
      }, 1500);
    } else {
      setVoiceActive(false);
      setVoiceReply(null);
      window.speechSynthesis.cancel();
    }
  };

  const speakVoice = (text: string) => {
    if ('speechSynthesis' in window && !muteVoice) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Command console processor
  const handleExecuteCommand = (command: string) => {
    setCommandInput(command);
    setIsThinking(true);

    setTimeout(() => {
      let report = '';
      const cmd = command.toLowerCase();

      if (cmd.includes('yesterday') || cmd.includes('analyze')) {
        report = 'Yesterday analysis: You logged 10km of cycling and consumed vegetarian meals, offsetting a total of 6.55kg CO₂ compared to your baseline. Your weakest area was standby AC draw logged at 3 hours.';
      } else if (cmd.includes('tomorrow') || cmd.includes('plan')) {
        report = 'Tomorrow forecast: Weather will be sunny. Recommended commuting: active transit (bicycle). Energy saving goal: shift laundry to off-peak hours (before 2:00 PM). Target savings: 8.2kg CO₂.';
      } else if (cmd.includes('weakest') || cmd.includes('habit')) {
        report = 'Weakest habit audited: Single-use food containers packaging logged from receipt vision OCR. Swapping with zero-waste containers will save 12kg plastic annually and add +80 EcoScore points.';
      } else if (cmd.includes('future') || cmd.includes('predict')) {
        report = '15-Year projection: Continuing your current travel/diet trends will expand your digital forest canopy to 150 mature trees, saving $4,850 in utility power bills and cutting offsets by 80%.';
      } else {
        report = `Command processed. Local NLP parsed: "${command}". Action plan generated: continue active cycling schedules to optimize your current streaks (+150 Coins unlocked).`;
      }

      setIntelligenceReport(report);
      speakVoice(report);
    }, 4000);
  };

  // Earth Pulse Color Heuristic
  const getEarthPulseColor = () => {
    // Shifting from gray-brown to emerald-green
    if (ecoScore < 40) return 'rgba(139, 92, 26, 0.4)'; // dry brown
    if (ecoScore < 70) return 'rgba(156, 163, 175, 0.5)'; // greyish-cyan
    return 'rgba(16, 185, 129, 0.5)'; // vibrant emerald green
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER & PROACTIVE PLANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Intelligence & EcoScore Status */}
        <Card variant="glass" className="p-6 border border-white/5 flex flex-col justify-between min-h-[220px]">
          <div>
            <Badge variant="premium" className="text-[9px] uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border-none font-black mb-3">
              Today's Intelligence
            </Badge>
            <h3 className="text-lg font-black text-white leading-tight font-sans">Autonomous AI OS</h3>
            <p className="text-xs text-slate-450 mt-1">Observations active. Analyzing daily trends.</p>
          </div>

          <div className="space-y-3 mt-6">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Current EcoScore Rating</span>
              <span className="text-emerald-400 font-extrabold">{ecoScore} / 100</span>
            </div>
            {/* Slider to trigger Earth Pulse and EcoScore changes dynamically */}
            <input
              type="range"
              min="20"
              max="100"
              value={ecoScore}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setEcoScore(val);
                setSustainabilityIQ(Math.round(1000 + val * 4));
                setAiConfidence(Math.round(80 + (val / 5)));
              }}
              className="w-full accent-emerald-500 bg-white/10 rounded-lg h-1.5 focus:outline-none"
              aria-label="Demo EcoScore Controller"
            />
            <span className="text-[9px] text-slate-500 block italic leading-none">Slide range to observe real-time AI Earth Pulse updates.</span>
          </div>
        </Card>

        {/* Sustainability IQ Meter */}
        <Card variant="glass" className="p-6 border border-white/5 flex flex-col justify-between items-center text-center">
          <Badge variant="premium" className="text-[9px] uppercase tracking-widest bg-indigo-500/20 text-indigo-400 border-none font-black">
            Sustainability IQ
          </Badge>
          
          <div className="relative w-28 h-28 flex items-center justify-center rounded-full border border-indigo-500/20 glow-indigo mt-3">
            {/* Holographic dial overlay */}
            <div className="absolute inset-1 rounded-full border border-dashed border-indigo-400/20 animate-spin-slow" />
            <div className="text-center font-sans">
              <span className="block text-2xl font-black text-white">{sustainabilityIQ}</span>
              <span className="block text-[8px] text-slate-500 uppercase font-black tracking-widest">Points</span>
            </div>
          </div>

          <span className="text-[10px] text-slate-400 font-sans mt-3">
            Ranked Top 8% among San Francisco Auditors.
          </span>
        </Card>

        {/* AI Earth Pulse (Interactive Rotating Globe) */}
        <Card variant="glass" className="p-6 border border-white/5 flex flex-col justify-between items-center text-center relative overflow-hidden">
          <Badge variant="premium" className="text-[9px] uppercase tracking-widest bg-teal-500/20 text-teal-400 border-none font-black">
            AI Earth Pulse
          </Badge>

          {/* Spherical Earth Pulse Model */}
          <div className="relative w-28 h-28 rounded-full border border-white/10 flex items-center justify-center overflow-hidden my-3">
            {/* Pulse glow background based on EcoScore color */}
            <div
              className="absolute inset-0 transition-colors duration-500 blur-md opacity-35"
              style={{ backgroundColor: getEarthPulseColor() }}
            />
            {/* Spinning grid lines */}
            <div className="absolute inset-2 rounded-full border border-dashed border-white/10 animate-spin-slow" />
            <div className="absolute inset-4 rounded-full border border-white/5 animate-pulse" />
            
            <Globe className="h-14 w-14 text-white/80 animate-pulse relative z-10" />
          </div>

          <span className="text-[10px] text-slate-400 font-sans leading-tight">
            Earth health turns green as EcoScore increases!
          </span>
        </Card>

      </div>

      {/* 2. EXPLAINABLE AI ENGINE & DAILY PLANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Proactive Daily Planner */}
        <Card variant="glass" className="lg:col-span-2 p-6 border border-white/5 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Leaf className="h-4.5 w-4.5 text-primary-500" />
              Proactive Daily Planner
            </h4>
            <span className="text-[10px] font-black text-slate-400">June 20, 2026</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div className="space-y-3.5">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                <span className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-0.5">Commute Target</span>
                Weather is sunny (68°F). Cycle to work logs save 4.2kg CO₂ emissions.
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                <span className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-0.5">Meal Optimization</span>
                Replace prime steak with local soy proteins to save 2.3kg CO₂ food carbon.
              </div>
            </div>
            <div className="space-y-3.5">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                <span className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-0.5">Energy Savings</span>
                Standby AC usage audit: Set cooling ceiling to 78°F to avoid peak grid draws.
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                <span className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-0.5">Community Drive</span>
                Tree Plantation happening 1.8km away. Volunteer to unlock +50 XP tokens.
              </div>
            </div>
          </div>
        </Card>

        {/* AI Confidence Meter & Thinking Animation */}
        <Card variant="glass" className="p-6 border border-white/5 flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-[9px] uppercase font-black text-primary-400 tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI Thinking Animation
            </span>
            <h4 className="text-sm font-bold text-white mt-2">Decision Processing Engine</h4>
          </div>

          {/* Thinking steps */}
          <div className="space-y-2 my-4">
            <AnimatePresence mode="wait">
              {isThinking ? (
                <motion.div
                  key={thinkingStep}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="p-3 bg-slate-900/50 border border-white/5 rounded-xl text-xs text-slate-300 flex items-center gap-2"
                >
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-t-primary-500 border-r-transparent border-b-primary-200 border-l-transparent animate-spin shrink-0" />
                  <span className="font-mono text-[10px]">{THINKING_STAGES[thinkingStep]}</span>
                </motion.div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-slate-200 flex items-center justify-between">
                  <span className="font-bold text-emerald-400">Engine Online & Synced</span>
                  <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 font-extrabold">
                    {aiConfidence}% Confidence
                  </span>
                </div>
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="glass"
            onClick={() => setIsThinking(true)}
            disabled={isThinking}
            className="w-full text-xs font-bold border border-white/10 hover:border-white/20"
          >
            Trigger AI Thinking Sequence
          </Button>
        </Card>

      </div>

      {/* 3. DECISION ENGINE COMPARISON TOOL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Options */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-1">Ask Decision Engine</span>
          {[
            { id: 'solar', label: 'Should I install Solar Panels?', desc: 'Compare grid savings and installation offsets' },
            { id: 'drive', label: 'Should I drive or cycle to office?', desc: 'Compare tailpipe carbon, fuel costs, and time' },
            { id: 'beef', label: 'Should I swap beef steak for tofu?', desc: 'Compare agricultural methane, water, and cost' }
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDecision(d.id as any)}
              className={`p-3.5 rounded-2xl border text-left font-sans transition-all ${
                selectedDecision === d.id
                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-400 shadow-md'
                  : 'bg-white/5 border-white/5 text-slate-350 hover:bg-white/10 hover:text-white'
              }`}
            >
              <h5 className="text-xs font-extrabold">{d.label}</h5>
              <p className="text-[9px] text-slate-500 mt-1 leading-normal">{d.desc}</p>
            </button>
          ))}
        </div>

        {/* Right Stage: Comparison metrics */}
        <div className="lg:col-span-3">
          <Card variant="glass" className="p-6 border border-white/5 min-h-[220px] flex flex-col justify-between text-left space-y-4">
            {!selectedDecision ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <HelpCircle className="h-10 w-10 mb-2 animate-bounce" />
                <p className="text-xs">Select a decision compare option on the left to run explainable comparisons.</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                
                {/* Decision Header */}
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-white">
                    {selectedDecision === 'solar' && 'Solar Installation Feasibility Analysis'}
                    {selectedDecision === 'drive' && 'Commute: Car vs Bicycle Footprints'}
                    {selectedDecision === 'beef' && 'Dietary Choice: Beef Steak vs Tofu'}
                  </h4>
                  <Badge variant="premium" className="bg-primary-500/20 text-primary-400 font-extrabold border-none">
                    AI recommendation: {selectedDecision === 'solar' ? 'YES' : selectedDecision === 'drive' ? 'Bicycle' : 'Tofu'} (98% confidence)
                  </Badge>
                </div>

                {/* Grid Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                    <span className="font-bold text-slate-450 uppercase text-[9px] tracking-wider block">Carbon Offsets (Impact)</span>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Baseline Option</span>
                        <span className="text-red-500 font-bold">High Carbon</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-red-500 h-full w-[85%]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Alternative Choice</span>
                        <span className="text-emerald-400 font-bold">Zero Carbon</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[10%]" />
                      </div>
                    </div>
                  </div>

                  {/* Calculations Details */}
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-[11px] leading-relaxed text-slate-350 space-y-2">
                    <span className="font-bold text-slate-450 uppercase text-[9px] tracking-wider block">Explainable AI Calculations</span>
                    {selectedDecision === 'solar' && (
                      <p>
                        Formula: `(Annual Grid Consumption * 0.85 Offset) = Saved kWh`. Grid draw drops from 280 kWh to 42 kWh, saving approximately $120 monthly with a solar amortized payback threshold of 6 years.
                      </p>
                    )}
                    {selectedDecision === 'drive' && (
                      <p>
                        Formula: `(15 km * 0.25 kg petrol car emission coefficient) = 3.75 kg CO₂ avoided`. Active travel burn coordinates to 320 calories and ₹120 fuel savings.
                      </p>
                    )}
                    {selectedDecision === 'beef' && (
                      <p>
                        Formula: `(500g agricultural beef methane overhead = 4.5 kg CO₂) vs (organic soy tofu = 0.4 kg CO₂)`. Avoids 4.1kg carbon emissions and saves approximately 250 Liters of water.
                      </p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </Card>
        </div>

      </div>

      {/* 4. VOICE AI COMMANDS & COMMAND CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Voice AI Command Control */}
        <Card variant="glass" className="p-6 border border-white/5 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex justify-between items-center">
              <Badge variant="premium" className="text-[9px] bg-primary-500/20 text-primary-400 border-none font-black">
                Voice AI System
              </Badge>
              <button
                onClick={() => setMuteVoice(!muteVoice)}
                className="text-slate-450 hover:text-white transition-colors"
                title={muteVoice ? "Unmute Spoken Readback" : "Mute Spoken Readback"}
              >
                {muteVoice ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
              </button>
            </div>
            <h4 className="text-sm font-bold text-white mt-3 font-sans">Hands-Free Dictation</h4>
          </div>

          <div className="my-4 text-xs font-sans min-h-[60px] text-slate-350 leading-relaxed italic">
            {voiceReply || 'Click the microphone to dictate a command (e.g. "Should I commute by bicycle today?").'}
          </div>

          <Button
            variant={voiceActive ? "primary" : "glass"}
            onClick={handleVoiceToggle}
            className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-extrabold ${
              voiceActive ? 'bg-gradient-to-r from-red-500 to-amber-500 border-none text-white' : ''
            }`}
          >
            {voiceActive ? <MicOff className="h-4 w-4 text-white animate-pulse" /> : <Mic className="h-4 w-4 text-slate-400" />}
            {voiceActive ? 'Disconnect Dictation' : 'Activate Voice AI'}
          </Button>
        </Card>

        {/* AI Command Center Console */}
        <Card variant="glass" className="lg:col-span-2 p-6 border border-white/5 flex flex-col justify-between min-h-[220px] text-left">
          <div>
            <Badge variant="premium" className="text-[9px] bg-slate-950/20 text-primary-500 border-none font-black flex items-center gap-1.5 max-w-fit mb-3">
              <Terminal className="h-3 w-3" /> AI Command Console
            </Badge>
            <div className="flex gap-2">
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecuteCommand(commandInput)}
                placeholder="Type command here (e.g. 'Analyze yesterday', 'Plan tomorrow', 'Predict future')..."
                className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono"
              />
              <Button onClick={() => handleExecuteCommand(commandInput)} className="px-5">
                <Search className="h-4.5 w-4.5" />
              </Button>
            </div>
          </div>

          {/* Executed response window */}
          <div className="mt-4 p-4 bg-black/50 border border-white/5 rounded-xl font-mono text-[10px] text-slate-300 leading-normal min-h-[70px] flex items-center">
            {isThinking ? (
              <span className="animate-pulse text-primary-400">AI is compiling report data, please hold...</span>
            ) : (
              intelligenceReport || 'System ready. Type commands or choose a fast shortcut below.'
            )}
          </div>

          {/* Quick command buttons */}
          <div className="flex flex-wrap gap-2 mt-3 text-[9px] font-bold">
            {[
              { label: 'Analyze Yesterday', cmd: 'Analyze yesterday' },
              { label: 'Forecast Tomorrow', cmd: 'Plan tomorrow' },
              { label: 'Show Weakest Habit', cmd: 'Show weakest habit' },
              { label: 'Predict Future (15-Yr)', cmd: 'Predict future' }
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleExecuteCommand(q.cmd)}
                className="px-2.5 py-1.5 bg-white/5 border border-white/5 rounded text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                {q.label}
              </button>
            ))}
          </div>

        </Card>

      </div>

    </div>
  );
};
export default AIDashboard;
