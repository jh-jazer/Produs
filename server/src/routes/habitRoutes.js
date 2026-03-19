import express from 'express';
import { getHabits, createHabit, toggleCheck, deleteHabit, updateHabit, reorderHabits } from '../controllers/habitController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/reorder', protect, reorderHabits);

router.route('/')
    .get(protect, getHabits)
    .post(protect, createHabit);
router.route('/:id')
    .put(protect, updateHabit)
    .delete(protect, deleteHabit);

router.route('/:id/check')
    .patch(protect, toggleCheck);

export default router;
