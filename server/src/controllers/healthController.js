import HealthLog from '../models/HealthLog.js';
import User from '../models/User.js';
import { awardXP } from '../utils/rpgUtils.js';
import { checkSystemHabit } from '../utils/habitUtils.js';

export const logHealth = async (req, res) => {
    try {
        const { type, title, value, unit, isGoalHit, details } = req.body;
        // The frontend currently passes date as YYYY-MM-DD from the client, we should use it if provided
        const date = req.body.date || new Date().toISOString().split('T')[0];

        const healthLog = await HealthLog.create({
            user: req.user._id,
            date,
            type,
            title,
            value,
            unit,
            isGoalHit,
            details
        });

        // Auto-check Workout habit
        if (type === 'workout') {
            await checkSystemHabit(req.user._id, 'workout', date);
        }

        const user = await User.findById(req.user._id);
        
        // Award STR XP based on type
        // Workout: +10, Sleep/Metric: +8, Nutrition: +8, Hydration: +5
        let xpAmount = 0;
        let mainType = type;
        if (type === 'metric') {
            const metricType = details?.metricType;
            if (metricType === 'sleep') mainType = 'sleep';
            else if (metricType === 'weight' || metricType === 'bmi') mainType = 'metric';
            else if (metricType === 'hydration') mainType = 'hydration';
        }

        switch (mainType) {
            case 'workout': xpAmount = 10; break;
            case 'sleep': xpAmount = 8; break;
            case 'nutrition': xpAmount = 8; break;
            case 'hydration': xpAmount = 5; break;
            case 'metric': xpAmount = 5; break;
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
