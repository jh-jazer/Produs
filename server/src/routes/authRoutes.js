import express from 'express';
import passport from 'passport';
import { registerUser, loginUser, getMe, googleAuthCallback, completeOnboarding, updateSettings, deleteUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/onboarding', protect, completeOnboarding);
router.put('/settings', protect, updateSettings);
router.delete('/me', protect, deleteUser);

// @route   GET /api/auth/google
// @desc    Auth with Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /api/auth/google/callback
// @desc    Google auth callback
router.get(
    '/google/callback',
    (req, res, next) => {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        passport.authenticate('google', {
            failureRedirect: `${clientUrl}/auth?error=auth_failed`,
            session: false,
        })(req, res, next);
    },
    googleAuthCallback
);

export default router;
