import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  Upload,
  Zap,
  Clock,
  Sparkles,
  Award,
  Trash2,
  Volume2,
  Tv,
  Refrigerator,
  Lightbulb,
  Fan,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  RefreshCw,
  Sun,
  Battery,
  Shield,
  HelpCircle,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';

// Define the static energy profile seed
const SEED_APPLIANCES = [
  { id: 'app_1', name: 'Air Conditioner', icon: 'AirVent', quantity: 1, hoursPerDay: 6, energyRating: 3, ageOfAppliance: 4, watts: 1500 },
  { id: 'app_2', name: 'Refrigerator', icon: 'Refrigerator', quantity: 1, hoursPerDay: 24, energyRating: 4, ageOfAppliance: 3, watts: 300 },
  { id: 'app_3', name: 'Induction Stove', icon: 'Flame', quantity: 1, hoursPerDay: 2, energyRating: 3, ageOfAppliance: 2, watts: 1800 },
  { id: 'app_4', name: 'Lights', icon: 'Lightbulb', quantity: 12, hoursPerDay: 8, energyRating: 3, ageOfAppliance: 5, watts: 40 },
  { id: 'app_5', name: 'Television', icon: 'Tv', quantity: 1, hoursPerDay: 4, energyRating: 3, ageOfAppliance: 3, watts: 120 },
  { id: 'app_6', name: 'Washing Machine', icon: 'WashingMachine', quantity: 1, hoursPerDay: 1, energyRating: 3, ageOfAppliance: 4, watts: 500 }
];

export const EnergyIntelligence: React.FC = () => {
  const { user, logBill, deleteBill, updateAppliances } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appliances' | 'solar' | 'timeline'>('dashboard');

  // Drag and drop states
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);

  // App state
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const tariffRate = currency === 'INR' ? 8.0 : 0.15;

  // LED and AC swap sliders
  const [ledCountToSwap, setLedCountToSwap] = useState(8);
  const [acSwapCount, setAcSwapCount] = useState(1);

  // Solar & Battery simulator sliders
  const [solarArea, setSolarArea] = useState(300); // sq ft
  const [batterySize, setBatterySize] = useState(10); // kWh

  // Voice Assistant states
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceReply, setVoiceReply] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  // Seed default appliances if none present
  useEffect(() => {
    if (user && (!user.appliances || user.appliances.length === 0)) {
      updateAppliances(SEED_APPLIANCES);
    }
  }, [user]);

  // Utility details for appliance calculations
  const getApplianceWatts = (name: string, rating: number): number => {
    const baseWatts: { [key: string]: number } = {
      'Air Conditioner': 1500,
      'Refrigerator': 300,
      'Induction Stove': 1800,
      'Lights': 40,
      'Television': 120,
      'Washing Machine': 500,
      'EV Charger': 7000
    };

    const base = baseWatts[name] || 500;
    // Higher star rating = lower consumption
    if (name === 'Air Conditioner') {
      return Math.round(base * (1.3 - 0.1 * rating));
    }
    if (name === 'Refrigerator') {
      return Math.round(base * (1.25 - 0.08 * rating));
    }
    if (name === 'Lights') {
      return rating === 5 ? 9 : Math.round(base * (1.2 - 0.1 * rating)); // LED bulbs switch
    }
    return base;
  };

  // Calculations for appliances inventory list
  const currentAppliances = user?.appliances || SEED_APPLIANCES;
  const calculateTotalEnergyStats = () => {
    let totalDailyKwh = 0;
    currentAppliances.forEach((app: any) => {
      const appWatts = getApplianceWatts(app.name, app.energyRating);
      const appDailyKwh = (app.quantity * app.hoursPerDay * appWatts) / 1000;
      totalDailyKwh += appDailyKwh;
    });

    const monthlyKwh = totalDailyKwh * 30;
    const monthlyCost = monthlyKwh * tariffRate;
    const monthlyCarbon = monthlyKwh * 0.5; // 0.5 kg CO2 per kWh

    return {
      dailyKwh: parseFloat(totalDailyKwh.toFixed(2)),
      monthlyKwh: parseFloat(monthlyKwh.toFixed(0)),
      monthlyCost: parseFloat(monthlyCost.toFixed(2)),
      monthlyCarbon: parseFloat(monthlyCarbon.toFixed(1))
    };
  };

  const currentStats = calculateTotalEnergyStats();

  // Swapping lighting systems savings (CFL/Incandescent to LED)
  const currentLights = currentAppliances.find((a: any) => a.name === 'Lights') || { quantity: 12, hoursPerDay: 8 };
  const maxLedsToSwap = Math.max(0, currentLights.quantity);
  const calculateLedSavings = () => {
    const hours = currentLights.hoursPerDay;
    // Standard old bulbs average 40W. LEDs average 9W. Savings = 31W per bulb.
    const wattsSaved = 31 * ledCountToSwap;
    const dailyKwhSaved = (wattsSaved * hours) / 1000;
    const monthlyKwhSaved = dailyKwhSaved * 30;
    const monthlySavingsCost = monthlyKwhSaved * tariffRate;
    const carbonSaved = monthlyKwhSaved * 0.5;

    // LED purchase cost estimate: ₹100 or $2 per bulb
    const investment = ledCountToSwap * (currency === 'INR' ? 120 : 2.5);
    const paybackMonths = monthlySavingsCost > 0 ? investment / monthlySavingsCost : 0;

    return {
      monthlySavingsCost: parseFloat(monthlySavingsCost.toFixed(2)),
      carbonSaved: parseFloat(carbonSaved.toFixed(1)),
      paybackMonths: parseFloat(paybackMonths.toFixed(1)),
      investment
    };
  };
  const ledSavings = calculateLedSavings();

  // Swapping standard AC units to Inverter 5-Star AC
  const currentAC = currentAppliances.find((a: any) => a.name === 'Air Conditioner') || { quantity: 1, hoursPerDay: 6, energyRating: 3 };
  const maxAcToSwap = Math.max(0, currentAC.quantity);
  const calculateAcSavings = () => {
    const hours = currentAC.hoursPerDay;
    // Standard 3-star AC uses ~1500W. 5-star Inverter AC uses ~950W. Savings = 550W per unit.
    const wattsSaved = 550 * acSwapCount;
    const dailyKwhSaved = (wattsSaved * hours) / 1000;
    const monthlyKwhSaved = dailyKwhSaved * 30;
    const monthlySavingsCost = monthlyKwhSaved * tariffRate;
    const carbonSaved = monthlyKwhSaved * 0.5;

    // Inverter AC cost estimate: ₹35,000 or $650 per unit
    const investment = acSwapCount * (currency === 'INR' ? 38000 : 700);
    const paybackMonths = monthlySavingsCost > 0 ? investment / monthlySavingsCost : 0;

    return {
      monthlySavingsCost: parseFloat(monthlySavingsCost.toFixed(2)),
      carbonSaved: parseFloat(carbonSaved.toFixed(1)),
      paybackMonths: parseFloat((paybackMonths / 12).toFixed(1)), // years
      investment
    };
  };
  const acSavings = calculateAcSavings();

  // Solar & Battery backup calculations
  const calculateSolarStats = () => {
    // 100 sq ft roughly hosts 1 kW solar peak capacity
    const solarCapacityKw = solarArea / 100;
    // Standard peak sun hours = 4.2 hours/day
    const dailyProductionKwh = solarCapacityKw * 4.2;
    const monthlyProductionKwh = dailyProductionKwh * 30;

    // Cap production at user's actual monthly usage
    const actualMonthlyOffloadKwh = Math.min(monthlyProductionKwh, currentStats.monthlyKwh);
    const monthlySavingsCost = actualMonthlyOffloadKwh * tariffRate;
    const carbonOffsetKg = monthlyProductionKwh * 0.5;

    // Solar system cost: ₹70,000 or $1200 per kW capacity
    const solarInvestment = solarCapacityKw * (currency === 'INR' ? 68000 : 1300);
    const paybackYears = monthlySavingsCost > 0 ? solarInvestment / (monthlySavingsCost * 12) : 0;

    // Battery calculations: average household hourly draw (kW)
    const avgHourlyDrawKw = currentStats.dailyKwh / 24;
    // Backup time in hours
    const backupHours = avgHourlyDrawKw > 0 ? batterySize / avgHourlyDrawKw : 0;

    // 25-Year cumulative savings
    const yearlySavings = monthlySavingsCost * 12;
    const timelineData = Array.from({ length: 26 }, (_, year) => {
      // 2% tariff rate inflation per year, 0.5% solar degradation
      let cumulativeSavings = 0;
      for (let i = 1; i <= year; i++) {
        const degradedProd = actualMonthlyOffloadKwh * Math.pow(0.995, i);
        const inflatedTariff = tariffRate * Math.pow(1.02, i);
        cumulativeSavings += degradedProd * 12 * inflatedTariff;
      }
      return {
        year: `Yr ${year}`,
        'Green Savings': Math.round(cumulativeSavings),
        'System Cost': Math.round(solarInvestment)
      };
    });

    return {
      capacityKw: parseFloat(solarCapacityKw.toFixed(1)),
      monthlyProductionKwh: Math.round(monthlyProductionKwh),
      monthlySavingsCost: parseFloat(monthlySavingsCost.toFixed(2)),
      carbonOffsetKg: parseFloat(carbonOffsetKg.toFixed(1)),
      investment: Math.round(solarInvestment),
      paybackYears: parseFloat(paybackYears.toFixed(1)),
      backupHours: parseFloat(backupHours.toFixed(1)),
      timelineData
    };
  };

  const solarStats = calculateSolarStats();

  // 12-Month bill projection data
  const get12MonthForecastData = () => {
    // Seasonal multiplier: peak in hot/cold months, baseline in spring/autumn
    const multipliers = [0.85, 0.90, 1.05, 1.20, 1.35, 1.30, 1.25, 1.20, 1.10, 0.95, 0.85, 0.80];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Subtract solar production if area size exists
    const solarDailyProd = (solarArea / 100) * 4.2;
    const solarMonthlyProd = solarDailyProd * 30;

    return multipliers.map((mult, idx) => {
      const grossKwh = currentStats.monthlyKwh * mult;
      const netKwh = Math.max(0, grossKwh - solarMonthlyProd);
      const grossCost = grossKwh * tariffRate;
      const netCost = netKwh * tariffRate;

      return {
        name: monthNames[idx],
        'Standard Bill': Math.round(grossCost),
        'With Solar Panels': Math.round(netCost)
      };
    });
  };

  const forecastData = get12MonthForecastData();

  // Drag and drop handlers
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

  const validateAndSetFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setScanError("Please upload a JPG, PNG, or PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setScanError("File is too large. Maximum size is 5MB.");
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

  // Run Bill Scan API handler
  const triggerBillScan = async (mockProviderPreset?: string) => {
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const endpoint = '/api/ai/scan-bill';
      const token = localStorage.getItem('carbonmind_token');

      // Create payload. If custom image loaded, pass base64
      const payload: any = {};
      if (previewUrl && !mockProviderPreset) {
        payload.image = previewUrl;
        payload.fileName = selectedFile?.name || null;
      } else {
        payload.image = null;
        payload.mockPreset = mockProviderPreset || null;
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
        throw new Error("Server billing processing failed.");
      }

      const data = await response.json();
      if (data.success) {
        setScanResult(data);
        // Log bill to updates stats (XP, level, coins, badges)
        await logBill(data);
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        throw new Error("AI could not read text indices from statement.");
      }
    } catch (err: any) {
      setScanError(err.message || "Failed to scan energy bill. Please confirm server state.");
    } finally {
      setIsScanning(false);
    }
  };

  // Voice coaching handler
  const handleVoiceQuery = (query: string) => {
    setVoiceQuery(query);
    setIsAnswering(true);

    setTimeout(() => {
      let reply = "";
      const lower = query.toLowerCase();

      if (lower.includes("improve")) {
        reply = `To improve your Home EcoScore of ${user?.homeEcoScore || 75}: 1) Swap older bulbs for LED lights (saves up to ${ledSavings.monthlySavingsCost} ${currency} monthly). 2) Swap standard cooling with Inverter 5-star ACs. 3) Reduce peak cooling hours.`;
      } else if (lower.includes("largest") || lower.includes("consuming")) {
        // Find largest consumer
        let largestName = "Air Conditioner";
        let largestVal = 0;
        currentAppliances.forEach((a: any) => {
          const appWatts = getApplianceWatts(a.name, a.energyRating);
          const totalVal = (a.quantity * a.hoursPerDay * appWatts) / 1000;
          if (totalVal > largestVal) {
            largestVal = totalVal;
            largestName = a.name;
          }
        });
        reply = `Your largest energy-consuming appliance is the ${largestName}, drawing approximately ${largestVal.toFixed(1)} kWh daily. Swapping older units with high-efficiency energy-star equivalents is recommended.`;
      } else if (lower.includes("solar") || lower.includes("offset")) {
        reply = `Installing a ${solarStats.capacityKw} kW solar panel array offsets approximately ${solarStats.carbonOffsetKg} kg of CO₂ monthly, which is equivalent to planting ${Math.round(solarStats.carbonOffsetKg / 22)} mature forest trees annually.`;
      } else {
        reply = "I'm your AI Home Energy consultant. You can ask me how to improve your score, find your largest energy load, or estimate solar savings.";
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

  // Handle changing appliance details
  const updateApplianceDetail = (appId: string, field: string, val: number) => {
    const updated = currentAppliances.map((app: any) => {
      if (app.id === appId) {
        return { ...app, [field]: val };
      }
      return app;
    });
    updateAppliances(updated);
  };

  const getAppIcon = (name: string) => {
    switch (name) {
      case 'Air Conditioner': return <Fan className="h-5 w-5 text-sky-500" />;
      case 'Refrigerator': return <Refrigerator className="h-5 w-5 text-indigo-500" />;
      case 'Lights': return <Lightbulb className="h-5 w-5 text-amber-500" />;
      case 'Television': return <Tv className="h-5 w-5 text-purple-500" />;
      default: return <Zap className="h-5 w-5 text-emerald-500" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto font-sans text-slate-800 dark:text-slate-200">
      
      {/* Premium Apple-inspired Glass Header */}
      <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500/20 to-teal-500/10 dark:from-amber-950/40 dark:to-teal-950/20 p-8 border border-amber-500/10 dark:border-amber-500/5 shadow-xl shadow-slate-100 dark:shadow-none">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 mb-3 border border-amber-500/20">
              <Zap className="h-3.5 w-3.5" /> AI Energy Intelligence
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Home Energy Intelligence Consultant
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Upload utility bills, build your appliance inventory, simulate green solar offset schemes, and unlock saving recommendations.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center gap-4 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md px-5 py-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">Home EcoScore</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  ⭐️ {user?.homeEcoScore || 75}/100 Rating
                </p>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md p-1 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 flex">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  currency === 'INR' ? 'bg-primary-500 text-white shadow-xs' : 'text-slate-450 hover:text-slate-700'
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  currency === 'USD' ? 'bg-primary-500 text-white shadow-xs' : 'text-slate-450 hover:text-slate-700'
                }`}
              >
                $ USD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 mb-8 overflow-x-auto gap-2">
        {[
          { id: 'dashboard', label: 'Energy Dashboard', icon: <Zap className="h-4.5 w-4.5" /> },
          { id: 'appliances', label: 'Appliance Inventory', icon: <Tv className="h-4.5 w-4.5" /> },
          { id: 'solar', label: 'Solar & Battery Simulator', icon: <Sun className="h-4.5 w-4.5" /> },
          { id: 'timeline', label: 'History Logs & Coaching', icon: <Clock className="h-4.5 w-4.5" /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === t.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Radial Score & Upload Section */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Radial circular Score indicator */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center text-center">
              <h3 className="text-sm font-bold text-slate-450 uppercase tracking-wider mb-6">Home EcoScore</h3>
              <div className="relative h-40 w-40 flex items-center justify-center mb-4">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" strokeLinecap="round" className="stroke-slate-100 dark:stroke-zinc-800" strokeWidth="8" fill="transparent" />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    strokeLinecap="round"
                    className="stroke-amber-500"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 70}
                    initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - (user?.homeEcoScore || 75) / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">{user?.homeEcoScore || 75}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Eco Index</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-2 px-4 leading-relaxed">
                Your score is based on appliance star energy ratings and monthly utility levels.
              </p>
            </div>

            {/* Bill Upload Section */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Upload Utility Bill</h2>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('bill-file-input')?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragActive ? 'border-primary-500 bg-primary-500/5' : 'border-slate-300 dark:border-zinc-700 hover:border-primary-400'
                }`}
              >
                <input
                  id="bill-file-input"
                  type="file"
                  onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
                  className="hidden"
                  accept="image/jpeg,image/png,application/pdf"
                />

                {previewUrl ? (
                  <div className="relative group overflow-hidden rounded-xl aspect-[3/4] bg-slate-50 dark:bg-zinc-800 flex items-center justify-center">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-full">Change File</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-slate-400 mb-4" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Drag & Drop utility statement</p>
                    <p className="text-[10px] text-slate-450 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                  </div>
                )}
              </div>

              {scanError && (
                <div className="mt-4 p-3 bg-rose-500/10 text-rose-600 rounded-xl border border-rose-500/10 text-xs flex gap-2 items-center">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}

              <button
                onClick={() => triggerBillScan()}
                disabled={isScanning || !previewUrl}
                className="w-full mt-4 py-3.5 px-4 rounded-xl font-bold text-sm bg-primary-500 text-white hover:bg-primary-600 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isScanning ? <><RefreshCw className="h-4 w-4 animate-spin" /> Scanning...</> : <><Sparkles className="h-4 w-4" /> Scan Utility Statement</>}
              </button>
            </div>

            {/* Simulated preset quick loaders */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xs">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" /> Presets (Quick Scan Mock)
              </h3>
              <div className="space-y-3">
                {[
                  { name: "BESCOM Bangalore - Summer Bill", provider: "BESCOM", desc: "245 kWh, ₹1,960.00" },
                  { name: "Tata Power Mumbai - High Load", provider: "Tata Power", desc: "360 kWh, ₹3,240.00" },
                  { name: "PG&E San Francisco - US Tariff", provider: "PG&E", desc: "410 kWh, $61.50" }
                ].map(p => (
                  <button
                    key={p.provider}
                    disabled={isScanning}
                    onClick={() => triggerBillScan(p.provider)}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-100 hover:border-primary-400 dark:border-zinc-800 dark:hover:border-primary-400/50 bg-slate-50/50 dark:bg-zinc-850/50 hover:bg-white dark:hover:bg-zinc-900 active:scale-98 transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.name}</p>
                      <p className="text-[10px] text-slate-450 mt-0.5">{p.desc}</p>
                    </div>
                    <Plus className="h-4 w-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right panel: KPIs and Recharts predictions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* OCR Laser Scanner animation panel */}
            {isScanning && (
              <div className="bg-slate-900 rounded-3xl p-8 relative flex flex-col items-center justify-center min-h-[350px] border border-zinc-800 shadow-xl overflow-hidden">
                <div className="w-56 aspect-[3/4] bg-white rounded-lg shadow-inner relative flex flex-col p-4 overflow-hidden border border-slate-200">
                  <div className="w-16 h-3 bg-slate-200 rounded mx-auto mb-4" />
                  <div className="w-full h-1 bg-dashed border-b border-slate-200 mb-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between"><div className="w-20 h-2 bg-slate-100 rounded" /><div className="w-8 h-2 bg-slate-100 rounded" /></div>
                    <div className="flex justify-between"><div className="w-24 h-2 bg-slate-100 rounded" /><div className="w-8 h-2 bg-slate-100 rounded" /></div>
                    <div className="flex justify-between"><div className="w-16 h-2 bg-slate-100 rounded" /><div className="w-8 h-2 bg-slate-100 rounded" /></div>
                  </div>
                </div>
                
                {/* Laser overlay animation */}
                <motion.div
                  initial={{ y: '20%' }}
                  animate={{ y: '220%' }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-85 shadow-[0_0_10px_rgba(245,158,11,0.8)] pointer-events-none"
                  style={{ width: '100%', top: 0 }}
                />

                <p className="text-white font-bold text-lg mt-6">Parsing utility statements...</p>
                <p className="text-slate-400 text-xs mt-1">Extracting consumption values and tariff plan records</p>
              </div>
            )}

            {/* Scan Success Box */}
            <AnimatePresence mode="wait">
              {scanResult && !isScanning && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 p-6 rounded-3xl flex items-start gap-4"
                >
                  <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Statement Scanned Successfully!</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <span className="text-[10px] text-slate-450 uppercase font-bold">Utility Provider</span>
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">{scanResult.provider}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-450 uppercase font-bold">Units Consumed</span>
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">{scanResult.unitsConsumed} kWh</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-450 uppercase font-bold">Bill Total</span>
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">
                          {scanResult.currency} {scanResult.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-450 uppercase font-bold">Carbon Impact</span>
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">{scanResult.carbonFootprintKg} kg CO₂</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dashboard KPIs based on appliance list */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Monthly Draw', val: `${currentStats.monthlyKwh} kWh`, sub: 'Estimated load', icon: <Zap className="h-5 w-5" />, color: 'text-amber-500 bg-amber-500/10' },
                { label: 'Estimated Bill', val: `${currency === 'INR' ? '₹' : '$'}${currentStats.monthlyCost}`, sub: `Tariff ${currency === 'INR' ? '₹8' : '$0.15'}/kWh`, icon: <DollarSign className="h-5 w-5" />, color: 'text-emerald-500 bg-emerald-500/10' },
                { label: 'Carbon footprint', val: `${currentStats.monthlyCarbon} kg`, sub: 'CO₂ emissions', icon: <AlertCircle className="h-5 w-5" />, color: 'text-rose-500 bg-rose-500/10' },
                { label: 'Forest absorption', val: `${(currentStats.monthlyCarbon / 22).toFixed(1)} trees`, sub: 'Equivalent forest land', icon: <CheckCircle className="h-5 w-5" />, color: 'text-teal-500 bg-teal-500/10' }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-xs">
                  <div className="flex justify-between items-start">
                    <div className={`p-2 rounded-xl ${kpi.color}`}>{kpi.icon}</div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-4">{kpi.val}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* 12-Month Bill projection forecast chart */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">12-Month Cost Forecast Projections</h3>
                  <p className="text-xs text-slate-400 mt-1">Calculates billing fluctuations with seasonal weather modifiers</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <TrendingUp className="h-3.5 w-3.5" /> Projected Savings
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-zinc-800/80" />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} stroke="#94a3b8" />
                    <YAxis fontSize={11} tickLine={false} stroke="#94a3b8" unit={currency === 'INR' ? '₹' : '$'} />
                    <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar dataKey="Standard Bill" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="With Solar Panels" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: APPLIANCE INVENTORY */}
      {activeTab === 'appliances' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Appliances list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6">Household Appliance Inventory</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentAppliances.map((app: any) => {
                  const currentWatts = getApplianceWatts(app.name, app.energyRating);
                  const dailyKwh = ((app.quantity * app.hoursPerDay * currentWatts) / 1000).toFixed(2);
                  const costVal = (parseFloat(dailyKwh) * 30 * tariffRate).toFixed(2);

                  return (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 space-y-4 hover:border-amber-500/20 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                            {getAppIcon(app.name)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{app.name}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Rating: {currentWatts}W draw</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-950 dark:text-slate-200">{dailyKwh} kWh/day</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{currency === 'INR' ? '₹' : '$'}{costVal}/mo</p>
                        </div>
                      </div>

                      {/* Sliders grid */}
                      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                        {/* Qty & Hours */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1.5">Quantity: {app.quantity}</label>
                            <input
                              type="range"
                              min="0"
                              max="30"
                              value={app.quantity}
                              onChange={(e) => updateApplianceDetail(app.id, 'quantity', parseInt(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1.5">Hours/Day: {app.hoursPerDay}</label>
                            <input
                              type="range"
                              min="1"
                              max="24"
                              value={app.hoursPerDay}
                              onChange={(e) => updateApplianceDetail(app.id, 'hoursPerDay', parseInt(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                            />
                          </div>
                        </div>

                        {/* Rating & Age */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1.5">Star Rating: {app.energyRating}★</label>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={app.energyRating}
                              onChange={(e) => updateApplianceDetail(app.id, 'energyRating', parseInt(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1.5">Age: {app.ageOfAppliance} yrs</label>
                            <input
                              type="range"
                              min="0"
                              max="15"
                              value={app.ageOfAppliance}
                              onChange={(e) => updateApplianceDetail(app.id, 'ageOfAppliance', parseInt(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel: Before / After Swap Simulators */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* LED Bulbs swap tool */}
            <div className="bg-gradient-to-br from-amber-500/10 to-teal-500/5 dark:from-amber-950/20 dark:to-teal-950/10 border border-amber-500/10 dark:border-amber-500/5 rounded-3xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                <Lightbulb className="h-5 w-5" /> CFL / Incandescent to LED swap
              </h3>
              <p className="text-xs text-slate-400 mb-6 font-medium">
                Standard halogen/CFL bulbs draw up to 40W. Replacing them with 9W LEDs drops light load carbon footprints by 78%.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase mb-2">Number of bulbs to upgrade: {ledCountToSwap}</label>
                <input
                  type="range"
                  min="1"
                  max={maxLedsToSwap || 20}
                  value={ledCountToSwap}
                  onChange={(e) => setLedCountToSwap(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Savings metrics card */}
              <div className="mt-6 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md p-4 rounded-2xl border border-amber-500/10 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-450 font-semibold">Monthly Cost Savings</span>
                  <span className="font-black text-slate-800 dark:text-white">
                    {currency === 'INR' ? '₹' : '$'}{ledSavings.monthlySavingsCost}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-450 font-semibold">Carbon Emissions Reduced</span>
                  <span className="font-black text-emerald-500">-{ledSavings.carbonSaved} kg CO₂ / mo</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-450 font-semibold">Est Payback Period</span>
                  <span className="font-black text-slate-800 dark:text-white">{ledSavings.paybackMonths} Months</span>
                </div>
              </div>
            </div>

            {/* AC Swap tool */}
            <div className="bg-gradient-to-br from-sky-500/10 to-teal-500/5 dark:from-sky-950/20 dark:to-teal-950/10 border border-sky-500/10 dark:border-sky-500/5 rounded-3xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-sky-700 dark:text-sky-400 mb-2 flex items-center gap-1.5">
                <Fan className="h-5 w-5" /> 3-Star AC to 5-Star Inverter AC swap
              </h3>
              <p className="text-xs text-slate-400 mb-6 font-medium">
                Replacing traditional single-speed compressors with dynamic variable inverters reduces power demands by 35%.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase mb-2">Number of AC units: {acSwapCount}</label>
                <input
                  type="range"
                  min="1"
                  max={maxAcToSwap || 4}
                  value={acSwapCount}
                  onChange={(e) => setAcSwapCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>

              {/* Savings metrics card */}
              <div className="mt-6 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md p-4 rounded-2xl border border-sky-500/10 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-450 font-semibold">Monthly Cost Savings</span>
                  <span className="font-black text-slate-800 dark:text-white">
                    {currency === 'INR' ? '₹' : '$'}{acSavings.monthlySavingsCost}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-450 font-semibold">Carbon Emissions Reduced</span>
                  <span className="font-black text-emerald-500">-{acSavings.carbonSaved} kg CO₂ / mo</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-450 font-semibold">Est Payback Period</span>
                  <span className="font-black text-slate-800 dark:text-white">{acSavings.paybackMonths} Years</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT: SOLAR & BATTERY SIMULATOR */}
      {activeTab === 'solar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Sliders */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Simulator Inputs</h2>
              
              {/* Solar Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-450 uppercase flex items-center gap-1">
                    <Sun className="h-4 w-4 text-amber-500" /> Rooftop solar area
                  </label>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{solarArea} sq ft</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1200"
                  step="50"
                  value={solarArea}
                  onChange={(e) => setSolarArea(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-[10px] text-slate-400">Equivalent peak solar capacity: <span className="font-bold text-slate-700 dark:text-slate-350">{solarStats.capacityKw} kW</span></p>
              </div>

              {/* Battery Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-450 uppercase flex items-center gap-1">
                    <Battery className="h-4 w-4 text-emerald-500" /> Battery backup size
                  </label>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{batterySize} kWh</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="2"
                  value={batterySize}
                  onChange={(e) => setBatterySize(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[10px] text-slate-400">Backs up essential household loads for <span className="font-bold text-slate-700 dark:text-slate-350">{solarStats.backupHours} hours</span></p>
              </div>
            </div>

            {/* Calculations summaries */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financial & Eco ROI</h3>
              
              <div className="space-y-3.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-450">Est Installation cost</span>
                  <span className="text-slate-900 dark:text-white">
                    {currency === 'INR' ? '₹' : '$'}{solarStats.investment.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-450">Monthly Savings on Bill</span>
                  <span className="text-emerald-500">
                    +{currency === 'INR' ? '₹' : '$'}{solarStats.monthlySavingsCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-450">ROI Payback Period</span>
                  <span className="text-slate-900 dark:text-white">{solarStats.paybackYears} Years</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-450">Carbon Offload Offset</span>
                  <span className="text-emerald-500">-{solarStats.carbonOffsetKg} kg CO₂ / mo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Recharts cumulative savings graph */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">25-Year Cumulative Savings Projection</h3>
              
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={solarStats.timelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-zinc-800/80" />
                    <XAxis dataKey="year" fontSize={11} tickLine={false} stroke="#94a3b8" />
                    <YAxis fontSize={11} tickLine={false} stroke="#94a3b8" unit={currency === 'INR' ? '₹' : '$'} />
                    <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Area type="monotone" dataKey="Green Savings" stroke="#10b981" fillOpacity={0.15} fill="url(#colorSavings)" />
                    <defs>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Smart info panel */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-l-4 border-emerald-500 p-5 rounded-r-2xl">
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                <Shield className="h-4.5 w-4.5" /> Grid Resilience Guard Advice
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Combining a {solarStats.capacityKw} kW solar framework with a {batterySize} kWh backup reserve protects your home against peak utility rates, guarantees continuous power during outages, and speeds up return-on-investment timelines.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: TIMELINE LOGS */}
      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Voice assistant coach */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-amber-500/10 to-teal-500/5 dark:from-amber-950/20 dark:to-teal-950/10 border border-amber-500/10 dark:border-amber-500/5 rounded-3xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                <Volume2 className="h-5 w-5" /> AI voice energy coach
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Ask simple queries about household carbon footprint levels:
              </p>

              <div className="grid grid-cols-1 gap-2">
                {[
                  "How can I improve my Home EcoScore?",
                  "What is my largest energy-consuming appliance?",
                  "How much carbon will solar panels offset?"
                ].map((q, i) => (
                  <button
                    key={i}
                    disabled={isAnswering}
                    onClick={() => handleVoiceQuery(q)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:bg-white hover:border-amber-500 transition-all flex items-center justify-between"
                  >
                    <span>{q}</span>
                    <Volume2 className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))}
              </div>

              {voiceQuery && (
                <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-500/10">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">You asked</p>
                  <p className="text-xs text-slate-750 italic">"{voiceQuery}"</p>
                  <p className="text-[10px] font-bold uppercase text-amber-500 tracking-wide mt-3">AI Coach Answer</p>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed mt-0.5">
                    {isAnswering ? "Formulating recommendation..." : voiceReply}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Log timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6">Historical Utility Logs</h2>
              
              {!user?.bills || user.bills.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No statement history logged yet</p>
                  <p className="text-xs text-slate-450 mt-1">Upload an electricity bill in the dashboard tab to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.bills.map((bill: any) => (
                    <div
                      key={bill.id}
                      className="p-5 rounded-2xl border border-slate-100 dark:border-zinc-850 hover:border-amber-500/20 bg-slate-50/50 dark:bg-zinc-900/40 flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{bill.provider}</span>
                          <span className="text-[10px] text-slate-450 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{bill.billingPeriod}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 text-[10px] text-slate-400 font-semibold">
                          <span>Units: {bill.unitsConsumed} kWh</span>
                          <span>Bill: {bill.currency} {bill.totalAmount.toFixed(2)}</span>
                          <span>Carbon: {bill.carbonFootprintKg} kg CO₂</span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteBill(bill.id)}
                        className="p-2.5 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all active:scale-95"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default EnergyIntelligence;
