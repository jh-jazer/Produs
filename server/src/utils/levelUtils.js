import User from '../models/User.js';

/**
 * Calculate EXP required for the next level
 * Formula: next_level * 100
 */
export const getNextLevelExp = (currentLevel) => {
    return currentLevel * 100;
};

/**
 * Add EXP to a user and handle leveling up
 */
export const addExp = async (userId, amount) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        user.exp += amount;

        let levelUp = false;
        // Handle potential multi-level ups
        while (user.exp >= getNextLevelExp(user.level)) {
            user.exp -= getNextLevelExp(user.level);
            user.level += 1;
            levelUp = true;
        }

        await user.save();
        return { user, levelUp };
    } catch (error) {
        console.error('Failed to add EXP:', error);
        return null;
    }
};
