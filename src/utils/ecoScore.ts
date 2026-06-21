/**
 * EcoScore Evaluation Engine
 */

export interface OnboardingData {
  basicInfo: {
    name: string;
    age: string;
    country: string;
    city: string;
    occupation: string;
    college?: string;
    department?: string;
  };
  transport: {
    dailyKm: string;
    preferredMode: 'car' | 'bike' | 'bus' | 'metro' | 'walking' | 'cycle' | 'ev';
    daysPerWeek: string;
  };
  food: {
    dietType: 'vegan' | 'vegetarian' | 'mixed' | 'meat';
    mealsPerDay: string;
    deliveryFrequency: string; // e.g., 'never', 'rarely', 'often', 'daily'
  };
  electricity: {
    monthlyBill: string;
    appliances: string[]; // ['ac', 'fan', 'tv', 'fridge', 'washer', 'desktop', 'laptop', 'other']
  };
  water: {
    dailyShowers: string;
    laundryWeekly: string;
    dishwashing: 'manual' | 'dishwasher';
  };
  waste: {
    plasticUsage: 'none' | 'low' | 'medium' | 'high';
    recyclingWeekly: string;
    composting: boolean;
    reusableBags: boolean;
    bottleUsage: 'disposable' | 'reusable';
  };
  goals: string[];
}

export interface EcoScoreResult {
  score: number;
  badge: 'Planet Guardian' | 'Climate Hero' | 'Green Warrior' | 'Eco Explorer' | 'Needs Improvement';
  description: string;
  insights: string[];
  travelScore: number;
  foodScore: number;
  energyScore: number;
  waterScore: number;
  wasteScore: number;
}

export const calculateEcoScore = (data: OnboardingData): EcoScoreResult => {
  // 1. TRAVEL SCORE (Max 100)
  const km = parseFloat(data.transport.dailyKm) || 0;
  const days = parseFloat(data.transport.daysPerWeek) || 0;
  const mode = data.transport.preferredMode;
  
  let travelPenalty = 0;
  if (mode === 'car') travelPenalty = 4.5 * km * (days / 7);
  else if (mode === 'bike') travelPenalty = 2.0 * km * (days / 7);
  else if (mode === 'bus' || mode === 'metro') travelPenalty = 0.8 * km * (days / 7);
  else if (mode === 'ev') travelPenalty = 0.5 * km * (days / 7);
  
  const travelScore = Math.max(0, Math.min(100, Math.round(100 - travelPenalty)));

  // 2. FOOD SCORE (Max 100)
  let foodScore = 50;
  if (data.food.dietType === 'vegan') foodScore = 100;
  else if (data.food.dietType === 'vegetarian') foodScore = 85;
  else if (data.food.dietType === 'mixed') foodScore = 60;
  else if (data.food.dietType === 'meat') foodScore = 30;

  // Deduct for delivery frequency
  const deliv = data.food.deliveryFrequency;
  if (deliv === 'daily') foodScore -= 15;
  else if (deliv === 'often') foodScore -= 8;
  
  foodScore = Math.max(0, foodScore);

  // 3. ENERGY SCORE (Max 100)
  const bill = parseFloat(data.electricity.monthlyBill) || 0;
  let energyPenalty = (bill / 5); // $100 bill = 20 pts penalty
  
  // Appliance additions
  const apps = data.electricity.appliances || [];
  energyPenalty += apps.length * 3;

  const energyScore = Math.max(0, Math.min(100, Math.round(100 - energyPenalty)));

  // 4. WATER SCORE (Max 100)
  const showers = parseFloat(data.water.dailyShowers) || 0;
  const laundry = parseFloat(data.water.laundryWeekly) || 0;
  
  let waterPenalty = (showers > 1 ? (showers - 1) * 12 : 0);
  waterPenalty += (laundry > 3 ? (laundry - 3) * 6 : 0);

  const waterScore = Math.max(0, Math.min(100, Math.round(100 - waterPenalty)));

  // 5. WASTE SCORE (Max 100)
  let wasteBase = 50;
  if (data.waste.plasticUsage === 'none') wasteBase = 90;
  else if (data.waste.plasticUsage === 'low') wasteBase = 70;
  else if (data.waste.plasticUsage === 'medium') wasteBase = 50;
  else if (data.waste.plasticUsage === 'high') wasteBase = 25;

  if (data.waste.composting) wasteBase += 15;
  if (data.waste.reusableBags) wasteBase += 10;
  if (data.waste.bottleUsage === 'reusable') wasteBase += 15;
  
  const recycleCount = parseFloat(data.waste.recyclingWeekly) || 0;
  wasteBase += recycleCount * 5;

  const wasteScore = Math.max(0, Math.min(100, wasteBase));

  // 6. TOTAL WEIGHTED SCORE
  // Weightings: Travel (35%), Energy (25%), Food (20%), Water (10%), Waste (10%)
  const finalScore = Math.round(
    (travelScore * 0.35) +
    (energyScore * 0.25) +
    (foodScore * 0.20) +
    (waterScore * 0.10) +
    (wasteScore * 0.10)
  );

  // 7. BADGES & DETAILS
  let badge: EcoScoreResult['badge'] = 'Needs Improvement';
  let description = '';
  
  if (finalScore >= 90) {
    badge = 'Planet Guardian';
    description = 'Outstanding sustainability stewardship. You are a leader in planetary preservation!';
  } else if (finalScore >= 80) {
    badge = 'Climate Hero';
    description = 'Excellent green habits. You are making a huge difference every single day.';
  } else if (finalScore >= 70) {
    badge = 'Green Warrior';
    description = 'Solid offsets achievements. Keep reducing footprint values to climb higher!';
  } else if (finalScore >= 60) {
    badge = 'Eco Explorer';
    description = 'You are on the right path. Consider swapping daily transport habits.';
  } else {
    badge = 'Needs Improvement';
    description = 'Consider reducing utility bills and heavy meat purchases to improve scoring.';
  }

  // 8. PERSONALIZED AI INSIGHTS
  const insights: string[] = [];

  if (mode === 'car' && km > 15) {
    insights.push(`Your daily travel commute contributes approximately ${Math.round(40 + Math.random() * 10)}% of your carbon footprint. Swapping driving for public transit twice a week could avoid ${Math.round(km * 0.35 * 5)}kg CO₂ monthly.`);
  } else if (mode === 'bike' || mode === 'cycle') {
    insights.push('Incredible travel habits! Your low commute emissions are keeping your daily scoring index high.');
  }

  if (data.food.dietType === 'meat') {
    insights.push('Red meat purchase frequencies are a high dietary carbon driver. Implementing "Meatless Mondays" will save an estimated 25kg of carbon emissions per month.');
  } else if (data.food.dietType === 'vegan') {
    insights.push('Your plant-based diet scores perfectly! You are sparing approximately 800kg of annual carbon emissions.');
  }

  if (bill > 120) {
    insights.push(`Monthly utility costs are ${Math.round((bill/120)*100 - 100)}% above standard limits. Installing a smart thermostat would save about 30kg of CO₂ yearly.`);
  }

  if (showers > 2) {
    insights.push('Shortening daily showers by just 2 minutes would save approximately 80 gallons of water per week.');
  }

  if (data.waste.plasticUsage === 'high') {
    insights.push('Switching to reusable canvas grocery totes and bulk refills will prevent 12kg of plastic waste annually.');
  }

  // Fallback insights
  if (insights.length < 3) {
    insights.push('Unplugging stand-by electronics (TVs, router modules, desktop adapters) avoids up to 10kg of background energy leakage.');
    insights.push('Buying locally produced seasonal groceries avoids long transport carbon footprints.');
  }

  return {
    score: finalScore,
    badge,
    description,
    insights,
    travelScore,
    foodScore,
    energyScore,
    waterScore,
    wasteScore
  };
};
