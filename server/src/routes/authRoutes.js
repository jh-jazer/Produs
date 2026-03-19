import express from 'express';
import passport from 'passport';
import { registerUser, loginUser, getMe, googleAuthCallback, completeOnboarding, updateSettings, deleteUser, getPublicProfile, sendPartnerRequest, acceptPartnerRequest, rejectPartnerRequest, cancelPartnerRequest, unlinkPartner, searchUsers, checkUsername, updateSubscriptions, sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, cancelConnectionRequest, getConnections } from '../controllers/authController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/search', protect, searchUsers);
router.get('/connections', protect, getConnections);
router.put('/onboarding', protect, completeOnboarding);
router.put('/settings', protect, updateSettings);
router.delete('/me', protect, deleteUser);
router.get('/profile/:username', optionalProtect, getPublicProfile);
router.post('/partner/request', protect, sendPartnerRequest);
router.post('/partner/accept', protect, acceptPartnerRequest);
router.post('/partner/reject', protect, rejectPartnerRequest);
router.post('/partner/cancel', protect, cancelPartnerRequest);
router.post('/partner/unlink', protect, unlinkPartner);
router.post('/connection/request/:id', protect, sendConnectionRequest);
router.post('/connection/accept/:id', protect, acceptConnectionRequest);
router.post('/connection/reject/:id', protect, rejectConnectionRequest);
router.post('/connection/cancel/:id', protect, cancelConnectionRequest);
router.get('/check-username', protect, checkUsername);
router.put('/subscriptions', protect, updateSubscriptions);

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
