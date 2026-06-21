import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CarbonActivity {
  id: string;
  title: string;
  category: string;
  valueKg: number;
  savedKg: number;
  reasoning: string;
  recommendation: string;
  moneySaved: number;
  waterSaved: number;
  treesEquivalent: number;
  xpEarned: number;
  greenCoinsEarned: number;
  date: string;
}

export interface EcoNotification {
  id: string;
  title: string;
  message: string;
  type: 'achievement' | 'level' | 'score' | 'general';
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
  createdAt: string;
  isOnboarded: boolean;
  onboardingData?: any;
  ecoScore?: number;
  xp?: number;
  level?: number;
  streak?: number;
  greenCoins?: number;
  activities?: CarbonActivity[];
  favorites?: string[];
  notifications?: EcoNotification[];
  badges?: string[];
  receipts?: any[];
  shoppingForestTrees?: number;
  meals?: any[];
  mealForestTrees?: number;
  trips?: any[];
  travelGreenStreak?: number;
  bills?: any[];
  appliances?: any[];
  homeEcoScore?: number;
  transactions?: any[];
  joinedChallenges?: string[];
  completedChallenges?: string[];
  familyDetails?: { invitations: string[]; familyScore: number; familyForestTrees: number };
  collegeDetails?: { collegeName: string; departmentName: string };
  socialPosts?: any[];
  missions?: any[];
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, name: string, phone?: string, place?: string, country?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  saveOnboarding: (data: any, ecoScore: number) => Promise<void>;
  updateProfile: (name: string, occupation?: string, photoURL?: string) => Promise<void>;
  logActivity: (activityData: any) => Promise<void>;
  toggleFavorite: (queryText: string) => Promise<void>;
  dismissNotification: (id: string) => void;
  logReceipt: (receipt: any) => Promise<void>;
  deleteReceipt: (receiptId: string) => Promise<void>;
  logMeal: (meal: any) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  logTrip: (trip: any) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  logBill: (bill: any) => Promise<void>;
  deleteBill: (billId: string) => Promise<void>;
  updateAppliances: (appliances: any[]) => Promise<void>;
  redeemReward: (rewardId: string, costCoins: number, rewardTitle: string) => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
  completeChallenge: (challengeId: string, rewardCoins: number, rewardXp: number) => Promise<void>;
  addSocialPost: (content: string, category: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  joinCollege: (collegeName: string, departmentName: string) => Promise<void>;
  inviteToFamily: (email: string) => Promise<void>;
  completeMission: (missionId: string, type: 'daily' | 'weekly' | 'monthly', xp: number, coins: number) => Promise<void>;
  loginAsDemoUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, rawSetUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = (updatedUser: UserProfile | null | ((prev: UserProfile | null) => UserProfile | null)) => {
    if (typeof updatedUser === 'function') {
      rawSetUser((prev) => {
        const next = updatedUser(prev);
        if (next) {
          localStorage.setItem('carbonmind_user', JSON.stringify(next));
          if (next.email) {
            try {
              const accountsRaw = localStorage.getItem('carbonmind_registered_accounts');
              const accounts = accountsRaw ? JSON.parse(accountsRaw) : {};
              accounts[next.email.toLowerCase()] = next;
              localStorage.setItem('carbonmind_registered_accounts', JSON.stringify(accounts));
            } catch (e) {
              console.error(e);
            }
          }
        } else {
          localStorage.removeItem('carbonmind_user');
        }
        return next;
      });
    } else {
      if (updatedUser) {
        localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
        if (updatedUser.email) {
          try {
            const accountsRaw = localStorage.getItem('carbonmind_registered_accounts');
            const accounts = accountsRaw ? JSON.parse(accountsRaw) : {};
            accounts[updatedUser.email.toLowerCase()] = updatedUser;
            localStorage.setItem('carbonmind_registered_accounts', JSON.stringify(accounts));
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        localStorage.removeItem('carbonmind_user');
      }
      rawSetUser(updatedUser);
    }
  };

  // Initialize session from localStorage (JWT Token architecture placeholder)
  useEffect(() => {
    const savedUser = localStorage.getItem('carbonmind_user');
    const token = localStorage.getItem('carbonmind_token');
    
    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser);
        // Sanitize any residual "Judge" references in local storage
        if (parsed.displayName && (parsed.displayName.includes('Judge') || parsed.displayName === 'Judge Pioneer')) {
          parsed.displayName = 'Eco Pioneer';
        }
        if (parsed.email === 'judge.promptwars@gmail.com') {
          parsed.email = 'demo.pioneer@carbonmind.ai';
        }
        // Ensure default avatars get clean plant photo
        if (!parsed.photoURL || parsed.photoURL.includes('photo-1472099645785-5658abf4ff4e') || parsed.photoURL.includes('photo-1534528741775-53994a69daeb') || parsed.photoURL.includes('dicebear.com/7.x/bottts')) {
          parsed.photoURL = 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=128&h=128&fit=crop&q=80';
        }
        localStorage.setItem('carbonmind_user', JSON.stringify(parsed));
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('carbonmind_user');
        localStorage.removeItem('carbonmind_token');
      }
    }
    setLoading(false);
  }, []);

  const loginWithEmail = async (email: string, _: string) => {
    setLoading(true);
    try {
      let loggedUser: UserProfile | null = null;
      try {
        const accountsRaw = localStorage.getItem('carbonmind_registered_accounts');
        const accounts = accountsRaw ? JSON.parse(accountsRaw) : {};
        loggedUser = accounts[email.toLowerCase()] || null;
      } catch (e) {
        console.error('Error loading account', e);
      }

      if (loggedUser) {
        localStorage.setItem('carbonmind_token', 'mock-jwt-token-header.payload.signature');
        setUser(loggedUser);
      } else {
        const mockUser: UserProfile = {
          uid: 'usr_' + Math.random().toString(36).substr(2, 9),
          email,
          displayName: email.split('@')[0],
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
          role: 'user',
          createdAt: new Date().toISOString(),
          isOnboarded: false,
          activities: [],
          favorites: [],
          notifications: [],
          badges: [],
          receipts: [],
          shoppingForestTrees: 0,
          meals: [],
          mealForestTrees: 0,
          trips: [],
          travelGreenStreak: 0,
          bills: [],
          appliances: [],
          homeEcoScore: 75,
          transactions: [],
          joinedChallenges: ['ch_01'],
          completedChallenges: [],
          familyDetails: { invitations: [], familyScore: 75, familyForestTrees: 10 },
          collegeDetails: { collegeName: '', departmentName: '' },
          socialPosts: [
            { id: 'p1', author: 'Clara Oswald', content: 'Just cycled to campus instead of driving! Saved 2.8kg CO2. 🚲', category: 'travel', likes: 12, liked: false, date: '10 mins ago' },
            { id: 'p2', author: 'Danny Pink', content: 'Swapped my incandescent bulbs for LEDs today. Super easy swap! 💡', category: 'energy', likes: 8, liked: false, date: '1 hr ago' }
          ],
          missions: [
            { id: 'm1', title: 'Walk 2 km today', type: 'daily', xp: 50, coins: 15, completed: false },
            { id: 'm2', title: 'Avoid single-use plastic bottles', type: 'daily', xp: 40, coins: 10, completed: false },
            { id: 'm3', title: 'Skip meat for one meal', type: 'daily', xp: 40, coins: 10, completed: false },
            { id: 'm4', title: 'Reduce electricity usage by 10%', type: 'daily', xp: 60, coins: 20, completed: false },
            { id: 'w1', title: 'Zero Car Commute Week', type: 'weekly', xp: 200, coins: 50, completed: false },
            { id: 'w2', title: 'Ditch plastic bags completely', type: 'weekly', xp: 150, coins: 40, completed: false },
            { id: 'mon1', title: '30-Day Green Commuting Streak', type: 'monthly', xp: 500, coins: 150, completed: false }
          ]
        };
        
        localStorage.setItem('carbonmind_token', 'mock-jwt-token-header.payload.signature');
        setUser(mockUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, name: string, phone?: string, place?: string, country?: string) => {
    setLoading(true);
    try {
      const mockUser: UserProfile = {
        uid: 'usr_' + Math.random().toString(36).substr(2, 9),
        email,
        displayName: name,
        photoURL: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=128&h=128&fit=crop&q=80',
        role: 'user',
        createdAt: new Date().toISOString(),
        isOnboarded: false,
        onboardingData: {
          basicInfo: {
            name,
            phone: phone || '',
            city: place || '',
            country: country || '',
            age: '28',
            occupation: 'Sustainability Pioneer',
            college: '',
            department: ''
          }
        },
        activities: [],
        favorites: [],
        notifications: [],
        badges: [],
        receipts: [],
        shoppingForestTrees: 0,
        meals: [],
        mealForestTrees: 0,
        travelGreenStreak: 0,
        bills: [],
        appliances: [],
        homeEcoScore: 75,
        transactions: [],
        joinedChallenges: ['ch_01'],
        completedChallenges: [],
        familyDetails: { invitations: [], familyScore: 75, familyForestTrees: 10 },
        collegeDetails: { collegeName: '', departmentName: '' },
        socialPosts: [
          { id: 'p1', author: 'Clara Oswald', content: 'Just cycled to campus instead of driving! Saved 2.8kg CO2. 🚲', category: 'travel', likes: 12, liked: false, date: '10 mins ago' },
          { id: 'p2', author: 'Danny Pink', content: 'Swapped my incandescent bulbs for LEDs today. Super easy swap! 💡', category: 'energy', likes: 8, liked: false, date: '1 hr ago' }
        ],
        missions: [
          { id: 'm1', title: 'Walk 2 km today', type: 'daily', xp: 50, coins: 15, completed: false },
          { id: 'm2', title: 'Avoid single-use plastic bottles', type: 'daily', xp: 40, coins: 10, completed: false },
          { id: 'm3', title: 'Skip meat for one meal', type: 'daily', xp: 40, coins: 10, completed: false },
          { id: 'm4', title: 'Reduce electricity usage by 10%', type: 'daily', xp: 60, coins: 20, completed: false },
          { id: 'w1', title: 'Zero Car Commute Week', type: 'weekly', xp: 200, coins: 50, completed: false },
          { id: 'w2', title: 'Ditch plastic bags completely', type: 'weekly', xp: 150, coins: 40, completed: false },
          { id: 'mon1', title: '30-Day Green Commuting Streak', type: 'monthly', xp: 500, coins: 150, completed: false }
        ]
      };
      
      localStorage.setItem('carbonmind_user', JSON.stringify(mockUser));
      localStorage.setItem('carbonmind_token', 'mock-jwt-token-header.payload.signature');
      setUser(mockUser);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const mockUser: UserProfile = {
        uid: 'usr_g_' + Math.random().toString(36).substr(2, 9),
        email: 'google.user@gmail.com',
        displayName: 'Eco Pioneer',
        photoURL: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=128&h=128&fit=crop&q=80',
        role: 'user',
        createdAt: new Date().toISOString(),
        isOnboarded: false,
        activities: [],
        favorites: [],
        notifications: [],
        badges: [],
        receipts: [],
        shoppingForestTrees: 0,
        meals: [],
        mealForestTrees: 0,
        trips: [],
        travelGreenStreak: 0,
        bills: [],
        appliances: [],
        homeEcoScore: 75,
        transactions: [],
        joinedChallenges: ['ch_01'],
        completedChallenges: [],
        familyDetails: { invitations: [], familyScore: 75, familyForestTrees: 10 },
        collegeDetails: { collegeName: '', departmentName: '' },
        socialPosts: [
          { id: 'p1', author: 'Clara Oswald', content: 'Just cycled to campus instead of driving! Saved 2.8kg CO2. 🚲', category: 'travel', likes: 12, liked: false, date: '10 mins ago' },
          { id: 'p2', author: 'Danny Pink', content: 'Swapped my incandescent bulbs for LEDs today. Super easy swap! 💡', category: 'energy', likes: 8, liked: false, date: '1 hr ago' }
        ],
        missions: [
          { id: 'm1', title: 'Walk 2 km today', type: 'daily', xp: 50, coins: 15, completed: false },
          { id: 'm2', title: 'Avoid single-use plastic bottles', type: 'daily', xp: 40, coins: 10, completed: false },
          { id: 'm3', title: 'Skip meat for one meal', type: 'daily', xp: 40, coins: 10, completed: false },
          { id: 'm4', title: 'Reduce electricity usage by 10%', type: 'daily', xp: 60, coins: 20, completed: false },
          { id: 'w1', title: 'Zero Car Commute Week', type: 'weekly', xp: 200, coins: 50, completed: false },
          { id: 'w2', title: 'Ditch plastic bags completely', type: 'weekly', xp: 150, coins: 40, completed: false },
          { id: 'mon1', title: '30-Day Green Commuting Streak', type: 'monthly', xp: 500, coins: 150, completed: false }
        ]
      };
      
      localStorage.setItem('carbonmind_user', JSON.stringify(mockUser));
      localStorage.setItem('carbonmind_token', 'mock-jwt-google-token');
      setUser(mockUser);
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoUser = async () => {
    setLoading(true);
    try {
      const demoUser: UserProfile = {
        uid: 'usr_demo_pioneer',
        email: 'demo.pioneer@carbonmind.ai',
        displayName: 'Eco Pioneer',
        photoURL: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=128&h=128&fit=crop&q=80',
        role: 'user',
        createdAt: new Date().toISOString(),
        isOnboarded: true,
        onboardingData: {
          basicInfo: { name: 'Eco Pioneer', age: '28', country: 'United States', city: 'San Francisco', occupation: 'Sustainability Advocate', college: 'Stanford University', department: 'Civil & Environmental Engineering' },
          transport: { dailyKm: '10', preferredMode: 'cycle', daysPerWeek: '5' },
          food: { dietType: 'vegetarian', mealsPerDay: '3', deliveryFrequency: 'rarely' },
          electricity: { monthlyBill: '80', appliances: ['fridge', 'laptop', 'tv'] },
          water: { dailyShowers: '1', laundryWeekly: '2', dishwashing: 'manual' },
          waste: { plasticUsage: 'medium', recyclingWeekly: '3', composting: false, reusableBags: true, bottleUsage: 'reusable' },
          goals: ['reduce_carbon', 'save_money']
        },
        ecoScore: 84,
        xp: 250,
        level: 11,
        streak: 15,
        greenCoins: 480,
        shoppingForestTrees: 4,
        mealForestTrees: 6,
        travelGreenStreak: 8,
        activities: [
          {
            id: 'act_1',
            title: 'Cycled to SOMA office commute',
            category: 'travel',
            valueKg: 0,
            savedKg: 4.2,
            reasoning: 'Swapped single occupant gasoline driving with active transport.',
            recommendation: 'Cycling is ideal in current partly-cloudy weather.',
            moneySaved: 8.50,
            waterSaved: 0,
            treesEquivalent: 0.19,
            xpEarned: 30,
            greenCoinsEarned: 10,
            date: new Date(Date.now() - 1000 * 60 * 60 * 2).toLocaleDateString()
          },
          {
            id: 'act_2',
            title: 'Logged vegan macro meal',
            category: 'food',
            valueKg: 0.45,
            savedKg: 2.35,
            reasoning: 'Replaced beef consumption with local organic tofu ingredients.',
            recommendation: 'Adding plant-based proteins saves 85% food emissions.',
            moneySaved: 3.20,
            waterSaved: 250,
            treesEquivalent: 0.11,
            xpEarned: 25,
            greenCoinsEarned: 8,
            date: new Date(Date.now() - 1000 * 60 * 60 * 5).toLocaleDateString()
          },
          {
            id: 'act_3',
            title: 'Recycled single-use packaging containers',
            category: 'waste',
            valueKg: 0.1,
            savedKg: 0.8,
            reasoning: 'Diverted packaging waste logs away from municipal landfills.',
            recommendation: 'Use reusable stainless steel mugs to reduce cardboard coffee cups.',
            moneySaved: 1.00,
            waterSaved: 12,
            treesEquivalent: 0.04,
            xpEarned: 15,
            greenCoinsEarned: 5,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24).toLocaleDateString()
          }
        ],
        receipts: [
          {
            id: 'rec_1',
            storeName: "Trader Joe's",
            date: new Date().toISOString().split('T')[0],
            time: '14:23',
            receiptNumber: 'TJ-8823910-K',
            currency: 'USD',
            summary: {
              totalCarbonKg: 12.8,
              totalWaterL: 680,
              totalPlasticG: 180,
              totalPackagingG: 320,
              averageEcoScore: 'B',
              moneySpent: 42.50,
              treesRequired: 0.58,
              greenPurchasesCount: 4,
              highCarbonPurchasesCount: 1
            },
            extractedItems: [
              { name: 'Organic Soy Milk 1L', price: 4.20, quantity: 2, ecoRating: 'A', alternative: { name: 'Local Organic Oat Milk', carbonSavedKg: 0.2, moneySaved: 0.4 } },
              { name: 'Prime Beef Ribeye Steak 500g', price: 18.99, quantity: 1, ecoRating: 'F', alternative: { name: 'Plant-Based Beef Patties', carbonSavedKg: 7.5, moneySaved: 2.5 } },
              { name: 'Fresh Avocados 4-Pack', price: 5.99, quantity: 1, ecoRating: 'C', alternative: { name: 'Local Organic Squash', carbonSavedKg: 0.6, moneySaved: 1.5 } }
            ],
            insights: [
              'Plastic packaging contributes 56% of this receipt\'s waste. Refilling a personal thermos saves plastic.',
              'Swapping beef ribeye for plant-based patties would save 7.5kg CO₂ and $2.50.'
            ],
            timestamp: new Date().toISOString()
          }
        ],
        meals: [
          {
            id: 'meal_1',
            mealName: 'Two Idlis with Sambar',
            cuisine: 'South Indian',
            servingCount: 1,
            mealType: 'Breakfast',
            diningType: 'Home Cooked',
            mealScore: 92,
            mealRating: 'Excellent',
            ingredients: ['Rice Flour', 'Urad Dal', 'Lentils', 'Moringa', 'Tomatoes'],
            nutrition: { calories: 280, protein: 9, carbs: 48, fat: 5, fiber: 6, sodium: 520, healthScore: 88, vitaminScore: 75 },
            sustainability: { carbonEmissionsKg: 0.45, waterFootprintL: 80, landUsageSqM: 1.2, packagingImpact: 'Low', packagingWasteG: 2, foodWastePotentialG: 5, transportationImpactKg: 0.05, isLocal: true, seasonalityScore: 100, sustainabilityScore: 92 },
            coachAdvice: 'Superb choice! Idli and sambar is a fermented, highly digestible, low-carbon meal.',
            alternatives: [{ alternativeName: 'Organic Millet Idli', type: 'low-carbon', expectedCarbonSavingsKg: 0.1, expectedMoneySavings: 0.1 }],
            timestamp: new Date().toISOString()
          }
        ],
        trips: [
          {
            id: 'trip_1',
            origin: 'Mission District',
            destination: 'SOMA Office',
            route: {
              mode: 'Bicycle',
              distanceKm: 3.8,
              durationMin: 12,
              carbonEmittedKg: 0,
              carbonSavedKg: 1.6,
              moneySaved: 3.50
            },
            timestamp: new Date().toISOString()
          }
        ],
        bills: [
          {
            id: 'bill_1',
            provider: 'Pacific Gas & Electric',
            billingDate: new Date().toISOString().split('T')[0],
            unitsConsumed: 280,
            totalAmount: 92.40,
            currency: 'USD',
            tariff: 'Residential Time-Of-Use',
            peakUsageKw: 4.8,
            carbonFootprintKg: 140.0,
            treesEquivalent: 6.36,
            timestamp: new Date().toISOString()
          }
        ],
        badges: ['First Step', 'Eco Beginner', 'Cycling Champion', 'Plastic Warrior'],
        notifications: [
          { id: 'n_welcome', title: 'Welcome to CarbonMind!', message: 'Demo Mode initialized successfully. Explore the platform!', type: 'general' },
          { id: 'n_streak', title: 'Streak Active!', message: 'You have logged green choices 15 days in a row! Streak multiplier is active.', type: 'score' }
        ],
        missions: [
          { id: 'm1', title: 'Walk 2 km today', type: 'daily', xp: 50, coins: 15, completed: true },
          { id: 'm2', title: 'Avoid single-use plastic bottles', type: 'daily', xp: 40, coins: 10, completed: false },
          { id: 'm3', title: 'Skip meat for one meal', type: 'daily', xp: 40, coins: 10, completed: true },
          { id: 'm4', title: 'Reduce electricity usage by 10%', type: 'daily', xp: 60, coins: 20, completed: false },
          { id: 'w1', title: 'Zero Car Commute Week', type: 'weekly', xp: 200, coins: 50, completed: false },
          { id: 'w2', title: 'Ditch plastic bags completely', type: 'weekly', xp: 150, coins: 40, completed: false },
          { id: 'mon1', title: '30-Day Green Commuting Streak', type: 'monthly', xp: 500, coins: 150, completed: false }
        ]
      };

      localStorage.setItem('carbonmind_user', JSON.stringify(demoUser));
      localStorage.setItem('carbonmind_token', 'mock-jwt-demo-wars-token');
      setUser(demoUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('carbonmind_user');
      localStorage.removeItem('carbonmind_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    console.log(`Password reset email sent to: ${email}`);
    return Promise.resolve();
  };

  const saveOnboarding = async (data: any, ecoScore: number) => {
    setLoading(true);
    try {
      const updatedUser: UserProfile = {
        ...user!,
        isOnboarded: true,
        onboardingData: data,
        ecoScore,
        xp: 150, // starting XP
        level: 1, // starting Level
        streak: 1, // starting daily streak
        greenCoins: 100, // starting balance
        activities: [],
        favorites: [],
        receipts: [],
        shoppingForestTrees: 0,
        meals: [],
        mealForestTrees: 0,
        trips: [],
        travelGreenStreak: 0,
        bills: [],
        appliances: [],
        homeEcoScore: 75,
        transactions: [],
        joinedChallenges: ['ch_01'],
        completedChallenges: [],
        familyDetails: { invitations: [], familyScore: 75, familyForestTrees: 10 },
        collegeDetails: { collegeName: '', departmentName: '' },
        socialPosts: [
          { id: 'p1', author: 'Clara Oswald', content: 'Just cycled to campus instead of driving! Saved 2.8kg CO2. 🚲', category: 'travel', likes: 12, liked: false, date: '10 mins ago' },
          { id: 'p2', author: 'Danny Pink', content: 'Swapped my incandescent bulbs for LEDs today. Super easy swap! 💡', category: 'energy', likes: 8, liked: false, date: '1 hr ago' }
        ],
        missions: [
          { id: 'm1', title: 'Walk 2 km today', type: 'daily', xp: 50, coins: 15, completed: false },
          { id: 'm2', title: 'Avoid single-use plastic bottles', type: 'daily', xp: 40, coins: 10, completed: false },
          { id: 'm3', title: 'Skip meat for one meal', type: 'daily', xp: 40, coins: 10, completed: false },
          { id: 'm4', title: 'Reduce electricity usage by 10%', type: 'daily', xp: 60, coins: 20, completed: false },
          { id: 'w1', title: 'Zero Car Commute Week', type: 'weekly', xp: 200, coins: 50, completed: false },
          { id: 'w2', title: 'Ditch plastic bags completely', type: 'weekly', xp: 150, coins: 40, completed: false },
          { id: 'mon1', title: '30-Day Green Commuting Streak', type: 'monthly', xp: 500, coins: 150, completed: false }
        ],
        notifications: [
          {
            id: 'init_note',
            title: 'Welcome onboard!',
            message: `Profile initialized successfully with an EcoScore of ${ecoScore}.`,
            type: 'general'
          }
        ],
        badges: ['First Step']
      };
      
      localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (name: string, occupation?: string, photoURL?: string) => {
    setLoading(true);
    try {
      const updatedUser: UserProfile = {
        ...user!,
        displayName: name,
        photoURL: photoURL || user?.photoURL || null,
        onboardingData: {
          ...user?.onboardingData,
          basicInfo: {
            ...user?.onboardingData?.basicInfo,
            name,
            occupation: occupation || user?.onboardingData?.basicInfo?.occupation
          }
        }
      };

      localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log User Activity & Adjust XP, Coins, Badges, Notifications, Streaks dynamically
   */
  const logActivity = async (scanned: any) => {
    if (!user) return;

    const newActivity: CarbonActivity = {
      id: 'act_' + Math.random().toString(36).substr(2, 9),
      title: scanned.queryText,
      category: scanned.category,
      valueKg: scanned.metrics.carbonEmitted,
      savedKg: scanned.metrics.carbonSaved,
      reasoning: scanned.reasoning,
      recommendation: scanned.recommendation,
      moneySaved: scanned.metrics.moneySaved,
      waterSaved: scanned.metrics.waterSaved,
      treesEquivalent: scanned.metrics.treesEquivalent,
      xpEarned: scanned.metrics.xpEarned,
      greenCoinsEarned: scanned.metrics.greenCoinsEarned,
      date: new Date().toLocaleDateString()
    };

    const updatedActivities = [newActivity, ...(user.activities || [])];
    const newNotifications: EcoNotification[] = [];
    const updatedBadges = [...(user.badges || [])];

    // Progression XP & Level calculations
    let newXp = (user.xp || 150) + newActivity.xpEarned;
    let newLevel = user.level || 1;
    const levelThreshold = 300 * newLevel;

    if (newXp >= levelThreshold) {
      newLevel += 1;
      newXp = newXp - levelThreshold; // Carry over excess XP
      newNotifications.push({
        id: 'lv_' + Math.random(),
        title: 'Level Up!',
        message: `Congratulations! You reached Level ${newLevel}!`,
        type: 'level'
      });
    }

    const newCoins = (user.greenCoins || 100) + newActivity.greenCoinsEarned;

    // EcoScore Live adjustments
    let newScore = user.ecoScore || 75;
    if (newActivity.savedKg > 0) {
      newScore = Math.min(100, newScore + 1); // Green Action increases score
    } else if (newActivity.valueKg > 5.0) {
      newScore = Math.max(0, newScore - 1); // High carbon activity drops score
    }

    // Badge Achievement unlock checks
    const checkBadge = (badgeName: string, condition: boolean) => {
      if (condition && !updatedBadges.includes(badgeName)) {
        updatedBadges.push(badgeName);
        newNotifications.push({
          id: 'badge_' + Math.random(),
          title: 'New Achievement Unlocked!',
          message: `You earned the "${badgeName}" badge!`,
          type: 'achievement'
        });
      }
    };

    checkBadge('Eco Beginner', updatedActivities.length >= 1);
    checkBadge('Cycling Champion', newActivity.category === 'travel' && scanned.activityType === 'cycle');
    checkBadge('Plastic Warrior', newActivity.category === 'waste' && scanned.activityType === 'bottle');
    checkBadge('Tree Protector', newActivity.category === 'trees' && scanned.activityType === 'trees');
    checkBadge('Green Legend', newScore >= 95);

    // Push notification for normal log
    newNotifications.push({
      id: 'log_' + Math.random(),
      title: 'Activity Logged!',
      message: `Earned +${newActivity.xpEarned} XP and +${newActivity.greenCoinsEarned} Coins.`,
      type: 'score'
    });

    const updatedUser: UserProfile = {
      ...user,
      activities: updatedActivities,
      xp: newXp,
      level: newLevel,
      greenCoins: newCoins,
      ecoScore: newScore,
      badges: updatedBadges,
      notifications: [...newNotifications, ...(user.notifications || [])]
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  /**
   * Star/Unstar query in favorites list
   */
  const toggleFavorite = async (queryText: string) => {
    if (!user) return;
    
    const favorites = user.favorites || [];
    const isFav = favorites.includes(queryText);
    const updatedFavorites = isFav
      ? favorites.filter((f) => f !== queryText)
      : [...favorites, queryText];

    const updatedUser: UserProfile = {
      ...user,
      favorites: updatedFavorites
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const dismissNotification = (id: string) => {
    if (!user) return;
    const updatedNotifications = (user.notifications || []).filter((n) => n.id !== id);
    const updatedUser: UserProfile = {
      ...user,
      notifications: updatedNotifications
    };
    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logReceipt = async (scanned: any) => {
    if (!user) return;

    const newReceipt = {
      id: 'rcpt_' + Math.random().toString(36).substr(2, 9),
      storeName: scanned.storeName,
      date: scanned.date || new Date().toISOString().split('T')[0],
      time: scanned.time || '12:00',
      receiptNumber: scanned.receiptNumber || 'N/A',
      currency: scanned.currency || 'USD',
      confidenceScore: scanned.confidenceScore || 0.95,
      language: scanned.language || 'English',
      extractedItems: scanned.extractedItems || [],
      summary: scanned.summary,
      insights: scanned.insights || [],
      timestamp: new Date().toISOString()
    };

    let baseXp = 100;
    let bonusXp = 0;
    let bonusCoins = 0;

    const score = scanned.summary.averageEcoScore;
    if (score === 'A+' || score === 'A') {
      bonusXp = 150;
      bonusCoins = 50;
    } else if (score === 'B') {
      bonusXp = 100;
      bonusCoins = 30;
    } else if (score === 'C') {
      bonusXp = 50;
      bonusCoins = 15;
    }

    if (scanned.summary.totalCarbonKg < 5.0) {
      bonusCoins += 30;
    }

    const totalXpEarned = baseXp + bonusXp;
    const totalCoinsEarned = 20 + bonusCoins;

    let totalCarbonSaved = 0;
    newReceipt.extractedItems.forEach((item: any) => {
      if (item.alternative && item.alternative.carbonSavedKg) {
        totalCarbonSaved += item.alternative.carbonSavedKg;
      }
    });

    const treesGrown = Math.floor(totalCarbonSaved / 10);
    const updatedTrees = (user.shoppingForestTrees || 0) + treesGrown;

    let newXp = (user.xp || 150) + totalXpEarned;
    let newLevel = user.level || 1;
    const levelThreshold = 300 * newLevel;

    const newNotifications: EcoNotification[] = [];

    if (newXp >= levelThreshold) {
      newLevel += 1;
      newXp = newXp - levelThreshold;
      newNotifications.push({
        id: 'lv_' + Math.random(),
        title: 'Level Up!',
        message: `Congratulations! You reached Level ${newLevel}!`,
        type: 'level'
      });
    }

    const newCoins = (user.greenCoins || 100) + totalCoinsEarned;

    let newScore = user.ecoScore || 75;
    if (['A+', 'A', 'B'].includes(score)) {
      newScore = Math.min(100, newScore + 2);
    } else if (['D', 'E', 'F'].includes(score)) {
      newScore = Math.max(1, newScore - 1);
    }

    const updatedBadges = [...(user.badges || [])];
    const checkBadge = (badgeName: string, condition: boolean) => {
      if (condition && !updatedBadges.includes(badgeName)) {
        updatedBadges.push(badgeName);
        newNotifications.push({
          id: 'badge_' + Math.random(),
          title: 'New Achievement Unlocked!',
          message: `You earned the "${badgeName}" badge!`,
          type: 'achievement'
        });
      }
    };

    const currentReceipts = user.receipts || [];
    const updatedReceipts = [newReceipt, ...currentReceipts];

    checkBadge('First Receipt', updatedReceipts.length >= 1);
    checkBadge('Eco Shopper', ['A+', 'A'].includes(score));
    checkBadge('Plastic Reducer', scanned.summary.totalPlasticG < 20 && newReceipt.extractedItems.length >= 3);
    checkBadge('Zero Waste Hero', scanned.summary.totalPackagingG < 50);
    checkBadge('Climate Champion', updatedTrees >= 5);
    checkBadge('Healthy Choice', newReceipt.extractedItems.filter((i: any) => i.category === 'Food').length >= 3 && ['A+', 'A', 'B'].includes(score));
    checkBadge('Green Basket', scanned.summary.highCarbonPurchasesCount === 0);

    newNotifications.push({
      id: 'receipt_' + Math.random(),
      title: 'Receipt Processed successfully!',
      message: `Scanned ${newReceipt.storeName} receipt. Earned +${totalXpEarned} XP and +${totalCoinsEarned} Green Coins.`,
      type: 'general'
    });

    if (treesGrown > 0) {
      newNotifications.push({
        id: 'forest_' + Math.random(),
        title: 'Virtual Trees Grown!',
        message: `Your eco-choices on this trip saved ${totalCarbonSaved.toFixed(1)}kg CO₂, planting ${treesGrown} virtual tree(s) in your Shopping Forest! 🌲`,
        type: 'achievement'
      });
    }

    const updatedUser: UserProfile = {
      ...user,
      receipts: updatedReceipts,
      shoppingForestTrees: updatedTrees,
      xp: newXp,
      level: newLevel,
      greenCoins: newCoins,
      ecoScore: newScore,
      badges: updatedBadges,
      notifications: [...newNotifications, ...(user.notifications || [])]
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const deleteReceipt = async (receiptId: string) => {
    if (!user) return;
    const currentReceipts = user.receipts || [];
    const updatedReceipts = currentReceipts.filter((r: any) => r.id !== receiptId);

    const updatedUser: UserProfile = {
      ...user,
      receipts: updatedReceipts
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logMeal = async (scanned: any) => {
    if (!user) return;

    const newMeal = {
      id: 'meal_' + Math.random().toString(36).substr(2, 9),
      mealName: scanned.mealName,
      cuisine: scanned.cuisine,
      servingCount: scanned.servingCount || 1,
      mealType: scanned.mealType,
      diningType: scanned.diningType,
      characteristics: scanned.characteristics || [],
      ingredients: scanned.ingredients || [],
      nutrition: scanned.nutrition,
      sustainability: scanned.sustainability,
      mealScore: scanned.mealScore,
      mealRating: scanned.mealRating,
      coachAdvice: scanned.coachAdvice,
      alternatives: scanned.alternatives || [],
      timestamp: new Date().toISOString()
    };

    let baseXp = 50;
    let bonusXp = 0;
    let bonusCoins = 10;

    if (newMeal.mealRating === 'Excellent') {
      bonusXp = 100;
      bonusCoins += 20;
    } else if (newMeal.mealRating === 'Good') {
      bonusXp = 50;
      bonusCoins += 10;
    }

    if (newMeal.sustainability.carbonEmissionsKg < 1.0) {
      bonusCoins += 15;
    }

    const totalXpEarned = baseXp + bonusXp;
    const totalCoinsEarned = bonusCoins;

    const currentMeals = user.meals || [];
    const updatedMeals = [newMeal, ...currentMeals];

    const ecoMeals = updatedMeals.filter((m: any) => 
      ['Excellent', 'Good'].includes(m.mealRating) || m.sustainability.carbonEmissionsKg < 1.0
    );
    const updatedMealTrees = Math.floor(ecoMeals.length / 5);

    let newXp = (user.xp || 150) + totalXpEarned;
    let newLevel = user.level || 1;
    const levelThreshold = 300 * newLevel;

    const newNotifications: EcoNotification[] = [];

    if (newXp >= levelThreshold) {
      newLevel += 1;
      newXp = newXp - levelThreshold;
      newNotifications.push({
        id: 'lv_' + Math.random(),
        title: 'Level Up!',
        message: `Congratulations! You reached Level ${newLevel}!`,
        type: 'level'
      });
    }

    const newCoins = (user.greenCoins || 100) + totalCoinsEarned;

    let newScore = user.ecoScore || 75;
    if (['Excellent', 'Good'].includes(newMeal.mealRating)) {
      newScore = Math.min(100, newScore + 1);
    } else if (newMeal.mealRating === 'Needs Improvement') {
      newScore = Math.max(1, newScore - 1);
    }

    const updatedBadges = [...(user.badges || [])];
    const checkBadge = (badgeName: string, condition: boolean) => {
      if (condition && !updatedBadges.includes(badgeName)) {
        updatedBadges.push(badgeName);
        newNotifications.push({
          id: 'badge_' + Math.random(),
          title: 'New Achievement Unlocked!',
          message: `You earned the "${badgeName}" badge!`,
          type: 'achievement'
        });
      }
    };

    checkBadge('Healthy Start', updatedMeals.length >= 1);
    checkBadge('Eco Eater', newMeal.sustainability.carbonEmissionsKg < 0.8);
    checkBadge('Vegetarian Explorer', updatedMeals.filter((m: any) => m.characteristics.includes('Plant-Based') || m.mealName.toLowerCase().includes('veg')).length >= 3);
    checkBadge('Protein Master', newMeal.nutrition.protein >= 30);
    checkBadge('Balanced Plate', newMeal.nutrition.fiber >= 8 && newMeal.nutrition.calories >= 305 && newMeal.nutrition.calories <= 700);
    checkBadge('Climate Chef', updatedMealTrees >= 3);
    checkBadge('Zero Waste Cook', newMeal.sustainability.packagingImpact === 'Low');
    checkBadge('Planet Protector', updatedMealTrees >= 5);

    newNotifications.push({
      id: 'meal_' + Math.random(),
      title: 'Meal Logged!',
      message: `Scanned "${newMeal.mealName}". Earned +${totalXpEarned} XP and +${totalCoinsEarned} Green Coins.`,
      type: 'general'
    });

    if (updatedMealTrees > (user.mealForestTrees || 0)) {
      newNotifications.push({
        id: 'mealforest_' + Math.random(),
        title: 'Meal Forest Tree Grown!',
        message: `Your healthy eating grew a new virtual tree in your Meal Forest! 🌳`,
        type: 'achievement'
      });
    }

    const updatedUser: UserProfile = {
      ...user,
      meals: updatedMeals,
      mealForestTrees: updatedMealTrees,
      xp: newXp,
      level: newLevel,
      greenCoins: newCoins,
      ecoScore: newScore,
      badges: updatedBadges,
      notifications: [...newNotifications, ...(user.notifications || [])]
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const deleteMeal = async (mealId: string) => {
    if (!user) return;
    const currentMeals = user.meals || [];
    const updatedMeals = currentMeals.filter((m: any) => m.id !== mealId);

    const updatedUser: UserProfile = {
      ...user,
      meals: updatedMeals
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logTrip = async (planned: any) => {
    if (!user) return;

    const newTrip = {
      id: 'trip_' + Math.random().toString(36).substr(2, 9),
      origin: planned.origin,
      destination: planned.destination,
      distanceKm: planned.distanceKm,
      weather: planned.weather || {},
      route: planned.route || {},
      timestamp: new Date().toISOString()
    };

    let baseXp = 20;
    let baseCoins = 0;
    const mode = newTrip.route.mode || 'Walking';
    
    // Streak calculations
    const isSustainable = ['Walking', 'Cycling', 'Electric Scooter', 'Electric Car', 'Metro', 'Bus'].includes(mode);
    let newStreak = user.travelGreenStreak || 0;
    if (isSustainable) {
      newStreak += 1;
    } else {
      newStreak = 0;
    }

    if (mode === 'Walking' || mode === 'Cycling') {
      baseXp += 100;
      baseCoins += 50;
    } else if (mode === 'Metro' || mode === 'Bus') {
      baseXp += 70;
      baseCoins += 35;
    } else if (mode === 'Electric Car' || mode === 'Electric Scooter') {
      baseXp += 40;
      baseCoins += 20;
    } else {
      // Petrol car / taxi
      baseXp += 10;
      baseCoins += 5;
    }

    const currentTrips = user.trips || [];
    const updatedTrips = [newTrip, ...currentTrips];

    // Progression XP check
    let newXp = (user.xp || 150) + baseXp;
    let newLevel = user.level || 1;
    const levelThreshold = 300 * newLevel;

    const newNotifications: EcoNotification[] = [];

    if (newXp >= levelThreshold) {
      newLevel += 1;
      newXp = newXp - levelThreshold;
      newNotifications.push({
        id: 'lv_' + Math.random(),
        title: 'Level Up!',
        message: `Congratulations! You reached Level ${newLevel}!`,
        type: 'level'
      });
    }

    const newCoins = (user.greenCoins || 100) + baseCoins;

    // EcoScore change
    let newScore = user.ecoScore || 75;
    if (isSustainable) {
      newScore = Math.min(100, newScore + 1);
    } else if (mode === 'Petrol Car') {
      newScore = Math.max(1, newScore - 1);
    }

    // Carbon saved total calculator
    let totalCarbonSaved = 0;
    updatedTrips.forEach((t: any) => {
      if (t.route && t.route.carbonSavedKg) {
        totalCarbonSaved += t.route.carbonSavedKg;
      }
    });

    const updatedBadges = [...(user.badges || [])];
    const checkBadge = (badgeName: string, condition: boolean) => {
      if (condition && !updatedBadges.includes(badgeName)) {
        updatedBadges.push(badgeName);
        newNotifications.push({
          id: 'badge_' + Math.random(),
          title: 'New Achievement Unlocked!',
          message: `You earned the "${badgeName}" badge!`,
          type: 'achievement'
        });
      }
    };

    checkBadge('Walker', updatedTrips.filter((t: any) => t.route.mode === 'Walking').length >= 3);
    checkBadge('Cyclist', updatedTrips.filter((t: any) => t.route.mode === 'Cycling').length >= 3);
    checkBadge('Public Transport Hero', updatedTrips.filter((t: any) => ['Metro', 'Bus'].includes(t.route.mode)).length >= 5);
    checkBadge('Eco Driver', updatedTrips.filter((t: any) => ['Electric Car', 'Electric Scooter'].includes(t.route.mode)).length >= 3);
    checkBadge('Carbon Saver', totalCarbonSaved >= 10);
    checkBadge('Climate Commuter', newStreak >= 5);
    checkBadge('Green Traveler', totalCarbonSaved >= 25);

    newNotifications.push({
      id: 'trip_' + Math.random(),
      title: 'Travel Route Logged!',
      message: `Completed trip to ${newTrip.destination} via ${mode}. Earned +${baseXp} XP and +${baseCoins} Green Coins.`,
      type: 'general'
    });

    const updatedUser: UserProfile = {
      ...user,
      trips: updatedTrips,
      travelGreenStreak: newStreak,
      xp: newXp,
      level: newLevel,
      greenCoins: newCoins,
      ecoScore: newScore,
      badges: updatedBadges,
      notifications: [...newNotifications, ...(user.notifications || [])]
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const deleteTrip = async (tripId: string) => {
    if (!user) return;
    const currentTrips = user.trips || [];
    const updatedTrips = currentTrips.filter((t: any) => t.id !== tripId);

    const updatedUser: UserProfile = {
      ...user,
      trips: updatedTrips
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logBill = async (scanned: any) => {
    if (!user) return;

    const newBill = {
      id: 'bill_' + Math.random().toString(36).substr(2, 9),
      provider: scanned.provider,
      billingDate: scanned.billingDate || new Date().toISOString().split('T')[0],
      billingPeriod: scanned.billingPeriod,
      unitsConsumed: scanned.unitsConsumed || 0,
      totalAmount: scanned.totalAmount || 0,
      currency: scanned.currency || 'INR',
      tariff: scanned.tariff,
      peakUsageKw: scanned.peakUsageKw || 0,
      previousReading: scanned.previousReading || 0,
      currentReading: scanned.currentReading || 0,
      confidenceScore: scanned.confidenceScore || 0.95,
      carbonFootprintKg: scanned.carbonFootprintKg || 0,
      treesEquivalent: scanned.treesEquivalent || 0,
      timestamp: new Date().toISOString()
    };

    let baseXp = 100;
    let baseCoins = 30;

    if (newBill.unitsConsumed < 250) {
      baseXp += 50;
      baseCoins += 20;
    }

    const currentBills = user.bills || [];
    const updatedBills = [newBill, ...currentBills];

    let newXp = (user.xp || 150) + baseXp;
    let newLevel = user.level || 1;
    const levelThreshold = 300 * newLevel;

    const newNotifications: EcoNotification[] = [];

    if (newXp >= levelThreshold) {
      newLevel += 1;
      newXp = newXp - levelThreshold;
      newNotifications.push({
        id: 'lv_' + Math.random(),
        title: 'Level Up!',
        message: `Congratulations! You reached Level ${newLevel}!`,
        type: 'level'
      });
    }

    const newCoins = (user.greenCoins || 100) + baseCoins;

    let newScore = user.ecoScore || 75;
    if (newBill.unitsConsumed < 300) {
      newScore = Math.min(100, newScore + 1);
    } else if (newBill.unitsConsumed > 400) {
      newScore = Math.max(1, newScore - 1);
    }

    const updatedBadges = [...(user.badges || [])];
    const checkBadge = (badgeName: string, condition: boolean) => {
      if (condition && !updatedBadges.includes(badgeName)) {
        updatedBadges.push(badgeName);
        newNotifications.push({
          id: 'badge_' + Math.random(),
          title: 'New Achievement Unlocked!',
          message: `You earned the "${badgeName}" badge!`,
          type: 'achievement'
        });
      }
    };

    checkBadge('Energy Saver', newBill.unitsConsumed < 250);
    checkBadge('Carbon Reducer', updatedBills.length >= 2 && updatedBills[0].unitsConsumed < updatedBills[1].unitsConsumed);

    newNotifications.push({
      id: 'bill_' + Math.random(),
      title: 'Electricity Bill Logged!',
      message: `Parsed statement from ${newBill.provider}. Earned +${baseXp} XP and +${baseCoins} Green Coins.`,
      type: 'general'
    });

    const updatedUser: UserProfile = {
      ...user,
      bills: updatedBills,
      xp: newXp,
      level: newLevel,
      greenCoins: newCoins,
      ecoScore: newScore,
      badges: updatedBadges,
      notifications: [...newNotifications, ...(user.notifications || [])]
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const deleteBill = async (billId: string) => {
    if (!user) return;
    const currentBills = user.bills || [];
    const updatedBills = currentBills.filter((b: any) => b.id !== billId);

    const updatedUser: UserProfile = {
      ...user,
      bills: updatedBills
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const updateAppliances = async (appliancesList: any[]) => {
    if (!user) return;

    let totalStars = 0;
    let highEfficiencyCount = 0;
    let youngEfficientCount = 0;

    appliancesList.forEach(app => {
      const rating = app.energyRating || 3;
      totalStars += rating;
      if (rating >= 4) {
        highEfficiencyCount++;
        if (app.ageOfAppliance <= 2) {
          youngEfficientCount++;
        }
      }
    });

    const avgStars = appliancesList.length > 0 ? (totalStars / appliancesList.length) : 3;
    const homeScore = Math.min(100, Math.max(0, Math.round(40 + (avgStars - 1) * 15)));

    const newNotifications: EcoNotification[] = [];
    const updatedBadges = [...(user.badges || [])];
    const checkBadge = (badgeName: string, condition: boolean) => {
      if (condition && !updatedBadges.includes(badgeName)) {
        updatedBadges.push(badgeName);
        newNotifications.push({
          id: 'badge_' + Math.random(),
          title: 'New Achievement Unlocked!',
          message: `You earned the "${badgeName}" badge!`,
          type: 'achievement'
        });
      }
    };

    // Achievements checks
    const hasAC = appliancesList.some(a => a.name === 'Air Conditioner');
    checkBadge('Smart Home', highEfficiencyCount >= 5);
    checkBadge('Efficient Living', youngEfficientCount >= 2);
    checkBadge('LED Champion', appliancesList.some(a => a.name === 'Lights' && a.energyRating === 5));

    const updatedUser: UserProfile = {
      ...user,
      appliances: appliancesList,
      homeEcoScore: homeScore,
      badges: updatedBadges,
      notifications: [...newNotifications, ...(user.notifications || [])]
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const redeemReward = async (rewardId: string, costCoins: number, rewardTitle: string) => {
    if (!user) return;
    const currentCoins = user.greenCoins || 0;
    if (currentCoins < costCoins) {
      throw new Error("Insufficient Green Coins balance.");
    }

    const newCoins = currentCoins - costCoins;
    const newTx = {
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      type: 'claim',
      title: `Redeemed ${rewardTitle}`,
      value: `-${costCoins} Coins`,
      desc: `Voucher Code: CM-${Math.random().toString(36).substring(3, 8).toUpperCase()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updatedTransactions = [newTx, ...(user.transactions || [])];
    const newNotifications: EcoNotification[] = [
      {
        id: 'note_' + Math.random(),
        title: 'Reward Redeemed!',
        message: `Successfully claimed "${rewardTitle}" for ${costCoins} coins. Check your Wallet for the voucher code.`,
        type: 'general'
      },
      ...(user.notifications || [])
    ];

    const updatedUser: UserProfile = {
      ...user,
      greenCoins: newCoins,
      transactions: updatedTransactions,
      notifications: newNotifications
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;
    const joined = user.joinedChallenges || [];
    if (joined.includes(challengeId)) return;

    const updatedUser: UserProfile = {
      ...user,
      joinedChallenges: [...joined, challengeId]
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const completeChallenge = async (challengeId: string, rewardCoins: number, rewardXp: number) => {
    if (!user) return;
    const joined = user.joinedChallenges || [];
    const completed = user.completedChallenges || [];

    const updatedJoined = joined.filter(id => id !== challengeId);
    const updatedCompleted = completed.includes(challengeId) ? completed : [...completed, challengeId];

    let newXp = (user.xp || 150) + rewardXp;
    let newLevel = user.level || 1;
    const levelThreshold = 300 * newLevel;
    const newNotifications = [...(user.notifications || [])];

    if (newXp >= levelThreshold) {
      newLevel += 1;
      newXp = newXp - levelThreshold;
      newNotifications.unshift({
        id: 'lv_' + Math.random(),
        title: 'Level Up!',
        message: `Congratulations! You reached Level ${newLevel}!`,
        type: 'level'
      });
    }

    const newCoins = (user.greenCoins || 100) + rewardCoins;
    const newTx = {
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      type: 'earn',
      title: 'Challenge Completed',
      value: `+${rewardCoins} Coins`,
      desc: `Verification Reward (+${rewardXp} XP)`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    newNotifications.unshift({
      id: 'ch_comp_' + Math.random(),
      title: 'Challenge Completed!',
      message: `Completed Challenge! Earned +${rewardXp} XP and +${rewardCoins} Coins.`,
      type: 'achievement'
    });

    const updatedUser: UserProfile = {
      ...user,
      joinedChallenges: updatedJoined,
      completedChallenges: updatedCompleted,
      xp: newXp,
      level: newLevel,
      greenCoins: newCoins,
      transactions: [newTx, ...(user.transactions || [])],
      notifications: newNotifications
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const addSocialPost = async (content: string, category: string) => {
    if (!user) return;

    const newPost = {
      id: 'post_' + Math.random().toString(36).substr(2, 9),
      author: user.displayName || 'Eco Pioneer',
      content,
      category,
      likes: 0,
      liked: false,
      date: 'Just now'
    };

    const updatedUser: UserProfile = {
      ...user,
      socialPosts: [newPost, ...(user.socialPosts || [])]
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const likePost = async (postId: string) => {
    if (!user) return;

    const updatedPosts = (user.socialPosts || []).map((post: any) => {
      if (post.id === postId) {
        const liked = !post.liked;
        return {
          ...post,
          liked,
          likes: liked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    });

    const updatedUser: UserProfile = {
      ...user,
      socialPosts: updatedPosts
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const joinCollege = async (collegeName: string, departmentName: string) => {
    if (!user) return;

    const updatedUser: UserProfile = {
      ...user,
      collegeDetails: { collegeName, departmentName }
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const inviteToFamily = async (email: string) => {
    if (!user) return;
    const currentFamily = user.familyDetails || { invitations: [], familyScore: 75, familyForestTrees: 10 };
    const invitations = currentFamily.invitations || [];

    const updatedUser: UserProfile = {
      ...user,
      familyDetails: {
        ...currentFamily,
        invitations: [...invitations, email]
      }
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const completeMission = async (missionId: string, type: 'daily' | 'weekly' | 'monthly', xp: number, coins: number) => {
    if (!user) return;

    const updatedMissions = (user.missions || []).map((m: any) => {
      if (m.id === missionId) {
        return { ...m, completed: true };
      }
      return m;
    });

    let newXp = (user.xp || 150) + xp;
    let newLevel = user.level || 1;
    const levelThreshold = 300 * newLevel;
    const newNotifications = [...(user.notifications || [])];

    if (newXp >= levelThreshold) {
      newLevel += 1;
      newXp = newXp - levelThreshold;
      newNotifications.unshift({
        id: 'lv_' + Math.random(),
        title: 'Level Up!',
        message: `Congratulations! You reached Level ${newLevel}!`,
        type: 'level'
      });
    }

    const newCoins = (user.greenCoins || 100) + coins;
    const newTx = {
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      type: 'earn',
      title: `Completed ${type === 'daily' ? 'Daily' : type === 'weekly' ? 'Weekly' : 'Monthly'} Mission`,
      value: `+${coins} Coins`,
      desc: `Earned +${xp} XP`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    newNotifications.unshift({
      id: 'miss_comp_' + Math.random(),
      title: 'Mission Completed!',
      message: `Completed mission! Earned +${xp} XP and +${coins} Green Coins.`,
      type: 'achievement'
    });

    const updatedUser: UserProfile = {
      ...user,
      missions: updatedMissions,
      xp: newXp,
      level: newLevel,
      greenCoins: newCoins,
      transactions: [newTx, ...(user.transactions || [])],
      notifications: newNotifications
    };

    localStorage.setItem('carbonmind_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        saveOnboarding,
        updateProfile,
        logActivity,
        toggleFavorite,
        dismissNotification,
        logReceipt,
        deleteReceipt,
        logMeal,
        deleteMeal,
        logTrip,
        deleteTrip,
        logBill,
        deleteBill,
        updateAppliances,
        redeemReward,
        joinChallenge,
        completeChallenge,
        addSocialPost,
        likePost,
        joinCollege,
        inviteToFamily,
        completeMission,
        loginAsDemoUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
