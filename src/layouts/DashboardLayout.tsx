import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { MobileNav } from '../components/MobileNav';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Loader } from '../components/Loader';
import { CopilotOrb } from '../components/CopilotOrb';
import { CopilotChat } from '../components/CopilotChat';
import { DemoTourGuide } from '../components/DemoTourGuide';

export const DashboardLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Network connection triggers for offline fallback alert UI
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Demo Tour States
  const [tourActive, setTourActive] = useState(() => localStorage.getItem('carbonmind_demo_active') === 'true');
  const [tourStep, setTourStep] = useState(() => parseInt(localStorage.getItem('carbonmind_demo_step') || '1'));

  // Proactive messages above the orb
  const [proactiveMsg, setProactiveMsg] = useState<string | null>(null);

  // Sync state with localstorage changes dynamically (useful when tour updates it)
  useEffect(() => {
    const handleStorageChange = () => {
      setTourActive(localStorage.getItem('carbonmind_demo_active') === 'true');
      setTourStep(parseInt(localStorage.getItem('carbonmind_demo_step') || '1'));
    };

    window.addEventListener('storage', handleStorageChange);
    // Poll checks since React Router transitions happen in-app
    const timer = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(timer);
    };
  }, []);

  // Handle proactive suggestion timings
  useEffect(() => {
    if (!user || tourActive) {
      setProactiveMsg(null);
      return;
    }

    // Trigger first alert after 5 seconds
    const firstTimer = setTimeout(() => {
      const messages = [
        "Your EcoScore could reach 92 by replacing one meat meal this week.",
        "Turn off stand-by appliances tonight to save 12 kWh and drop carbon.",
        "Tomorrow's weather is sunny and ideal for a bicycle ride!",
        "New Tree Plantation drive is active only 1.8 km away this Saturday."
      ];
      const randMsg = messages[Math.floor(Math.random() * messages.length)];
      setProactiveMsg(randMsg);
    }, 5000);

    // Trigger updates every 90 seconds
    const intervalTimer = setInterval(() => {
      const messages = [
        "You haven't scanned a grocery receipt today.",
        "Your Carbon Twin predicts a 12% footprint decrease if you cycle twice.",
        "There is a volunteer clean-up drive nearby. Join to earn +50 XP!",
        "You are only 50 XP away from Level 12!"
      ];
      const randMsg = messages[Math.floor(Math.random() * messages.length)];
      setProactiveMsg(randMsg);
    }, 90000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(intervalTimer);
    };
  }, [user?.ecoScore, tourActive]);

  if (loading) {
    return <Loader fullScreen />;
  }

  // Protected route safeguard
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-darkBg transition-colors duration-300">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        {/* Responsive Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Work Area */}
        <main className="flex-1 md:pl-64 pt-16 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating AI Orb */}
      <CopilotOrb
        isOpen={copilotOpen}
        onClick={() => setCopilotOpen(!copilotOpen)}
        proactiveMessage={proactiveMsg}
        onClearProactive={() => setProactiveMsg(null)}
      />

      {/* Expandable Chat Window Drawer */}
      <CopilotChat
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        currentPage={location.pathname}
      />

      {/* Guided Walkthrough Tour Guide */}
      <DemoTourGuide
        active={tourActive}
        setActive={(val) => {
          setTourActive(val);
          if (val) {
            localStorage.setItem('carbonmind_demo_active', 'true');
          } else {
            localStorage.removeItem('carbonmind_demo_active');
          }
        }}
        step={tourStep}
        setStep={(val) => {
          setTourStep(val);
          localStorage.setItem('carbonmind_demo_step', val.toString());
        }}
        setCopilotOpen={setCopilotOpen}
      />

      {/* Offline Alert Indicator */}
      {!isOnline && (
        <div 
          className="fixed bottom-20 left-4 md:left-72 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-bold backdrop-blur-lg shadow-lg animate-pulse" 
          role="alert"
          aria-live="assertive"
        >
          <div className="w-2 h-2 rounded-full bg-red-500" />
          Offline Mode
        </div>
      )}

      {/* Mobile Navigation Bar */}
      <MobileNav />
    </div>
  );
};
export default DashboardLayout;

