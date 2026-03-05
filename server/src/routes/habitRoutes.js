import express from 'express';
import { getHabits, createHabit, toggleCheck, deleteHabit } from '../controllers/habitController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getHabits)
    .post(protect, createHabit);
router.route('/:id')
    .delete(protect, deleteHabit);

router.route('/:id/check')
    .patch(protect, toggleCheck);

export default router;
