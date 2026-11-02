import express from 'express';
import LandingConfig from '../models/LandingConfig.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get landing page config
// @route   GET /api/landing-config
// @access  Public
router.get('/', async (req, res) => {
    try {
        const config = await LandingConfig.getConfig();
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Update landing page config
// @route   PUT /api/landing-config
// @access  Private/Admin
router.put('/', protect, adminOnly, async (req, res) => {
    try {
        let config = await LandingConfig.findOne();
        if (!config) {
            config = new LandingConfig(req.body);
        } else {
            const allowedFields = ['hero', 'mockups', 'active'];
            allowedFields.forEach(field => {
                if (req.body[field] !== undefined) config[field] = req.body[field];
            });
        }
        await config.save();
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

export default router;
