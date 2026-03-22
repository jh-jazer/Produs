import express from 'express';
import { syncFeature } from '../controllers/syncController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Synchronize a specific feature using CRDTs
router.post('/:feature', protect, syncFeature);

export default router;
