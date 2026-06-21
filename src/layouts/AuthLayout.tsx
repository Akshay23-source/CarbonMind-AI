import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from '../components/Loader';

export const AuthLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  // Redirect to dashboard if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-darkBg flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blurs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary-500/10 dark:bg-primary-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-secondary-500/10 dark:bg-secondary-500/5 blur-3xl" />

      {/* Main card box */}
      <div className="w-full max-w-md z-10 flex flex-col items-center">
        <Link to="/" className="flex items-center gap-2.5 mb-8 group">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-premium">
            <Leaf className="h-6 w-6 group-hover:rotate-12 transition-transform" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight font-sans bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-primary-600 to-secondary-600 dark:from-slate-100 dark:via-primary-400 dark:to-secondary-400">
            CarbonMind
          </span>
        </Link>

        <div className="w-full glass-card bg-white/80 dark:bg-zinc-950/80 rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-white/10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default AuthLayout;
