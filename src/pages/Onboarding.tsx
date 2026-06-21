import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Car,
  Utensils,
  Zap,
  Droplet,
  Trash2,
  Target,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { calculateEcoScore, OnboardingData } from '../utils/ecoScore';

const countriesData = [
  { name: 'United States', code: 'US', flag: '🇺🇸', cities: ['San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Seattle', 'Boston', 'Austin'] },
  { name: 'India', code: 'IN', flag: '🇮🇳', cities: ['Mangaluru', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune'] },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow'] },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne'] },
  { name: 'Canada', code: 'CA', flag: '🇨🇦', cities: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa', 'Calgary'] },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'] },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬', cities: ['Singapore'] },
  { name: 'France', code: 'FR', flag: '🇫🇷', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice'] },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'] }
];

export const Onboarding: React.FC = () => {
  const { user, saveOnboarding, logout } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);
  const [scoreBadge, setScoreBadge] = useState<string>('');

  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const getCurrentCities = () => {
    const countryObj = countriesData.find(c => c.name === formData.basicInfo.country);
    return countryObj ? countryObj.cities : ['San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Seattle', 'Boston'];
  };

  const handleBack = () => {
    if (step > 1) {
      prevStep();
    } else {
      logout().then(() => {
        navigate('/login');
      });
    }
  };

  // Form State
  const [formData, setFormData] = useState<OnboardingData>(() => {
    const basic = user?.onboardingData?.basicInfo || {};
    return {
      basicInfo: {
        name: basic.name || user?.displayName || '',
        age: basic.age || '25',
        country: basic.country || 'United States',
        city: basic.city || 'San Francisco',
        occupation: basic.occupation || ''
      },
      transport: { dailyKm: '10', preferredMode: 'car', daysPerWeek: '5' },
      food: { dietType: 'mixed', mealsPerDay: '3', deliveryFrequency: 'rarely' },
      electricity: { monthlyBill: '80', appliances: ['fridge', 'laptop', 'tv'] },
      water: { dailyShowers: '1', laundryWeekly: '2', dishwashing: 'manual' },
      waste: { plasticUsage: 'medium', recyclingWeekly: '3', composting: false, reusableBags: true, bottleUsage: 'reusable' },
      goals: ['reduce_carbon', 'save_money']
    };
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 8));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Quick Developer Bypass
  const handleAutofillDev = () => {
    const devData: OnboardingData = {
      basicInfo: { name: 'Alex Green', age: '28', country: 'United States', city: 'San Francisco', occupation: 'Environmental Researcher', college: 'Stanford University', department: 'Civil & Environmental Engineering' },
      transport: { dailyKm: '12', preferredMode: 'cycle', daysPerWeek: '4' },
      food: { dietType: 'vegan', mealsPerDay: '3', deliveryFrequency: 'rarely' },
      electricity: { monthlyBill: '50', appliances: ['laptop', 'fridge'] },
      water: { dailyShowers: '1', laundryWeekly: '1', dishwashing: 'manual' },
      waste: { plasticUsage: 'low', recyclingWeekly: '5', composting: true, reusableBags: true, bottleUsage: 'reusable' },
      goals: ['reduce_carbon', 'plant_trees', 'protect_environment']
    };
    
    setFormData(devData);
    setStep(7); // Jump straight to goals
  };

  const handleGoalToggle = (goalId: string) => {
    setFormData((prev) => {
      const activeGoals = prev.goals.includes(goalId)
        ? prev.goals.filter((g) => g !== goalId)
        : [...prev.goals, goalId];
      return { ...prev, goals: activeGoals };
    });
  };

  const handleApplianceToggle = (appId: string) => {
    setFormData((prev) => {
      const activeApps = prev.electricity.appliances.includes(appId)
        ? prev.electricity.appliances.filter((a) => a !== appId)
        : [...prev.electricity.appliances, appId];
      return { ...prev, electricity: { ...prev.electricity, appliances: activeApps } };
    });
  };

  const handleComplete = async () => {
    setLoading(true);
    setStep(8); // Go to final score screen

    // Calculate score
    const result = calculateEcoScore(formData);
    setCalculatedScore(result.score);
    setScoreBadge(result.badge);

    // Simulate score loading progress
    setTimeout(async () => {
      await saveOnboarding(formData, result.score);
      setLoading(false);
    }, 3000);
  };

  const handleNavigateDashboard = () => {
    navigate('/dashboard');
  };

  const stepsDetails = [
    { title: 'Profile Information', icon: <User className="h-5 w-5" /> },
    { title: 'Transportation', icon: <Car className="h-5 w-5" /> },
    { title: 'Dietary Habits', icon: <Utensils className="h-5 w-5" /> },
    { title: 'Utility Power', icon: <Zap className="h-5 w-5" /> },
    { title: 'Water Footprint', icon: <Droplet className="h-5 w-5" /> },
    { title: 'Recycling & Waste', icon: <Trash2 className="h-5 w-5" /> },
    { title: 'Sustainability Goals', icon: <Target className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-darkBg py-16 px-4 transition-colors duration-300 flex items-center justify-center font-sans text-left relative overflow-hidden">
      {/* Decorative Blurs */}
      <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full bg-primary-500/5 dark:bg-primary-500/5 blur-3xl -z-10" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-secondary-500/5 dark:bg-secondary-500/5 blur-3xl -z-10" />

      <div className="w-full max-w-2xl space-y-6 z-10">
        {/* Onboarding Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
              Onboarding Wizard
            </h2>
            <p className="text-xs text-slate-400 dark:text-zinc-550">
              {step <= 7 ? `Step ${step} of 7: ${stepsDetails[step - 1].title}` : 'Calculating Footprint'}
            </p>
          </div>
          
          {step < 8 && (
            <Button
              variant="glass"
              size="sm"
              onClick={handleAutofillDev}
              className="text-xs border border-primary-500/20 text-primary-500 bg-primary-500/5"
            >
              Skip & Autofill (Dev Mode)
            </Button>
          )}
        </div>

        {/* Step Progress Tracker */}
        {step <= 7 && (
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full transition-all duration-300"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        )}

        {/* Form Steps Card Container */}
        <Card variant="glass" className="p-8 border border-slate-150/50 dark:border-zinc-850">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* STEP 1: BASIC INFORMATION */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.basicInfo.name}
                      onChange={(e) => setFormData({ ...formData, basicInfo: { ...formData.basicInfo, name: e.target.value } })}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                        Age
                      </label>
                      <input
                        type="number"
                        value={formData.basicInfo.age}
                        onChange={(e) => setFormData({ ...formData, basicInfo: { ...formData.basicInfo, age: e.target.value } })}
                        placeholder="25"
                        className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                        Occupation
                      </label>
                      <input
                        type="text"
                        value={formData.basicInfo.occupation}
                        onChange={(e) => setFormData({ ...formData, basicInfo: { ...formData.basicInfo, occupation: e.target.value } })}
                        placeholder="Software Engineer"
                        className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 relative">
                      <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                        Country
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCountryDropdownOpen(!countryDropdownOpen);
                          setCityDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200 text-left font-sans"
                      >
                        <span>{formData.basicInfo.country || 'Select Country'}</span>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </button>

                      {countryDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setCountryDropdownOpen(false)} />
                          <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                            {countriesData.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    basicInfo: {
                                      ...formData.basicInfo,
                                      country: c.name,
                                      city: c.cities[0] || ''
                                    }
                                  });
                                  setCountryDropdownOpen(false);
                                }}
                                className="w-full px-4 py-2 text-left text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-900 flex items-center gap-2 font-medium"
                              >
                                <span>{c.flag}</span>
                                <span>{c.name}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-1 relative">
                      <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                        City
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCityDropdownOpen(!cityDropdownOpen);
                          setCountryDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200 text-left font-sans"
                      >
                        <span>{formData.basicInfo.city || 'Select City'}</span>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </button>

                      {cityDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setCityDropdownOpen(false)} />
                          <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                            {getCurrentCities().map((city) => (
                              <button
                                key={city}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    basicInfo: {
                                      ...formData.basicInfo,
                                      city: city
                                    }
                                  });
                                  setCityDropdownOpen(false);
                                }}
                                className="w-full px-4 py-2 text-left text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-900 font-medium"
                              >
                                {city}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-zinc-900 pt-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                        College (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.basicInfo.college || ''}
                        onChange={(e) => setFormData({ ...formData, basicInfo: { ...formData.basicInfo, college: e.target.value } })}
                        placeholder="Stanford University"
                        className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                        Department (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.basicInfo.department || ''}
                        onChange={(e) => setFormData({ ...formData, basicInfo: { ...formData.basicInfo, department: e.target.value } })}
                        placeholder="Environmental Science"
                        className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: TRANSPORTATION */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                      Daily Travel Distance (km)
                    </label>
                    <input
                      type="number"
                      value={formData.transport.dailyKm}
                      onChange={(e) => setFormData({ ...formData, transport: { ...formData.transport, dailyKm: e.target.value } })}
                      placeholder="e.g. 15"
                      className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                      Preferred Commuting Mode
                    </label>
                    <select
                      value={formData.transport.preferredMode}
                      onChange={(e: any) => setFormData({ ...formData, transport: { ...formData.transport, preferredMode: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                    >
                      <option value="car">Petrol Car</option>
                      <option value="ev">Electric Vehicle (EV)</option>
                      <option value="bus">Public Bus</option>
                      <option value="metro">Subway / Metro</option>
                      <option value="cycle">Bicycle / Cycle</option>
                      <option value="walking">Walking</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                      Commute days per week
                    </label>
                    <input
                      type="number"
                      value={formData.transport.daysPerWeek}
                      onChange={(e) => setFormData({ ...formData, transport: { ...formData.transport, daysPerWeek: e.target.value } })}
                      placeholder="5"
                      min="0"
                      max="7"
                      className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: FOOD HABITS */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                      Diet Profile
                    </label>
                    <select
                      value={formData.food.dietType}
                      onChange={(e: any) => setFormData({ ...formData, food: { ...formData.food, dietType: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                    >
                      <option value="vegan">Vegan (100% Plant-Based)</option>
                      <option value="vegetarian">Vegetarian (No meat)</option>
                      <option value="mixed">Mixed (Poultry, veggies, details)</option>
                      <option value="meat">Heavy Meat Consumer (Beef/Pork daily)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                        Average meals per day
                      </label>
                      <input
                        type="number"
                        value={formData.food.mealsPerDay}
                        onChange={(e) => setFormData({ ...formData, food: { ...formData.food, mealsPerDay: e.target.value } })}
                        placeholder="3"
                        className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                        Food delivery frequency
                      </label>
                      <select
                        value={formData.food.deliveryFrequency}
                        onChange={(e) => setFormData({ ...formData, food: { ...formData.food, deliveryFrequency: e.target.value } })}
                        className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                      >
                        <option value="never">Never / Homemade</option>
                        <option value="rarely">Rarely (1-2 times weekly)</option>
                        <option value="often">Often (3-5 times weekly)</option>
                        <option value="daily">Daily</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: ELECTRICITY & UTILITIES */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                      Monthly utility Bill ($)
                    </label>
                    <input
                      type="number"
                      value={formData.electricity.monthlyBill}
                      onChange={(e) => setFormData({ ...formData, electricity: { ...formData.electricity, monthlyBill: e.target.value } })}
                      placeholder="e.g. 80"
                      className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                      Active Home Appliances
                    </label>
                    <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-350">
                      {[
                        { id: 'ac', label: 'Air Conditioner' },
                        { id: 'fan', label: 'Fan / Vent' },
                        { id: 'tv', label: 'Smart TV' },
                        { id: 'fridge', label: 'Refrigerator' },
                        { id: 'washer', label: 'Washing Machine' },
                        { id: 'desktop', label: 'Desktop Workstation' },
                        { id: 'laptop', label: 'Personal Laptop' }
                      ].map((app) => (
                        <label key={app.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 cursor-pointer hover:border-primary-500/30 transition-all select-none">
                          <input
                            type="checkbox"
                            checked={formData.electricity.appliances.includes(app.id)}
                            onChange={() => handleApplianceToggle(app.id)}
                            className="h-4 w-4 text-primary-500 rounded focus:ring-primary-500 cursor-pointer"
                          />
                          <span>{app.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: WATER FOOTPRINT */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                        Daily showers
                      </label>
                      <input
                        type="number"
                        value={formData.water.dailyShowers}
                        onChange={(e) => setFormData({ ...formData, water: { ...formData.water, dailyShowers: e.target.value } })}
                        placeholder="1"
                        className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                        Weekly laundry cycles
                      </label>
                      <input
                        type="number"
                        value={formData.water.laundryWeekly}
                        onChange={(e) => setFormData({ ...formData, water: { ...formData.water, laundryWeekly: e.target.value } })}
                        placeholder="2"
                        className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                      Dishwashing habits
                    </label>
                    <select
                      value={formData.water.dishwashing}
                      onChange={(e: any) => setFormData({ ...formData, water: { ...formData.water, dishwashing: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                    >
                      <option value="manual">Manual Sink Washing</option>
                      <option value="dishwasher">Smart Dishwasher Machine</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 6: WASTE & RECYCLING */}
              {step === 6 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                        Single-use plastic usage
                      </label>
                      <select
                        value={formData.waste.plasticUsage}
                        onChange={(e: any) => setFormData({ ...formData, waste: { ...formData.waste, plasticUsage: e.target.value } })}
                        className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                      >
                        <option value="none">Zero single-use plastics</option>
                        <option value="low">Low (Rare packaging)</option>
                        <option value="medium">Medium (Standard groceries)</option>
                        <option value="high">High (Delivery boxes, bottled drinks)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                        Weekly recycling frequency
                      </label>
                      <input
                        type="number"
                        value={formData.waste.recyclingWeekly}
                        onChange={(e) => setFormData({ ...formData, waste: { ...formData.waste, recyclingWeekly: e.target.value } })}
                        placeholder="3"
                        className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-350">
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.waste.composting}
                        onChange={(e) => setFormData({ ...formData, waste: { ...formData.waste, composting: e.target.checked } })}
                        className="h-4 w-4 text-primary-500 rounded focus:ring-primary-500 cursor-pointer"
                      />
                      <span>Compost Organic Waste</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.waste.reusableBags}
                        onChange={(e) => setFormData({ ...formData, waste: { ...formData.waste, reusableBags: e.target.checked } })}
                        className="h-4 w-4 text-primary-500 rounded focus:ring-primary-500 cursor-pointer"
                      />
                      <span>Use Reusable Bags</span>
                    </label>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                      Water Bottle Type
                    </label>
                    <select
                      value={formData.waste.bottleUsage}
                      onChange={(e: any) => setFormData({ ...formData, waste: { ...formData.waste, bottleUsage: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                    >
                      <option value="reusable">Reusable Thermos Flask</option>
                      <option value="disposable">Disposable Plastic Bottles</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 7: SUSTAINABILITY GOALS */}
              {step === 7 && (
                <div className="space-y-4 text-left">
                  <p className="text-xs font-semibold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                    Select Your Sustainability Goals (Select all that apply)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'reduce_carbon', label: 'Reduce Carbon Footprint', desc: 'Lower household and commute emission rates.' },
                      { id: 'save_money', label: 'Save Money', desc: 'Reduce utility and grocery delivery bills.' },
                      { id: 'improve_health', label: 'Improve Health', desc: 'Incorporate cycling, walking and veggie diets.' },
                      { id: 'reduce_plastic', label: 'Reduce Plastic Footprint', desc: 'Avoid single-use cups and packaging waste.' },
                      { id: 'protect_environment', label: 'Protect local ecosystems', desc: 'Support forest offsets and recycling hubs.' },
                      { id: 'plant_trees', label: 'Plant Verified Trees', desc: 'Join afforestation events and track saplings.' }
                    ].map((goal) => (
                      <div
                        key={goal.id}
                        onClick={() => handleGoalToggle(goal.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleGoalToggle(goal.id);
                          }
                        }}
                        tabIndex={0}
                        role="checkbox"
                        aria-checked={formData.goals.includes(goal.id)}
                        className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex flex-col justify-between h-28 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          formData.goals.includes(goal.id)
                            ? 'bg-primary-500/10 border-primary-500 text-slate-850 dark:text-slate-100 shadow-sm'
                            : 'bg-slate-50/50 dark:bg-zinc-900 border-slate-150 dark:border-zinc-800 text-slate-500 dark:text-zinc-450 hover:border-primary-500/30'
                        }`}
                      >
                        <h4 className="text-sm font-bold">{goal.label}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 leading-normal">{goal.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 8: SCORE GENERATION ANIMATION */}
              {step === 8 && (
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-6 min-h-[300px]">
                  {loading ? (
                    <>
                      <div className="relative flex items-center justify-center h-32 w-32">
                        {/* Spin Ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 border-r-transparent border-b-primary-200 border-l-transparent animate-spin" />
                        <Sparkles className="h-10 w-10 text-primary-500 animate-pulse" />
                      </div>
                      <div className="space-y-1.5 font-sans">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                          Analyzing Footprint Data
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 animate-pulse">
                          Running EcoScore algorithms, loading offsets baseline...
                        </p>
                      </div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-6 flex flex-col items-center"
                    >
                      <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex flex-col items-center justify-center text-white shadow-2xl glow-emerald">
                        <span className="text-4xl font-extrabold">{calculatedScore}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">EcoScore</span>
                      </div>
                      
                      <div className="space-y-2 max-w-sm">
                        <Badge variant="premium" size="md">{scoreBadge}</Badge>
                        <h3 className="text-xl font-extrabold text-slate-850 dark:text-slate-100 font-sans">
                          Profile Initialized!
                        </h3>
                        <p className="text-xs leading-relaxed text-slate-450 dark:text-zinc-500 font-sans">
                          Welcome, Pioneer! Your initial score is calculated. Let's explore your personalized environmental metrics.
                        </p>
                      </div>

                      <Button variant="primary" size="lg" onClick={handleNavigateDashboard}>
                        Enter Platform Dashboard
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav Controls */}
          {step <= 7 && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100/50 dark:border-zinc-900">
              <Button
                variant="secondary"
                onClick={handleBack}
                className="flex items-center gap-1.5"
              >
                <ChevronLeft className="h-4.5 w-4.5" /> Back
              </Button>

              {step === 7 ? (
                <Button variant="primary" onClick={handleComplete} className="flex items-center gap-1.5 shadow-premium">
                  Finish Setup <ChevronRight className="h-4.5 w-4.5" />
                </Button>
              ) : (
                <Button variant="primary" onClick={nextStep} className="flex items-center gap-1.5">
                  Continue <ChevronRight className="h-4.5 w-4.5" />
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
export default Onboarding;
