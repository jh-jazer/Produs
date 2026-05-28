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
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        // Initialise hero sub-doc defaults if missing
        if (!user.hero) user.hero = { name: 'Unnamed Hero', class: null, level: 0, exp: 0 };

        user.hero.exp = (user.hero.exp || 0) + amount;

        // Resolve hero level using the shared table
        const heroLevelInfo = calculateLevel(user.hero.exp);

        // Cap hero level at guardian level
        const cappedLevel = Math.min(heroLevelInfo.level, user.guardianLevel || 0);
        const levelUp = cappedLevel > (user.hero.level || 0);
        user.hero.level = cappedLevel;

        user.markModified('hero');
        await user.save();
        return { user, levelUp, levelInfo: heroLevelInfo, cappedLevel };
    } catch (error) {
        console.error('Failed to add Hero EXP:', error);
        return null;
    }
};

// ─── Legacy alias ────────────────────────────────────────────────────────────
// Kept for any remaining internal callers during migration.
// Points to addGuardianExp. Remove once migration is complete.
export const addExp = addGuardianExp;
