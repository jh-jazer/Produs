import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { submitBug, getMyBugs } from '../controllers/bugController.js';

const router = express.Router();

router.use(protect);
router.post('/', submitBug);
router.get('/my', getMyBugs);

export default router;
