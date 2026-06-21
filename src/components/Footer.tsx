import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Github, Twitter, Linkedin, Heart } from 'lucide-react';
import { Button } from './Button';

export const Footer: React.FC = () => {
  return (
    <footer aria-label="Site Footer" className="border-t border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950/20 py-16 transition-colors duration-300 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Pitch */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-lg font-extrabold tracking-tight">
                CarbonMind <span className="text-xs text-primary-500 font-bold uppercase">AI</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 dark:text-zinc-500 max-w-sm">
              Helping humanity reduce carbon footprint and transition to sustainable living using AI predictive algorithms, community missions, and digital wallets.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="GitHub profile" className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Twitter profile" className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="LinkedIn profile" className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
 
          {/* Links 1 */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wider uppercase mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-zinc-450">
              <li><Link to="/tracker" className="hover:text-primary-500 transition-colors">Carbon Tracking</Link></li>
              <li><Link to="/coach" className="hover:text-primary-500 transition-colors">AI Coaching</Link></li>
              <li><Link to="/challenges" className="hover:text-primary-500 transition-colors">Community Challenges</Link></li>
              <li><Link to="/rewards" className="hover:text-primary-500 transition-colors">Green Rewards</Link></li>
            </ul>
          </div>
 
          {/* Links 2 */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wider uppercase mb-4">
              Resources
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-zinc-450">
              <li><a href="#" className="hover:text-primary-500 transition-colors">Methodology</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">API Docs</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
 
          {/* Links 3 (Newsletter) */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wider uppercase mb-4">
              Stay Connected
            </h4>
            <p className="text-xs text-slate-450 dark:text-zinc-500">
              Subscribe to get updates on monthly carbon reports and challenge launches.
            </p>
            <div className="flex gap-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Newsletter Email Address
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter email"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
              />
              <Button variant="primary" size="sm" className="px-3.5" aria-label="Join newsletter">Join</Button>
            </div>
          </div>
        </div>

        {/* Lower row */}
        <div className="border-t border-slate-100 dark:border-zinc-900 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} CarbonMind AI. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for a better tomorrow
          </p>
        </div>
      </div>
    </footer>
  );
};
