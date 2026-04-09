import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { getSystemStats, resetUserOnboarding, toggleUserAdmin, bulkDeleteUsers } from '../controllers/adminController.js';
import { getAllBugs, updateBugStatus } from '../controllers/bugController.js';
import { getAllQuestions, upsertQuestion, deleteQuestion, seedNarrative, deleteAllQuestions, bulkUpsertQuestions } from '../controllers/narrativeController.js';

const router = express.Router();

// Apply protect and adminOnly middleware to all roots
router.use(protect);
router.use(adminOnly);

router.get('/stats', getSystemStats);
router.delete('/users', bulkDeleteUsers);
router.post('/users/:id/reset-onboarding', resetUserOnboarding);
router.post('/users/:id/toggle-admin', toggleUserAdmin);
router.get('/bugs', getAllBugs);
router.patch('/bugs/:id', updateBugStatus);

// Narrative Management
router.get('/narrative', getAllQuestions);
router.post('/narrative', upsertQuestion);
router.post('/narrative/bulk', bulkUpsertQuestions);
router.delete('/narrative/:questionId', deleteQuestion);
router.delete('/narrative', deleteAllQuestions);
router.post('/narrative/seed', seedNarrative);

export default router;
