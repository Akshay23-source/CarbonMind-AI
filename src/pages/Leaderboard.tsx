import React, { useState } from 'react';
import { Award, Crown, Globe, Building, GraduationCap, Home, Users, ArrowUpRight } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'global' | 'city' | 'college' | 'family' | 'friends'>('global');

  // User's total calculated XP (Level * 300 + current level XP)
  const userXP = ((user?.level || 1) - 1) * 300 + (user?.xp || 150);
  const userScore = user?.ecoScore || 75;

  const currentUserLeader = {
    uid: user?.uid || 'usr_current',
    name: user?.displayName || 'You',
    xp: userXP,
    ecoScore: userScore,
    badge: userScore >= 90 ? 'Green Legend' : userScore >= 75 ? 'Sage' : 'Acorn',
    avatarSeed: user?.displayName || 'You',
    isUser: true
  };

  // Helper to generate rankings based on active tab
  const getLeaderboardData = () => {
    interface LeaderItem {
      uid: string;
      name: string;
      xp: number;
      ecoScore: number;
      badge: string;
      avatarSeed: string;
      isUser: boolean;
    }
    const list: LeaderItem[] = [];
    
    // Seed mock data
    const clara = { uid: 'u_clara', name: 'Clara Oswald', xp: 4200, ecoScore: 92, badge: 'Eco Lord', avatarSeed: 'clara', isUser: false };
    const danny = { uid: 'u_danny', name: 'Danny Pink', xp: 2850, ecoScore: 84, badge: 'Sage', avatarSeed: 'danny', isUser: false };
    const sarah = { uid: 'u_sarah', name: 'Sarah Jane', xp: 1400, ecoScore: 78, badge: 'Acorn', avatarSeed: 'sarah', isUser: false };
    const rose = { uid: 'u_rose', name: 'Rose Tyler', xp: 980, ecoScore: 70, badge: 'Acorn', avatarSeed: 'rose', isUser: false };
    const martha = { uid: 'u_martha', name: 'Martha Jones', xp: 840, ecoScore: 68, badge: 'Acorn', avatarSeed: 'martha', isUser: false };

    switch (activeTab) {
      case 'global':
        list.push(clara, danny, currentUserLeader, sarah, rose, martha);
        break;
      case 'city':
        list.push(danny, currentUserLeader, sarah, rose);
        break;
      case 'college':
        if (!user?.collegeDetails?.collegeName) return null; // Needs College Onboarding
        list.push(
          danny,
          currentUserLeader,
          { uid: 'u_clara_col', name: 'Clara Oswald (' + user.collegeDetails.departmentName + ')', xp: 3200, ecoScore: 89, badge: 'Sage', avatarSeed: 'clara', isUser: false }
        );
        break;
      case 'family':
        list.push(currentUserLeader, danny, clara);
        break;
      case 'friends':
        list.push(clara, danny, currentUserLeader, rose);
        break;
      default:
        break;
    }

    // Sort by XP descending
    return list.sort((a, b) => b.xp - a.xp).map((item, index) => ({ ...item, rank: index + 1 }));
  };

  const leaders = getLeaderboardData();

  const tabs = [
    { id: 'global', name: 'Global', icon: Globe },
    { id: 'city', name: 'City', icon: Building },
    { id: 'college', name: 'College', icon: GraduationCap },
    { id: 'family', name: 'Family', icon: Home },
    { id: 'friends', name: 'Friends', icon: Users }
  ] as const;

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      <SectionHeader
        title="Eco Leaderboard"
        description="Compete with top sustainability pioneers globally and rank your weekly carbon offsets."
      />

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-zinc-900 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-150 dark:border-zinc-900 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {leaders === null ? (
        <Card variant="glass" className="p-8 text-center max-w-lg mx-auto space-y-6">
          <div className="p-4 bg-primary-500/10 text-primary-500 rounded-full w-14 h-14 mx-auto flex items-center justify-center">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-sans">
              Join a College Department
            </h3>
            <p className="text-xs text-slate-450 dark:text-zinc-500 font-sans leading-relaxed">
              You haven't joined a college campus league yet. Join one under college competitions in the community board to rank against student departments!
            </p>
          </div>
          <Button variant="primary" className="mx-auto" onClick={() => navigate('/community')}>
            Join College Team
          </Button>
        </Card>
      ) : (
        <Card variant="glass" className="overflow-hidden p-0 border border-slate-100 dark:border-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950/20 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550">
                  <th className="py-4 px-6 w-20">Rank</th>
                  <th className="py-4 px-6">Pioneer</th>
                  <th className="py-4 px-6">Total XP</th>
                  <th className="py-4 px-6">EcoScore</th>
                  <th className="py-4 px-6 text-right">League Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 text-xs sm:text-sm">
                {leaders.map((l) => (
                  <tr
                    key={l.uid}
                    className={`transition-colors ${
                      l.isUser
                        ? 'bg-primary-500/5 hover:bg-primary-500/10'
                        : 'hover:bg-slate-50/30 dark:hover:bg-zinc-950/10'
                    }`}
                  >
                    <td className="py-4 px-6 font-bold">
                      <div className="flex items-center gap-2">
                        {l.rank === 1 ? (
                          <Crown className="h-4.5 w-4.5 text-amber-500 fill-amber-500/20" />
                        ) : (
                          <span className="text-slate-450 dark:text-zinc-500">{l.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${l.avatarSeed}`}
                          name={l.name}
                          size="sm"
                        />
                        <span className={`font-semibold ${
                          l.isUser ? 'text-primary-500' : 'text-slate-805 dark:text-slate-205'
                        }`}>
                          {l.name} {l.isUser && '(You)'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">
                      {l.xp.toLocaleString()} XP
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-600 dark:text-emerald-400">
                      {l.ecoScore} / 100
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Badge variant={l.rank <= 3 ? 'premium' : 'neutral'} size="sm">
                        {l.badge}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
export default Leaderboard;
