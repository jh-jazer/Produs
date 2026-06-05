import User from '../models/User.js';
import { LEVEL_TABLE, calculateLevel } from './rpgUtils.js';

/**
 * Calculate EXP required for the next level using the shared LEVEL_TABLE.
 * This replaces the old linear formula.
 */
export const getNextLevelExp = (currentLevel) => {
    const entry = LEVEL_TABLE.find(e => e.level === currentLevel);
    return entry ? entry.xpToNext : 100;
};

/**
 * Add Guardian EXP to a user (earned from all normal-mode productivity activities).
 * Handles multi-level ups using the shared LEVEL_TABLE.
 */
export const addGuardianExp = async (userId, amount) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        user.guardianExp = (user.guardianExp || 0) + amount;

        // Resolve level using the shared table
        const newLevelInfo = calculateLevel(user.guardianExp);
        const levelUp = newLevelInfo.level > (user.guardianLevel || 0);
        user.guardianLevel = newLevelInfo.level;

        // Sync hero progression to mirror guardian progression exactly
        if (!user.hero) user.hero = { name: 'Unnamed Hero', class: null, level: 0, exp: 0 };
        user.hero.exp = user.guardianExp;
        user.hero.level = user.guardianLevel;
        user.markModified('hero');

        await user.save();
        return { user, levelUp, levelInfo: newLevelInfo };
    } catch (error) {
        console.error('Failed to add Guardian EXP:', error);
        return null;
    }
};

/**
 * Add Hero EXP to a user's guided hero character.
 * Hero level is always capped at the Guardian's current level.
 */
export const addHeroExp = async (userId, amount) => {
    const result = await addGuardianExp(userId, amount);
    if (!result) return null;
    return {
        user: result.user,
        levelUp: result.levelUp,
        levelInfo: result.levelInfo,
        cappedLevel: result.user.guardianLevel
    };
};

// ─── Legacy alias ────────────────────────────────────────────────────────────
// Kept for any remaining internal callers during migration.
// Points to addGuardianExp. Remove once migration is complete.
export const addExp = addGuardianExp;
