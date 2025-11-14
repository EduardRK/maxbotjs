import express from 'express';
import { 
  getStatsSummary,
  getCalendarStats,
  getDailyStats 
} from '../controllers/statsController.js';

const router = express.Router();

router.get('/:userId/stats/summary', getStatsSummary);

router.get('/:userId/stats/calendar', getCalendarStats);

router.get('/:userId/stats/daily', getDailyStats);

export default router;