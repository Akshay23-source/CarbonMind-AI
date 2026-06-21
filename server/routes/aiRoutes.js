import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import {
  handleCoachChat,
  handlePredictTrend,
  handleReceiptOCR,
  handleGetRecommendations,
  handleAnalyzeActionImpact,
  handleScanActivity,
  handleAnalyzeMeal,
  handlePlanTrip,
  handleScanBill,
  handleCarbonTwin,
  handleMotivation,
  handleMapAdvisor,
  handleCopilotBriefing,
  handleCopilotChat,
  handleCopilotSearch,
  handleCopilotReport
} from '../controllers/aiController.js';

const router = Router();

// Development: temporarily bypass auth for coach, carbon-twin, and copilot briefing
router.post('/coach', handleCoachChat);
router.post('/carbon-twin', handleCarbonTwin);
router.post('/copilot/briefing', handleCopilotBriefing);

// Protect all AI features using JWT verification
router.use(requireAuth);

router.post('/scan', handleScanActivity);
router.post('/predict', handlePredictTrend);
router.post('/ocr', handleReceiptOCR);
router.post('/scan-receipt', handleReceiptOCR);
router.post('/analyze-meal', handleAnalyzeMeal);
router.post('/plan-trip', handlePlanTrip);
router.post('/scan-bill', handleScanBill);
router.post('/motivation', handleMotivation);
router.post('/map-advisor', handleMapAdvisor);
router.post('/recommendations', handleGetRecommendations);
router.post('/analyze-action', handleAnalyzeActionImpact);

// Copilot AI OS Operations
router.post('/copilot/chat', handleCopilotChat);
router.post('/copilot/search', handleCopilotSearch);
router.post('/copilot/report', handleCopilotReport);

export default router;
