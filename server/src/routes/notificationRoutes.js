import express from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getNotifications)
    .patch(protect, markAllAsRead);

router.route('/:id')
    .patch(protect, markAsRead)
    .delete(protect, deleteNotification);

export default router;
