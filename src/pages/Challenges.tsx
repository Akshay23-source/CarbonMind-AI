import React, { useState } from 'react';
import { Trophy, Leaf, Zap, Users, CheckCircle2, Circle, Star, Calendar, Bookmark } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { useAuth } from '../contexts/AuthContext';

export const Challenges: React.FC = () => {
  const { user, completeMission, joinChallenge, completeChallenge } = useAuth();
  const [activeTab, setActiveTab] = useState<'missions' | 'challenges'>('missions');
  const [missionSubFilter, setMissionSubFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const targetXp = level * 300;
  const xpProgress = Math.min(100, Math.round((xp / targetXp) * 100));

  const joinedIds = user?.joinedChallenges || [];
  const completedIds = user?.completedChallenges || [];

  const communityChallenges = [
    {
      id: 'ch_01',
      title: 'Zero Car Commute Week',
      description: 'Replace standard vehicle commutes with cycling, train, or walking for 5 consecutive workdays.',
      rewardCoins: 250,
      rewardXp: 150,
      participants: '1,420 Active',
      category: 'travel',
      icon: '🚲'
    },
    {
      id: 'ch_02',
      title: '100% Plant-Based Eating',
      description: 'Eat completely vegan or vegetarian meals for 7 consecutive days to drop dietary carbon totals.',
      rewardCoins: 400,
      rewardXp: 200,
      participants: '860 Active',
      category: 'food',
      icon: '🥗'
    },
    {
      id: 'ch_03',
      title: 'Vampire Draw Offsets',
      description: 'Unplug stand-by electrical devices at night (smart tv, router, adapters) for a week.',
      rewardCoins: 150,
      rewardXp: 100,
      participants: '3,200 Active',
      category: 'energy',
      icon: '🔌'
    }
  ];

  const userMissions = user?.missions || [];

  const filteredMissions = userMissions.filter((m) => {
    if (missionSubFilter === 'all') return true;
    return m.type === missionSubFilter;
  });

  const handleCompleteMission = async (id: string, type: 'daily' | 'weekly' | 'monthly', xpVal: number, coinVal: number) => {
    try {
      await completeMission(id, type, xpVal, coinVal);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinChallenge = async (id: string) => {
    try {
      await joinChallenge(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteChallenge = async (id: string, coins: number, xpVal: number) => {
    try {
      await completeChallenge(id, coins, xpVal);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      <SectionHeader
        title="Eco Challenges & Missions"
        description="Join community-wide environmental goals, complete daily chores, and grow your Eco Level."
      />

      {/* Level XP Progress Banner */}
      <Card variant="glass" className="bg-gradient-to-br from-primary-500/10 via-secondary-500/5 to-emerald-500/10 border-primary-500/20 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Level {level} Explorer</h2>
            </div>
            <p className="text-xs text-slate-450 dark:text-zinc-500 mt-1">
              Complete tasks to earn Green Coins & reach Level {level + 1}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-sm font-extrabold text-primary-500">{xp} / {targetXp} XP</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-zinc-900 rounded-full h-3.5 overflow-hidden border border-slate-200/50 dark:border-zinc-800/50">
          <div
            className="bg-gradient-to-r from-primary-500 to-emerald-450 h-full rounded-full transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </Card>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-100 dark:border-zinc-900">
        <button
          onClick={() => setActiveTab('missions')}
          className={`px-6 py-3.5 text-sm font-bold font-sans border-b-2 transition-all duration-200 ${
            activeTab === 'missions'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-slate-400 dark:text-zinc-550 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Missions Checklist
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-6 py-3.5 text-sm font-bold font-sans border-b-2 transition-all duration-200 ${
            activeTab === 'challenges'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-slate-400 dark:text-zinc-550 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Active Challenges
        </button>
      </div>

      {activeTab === 'missions' ? (
        <div className="space-y-6">
          {/* Sub Filters for Missions */}
          <div className="flex gap-2">
            {(['all', 'daily', 'weekly', 'monthly'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setMissionSubFilter(filter)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-sans uppercase tracking-wider transition-all duration-200 ${
                  missionSubFilter === filter
                    ? 'bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-slate-200'
                    : 'bg-transparent text-slate-400 dark:text-zinc-550 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMissions.map((mission) => (
              <Card
                key={mission.id}
                variant="glass"
                className={`p-4 flex items-center justify-between gap-4 font-sans transition-all border ${
                  mission.completed
                    ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
                    : 'border-slate-100 dark:border-zinc-900 hover:border-primary-500/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    disabled={mission.completed}
                    onClick={() => handleCompleteMission(mission.id, mission.type, mission.xp, mission.coins)}
                    className={`p-1.5 rounded-full transition-all ${
                      mission.completed
                        ? 'text-emerald-500 bg-emerald-500/10 cursor-default'
                        : 'text-slate-400 dark:text-zinc-550 hover:text-primary-500 hover:bg-primary-500/5'
                    }`}
                  >
                    {mission.completed ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>
                  <div>
                    <h4 className={`text-sm font-bold transition-all ${
                      mission.completed ? 'text-slate-400 dark:text-zinc-550 line-through' : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {mission.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-zinc-550 bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded">
                        {mission.type}
                      </span>
                      <span className="text-[10px] text-primary-500 font-bold flex items-center gap-0.5">
                        <Zap className="h-3 w-3" /> +{mission.xp} XP
                      </span>
                      <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                        <Star className="h-3 w-3" /> +{mission.coins} Coins
                      </span>
                    </div>
                  </div>
                </div>

                {!mission.completed && (
                  <Button
                    variant="glass"
                    size="sm"
                    className="text-xs py-1 px-3 h-8"
                    onClick={() => handleCompleteMission(mission.id, mission.type, mission.xp, mission.coins)}
                  >
                    Done
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityChallenges.map((m) => {
            const isJoined = joinedIds.includes(m.id);
            const isCompleted = completedIds.includes(m.id);

            return (
              <Card key={m.id} variant="glass" className="flex flex-col justify-between p-6 space-y-6 relative overflow-hidden group">
                {/* Highlight bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{m.icon}</span>
                    <div className="flex items-center gap-1.5 font-sans">
                      <Badge variant="premium" size="sm">+{m.rewardCoins} Coins</Badge>
                      {isCompleted && <Badge variant="success" size="sm">Completed</Badge>}
                    </div>
                  </div>

                  <div className="space-y-2 font-sans">
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-primary-500 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-450 dark:text-zinc-550">
                      {m.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer Info */}
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between font-sans">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {m.participants}
                  </span>

                  <div className="flex gap-2">
                    {!isCompleted && isJoined && (
                      <Button variant="secondary" size="sm" onClick={() => handleCompleteChallenge(m.id, m.rewardCoins, m.rewardXp)}>
                        Claim Done
                      </Button>
                    )}
                    {!isCompleted && (
                      <Button variant={isJoined ? 'glass' : 'primary'} size="sm" onClick={() => (isJoined ? handleCompleteChallenge(m.id, m.rewardCoins, m.rewardXp) : handleJoinChallenge(m.id))}>
                        {isJoined ? 'Leave' : 'Join'}
                      </Button>
                    )}
                    {isCompleted && (
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 className="h-4.5 w-4.5" />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Challenges;
