/**
 * RPG Utility Engine for Produs
 * Handles Leveling, XP awarding, Daily Caps, and Archetype Evolution.
 */

export const LEVEL_TABLE = [
    { level: 0, title: 'Shut-in', xpToNext: 100, totalRequired: 0 },
    { level: 1, title: 'Tier 1', xpToNext: 150, totalRequired: 100 },
    { level: 2, title: 'Tier 1', xpToNext: 200, totalRequired: 250 },
    { level: 3, title: 'Tier 1', xpToNext: 300, totalRequired: 450 },
    { level: 4, title: 'Tier 1', xpToNext: 450, totalRequired: 750 },
    { level: 5, title: 'Tier 1', xpToNext: 600, totalRequired: 1200 },
    { level: 6, title: 'Tier 1', xpToNext: 800, totalRequired: 2000 },
    { level: 7, title: 'Tier 1', xpToNext: 1100, totalRequired: 2800 },
    { level: 8, title: 'Tier 1', xpToNext: 1500, totalRequired: 3900 },
    { level: 9, title: 'Tier 1', xpToNext: 2000, totalRequired: 5400 },
    { level: 10, title: 'Tier 1', xpToNext: 2600, totalRequired: 7400 },
    { level: 11, title: 'Tier 2', xpToNext: 3300, totalRequired: 10000 },
    { level: 12, title: 'Tier 2', xpToNext: 4200, totalRequired: 13300 },
    { level: 13, title: 'Tier 2', xpToNext: 5200, totalRequired: 17500 },
    { level: 14, title: 'Tier 2', xpToNext: 6400, totalRequired: 22700 },
    { level: 15, title: 'Tier 2', xpToNext: 7800, totalRequired: 29100 },
    { level: 16, title: 'Tier 2', xpToNext: 9400, totalRequired: 36900 },
    { level: 17, title: 'Tier 2', xpToNext: 11200, totalRequired: 46300 },
    { level: 18, title: 'Tier 2', xpToNext: 13200, totalRequired: 57500 },
    { level: 19, title: 'Tier 2', xpToNext: 15400, totalRequired: 70700 },
    { level: 20, title: 'Tier 2', xpToNext: 18000, totalRequired: 86100 },
    { level: 21, title: 'Tier 3', xpToNext: 20000, totalRequired: 104100 },
    { level: 22, title: 'Tier 3', xpToNext: 22500, totalRequired: 124100 },
    { level: 23, title: 'Tier 3', xpToNext: 25000, totalRequired: 146600 },
    { level: 24, title: 'Tier 3', xpToNext: 28000, totalRequired: 171600 },
    { level: 25, title: 'Tier 3', xpToNext: 31000, totalRequired: 199600 },
    { level: 26, title: 'Tier 3', xpToNext: 34500, totalRequired: 230600 },
    { level: 27, title: 'Tier 3', xpToNext: 38000, totalRequired: 265100 },
    { level: 28, title: 'Tier 3', xpToNext: 42000, totalRequired: 303100 },
    { level: 29, title: 'Tier 3', xpToNext: 46000, totalRequired: 345100 },
    { level: 30, title: 'Tier 3', xpToNext: 51000, totalRequired: 391100 },
    { level: 31, title: 'Tier 4', xpToNext: 56000, totalRequired: 442100 },
    { level: 32, title: 'Tier 4', xpToNext: 62000, totalRequired: 498100 },
    { level: 33, title: 'Tier 4', xpToNext: 68000, totalRequired: 560100 },
    { level: 34, title: 'Tier 4', xpToNext: 75000, totalRequired: 628100 },
    { level: 35, title: 'Tier 4', xpToNext: 82000, totalRequired: 703100 },
    { level: 36, title: 'Tier 4', xpToNext: 90000, totalRequired: 785100 },
    { level: 37, title: 'Tier 4', xpToNext: 98000, totalRequired: 875100 },
    { level: 38, title: 'Tier 4', xpToNext: 107000, totalRequired: 973100 },
    { level: 39, title: 'Tier 4', xpToNext: 116000, totalRequired: 1080100 },
    { level: 40, title: 'Tier 4', xpToNext: 126000, totalRequired: 1196100 },
    { level: 41, title: 'Tier 5', xpToNext: 137000, totalRequired: 1322100 },
    { level: 42, title: 'Tier 5', xpToNext: 148000, totalRequired: 1459100 },
    { level: 43, title: 'Tier 5', xpToNext: 160000, totalRequired: 1607100 },
    { level: 44, title: 'Tier 5', xpToNext: 172000, totalRequired: 1767100 },
    { level: 45, title: 'Tier 5', xpToNext: 185000, totalRequired: 1939100 },
    { level: 46, title: 'Tier 5', xpToNext: 198000, totalRequired: 2124100 },
    { level: 47, title: 'Tier 5', xpToNext: 212000, totalRequired: 2322100 },
    { level: 48, title: 'Tier 5', xpToNext: 227000, totalRequired: 2534100 },
    { level: 49, title: 'Tier 5', xpToNext: 242000, totalRequired: 2761100 },
    { level: 50, title: 'Tier 5', xpToNext: 260000, totalRequired: 3003100 },
    { level: 51, title: 'Tier 5', xpToNext: 280000, totalRequired: 3263100 },
    { level: 52, title: 'Tier 5', xpToNext: 300000, totalRequired: 3543100 },
    { level: 53, title: 'Tier 5', xpToNext: 330000, totalRequired: 3843100 },
    { level: 54, title: 'Tier 5', xpToNext: 360000, totalRequired: 4173100 },
    { level: 55, title: 'Tier 5', xpToNext: 400000, totalRequired: 4533100 },
    { level: 56, title: 'Tier 5', xpToNext: 440000, totalRequired: 4933100 },
    { level: 57, title: 'Tier 5', xpToNext: 480000, totalRequired: 5373100 },
    { level: 58, title: 'Tier 5', xpToNext: 530000, totalRequired: 5853100 },
    { level: 59, title: 'Tier 5', xpToNext: 580000, totalRequired: 6383100 },
    { level: 60, title: 'Tier 5', xpToNext: 640000, totalRequired: 6963100 },
    { level: 61, title: 'Tier 5', xpToNext: 700000, totalRequired: 7603100 },
    { level: 62, title: 'Tier 5', xpToNext: 770000, totalRequired: 8303100 },
    { level: 63, title: 'Tier 5', xpToNext: 850000, totalRequired: 9073100 },
    { level: 64, title: 'Tier 5', xpToNext: 940000, totalRequired: 9923100 },
    { level: 65, title: 'Tier 5', xpToNext: 0, totalRequired: 10863100 }
];

export const ARCHETYPES = {
    'Iron Fist': {
        name: 'Iron Fist',
        tiers: ["Brawler", "Iron Fist", "The Relentless", "Unstoppable Force", "The Wall That Walks"]
    },
    'Blade Dancer': {
        name: 'Blade Dancer',
        tiers: ["Street Brawler", "Blade Dancer", "Phantom Edge", "Death's Silhouette", "The Undying Blade"]
    },
    'Warlord': {
        name: 'Warlord',
        tiers: ["Pack Leader", "Warlord", "Iron Banner", "The Conqueror", "King of the Battlefield"]
    },
    'Vanguard': {
        name: 'Vanguard',
        tiers: ["The Eager", "Vanguard", "Spearhead", "The Unstoppable", "First of the New World"]
    },
    'Sentinel': {
        name: 'Sentinel',
        tiers: ["The Stubborn", "Sentinel", "Iron Bulwark", "The Immovable", "Eternal Fortress"]
    },
    'Forge Master': {
        name: 'Forge Master',
        tiers: ["The Maker", "Forge Master", "Ironwright", "The Architect of Steel", "Builder of Civilizations"]
    },
    'Commander': {
        name: 'Commander',
        tiers: ["Squad Leader", "Commander", "Warlord", "Iron Sovereign", "The Undefeated King"]
    },
    'Champion': {
        name: 'Champion',
        tiers: ["Contender", "Champion", "The Proven", "Legend in the Making", "The Undisputed"]
    },
    'Shadow Monk': {
        name: 'Shadow Monk',
        tiers: ["Introvert", "Shadow Monk", "The Unseen", "Void Walker", "He Who Needs No Witness"]
    },
    'Ghost': {
        name: 'Ghost',
        tiers: ["The Quiet One", "Ghost", "No Trace", "The Vanishing", "Never There"]
    },
    'Diplomat': {
        name: 'Diplomat',
        tiers: ["The Listener", "Diplomat", "Silver Tongue", "The Peacemaker", "The One Who Stopped the War"]
    },
    'Bard': {
        name: 'Bard',
        tiers: ["Storyteller", "Bard", "Silver Tongue", "Voice of Legends", "The Word That Moves Worlds"]
    },
    'Oracle': {
        name: 'Oracle',
        tiers: ["Dreamer", "Oracle", "The Farsighted", "Keeper of Inevitable Truths", "The One Who Already Knew"]
    },
    'Druid': {
        name: 'Druid',
        tiers: ["Wanderer", "Druid", "Pattern Seer", "Voice of the Wild", "The Living Codex"]
    },
    'Alchemist': {
        name: 'Alchemist',
        tiers: ["Tinkerer", "Alchemist", "Formula Breaker", "Grand Synthesist", "Architect of Truth"]
    },
    'Architect': {
        name: 'Architect',
        tiers: ["Draftsman", "Architect", "System Lord", "World Builder", "The Eternal Planner"]
    },
    'None': {
        name: 'None',
        tiers: ["Shut-in", "Awakening", "Searching", "Aligned", "Mastered"]
    }
};

export const getStreakMultiplier = (streak) => {
    if (streak >= 100) return 2.0;
    if (streak >= 30) return 1.75;
    if (streak >= 14) return 1.5;
    if (streak >= 7) return 1.25;
    if (streak >= 3) return 1.1;
    return 1.0;
};

export const calculateLevel = (totalXP) => {
    let currentLevel = LEVEL_TABLE[0];
    for (let i = LEVEL_TABLE.length - 1; i >= 0; i--) {
        if (totalXP >= LEVEL_TABLE[i].totalRequired) {
            currentLevel = LEVEL_TABLE[i];
            break;
        }
    }
    return currentLevel;
};

export const determineArchetype = (user, level) => {
    if (level === 0 || !user.rpg) {
        return {
            name: 'None',
            tier: 1,
            stage: 'Shut-in'
        };
    }

    const { path, completedAnswers, masteryPoints, specialistRank, territory } = user.rpg;
    
    // 1. Determine Tier based on Level
    let tier = 1;
    if (level >= 56) tier = 5;
    else if (level >= 36) tier = 4;
    else if (level >= 23) tier = 3;
    else if (level >= 11) tier = 2;

    // 2. Build the Identity Label dynamically
    let identityLabel = path || 'None';
    
    // Check completion counts
    const t1Count = (completedAnswers || []).filter(a => a.id >= 16 && a.id <= 23).length;
    const styleCount = (completedAnswers || []).filter(a => a.id >= 24 && a.id <= 28).length;
    const alignCount = (completedAnswers || []).filter(a => a.id >= 29 && a.id <= 32).length;

    // Phase 1: Tier 1 (Archetype)
    if (t1Count === 8 && user.rpg.tier1) {
        identityLabel = user.rpg.tier1;
    }

    // Phase 2: Style
    if (styleCount === 5 && user.rpg.style) {
        identityLabel = `${user.rpg.style} ${identityLabel}`;
    }

    // Phase 3: Alignment (Final Tier 3 Label)
    if (alignCount === 4 && user.rpg.finalLabel) {
        identityLabel = user.rpg.finalLabel;
    }

    // Phase 4: Specialist Rank
    if (level >= 36) {
        identityLabel = `${identityLabel} (Rank ${specialistRank || 'F'})`;
    }

    // Phase 5: Territory (Lordship)
    if (territory) {
        identityLabel = `Lord of ${territory} ${identityLabel}`;
    }

    return {
        name: identityLabel,
        tier: tier,
        stage: `Lv ${level} ${path || 'Awakened'}`
    };
};

/**
 * Checks if new questions should be unlocked based on the level climb.
 * Now handles multi-level jumps and repeating trials.
 */
export const checkNeuralSync = (user, currentLevel, prevLevel = null) => {
    if (!user.rpg.pendingQuestions) user.rpg.pendingQuestions = [];
    const answeredIds = new Set((user.rpg.completedAnswers || []).map(a => a.id));
    const pendingIds = new Set(user.rpg.pendingQuestions);
    
    // Start from prevLevel + 1 up to currentLevel
    // If prevLevel is null (init), we just check currentLevel
    const startLvl = prevLevel ? prevLevel + 1 : currentLevel;
    
    const tryUnlock = (id) => {
        // ALLOW repeating IDs for Tier 4 Strategy Trials (ID >= 33)
        const isTrial = id >= 33;
        
        if (isTrial) {
            if (!pendingIds.has(id)) {
                user.rpg.pendingQuestions.push(id);
                return true;
            }
        } else {
            if (!answeredIds.has(id) && !pendingIds.has(id)) {
                user.rpg.pendingQuestions.push(id);
                return true;
            }
        }
        return false;
    };

    let unlockedAny = false;

    for (let level = startLvl; level <= currentLevel; level++) {
        // Tier 1: Archetype (Q16-Q23) - 1 per level L2-L9
        if (level >= 2 && level <= 9) unlockedAny = tryUnlock(14 + level) || unlockedAny; // L2=16, L9=23

        // Tier 2: Style (Q24-Q28) - 1 per 2 levels L11-L19
        if (level >= 11 && level <= 19) {
            const styleIdx = Math.floor((level - 11) / 2);
            if (styleIdx >= 0 && styleIdx < 5) unlockedAny = tryUnlock(24 + styleIdx) || unlockedAny;
        }

        // Tier 3: Alignment (Q29-Q32) - 1 per 3 levels L24-L33
        if (level >= 24 && level <= 33) {
            const alignIdx = Math.floor((level - 24) / 3);
            if (alignIdx >= 0 && alignIdx < 4) unlockedAny = tryUnlock(29 + alignIdx) || unlockedAny;
        }

        // Tier 4: Specialist Trials (Q33+) - 1 per 2 levels L36+
        if (level >= 36) {
            const TRIAL_POOL_SIZE = 8; 
            const trialIdx = Math.floor((level - 36) / 2);
            const questionId = 33 + (trialIdx % TRIAL_POOL_SIZE);
            unlockedAny = tryUnlock(questionId) || unlockedAny;
        }
    }

    return unlockedAny;
};

/**
 * Checks if the user is the global top in any stat to award Territory title.
 */
export const syncTerritoryOwnership = async (user) => {
    if (user.level < 56 || user.rpg.specialistRank !== 'SSS') return;

    const stats = ['str', 'dex', 'end', 'int', 'wis', 'cha'];
    const statNames = {
        str: 'Iron',
        dex: 'Shadows',
        end: 'Bastion',
        int: 'Logic',
        wis: 'Oracle',
        cha: 'Embers'
    };

    let topStat = null;

    for (const stat of stats) {
        const userStat = user.rpg.stats[stat];
        // Check if anyone has a higher stat
        const superior = await User.findOne({
            _id: { $ne: user._id },
            [`rpg.stats.${stat}`]: { $gt: userStat }
        });

        if (!superior) {
            topStat = statNames[stat];
            break; // Can only "own" one primary territory in the title
        }
    }

    if (user.rpg.territory !== topStat) {
        user.rpg.territory = topStat;
        user.markModified('rpg');
    }
};

import Activity from '../models/Activity.js';

export const awardXP = async (user, stat, amount, streak = 1, activityType = 'system', action = 'Syncing data') => {
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize/Reset Daily XP if needed
    if (user.rpg.dailyXP.date !== today) {
        user.rpg.dailyXP = {
            date: today,
            total: 0,
            byStat: { str: 0, dex: 0, end: 0, int: 0, wis: 0, cha: 0 }
        };
    }

    // Apply Streak Multiplier
    const multiplier = getStreakMultiplier(streak);
    let finalXP = Math.round(amount * multiplier);

    // Apply Archetype Multipliers if they exist
    if (user.rpg.statMultipliers && user.rpg.statMultipliers.get) {
        const mult = user.rpg.statMultipliers.get(stat);
        if (mult) finalXP = Math.round(finalXP * mult);
    } else if (user.rpg.statMultipliers && user.rpg.statMultipliers[stat]) {
        const mult = user.rpg.statMultipliers[stat];
        if (mult) finalXP = Math.round(finalXP * mult);
    }

    // DAILY CAPS REMOVED PER USER REQUEST
    if (finalXP <= 0) return { xpAwarded: 0 };

    // Update User Stats and XP
    user.rpg.stats[stat] += finalXP;
    user.exp += finalXP;
    user.rpg.dailyXP.total += finalXP;
    user.rpg.dailyXP.byStat[stat] = (user.rpg.dailyXP.byStat[stat] || 0) + finalXP;

    // Recalculate Level and Archetype
    const levelInfo = calculateLevel(user.exp);
    const oldLevel = user.level;
    user.level = levelInfo.level;

    const archetypeInfo = determineArchetype(user, user.level);
    user.rpg.finalLabel = archetypeInfo.name;
    
    // TRIGGER Neural Sync check (Pass oldLevel to check for multi-level jumps)
    const unlocked = checkNeuralSync(user, user.level, oldLevel);
    
    const oldArchetype = user.rpg.archetype.name;
    user.rpg.archetype = archetypeInfo;

    // Handle Archetype Transformation History
    if (oldArchetype !== 'None' && oldArchetype !== archetypeInfo.name) {
        user.rpg.archetypeHistory.push({
            from: oldArchetype,
            to: archetypeInfo.name,
            date: new Date()
        });
    }

    // Log Activity
    try {
        await Activity.create({
            user: user._id,
            type: activityType,
            action,
            stat,
            amount: finalXP,
            perkActivated: multiplier > 1 ? `Streak ${multiplier}x` : null
        });
    } catch (logError) {
        console.error('Failed to log RPG activity:', logError);
    }

    return {
        leveledUp: user.level > oldLevel,
        transformed: oldArchetype !== 'None' && oldArchetype !== archetypeInfo.name,
        xpAwarded: finalXP
    };
};
