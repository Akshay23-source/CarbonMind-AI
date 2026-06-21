import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bot, X } from 'lucide-react';

interface CopilotOrbProps {
  isOpen: boolean;
  onClick: () => void;
  proactiveMessage: string | null;
  onClearProactive: () => void;
}

export const CopilotOrb: React.FC<CopilotOrbProps> = ({
  isOpen,
  onClick,
  proactiveMessage,
  onClearProactive
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Proactive Suggestion Bubble */}
      <AnimatePresence>
        {proactiveMessage && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 15 }}
            className="mb-3 max-w-xs sm:max-w-sm p-4 rounded-2xl glass-card border border-primary-500/20 shadow-xl pointer-events-auto relative text-left"
          >
            {/* Close tip button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearProactive();
              }}
              className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>

            {/* Bubble Header */}
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-primary-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-primary-600 dark:text-primary-400">
                Copilot Insight
              </span>
            </div>

            {/* Bubble message */}
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed pr-3 font-sans">
              {proactiveMessage}
            </p>

            {/* Tap to open hint */}
            <button
              onClick={() => {
                onClick();
                onClearProactive();
              }}
              className="mt-2 text-[10px] font-extrabold text-primary-500 hover:underline flex items-center gap-1"
            >
              Ask Copilot
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Holographic Orb Button */}
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center relative outline-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 shadow-premium dark:shadow-premium-dark"
      >
        {/* Holographic Glowing Pulse Rings */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-primary-500 to-emerald-500 opacity-80 blur-[2px]" />
        
        {/* Animated Rotating Border Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-white/40"
        />

        {/* Pulse expansion background */}
        <motion.div
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-2 rounded-full bg-primary-500/10 dark:bg-primary-500/5 blur-md -z-10"
        />

        {/* Icon Render */}
        <div className="relative z-10 text-white flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="bot"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <Bot className="h-6 w-6 animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active suggestion notifier dot */}
        {proactiveMessage && !isOpen && (
          <span className="absolute top-0 right-0 block h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-zinc-950 bg-amber-500 animate-bounce" />
        )}
      </motion.button>
    </div>
  );
};
export default CopilotOrb;
