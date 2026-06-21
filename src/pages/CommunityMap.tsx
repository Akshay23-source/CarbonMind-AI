import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Navigation, Filter, Sparkles, Award, Trees, Heart, 
  Search, Info, Compass, HelpCircle, Layers, CheckCircle2, 
  Map as MapIcon, ChevronRight, Activity, Calendar, ShieldCheck, 
  Smile, Landmark, Star, Moon, Sun, Accessibility
} from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../config/api';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../services/firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';

// Types for map locations
interface MapLocation {
  id: string;
  name: string;
  category: 'tree' | 'recycle' | 'ev' | 'cleanup' | 'workshop' | 'ngo' | 'store' | 'transport';
  latitude: number;
  longitude: number;
  participants: number;
  carbonImpactKg: number;
  accessibility: boolean;
  openNow: boolean;
  freeEvent: boolean;
  familyFriendly: boolean;
  studentFriendly: boolean;
  description: string;
  address: string;
  phone?: string;
  rating?: number;
  date?: string;
}

// Icon markers mapping
const iconColorMap: Record<string, { bg: string, text: string, border: string, pulse: string }> = {
  tree: { bg: 'bg-emerald-950/90', text: 'text-emerald-400', border: 'border-emerald-500', pulse: 'bg-emerald-500/30' },
  recycle: { bg: 'bg-teal-950/90', text: 'text-teal-400', border: 'border-teal-500', pulse: 'bg-teal-500/30' },
  ev: { bg: 'bg-amber-950/90', text: 'text-amber-400', border: 'border-amber-500', pulse: 'bg-amber-500/30' },
  cleanup: { bg: 'bg-orange-950/90', text: 'text-orange-400', border: 'border-orange-500', pulse: 'bg-orange-500/30' },
  workshop: { bg: 'bg-purple-950/90', text: 'text-purple-400', border: 'border-purple-500', pulse: 'bg-purple-500/30' },
  ngo: { bg: 'bg-indigo-950/90', text: 'text-indigo-400', border: 'border-indigo-500', pulse: 'bg-indigo-500/30' },
  store: { bg: 'bg-lime-950/90', text: 'text-lime-400', border: 'border-lime-500', pulse: 'bg-lime-500/30' },
  transport: { bg: 'bg-sky-950/90', text: 'text-sky-400', border: 'border-sky-500', pulse: 'bg-sky-500/30' },
  user: { bg: 'bg-blue-600', text: 'text-white', border: 'border-white', pulse: 'bg-blue-500/40' },
  achievement: { bg: 'bg-amber-500', text: 'text-slate-900', border: 'border-amber-400', pulse: 'bg-amber-500/30' }
};

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'tree': return '🌳';
    case 'recycle': return '♻️';
    case 'ev': return '⚡';
    case 'cleanup': return '🧹';
    case 'workshop': return '🌍';
    case 'ngo': return '🏢';
    case 'store': return '🛍️';
    case 'transport': return '🚌';
    case 'user': return '📍';
    case 'achievement': return '🏆';
    default: return '📍';
  }
};

const getCustomIcon = (type: string, emoji: string) => {
  const c = iconColorMap[type] || iconColorMap.tree;
  const isUser = type === 'user';
  return L.divIcon({
    className: 'custom-leaflet-icon-wrapper',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 rounded-full ${isUser ? 'bg-blue-600 border-2 border-white' : `${c.bg} border-2 ${c.border}`} shadow-2xl text-sm transition-all duration-300 transform hover:scale-115">
        <div class="absolute inset-0 rounded-full ${c.pulse} animate-ping" style="animation-duration: 2s;"></div>
        <span>${emoji}</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Map controller to adjust view dynamically
const MapViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const CommunityMap: React.FC = () => {
  const { user, logActivity } = useAuth();
  const { theme } = useTheme();

  // Geolocation states (starting default: San Francisco SOMA area)
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Filter panels
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState<number>(25); // km
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'tree', 'recycle', 'ev', 'cleanup', 'workshop', 'ngo', 'store', 'transport'
  ]);
  const [filterAccessibility, setFilterAccessibility] = useState(false);
  const [filterFamilyFriendly, setFilterFamilyFriendly] = useState(false);
  const [filterStudentFriendly, setFilterStudentFriendly] = useState(false);
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterFreeEvent, setFilterFreeEvent] = useState(false);
  const [filterCarbonImpact, setFilterCarbonImpact] = useState<'all' | 'high' | 'medium'>('all');

  // Layers Toggles
  const [layerHeatmap, setLayerHeatmap] = useState(false);
  const [layerCarbonForest, setLayerCarbonForest] = useState(false);
  const [layerGreenJourney, setLayerGreenJourney] = useState(false);
  const [manualTileTheme, setManualTileTheme] = useState<'dark' | 'light' | null>(null);

  // Selected Detail Modal
  const [activeLocation, setActiveLocation] = useState<MapLocation | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // AI Advisor Comments
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<{ transport: string; circular: string; community: string } | null>(null);

  // Raw Database Location Arrays
  const [locations, setLocations] = useState<MapLocation[]>([]);

  // Seed default locations
  const defaultSeeds: MapLocation[] = [
    {
      id: 'loc_01',
      name: 'SOMA Park Tree Plantation Drive',
      category: 'tree',
      latitude: 37.7801,
      longitude: -122.4120,
      participants: 45,
      carbonImpactKg: 550,
      accessibility: true,
      openNow: true,
      freeEvent: true,
      familyFriendly: true,
      studentFriendly: true,
      description: 'Join the community team this Saturday to plant native saplings, restoring urban canopy density in SOMA neighborhood parks.',
      address: 'SOMA Community Park, 6th St & Minna St, San Francisco, CA',
      rating: 4.8,
      date: 'June 27, 2026'
    },
    {
      id: 'loc_02',
      name: 'Mission Electronic Waste Recycling',
      category: 'recycle',
      latitude: 37.7650,
      longitude: -122.4210,
      participants: 28,
      carbonImpactKg: 350,
      accessibility: true,
      openNow: true,
      freeEvent: true,
      familyFriendly: false,
      studentFriendly: true,
      description: 'Accepted items: smartphones, laptop chargers, appliances, and lithium batteries. Certified hazardous offsets guaranteed.',
      address: 'Mission Green Depot, 21st St & Valencia St, San Francisco, CA',
      rating: 4.6,
      date: 'Daily'
    },
    {
      id: 'loc_03',
      name: 'Market Street EV Ultra Supercharger',
      category: 'ev',
      latitude: 37.7780,
      longitude: -122.4150,
      participants: 12,
      carbonImpactKg: 200,
      accessibility: true,
      openNow: true,
      freeEvent: false,
      familyFriendly: false,
      studentFriendly: false,
      description: 'Clean energy high-speed charging grids. 10 charging nodes available, powered by 100% solar microgrid contracts.',
      address: 'Market Plaza Charging Station, 988 Market St, San Francisco, CA',
      rating: 4.9
    },
    {
      id: 'loc_04',
      name: 'Ocean Beach Cleanup & Plastics Sweep',
      category: 'cleanup',
      latitude: 37.7690,
      longitude: -122.5110,
      participants: 132,
      carbonImpactKg: 480,
      accessibility: false,
      openNow: false,
      freeEvent: true,
      familyFriendly: true,
      studentFriendly: true,
      description: 'Weekly volunteer cleaning sweeps protecting local marine microclimates from plastic debris. Sacks and grabbers provided.',
      address: 'Ocean Beach Parking Lot A, Great Highway, San Francisco, CA',
      rating: 4.7,
      date: 'Every Sunday'
    },
    {
      id: 'loc_05',
      name: 'Castro Climate Adaptation Workshop',
      category: 'workshop',
      latitude: 37.7620,
      longitude: -122.4350,
      participants: 22,
      carbonImpactKg: 95,
      accessibility: true,
      openNow: true,
      freeEvent: true,
      familyFriendly: true,
      studentFriendly: true,
      description: 'Seminars detailing domestic waste minimization, smart appliance optimization, and solar credit applications.',
      address: 'Castro Community Center, Collingwood St, San Francisco, CA',
      rating: 4.5,
      date: 'June 24, 2026'
    },
    {
      id: 'loc_06',
      name: 'Salesforce Public Transit Terminal',
      category: 'transport',
      latitude: 37.7890,
      longitude: -122.4010,
      participants: 450,
      carbonImpactKg: 1500,
      accessibility: true,
      openNow: true,
      freeEvent: false,
      familyFriendly: true,
      studentFriendly: true,
      description: 'Major regional transit connector providing carbon-efficient commuter train & electric bus routes across the Bay Area.',
      address: 'Salesforce Transit Center, Mission St & Fremont St, San Francisco, CA',
      rating: 4.9
    },
    {
      id: 'loc_07',
      name: 'The Fillmore Package-Free Pantry',
      category: 'store',
      latitude: 37.7840,
      longitude: -122.4330,
      participants: 78,
      carbonImpactKg: 120,
      accessibility: true,
      openNow: true,
      freeEvent: false,
      familyFriendly: true,
      studentFriendly: true,
      description: 'Sustainably sourced dry pantry goods, zero-waste cosmetic refill bars, and locally organic produce. Bring your own containers.',
      address: 'Fillmore Bulk Groceries, 1420 Fillmore St, San Francisco, CA',
      rating: 4.7
    }
  ];

  // Geodesic distance formula (Haversine) in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Real-time Firestore sync & default fallback
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const isRealFirebase = import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== 'mock-api-key';
      if (isRealFirebase) {
        unsubscribe = onSnapshot(collection(db, 'map_locations'), (snapshot) => {
          const fetched: MapLocation[] = [];
          snapshot.forEach((doc) => {
            fetched.push({ id: doc.id, ...doc.data() } as MapLocation);
          });
          if (fetched.length > 0) {
            setLocations(fetched);
          } else {
            setLocations(defaultSeeds);
          }
        }, (err) => {
          console.warn('[Firebase Map Query] Failed, using default seeds:', err);
          setLocations(defaultSeeds);
        });
      } else {
        // Fallback locally
        setLocations(defaultSeeds);
      }
    } catch (e) {
      console.warn('[Firebase Init] Failed, falling back locally:', e);
      setLocations(defaultSeeds);
    }
    return () => unsubscribe();
  }, []);

  // Detect current user GPS location
  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);
          setMapCenter([lat, lng]);
          setMapZoom(14);
        },
        (error) => {
          console.warn('Geolocation access blocked or error:', error);
          // Alert user or default to standard center
        }
      );
    }
  };

  // Fetch AI advisor tips from Gemini Map Advisor endpoint
  const fetchAIRecommendations = async (filteredLocs: MapLocation[]) => {
    setAiLoading(true);
    try {
      const token = localStorage.getItem('carbonmind_token');
      // Pass top 5 nearby locations for analysis to keep body payload small
      const eventsSummary = filteredLocs.slice(0, 5).map(l => ({
        name: l.name,
        category: l.category,
        distance: calculateDistance(mapCenter[0], mapCenter[1], l.latitude, l.longitude).toFixed(1) + ' km'
      }));

      const res = await fetch(`${API_BASE}/api/ai/map-advisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userProfile: user,
          nearbyEvents: eventsSummary
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAiAdvice(data.recommendations);
        }
      }
    } catch (e) {
      console.error('Failed to query AI Map advisor:', e);
    } finally {
      setAiLoading(false);
    }
  };

  // Toggle categories checkboxes
  const handleToggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Distance filter calculations & active mapping
  const filteredLocations = locations.filter((loc) => {
    // 1. Search Query
    if (searchQuery && !loc.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !loc.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // 2. Category selection
    if (!selectedCategories.includes(loc.category)) return false;

    // 3. Distance check
    const dist = calculateDistance(mapCenter[0], mapCenter[1], loc.latitude, loc.longitude);
    if (dist > maxDistance) return false;

    // 4. Detailed attributes checks
    if (filterAccessibility && !loc.accessibility) return false;
    if (filterFamilyFriendly && !loc.familyFriendly) return false;
    if (filterStudentFriendly && !loc.studentFriendly) return false;
    if (filterOpenNow && !loc.openNow) return false;
    if (filterFreeEvent && !loc.freeEvent) return false;

    // 5. Carbon Impact check
    if (filterCarbonImpact === 'high' && loc.carbonImpactKg < 300) return false;
    if (filterCarbonImpact === 'medium' && (loc.carbonImpactKg < 150 || loc.carbonImpactKg >= 300)) return false;

    return true;
  });

  // Calculate nearby summaries
  const totalEventsNearby = filteredLocations.length;
  const carbonSavingPotential = filteredLocations.reduce((sum, l) => sum + l.carbonImpactKg, 0);

  // Generate AI comments on initial loads or filters change
  useEffect(() => {
    if (filteredLocations.length > 0) {
      const delayTimer = setTimeout(() => {
        fetchAIRecommendations(filteredLocations);
      }, 1000);
      return () => clearTimeout(delayTimer);
    }
  }, [maxDistance, selectedCategories.length]);

  // Handle volunteer check in
  const handleCheckIn = async () => {
    if (!activeLocation) return;
    try {
      // Log checked in activity
      await logActivity({
        queryText: `Checked In at: ${activeLocation.name}`,
        category: 'community',
        metrics: {
          carbonEmitted: 0,
          carbonSaved: activeLocation.carbonImpactKg / 10,
          moneySaved: 0,
          waterSaved: 0,
          treesEquivalent: activeLocation.category === 'tree' ? 1 : 0,
          xpEarned: 50,
          greenCoinsEarned: 15
        },
        reasoning: `Volunteered and verified presence at local event: ${activeLocation.name}.`,
        recommendation: `Participate in future drives to sustain neighborhood ecological ratings.`,
        activityType: 'volunteer'
      });
      setCheckoutSuccess(true);
      setTimeout(() => {
        setCheckoutSuccess(false);
        setActiveLocation(null);
      }, 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Determine Map tile url based on theme settings
  const mapStyle = manualTileTheme || (theme === 'dark' ? 'dark' : 'light');
  const tileLayerUrl = mapStyle === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  // Generate User Activity Coordinates overlay (My Green Journey route)
  // Seeds default points around user location to simulate progress
  const userJourneyPoints: [number, number][] = [
    [37.7749, -122.4194],
    [37.7801, -122.4120],
    [37.7780, -122.4150],
    [37.7840, -122.4330]
  ];

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title="Live Community Map"
          description="Sought sustainability hotspots, locate EV slots, join cleanups, and synchronize volunteer rewards."
        />

        {/* GPS location and layer controls quick toggles */}
        <div className="flex items-center gap-2 shrink-0 font-sans">
          <Button variant="secondary" size="sm" className="flex items-center gap-1.5" onClick={handleDetectLocation}>
            <Compass className="h-4 w-4" />
            Find Me
          </Button>
          <button
            onClick={() => setManualTileTheme(mapStyle === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/20 border border-slate-150 dark:border-zinc-900 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/50"
            title="Toggle Map Style"
          >
            {mapStyle === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Filters Control Panel */}
        <div className="lg:col-span-1 space-y-6 font-sans">
          {/* Search bar */}
          <Card variant="glass" className="p-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hotspots..."
              className="bg-transparent border-none text-xs w-full focus:outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
          </Card>

          {/* Map Layer options */}
          <Card variant="glass" className="p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary-500" />
              Green Layers
            </h3>
            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-350">
                <input
                  type="checkbox"
                  checked={layerHeatmap}
                  onChange={(e) => setLayerHeatmap(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-800 text-primary-500 focus:ring-primary-500 bg-transparent h-4 w-4"
                />
                <span>Sustainability Heatmap</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-350">
                <input
                  type="checkbox"
                  checked={layerCarbonForest}
                  onChange={(e) => setLayerCarbonForest(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-800 text-primary-500 focus:ring-primary-500 bg-transparent h-4 w-4"
                />
                <span>Carbon Forest Layer</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-350">
                <input
                  type="checkbox"
                  checked={layerGreenJourney}
                  onChange={(e) => setLayerGreenJourney(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-800 text-primary-500 focus:ring-primary-500 bg-transparent h-4 w-4"
                />
                <span>My Green Journey Path</span>
              </label>
            </div>
          </Card>

          {/* Smart Categories filters */}
          <Card variant="glass" className="p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Filter className="h-4 w-4 text-emerald-500" />
              Category Filters
            </h3>
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              {[
                { id: 'tree', label: 'Tree Drives 🌳' },
                { id: 'recycle', label: 'Recycling Centers ♻️' },
                { id: 'ev', label: 'EV Superchargers ⚡' },
                { id: 'cleanup', label: 'Cleanups 🧹' },
                { id: 'workshop', label: 'Workshops 🌍' },
                { id: 'ngo', label: 'NGO Headquarters 🏢' },
                { id: 'store', label: 'Sustainable Stores 🛍️' },
                { id: 'transport', label: 'Transit Hubs 🚌' }
              ].map((cat) => (
                <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-350">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => handleToggleCategory(cat.id)}
                    className="rounded border-slate-300 dark:border-zinc-800 text-primary-500 focus:ring-primary-500 bg-transparent h-4 w-4"
                  />
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Distance slider & smart toggles */}
          <Card variant="glass" className="p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Search Parameters
            </h3>
            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">Max Distance</span>
                  <span className="text-primary-500">{maxDistance} km</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>

              {/* Toggle Filters */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-slate-750 dark:text-slate-350">
                  <input
                    type="checkbox"
                    checked={filterAccessibility}
                    onChange={(e) => setFilterAccessibility(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-800 text-primary-500 focus:ring-primary-500 bg-transparent h-4 w-4"
                  />
                  <span className="flex items-center gap-1.5"><Accessibility className="h-3.5 w-3.5" /> Wheelchair Friendly</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-750 dark:text-slate-350">
                  <input
                    type="checkbox"
                    checked={filterFamilyFriendly}
                    onChange={(e) => setFilterFamilyFriendly(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-800 text-primary-500 focus:ring-primary-500 bg-transparent h-4 w-4"
                  />
                  <span>Family Friendly 👪</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-750 dark:text-slate-350">
                  <input
                    type="checkbox"
                    checked={filterStudentFriendly}
                    onChange={(e) => setFilterStudentFriendly(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-800 text-primary-500 focus:ring-primary-500 bg-transparent h-4 w-4"
                  />
                  <span>Student Friendly 🎓</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-750 dark:text-slate-350">
                  <input
                    type="checkbox"
                    checked={filterOpenNow}
                    onChange={(e) => setFilterOpenNow(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-800 text-primary-500 focus:ring-primary-500 bg-transparent h-4 w-4"
                  />
                  <span>Open Now 🟢</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-750 dark:text-slate-350">
                  <input
                    type="checkbox"
                    checked={filterFreeEvent}
                    onChange={(e) => setFilterFreeEvent(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-800 text-primary-500 focus:ring-primary-500 bg-transparent h-4 w-4"
                  />
                  <span>Free Events 🎫</span>
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Map Container View */}
        <div className="lg:col-span-3 space-y-6">
          <div className="relative w-full h-[500px] rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-900 bg-slate-900 shadow-xl z-10">
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              className="w-full h-full"
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url={tileLayerUrl}
              />

              <MapViewController center={mapCenter} zoom={mapZoom} />

              {/* User location pulse */}
              {userLocation && (
                <Marker position={userLocation} icon={getCustomIcon('user', '📍')}>
                  <Popup>
                    <div className="p-1 font-sans text-xs">
                      <p className="font-bold">Your Current GPS Position</p>
                      <p className="text-slate-400 mt-1">Acquired from local browser coordinates</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Main Seeded Markers */}
              {filteredLocations.map((loc) => (
                <Marker 
                  key={loc.id} 
                  position={[loc.latitude, loc.longitude]}
                  icon={getCustomIcon(loc.category, getCategoryEmoji(loc.category))}
                >
                  <Popup className="premium-map-popup">
                    <div className="p-3 font-sans w-52 text-left space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="premium" size="sm" className="uppercase">{loc.category}</Badge>
                        <span className="text-[10px] text-slate-400">{calculateDistance(mapCenter[0], mapCenter[1], loc.latitude, loc.longitude).toFixed(1)} km</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">{loc.name}</h4>
                      <p className="text-xs text-slate-450 dark:text-zinc-400 line-clamp-2 leading-relaxed">{loc.description}</p>
                      <button 
                        onClick={() => {
                          setCheckoutSuccess(false);
                          setActiveLocation(loc);
                        }}
                        className="text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-1 mt-1"
                      >
                        Inspect Location Details <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Sustainability Heatmap Layers overlay */}
              {layerHeatmap && filteredLocations.map((loc) => {
                const heatColor = loc.category === 'tree' || loc.category === 'cleanup' 
                  ? '#10B981' 
                  : (loc.category === 'recycle' || loc.category === 'ev' ? '#0D9488' : '#F59E0B');
                return (
                  <React.Fragment key={`heat_${loc.id}`}>
                    {/* Outer faint ring */}
                    <Circle
                      center={[loc.latitude, loc.longitude]}
                      radius={1200}
                      pathOptions={{
                        fillColor: heatColor,
                        fillOpacity: 0.08,
                        color: 'transparent'
                      }}
                    />
                    {/* Inner core ring */}
                    <Circle
                      center={[loc.latitude, loc.longitude]}
                      radius={500}
                      pathOptions={{
                        fillColor: heatColor,
                        fillOpacity: 0.22,
                        color: 'transparent'
                      }}
                    />
                  </React.Fragment>
                );
              })}

              {/* Carbon Forest Layer: Planted trees locations */}
              {layerCarbonForest && (
                <>
                  <Marker position={[37.7705, -122.425]} icon={getCustomIcon('tree', '🌳')}>
                    <Popup><div className="font-sans text-xs">Your Meal Forest tree #1 • Planted June 19</div></Popup>
                  </Marker>
                  <Marker position={[37.7725, -122.428]} icon={getCustomIcon('tree', '🌲')}>
                    <Popup><div className="font-sans text-xs">Your Shopping Forest tree #2 • Planted June 15</div></Popup>
                  </Marker>
                </>
              )}

              {/* My Green Journey overlay line */}
              {layerGreenJourney && (
                <Polyline 
                  positions={userJourneyPoints} 
                  pathOptions={{
                    color: '#10B981',
                    dashArray: '5, 10',
                    weight: 3
                  }} 
                />
              )}

              {/* Dynamic Color-Coded Community Sections based on layers and categories */}
              {((selectedCategories.includes('tree') || layerCarbonForest)) && (
                <Polygon
                  positions={[
                    [37.783, -122.415],
                    [37.783, -122.408],
                    [37.777, -122.408],
                    [37.777, -122.415]
                  ]}
                  pathOptions={{
                    fillColor: '#10B981',
                    fillOpacity: 0.2,
                    color: '#10B981',
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="p-2 font-sans text-xs text-left">
                      <p className="font-extrabold text-emerald-500 font-sans">🌲 SOMA Forestry Zone</p>
                      <p className="text-slate-500 mt-1 font-sans">Sustainability Score: 88%</p>
                      <p className="text-slate-405 text-zinc-400 mt-0.5 font-sans">Focusing on urban canopy density and reforestation drives.</p>
                    </div>
                  </Popup>
                </Polygon>
              )}

              {((selectedCategories.includes('recycle') || layerHeatmap)) && (
                <Polygon
                  positions={[
                    [37.768, -122.425],
                    [37.768, -122.417],
                    [37.762, -122.417],
                    [37.762, -122.425]
                  ]}
                  pathOptions={{
                    fillColor: '#06B6D4',
                    fillOpacity: 0.2,
                    color: '#06B6D4',
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="p-2 font-sans text-xs text-left">
                      <p className="font-extrabold text-cyan-500 font-sans">♻️ Mission Circular Economy Section</p>
                      <p className="text-slate-500 mt-1 font-sans">Recycling Index: 74%</p>
                      <p className="text-slate-405 text-zinc-400 mt-0.5 font-sans">Centering hazardous waste programs and packaging-free pantries.</p>
                    </div>
                  </Popup>
                </Polygon>
              )}

              {selectedCategories.includes('ev') && (
                <Polygon
                  positions={[
                    [37.781, -122.418],
                    [37.781, -122.412],
                    [37.775, -122.412],
                    [37.775, -122.418]
                  ]}
                  pathOptions={{
                    fillColor: '#F59E0B',
                    fillOpacity: 0.2,
                    color: '#F59E0B',
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="p-2 font-sans text-xs text-left">
                      <p className="font-extrabold text-amber-500 font-sans">⚡ Market Street EV Corridor</p>
                      <p className="text-slate-500 mt-1 font-sans">Solar grid power rating: 92%</p>
                      <p className="text-slate-405 text-zinc-400 mt-0.5 font-sans">High-speed EV supercharging infrastructure zone.</p>
                    </div>
                  </Popup>
                </Polygon>
              )}

              {selectedCategories.includes('cleanup') && (
                <Polygon
                  positions={[
                    [37.773, -122.515],
                    [37.773, -122.507],
                    [37.765, -122.507],
                    [37.765, -122.515]
                  ]}
                  pathOptions={{
                    fillColor: '#EF4444',
                    fillOpacity: 0.2,
                    color: '#EF4444',
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="p-2 font-sans text-xs text-left">
                      <p className="font-extrabold text-red-500 font-sans">🧹 Ocean Beach Reforestation & Cleanup Reserve</p>
                      <p className="text-slate-500 mt-1 font-sans">Eco-activity rating: High</p>
                      <p className="text-slate-405 text-zinc-400 mt-0.5 font-sans">Marine microclimates conservation and beach cleanup sweeps.</p>
                    </div>
                  </Popup>
                </Polygon>
              )}

              {(selectedCategories.includes('workshop') || selectedCategories.includes('ngo') || layerGreenJourney) && (
                <Polygon
                  positions={[
                    [37.765, -122.439],
                    [37.765, -122.431],
                    [37.759, -122.431],
                    [37.759, -122.439]
                  ]}
                  pathOptions={{
                    fillColor: '#8B5CF6',
                    fillOpacity: 0.2,
                    color: '#8B5CF6',
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="p-2 font-sans text-xs text-left">
                      <p className="font-extrabold text-violet-500 font-sans">🌍 Castro Eco-Engagement Section</p>
                      <p className="text-slate-500 mt-1 font-sans">Public Engagement: Active</p>
                      <p className="text-slate-405 text-zinc-400 mt-0.5 font-sans">Domestic waste seminar halls and sustainability NGO offices.</p>
                    </div>
                  </Popup>
                </Polygon>
              )}

            </MapContainer>

            {/* Embedded map overlay statistics widget */}
            <div className="absolute bottom-4 left-4 z-20 font-sans pointer-events-none hidden sm:block">
              <Card variant="glass" className="p-3 bg-slate-950/85 backdrop-blur-md border-zinc-800 text-left w-52 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nearby Events</span>
                  <Activity className="h-4.5 w-4.5 text-primary-500 animate-pulse" />
                </div>
                <h4 className="text-lg font-extrabold text-white">{totalEventsNearby} Spots Active</h4>
                <p className="text-[10px] text-slate-400">Carbon Potential: <strong className="text-emerald-450">-{carbonSavingPotential.toLocaleString()} kg CO₂</strong></p>
              </Card>
            </div>
          </div>

          {/* AI Advisor Context recommendations & Map Analytics charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            
            {/* AI advisor panel */}
            <Card variant="glass" className="md:col-span-2 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-500" />
                <h3 className="text-sm font-extrabold text-slate-805 dark:text-slate-100 uppercase tracking-wider">AI Map Advisor</h3>
              </div>

              {aiLoading ? (
                <div className="flex items-center gap-2 py-6 text-xs text-slate-400 dark:text-zinc-500">
                  <div className="h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Gemini is analyzing map coordinates and Carbon Twin trends...</span>
                </div>
              ) : aiAdvice ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10 space-y-2">
                    <span className="font-bold text-sky-400">Commute Reduction</span>
                    <p className="text-slate-650 dark:text-zinc-400 leading-relaxed">{aiAdvice.transport}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/10 space-y-2">
                    <span className="font-bold text-teal-400">Circular Logistics</span>
                    <p className="text-slate-650 dark:text-zinc-400 leading-relaxed">{aiAdvice.circular}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                    <span className="font-bold text-emerald-400">Community Outreach</span>
                    <p className="text-slate-650 dark:text-zinc-400 leading-relaxed">{aiAdvice.community}</p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-450 dark:text-zinc-500">
                  No active advisory profiles loaded. Set parameters in search slide controls to invoke advice.
                </div>
              )}
            </Card>

            {/* Map analytics panel */}
            <Card variant="glass" className="p-5 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500" />
                Community Stats
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-zinc-900 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Active Volunteers</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">2,480 users</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Total Saplings Planted</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">842 saplings</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Sustainability Score</span>
                  <span className="font-bold text-emerald-500">88 / 100</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Detail inspection card dialog */}
      <Modal
        isOpen={!!activeLocation}
        onClose={() => setActiveLocation(null)}
        title={checkoutSuccess ? 'Check-in Verified!' : 'Community Hotspot Details'}
      >
        {checkoutSuccess ? (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 font-sans">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full animate-bounce">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-150">Verification Complete</h4>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              Your community participation has been logged. Earned +50 XP and +15 Green Coins!
            </p>
          </div>
        ) : activeLocation ? (
          <div className="space-y-5 font-sans text-xs sm:text-sm text-left">
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="premium" size="sm" className="uppercase">{activeLocation.category}</Badge>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white mt-1">{activeLocation.name}</h3>
              </div>
              <span className="text-xs text-slate-400 font-bold uppercase shrink-0">
                {calculateDistance(mapCenter[0], mapCenter[1], activeLocation.latitude, activeLocation.longitude).toFixed(1)} km away
              </span>
            </div>

            <p className="text-slate-650 dark:text-zinc-400 leading-relaxed">
              {activeLocation.description}
            </p>

            <div className="p-4 bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-150 dark:border-zinc-900 rounded-2xl space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Address</span>
                <span className="font-semibold text-slate-750 dark:text-slate-350 text-right">{activeLocation.address}</span>
              </div>
              {activeLocation.date && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Schedule</span>
                  <span className="font-semibold text-slate-750 dark:text-slate-350">{activeLocation.date}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Eco Impact rating</span>
                <span className="font-bold text-emerald-500">-{activeLocation.carbonImpactKg} kg CO₂ reduced</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Accessibility</span>
                <span className="font-semibold text-slate-750 dark:text-slate-350">
                  {activeLocation.accessibility ? 'Wheelchair Accessible ✓' : 'Limited access'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="glass" onClick={() => setActiveLocation(null)}>Dismiss</Button>
              <Button variant="primary" onClick={handleCheckIn}>
                Verify Participation & Check-in
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
export default CommunityMap;
