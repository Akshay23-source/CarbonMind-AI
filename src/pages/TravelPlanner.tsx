import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Map,
  Navigation,
  Mic,
  Volume2,
  Clock,
  Sparkles,
  Award,
  Droplet,
  Coins,
  Leaf,
  Plus,
  Search,
  Trash2,
  AlertCircle,
  TrendingUp,
  MapPin,
  CheckCircle,
  Zap,
  DollarSign,
  CloudSun,
  Flame,
  Star,
  Users,
  Compass,
  ArrowRight,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line
} from 'recharts';

// Custom Map pin styling helper matching the theme
const getCustomIcon = (type: string, emoji: string) => {
  const isUser = type === 'user';
  return L.divIcon({
    className: 'custom-leaflet-icon-wrapper',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${isUser ? 'bg-indigo-600 border-2 border-white' : 'bg-zinc-900/90 border-2 border-zinc-700'} shadow-2xl text-xs transition-all duration-300 transform hover:scale-110">
        <span>${emoji}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Map view dynamic adjustments controller
const MapViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Geocoding helper with OSM Nominatim search & offline deterministic fallback
const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  if (!address.trim()) return null;
  const addrLower = address.toLowerCase();
  
  if (addrLower.includes('green avenue') || addrLower.includes('bangalore')) {
    return [12.9716 + (Math.random() - 0.5) * 0.01, 77.5946 + (Math.random() - 0.5) * 0.01];
  }
  if (addrLower.includes('stripe tech') || addrLower.includes('ring road')) {
    return [12.9345, 77.6101];
  }
  if (addrLower.includes('university') || addrLower.includes('tech park')) {
    return [12.9562, 77.7012];
  }
  if (addrLower.includes('mg road')) {
    return [12.9738, 77.6119];
  }
  if (addrLower.includes('nexus') || addrLower.includes('mall') || addrLower.includes('koramangala')) {
    return [12.9348, 77.6190];
  }

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    }
  } catch (e) {
    console.error("Nominatim geocoding failed. Falling back to hash coordinates:", e);
  }
  
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }
  const lat = 12.9716 + (Math.abs(hash) % 100) * 0.001;
  const lon = 77.5946 + (Math.abs(hash >> 8) % 100) * 0.001;
  return [lat, lon];
};

// Pseudo-coords generator near path
const getPointsNearLine = (start: [number, number], end: [number, number], count: number, offsetScale = 0.008): [number, number][] => {
  const points: [number, number][] = [];
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const lat = start[0] + (end[0] - start[0]) * t + (Math.random() - 0.5) * offsetScale;
    const lon = start[1] + (end[1] - start[1]) * t + (Math.random() - 0.5) * offsetScale;
    points.push([lat, lon]);
  }
  return points;
};

export const TravelPlanner: React.FC = () => {
  const { user, logTrip, deleteTrip } = useAuth();
  
  // Trip coordinates/addresses
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [preferences, setPreferences] = useState({ avoidTolls: false, prioritizeHealth: false });
  const [isPlanning, setIsPlanning] = useState(false);
  const [planResult, setPlanResult] = useState<any | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'planner' | 'streak' | 'challenges' | 'history'>('planner');

  // Map settings overlays
  const [showEVStations, setShowEVStations] = useState(true);
  const [showTransitStops, setShowTransitStops] = useState(true);
  const [showRecycling, setShowRecycling] = useState(false);
  const [showPlantations, setShowPlantations] = useState(false);
  
  // Leaflet positioning state
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9716, 77.5946]); // Default Bangalore
  const [mapZoom, setMapZoom] = useState(12);

  // Overlay dynamic coordinate states
  const [evCoords, setEvCoords] = useState<[number, number][]>([]);
  const [transitCoords, setTransitCoords] = useState<[number, number][]>([]);
  const [recyclingCoords, setRecyclingCoords] = useState<[number, number][]>([]);
  const [plantationCoords, setPlantationCoords] = useState<[number, number][]>([]);

  useEffect(() => {
    if (originCoords && destCoords) {
      setEvCoords(getPointsNearLine(originCoords, destCoords, 2, 0.005));
      setTransitCoords(getPointsNearLine(originCoords, destCoords, 2, 0.004));
      setRecyclingCoords(getPointsNearLine(originCoords, destCoords, 2, 0.006));
      setPlantationCoords(getPointsNearLine(originCoords, destCoords, 2, 0.005));
    }
  }, [originCoords, destCoords]);

  // Geolocation detector on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);
          setMapCenter([lat, lng]);
          setMapZoom(13);
        },
        (error) => {
          console.warn("User geolocation access blocked:", error);
        }
      );
    }
  }, []);
  
  // History search
  const [historySearch, setHistorySearch] = useState('');

  // Voice Assistant State
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceReply, setVoiceReply] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  // Custom route presets
  const presets = [
    { label: "Home → College", from: "12, Green Avenue, Bangalore", to: "CarbonMind University, Tech Park" },
    { label: "Home → Office", from: "12, Green Avenue, Bangalore", to: "Stripe Tech Labs, Outer Ring Road" },
    { label: "College → Home", from: "CarbonMind University, Tech Park", to: "12, Green Avenue, Bangalore" },
    { label: "Current → City Mall", from: "MG Road Metro Station", to: "Nexus Forums Mall, Koramangala" }
  ];

  const handlePresetClick = (p: { from: string, to: string }) => {
    setOrigin(p.from);
    setDestination(p.to);
    calculateRoutes(p.from, p.to);
  };

  const calculateRoutes = async (fromVal?: string, toVal?: string) => {
    const o = fromVal || origin;
    const d = toVal || destination;

    if (!o.trim() || !d.trim()) {
      setPlanError("Please define both origin and destination addresses.");
      return;
    }

    setIsPlanning(true);
    setPlanError(null);
    setPlanResult(null);

    try {
      const endpoint = '/api/ai/plan-trip';
      const token = localStorage.getItem('carbonmind_token');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          origin: o,
          destination: d,
          preferences
        })
      });

      if (!response.ok) {
        throw new Error("Failed to retrieve trip route details.");
      }

      const data = await response.json();
      if (data.success) {
        // Fetch geo positions
        const startPt = await geocodeAddress(o);
        const endPt = await geocodeAddress(d);
        if (startPt) setOriginCoords(startPt);
        if (endPt) setDestCoords(endPt);
        
        if (startPt) {
          setMapCenter(startPt);
          setMapZoom(13);
        }

        setPlanResult(data);
      } else {
        throw new Error("AI advisor could not parse locations.");
      }
    } catch (err: any) {
      setPlanError(err.message || "Failed to contact routing services. Make sure server is running.");
    } finally {
      setIsPlanning(false);
    }
  };

  const handleTripLog = async (routeOption: any) => {
    if (!planResult) return;
    const logPayload = {
      origin: planResult.origin,
      destination: planResult.destination,
      distanceKm: planResult.distanceKm,
      weather: planResult.weather,
      route: routeOption
    };
    await logTrip(logPayload);
  };

  // Voice Assistant Questions
  const handleVoiceQuery = (query: string) => {
    setVoiceQuery(query);
    setIsAnswering(true);

    setTimeout(() => {
      let reply = "";
      if (query.includes("greenest")) {
        const latest = planResult?.routes || [];
        const greenest = [...latest].sort((a: any, b: any) => a.carbonEmissionsKg - b.carbonEmissionsKg)[0];
        if (greenest) {
          reply = `The greenest way to your destination is ${greenest.mode}. It produces just ${greenest.carbonEmissionsKg}kg CO₂ and saves ${greenest.carbonSavedKg}kg CO₂ compared to standard petrol cars.`;
        } else {
          reply = "The greenest travel option is walking or cycling. Use the travel planner above to calculate details for your route.";
        }
      } else if (query.includes("saved")) {
        const trips = user?.trips || [];
        if (trips.length > 0) {
          const totalSaved = trips.reduce((acc: number, cur: any) => acc + (cur.route.carbonSavedKg || 0), 0);
          reply = `You have saved a total of ${totalSaved.toFixed(1)}kg CO₂ from your logged trips. Your travel green streak is currently ${user?.travelGreenStreak || 0} consecutive trips!`;
        } else {
          reply = "You haven't logged any trips yet! Plan a route and choose walking, cycling, or transit to start saving carbon.";
        }
      } else if (query.includes("bus")) {
        if (planResult && planResult.weather.condition === 'Rainy') {
          reply = "Yes, taking the bus or metro is highly recommended today as rain is active and roads may be slippery for cycling.";
        } else {
          reply = "Taking the bus is a great eco-option. It will save money and emit 75% less carbon than driving alone.";
        }
      } else {
        reply = "I'm your AI Travel Coach. Ask me about the greenest routes, carbon savings, or public transport details.";
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

  // Filter history list
  const filteredHistory = (user?.trips || []).filter(t => {
    return t.destination.toLowerCase().includes(historySearch.toLowerCase()) || t.route.mode.toLowerCase().includes(historySearch.toLowerCase());
  });

  return (
    <div className="w-full max-w-7xl mx-auto font-sans text-slate-800 dark:text-slate-200">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 mb-8 overflow-x-auto gap-2">
        {[
          { id: 'planner', label: 'AI Smart Router', icon: <Navigation className="h-4.5 w-4.5" /> },
          { id: 'streak', label: 'Green Streaks & Forest', icon: <Leaf className="h-4.5 w-4.5" /> },
          { id: 'challenges', label: 'Travel Challenges', icon: <Award className="h-4.5 w-4.5" /> },
          { id: 'history', label: 'Travel Timeline logs', icon: <Clock className="h-4.5 w-4.5" /> }
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

      {/* TAB CONTENT: PLANNER */}
      {activeTab === 'planner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Address fields & map overlays */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Plan Sustainable Route
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Origin Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Enter starting address..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-850/50 text-xs font-semibold placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Destination Search</label>
                  <div className="relative">
                    <Compass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Enter target destination..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-850/50 text-xs font-semibold placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Preference toggles */}
                <div className="flex gap-4 items-center pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-450 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.avoidTolls}
                      onChange={(e) => setPreferences({ ...preferences, avoidTolls: e.target.checked })}
                      className="rounded text-indigo-500 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span>Avoid Tolls</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-450 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.prioritizeHealth}
                      onChange={(e) => setPreferences({ ...preferences, prioritizeHealth: e.target.checked })}
                      className="rounded text-indigo-500 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span>Prioritize Health</span>
                  </label>
                </div>

                <button
                  disabled={isPlanning}
                  onClick={() => calculateRoutes()}
                  className="w-full mt-4 py-3.5 px-4 rounded-xl font-bold text-sm bg-indigo-500 text-white hover:bg-indigo-650 active:scale-97 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isPlanning ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Querying Routes...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4" /> Calculate Route Alternatives
                    </>
                  )}
                </button>
              </div>

              {planError && (
                <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/10 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex gap-2 items-center">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{planError}</span>
                </div>
              )}
            </div>

            {/* Presets shortcut logs */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 animate-pulse" /> Saved Favorite Routes
              </h3>
              <div className="space-y-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    disabled={isPlanning}
                    onClick={() => handlePresetClick(p)}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-100 hover:border-indigo-400 dark:border-zinc-805 dark:hover:border-indigo-500/50 bg-slate-50/50 dark:bg-zinc-850/50 hover:bg-white active:scale-98 transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">To: {p.to}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-450" />
                  </button>
                ))}
              </div>
            </div>

            {/* Weather & AQI card */}
            <AnimatePresence>
              {planResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs"
                >
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <CloudSun className="h-4.5 w-4.5" /> Destination Weather & AQI
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-zinc-850 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Condition</span>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">
                        {planResult.weather.condition} ({planResult.weather.temperature})
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Wind: {planResult.weather.windSpeed}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-850 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Air Quality (AQI)</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">{planResult.weather.aqi}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          planResult.weather.aqiLabel === 'Good'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                        }`}>
                          {planResult.weather.aqiLabel}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1">Haze level index</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-450 leading-relaxed font-semibold mt-4 text-center italic">
                    "{planResult.weather.healthAdvisory}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Voice Assistant Panel */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 dark:from-indigo-950/20 dark:to-purple-950/10 border border-indigo-500/10 rounded-3xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                <Volume2 className="h-4.5 w-4.5" /> AI Route Advisor
              </h3>
              <p className="text-xs text-slate-450 mb-4">
                Ask about the best way to commute:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "What's the greenest way to college?",
                  "How much carbon did I save today?",
                  "Should I take the bus today?"
                ].map((q, i) => (
                  <button
                    key={i}
                    disabled={isAnswering}
                    onClick={() => handleVoiceQuery(q)}
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
                  <p className="text-[10px] font-bold uppercase text-indigo-500 tracking-wide mt-3">AI Commute Advisor Response</p>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed mt-0.5">
                    {isAnswering ? "Querying weather and traffic databases..." : voiceReply}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Right panel: Vector Map & comparisons list */}
          <div className="lg:col-span-2 space-y-6">            {/* Interactive Vector Map Simulator */}
            <div className="bg-slate-950 rounded-3xl border border-zinc-800/80 shadow-xl overflow-hidden relative min-h-[350px] h-[400px] flex flex-col justify-between z-10">
              
              {/* Maps layers check checkboxes */}
              <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                {[
                  { label: "⚡ EV Charging", active: showEVStations, set: setShowEVStations, color: "border-emerald-500 bg-emerald-500/10 text-emerald-400" },
                  { label: "🚏 Transit Stops", active: showTransitStops, set: setShowTransitStops, color: "border-blue-500 bg-blue-500/10 text-blue-400" },
                  { label: "♻️ Recycling Hubs", active: showRecycling, set: setShowRecycling, color: "border-yellow-500 bg-yellow-500/10 text-yellow-400" },
                  { label: "🌲 Plantation Hubs", active: showPlantations, set: setShowPlantations, color: "border-indigo-500 bg-indigo-500/10 text-indigo-400" }
                ].map((overlay, i) => (
                  <button
                    key={i}
                    onClick={() => overlay.set(!overlay.active)}
                    className={`px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all shadow-xs ${
                      overlay.active ? overlay.color : "border-zinc-800 bg-zinc-900 text-zinc-550"
                    }`}
                  >
                    {overlay.label}
                  </button>
                ))}
              </div>

              {/* Leaflet MapContainer */}
              <div className="w-full h-full relative flex-1 min-h-[300px] z-10">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  className="w-full h-full"
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />

                  <MapViewController center={mapCenter} zoom={mapZoom} />

                  {/* User location pulse */}
                  {userLocation && (
                    <Marker position={userLocation} icon={getCustomIcon('user', '📍')}>
                      <Popup>
                        <div className="p-1 font-sans text-xs">
                          <p className="font-bold">Your Current GPS Position</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Origin & Destination markers */}
                  {originCoords && (
                    <Marker position={originCoords} icon={getCustomIcon('user', '🏁')}>
                      <Popup>
                        <div className="p-1 font-sans text-xs">
                          <p className="font-bold">Origin Address</p>
                          <p className="text-slate-400">{origin}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {destCoords && (
                    <Marker position={destCoords} icon={getCustomIcon('user', '🎯')}>
                      <Popup>
                        <div className="p-1 font-sans text-xs">
                          <p className="font-bold">Destination Address</p>
                          <p className="text-slate-400">{destination}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Polyline Route */}
                  {originCoords && destCoords && (
                    <Polyline
                      positions={[originCoords, destCoords]}
                      pathOptions={{
                        color: '#6366f1',
                        weight: 4,
                        dashArray: '6, 6',
                      }}
                    />
                  )}

                  {/* EV Stations Markers */}
                  {showEVStations && evCoords.map((coord, idx) => (
                    <Marker key={`ev_${idx}`} position={coord} icon={getCustomIcon('ev', '⚡')}>
                      <Popup>
                        <div className="p-2 text-xs font-sans text-left">
                          <p className="font-bold">⚡ EV Charging Spot</p>
                          <p className="text-slate-400">Public fast charger available.</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Transit Stop Markers */}
                  {showTransitStops && transitCoords.map((coord, idx) => (
                    <Marker key={`ts_${idx}`} position={coord} icon={getCustomIcon('transit', '🚏')}>
                      <Popup>
                        <div className="p-2 text-xs font-sans text-left">
                          <p className="font-bold">🚏 Public Transit Stop</p>
                          <p className="text-slate-400">Regular eco-efficient bus/metro routes.</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Recycling Depot Markers */}
                  {showRecycling && recyclingCoords.map((coord, idx) => (
                    <Marker key={`rc_${idx}`} position={coord} icon={getCustomIcon('recycle', '♻️')}>
                      <Popup>
                        <div className="p-2 text-xs font-sans text-left">
                          <p className="font-bold">♻️ Recycling Hub</p>
                          <p className="text-slate-400">Drop off plastics, batteries, or metal.</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Plantation Hub Markers */}
                  {showPlantations && plantationCoords.map((coord, idx) => (
                    <Marker key={`pl_${idx}`} position={coord} icon={getCustomIcon('plantation', '🌲')}>
                      <Popup>
                        <div className="p-2 text-xs font-sans text-left">
                          <p className="font-bold">🌲 Plantation Spot</p>
                          <p className="text-slate-400">Sapling site for community reforestation drives.</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {planResult && (
                <div className="absolute bottom-4 right-4 z-20 bg-zinc-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-zinc-800/80 flex justify-between items-center text-xs text-white">
                  <span className="font-extrabold text-indigo-400">Commute Distance: {planResult.distanceKm} km</span>
                </div>
              )}
            </div>

            {/* AI Advisor prompt box */}
            <AnimatePresence>
              {planResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-500/10 border-l-4 border-indigo-500 p-5 rounded-r-2xl"
                >
                  <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-4.5 w-4.5" /> AI Commute Adviser recommendation
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {planResult.aiRecommendation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Route comparison logs */}
            <AnimatePresence mode="wait">
              {planResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">
                    Transportation route options comparisons
                  </h3>

                  <div className="space-y-3.5">
                    {planResult.routes.map((route: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-xs hover:border-indigo-400 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group"
                      >
                        {/* Recommendation badge overlay */}
                        {route.badge && (
                          <div className="absolute top-0 right-0">
                            <span className="text-[9px] font-black text-white bg-indigo-500 px-3.5 py-1 rounded-bl-xl uppercase tracking-wide">
                              {route.badge}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-4 items-center">
                          <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-zinc-850 flex items-center justify-center text-lg shadow-inner">
                            {route.mode === 'Walking' ? '🚶' : route.mode === 'Cycling' ? '🚴' : route.mode === 'Electric Scooter' ? '🛴' : route.mode === 'Petrol Car' ? '🚗' : route.mode === 'Electric Car' ? '🔌' : route.mode === 'Metro' ? '🚇' : '🚌'}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                              {route.mode}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Est. Travel Time: {route.travelTimeMins} mins &bull; Cost: ${route.cost.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Travel stats indicators */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                          <div>
                            <span className="block text-[9px] text-slate-400 uppercase font-bold">Carbon</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">{route.carbonEmissionsKg} kg CO₂</span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-slate-400 uppercase font-bold">Carbon Saved</span>
                            <span className="font-extrabold text-emerald-500">-{route.carbonSavedKg} kg</span>
                          </div>
                          {route.caloriesBurned > 0 && (
                            <div>
                              <span className="block text-[9px] text-slate-400 uppercase font-bold">Calories</span>
                              <span className="font-extrabold text-orange-500">+{route.caloriesBurned} kcal</span>
                            </div>
                          )}
                          <div>
                            <span className="block text-[9px] text-slate-400 uppercase font-bold">Eco Score</span>
                            <span className="font-extrabold text-indigo-500">{route.sustainabilityScore}/100</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleTripLog(route)}
                          className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-primary-500 text-white hover:bg-primary-600 active:scale-97 transition-all flex items-center gap-1 shadow-xs"
                        >
                          Log Commute
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Carpooling integration panel */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Users className="h-4.5 w-4.5 text-primary-500" /> Commute Carpool options matches
                    </h3>
                    
                    <div className="space-y-3">
                      {planResult.carpoolOffers.map((car: any, i: number) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{car.driverName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Vehicle: {car.vehicle} &bull; Departure: {car.departure}</p>
                          </div>
                          
                          <div className="flex gap-6 text-xs items-center">
                            <span>Cost split: <strong className="text-primary-500">₹{car.costSplit}</strong></span>
                            <span>Carbon Saved: <strong className="text-emerald-500">-{car.carbonReductionKg}kg CO₂</strong></span>
                            <button className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-[10px] font-bold active:scale-95 transition-all">
                              Request Split
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        </div>
      )}

      {/* TAB CONTENT: GREEN STREAKS & FOREST */}
      {activeTab === 'streak' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Visual forest ring */}
            <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-zinc-950 rounded-3xl border border-slate-100 dark:border-zinc-900">
              <div className="relative h-64 w-64 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-full border-4 border-indigo-500 shadow-xl animate-pulse">
                <div className="flex flex-col items-center">
                  <Compass className="h-20 w-20 text-indigo-500" />
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                    {user?.travelGreenStreak || 0} Days
                  </p>
                  <p className="text-xs text-slate-450 uppercase tracking-wider font-bold">Commute Green Streak</p>
                </div>
              </div>

              <h3 className="text-xl font-bold mt-6 text-slate-900 dark:text-white">
                Eco-commute Green streak streak
              </h3>
              <p className="text-xs text-slate-450 mt-1 max-w-sm">
                Each consecutive day you log a sustainable route (Walking, Cycling, Metro, Bus, or EV) increases your Travel Streak and grows virtual saplings!
              </p>
            </div>

            {/* Travel stats and future predictions */}
            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Future Commute Predictions
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: "Weekly Carbon emissions offset", val: `${( (user?.trips?.length || 0) * 1.8 ).toFixed(1)} kg CO₂`, sub: "Based on active logs", color: "text-emerald-500 bg-emerald-500/10" },
                  { label: "Estimated Monthly fuel savings", val: `$${( (user?.trips?.length || 0) * 8.5 ).toFixed(2)}`, sub: "Based on avoided single drives", color: "text-primary-500 bg-primary-500/10" },
                  { label: "Annual offset potential", val: `${( (user?.trips?.length || 0) * 92 ).toFixed(0)} kg CO₂`, sub: "Projected 12-month trajectory", color: "text-indigo-500 bg-indigo-500/10" }
                ].map((pred, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{pred.label}</p>
                      <p className="text-[10px] text-slate-450 mt-0.5">{pred.sub}</p>
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{pred.val}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: TRAVEL CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xs">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <span className="inline-block p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl mb-4">
              <Award className="h-8 w-8" />
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              AI Travel Commute Challenges
            </h3>
            <p className="text-sm text-slate-450 mt-2">
              Join active travel milestones to compete with family and campus communities, earning extra coins and coupons!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Cycle Week Challenge", goal: "Log 3 cycling routes to campus", reward: "+150 Green Coins, +100 XP", icon: "🚴", progress: Math.min(100, (((user?.trips || []).filter((t: any) => t.route.mode === 'Cycling').length) / 3) * 100) },
              { title: "Walk to College", goal: "Log 3 walking trips", reward: "+100 Green Coins, +80 XP", icon: "🚶", progress: Math.min(100, (((user?.trips || []).filter((t: any) => t.route.mode === 'Walking').length) / 3) * 100) },
              { title: "Public Transport Week", goal: "Commute via metro/bus 5 times", reward: "+200 Green Coins, +150 XP", icon: "🚇", progress: Math.min(100, (((user?.trips || []).filter((t: any) => ['Metro', 'Bus'].includes(t.route.mode)).length) / 5) * 100) },
              { title: "Eco Driver Challenge", goal: "Log 3 EV Car or Scooter rides", reward: "+100 Green Coins, +50 XP", icon: "🔌", progress: Math.min(100, (((user?.trips || []).filter((t: any) => ['Electric Car', 'Electric Scooter'].includes(t.route.mode)).length) / 3) * 100) }
            ].map((chall, idx) => (
              <div key={idx} className="bg-slate-50/50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl">{chall.icon}</span>
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">{chall.reward}</span>
                  </div>
                  
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{chall.title}</h4>
                  <p className="text-xs text-slate-450 mt-1">{chall.goal}</p>
                </div>

                <div className="mt-6 border-t border-slate-200/50 dark:border-zinc-850 pt-4">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Progress</span>
                    <span>{Math.round(chall.progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${chall.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: TIMELINE HISTORICAL COMMUTES */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex justify-between items-center">
            <div className="relative w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search destination or mode..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50 text-xs font-semibold placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredHistory.map((trip) => (
              <div
                key={trip.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs relative overflow-hidden group hover:border-indigo-400 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">
                      {trip.route.mode === 'Walking' ? '🚶' : trip.route.mode === 'Cycling' ? '🚴' : trip.route.mode === 'Electric Scooter' ? '🛴' : trip.route.mode === 'Petrol Car' ? '🚗' : trip.route.mode === 'Electric Car' ? '🔌' : '🚇'}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                      To: {trip.destination}
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Logged on {new Date(trip.timestamp).toLocaleString()} &bull; Distance: {trip.distanceKm} km
                  </p>
                </div>

                {/* Footprint logs breakdown details */}
                <div className="flex flex-wrap gap-6 text-xs">
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase font-bold">Emissions</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{trip.route.carbonEmissionsKg} kg CO₂</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase font-bold">Saved</span>
                    <span className="font-extrabold text-emerald-500">-{trip.route.carbonSavedKg} kg</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase font-bold">Calories</span>
                    <span className="font-extrabold text-orange-500">+{trip.route.caloriesBurned} kcal</span>
                  </div>
                  
                  <button
                    onClick={() => deleteTrip(trip.id)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-850 hover:border-rose-400 text-slate-450 hover:text-rose-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredHistory.length === 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-slate-450 font-medium">
                No route commuter logs recorded.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default TravelPlanner;
