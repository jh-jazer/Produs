import { completeDailyQuiz, getActivityHistory, syncNeural, getSSSLeaderboard, getTerritoryLords } from '../controllers/rpgController.js';
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/rpg/history
// @desc    Get recent XP activity history
router.get('/history', protect, getActivityHistory);

// @route   POST /api/rpg/daily-quiz
// @desc    Complete daily reflection quiz
router.post('/daily-quiz', protect, completeDailyQuiz);

// @route   POST /api/rpg/sync-neural
// @desc    Synchronize a level-unlocked neural question
// @access  Private
router.post('/sync-neural', protect, syncNeural);

// @route   GET /api/rpg/leaderboard/sss
// @desc    Get the Hall of SSS (Speed to master)
router.get('/leaderboard/sss', protect, getSSSLeaderboard);

// @route   GET /api/rpg/leaderboard/territory
// @desc    Get Territory Lords (Stat leaders)
router.get('/leaderboard/territory', protect, getTerritoryLords);

export default router;
