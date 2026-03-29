import { completeDailyQuiz, getActivityHistory } from '../controllers/rpgController.js';
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/rpg/history
// @desc    Get recent XP activity history
router.get('/history', protect, getActivityHistory);

// @route   POST /api/rpg/daily-quiz
// @desc    Complete daily reflection quiz
router.post('/daily-quiz', protect, completeDailyQuiz);

export default router;
