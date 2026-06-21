/**
 * Carbon Calculation Engine
 * 
 * Computes exact emission metrics, offsets, savings, and gamified XP/Coin rewards
 * based on activity class parameters.
 */

export const calculateMetrics = (category, activityType, quantity, details = {}) => {
  let emittedKg = 0;
  let savedKg = 0;
  let moneySaved = 0;
  let waterSaved = 0;
  let treesEquivalent = 0;
  let xpEarned = 10; // Default baseline XP
  let coinsEarned = 0;
  let rating = 'medium'; // 'low' | 'medium' | 'high' (environmental impact rating)

  const qty = parseFloat(quantity) || 1;

  switch (category) {
    case 'travel':
    case 'transportation': {
      // quantity = km or miles traveled. Let's assume input is in kilometers.
      const km = qty;
      const days = details.days || 1;
      
      if (activityType === 'car') {
        emittedKg = km * 0.25; // 0.25kg CO2 per km for petrol car
        savedKg = 0;
        rating = 'high';
        xpEarned = 15; // standard logging
      } else if (activityType === 'ev') {
        emittedKg = km * 0.06;
        savedKg = km * (0.25 - 0.06); // savings compared to petrol car
        moneySaved = Math.round(savedKg * 0.15); // $0.15 saved per km
        rating = 'low';
        xpEarned = 35;
        coinsEarned = 15;
      } else if (activityType === 'bus' || activityType === 'metro' || activityType === 'train') {
        emittedKg = km * 0.04;
        savedKg = km * (0.25 - 0.04);
        moneySaved = Math.round(savedKg * 0.20);
        rating = 'low';
        xpEarned = 40;
        coinsEarned = 20;
      } else if (activityType === 'cycle' || activityType === 'bike' || activityType === 'walking') {
        emittedKg = 0;
        savedKg = km * 0.25;
        moneySaved = Math.round(savedKg * 0.30);
        rating = 'low';
        xpEarned = 50; // High reward!
        coinsEarned = 25;
        treesEquivalent = parseFloat((savedKg * 0.05).toFixed(2));
      } else if (activityType === 'flight') {
        emittedKg = km * 0.15; // per passenger km
        savedKg = 0;
        rating = 'high';
        xpEarned = 5; // logging high pollution gives minimal XP
      }
      break;
    }

    case 'food': {
      // quantity = meals logged
      const meals = qty;
      if (activityType === 'vegan') {
        emittedKg = meals * 0.4;
        savedKg = meals * (2.5 - 0.4); // vs heavy meat baseline of 2.5kg
        rating = 'low';
        xpEarned = 40;
        coinsEarned = 20;
        treesEquivalent = parseFloat((savedKg * 0.05).toFixed(2));
      } else if (activityType === 'vegetarian') {
        emittedKg = meals * 1.0;
        savedKg = meals * (2.5 - 1.0);
        rating = 'low';
        xpEarned = 30;
        coinsEarned = 10;
      } else if (activityType === 'mixed') {
        emittedKg = meals * 1.8;
        savedKg = meals * (2.5 - 1.8);
        rating = 'medium';
        xpEarned = 15;
      } else if (activityType === 'meat' || activityType === 'beef') {
        emittedKg = meals * 4.5;
        savedKg = 0;
        rating = 'high';
        xpEarned = 5;
      }
      break;
    }

    case 'energy':
    case 'electricity': {
      // quantity = hours or kWh. Let's assume hours for quick logs.
      const hours = qty;
      if (activityType === 'ac') {
        emittedKg = hours * 1.2; // 1.2kg per hour AC usage
        rating = 'high';
        xpEarned = 10;
      } else if (activityType === 'fan') {
        emittedKg = hours * 0.05;
        rating = 'low';
        xpEarned = 15;
      } else if (activityType === 'tv') {
        emittedKg = hours * 0.15;
        rating = 'medium';
        xpEarned = 10;
      } else if (activityType === 'laptop') {
        emittedKg = hours * 0.05;
        rating = 'low';
        xpEarned = 15;
      } else if (activityType === 'desktop') {
        emittedKg = hours * 0.3;
        rating = 'medium';
        xpEarned = 10;
      } else if (activityType === 'fridge') {
        emittedKg = hours * 0.2;
        rating = 'medium';
        xpEarned = 10;
      }
      break;
    }

    case 'water': {
      // quantity = showers or laundry cycles
      if (activityType === 'shower') {
        const minutes = details.minutes || 10;
        const gallons = minutes * 2.5; // 2.5 gallons per minute
        emittedKg = gallons * 0.02; // heating energy overhead
        if (minutes < 5) {
          savedKg = 0.5;
          waterSaved = Math.round(12.5 - gallons);
          xpEarned = 35;
          coinsEarned = 10;
          rating = 'low';
        } else {
          rating = 'medium';
          xpEarned = 10;
        }
      } else if (activityType === 'laundry') {
        emittedKg = qty * 0.8;
        rating = 'medium';
        xpEarned = 10;
      }
      break;
    }

    case 'waste':
    case 'recycling': {
      // quantity = items recycled or avoided
      const items = qty;
      if (activityType === 'plastic_bottle' || activityType === 'bottle' || activityType === 'recycle') {
        emittedKg = 0;
        savedKg = items * 0.1; // 100g carbon saved per bottle recycled
        rating = 'low';
        xpEarned = Math.min(50, items * 8);
        coinsEarned = Math.min(25, items * 3);
        treesEquivalent = parseFloat((savedKg * 0.05).toFixed(2));
      } else if (activityType === 'paper') {
        emittedKg = 0;
        savedKg = items * 0.05;
        rating = 'low';
        xpEarned = Math.min(30, items * 5);
        coinsEarned = Math.min(15, items * 2);
      } else if (activityType === 'composting') {
        emittedKg = 0;
        savedKg = qty * 1.5; // kg of organic composted
        rating = 'low';
        xpEarned = 40;
        coinsEarned = 15;
      }
      break;
    }

    case 'tree_plantation':
    case 'trees': {
      // quantity = saplings planted
      const treesCount = qty;
      emittedKg = 0;
      savedKg = treesCount * 22.0; // standard tree absorbs 22kg CO2 yearly
      rating = 'low';
      xpEarned = treesCount * 100; // HUGE REWARD!
      coinsEarned = treesCount * 50;
      treesEquivalent = treesCount;
      break;
    }

    default: {
      // lifestyle or other custom actions
      emittedKg = 0.5;
      savedKg = 0.5;
      rating = 'medium';
      xpEarned = 15;
      break;
    }
  }

  return {
    carbonEmitted: emittedKg,
    carbonSaved: savedKg,
    moneySaved,
    waterSaved,
    treesEquivalent,
    xpEarned,
    greenCoinsEarned: coinsEarned,
    activityRating: rating
  };
};
