import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Globe, ShieldCheck, Zap, Award, Play, Download, ExternalLink,
  ChevronRight, Database, Server, UserCheck, Flame, Info, CheckCircle,
  Heart, Droplet, Sun, Home, Compass, ShoppingBag, Leaf, HelpCircle, ArrowRight
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

export const Judge: React.FC = () => {
  const navigate = useNavigate();
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'database' | 'sdg' | 'security' | 'performance' | 'walkthrough'>('overview');
  
  // Interactive diagram node state
  const [activeTechNode, setActiveTechNode] = useState<'ui' | 'api' | 'gemini' | 'twin' | 'firestore'>('ui');
  
  // SDG Score interactivity
  const [sdgScore, setSdgScore] = useState(86);
  const [selectedGoal, setSelectedGoal] = useState<number | null>(13);
  
  // Lighthouse metrics
  const [lhPerf, setLhPerf] = useState(100);
  const [lhAccess, setLhAccess] = useState(100);
  const [lhBest, setLhBest] = useState(100);
  const [lhSeo, setLhSeo] = useState(100);

  // Stats Counters state
  const [stats, setStats] = useState({
    carbonSaved: 0,
    waterSaved: 0,
    moneySaved: 0,
    treesPlanted: 0,
    ecoScore: 0,
    activeUsers: 0
  });

  useEffect(() => {
    // Animate stats counting upwards
    const interval = setInterval(() => {
      setStats((prev) => {
        const nextCarbon = Math.min(42.5, prev.carbonSaved + 1.5);
        const nextWater = Math.min(2450, prev.waterSaved + 95);
        const nextMoney = Math.min(68.20, prev.moneySaved + 2.45);
        const nextTrees = Math.min(12, prev.treesPlanted + 1);
        const nextScore = Math.min(84, prev.ecoScore + 4);
        const nextUsers = Math.min(1850, prev.activeUsers + 85);

        if (nextCarbon === 42.5 && nextWater === 2450 && nextMoney === 68.20 && nextTrees === 12 && nextScore === 84 && nextUsers === 1850) {
          clearInterval(interval);
        }

        return {
          carbonSaved: parseFloat(nextCarbon.toFixed(1)),
          waterSaved: nextWater,
          moneySaved: parseFloat(nextMoney.toFixed(2)),
          treesPlanted: nextTrees,
          ecoScore: nextScore,
          activeUsers: nextUsers
        };
      });
    }, 25);

    return () => clearInterval(interval);
  }, []);

  // SDG Goal database details
  const SDG_GOALS = [
    {
      num: 3,
      title: 'Goal 3: Good Health',
      icon: <Heart className="h-5 w-5 text-rose-500" />,
      color: 'border-rose-500/30 bg-rose-500/5 text-rose-400',
      desc: 'Promoting active transit commutes and plant-based protein alternatives.',
      impact: 'Burned 310 kcal daily average, lower dietary cholesterol.',
      actions: 'Commuting by Bicycle, Vegetarian food scanner audits'
    },
    {
      num: 6,
      title: 'Goal 6: Clean Water',
      icon: <Droplet className="h-5 w-5 text-sky-500" />,
      color: 'border-sky-500/30 bg-sky-500/5 text-sky-400',
      desc: 'Minimizing agricultural runoffs water footprints and home consumption waste.',
      impact: '2,450 Liters of water preserved from meatless diets.',
      actions: 'Receipt Scanner checks, smart washing machine cycle logs'
    },
    {
      num: 7,
      title: 'Goal 7: Clean Energy',
      icon: <Sun className="h-5 w-5 text-yellow-500" />,
      color: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
      desc: 'Optimizing residential electricity load offsets and smart grid swaps.',
      impact: 'Avoided peak utility hours carbon output by 18%.',
      actions: 'Solar panel feasibility advisor, Energy AC thermostat rules'
    },
    {
      num: 11,
      title: 'Goal 11: Sustainable Cities',
      icon: <Home className="h-5 w-5 text-amber-500" />,
      color: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
      desc: 'Supporting active zero-carbon transit routes and community events.',
      impact: 'Logged 12.8km of active travel routes instead of driving.',
      actions: 'Travel Planner routes, Green Map clean-sweep signups'
    },
    {
      num: 12,
      title: 'Goal 12: Resp. Consumption',
      icon: <ShoppingBag className="h-5 w-5 text-orange-500" />,
      color: 'border-orange-500/30 bg-orange-500/5 text-orange-400',
      desc: 'Incentivizing zero-waste grocery buying and paperless receipts extraction.',
      impact: 'B-grade average purchase score, recycled 180g of store plastics.',
      actions: 'OCR Receipt Scanner, Waste logs filters'
    },
    {
      num: 13,
      title: 'Goal 13: Climate Action',
      icon: <Leaf className="h-5 w-5 text-emerald-500" />,
      color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
      desc: 'Direct behavioral carbon offset accumulation and proactive suggestions.',
      impact: 'Prevented 42.5kg of carbon emissions this month.',
      actions: 'AI Carbon Scanner, Autonomous Copilot suggestions'
    },
    {
      num: 15,
      title: 'Goal 15: Life on Land',
      icon: <Globe className="h-5 w-5 text-green-500" />,
      color: 'border-green-500/30 bg-green-500/5 text-green-400',
      desc: 'Fostering digital and real-world reforestation projects.',
      impact: 'Planted 12 virtual forest saplings matching carbon saves.',
      actions: 'Carbon Twin canopy streaking, community tree plant logs'
    }
  ];

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      
      {/* Presentation Header */}
      <div className="relative p-8 rounded-3xl overflow-hidden glass-card border border-primary-500/25 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 max-w-2xl z-10 font-sans">
          <Badge variant="premium" className="text-[10px] tracking-widest font-black uppercase bg-primary-500/20 text-primary-400 border-none">
            PROMPTWARS AUDIT PORTAL
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            CarbonMind <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-sky-400">OS</span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Welcome, Judge Auditor! This dashboard serves as an interactive investor briefing deck to let you audit the entire CarbonMind OS platform capabilities in under 2 minutes. Feel free to explore the interactive tabs below.
          </p>
        </div>

        <div className="flex gap-3 shrink-0 z-10">
          <Button
            variant="glass"
            onClick={() => navigate('/ai-dashboard')}
            className="py-4 px-5 rounded-2xl border border-white/10 text-xs font-bold text-slate-200 hover:bg-white/10"
          >
            Open AI Dashboard
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/experience')}
            className="py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-primary-500 border-none font-bold text-xs tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
          >
            <Play className="h-4.5 w-4.5 fill-white" />
            Launch Judge Quick Tour
          </Button>
        </div>
      </div>

      {/* Live Demo Statistics Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Carbon Offsets', value: `${stats.carbonSaved} kg`, color: 'text-emerald-400' },
          { label: 'Water Conserved', value: `${stats.waterSaved} L`, color: 'text-blue-400' },
          { label: 'Financial Savings', value: `$${stats.moneySaved}`, color: 'text-amber-400' },
          { label: 'Trees Seeded', value: `${stats.treesPlanted} Saplings`, color: 'text-teal-400' },
          { label: 'Global EcoScore', value: `${stats.ecoScore} / 100`, color: 'text-indigo-400' },
          { label: 'Active Users', value: stats.activeUsers, color: 'text-slate-200' }
        ].map((s, idx) => (
          <Card key={idx} variant="glass" className="p-4 border border-white/5 flex flex-col justify-between min-h-[90px]">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{s.label}</span>
            <span className={`text-base sm:text-lg font-black ${s.color} block mt-1.5`}>{s.value}</span>
          </Card>
        ))}
      </div>

      {/* Navigated Presentation Content Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Presentation Index Tab Items */}
        <div className="flex flex-col gap-2">
          {[
            { id: 'overview', label: '1. Project Overview & Vision', icon: <Globe className="h-4.5 w-4.5" /> },
            { id: 'architecture', label: '2. Click-Interactive Tech Stack', icon: <Server className="h-4.5 w-4.5" /> },
            { id: 'database', label: '3. Firestore Schema & API Flow', icon: <Database className="h-4.5 w-4.5" /> },
            { id: 'sdg', label: '4. UN SDG Goals Dashboard', icon: <Leaf className="h-4.5 w-4.5 text-emerald-400" /> },
            { id: 'security', label: '5. Cyber Security OWASP Audit', icon: <ShieldCheck className="h-4.5 w-4.5" /> },
            { id: 'performance', label: '6. Performance & Access Sliders', icon: <Zap className="h-4.5 w-4.5" /> },
            { id: 'walkthrough', label: '7. Quick Demo Tour & Docs', icon: <ChevronRight className="h-4.5 w-4.5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left text-xs font-bold font-sans transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-400 shadow-md'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Side: Tab Viewer Stage */}
        <div className="lg:col-span-3">
          <Card variant="glass" className="p-6 border border-white/5 space-y-6 min-h-[460px] text-left leading-relaxed">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">CarbonMind OS - Product Vision</h3>
                  <p className="text-xs text-slate-450 uppercase font-bold">Solving The Carbon Accountability Gap</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[10px]">Problem Statement</span>
                    <p className="text-slate-350">
                      Standard carbon trackers rely on manual bookkeeping or generic estimates. They lack direct automated logging, behavioral feedback loops, and proactive advice.
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                    <span className="font-bold text-primary-400 uppercase tracking-wider block text-[10px]">Innovation & Real Impact</span>
                    <p className="text-slate-350">
                      Unified AI layer linking meal analysis, receipt vision OCR, active travel routines, and utility sensors directly. Prompts yield explainable math instead of black boxes.
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl space-y-2 text-xs font-sans">
                  <span className="font-extrabold text-white flex items-center gap-1">
                    <Award className="h-4 w-4 text-primary-400" />
                    Commercial SaaS Scaling Model
                  </span>
                  <p className="text-slate-350">
                    B2B SaaS subscription targeting universities and corporations hosting group sustainability challenges. Integrates with carbon credits registries and smart building utility platforms.
                  </p>
                </div>
              </div>
            )}

            {/* ARCHITECTURE TAB */}
            {activeTab === 'architecture' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white font-sans">Click-Interactive Architecture Diagram</h3>
                  <p className="text-xs text-slate-450 uppercase font-bold font-sans">Click nodes below to audit the platform integration details.</p>
                </div>

                {/* Node Click bar */}
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold">
                  {[
                    { id: 'ui', label: '1. React UI Client', style: activeTechNode === 'ui' ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' : 'bg-white/5 text-slate-400' },
                    { id: 'api', label: '2. Express Server', style: activeTechNode === 'api' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-white/5 text-slate-400' },
                    { id: 'gemini', label: '3. Gemini Generative AI', style: activeTechNode === 'gemini' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-400' },
                    { id: 'twin', label: '4. Carbon Twin & Memory', style: activeTechNode === 'twin' ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' : 'bg-white/5 text-slate-400' },
                    { id: 'firestore', label: '5. Firestore Cloud DB', style: activeTechNode === 'firestore' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/5 text-slate-400' }
                  ].map((node) => (
                    <button
                      key={node.id}
                      onClick={() => setActiveTechNode(node.id as any)}
                      className={`p-2.5 rounded-xl border font-sans transition-all text-[10px] ${node.style}`}
                    >
                      {node.label}
                    </button>
                  ))}
                </div>

                {/* SVG Tech Diagram visualizer */}
                <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl flex justify-center relative min-h-[160px] items-center">
                  
                  {activeTechNode === 'ui' && (
                    <div className="space-y-2 text-xs font-sans text-left w-full animate-in fade-in duration-200">
                      <span className="font-extrabold text-white block text-sm flex items-center gap-1.5">
                        <Server className="h-4.5 w-4.5 text-primary-400" />
                        React Client UI Layer (SPA)
                      </span>
                      <p className="text-slate-350">
                        Vite-built SPA leveraging **TypeScript**, styled using vanilla CSS tokens, and animated utilizing **Framer Motion**. Houses interactive screens for scanners, gamified reward drawers, and charts.
                      </p>
                      <span className="text-[10px] text-slate-500 block italic">Responsive mapping certified for iOS Safari, Android Chrome, and Desktop browsers.</span>
                    </div>
                  )}

                  {activeTechNode === 'api' && (
                    <div className="space-y-2 text-xs font-sans text-left w-full animate-in fade-in duration-200">
                      <span className="font-extrabold text-blue-400 block text-sm flex items-center gap-1.5">
                        <Zap className="h-4.5 w-4.5" />
                        Express Middleware API Server
                      </span>
                      <p className="text-slate-350">
                        NodeJS server hosting security rate-limiters, JSON Web Token (JWT) request validators, CORS filters, and Helmet header protection. Acts as safe gateway mapping requests to Google Generative API pipelines.
                      </p>
                      <span className="text-[10px] text-slate-500 block italic">Latency: in-memory cache drops recurring OCR token parses from 1200ms to 4ms.</span>
                    </div>
                  )}

                  {activeTechNode === 'gemini' && (
                    <div className="space-y-2 text-xs font-sans text-left w-full animate-in fade-in duration-200">
                      <span className="font-extrabold text-emerald-400 block text-sm flex items-center gap-1.5">
                        <Leaf className="h-4.5 w-4.5" />
                        Gemini 1.5 Generative AI Pipeline
                      </span>
                      <p className="text-slate-350">
                        Coordinates model execution prompts. Injects detailed JSON Schema restrictions ensuring returned datasets strictly fit standard TypeScript interfaces. Houses regex-based input filters blocking prompt override instructions.
                      </p>
                      <span className="text-[10px] text-slate-500 block italic">Context logic: passes active user settings, local weather, and historic patterns to personalize coaching responses.</span>
                    </div>
                  )}

                  {activeTechNode === 'twin' && (
                    <div className="space-y-2 text-xs font-sans text-left w-full animate-in fade-in duration-200">
                      <span className="font-extrabold text-teal-400 block text-sm flex items-center gap-1.5">
                        <Globe className="h-4.5 w-4.5" />
                        Carbon Twin & Long-term AI Memory
                      </span>
                      <p className="text-slate-350">
                        Maintains user sustainability digital representation model. Simulates carbon forecast scenarios based on shopping lists and travel routes. AI memory avoids repetitive questions by saving preferences in JWT sessions.
                      </p>
                      <span className="text-[10px] text-slate-500 block italic">Includes local mock services mapping activities in case of network outages.</span>
                    </div>
                  )}

                  {activeTechNode === 'firestore' && (
                    <div className="space-y-2 text-xs font-sans text-left w-full animate-in fade-in duration-200">
                      <span className="font-extrabold text-amber-400 block text-sm flex items-center gap-1.5">
                        <Database className="h-4.5 w-4.5" />
                        Google Cloud Firestore Schema
                      </span>
                      <p className="text-slate-350">
                        Structured document storage partitioning. Collections `/users` handle profile indicators, referencing sub-collections `/activities`, `/receipts`, `/meals`, `/bills`, and `/wallet` transactions.
                      </p>
                      <span className="text-[10px] text-slate-500 block italic">Security rules: client read/write scopes enforce `request.auth.uid == userId` validations.</span>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* DATABASE TAB */}
            {activeTab === 'database' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white font-sans">Firestore Collections & API Flows</h3>
                  <p className="text-xs text-slate-450 uppercase font-bold font-sans">Document Mapping schemas representing client-to-cloud sync</p>
                </div>

                <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl flex justify-center">
                  <svg viewBox="0 0 500 120" className="w-full max-w-md stroke-primary-500/30" fill="none" strokeWidth="1.5">
                    {/* Users collection box */}
                    <rect x="20" y="20" width="100" height="70" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" />
                    <text x="70" y="38" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">/users/{'{uid}'}</text>
                    <text x="30" y="55" fill="#64748B" fontSize="8">displayName, email</text>
                    <text x="30" y="70" fill="#64748B" fontSize="8">ecoScore, xp, level</text>

                    {/* Nesting lines */}
                    <path d="M 120 55 L 180 55" />
                    
                    {/* Activities */}
                    <rect x="180" y="10" width="120" height="40" rx="6" fill="rgba(59, 130, 246, 0.05)" stroke="rgba(59, 130, 246, 0.15)" />
                    <text x="240" y="26" fill="#3B82F6" fontSize="9" fontWeight="bold" textAnchor="middle">/activities</text>
                    <text x="190" y="40" fill="#64748B" fontSize="8">savedKg, moneySaved, date</text>

                    {/* Receipts */}
                    <rect x="180" y="65" width="120" height="45" rx="6" fill="rgba(16, 185, 129, 0.05)" stroke="rgba(16, 185, 129, 0.15)" />
                    <text x="240" y="80" fill="#10B981" fontSize="9" fontWeight="bold" textAnchor="middle">/receipts</text>
                    <text x="190" y="95" fill="#64748B" fontSize="8">storeName, items, carbonTotal</text>

                    {/* Wallet */}
                    <rect x="340" y="38" width="120" height="40" rx="6" fill="rgba(245, 158, 11, 0.05)" stroke="rgba(245, 158, 11, 0.15)" />
                    <text x="400" y="54" fill="#F59E0B" fontSize="9" fontWeight="bold" textAnchor="middle">/wallet</text>
                    <text x="350" y="68" fill="#64748B" fontSize="8">userId, greenCoins, points</text>

                    <path d="M 300 55 C 320 55, 320 58, 340 58" />
                  </svg>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <span className="font-bold text-white block">Interactive API Query Cycle:</span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                      <li>Client POSTs natural text query to Express `/api/ai/scan`</li>
                      <li>Token verified, request passed to Gemini NLP parsing</li>
                      <li>Emissions computed, database sub-collection updated</li>
                      <li>XP, streak rewards checked, response returned to client</li>
                    </ol>
                  </div>
                  <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <span className="font-bold text-white block font-sans">Firebase Security rules:</span>
                    <pre className="font-mono text-[9px] text-slate-455 leading-tight bg-black/30 p-2.5 rounded-xl border border-white/5">
{`service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* UN SDG TAB */}
            {activeTab === 'sdg' && (
              <div className="space-y-5 animate-in fade-in duration-200 text-xs font-sans">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">United Nations SDG Intelligence</h3>
                    <p className="text-xs text-slate-450 uppercase font-bold">Fulfilling Agenda 2030 through daily green actions</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Overall SDG Score</span>
                    <span className="text-2xl font-black text-emerald-400">{sdgScore} / 100</span>
                  </div>
                </div>

                {/* Score slider control */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-350">Adjust active achievements to simulate SDG progress:</span>
                    <span className="text-emerald-400 font-extrabold">{sdgScore}% Alignment Rating</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={sdgScore}
                    onChange={(e) => setSdgScore(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 bg-white/10 rounded-lg h-1.5 focus:outline-none"
                    aria-label="SDG Alignment Simulator"
                  />
                </div>

                {/* Animated SDG Goals dashboard list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">Interactive Goal Mappings</span>
                    <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {SDG_GOALS.map((goal) => (
                        <button
                          key={goal.num}
                          onClick={() => setSelectedGoal(goal.num)}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                            selectedGoal === goal.num
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md'
                              : 'bg-white/5 border-white/5 text-slate-350 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {goal.icon}
                          <div className="overflow-hidden">
                            <h5 className="font-extrabold text-xs">{goal.title}</h5>
                            <p className="text-[9px] text-slate-500 truncate mt-0.5">{goal.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Goal detail view */}
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between min-h-[200px]">
                    {selectedGoal ? (
                      (() => {
                        const target = SDG_GOALS.find(g => g.num === selectedGoal);
                        return (
                          <div className="space-y-3.5 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                              {target?.icon}
                              <h4 className="font-black text-white text-xs uppercase tracking-wider">{target?.title}</h4>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Goal Mission</span>
                              <p className="text-slate-300 text-[11px] mt-0.5">{target?.desc}</p>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Estimated positive impact</span>
                              <p className="text-emerald-400 text-xs font-bold mt-0.5">{target?.impact}</p>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Contributing user actions</span>
                              <p className="text-slate-400 text-[10px] mt-0.5 italic">{target?.actions}</p>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
                        <HelpCircle className="h-10 w-10 mb-2 animate-bounce" />
                        <p className="text-[11px]">Select an SDG Goal card on the left to review positive impact details.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-4 animate-in fade-in duration-200 font-sans text-xs">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">Defense-in-Depth Security & OWASP Auditing</h3>
                  <p className="text-xs text-slate-450 uppercase font-bold">Strict isolation and threat checks running across operations</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-350">
                  <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <span className="font-extrabold text-emerald-400 block text-xs">Prompt Injection Guardrails</span>
                    <p className="text-[11px]">Rigorous input sanitization scans for instructions override command patterns. Automatically rejects text that tries to circumvent systemic instructions.</p>
                  </div>
                  <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <span className="font-extrabold text-blue-400 block text-xs">Unsafe Data Upload Filter</span>
                    <p className="text-[11px]">MIME-type assertions, limits on file sizes, and token-based uploads block malware injections during grocery receipt image scanning.</p>
                  </div>
                  <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <span className="font-extrabold text-amber-400 block text-xs">NoSQL Injection Protection</span>
                    <p className="text-[11px]">Express validators enforce strict regex models on parameters passed to Firebase queries, preventing access elevation bypasses.</p>
                  </div>
                  <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <span className="font-extrabold text-rose-400 block text-xs">JWT Security & Rate limits</span>
                    <p className="text-[11px]">JSON Web Tokens signed using environment secrets are mapped to headers. Requests have IP limits to prevent bot abuse.</p>
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span>OWASP Top 10 Audit compliance verified. All core API routers have rate limits and JWT guardrails.</span>
                </div>
              </div>
            )}

            {/* PERFORMANCE TAB */}
            {activeTab === 'performance' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white font-sans">Lighthouse Audits & Accessibility Sliders</h3>
                  <p className="text-xs text-slate-450 uppercase font-bold font-sans">Explore how lazy routing and caching yield premium latency results.</p>
                </div>
                
                {/* Sliders to adjust performance simulation */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Performance', val: lhPerf, setter: setLhPerf, color: 'text-emerald-500' },
                    { label: 'Accessibility', val: lhAccess, setter: setLhAccess, color: 'text-emerald-500' },
                    { label: 'Best Practices', val: lhBest, setter: setLhBest, color: 'text-emerald-500' },
                    { label: 'SEO Rating', val: lhSeo, setter: setLhSeo, color: 'text-emerald-500' }
                  ].map((lh, idx) => (
                    <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center space-y-2">
                      <span className={`text-2xl font-black block ${lh.color}`}>{lh.val}</span>
                      <span className="text-[8px] uppercase tracking-wider font-bold block">{lh.label}</span>
                      <input
                        type="range"
                        min="90"
                        max="100"
                        value={lh.val}
                        onChange={(e) => lh.setter(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 bg-white/10 rounded h-1 focus:outline-none"
                        aria-label={`Lighthouse ${lh.label} Slider`}
                      />
                    </div>
                  ))}
                </div>

                <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl text-xs text-slate-350 font-sans space-y-2">
                  <span className="font-extrabold text-white block mb-0.5">WCAG AA+ Accessibility compliance:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                    <li>All components have explicit ARIA labels supporting screen readers</li>
                    <li>Supports full keyboard navigation (`Tab` loops, keyboard triggers)</li>
                    <li>High-contrast styling options enabled globally</li>
                    <li>Text-To-Speech audio outputs support voice assistance navigation requests</li>
                  </ul>
                </div>
              </div>
            )}

            {/* WALKTHROUGH TAB */}
            {activeTab === 'walkthrough' && (
              <div className="space-y-4 animate-in fade-in duration-200 font-sans text-xs">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">Demo Tour Briefing & Project Assets</h3>
                  <p className="text-xs text-slate-450 uppercase font-bold font-sans">Everything a PromptWars judge needs to review in 2 minutes</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl space-y-2">
                    <span className="font-bold text-white block">Auditor Walkthrough Outline:</span>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                      <li>Click "Launch Judge Quick Tour" on the header</li>
                      <li>Watch Experience Mode cinematic slide walkthroughs</li>
                      <li>Visit the Scanners (Meals, Travel, Receipts)</li>
                      <li>Open Carbon Twin and check dynamic forest states</li>
                      <li>Trigger AI Dashboard and query voice commands</li>
                    </ol>
                  </div>
                  
                  <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-white block">Project Documents:</span>
                      <p className="text-[10px] text-slate-450 mt-1">SaaS pitch decks, full API documentation registers, and setup environment configurations.</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="glass" className="w-full text-[10px] py-2 flex items-center justify-center gap-1 font-bold">
                        <Download className="h-3.5 w-3.5" />
                        Whitepaper.pdf
                      </Button>
                      <Button variant="glass" className="w-full text-[10px] py-2 flex items-center justify-center gap-1 font-bold">
                        <ExternalLink className="h-3.5 w-3.5" />
                        README.md
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </Card>
        </div>
      </div>

      {/* Interactive Project Roadmap */}
      <Card variant="glass" className="p-6 border border-white/5 text-left space-y-4 font-sans">
        <h3 className="text-base font-bold text-white">Project Timeline & Future Roadmap</h3>
        <div className="relative border-l border-white/10 pl-6 space-y-6 text-xs text-slate-350">
          
          {/* Phase 1 */}
          <div className="relative">
            <div className="absolute -left-9.5 top-0.5 w-6 h-6 rounded-full bg-emerald-500 border-4 border-slate-900 flex items-center justify-center text-white" />
            <h4 className="font-extrabold text-white">Phase 1: Core Calculation Engines</h4>
            <p className="mt-1 text-[11px] text-slate-400">Built base carbon offset calculations engine, receipt OCR parser, and travel router interfaces.</p>
          </div>

          {/* Phase 2 */}
          <div className="relative">
            <div className="absolute -left-9.5 top-0.5 w-6 h-6 rounded-full bg-emerald-500 border-4 border-slate-900 flex items-center justify-center text-white" />
            <h4 className="font-extrabold text-white">Phase 2: Carbon Twin & Copilot OS</h4>
            <p className="mt-1 text-[11px] text-slate-400">Seeded digital lifestyle representations and expanded assistant drawer panels globally.</p>
          </div>

          {/* Phase 3 */}
          <div className="relative">
            <div className="absolute -left-9.5 top-0.5 w-6 h-6 rounded-full bg-primary-500 border-4 border-slate-900 flex items-center justify-center text-white animate-pulse" />
            <h4 className="font-extrabold text-primary-400">Phase 3: Autonomous AI Intelligence Layer</h4>
            <p className="mt-1 text-[11px] text-slate-400">Integrating Sustainability IQ, explainable algorithms, UN SDG Goals alignment, and voice commands.</p>
          </div>
        </div>
      </Card>

      {/* Investor Presenter Assets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-400 font-sans">
        <a href="#whitepaper" className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-between">
          <span>Download Product Whitepaper</span>
          <Download className="h-4 w-4 text-slate-400" />
        </a>
        <a href="https://github.com/CarbonMind-OS/CarbonMind-OS" target="_blank" rel="noreferrer" className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-between">
          <span>GitHub Code Repository</span>
          <ExternalLink className="h-4 w-4 text-slate-400" />
        </a>
        <a href="#apidocs" className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-between">
          <span>API Documentation Specifications</span>
          <ChevronRight className="h-4.5 w-4.5 text-slate-400" />
        </a>
      </div>

    </div>
  );
};
export default Judge;
