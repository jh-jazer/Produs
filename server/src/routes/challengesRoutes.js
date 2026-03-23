import express from 'express';
import * as challengesController from '../controllers/challengesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', challengesController.getChallenges);
router.post('/:id/toggle', challengesController.toggleChallengeJoin);
router.post('/:id/progress', challengesController.updateChallengeProgress);

export default router;
