import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  Sparkles,
  Zap,
  Car,
  Utensils,
  Award,
  Wallet,
  Trophy,
  Users,
  Flame,
  Calendar,
  Compass,
  ArrowRight,
  Droplet,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SectionHeader } from '../components/SectionHeader';
import { HeroBanner } from '../components/HeroBanner';
import { StatCard } from '../components/StatCard';
import { ProgressCard } from '../components/ProgressCard';
import { ChartCard } from '../components/ChartCard';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { EcoLineChart, EcoPieChart } from '../components/Charts';
import { calculateEcoScore } from '../utils/ecoScore';
import { CopilotBriefing } from '../components/CopilotBriefing';

export const Dashboard: React.FC = () => {
  const { user, dismissNotification } = useAuth();

  // 1. Time-based Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
  }, []);

  // 2. Computed Onboarding Results
  const scoreResults = useMemo(() => {
    if (user?.onboardingData) {
      return calculateEcoScore(user.onboardingData);
    }
    // Default Fallback
    return {
      score: user?.ecoScore || 75,
      badge: 'Green Warrior' as const,
      description: 'Excellent green habits. Keep reducing footprints!',
      insights: [
        'Commuting by transit has dropped travel emissions significantly.',
        'Dietary outputs are low due to vegan meal logging.',
        'Unplugging stand-by electronics avoids up to 10kg of background energy leakage.'
      ],
      travelScore: 78,
      foodScore: 85,
      energyScore: 70,
      waterScore: 80,
      wasteScore: 75
    };
  }, [user]);

  // Dynamic footprint calculations incorporating actual logs
  const footprintMetrics = useMemo(() => {
    const dailyTravel = parseFloat(user?.onboardingData?.transport?.dailyKm) || 12;
    const travelMode = user?.onboardingData?.transport?.preferredMode || 'car';
    const diet = user?.onboardingData?.food?.dietType || 'mixed';
    
    // Default weekly baselines
    let travelEmissions = dailyTravel * 0.40;
    if (travelMode === 'ev') travelEmissions = dailyTravel * 0.10;
    else if (travelMode === 'bus' || travelMode === 'metro') travelEmissions = dailyTravel * 0.05;
    else if (travelMode === 'cycle' || travelMode === 'walking') travelEmissions = 0;

    let foodEmissions = 3.2;
    if (diet === 'vegan') foodEmissions = 0.8;
    else if (diet === 'vegetarian') foodEmissions = 1.8;
    else if (diet === 'meat') foodEmissions = 7.5;

    const baseDailyCarbon = parseFloat((travelEmissions + foodEmissions + 2.4).toFixed(1));
    
    // Sum actual logs
    let loggedEmitted = 0;
    let loggedSaved = 0;
    let loggedMoney = 0;
    let loggedWater = 0;
    let loggedTrees = 0;

    if (user?.activities && user.activities.length > 0) {
      user.activities.forEach((act) => {
        loggedEmitted += act.valueKg;
        loggedSaved += act.savedKg;
        loggedMoney += act.moneySaved;
        loggedWater += act.waterSaved;
        loggedTrees += act.treesEquivalent;
      });
    }

    const dailyCarbon = parseFloat(Math.max(1.0, baseDailyCarbon - (loggedSaved / 30)).toFixed(1));
    const weeklyCarbon = parseFloat(Math.max(5.0, (baseDailyCarbon * 7) + loggedEmitted - loggedSaved).toFixed(1));
    const monthlyCarbon = parseFloat(Math.max(20.0, (baseDailyCarbon * 30) + loggedEmitted - loggedSaved).toFixed(1));

    return {
      dailyCarbon,
      weeklyCarbon,
      monthlyCarbon,
      weeklySaved: parseFloat((5.0 + loggedSaved).toFixed(1)),
      moneySaved: Math.round(5 + loggedMoney),
      waterSaved: Math.round(15 + loggedWater),
      treesEquivalent: parseFloat((0.2 + loggedTrees).toFixed(1))
    };
  }, [user]);

  // Level & Progression
  const currentXP = user?.xp || 150;
  const currentLevel = user?.level || 1;
  const nextLevelXP = 300;
  const progressPercent = Math.round((currentXP / nextLevelXP) * 100);

  // Streak details
  const streakDays = user?.streak || 1;
  
  const weeklyLogData = useMemo(() => {
    // If the user has logged activities, build a dynamic log chart
    const dailyBase = footprintMetrics.dailyCarbon;
    return [
      { name: 'Mon', value: Math.round(dailyBase * 1.1) },
      { name: 'Tue', value: Math.round(dailyBase * 0.9) },
      { name: 'Wed', value: Math.round(dailyBase * 1.2) },
      { name: 'Thu', value: Math.round(dailyBase) },
      { name: 'Fri', value: Math.round(dailyBase * 0.8) },
      { name: 'Sat', value: Math.round(dailyBase * 0.6) },
      { name: 'Sun', value: Math.round(dailyBase * 0.5) }
    ];
  }, [footprintMetrics.dailyCarbon]);

  const categoryBreakdown = [
    { name: 'Utilities', value: scoreResults.energyScore },
    { name: 'Commute', value: scoreResults.travelScore },
    { name: 'Dietary', value: scoreResults.foodScore },
    { name: 'Waste', value: scoreResults.wasteScore }
  ];

  // Dynamic Achievements lists
  const achievements = useMemo(() => {
    const userBadges = user?.badges || [];
    return [
      { title: 'First Step', desc: 'Registered verified profile', icon: '🌱', unlocked: userBadges.includes('First Step') },
      { title: 'Eco Beginner', desc: 'Logged first carbon activity', icon: '🌳', unlocked: userBadges.includes('Eco Beginner') },
      { title: 'Cycling Champion', desc: 'Commuted via bicycle', icon: '🚲', unlocked: userBadges.includes('Cycling Champion') },
      { title: 'Plastic Warrior', desc: 'Recycled single-use plastics', icon: '♻️', unlocked: userBadges.includes('Plastic Warrior') }
    ];
  }, [user?.badges]);

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-500 font-sans">
      {/* 1. Header welcome */}
      <SectionHeader
        title={`${greeting}, ${user?.displayName || 'Eco Pioneer'}`}
        description="Here is your personalized sustainability scorecard. Small actions build massive impact."
      >
        {/* Streak Counter display */}
        <div className="flex items-center gap-2 p-2 px-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-500 shadow-sm animate-pulse">
          <Flame className="h-5 w-5 fill-amber-500" />
          <span className="font-bold text-sm tracking-wide">{streakDays} Day Streak</span>
        </div>
      </SectionHeader>

      {/* AI Daily Briefing card */}
      <CopilotBriefing />

      {/* Dynamic Notification stack alerts */}
      {user?.notifications && user.notifications.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {user.notifications.slice(0, 3).map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 shadow-sm ${
                  note.type === 'achievement'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
                    : note.type === 'level'
                    ? 'bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-primary-500/25 text-slate-800 dark:text-slate-100'
                    : 'bg-primary-500/10 border-primary-500/20 text-primary-800 dark:text-primary-300'
                }`}
              >
                <div className="flex items-center gap-3 text-xs sm:text-sm">
                  <span className="text-xl">
                    {note.type === 'achievement' ? '🏆' : note.type === 'level' ? '⭐' : '🌱'}
                  </span>
                  <div>
                    <p className="font-bold">{note.title}</p>
                    <p className="text-[10px] opacity-80 mt-0.5">{note.message}</p>
                  </div>
                </div>
                <button
                  onClick={() => dismissNotification(note.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-655"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 2. Onboarding AI insights */}
      <HeroBanner
        title={`Your Tier: ${scoreResults.badge}`}
        description={scoreResults.description}
        actionsSlot={
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-lg">
              Level {currentLevel} Pioneer
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-550">
              {currentXP} / {nextLevelXP} XP ({progressPercent}%)
            </span>
          </div>
        }
        imageSlot={
          <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex flex-col items-center justify-center shadow-lg glow-emerald select-none">
            <span className="text-3xl font-extrabold">{user?.ecoScore || scoreResults.score}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">EcoScore</span>
          </div>
        }
      />

      {/* Flagship Carbon Twin Activation banner */}
      <Card variant="glass" className="relative overflow-hidden bg-gradient-to-r from-teal-500/20 to-sky-500/10 dark:from-teal-950/40 dark:to-sky-950/20 p-6 border border-teal-500/10 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-teal-500" /> Flagship Feature
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2">Simulate Your Future Carbon Twin™</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Meet your living AI avatar. Model custom lifestyle adaptations and predict ecological timeline legacies up to 2050.
            </p>
          </div>
          <Link to="/twin">
            <Button variant="primary" size="md" className="flex items-center gap-1.5 shadow-md">
              Launch Twin Engine <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* 3. Metric Stats boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Daily Footprint Estimate"
          value={`${footprintMetrics.dailyCarbon} kg`}
          change={-12.8}
          changeLabel="vs regional baseline"
          icon={<Car className="h-5 w-5" />}
        />
        <StatCard
          title="Weekly Carbon Saved"
          value={`${footprintMetrics.weeklySaved} kg`}
          isNegativeBetter={false}
          icon={<Leaf className="h-5 w-5" />}
        />
        <StatCard
          title="Water Preserved"
          value={`${footprintMetrics.waterSaved} gal`}
          isNegativeBetter={false}
          icon={<Droplet className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="Money Avoided"
          value={`$${footprintMetrics.moneySaved}`}
          isNegativeBetter={false}
          icon={<Wallet className="h-5 w-5 text-amber-500" />}
        />
      </div>

      {/* 4. AI Insight summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="glass" className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 font-sans">
              <Sparkles className="h-4.5 w-4.5 text-emerald-500" />
              Tailored AI Insights
            </h3>
            
            <div className="grid gap-3">
              {(user?.activities && user.activities.length > 0) ? (
                user.activities.slice(0, 3).map((act, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-850 rounded-2xl flex gap-3 text-xs leading-relaxed text-slate-450 dark:text-zinc-500">
                    <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500 shrink-0 h-fit">
                      🌱
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Log Action: {act.title}</p>
                      <p>{act.recommendation}</p>
                    </div>
                  </div>
                ))
              ) : (
                scoreResults.insights.map((insight, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-850 rounded-2xl flex gap-3 text-xs leading-relaxed text-slate-450 dark:text-zinc-500">
                    <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500 shrink-0 h-fit">
                      🌱
                    </div>
                    <p>{insight}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Level Progress */}
        <Card variant="glass" className="flex flex-col justify-between p-6">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550">
              Progression Level
            </p>
            <h3 className="text-2xl font-bold text-slate-805 dark:text-slate-100">
              Level {currentLevel}
            </h3>
          </div>

          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden mt-4">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-550 mt-2">
            <span>{currentXP} XP</span>
            <span>{nextLevelXP} XP Target</span>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-900 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500">Coins Balance</span>
            <Badge variant="premium" size="md">{user?.greenCoins || 100} Coins</Badge>
          </div>
        </Card>
      </div>

      {/* 5. Weekly charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Weekly Emission Trends"
            subtitle="Carbon totals logged daily in kg CO₂"
          >
            <EcoLineChart data={weeklyLogData} />
          </ChartCard>
        </div>

        {/* Footprint allocation */}
        <ChartCard
          title="Onboarding Category Scores"
          subtitle="Score distribution out of 100 points"
        >
          <EcoPieChart data={categoryBreakdown} />
        </ChartCard>
      </div>

      {/* 6. Guilds & Previews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Achievements Preview */}
        <Card variant="glass" className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 font-sans">
            <Trophy className="h-4.5 w-4.5 text-amber-500" />
            Achievements
          </h4>
          <div className="space-y-3">
            {achievements.map((ac, idx) => (
              <div key={idx} className={`p-3 bg-slate-50/50 dark:bg-zinc-900/30 rounded-xl border border-slate-100 dark:border-zinc-850 flex items-center gap-2.5 text-xs ${
                !ac.unlocked ? 'opacity-40 grayscale' : ''
              }`}>
                <span className="text-xl">{ac.icon}</span>
                <div className="font-sans text-left">
                  <p className="font-bold text-slate-805 dark:text-slate-205">{ac.title}</p>
                  <p className="text-[9px] text-slate-400 dark:text-zinc-550 mt-0.5">{ac.unlocked ? 'Unlocked' : ac.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Leaderboard Preview */}
        <Card variant="glass" className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 font-sans">
            <Award className="h-4.5 w-4.5 text-primary-500" />
            Leaderboard Rank
          </h4>
          <div className="space-y-3">
            {[
              { rank: 1, name: 'Clara Oswald', score: '14.2k pts' },
              { rank: 2, name: 'Danny Pink', score: '12.8k pts' }
            ].map((ld, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400">{ld.rank}.</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-355">{ld.name}</span>
                </div>
                <Badge variant="neutral" size="sm">{ld.score}</Badge>
              </div>
            ))}
            <Link to="/leaderboard" className="block text-center text-xs text-primary-500 font-semibold hover:underline pt-2">
              View Full Leaderboard
            </Link>
          </div>
        </Card>

        {/* Wallet Rewards Preview */}
        <Card variant="glass" className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 font-sans">
            <Wallet className="h-4.5 w-4.5 text-teal-500" />
            Vouchers & Claims
          </h4>
          <div className="space-y-3 text-xs font-sans text-slate-450 dark:text-zinc-450 leading-relaxed">
            <div className="p-3 bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-850 rounded-xl">
              <p className="font-bold text-slate-800 dark:text-slate-150">Tesla Charger Credit</p>
              <p className="text-[10px] text-slate-405 mt-0.5">Locked • Requires 1,200 Pts</p>
            </div>
            <Link to="/rewards" className="block text-center text-xs text-primary-500 font-semibold hover:underline pt-2">
              Browse Rewards Store
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Dashboard;
