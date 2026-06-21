import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, User, Settings, Leaf, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import { Avatar } from './Avatar';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-slate-100 dark:border-zinc-900 bg-white/70 dark:bg-darkBg/75 backdrop-blur-md transition-colors duration-300">
      {/* Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-sans text-sm font-semibold"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Trigger */}
          {user && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              aria-label="Toggle navigation sidebar"
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
 
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-premium">
              <Leaf className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-xl font-extrabold tracking-tight font-sans bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-primary-600 to-secondary-600 dark:from-slate-100 dark:via-primary-400 dark:to-secondary-400">
              CarbonMind <span className="text-xs font-medium uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-500 dark:text-primary-400">AI</span>
            </span>
          </Link>
        </div>
 
        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-100 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-500 dark:text-zinc-400 transition-all hover:scale-105 duration-200"
            aria-label="Switch between light and dark mode"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
 
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Open user profile menu"
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-850 transition-colors focus:outline-none"
              >
                <Avatar
                  src={user.photoURL || undefined}
                  name={user.displayName || 'User'}
                  size="sm"
                  status="online"
                />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-150 dark:border-zinc-850 bg-white dark:bg-zinc-950 p-2 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-200 font-sans">
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-zinc-900">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                        {user.displayName || 'Eco Pioneer'}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </div>
                    <div className="pt-1 border-t border-slate-100 dark:border-zinc-900">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors font-medium text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
