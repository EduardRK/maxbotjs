import express from 'express';
import { 
  getStatsSummary,
  getCalendarStats,
  getDailyStats 
} from '../controllers/statsController.js';

const router = express.Router();

// GET /api/users/:userId/stats/summary - Get summary statistics
router.get('/:userId/stats/summary', getStatsSummary);

// GET /api/users/:userId/stats/calendar - Get calendar statistics
router.get('/:userId/stats/calendar', getCalendarStats);

// GET /api/users/:userId/stats/daily - Get daily statistics
router.get('/:userId/stats/daily', getDailyStats);

export default router;