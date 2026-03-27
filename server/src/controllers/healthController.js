import HealthLog from '../models/HealthLog.js';
import User from '../models/User.js';
import { awardXP } from '../utils/rpgUtils.js';

export const logHealth = async (req, res) => {
    try {
        const { type, value, isGoalHit } = req.body;
        const today = new Date().toISOString().split('T')[0];

        const healthLog = await HealthLog.create({
            user: req.user._id,
            date: today,
            type,
            value,
            isGoalHit
        });

        const user = await User.findById(req.user._id);
        
        // Award STR XP based on type
        // Workout: +10, Sleep: +8, Nutrition: +8, Hydration: +5
        let xpAmount = 0;
        switch (type) {
            case 'workout': xpAmount = 10; break;
            case 'sleep': xpAmount = 8; break;
            case 'nutrition': xpAmount = 8; break;
            case 'hydration': xpAmount = 5; break;
        }

        if (isGoalHit) {
            // Additional bonus if goal hit
            xpAmount += 5;
        }

        const result = await awardXP(user, 'str', xpAmount);
        await user.save();

        res.status(201).json({ healthLog, result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getHealthLogs = async (req, res) => {
    try {
        const logs = await HealthLog.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
