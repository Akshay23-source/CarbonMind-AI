import React, { useState, useEffect } from 'react';
import { Sparkles, Sun, Trophy, Activity, Zap, ChefHat, Navigation, Calendar, Award, Star } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface BriefingPayload {
  greeting: string;
  weather: string;
  challenge: string;
  summary: string;
  prediction: string;
  community: string;
  energy: string;
  meal: string;
  travel: string;
  mission: string;
}

export const CopilotBriefing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [brief, setBrief] = useState<BriefingPayload | null>(null);

  useEffect(() => {
    const fetchBriefing = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('carbonmind_token');
        const res = await fetch('/api/ai/copilot/briefing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userProfile: user })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setBrief(data.brief);
          }
        }
      } catch (e) {
        console.error('Failed to load Daily Briefing from API:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchBriefing();
  }, [user?.ecoScore, user?.level]);

  if (loading) {
    return (
      <Card variant="glass" className="p-6 space-y-4 font-sans animate-pulse border-primary-500/10">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
          <div className="h-4 w-36 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
        </div>
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
          <div className="h-4 w-1/2 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
        </div>
      </Card>
    );
  }

  if (!brief) return null;

  return (
    <Card variant="glass" className="bg-gradient-to-br from-indigo-500/10 via-primary-500/5 to-emerald-500/5 border-primary-500/20 p-6 space-y-6 font-sans relative overflow-hidden">
      {/* Absolute glow design */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-zinc-900/60 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-500" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">AI Daily Briefing</span>
        </div>
        <Badge variant="premium" size="sm" className="flex items-center gap-1">
          <Sun className="h-3.5 w-3.5 text-amber-500 animate-spin" style={{ animationDuration: '10s' }} />
          {brief.weather.split(':')[1]?.split('.')[0] || '66°F, Sunny'}
        </Badge>
      </div>

      <div className="space-y-2 text-left">
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{brief.greeting}</h2>
        <p className="text-xs leading-relaxed text-slate-450 dark:text-zinc-500">{brief.summary}</p>
      </div>

      {/* Primary recommendations grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-left">
        
        {/* Today's Challenge */}
        <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-905/30 border border-slate-150/40 dark:border-zinc-900/40 space-y-2">
          <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-500 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5" />
            Today's Challenge
          </span>
          <p className="font-bold text-slate-800 dark:text-slate-200">{brief.challenge}</p>
          <Button variant="primary" size="sm" className="h-8 py-1 text-[10px] font-bold" onClick={() => navigate('/challenges')}>
            Start Mission
          </Button>
        </div>

        {/* AI Mission */}
        <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-905/30 border border-slate-150/40 dark:border-zinc-900/40 space-y-2">
          <span className="font-extrabold uppercase tracking-wider text-[10px] text-primary-500 flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5" />
            Today's AI Mission
          </span>
          <p className="font-bold text-slate-800 dark:text-slate-200">{brief.mission}</p>
          <Button variant="glass" size="sm" className="h-8 py-1 text-[10px] font-bold" onClick={() => navigate('/scanner')}>
            Scan Now
          </Button>
        </div>
      </div>

      {/* Auxiliary category suggestions list */}
      <div className="divide-y divide-slate-100 dark:divide-zinc-900/60 text-xs">
        <div className="py-3 flex items-start gap-3">
          <Navigation className="h-4.5 w-4.5 text-sky-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-750 dark:text-slate-300">Commute Advice</p>
            <p className="text-slate-400 dark:text-zinc-500 mt-0.5">{brief.travel}</p>
          </div>
        </div>
        <div className="py-3 flex items-start gap-3">
          <ChefHat className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-750 dark:text-slate-300">Dietary Recommendation</p>
            <p className="text-slate-400 dark:text-zinc-500 mt-0.5">{brief.meal}</p>
          </div>
        </div>
        <div className="py-3 flex items-start gap-3">
          <Zap className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-750 dark:text-slate-300">Energy Audit Tips</p>
            <p className="text-slate-400 dark:text-zinc-500 mt-0.5">{brief.energy}</p>
          </div>
        </div>
        <div className="py-3 flex items-start gap-3">
          <Activity className="h-4.5 w-4.5 text-teal-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-750 dark:text-slate-300">Carbon Prediction</p>
            <p className="text-slate-400 dark:text-zinc-500 mt-0.5">{brief.prediction}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
export default CopilotBriefing;
