import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../config/api';
import {
  Upload,
  Camera,
  Mic,
  Volume2,
  Trash2,
  Plus,
  Search,
  Award,
  Sparkles,
  Droplet,
  Leaf,
  RefreshCw,
  ChefHat,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Apple,
  Flame,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const MealAnalyzer: React.FC = () => {
  const { user, logMeal, deleteMeal } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tracker' | 'forest' | 'planner' | 'history'>('tracker');
  
  // Before vs After swap widget state
  const [selectedIngredient, setSelectedIngredient] = useState<string>('Beef Patty');
  const [selectedReplacement, setSelectedReplacement] = useState<string>('Beyond Plant Patty');
  const [swapRatio, setSwapRatio] = useState<number>(1); // portions count

  // AI Planner state
  const [plannerGoal, setPlannerGoal] = useState<'vegetarian' | 'vegan' | 'high-protein' | 'low-carb' | 'college-budget'>('vegetarian');
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Voice Assistant State
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceReply, setVoiceReply] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  // History filtering & search
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilterType, setHistoryFilterType] = useState('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag handlings
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setScanError("Please upload a JPG or PNG food photo.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setScanError("Image size must be less than 5MB.");
      return;
    }
    setScanError(null);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Run AI analysis
  const runAnalysis = async (mockKeyword?: string) => {
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const endpoint = `${API_BASE}/api/ai/analyze-meal`;
      const token = localStorage.getItem('carbonmind_token');
      
      let payload: any = {};
      
      if (mockKeyword) {
        payload.text = mockKeyword;
      } else if (previewUrl) {
        payload.image = previewUrl;
        payload.fileName = selectedFile?.name || null;
        // Use filename as a keyword fallback if description is empty
        if (!textInput.trim() && selectedFile) {
          payload.text = selectedFile.name;
        }
      } else if (textInput.trim()) {
        payload.text = textInput.trim();
      } else {
        throw new Error("Please upload a meal photo or enter a meal description.");
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with AI Meal service.");
      }

      const data = await response.json();
      if (data.success) {
        setScanResult(data);
        await logMeal(data);
        setTextInput('');
      } else {
        throw new Error("AI could not extract food ingredients.");
      }
    } catch (err: any) {
      setScanError(err.message || "Failed to analyze meal. Please check network connection.");
    } finally {
      setIsScanning(false);
    }
  };

  // Ingredient Swap calculations (Before vs After)
  const getIngredientSwapData = () => {
    // Hardcoded swaps database matching UI sliders
    const SWAPS: any = {
      'Beef Patty': {
        replacement: 'Beyond Plant Patty',
        carbonSaved: 7.3,
        waterSaved: 1050,
        caloriesDiff: -150,
        costDiff: -0.50
      },
      'Dairy Milk': {
        replacement: 'Organic Oat Milk',
        carbonSaved: 0.43,
        waterSaved: 105,
        caloriesDiff: -30,
        costDiff: 0.10
      },
      'Chicken Pieces': {
        replacement: 'Organic Tofu Cubes',
        carbonSaved: 2.2,
        waterSaved: 380,
        caloriesDiff: -100,
        costDiff: -1.00
      },
      'Dairy Paneer': {
        replacement: 'Local Organic Tofu',
        carbonSaved: 0.55,
        waterSaved: 165,
        caloriesDiff: -60,
        costDiff: -0.50
      }
    };

    const details = SWAPS[selectedIngredient] || {
      replacement: 'Plant alternative',
      carbonSaved: 0.5,
      waterSaved: 50,
      caloriesDiff: -50,
      costDiff: 0
    };

    return {
      beforeCarbon: (details.carbonSaved * 1.3 * swapRatio).toFixed(1),
      afterCarbon: (details.carbonSaved * 0.3 * swapRatio).toFixed(1),
      beforeWater: Math.round(details.waterSaved * 1.2 * swapRatio),
      afterWater: Math.round(details.waterSaved * 0.2 * swapRatio),
      beforeCal: Math.round(300 * swapRatio),
      afterCal: Math.round((300 + details.caloriesDiff) * swapRatio),
      carbonSavings: (details.carbonSaved * swapRatio).toFixed(1),
      waterSavings: Math.round(details.waterSaved * swapRatio),
      calDifference: Math.abs(details.caloriesDiff * swapRatio),
      costSavings: (details.costDiff * swapRatio).toFixed(2),
      isCheaper: details.costDiff < 0
    };
  };

  const swapMetrics = getIngredientSwapData();

  // AI Meal Planner Generator
  const generateMealPlan = () => {
    setIsGeneratingPlan(true);
    setTimeout(() => {
      let plan: any = {};
      if (plannerGoal === 'vegetarian') {
        plan = {
          title: "Green Vegetarian Power Plan",
          dailyCarbon: "1.4kg CO₂ (60% lower than avg)",
          budget: "$12.50 / day",
          days: [
            { day: "Breakfast", name: "Ragi Malt with banana & almonds", carbon: "0.2kg", health: "92%" },
            { day: "Lunch", name: "Brown Rice, Dal fry, Paneer bhurji & cucumber salad", carbon: "0.6kg", health: "88%" },
            { day: "Dinner", name: "Millet Rotis, vegetable khorma & curd", carbon: "0.5kg", health: "85%" }
          ],
          ingredientsNeeded: ["Organic Ragi Flour", "Almond seeds", "Brown Rice", "Yellow Lentils", "Paneer", "Seasonal Veggies"]
        };
      } else if (plannerGoal === 'vegan') {
        plan = {
          title: "Zero-Waste Vegan Plan",
          dailyCarbon: "0.9kg CO₂ (78% lower than avg)",
          budget: "$11.00 / day",
          days: [
            { day: "Breakfast", name: "Oatmeal with chia seeds & soy milk", carbon: "0.15kg", health: "94%" },
            { day: "Lunch", name: "Tofu Fried Rice with green onions & peas", carbon: "0.4kg", health: "89%" },
            { day: "Dinner", name: "Lentil soup with garlic bread & spinach", carbon: "0.35kg", health: "90%" }
          ],
          ingredientsNeeded: ["Rolled Oats", "Chia seeds", "Organic Tofu", "Soy milk", "Green Lentils", "Spinach leaf"]
        };
      } else if (plannerGoal === 'high-protein') {
        plan = {
          title: "Clean Muscle Eco Plan",
          dailyCarbon: "2.1kg CO₂ (35% lower than avg)",
          budget: "$18.00 / day",
          days: [
            { day: "Breakfast", name: "Scrambled Eggs (3) with whole wheat toast", carbon: "0.45kg", health: "90%" },
            { day: "Lunch", name: "Grilled pastured chicken with quinoa & broccoli", carbon: "1.0kg", health: "92%" },
            { day: "Dinner", name: "Seared Salmon with sweet potato mash & asparagus", carbon: "0.65kg", health: "89%" }
          ],
          ingredientsNeeded: ["Eggs", "Pasture Chicken Breast", "Quinoa", "Salmon", "Sweet Potato", "Broccoli"]
        };
      } else if (plannerGoal === 'low-carb') {
        plan = {
          title: "Eco Keto / Low-Carb Plan",
          dailyCarbon: "1.8kg CO₂ (45% lower than avg)",
          budget: "$15.50 / day",
          days: [
            { day: "Breakfast", name: "Avocado & Spinach egg cups", carbon: "0.3kg", health: "91%" },
            { day: "Lunch", name: "Paneer Tikka salad with olive oil dressing", carbon: "0.8kg", health: "87%" },
            { day: "Dinner", name: "Garlic Butter Cauliflower Rice with grilled tofu", carbon: "0.7kg", health: "88%" }
          ],
          ingredientsNeeded: ["Avocados", "Spinach", "Paneer", "Cauliflower", "Organic Tofu", "Eggs"]
        };
      } else {
        plan = {
          title: "College Budget Green Plan",
          dailyCarbon: "1.2kg CO₂ (65% lower than avg)",
          budget: "$7.50 / day",
          days: [
            { day: "Breakfast", name: "Banana Peanut Butter Toast (2 slices)", carbon: "0.2kg", health: "88%" },
            { day: "Lunch", name: "Veggie Masala Khichdi with pickle", carbon: "0.5kg", health: "90%" },
            { day: "Dinner", name: "Soya Chunk Curry with steam rice", carbon: "0.5kg", health: "86%" }
          ],
          ingredientsNeeded: ["Bananas", "Peanut Butter", "Loaf of Wheat Bread", "Moong Dal", "Rice", "Soya chunks"]
        };
      }
      setGeneratedPlan(plan);
      setIsGeneratingPlan(false);
    }, 1000);
  };

  // Voice Assistant questions
  const handleVoiceQuery = (query: string) => {
    setVoiceQuery(query);
    setIsAnswering(true);

    setTimeout(() => {
      let reply = "";
      if (query.includes("healthy")) {
        const todayMeals = user?.meals || [];
        if (todayMeals.length > 0) {
          const totalScore = todayMeals.reduce((acc: number, cur: any) => acc + cur.mealScore, 0);
          const avgScore = Math.round(totalScore / todayMeals.length);
          reply = `You logged ${todayMeals.length} meals today with an average health score of ${avgScore}%. Your nutrition balance looks great!`;
        } else {
          reply = "You haven't logged any meals today! Tell me what you ate or snap a picture to check its health index.";
        }
      } else if (query.includes("emissions")) {
        const meals = user?.meals || [];
        if (meals.length > 0) {
          const high = [...meals].sort((a: any, b: any) => b.sustainability.carbonEmissionsKg - a.sustainability.carbonEmissionsKg)[0];
          reply = `The highest carbon emitter was "${high.mealName}" which produced ${high.sustainability.carbonEmissionsKg}kg CO₂. Swapping it for a plant alternative saves over 70% of this emission.`;
        } else {
          reply = "Log a meal first to evaluate carbon emissions levels.";
        }
      } else if (query.includes("breakfast")) {
        reply = "For tomorrow, I recommend an Organic Oats Idli with Veg Sambar. It's a South Indian low-carbon staple that provides 9g of protein and only 0.35kg CO₂ emissions.";
      } else {
        reply = "You can reduce your carbon footprint significantly by replacing beef and cheese with plant proteins, and buying local ingredients.";
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

  // Recharts Global Comparison data
  const getGlobalComparisonData = (mealCarbon: number) => {
    return [
      { name: 'Your Meal', carbon: mealCarbon, fill: '#10b981' },
      { name: 'City Avg', carbon: 1.8, fill: '#64748b' },
      { name: 'Student Avg', carbon: 1.5, fill: '#3b82f6' },
      { name: 'India Avg', carbon: 1.2, fill: '#f59e0b' },
      { name: 'Global Avg', carbon: 2.1, fill: '#ef4444' }
    ];
  };

  // Filter history
  const filteredMeals = (user?.meals || []).filter(m => {
    const matchesSearch = m.mealName.toLowerCase().includes(historySearch.toLowerCase()) || m.cuisine.toLowerCase().includes(historySearch.toLowerCase());
    const matchesType = historyFilterType === 'all' || m.mealType.toLowerCase() === historyFilterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <main className="w-full max-w-7xl mx-auto font-sans text-slate-800 dark:text-slate-200">
      
      {/* Premium Glass Banner */}
      <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-500/20 to-purple-500/10 dark:from-indigo-950/40 dark:to-purple-950/20 p-8 border border-indigo-500/10 dark:border-indigo-500/5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 mb-3 border border-indigo-500/20">
              <ChefHat className="h-3.5 w-3.5" /> AI Meal Analyzer
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI-Powered Meal Nutrition & Carbon Analyzer
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Analyze meals using photos, voice transcripts, or natural descriptions. Get nutrient rings, carbon counts, and green swaps instantly.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md px-5 py-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50">
            <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">Meal Forest</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                🌲 {user?.mealForestTrees || 0} Trees Grown
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 mb-8 overflow-x-auto gap-2">
        {[
          { id: 'tracker', label: 'Meal Tracker', icon: <Camera className="h-4.5 w-4.5" /> },
          { id: 'forest', label: 'Meal Forest', icon: <Leaf className="h-4.5 w-4.5" /> },
          { id: 'planner', label: 'AI Meal Planner', icon: <ChefHat className="h-4.5 w-4.5" /> },
          { id: 'history', label: 'Meal History Log', icon: <Clock className="h-4.5 w-4.5" /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === t.id
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: TRACKER */}
      {activeTab === 'tracker' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Input Area */}
          <section className="lg:col-span-1 space-y-6" aria-label="Meal Input Panel">
            
            {/* Snap & drag photo widget */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Scan Food Photo
              </h2>

              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-500/5'
                    : 'border-slate-300 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInput}
                  className="hidden"
                  accept="image/jpeg,image/png"
                />

                {previewUrl ? (
                  <div className="relative group overflow-hidden rounded-xl aspect-square bg-slate-50 dark:bg-zinc-800 flex items-center justify-center">
                    <img src={previewUrl} alt="Meal Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-full">
                        Change Photo
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center justify-center">
                    <Camera className="h-10 w-10 text-slate-400 mb-4" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Snap or Drag Food Photo
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Supports JPG or PNG images (Max 5MB)
                    </p>
                  </div>
                )}
              </div>

              {scanError && (
                <div role="alert" aria-live="polite" className="mt-4 p-3 bg-rose-500/10 border border-rose-500/10 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex gap-2 items-center">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}
            </div>

            {/* Natural language logging widget */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Describe Meal in Text
              </h2>
              
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Example: 'I had two idlis with vegetable sambar for breakfast.'"
                rows={3}
                aria-label="Describe meal in text"
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50 text-xs font-semibold placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 resize-none"
              />

              <button
                disabled={isScanning || (!textInput.trim() && !previewUrl)}
                onClick={() => runAnalysis()}
                aria-label="Run AI Food Analysis"
                className="w-full mt-4 py-3.5 px-4 rounded-xl font-bold text-sm bg-indigo-500 text-white hover:bg-indigo-650 active:scale-97 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing Food...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Run AI Food Analysis
                  </>
                )}
              </button>
            </div>

            {/* Quick presets scanner */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" /> Presets (Quick Check)
              </h3>
              <div className="space-y-2">
                {[
                  { name: "Chicken Biryani (Meat)", key: "biryani", desc: "Lunch meal combo" },
                  { name: "Two Idlis with Sambar (Vegan)", key: "idli", desc: "Fermented breakfast" },
                  { name: "Double Cheeseburger & Fries (High Carbon)", key: "burger", desc: "Fast Food combo" },
                  { name: "Filter Coffee with Dairy (Imported)", key: "coffee", desc: "Drink" },
                  { name: "Indian Vegetarian Thali (Veg)", key: "thali", desc: "Curd, Paneer, Rice, Dal" }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    disabled={isScanning}
                    onClick={() => runAnalysis(preset.key)}
                    aria-label={`Analyze preset: ${preset.name}`}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-100 hover:border-indigo-400 dark:border-zinc-800 dark:hover:border-indigo-500/50 bg-slate-50/50 dark:bg-zinc-850/50 hover:bg-white dark:hover:bg-zinc-900 active:scale-98 transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{preset.name}</p>
                      <p className="text-[10px] text-slate-450 mt-0.5">{preset.desc}</p>
                    </div>
                    <Plus className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Voice query coach */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 dark:from-indigo-950/20 dark:to-purple-950/10 border border-indigo-500/10 rounded-3xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                <Volume2 className="h-4.5 w-4.5" /> AI Food Coach Voice queries
              </h3>
              <p className="text-xs text-slate-450 mb-4">
                Ask a quick question about your diet program:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Was today's lunch healthy?",
                  "Which meal produced the highest emissions?",
                  "Suggest tomorrow's breakfast."
                ].map((q, i) => (
                  <button
                    key={i}
                    disabled={isAnswering}
                    onClick={() => handleVoiceQuery(q)}
                    aria-label={`Ask coach: ${q}`}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white hover:border-indigo-400 transition-all flex items-center justify-between"
                  >
                    <span>{q}</span>
                    <Volume2 className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))}
              </div>

              {voiceQuery && (
                <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-500/10">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">You asked</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic">"{voiceQuery}"</p>
                  <p className="text-[10px] font-bold uppercase text-indigo-500 tracking-wide mt-3">AI Coach Response</p>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed mt-0.5">
                    {isAnswering ? "Formulating recommendation..." : voiceReply}
                  </p>
                </div>
              )}
            </div>

          </section>

          {/* Right panel: Analysis Output */}
          <section className="lg:col-span-2 space-y-6" aria-label="Meal Analysis Report">
            
            {/* Laser Scanning loading card */}
            {isScanning && (
              <div className="bg-slate-900 rounded-3xl p-8 relative flex flex-col items-center justify-center min-h-[400px] border border-zinc-800 shadow-xl overflow-hidden">
                <div className="w-56 aspect-square bg-slate-950 rounded-2xl relative border border-zinc-850 flex items-center justify-center overflow-hidden">
                  <ChefHat className="h-24 w-24 text-indigo-500/20 animate-pulse" />
                </div>
                
                {/* Laser overlay animation */}
                <motion.div
                  initial={{ y: '20%' }}
                  animate={{ y: '220%' }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-85 shadow-[0_0_10px_rgba(99,102,241,0.8)] pointer-events-none"
                  style={{ width: '100%', top: 0 }}
                />

                <p className="text-white font-bold text-lg mt-6">Analyzing meal nutrition & carbon footprint...</p>
                <p className="text-slate-400 text-xs mt-1">Cross-referencing food indexes via Gemini 1.5 Flash Vision</p>
              </div>
            )}

            {/* Results cards */}
            <AnimatePresence mode="wait">
              {scanResult && !isScanning && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                  role="region"
                  aria-label="Scan Results Report"
                >
                  
                  {/* Large Meal Card header */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                            {scanResult.mealType}
                          </span>
                          <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                            {scanResult.diningType}
                          </span>
                          {scanResult.characteristics.map((char: string, i: number) => (
                            <span key={i} className="text-xs font-bold text-slate-450 bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
                              {char}
                            </span>
                          ))}
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-3.5">
                          {scanResult.mealName}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Cuisine: {scanResult.cuisine} &bull; Portions: {scanResult.servingCount} serving &bull; Confidence: {Math.round(scanResult.confidenceScore * 100)}%
                        </p>
                      </div>

                      {/* Meal Score radial display */}
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-850 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                        <div className="h-14 w-14 rounded-full border-4 border-indigo-500 flex items-center justify-center font-black text-base text-indigo-600 dark:text-indigo-400">
                          {scanResult.mealScore}
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Meal Score</p>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{scanResult.mealRating}</p>
                        </div>
                      </div>
                    </div>

                    {/* Ingredients list text */}
                    <div className="mt-6 border-t border-slate-100 dark:border-zinc-800/80 pt-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingredients identified</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1.5 leading-relaxed">
                        {scanResult.ingredients.join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Visual carbon, water, macro metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Carbon Emitted", val: `${scanResult.sustainability.carbonEmissionsKg} kg`, sub: "CO₂ greenhouse gas", icon: <Leaf className="h-5 w-5" />, color: "text-emerald-500 bg-emerald-500/10" },
                      { label: "Water Footprint", val: `${scanResult.sustainability.waterFootprintL} L`, sub: "Total lifecycle water", icon: <Droplet className="h-5 w-5" />, color: "text-blue-500 bg-blue-500/10" },
                      { label: "Calorie Intake", val: `${scanResult.nutrition.calories} kcal`, sub: "Total meal energy", icon: <Flame className="h-5 w-5" />, color: "text-orange-500 bg-orange-500/10" },
                      { label: "Health Score", val: `${scanResult.nutrition.healthScore}%`, sub: "Nutrition balance index", icon: <Apple className="h-5 w-5" />, color: "text-rose-500 bg-rose-500/10" }
                    ].map((k, i) => (
                      <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-xs">
                        <div className="flex justify-between items-center">
                          <div className={`p-2.5 rounded-xl ${k.color}`}>{k.icon}</div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{k.label}</span>
                        </div>
                        <p className="text-xl font-black text-slate-900 dark:text-white mt-4">{k.val}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{k.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Circular macro indicators */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                      Macro Nutritional Rings
                    </h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {[
                        { label: "Calories", cur: scanResult.nutrition.calories, max: 2000, unit: "kcal", color: "border-orange-500" },
                        { label: "Protein", cur: scanResult.nutrition.protein, max: 80, unit: "g", color: "border-indigo-500" },
                        { label: "Carbs", cur: scanResult.nutrition.carbs, max: 250, unit: "g", color: "border-blue-500" },
                        { label: "Fats", cur: scanResult.nutrition.fat, max: 70, unit: "g", color: "border-yellow-500" },
                        { label: "Fiber", cur: scanResult.nutrition.fiber, max: 30, unit: "g", color: "border-emerald-500" }
                      ].map((macro, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50/50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800">
                          <div className={`h-16 w-16 rounded-full border-4 ${macro.color} flex flex-col justify-center items-center`}>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{macro.cur}</span>
                            <span className="text-[8px] text-slate-400 uppercase">{macro.unit}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-3">{macro.label}</span>
                          <span className="text-[9px] text-slate-400 mt-0.5">{Math.round((macro.cur / macro.max) * 100)}% daily limit</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sustainability indices */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-4">
                      Sustainability Footprint Indices
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Land Usage</span>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{scanResult.sustainability.landUsageSqM} sq meters</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Physical land needed to grow ingredients</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Packaging Impact</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            scanResult.sustainability.packagingImpact === 'High'
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                          }`}>
                            {scanResult.sustainability.packagingImpact}
                          </span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">({scanResult.sustainability.packagingWasteG}g waste)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5">Includes wrappers, wraps, cardboard box weight</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Logistics & Seasonality</span>
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1">
                          {scanResult.sustainability.isLocal ? "Local Seasonal crops" : "Imported / Off-season cargo"}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Transportation impact: {scanResult.sustainability.transportationImpactKg}kg CO₂</p>
                      </div>
                    </div>
                  </div>

                  {/* Before vs After swap widget */}
                  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/30 dark:to-teal-950/15 border border-emerald-500/10 rounded-3xl p-6 shadow-xs">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-4">
                      <Sparkles className="h-4.5 w-4.5" /> 📸 Before vs After Swap Simulator
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select ingredient to swap</label>
                        <select
                          value={selectedIngredient}
                          onChange={(e) => {
                            setSelectedIngredient(e.target.value);
                            // Adjust default replacement
                            const defaults: any = {
                              'Beef Patty': 'Beyond Plant Patty',
                              'Dairy Milk': 'Organic Oat Milk',
                              'Chicken Pieces': 'Organic Tofu Cubes',
                              'Dairy Paneer': 'Local Organic Tofu'
                            };
                            setSelectedReplacement(defaults[e.target.value] || 'Plant alternative');
                          }}
                          aria-label="Select ingredient to swap"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold focus:outline-hidden"
                        >
                          <option value="Beef Patty">Beef Patty (Cheeseburger patty)</option>
                          <option value="Dairy Milk">Dairy Milk (Coffee milk)</option>
                          <option value="Chicken Pieces">Chicken Pieces (Biryani meat)</option>
                          <option value="Dairy Paneer">Dairy Paneer (Thali paneer cubes)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Replacement</label>
                        <input
                          type="text"
                          value={selectedReplacement}
                          readOnly
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-855 bg-slate-100/50 dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Portions count</label>
                        <div className="flex gap-2 items-center">
                          <button onClick={() => setSwapRatio(Math.max(1, swapRatio - 1))} aria-label="Decrease portions count" className="h-10 w-10 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl font-black text-sm active:scale-90">-</button>
                          <span className="text-sm font-bold w-6 text-center">{swapRatio}</span>
                          <button onClick={() => setSwapRatio(swapRatio + 1)} aria-label="Increase portions count" className="h-10 w-10 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl font-black text-sm active:scale-90">+</button>
                        </div>
                      </div>
                    </div>

                    {/* Comparison bars display */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md p-5 rounded-2xl border border-emerald-500/10">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Carbon footprint</p>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2">Before: <span className="line-through">{swapMetrics.beforeCarbon}kg</span></p>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">After: {swapMetrics.afterCarbon}kg</p>
                        <p className="text-xs font-bold text-emerald-500 mt-2">Savings: -{swapMetrics.carbonSavings}kg CO₂</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Water footprint</p>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2">Before: <span className="line-through">{swapMetrics.beforeWater}L</span></p>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">After: {swapMetrics.afterWater}L</p>
                        <p className="text-xs font-bold text-blue-500 mt-2">Saved: {swapMetrics.waterSavings} Liters</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calorie Intake</p>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2">Before: <span className="line-through">{swapMetrics.beforeCal} kcal</span></p>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">After: {swapMetrics.afterCal} kcal</p>
                        <p className="text-xs font-bold text-orange-500 mt-2">Diff: -{swapMetrics.calDifference} kcal</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Budget Shift</p>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2">Swap impact</p>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">
                          {swapMetrics.isCheaper ? `Saves $${swapMetrics.costSavings}` : `Adds $${swapMetrics.costSavings}`}
                        </p>
                        <p className="text-xs font-bold text-primary-500 mt-2">
                          {swapMetrics.isCheaper ? "More Economical" : "Premium ingredient"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recharts global carbon comparison chart */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                      🌍 Carbon Footprint Benchmark Comparison (kg CO₂/meal)
                    </h3>
                    
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getGlobalComparisonData(scanResult.sustainability.carbonEmissionsKg)}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                          <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '12px' }} />
                          <Bar dataKey="carbon" radius={[6, 6, 0, 0]}>
                            {getGlobalComparisonData(scanResult.sustainability.carbonEmissionsKg).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* AI Food coach advice */}
                  <div className="bg-indigo-500/10 border-l-4 border-indigo-500 p-5 rounded-r-2xl">
                    <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 mb-2">
                      <Sparkles className="h-4.5 w-4.5 animate-pulse" /> AI Food Coach Recommendations
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {scanResult.coachAdvice}
                    </p>
                  </div>

                </motion.div>
              )}

              {!scanResult && !isScanning && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-slate-400 font-medium shadow-xs flex flex-col items-center justify-center min-h-[400px]">
                  <ChefHat className="h-12 w-12 text-indigo-500/20 mb-4" />
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">No Meal Analyzed</h3>
                  <p className="text-xs text-slate-450 mt-1 max-w-xs mx-auto leading-relaxed">
                    Upload a food picture, write down what you ate, or pick one of the quick presets on the left to start checking health and carbon metrics.
                  </p>
                </div>
              )}
            </AnimatePresence>

          </section>
        </div>
      )}

      {/* TAB CONTENT: MEAL FOREST */}
      {activeTab === 'forest' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Visual forest trees ring */}
            <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-zinc-950 rounded-3xl border border-slate-100 dark:border-zinc-900">
              <div className="relative h-64 w-64 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-full border-4 border-indigo-500 shadow-xl">
                <div className="flex flex-col items-center">
                  <Leaf className="h-20 w-20 text-indigo-500" />
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                    {user?.mealForestTrees || 0}
                  </p>
                  <p className="text-xs text-slate-450 uppercase tracking-wider font-bold">Meal Forest Trees</p>
                </div>
                
                {/* Floating particle markers */}
                <div className="absolute top-8 left-8 text-indigo-400 text-lg animate-bounce">🌳</div>
                <div className="absolute bottom-8 right-8 text-indigo-400 text-lg animate-pulse">🌱</div>
                <div className="absolute top-1/2 right-4 text-indigo-400 text-lg">🍂</div>
              </div>

              <h3 className="text-xl font-bold mt-6 text-slate-900 dark:text-white">
                Your Dietary Forest is growing!
              </h3>
              <p className="text-xs text-slate-450 mt-1 max-w-sm">
                Every 5 healthy or eco-friendly meals logged (Meal Score Good or Excellent, or Carbon Footprint &lt; 1.0kg) grows 1 virtual tree in your forest!
              </p>
            </div>

            {/* Tree planting logs */}
            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Meal Forestry Achievements
              </h3>
              
              <div className="space-y-4">
                {[
                  { title: "Healthy Start", desc: "First sustainable meal logged", progress: user?.meals && user.meals.length >= 1 ? 100 : 0, icon: "🌱", done: user?.meals && user.meals.length >= 1 },
                  { title: "Climate Chef", desc: "Grow 3 virtual trees in the Meal Forest", progress: Math.min(100, ((user?.mealForestTrees || 0) / 3) * 100), icon: "🌳", done: (user?.mealForestTrees || 0) >= 3 },
                  { title: "Planet Protector", desc: "Grow 5 virtual trees in your forest", progress: Math.min(100, ((user?.mealForestTrees || 0) / 5) * 100), icon: "🌲", done: (user?.mealForestTrees || 0) >= 5 }
                ].map((mile, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800 flex gap-4 items-center">
                    <div className="h-10 w-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-lg border border-slate-100 dark:border-zinc-800 shadow-xs">
                      {mile.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{mile.title}</p>
                        {mile.done && <span className="text-[10px] font-bold text-indigo-500 uppercase">UNLOCKED</span>}
                      </div>
                      <p className="text-xs text-slate-450 mt-0.5">{mile.desc}</p>
                      
                      <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${mile.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: AI MEAL PLANNER */}
      {activeTab === 'planner' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xs">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <span className="inline-block p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl mb-4">
              <ChefHat className="h-8 w-8" />
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              AI-Generated Meal Planner
            </h3>
            <p className="text-sm text-slate-450 mt-2">
              Generate customizable low-carbon, healthy meal plans based on your personal budget and nutrition goals.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {[
              { id: 'vegetarian', label: 'Vegetarian' },
              { id: 'vegan', label: 'Vegan Refills' },
              { id: 'high-protein', label: 'High Protein' },
              { id: 'low-carb', label: 'Low Carb' },
              { id: 'college-budget', label: 'Student Budget' }
            ].map(g => (
              <button
                key={g.id}
                onClick={() => setPlannerGoal(g.id as any)}
                className={`py-3.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                  plannerGoal === g.id
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-indigo-400 hover:bg-slate-50'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={generateMealPlan}
              disabled={isGeneratingPlan}
              className="py-3 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm flex items-center gap-1.5 active:scale-97 transition-all shadow-xs"
            >
              {isGeneratingPlan ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Structuring Menu...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate AI Meal Plan
                </>
              )}
            </button>
          </div>

          {generatedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 border-t border-slate-100 dark:border-zinc-800 pt-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 dark:bg-zinc-850 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800">
                <div>
                  <h4 className="text-lg font-black text-slate-800 dark:text-slate-200">{generatedPlan.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">Goal: {plannerGoal.toUpperCase()}</p>
                </div>
                <div className="flex gap-6 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Carbon Impact: <strong className="text-emerald-500">{generatedPlan.dailyCarbon}</strong></span>
                  <span>Cost estimate: <strong className="text-primary-500">{generatedPlan.budget}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {generatedPlan.days.map((d: any, i: number) => (
                  <div key={i} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full mb-3 inline-block">
                        {d.day}
                      </span>
                      <h5 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{d.name}</h5>
                    </div>
                    <div className="flex justify-between items-center mt-6 border-t border-slate-100 dark:border-zinc-800 pt-3 text-[10px] font-bold uppercase text-slate-450 tracking-wider">
                      <span>Carbon: {d.carbon}</span>
                      <span>Health score: {d.health}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shopping list integration */}
              <div className="p-6 rounded-2xl border border-indigo-500/10 bg-indigo-500/5">
                <h5 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 mb-3">
                  <CheckCircle className="h-4.5 w-4.5 text-indigo-500" /> Integrated Grocery Shopping List
                </h5>
                <p className="text-xs text-slate-450 mb-3 font-medium">
                  We scanned your receipt history; you will need to buy these low-carbon items for this plan:
                </p>
                <div className="flex flex-wrap gap-2">
                  {generatedPlan.ingredientsNeeded.map((ing: string, i: number) => (
                    <span key={i} className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-805 rounded-xl">
                      &bull; {ing}
                    </span>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

        </div>
      )}

      {/* TAB CONTENT: MEAL HISTORY LOG */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          
          {/* Timeline filter card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search meal or cuisine..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50 text-xs font-semibold placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={historyFilterType}
                onChange={(e) => setHistoryFilterType(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-850/50 text-xs font-semibold focus:outline-hidden"
              >
                <option value="all">All Meals</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="drink">Drinks</option>
              </select>
            </div>

          </div>

          {/* Meals list */}
          <div className="space-y-4">
            {filteredMeals.map((meal) => (
              <div
                key={meal.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs relative overflow-hidden group hover:border-indigo-400 transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex gap-4 items-center">
                    <span className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 flex items-center justify-center font-black text-sm border border-indigo-150 dark:border-indigo-900">
                      {meal.mealScore}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                        {meal.mealName}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Logged on {new Date(meal.timestamp).toLocaleString()} &bull; Cuisine: {meal.cuisine} &bull; Type: {meal.mealType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScanResult(meal)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:border-indigo-400 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View Results
                    </button>
                    <button
                      onClick={() => deleteMeal(meal.id)}
                      className="p-2 rounded-xl border border-slate-200 hover:border-rose-450 dark:border-zinc-850 hover:bg-rose-50 dark:hover:bg-zinc-800 text-slate-450 hover:text-rose-500 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 bg-slate-50/50 dark:bg-zinc-850/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Carbon Emissions</span>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{meal.sustainability.carbonEmissionsKg} kg</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Water Used</span>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{meal.sustainability.waterFootprintL} L</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calories</span>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{meal.nutrition.calories} kcal</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Protein Intake</span>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{meal.nutrition.protein}g</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health Rating</span>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{meal.mealRating}</p>
                  </div>
                </div>
              </div>
            ))}

            {filteredMeals.length === 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-slate-400 font-medium shadow-xs">
                No meal logs match the search query.
              </div>
            )}
          </div>

        </div>
      )}

    </main>
  );
};

export default MealAnalyzer;
