import { completeDailyQuiz, getActivityHistory, markActivitiesRead, logActivity, syncNeural, getSSSLeaderboard, getTerritoryLords, getNarrativeHistory, initiateAwakening, purchaseItem } from '../controllers/rpgController.js';
import { getQuestionById } from '../controllers/narrativeController.js';
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/rpg/history
// @desc    Get recent XP activity history
router.get('/history', protect, getActivityHistory);

// @route   POST /api/rpg/mark-read
// @desc    Mark all activities read
router.post('/mark-read', protect, markActivitiesRead);

// @route   POST /api/rpg/log-activity
// @desc    Create a custom activity log
router.post('/log-activity', protect, logActivity);

// @route   POST /api/rpg/daily-quiz
// @desc    Complete daily reflection quiz
router.post('/daily-quiz', protect, completeDailyQuiz);

// @route   POST /api/rpg/sync-neural
// @desc    Synchronize a level-unlocked neural question
// @access  Private
router.post('/sync-neural', protect, syncNeural);

// @route   POST /api/rpg/initiate-awakening
// @desc    Initiate the awakening process
router.post('/initiate-awakening', protect, initiateAwakening);

// @route   GET /api/rpg/narrative/:questionId
// @desc    Get a single narrative question
router.get('/narrative/:questionId', protect, getQuestionById);

// @route   GET /api/rpg/leaderboard/sss
// @desc    Get the Hall of SSS (Speed to master)
router.get('/leaderboard/sss', protect, getSSSLeaderboard);

// @route   GET /api/rpg/leaderboard/territory
// @desc    Get Territory Lords (Stat leaders)
router.get('/territory-lords', protect, getTerritoryLords);

// @route   GET /api/rpg/narrative-history
// @desc    Get the full chronological story log for the user
router.get('/narrative-history', protect, getNarrativeHistory);

// @route   POST /api/rpg/purchase
// @desc    Acquire tactical assets or themes
router.post('/purchase', protect, purchaseItem);

export default router;
