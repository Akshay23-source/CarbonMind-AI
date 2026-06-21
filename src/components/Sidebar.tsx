import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart,
  MessageSquare,
  Users,
  Trophy,
  Award,
  Wallet,
  FileBarChart2,
  Settings,
  X,
  Sparkles,
  Receipt,
  ChefHat,
  Navigation,
  Zap,
  Globe,
  Map,
  Tv,
  Bot,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'AI Dashboard', path: '/ai-dashboard', icon: <Bot className="h-5 w-5 text-indigo-400" /> },
    { name: 'Experience Mode', path: '/experience', icon: <Tv className="h-5 w-5 text-emerald-500" /> },
    { name: 'Meal Analyzer', path: '/meals', icon: <ChefHat className="h-5 w-5 text-indigo-500" /> },
    { name: 'Receipt Scanner', path: '/scanner', icon: <Receipt className="h-5 w-5 text-emerald-500" /> },
    { name: 'Travel Planner', path: '/travel', icon: <Navigation className="h-5 w-5 text-sky-500" /> },
    { name: 'Home Energy', path: '/energy', icon: <Zap className="h-5 w-5 text-amber-500" /> },
    { name: 'Carbon Twin', path: '/twin', icon: <Globe className="h-5 w-5 text-teal-500" /> },
    { name: 'Green Map', path: '/map', icon: <Map className="h-5 w-5 text-emerald-500" /> },
    { name: 'Carbon Tracker', path: '/tracker', icon: <LineChart className="h-5 w-5" /> },
    { name: 'AI Coach', path: '/coach', icon: <Sparkles className="h-5 w-5 text-emerald-500 dark:text-emerald-400" /> },
    { name: 'Challenges', path: '/challenges', icon: <Trophy className="h-5 w-5" /> },
    { name: 'Community', path: '/community', icon: <Users className="h-5 w-5" /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Award className="h-5 w-5" /> },
    { name: 'Rewards', path: '/rewards', icon: <Award className="h-5 w-5 text-amber-500" /> },
    { name: 'Wallet', path: '/wallet', icon: <Wallet className="h-5 w-5" /> },
    { name: 'Reports', path: '/reports', icon: <FileBarChart2 className="h-5 w-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        aria-label="Sidebar Navigation"
        className={`fixed top-0 bottom-0 left-0 z-45 w-64 border-r border-slate-100 dark:border-zinc-900 bg-white dark:bg-darkBg pt-20 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button Mobile */}
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
 
        {/* User Card */}
        {user && (
          <div className="mx-4 my-4 p-4 rounded-2xl glass-card bg-slate-50/50 dark:bg-zinc-900/30 flex items-center gap-3">
            <div className="shrink-0 h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 text-sm font-bold">
              🌱
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-400 dark:text-zinc-550 font-semibold tracking-wider uppercase">
                Eco Level 12
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                {user.displayName || 'Eco Hero'}
              </p>
            </div>
          </div>
        )}
 
        {/* Navigation list */}
        <nav aria-label="Sidebar Menu" className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-16rem)]">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-semibold font-sans rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-l-2 border-primary-500'
                    : 'text-slate-500 dark:text-zinc-450 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
