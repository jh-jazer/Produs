import express from 'express';
import { getHabits, createHabit, toggleCheck, deleteHabit, updateHabit } from '../controllers/habitController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getHabits)
    .post(protect, createHabit);
router.route('/:id')
    .put(protect, updateHabit)
    .delete(protect, deleteHabit);

router.route('/:id/check')
    .patch(protect, toggleCheck);

export default router;
