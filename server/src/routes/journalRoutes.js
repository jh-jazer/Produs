import express from 'express';
import {
    createEntry,
    getEntries,
    updateEntry,
    deleteEntry
} from '../controllers/journalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getEntries)
    .post(protect, createEntry);

router.route('/:id')
    .patch(protect, updateEntry)
    .delete(protect, deleteEntry);

export default router;
