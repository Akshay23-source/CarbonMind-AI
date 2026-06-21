import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  Upload,
  FileText,
  Camera,
  CheckCircle,
  AlertCircle,
  Trash2,
  Download,
  Star,
  Search,
  Filter,
  Volume2,
  ArrowLeftRight,
  ShoppingBag,
  Award,
  Droplet,
  Coins,
  Sparkles,
  TreeDeciduous,
  Leaf,
  RefreshCw,
  Clock,
  ExternalLink,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const ReceiptScanner: React.FC = () => {
  const { user, logReceipt, deleteReceipt, toggleFavorite } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scanner' | 'forest' | 'history' | 'basket'>('scanner');
  
  // Search & Filters for Receipt History
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilterStore, setHistoryFilterStore] = useState('all');
  const [historySortBy, setHistorySortBy] = useState<'date-desc' | 'date-asc' | 'carbon-desc' | 'carbon-asc'>('date-desc');
  
  // Compare Receipts
  const [compareAId, setCompareAId] = useState<string>('');
  const [compareBId, setCompareBId] = useState<string>('');
  const [isComparing, setIsComparing] = useState(false);

  // Voice Assistant State
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceReply, setVoiceReply] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag over handler
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  // Input change handler
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setOcrError("Please upload a JPG, PNG, or PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setOcrError("File is too large. Maximum size is 5MB.");
      return;
    }
    setOcrError(null);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Trigger OCR scan process
  const triggerScan = async (mockSelection?: number) => {
    setIsScanning(true);
    setOcrError(null);
    setScanResult(null);

    try {
      const endpoint = '/api/ai/scan-receipt';
      const token = localStorage.getItem('carbonmind_token');
      
      let payload: any = {};
      
      // If client uploads custom image file, encode as base64
      if (previewUrl && mockSelection === undefined) {
        payload.image = previewUrl;
        payload.fileName = selectedFile?.name || null;
      } else {
        // Trigger a specific template selection index
        payload.image = null;
        payload.mockSelection = mockSelection !== undefined ? mockSelection : null;
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
        throw new Error("OCR Processing request failed.");
      }

      const data = await response.json();
      if (data.success) {
        setScanResult(data);
        // Log receipt to updates stats (XP, level, coins, badges)
        await logReceipt(data);
      } else {
        throw new Error("OCR could not read details from receipt.");
      }
    } catch (err: any) {
      setOcrError(err.message || "Failed to scan receipt. Please check server connections.");
    } finally {
      setIsScanning(false);
    }
  };

  // Voice Assistant Questions
  const handleVoiceQuery = (query: string) => {
    setVoiceQuery(query);
    setIsAnswering(true);

    setTimeout(() => {
      let reply = "";
      if (query.includes("sustainable")) {
        const latest = user?.receipts?.[0];
        if (latest) {
          reply = `Your last shopping trip at ${latest.storeName} scored a ${latest.summary.averageEcoScore}. You bought ${latest.summary.greenPurchasesCount} green items and ${latest.summary.highCarbonPurchasesCount} high-carbon items.`;
        } else {
          reply = "You haven't scanned any grocery receipts yet! Upload a receipt to analyze your shopping sustainability.";
        }
      } else if (query.includes("highest")) {
        const latest = user?.receipts?.[0];
        if (latest && latest.extractedItems) {
          const high = [...latest.extractedItems].sort((a: any, b: any) => b.carbonFootprintKg - a.carbonFootprintKg)[0];
          if (high) {
            reply = `The highest carbon emitter was "${high.name}" producing ${high.carbonFootprintKg}kg CO₂. Swapping it for "${high.alternative.name}" next time will save ${high.alternative.carbonSavedKg}kg CO₂.`;
          }
        } else {
          reply = "Scan a receipt first to identify your highest carbon items.";
        }
      } else if (query.includes("replace")) {
        const latest = user?.receipts?.[0];
        if (latest && latest.extractedItems) {
          const targets = latest.extractedItems.filter((i: any) => ['D', 'E', 'F'].includes(i.ecoRating));
          if (targets.length > 0) {
            reply = `Consider replacing: ${targets.map((t: any) => `"${t.name}" with "${t.alternative.name}"`).join(', ')}. This would reduce single-use plastic waste significantly.`;
          } else {
            reply = "Excellent work! Your recent basket has zero high-carbon items. Keep shopping organically!";
          }
        } else {
          reply = "No receipt scanned yet. Please upload a receipt and I'll suggest replacement swaps.";
        }
      } else {
        reply = "I'm your AI Shopping Coach. You can ask me how sustainable your shopping was, which items emitted the most carbon, or what to replace next time.";
      }
      setVoiceReply(reply);
      setIsAnswering(false);
      
      // Text to Speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(reply);
        window.speechSynthesis.speak(utterance);
      }
    }, 1200);
  };

  // Generate downloadable receipt certificate
  const downloadCertificate = (receipt: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
      <head>
        <title>CarbonReceipt Certificate - ${receipt.storeName}</title>
        <style>
          body {
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .certificate {
            width: 100%;
            max-width: 600px;
            background: white;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.06);
            border: 8px solid #10b981;
            padding: 40px;
            text-align: center;
            position: relative;
          }
          .header {
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            margin-bottom: 10px;
          }
          .title {
            font-size: 28px;
            font-weight: 800;
            color: #065f46;
            margin: 0 0 10px 0;
            letter-spacing: -0.5px;
          }
          .subtitle {
            font-size: 14px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 700;
          }
          .recipient {
            font-size: 20px;
            font-weight: 600;
            margin: 30px 0;
          }
          .store {
            color: #10b981;
            font-weight: 800;
          }
          .score-badge {
            display: inline-block;
            background: #ecfdf5;
            color: #047857;
            font-size: 64px;
            font-weight: 900;
            padding: 20px 40px;
            border-radius: 30px;
            border: 3px solid #a7f3d0;
            margin: 20px 0;
          }
          .metrics {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
            background: #f1f5f9;
            padding: 20px;
            border-radius: 16px;
          }
          .metric-item {
            text-align: center;
          }
          .metric-value {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
          }
          .metric-label {
            font-size: 12px;
            color: #64748b;
            margin-top: 5px;
          }
          .footer {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="logo">🌱</div>
            <div class="title">CarbonMind AI</div>
            <div class="subtitle">Sustainability Shopping Certificate</div>
          </div>
          <div class="recipient">
            This certifies that <strong>${user?.displayName || 'Eco Hero'}</strong> shopping trip at <span class="store">${receipt.storeName}</span> met high ecological standards.
          </div>
          <div>
            <div class="subtitle">Receipt EcoScore</div>
            <div class="score-badge">${receipt.summary.averageEcoScore}</div>
          </div>
          <div class="metrics">
            <div class="metric-item">
              <div class="metric-value">${receipt.summary.totalCarbonKg} kg</div>
              <div class="metric-label">CO₂ Footprint</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${receipt.summary.totalWaterL} L</div>
              <div class="metric-label">Water Consumed</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${receipt.summary.totalPlasticG} g</div>
              <div class="metric-label">Plastic Packaging</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${receipt.summary.treesRequired} trees</div>
              <div class="metric-label">Forest Absorption Equivalency</div>
            </div>
          </div>
          <div class="footer">
            Generated on ${new Date(receipt.timestamp).toLocaleDateString()} &bull; Certificate ID: ${receipt.id.toUpperCase()}<br/>
            CarbonMind AI &bull; Small Actions. Massive Impact.
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Compare selected receipts
  const handleCompare = () => {
    if (!compareAId || !compareBId) return;
    setIsComparing(true);
  };

  const receiptA = user?.receipts?.find(r => r.id === compareAId);
  const receiptB = user?.receipts?.find(r => r.id === compareBId);

  // Filter receipt list
  const filteredReceipts = (user?.receipts || [])
    .filter(r => {
      const matchesSearch = r.storeName.toLowerCase().includes(historySearch.toLowerCase()) || r.receiptNumber.toLowerCase().includes(historySearch.toLowerCase());
      const matchesStore = historyFilterStore === 'all' || r.storeName === historyFilterStore;
      return matchesSearch && matchesStore;
    })
    .sort((a, b) => {
      if (historySortBy === 'date-desc') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (historySortBy === 'date-asc') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (historySortBy === 'carbon-desc') return b.summary.totalCarbonKg - a.summary.totalCarbonKg;
      if (historySortBy === 'carbon-asc') return a.summary.totalCarbonKg - b.summary.totalCarbonKg;
      return 0;
    });

  // Get unique list of stores
  const storeNames = Array.from(new Set((user?.receipts || []).map(r => r.storeName)));

  // Calculate packaging pie chart data
  const getPackagingPieData = (receipt: any) => {
    if (!receipt || !receipt.summary || !receipt.summary.packagingBreakdown) return [];
    const pk = receipt.summary.packagingBreakdown;
    return [
      { name: 'Plastic', value: pk.plastic, color: '#f59e0b' },
      { name: 'Paper/Cardboard', value: pk.paper, color: '#10b981' },
      { name: 'Aluminum', value: pk.aluminum || 0, color: '#3b82f6' },
      { name: 'Other', value: pk.other || 0, color: '#64748b' }
    ].filter(d => d.value > 0);
  };

  return (
    <div className="w-full max-w-7xl mx-auto font-sans text-slate-800 dark:text-slate-200">
      
      {/* Premium Glass Header banner */}
      <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-500/20 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/20 p-8 border border-emerald-500/10 dark:border-emerald-500/5 shadow-xl shadow-slate-100 dark:shadow-none">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 mb-3 border border-emerald-500/20">
              <Sparkles className="h-3.5 w-3.5" /> AI Receipt Scanner
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
               world's Smartest Receipt Scanner
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Upload your grocery bill. Instantly analyze carbon footprint, plastic, and water outputs with Gemini Vision.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md px-5 py-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TreeDeciduous className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">Shopping Forest</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                🌲 {user?.shoppingForestTrees || 0} Trees Grown
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 mb-8 overflow-x-auto gap-2">
        {[
          { id: 'scanner', label: 'Receipt OCR Scanner', icon: <Upload className="h-4.5 w-4.5" /> },
          { id: 'forest', label: 'Virtual Forest', icon: <TreeDeciduous className="h-4.5 w-4.5" /> },
          { id: 'history', label: 'Receipt History Logs', icon: <Clock className="h-4.5 w-4.5" /> },
          { id: 'basket', label: 'AI Weekly Eco Basket', icon: <ShoppingBag className="h-4.5 w-4.5" /> }
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

      {/* TAB CONTENT: SCANNER */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Upload Area & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xs relative overflow-hidden">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Upload grocery receipt
              </h2>

              {/* Drag n Drop upload box */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-primary-500 bg-primary-500/5'
                    : 'border-slate-300 dark:border-zinc-700 hover:border-primary-400 dark:hover:border-primary-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInput}
                  className="hidden"
                  accept="image/jpeg,image/png,application/pdf"
                />

                {previewUrl ? (
                  <div className="relative group overflow-hidden rounded-xl aspect-[3/4] bg-slate-50 dark:bg-zinc-800 flex items-center justify-center">
                    {selectedFile?.type === 'application/pdf' ? (
                      <div className="flex flex-col items-center">
                        <FileText className="h-16 w-16 text-slate-400 mb-2" />
                        <span className="text-xs font-semibold text-slate-500">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-full">
                        Change File
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-zinc-850 flex items-center justify-center text-slate-400 dark:text-zinc-550 border border-slate-100 dark:border-zinc-800 mb-4">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Drag & Drop receipt or <span className="text-primary-500 hover:underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-450 mt-1.5">
                      Supports JPG, PNG, PDF (Max 5MB)
                    </p>
                  </div>
                )}
              </div>

              {ocrError && (
                <div className="mt-4 p-3.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/10 text-xs flex gap-2.5 items-center">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{ocrError}</span>
                </div>
              )}

              {/* Scan Trigger buttons */}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => triggerScan()}
                  disabled={isScanning || !previewUrl}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-primary-500 text-white hover:bg-primary-600 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Scanning receipt...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Run AI Receipt Scanner
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-400 font-medium">
                  Secure processing. Submissions encrypted and auto-analyzed by Gemini 1.5 Flash Vision.
                </p>
              </div>
            </div>

            {/* Quick-Scan Simulation Presets */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-amber-500" /> Presets (Quick Mock Validation)
              </h3>
              <p className="text-xs text-slate-400 mb-4 font-medium">
                Don't have a grocery receipt handy? Instantly load one of our predefined receipt templates to verify OCR logic, calculations, XP rewards, and alternative suggestions.
              </p>
              <div className="space-y-3">
                {[
                  { name: "Supermarket - Uploaded Bill", idx: 0, desc: "Eggs, Milk, Cottage Cheese, Yogurt, etc. ($52.79)" },
                  { name: "Trader Joe's - Organic Basket", idx: 1, desc: "Vegan milk, avocados, bananas, paper towels" },
                  { name: "Whole Foods - High Carbon", idx: 2, desc: "Prime ribeye steak, water pack, plastic bags" },
                  { name: "Target - Mixed Shopping", idx: 3, desc: "Chicken, veggies, milk, cleaning wipes" }
                ].map(p => (
                  <button
                    key={p.idx}
                    disabled={isScanning}
                    onClick={() => triggerScan(p.idx)}
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

            {/* Voice Assistant Panel */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 dark:from-indigo-950/20 dark:to-purple-950/10 border border-indigo-500/10 dark:border-indigo-500/5 rounded-3xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                <Volume2 className="h-4.5 w-4.5" /> AI voice shopping assistant
              </h3>
              <p className="text-xs text-slate-400 mb-4 font-medium">
                Ask simple queries about your receipt using natural language.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "How sustainable was my shopping?",
                  "Which item caused the highest emissions?",
                  "What should I replace next time?"
                ].map((q, i) => (
                  <button
                    key={i}
                    disabled={isAnswering}
                    onClick={() => handleVoiceQuery(q)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white hover:border-indigo-400 dark:hover:border-indigo-400 transition-all flex items-center justify-between"
                  >
                    <span>{q}</span>
                    <Volume2 className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))}
              </div>

              {voiceQuery && (
                <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-500/10">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">You asked</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic mt-0.5">"{voiceQuery}"</p>
                  <p className="text-[10px] font-bold uppercase text-indigo-500 tracking-wide mt-3">AI Coach Answer</p>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium mt-0.5 leading-relaxed">
                    {isAnswering ? "Typing..." : voiceReply}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Results Output & Laser Scanning Screen */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* OCR Laser Scanner Interface */}
            {isScanning && (
              <div className="bg-slate-900 rounded-3xl p-8 relative flex flex-col items-center justify-center min-h-[400px] border border-zinc-800 shadow-xl overflow-hidden">
                {/* Simulated Receipt paper layout */}
                <div className="w-64 aspect-[3/4] bg-white rounded-lg shadow-inner relative flex flex-col p-4 overflow-hidden border border-slate-200">
                  <div className="w-16 h-4 bg-slate-200 rounded mx-auto mb-4" />
                  <div className="w-full h-1 bg-dashed border-b border-slate-200 mb-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between"><div className="w-20 h-3 bg-slate-100 rounded" /><div className="w-8 h-3 bg-slate-100 rounded" /></div>
                    <div className="flex justify-between"><div className="w-24 h-3 bg-slate-100 rounded" /><div className="w-8 h-3 bg-slate-100 rounded" /></div>
                    <div className="flex justify-between"><div className="w-16 h-3 bg-slate-100 rounded" /><div className="w-8 h-3 bg-slate-100 rounded" /></div>
                  </div>
                </div>

                {/* Laser scan lines effect */}
                <motion.div
                  initial={{ y: '20%' }}
                  animate={{ y: '220%' }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80 shadow-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] pointer-events-none"
                  style={{ width: '100%', top: 0 }}
                />

                <p className="text-white font-bold text-lg mt-6">Reading grocery receipt OCR...</p>
                <p className="text-slate-400 text-xs mt-1">Normalizing item names & evaluating lifecycle carbon footprint</p>
              </div>
            )}

            {/* Results Panel */}
            <AnimatePresence mode="wait">
              {scanResult && !isScanning && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Shopping summary KPIs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Total Carbon",
                        value: `${scanResult.summary.totalCarbonKg} kg`,
                        desc: "CO₂ emitted",
                        icon: <Leaf className="h-5 w-5" />,
                        color: "text-emerald-500 bg-emerald-500/10"
                      },
                      {
                        label: "Eco Rating",
                        value: scanResult.summary.averageEcoScore,
                        desc: "Average rating",
                        icon: <Award className="h-5 w-5" />,
                        color: `${
                          ['A+', 'A', 'B'].includes(scanResult.summary.averageEcoScore)
                            ? 'text-emerald-500 bg-emerald-500/10'
                            : 'text-amber-500 bg-amber-500/10'
                        }`
                      },
                      {
                        label: "Water Footprint",
                        value: `${scanResult.summary.totalWaterL} L`,
                        desc: "Total usage",
                        icon: <Droplet className="h-5 w-5" />,
                        color: "text-blue-500 bg-blue-500/10"
                      },
                      {
                        label: "Plastic Waste",
                        value: `${scanResult.summary.totalPlasticG} g`,
                        desc: "Packaging wrap",
                        icon: <ShoppingBag className="h-5 w-5" />,
                        color: "text-orange-500 bg-orange-500/10"
                      }
                    ].map((kpi, idx) => (
                      <div key={idx} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-xs">
                        <div className="flex justify-between items-start">
                          <div className={`p-2.5 rounded-xl ${kpi.color}`}>
                            {kpi.icon}
                          </div>
                          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">{kpi.label}</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-4">{kpi.value}</p>
                        <p className="text-xs text-slate-400 mt-1">{kpi.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI insights box */}
                  <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-l-4 border-emerald-500 p-5 rounded-r-2xl">
                    <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                      <Sparkles className="h-4.5 w-4.5" /> AI Shopping Insights
                    </h3>
                    <div className="space-y-2.5">
                      {scanResult.insights.map((insight: string, idx: number) => (
                        <p key={idx} className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                          &bull; {insight}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Receipt Header details & PDF export */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {scanResult.storeName}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400 font-medium mt-1">
                        <span>Receipt ID: {scanResult.receiptNumber}</span>
                        <span>Date: {scanResult.date}</span>
                        <span>Time: {scanResult.time}</span>
                        <span>Language: {scanResult.language} (Auto-detected)</span>
                        <span>Confidence: {Math.round(scanResult.confidenceScore * 100)}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => downloadCertificate(scanResult)}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5 active:scale-97 transition-all shadow-xs"
                    >
                      <Download className="h-4 w-4" /> Download Certificate
                    </button>
                  </div>

                  {/* List of items */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      Extracted Purchased items ({scanResult.extractedItems.length})
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scanResult.extractedItems.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl hover:border-primary-400 dark:hover:border-primary-500/50 shadow-xs transition-all relative overflow-hidden group"
                        >
                          {/* EcoScore floating badge */}
                          <div className="absolute top-4 right-4 flex items-center gap-2">
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-sm shadow-xs ${
                              ['A+', 'A', 'B'].includes(item.ecoRating)
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900'
                                : 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900'
                            }`}>
                              {item.ecoRating}
                            </span>
                          </div>

                          <span className="inline-block text-[10px] font-bold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full mb-2">
                            {item.category}
                          </span>

                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 pr-10">
                            {item.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 italic">
                            Originally: "{item.originalName}"
                          </p>

                          <div className="flex gap-4 text-xs text-slate-450 mt-4 font-semibold border-t border-slate-100 dark:border-zinc-800 pt-3">
                            <span>Qty: {item.quantity}</span>
                            <span>Price: ${item.price.toFixed(2)}</span>
                          </div>

                          {/* Carbon & Water impacts */}
                          <div className="grid grid-cols-3 gap-2 mt-4 bg-slate-50/50 dark:bg-zinc-850/50 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                            <div>
                              <p className="text-[9px] text-slate-400 font-bold uppercase">Carbon</p>
                              <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">
                                {item.carbonFootprintKg} kg
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-400 font-bold uppercase">Water</p>
                              <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">
                                {item.waterFootprintL} L
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-400 font-bold uppercase">Plastic</p>
                              <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">
                                {item.plasticPackagingG} g
                              </p>
                            </div>
                          </div>

                          {/* Alternatives Suggestion details */}
                          {['C', 'D', 'E', 'F'].includes(item.ecoRating) && item.alternative && (
                            <div className="mt-4 border-t border-dashed border-slate-200 dark:border-zinc-800 pt-3.5">
                              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                                <Sparkles className="h-3.5 w-3.5" /> Greener Alternative
                              </div>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                                Swap with: {item.alternative.name}
                              </p>
                              <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                                {item.alternative.reason}
                              </p>
                              
                              <div className="flex gap-4 mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                <span className="text-emerald-500">Savings: -{item.alternative.carbonSavedKg}kg CO₂</span>
                                <span className="text-primary-500">Money saved: +${item.alternative.moneySaved.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {!scanResult && !isScanning && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[400px]">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    No Receipt Scanned
                  </h3>
                  <p className="text-sm text-slate-450 mt-2 max-w-sm mx-auto leading-relaxed">
                    Upload your grocery receipt image, or select one of the Quick presets on the left side panel, to run OCR footprint estimation.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* TAB CONTENT: VIRTUAL FOREST */}
      {activeTab === 'forest' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Visual forest trees ring */}
            <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-zinc-950 rounded-3xl border border-slate-100 dark:border-zinc-900">
              <div className="relative h-64 w-64 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-full border-4 border-emerald-500 shadow-xl">
                <div className="flex flex-col items-center">
                  <TreeDeciduous className="h-20 w-20 text-emerald-500" />
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                    {user?.shoppingForestTrees || 0}
                  </p>
                  <p className="text-xs text-slate-450 uppercase tracking-wider font-bold">Trees Planted</p>
                </div>
                
                {/* Leaf floating particles animation simulated */}
                <div className="absolute top-10 left-10 text-emerald-400 text-lg animate-bounce">🌱</div>
                <div className="absolute bottom-10 right-10 text-emerald-400 text-lg animate-pulse">🌲</div>
                <div className="absolute top-1/2 right-4 text-emerald-400 text-lg">🍂</div>
              </div>

              <h3 className="text-xl font-bold mt-6 text-slate-900 dark:text-white">
                Your Shopping Forest is growing!
              </h3>
              <p className="text-xs text-slate-450 mt-1 max-w-sm">
                For every 10kg of CO₂ emissions you save by choosing greener product alternatives, you grow 1 virtual tree in your forest!
              </p>
            </div>

            {/* Tree planting logs & Challenges */}
            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Eco Shopping Milestones
              </h3>
              
              <div className="space-y-4">
                {[
                  { title: "Planted First Tree", desc: "Save 10kg of carbon outputs via receipts swaps", progress: Math.min(100, ((user?.shoppingForestTrees || 0) / 1) * 100), icon: "🌱", done: (user?.shoppingForestTrees || 0) >= 1 },
                  { title: "Forest Explorer", desc: "Grow 5 virtual trees in the Shopping Forest", progress: Math.min(100, ((user?.shoppingForestTrees || 0) / 5) * 100), icon: "🌲", done: (user?.shoppingForestTrees || 0) >= 5 },
                  { title: "Carbon Neutralizer", desc: "Grow 10 virtual trees in your forest", progress: Math.min(100, ((user?.shoppingForestTrees || 0) / 10) * 100), icon: "🌳", done: (user?.shoppingForestTrees || 0) >= 10 }
                ].map((mile, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800 flex gap-4 items-center">
                    <div className="h-10 w-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-lg border border-slate-100 dark:border-zinc-800 shadow-xs">
                      {mile.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{mile.title}</p>
                        {mile.done && <span className="text-[10px] font-bold text-emerald-500 uppercase">UNLOCKED</span>}
                      </div>
                      <p className="text-xs text-slate-450 mt-0.5">{mile.desc}</p>
                      
                      <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${mile.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: RECEIPT HISTORY LOGS */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          
          {/* History Search & filter row */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search store or receipt number..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50 text-xs font-semibold placeholder-slate-400 focus:outline-hidden focus:border-primary-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={historyFilterStore}
                onChange={(e) => setHistoryFilterStore(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50 text-xs font-semibold focus:outline-hidden"
              >
                <option value="all">All Stores</option>
                {storeNames.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={historySortBy}
                onChange={(e) => setHistorySortBy(e.target.value as any)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50 text-xs font-semibold focus:outline-hidden"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="carbon-desc">Emissions: High to Low</option>
                <option value="carbon-asc">Emissions: Low to High</option>
              </select>
            </div>

          </div>

          {/* Compare panel widget */}
          {user?.receipts && user.receipts.length >= 2 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <ArrowLeftRight className="h-4.5 w-4.5 text-primary-500" /> Compare Receipt footprints
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Receipt A</label>
                  <select
                    value={compareAId}
                    onChange={(e) => setCompareAId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50 text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="">-- Select Receipt --</option>
                    {user.receipts.map((r, i) => (
                      <option key={i} value={r.id}>{r.storeName} ({new Date(r.timestamp).toLocaleDateString()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Receipt B</label>
                  <select
                    value={compareBId}
                    onChange={(e) => setCompareBId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50 text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="">-- Select Receipt --</option>
                    {user.receipts.map((r, i) => (
                      <option key={i} value={r.id}>{r.storeName} ({new Date(r.timestamp).toLocaleDateString()})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCompare}
                  disabled={!compareAId || !compareBId}
                  className="w-full py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowLeftRight className="h-4 w-4" /> Run Comparison Analysis
                </button>
              </div>

              {isComparing && receiptA && receiptB && (
                <div className="mt-6 border-t border-slate-100 dark:border-zinc-800 pt-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Comparison Results</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Carbon Change",
                        valA: `${receiptA.summary.totalCarbonKg} kg`,
                        valB: `${receiptB.summary.totalCarbonKg} kg`,
                        diff: `${(receiptB.summary.totalCarbonKg - receiptA.summary.totalCarbonKg).toFixed(1)} kg`,
                        better: receiptB.summary.totalCarbonKg < receiptA.summary.totalCarbonKg
                      },
                      {
                        label: "EcoScore Change",
                        valA: receiptA.summary.averageEcoScore,
                        valB: receiptB.summary.averageEcoScore,
                        diff: `Score Swap`,
                        better: ['A+', 'A', 'B'].includes(receiptB.summary.averageEcoScore)
                      },
                      {
                        label: "Water footprint Change",
                        valA: `${receiptA.summary.totalWaterL} L`,
                        valB: `${receiptB.summary.totalWaterL} L`,
                        diff: `${receiptB.summary.totalWaterL - receiptA.summary.totalWaterL} L`,
                        better: receiptB.summary.totalWaterL < receiptA.summary.totalWaterL
                      },
                      {
                        label: "Plastic waste reduction",
                        valA: `${receiptA.summary.totalPlasticG} g`,
                        valB: `${receiptB.summary.totalPlasticG} g`,
                        diff: `${receiptB.summary.totalPlasticG - receiptA.summary.totalPlasticG} g`,
                        better: receiptB.summary.totalPlasticG < receiptA.summary.totalPlasticG
                      }
                    ].map((diffItem, idx) => (
                      <div key={idx} className="bg-slate-50/50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800 p-4 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{diffItem.label}</p>
                        <div className="flex justify-between items-center mt-3">
                          <div>
                            <p className="text-[10px] text-slate-400">A: {diffItem.valA}</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">B: {diffItem.valB}</p>
                          </div>
                          <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                            diffItem.better
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                          }`}>
                            {diffItem.better ? 'Better' : 'Higher'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Logs list */}
          <div className="space-y-4">
            {filteredReceipts.map((rcpt) => (
              <div
                key={rcpt.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs relative overflow-hidden group hover:border-primary-400 dark:hover:border-primary-400/50 transition-all"
              >
                {/* Top header row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex gap-4 items-center">
                    <span className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center justify-center text-lg font-black border border-emerald-100 dark:border-emerald-900">
                      {rcpt.summary.averageEcoScore}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                        {rcpt.storeName}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Scanned on {new Date(rcpt.timestamp).toLocaleString()} &bull; Receipt #: {rcpt.receiptNumber}
                      </p>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScanResult(rcpt)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:border-primary-400 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View Details
                    </button>
                    <button
                      onClick={() => downloadCertificate(rcpt)}
                      className="p-2 rounded-xl border border-slate-200 hover:border-emerald-400 dark:border-zinc-850 hover:bg-emerald-50 dark:hover:bg-zinc-800 text-slate-450 hover:text-emerald-500 transition-all"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteReceipt(rcpt.id)}
                      className="p-2 rounded-xl border border-slate-200 hover:border-rose-400 dark:border-zinc-850 hover:bg-rose-50 dark:hover:bg-zinc-800 text-slate-450 hover:text-rose-500 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Footprints display breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 bg-slate-50/50 dark:bg-zinc-850/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Carbon Footprint</span>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{rcpt.summary.totalCarbonKg} kg</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Water Used</span>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{rcpt.summary.totalWaterL} L</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plastic waste</span>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{rcpt.summary.totalPlasticG} g</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trees Offsets</span>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">🌲 {rcpt.summary.treesRequired} Trees</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Money Spent</span>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">${rcpt.summary.moneySpent.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}

            {filteredReceipts.length === 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-slate-400 font-medium shadow-xs">
                No receipts match your filters.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT: WEEKLY eco BASKET */}
      {activeTab === 'basket' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xs">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <span className="inline-block p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl mb-4">
              <ShoppingBag className="h-8 w-8" />
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              AI-Generated Weekly Eco Basket
            </h3>
            <p className="text-sm text-slate-450 mt-2">
              Gemini has compiled the healthiest, lowest-emission grocery replacements specifically tailored to your regular shopping categories. Swap these items next trip to maximize coins!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { category: "Proteins", original: "Prime Ribeye Beef Steak", alternative: "Beyond Meat Plant-Based Burger or Organic Tofu Refill", carbonSaved: "7.5 kg CO₂", moneySaved: "$2.50", icon: "🥩", reason: "Methane and land overheads make beef extremely polluting compared to plant substitutes." },
              { category: "Beverages", original: "Spring Bottled Water 24PK", alternative: "Reusable Stainless Thermos Flask + Brita Filter", carbonSaved: "0.33 kg CO₂", moneySaved: "$2.00", icon: "🥤", reason: "Single-use water bottles construct high plastic loads and transport overheads." },
              { category: "Dairy", original: "Whole Cow Dairy Milk 1 Gal", alternative: "Unsweetened Organic Oat Milk 1L", carbonSaved: "1.15 kg CO₂", moneySaved: "$0.50", icon: "🥛", reason: "Oat milk consumes 90% less water and emits 70% less methane gas than bovine farming." },
              { category: "Paper Towels", original: "Standard Virgin Pulp Paper Towels", alternative: "Reusable Swedish Bamboo Microfiber Cloths", carbonSaved: "0.7 kg CO₂", moneySaved: "$0.80", icon: "🧻", reason: "Bamboo fibers harvest faster, wash and reuse up to 200 times, displacing paper wood pulp." }
            ].map((basketItem, idx) => (
              <div key={idx} className="bg-slate-50/50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-6 relative flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {basketItem.category}
                    </span>
                    <span className="text-xl">{basketItem.icon}</span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-400">Regular: <span className="line-through">{basketItem.original}</span></p>
                    <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">AI Recommendation: {basketItem.alternative}</p>
                  </div>
                  
                  <p className="text-xs text-slate-450 mt-4 leading-relaxed font-medium">
                    {basketItem.reason}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-6 border-t border-slate-200/50 dark:border-zinc-850 pt-4">
                  <span className="text-xs font-bold text-emerald-500">Savings: -{basketItem.carbonSaved}</span>
                  <span className="text-xs font-bold text-primary-500">Wallet: +{basketItem.moneySaved}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-primary-500/10 to-teal-500/10 border border-primary-500/20 p-5 rounded-2xl text-center mt-8">
            <h4 className="text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center justify-center gap-1.5 mb-1.5">
              <Award className="h-4.5 w-4.5" /> Eco Basket Challenges
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Buy all 4 eco recommendations in a single trip to unlock the <strong>"Zero Waste Hero"</strong> badge, <strong>+200 XP</strong> and <strong>+100 Green Coins</strong>!
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReceiptScanner;
