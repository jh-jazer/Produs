import User from '../models/User.js';
import { awardXP } from '../utils/rpgUtils.js';

// @route   POST /api/rpg/daily-quiz
// @desc    Complete daily reflection quiz
// @access  Private
export const completeDailyQuiz = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const today = new Date().toISOString().split('T')[0];

        if (user.rpg.dailyQuiz && user.rpg.dailyQuiz.lastCompleted === today) {
            return res.status(400).json({ message: 'Daily quiz already completed for today.' });
        }

        // Award XP for Wisdom/Reflection (+25 XP)
        const result = await awardXP(user, 'wis', 25);
        
        // Mark as completed
        user.rpg.dailyQuiz = { lastCompleted: today };
        await user.save();

        res.json({
            message: 'Daily reflection synchronized.',
            xpAwarded: result.xpAwarded,
            leveledUp: result.leveledUp,
            stats: user.rpg.stats,
            level: user.level,
            exp: user.exp
        });
    } catch (error) {
        console.error('Daily quiz completion failed:', error);
        res.status(500).json({ message: 'Server error during daily quiz sync.' });
    }
};
