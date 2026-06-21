/**
 * CarbonMind Shared Constants
 * 
 * Centralized emission calculations factors compliant with Greenhouse Gas Protocol (GHG).
 * These factors are consumed by both frontend logging visualizers and backend rate verifiers.
 */

export const EMISSION_FACTORS = {
  TRAVEL: {
    PETROL_CAR: 0.40, // kg CO2 per mile
    EV: 0.10,         // kg CO2 per mile (based on grid offsets)
    PUBLIC_TRANSIT: 0.05, // kg CO2 per mile
    BICYCLE: 0.00      // Zero emissions
  },
  MEAL: {
    VEGAN: 0.4,       // kg CO2 per meal
    VEGETARIAN: 1.2,  // kg CO2 per meal
    POULTRY: 3.2,     // kg CO2 per meal
    BEEF: 7.2         // kg CO2 per meal (high impact methane source)
  },
  ENERGY: {
    ELECTRICITY_KWH: 0.40 // kg CO2 per kWh
  }
};

export const CARBON_CATEGORIES = {
  ENERGY: 'energy',
  TRAVEL: 'travel',
  FOOD: 'food',
  WASTE: 'waste'
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
} as const;
