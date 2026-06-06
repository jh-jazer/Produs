/**
 * RPG Utility Engine for Produs
 * Handles Leveling, XP awarding, Daily Caps, and Archetype Evolution.
 */
import User from '../models/User.js';

export const syncUserEnergy = (user) => {
    const level = user.level || 0;
    const maxEnergy = 10 + level;

    if (!user.rpg.energy) {
        user.rpg.energy = { current: maxEnergy, lastUpdated: new Date() };
    }
    
    // Base 20 minutes, -0.5% per level
    const recoveryMinutes = 20 * (1 - (level * 0.005));
    const recoveryMs = Math.max(recoveryMinutes, 1) * 60 * 1000; // Cap at 1 minute min

    const now = new Date();
    const lastUpdated = new Date(user.rpg.energy.lastUpdated);
    const elapsedMs = now - lastUpdated;
    
    const energyGained = Math.floor(elapsedMs / recoveryMs);

    if (energyGained > 0) {
        const newEnergy = Math.min(maxEnergy, user.rpg.energy.current + energyGained);
        user.rpg.energy.current = newEnergy;
        
        // Move lastUpdated forward to represent unused partial recovery time
        user.rpg.energy.lastUpdated = new Date(lastUpdated.getTime() + (energyGained * recoveryMs));
        user.markModified('rpg.energy');
    }

    return {
        current: user.rpg.energy.current,
        max: maxEnergy,
        recoveryMs
    };
};

export const refillEnergy = (user) => {
    const maxEnergy = 10 + (user.level || 0);
    user.rpg.energy = {
        current: maxEnergy,
        lastUpdated: new Date()
    };
    user.markModified('rpg.energy');
};

export const LEVEL_TABLE = [
    { level: 0, title: 'Shut-in', xpToNext: 100, totalRequired: 0 },
    { level: 1, title: 'Tier 1: Novice', xpToNext: 150, totalRequired: 100 },
    { level: 2, title: 'Tier 1: Novice', xpToNext: 250, totalRequired: 250 },
    { level: 3, title: 'Tier 1: Novice', xpToNext: 500, totalRequired: 500 },
    { level: 4, title: 'Tier 1: Novice', xpToNext: 1000, totalRequired: 1000 },
    { level: 5, title: 'Tier 1: Novice', xpToNext: 1750, totalRequired: 2000 },
    { level: 6, title: 'Tier 1: Novice', xpToNext: 2750, totalRequired: 3750 },
    { level: 7, title: 'Tier 1: Novice', xpToNext: 4000, totalRequired: 6500 },
    { level: 8, title: 'Tier 2: Adept', xpToNext: 5500, totalRequired: 10500 },
    { level: 9, title: 'Tier 2: Adept', xpToNext: 7500, totalRequired: 16000 },
    { level: 10, title: 'Tier 2: Adept', xpToNext: 10000, totalRequired: 23500 },
    { level: 11, title: 'Tier 3: Master', xpToNext: 13000, totalRequired: 33500 },
    { level: 12, title: 'Tier 3: Master', xpToNext: 17000, totalRequired: 46500 },
    { level: 13, title: 'Tier 3: Master', xpToNext: 22000, totalRequired: 63500 },
    { level: 14, title: 'Tier 4: Grandmaster', xpToNext: 28000, totalRequired: 85500 },
    { level: 15, title: 'Tier 4: Grandmaster', xpToNext: 35000, totalRequired: 113500 },
    { level: 16, title: 'Tier 4: Grandmaster', xpToNext: 45000, totalRequired: 148500 },
    { level: 17, title: 'Tier 5: Legend', xpToNext: 57000, totalRequired: 193500 },
    { level: 18, title: 'Tier 5: Legend', xpToNext: 72000, totalRequired: 250500 },
    { level: 19, title: 'Tier 5: Legend', xpToNext: 90000, totalRequired: 322500 },
    { level: 20, title: 'Tier 5: Legend', xpToNext: 18000, totalRequired: 412500 },
    { level: 21, title: 'Tier 5: Legend', xpToNext: 20000, totalRequired: 430500 },
    { level: 22, title: 'Tier 5: Legend', xpToNext: 22500, totalRequired: 450500 },
    { level: 23, title: 'Tier 5: Legend', xpToNext: 25000, totalRequired: 473000 },
    { level: 24, title: 'Tier 5: Legend', xpToNext: 28000, totalRequired: 498000 },
    { level: 25, title: 'Tier 5: Legend', xpToNext: 31000, totalRequired: 526000 },
    { level: 26, title: 'Tier 5: Legend', xpToNext: 34500, totalRequired: 557000 },
    { level: 27, title: 'Tier 5: Legend', xpToNext: 38000, totalRequired: 591500 },
    { level: 28, title: 'Tier 5: Legend', xpToNext: 42000, totalRequired: 629500 },
    { level: 29, title: 'Tier 5: Legend', xpToNext: 46000, totalRequired: 671500 },
    { level: 30, title: 'Tier 5: Legend', xpToNext: 51000, totalRequired: 717500 },
    { level: 31, title: 'Tier 5: Legend', xpToNext: 56000, totalRequired: 768500 },
    { level: 32, title: 'Tier 5: Legend', xpToNext: 62000, totalRequired: 824500 },
    { level: 33, title: 'Tier 5: Legend', xpToNext: 68000, totalRequired: 886500 },
    { level: 34, title: 'Tier 5: Legend', xpToNext: 75000, totalRequired: 954500 },
    { level: 35, title: 'Tier 5: Legend', xpToNext: 82000, totalRequired: 1029500 },
    { level: 36, title: 'Tier 5: Legend', xpToNext: 90000, totalRequired: 1111500 },
    { level: 37, title: 'Tier 5: Legend', xpToNext: 98000, totalRequired: 1201500 },
    { level: 38, title: 'Tier 5: Legend', xpToNext: 107000, totalRequired: 1299500 },
    { level: 39, title: 'Tier 5: Legend', xpToNext: 116000, totalRequired: 1406500 },
    { level: 40, title: 'Tier 5: Legend', xpToNext: 126000, totalRequired: 1522500 },
    { level: 41, title: 'Tier 5: Legend', xpToNext: 137000, totalRequired: 1648500 },
    { level: 42, title: 'Tier 5: Legend', xpToNext: 148000, totalRequired: 1785500 },
    { level: 43, title: 'Tier 5: Legend', xpToNext: 160000, totalRequired: 1933500 },
    { level: 44, title: 'Tier 5: Legend', xpToNext: 172000, totalRequired: 2093500 },
    { level: 45, title: 'Tier 5: Legend', xpToNext: 185000, totalRequired: 2265500 },
    { level: 46, title: 'Tier 5: Legend', xpToNext: 198000, totalRequired: 2450500 },
    { level: 47, title: 'Tier 5: Legend', xpToNext: 212000, totalRequired: 2648500 },
    { level: 48, title: 'Tier 5: Legend', xpToNext: 227000, totalRequired: 2860500 },
    { level: 49, title: 'Tier 5: Legend', xpToNext: 242000, totalRequired: 3087500 },
    { level: 50, title: 'Tier 5: Legend', xpToNext: 260000, totalRequired: 3329500 },
    { level: 51, title: 'Tier 5: Legend', xpToNext: 280000, totalRequired: 3589500 },
    { level: 52, title: 'Tier 5: Legend', xpToNext: 300000, totalRequired: 3869500 },
    { level: 53, title: 'Tier 5: Legend', xpToNext: 330000, totalRequired: 4169500 },
    { level: 54, title: 'Tier 5: Legend', xpToNext: 360000, totalRequired: 4499500 },
    { level: 55, title: 'Tier 5: Legend', xpToNext: 400000, totalRequired: 4859500 },
    { level: 56, title: 'Tier 5: Legend', xpToNext: 440000, totalRequired: 5259500 },
    { level: 57, title: 'Tier 5: Legend', xpToNext: 480000, totalRequired: 5699500 },
    { level: 58, title: 'Tier 5: Legend', xpToNext: 530000, totalRequired: 6179500 },
    { level: 59, title: 'Tier 5: Legend', xpToNext: 580000, totalRequired: 6709500 },
    { level: 60, title: 'Tier 5: Legend', xpToNext: 640000, totalRequired: 7289500 },
    { level: 61, title: 'Tier 5: Legend', xpToNext: 700000, totalRequired: 7929500 },
    { level: 62, title: 'Tier 5: Legend', xpToNext: 770000, totalRequired: 8629500 },
    { level: 63, title: 'Tier 5: Legend', xpToNext: 850000, totalRequired: 9399500 },
    { level: 64, title: 'Tier 5: Legend', xpToNext: 940000, totalRequired: 10249500 },
    { level: 65, title: 'Tier 5: Legend', xpToNext: 0, totalRequired: 11189500 }
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
        // Tier 1: Archetype (Q16-Q23) - 1 per level L1-L8
        if (level >= 1 && level <= 8) unlockedAny = tryUnlock(`${15 + level}.0`) || unlockedAny; // L1=16.0, L8=23.0

        // Tier 2: Style (Q24-Q28) - 1 per 2 levels L11-L19
        if (level >= 11 && level <= 19) {
            const styleIdx = Math.floor((level - 11) / 2);
            if (styleIdx >= 0 && styleIdx < 5) unlockedAny = tryUnlock(`${24 + styleIdx}.0`) || unlockedAny;
        }

        // Tier 3: Alignment (Q29-Q32) - 1 per 3 levels L24-L33
        if (level >= 24 && level <= 33) {
            const alignIdx = Math.floor((level - 24) / 3);
            if (alignIdx >= 0 && alignIdx < 4) unlockedAny = tryUnlock(`${29 + alignIdx}.0`) || unlockedAny;
        }

        // Tier 4: Specialist Trials (Q33+) - 1 per 2 levels L36+
        if (level >= 36) {
            const TRIAL_POOL_SIZE = 8; 
            const trialIdx = Math.floor((level - 36) / 2);
            const questionId = `${33 + (trialIdx % TRIAL_POOL_SIZE)}.0`;
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

    const stats = ['str', 'agi', 'vit', 'int', 'wis', 'luk'];
    const statNames = {
        str: 'Iron',
        agi: 'Shadows',
        vit: 'Bastion',
        int: 'Logic',
        wis: 'Oracle',
        luk: 'Embers'
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

export const awardXP = async (user, rawStat, amount, streak = 1, activityType = 'system', action = 'Syncing data') => {
    // Force stat to 'none' so that all XP gains are general Guardian EXP and no specific stats are awarded
    const stat = 'none';
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize/Reset Daily XP if needed
    if (!user.rpg.dailyXP) {
        user.rpg.dailyXP = { date: today, total: 0, byStat: { str: 0, agi: 0, vit: 0, int: 0, wis: 0, luk: 0 } };
    }
    if (user.rpg.dailyXP.date !== today) {
        user.rpg.dailyXP = {
            date: today,
            total: 0,
            byStat: { str: 0, agi: 0, vit: 0, int: 0, wis: 0, luk: 0 }
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

    if (finalXP <= 0) return { xpAwarded: 0 };

    // Update User Stats and EXP (skip specific stats, only increment general Guardian EXP)
    user.guardianExp = (user.guardianExp || 0) + finalXP;
    user.rpg.dailyXP.total = (user.rpg.dailyXP.total || 0) + finalXP;

    // Recalculate Level and Archetype
    const levelInfo = calculateLevel(user.guardianExp);
    const oldLevel = user.guardianLevel || 0;
    user.guardianLevel = levelInfo.level;

    // Sync hero
    if (!user.hero) user.hero = { name: 'Unnamed Hero', class: null, level: 0, exp: 0 };
    user.hero.exp = user.guardianExp;
    user.hero.level = user.guardianLevel;
    user.markModified('hero');

    const archetypeInfo = determineArchetype(user, user.guardianLevel);
    user.rpg.finalLabel = archetypeInfo.name;
    
    // TRIGGER Neural Sync check (Pass oldLevel to check for multi-level jumps)
    const unlocked = checkNeuralSync(user, user.guardianLevel, oldLevel);
    
    const oldArchetype = user.rpg.archetype?.name || 'None';
    user.rpg.archetype = archetypeInfo;

    // Handle Archetype Transformation History
    if (oldArchetype !== 'None' && oldArchetype !== archetypeInfo.name) {
        if (!user.rpg.archetypeHistory) user.rpg.archetypeHistory = [];
        user.rpg.archetypeHistory.push({
            from: oldArchetype,
            to: archetypeInfo.name,
            date: new Date()
        });
    }

    // REFILL ENERGY ON LEVEL UP
    if (user.guardianLevel > oldLevel) {
        refillEnergy(user);
    }

    // Log Activity
    try {
        await Activity.create({
            user: user._id,
            type: activityType,
            action,
            stat,
            amount: finalXP,
            perkActivated: multiplier > 1 ? `Streak ${multiplier}x` : null,
            metadata: { unit: 'Guardian EXP' }
        });
    } catch (logError) {
        console.error('Failed to log RPG activity:', logError);
    }

    return {
        leveledUp: user.guardianLevel > oldLevel,
        transformed: oldArchetype !== 'None' && oldArchetype !== archetypeInfo.name,
        xpAwarded: finalXP
    };
};
