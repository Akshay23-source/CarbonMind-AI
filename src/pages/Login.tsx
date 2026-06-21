import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldAlert, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';

export const Login: React.FC = () => {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoTourClick = () => {
    navigate('/experience');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Google Auth failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-left">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
          Welcome Back
        </h2>
        <p className="text-xs text-slate-400 dark:text-zinc-500">
          Enter credentials to access your sustainability portal
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-655 dark:text-red-400 rounded-xl text-xs flex items-start gap-2 animate-pulse">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-550" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
              Password
            </label>
            <a href="#" className="text-xs text-primary-500 hover:underline">
              Forgot Password?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-550" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        <Button type="submit" isLoading={loading} className="w-full mt-2">
          Sign In
        </Button>
        <Button
          type="button"
          onClick={handleDemoTourClick}
          className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-none text-white font-bold flex items-center justify-center gap-2 shadow-lg animate-bounce"
        >
          <Play className="h-4 w-4 fill-white text-white" />
          Demo Tour Login
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="absolute inset-0 border-t border-slate-100 dark:border-zinc-800" />
        <span className="relative px-3 bg-white dark:bg-zinc-950 text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
          Or Continue With
        </span>
      </div>

      {/* Google Login Button */}
      <Button
        variant="glass"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 border border-slate-150 dark:border-zinc-800"
      >
        {/* Google Colored Icon */}
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.745 1.055 14.99 0 12 0 7.354 0 3.307 2.69 1.354 6.613l3.912 3.152z"
          />
          <path
            fill="#4285F4"
            d="M23.49 12.275c0-.825-.075-1.62-.21-2.385H12v4.515h6.48a5.54 5.54 0 01-2.4 3.63v3.015h3.87c2.265-2.085 3.54-5.145 3.54-8.775z"
          />
          <path
            fill="#FBBC05"
            d="M5.266 14.235l-3.912 3.15A11.968 11.968 0 0012 24c3.24 0 5.97-1.08 7.965-2.925l-3.87-3.015a7.125 7.125 0 01-10.829-3.825z"
          />
          <path
            fill="#34A853"
            d="M12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.745 1.055 14.99 0 12 0 7.354 0 3.307 2.69 1.354 6.613l3.912 3.152a7.125 7.125 0 010 7.62l-3.912 3.15A11.968 11.968 0 0012 24"
            className="hidden" // adjust matching tags
          />
        </svg>
        Google Account
      </Button>

      <p className="text-xs text-center text-slate-400 dark:text-zinc-550">
        New to CarbonMind?{' '}
        <Link to="/register" className="text-primary-500 font-semibold hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
};
export default Login;
