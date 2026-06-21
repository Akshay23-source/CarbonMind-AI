import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart,
  Sparkles,
  Trophy,
  Settings
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const items = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5.5 w-5.5" /> },
    { name: 'Tracker', path: '/tracker', icon: <LineChart className="h-5.5 w-5.5" /> },
    { name: 'AI Coach', path: '/coach', icon: <Sparkles className="h-5.5 w-5.5 text-emerald-500" /> },
    { name: 'Challenges', path: '/challenges', icon: <Trophy className="h-5.5 w-5.5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-5.5 w-5.5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-darkBg/80 backdrop-blur-lg border-t border-slate-100 dark:border-zinc-900 md:hidden flex justify-around py-2 pb-safe-bottom transition-colors duration-300">
      {items.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1.5 px-3 py-1 font-sans text-[10px] font-bold ${
              isActive
                ? 'text-primary-500'
                : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600'
            }`
          }
        >
          {item.icon}
          <span>{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};
