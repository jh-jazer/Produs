import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { getSystemStats, resetUserOnboarding } from '../controllers/adminController.js';
import { getAllBugs, updateBugStatus } from '../controllers/bugController.js';

const router = express.Router();

// Apply protect and adminOnly middleware to all roots
router.use(protect);
router.use(adminOnly);

router.get('/stats', getSystemStats);
router.post('/users/:id/reset-onboarding', resetUserOnboarding);
router.get('/bugs', getAllBugs);
router.patch('/bugs/:id', updateBugStatus);

export default router;
