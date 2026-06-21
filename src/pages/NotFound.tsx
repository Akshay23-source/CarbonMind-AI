import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-darkBg flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 font-sans text-center">
      {/* Decorative Blurs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary-500/10 dark:bg-primary-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-secondary-500/10 dark:bg-secondary-500/5 blur-3xl" />

      <div className="max-w-md z-10 space-y-6 flex flex-col items-center">
        <div className="p-4 rounded-full bg-primary-500/10 text-primary-500 border border-primary-500/20 shadow-md">
          <Leaf className="h-10 w-10 animate-bounce" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            404
          </h1>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            Page Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-zinc-500 max-w-xs leading-relaxed mx-auto">
            This trail is unmapped. In production, routing redirects to your landing or active login.
          </p>
        </div>

        <Link to="/" className="pt-2">
          <Button variant="primary" className="flex items-center gap-2">
            <ArrowLeft className="h-4.5 w-4.5" /> Back to Safety
          </Button>
        </Link>
      </div>
    </div>
  );
};
export default NotFound;
