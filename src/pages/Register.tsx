import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, ShieldAlert, Phone, MapPin, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';

export const Register: React.FC = () => {
  const { registerWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [place, setPlace] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countries = [
    { code: 'US', name: 'United States', prefix: '+1', flag: '🇺🇸' },
    { code: 'IN', name: 'India', prefix: '+91', flag: '🇮🇳' },
    { code: 'GB', name: 'United Kingdom', prefix: '+44', flag: '🇬🇧' },
    { code: 'DE', name: 'Germany', prefix: '+49', flag: '🇩🇪' },
    { code: 'CA', name: 'Canada', prefix: '+1', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', prefix: '+61', flag: '🇦🇺' },
    { code: 'SG', name: 'Singapore', prefix: '+65', flag: '🇸🇬' },
    { code: 'FR', name: 'France', prefix: '+33', flag: '🇫🇷' },
    { code: 'AE', name: 'United Arab Emirates', prefix: '+971', flag: '🇦🇪' }
  ];

  const [selectedCountryCode, setSelectedCountryCode] = useState(countries[0].code);
  const [chosenCountry, setChosenCountry] = useState(countries[0].name);

  const currentCountryObj = countries.find(c => c.code === selectedCountryCode) || countries[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone || !place) {
      setError('Please fill in all registration fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fullPhone = `${currentCountryObj.prefix} ${phone.trim()}`;
      await registerWithEmail(email, name, fullPhone, place, chosenCountry);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize account.');
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
      setError(err?.message || 'Google signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-left">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
          Create Account
        </h2>
        <p className="text-xs text-slate-400 dark:text-zinc-550">
          Join the network and track your environmental footprint
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-start gap-2 animate-pulse">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-405 text-zinc-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-405 text-zinc-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Phone Number with changeable country prefixes */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
            Phone Number
          </label>
          <div className="flex gap-2 relative">
            <div className="relative flex shrink-0">
              <select
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                className="pl-3 pr-8 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200 appearance-none cursor-pointer"
              >
                {countries.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.prefix}</option>
                ))}
              </select>
              <Phone className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-slate-450 text-zinc-500" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="123 456 7890"
              className="flex-1 min-w-0 px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Place */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
            Place / City
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-405 text-zinc-500" />
            <input
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="e.g. New York or Mangaluru"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Country */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
            Country
          </label>
          <div className="relative flex">
            <select
              value={chosenCountry}
              onChange={(e) => setChosenCountry(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200 appearance-none cursor-pointer"
            >
              {countries.map(c => (
                <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
              ))}
            </select>
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-slate-405 text-zinc-500" />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
          />
        </div>

        <Button type="submit" isLoading={loading} className="w-full mt-2">
          Create Account
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="absolute inset-0 border-t border-slate-100 dark:border-zinc-800" />
        <span className="relative px-3 bg-white dark:bg-zinc-950 text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
          Or Register With
        </span>
      </div>

      <Button
        variant="glass"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 border border-slate-150 dark:border-zinc-800"
      >
        Google Account
      </Button>

      <p className="text-xs text-center text-slate-400 dark:text-zinc-550">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-500 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};
export default Register;
