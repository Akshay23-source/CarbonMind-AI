import { describe, it, expect } from 'vitest';
import { calculateEcoScore, OnboardingData } from '../../src/utils/ecoScore';

describe('calculateEcoScore Utility', () => {
  const baseMockData: OnboardingData = {
    basicInfo: {
      name: 'Test User',
      age: '28',
      country: 'India',
      city: 'Mumbai',
      occupation: 'Developer'
    },
    transport: {
      dailyKm: '10',
      preferredMode: 'cycle',
      daysPerWeek: '5'
    },
    food: {
      dietType: 'vegan',
      mealsPerDay: '3',
      deliveryFrequency: 'never'
    },
    electricity: {
      monthlyBill: '40',
      appliances: ['fan', 'led']
    },
    water: {
      dailyShowers: '1',
      laundryWeekly: '2',
      dishwashing: 'manual'
    },
    waste: {
      plasticUsage: 'low',
      recyclingWeekly: '3',
      composting: true,
      reusableBags: true,
      bottleUsage: 'reusable'
    },
    goals: ['Reduce commute emissions']
  };

  it('calculates the perfect score for highly sustainable onboarding inputs', () => {
    const result = calculateEcoScore(baseMockData);
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.badge).toBe('Planet Guardian');
    expect(result.insights.length).toBeGreaterThanOrEqual(1);
  });

  it('applies penalties for driving gasoline cars and meat eating diet type', () => {
    const badMockData: OnboardingData = {
      ...baseMockData,
      transport: {
        dailyKm: '30',
        preferredMode: 'car',
        daysPerWeek: '7'
      },
      food: {
        dietType: 'meat',
        mealsPerDay: '3',
        deliveryFrequency: 'daily'
      }
    };

    const result = calculateEcoScore(badMockData);
    expect(result.score).toBeLessThan(75);
    expect(result.travelScore).toBeLessThan(100);
    expect(result.foodScore).toBeLessThan(50);
  });

  it('applies scaling penalties for high electricity bills', () => {
    const highBillData: OnboardingData = {
      ...baseMockData,
      electricity: {
        monthlyBill: '200',
        appliances: ['ac', 'washer', 'tv', 'fan', 'fridge']
      }
    };

    const result = calculateEcoScore(highBillData);
    expect(result.energyScore).toBeLessThan(60);
  });

  it('detects high water showers utility penalties', () => {
    const highWaterData: OnboardingData = {
      ...baseMockData,
      water: {
        dailyShowers: '4',
        laundryWeekly: '6',
        dishwashing: 'dishwasher'
      }
    };

    const result = calculateEcoScore(highWaterData);
    expect(result.waterScore).toBeLessThan(80);
  });
});
