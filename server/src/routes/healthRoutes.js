import express from 'express';
import { logHealth, getHealthLogs } from '../controllers/healthController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', logHealth);
router.get('/', getHealthLogs);

export default router;
