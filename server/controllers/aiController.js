import aiService from '../services/aiService.js';
import { calculateMetrics } from '../services/carbonEngine.js';
import { logger } from '../utils/logger.js';

// Simple In-Memory Cache with TTL (5 minutes) for optimization
class SimpleCache {
  constructor(ttlMs = 5 * 60 * 1000) {
    this.cache = new Map();
    this.ttlMs = ttlMs;
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return cached.value;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs
    });
  }
}

const aiCache = new SimpleCache();

// Input Sanitizer to guard against Prompt Injection
const sanitizeInput = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/system\b/gi, '')
    .replace(/instruction\b/gi, '')
    .replace(/ignore\s+previous/gi, '')
    .replace(/override/gi, '')
    .replace(/translate\s+to\s+json/gi, '')
    .trim();
};

// Robust Local Fallback Regex NLP Parser
const parseQueryLocal = (text) => {
  const normalized = text.toLowerCase();
  
  // Find any digits in text
  const digitMatch = normalized.match(/(\d+(?:\.\d+)?)/);
  const quantity = digitMatch ? parseFloat(digitMatch[1]) : 1;

  let category = 'lifestyle';
  let activityType = 'custom';
  let reasoning = 'Analyzed via local keyword heuristic engine.';
  let recommendation = 'Unplug household stand-by power cords to avoid background leakage.';

  if (normalized.includes('bike') || normalized.includes('cycle') || normalized.includes('bicycle')) {
    category = 'travel';
    activityType = 'cycle';
    reasoning = `Bicycle travel logged for ${quantity} km. Zero tailpipe emissions.`;
    recommendation = 'Cycling is highly sustainable. Keep it up for shorter trips!';
  } else if (normalized.includes('walk') || normalized.includes('run')) {
    category = 'travel';
    activityType = 'walking';
    reasoning = `Walking travel logged for ${quantity} km. Zero emissions and promotes wellness.`;
    recommendation = 'Perfect zero emission choice!';
  } else if (normalized.includes('car') || normalized.includes('drive')) {
    category = 'travel';
    activityType = 'car';
    reasoning = `Petrol vehicle commute logged for ${quantity} km. Standard emission averages.`;
    recommendation = 'Swap driving with transit passes twice a week to drop commute output.';
  } else if (normalized.includes('ev') || normalized.includes('electric car')) {
    category = 'travel';
    activityType = 'ev';
    reasoning = `Electric vehicle drive logged for ${quantity} km. Clean electricity grid offsets applied.`;
    recommendation = 'Charging via solar/green options yields even greater offsets.';
  } else if (normalized.includes('bus') || normalized.includes('metro') || normalized.includes('subway') || normalized.includes('train')) {
    category = 'travel';
    activityType = 'bus';
    reasoning = `Public transit commute logged for ${quantity} km. Shared occupancy cuts tailpipe carbon.`;
    recommendation = 'Public transit remains highly sustainable for long commutes.';
  } else if (normalized.includes('flight') || normalized.includes('fly') || normalized.includes('plane')) {
    category = 'travel';
    activityType = 'flight';
    reasoning = `Air flight logged for ${quantity} km. High altitude fuel consumption offsets.`;
    recommendation = 'Consider train lines for regional distances to offset air carbon.';
  } else if (normalized.includes('vegan') || normalized.includes('salad') || normalized.includes('lentil') || normalized.includes('tofu')) {
    category = 'food';
    activityType = 'vegan';
    reasoning = `Plant-based vegan meals logged: ${quantity} portions. Low methane/water overhead.`;
    recommendation = 'Plant-based dietary habits drop food footprints significantly.';
  } else if (normalized.includes('vegetarian') || normalized.includes('veg') || normalized.includes('cheese')) {
    category = 'food';
    activityType = 'vegetarian';
    reasoning = `Vegetarian meals logged: ${quantity} portions. Avoids red meat methane outputs.`;
    recommendation = 'Try plant-based milks to optimize food points scoring.';
  } else if (normalized.includes('chicken') || normalized.includes('biryani') || normalized.includes('meat') || normalized.includes('beef') || normalized.includes('lamb')) {
    category = 'food';
    activityType = 'meat';
    reasoning = `Meat consumption logged: ${quantity} portions. Red meat averages high methane totals.`;
    recommendation = 'Swapping red meat for poultry or plant-based meals once a week saves massive carbon.';
  } else if (normalized.includes('ac') || normalized.includes('air conditioner') || normalized.includes('cooling')) {
    category = 'energy';
    activityType = 'ac';
    reasoning = `Air conditioning active for ${quantity} hours. Standard electrical grids draw.`;
    recommendation = 'Optimize thermostat settings to 78°F (25°C) to conserve cooling logs.';
  } else if (normalized.includes('bottle') || normalized.includes('plastic') || normalized.includes('recycle') || normalized.includes('can')) {
    category = 'waste';
    activityType = 'bottle';
    reasoning = `Recycling logged: ${quantity} plastic bottles/cans. Diverts container waste from landfills.`;
    recommendation = 'Use reusable thermos flasks to eliminate single-use plastic loads.';
  } else if (normalized.includes('tree') || normalized.includes('plant') || normalized.includes('sapling')) {
    category = 'trees';
    activityType = 'trees';
    reasoning = `Tree planting logged: ${quantity} saplings. Standard tree absorbs 22kg CO2 yearly.`;
    recommendation = 'Verified tree sapling logs create high offsets. Monitor watering routines!';
  }

  return {
    category,
    activityType,
    quantity,
    confidence: 0.85,
    reasoning,
    recommendation
  };
};

/**
 * AI Carbon Scanner Controller
 * Parses natural language input via Gemini or local regex fallback,
 * runs calculations, and returns structured sustainability metrics.
 */
export const handleScanActivity = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text query parameter is required' });
    }

    const sanitizedText = sanitizeInput(text);
    const cacheKey = `scan_${sanitizedText}`;
    const cachedResult = aiCache.get(cacheKey);

    if (cachedResult) {
      logger.info('[Cache Scanner] Returned cached sustainability analysis.');
      return res.status(200).json(cachedResult);
    }

    let parsed = null;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'your-google-gemini-api-key') {
      try {
        // Query Gemini API directly
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const prompt = `Analyze the following user logging activity in natural language: "${sanitizedText}". 
        Extract and return a strict JSON object with this exact schema (no markdown formatting code blocks, just raw JSON string):
        {
          "category": "travel" | "food" | "energy" | "waste" | "water" | "trees" | "lifestyle",
          "activityType": "car" | "bike" | "cycle" | "ev" | "bus" | "metro" | "train" | "flight" | "vegan" | "vegetarian" | "mixed" | "meat" | "ac" | "fan" | "laptop" | "desktop" | "fridge" | "shower" | "laundry" | "bottle" | "paper" | "composting" | "trees",
          "quantity": number,
          "confidence": number,
          "reasoning": "short calculation explanation",
          "recommendation": "alternative cleaner action suggestions"
        }`;

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          const candidateText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (candidateText) {
            // Clean markdown blocks
            const cleanJson = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
            parsed = JSON.parse(cleanJson);
            logger.info('[Gemini Scanner] Parsed natural language successfully via AI model.');
          }
        }
      } catch (geminiError) {
        logger.warn('[Gemini Scanner] Gemini API fetch failed, falling back to local regex NLP:', geminiError);
      }
    }

    // Heuristics Fallback if Gemini failed or API key was offline
    if (!parsed) {
      parsed = parseQueryLocal(sanitizedText);
      logger.info('[Local Scanner] Parsed query successfully via regex heuristic.');
    }

    // Call Carbon Calculation Engine
    const calculations = calculateMetrics(parsed.category, parsed.activityType, parsed.quantity);

    // Combine scanner results
    const responsePayload = {
      success: true,
      queryText: text,
      category: parsed.category,
      activityType: parsed.activityType,
      quantity: parsed.quantity,
      confidence: parsed.confidence,
      reasoning: parsed.reasoning,
      recommendation: parsed.recommendation,
      metrics: calculations
    };

    aiCache.set(cacheKey, responsePayload);
    res.status(200).json(responsePayload);

  } catch (error) {
    next(error);
  }
};

export const handleCoachChat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message field is required' });
    }
    const result = await aiService.coachChat(message, history);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handlePredictTrend = async (req, res, next) => {
  try {
    const { data } = req.body;
    const cacheKey = `predict_${JSON.stringify(data || [])}`;
    const cached = aiCache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
    const result = await aiService.predictTrend(data || []);
    aiCache.set(cacheKey, result);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleReceiptOCR = async (req, res, next) => {
  try {
    const imageBuffer = req.file ? req.file.buffer : null;
    const base64Image = req.body.image || null;
    const mockSelection = req.body.mockSelection !== undefined ? req.body.mockSelection : null;
    const fileName = req.body.fileName || null;
    const result = await aiService.scanReceiptOCR(imageBuffer, base64Image, mockSelection, fileName);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleAnalyzeMeal = async (req, res, next) => {
  try {
    const imageBuffer = req.file ? req.file.buffer : null;
    const base64Image = req.body.image || null;
    const textQuery = req.body.text || null;
    const fileName = req.body.fileName || null;
    const result = await aiService.analyzeMeal(imageBuffer, base64Image, textQuery, fileName);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handlePlanTrip = async (req, res, next) => {
  try {
    const { origin, destination, preferences } = req.body;
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }
    const result = await aiService.planTrip(origin, destination, preferences || {});
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleScanBill = async (req, res, next) => {
  try {
    const imageBuffer = req.file ? req.file.buffer : null;
    const base64Image = req.body.image || null;
    const mockPreset = req.body.mockPreset || null;
    const fileName = req.body.fileName || null;
    const result = await aiService.scanBill(imageBuffer, base64Image, mockPreset, fileName);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleCarbonTwin = async (req, res, next) => {
  try {
    const { userProfile, simulationInputs } = req.body;
    const result = await aiService.getCarbonTwin(userProfile || {}, simulationInputs || {});
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleMotivation = async (req, res, next) => {
  try {
    const { userProfile } = req.body;
    const uid = userProfile?.uid || 'anonymous';
    const ecoScore = userProfile?.ecoScore || 0;
    const cacheKey = `motivation_${uid}_${ecoScore}`;
    const cached = aiCache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
    const result = await aiService.getMotivation(userProfile || {});
    aiCache.set(cacheKey, result);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleGetRecommendations = async (req, res, next) => {
  try {
    const { breakdown } = req.body;
    const result = await aiService.getRecommendations(breakdown || {});
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleAnalyzeActionImpact = async (req, res, next) => {
  try {
    const { action } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'Action parameter is required' });
    }
    const result = await aiService.analyzeActionImpact(action);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleMapAdvisor = async (req, res, next) => {
  try {
    const { userProfile, nearbyEvents } = req.body;
    const result = await aiService.getMapAdvisor(userProfile || {}, nearbyEvents || []);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleCopilotBriefing = async (req, res, next) => {
  try {
    const { userProfile } = req.body;
    const uid = userProfile?.uid || 'anonymous';
    const ecoScore = userProfile?.ecoScore || 0;
    const level = userProfile?.level || 0;
    const cacheKey = `briefing_${uid}_${ecoScore}_${level}`;
    const cached = aiCache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
    const result = await aiService.getCopilotBriefing(userProfile || {});
    aiCache.set(cacheKey, result);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleCopilotChat = async (req, res, next) => {
  try {
    const { userProfile, message, history, context } = req.body;
    const result = await aiService.getCopilotChat(userProfile || {}, message, history || [], context || {});
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleCopilotSearch = async (req, res, next) => {
  try {
    const { userProfile, query } = req.body;
    const result = await aiService.getCopilotSearch(userProfile || {}, query || '');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleCopilotReport = async (req, res, next) => {
  try {
    const { userProfile, reportType } = req.body;
    const result = await aiService.getCopilotReport(userProfile || {}, reportType || 'weekly');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
