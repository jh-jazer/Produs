import express from 'express';
import { completeDailyQuiz } from '../controllers/rpgController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/rpg/daily-quiz
// @desc    Complete daily reflection quiz
router.post('/daily-quiz', protect, completeDailyQuiz);

export default router;
