/**
 * RPG Utility Engine for Produs
 * Handles Leveling, XP awarding, Daily Caps, and Archetype Evolution.
 */

export const LEVEL_TABLE = [
    { level: 0, title: 'Shut-in', xpToNext: 100, totalRequired: 0 },
    { level: 1, title: 'Tier 1', xpToNext: 150, totalRequired: 100 },
    { level: 2, title: 'Tier 1', xpToNext: 250, totalRequired: 250 },
    { level: 3, title: 'Tier 1', xpToNext: 500, totalRequired: 500 },
    { level: 4, title: 'Tier 1', xpToNext: 1000, totalRequired: 1000 },
    { level: 5, title: 'Tier 1', xpToNext: 1750, totalRequired: 2000 },
    { level: 6, title: 'Tier 1', xpToNext: 2750, totalRequired: 3750 },
    { level: 7, title: 'Tier 1', xpToNext: 4000, totalRequired: 6500 },
    { level: 8, title: 'Tier 2', xpToNext: 5500, totalRequired: 10500 },
    { level: 9, title: 'Tier 2', xpToNext: 7500, totalRequired: 16000 },
    { level: 10, title: 'Tier 2', xpToNext: 10000, totalRequired: 23500 },
    { level: 11, title: 'Tier 3', xpToNext: 13000, totalRequired: 33500 },
    { level: 12, title: 'Tier 3', xpToNext: 17000, totalRequired: 46500 },
    { level: 13, title: 'Tier 3', xpToNext: 22000, totalRequired: 63500 },
    { level: 14, title: 'Tier 4', xpToNext: 28000, totalRequired: 85500 },
    { level: 15, title: 'Tier 4', xpToNext: 35000, totalRequired: 113500 },
    { level: 16, title: 'Tier 4', xpToNext: 45000, totalRequired: 148500 },
    { level: 17, title: 'Tier 5', xpToNext: 57000, totalRequired: 193500 },
    { level: 18, title: 'Tier 5', xpToNext: 72000, totalRequired: 250500 },
    { level: 19, title: 'Tier 5', xpToNext: 90000, totalRequired: 322500 },
    { level: 20, title: 'Tier 5', xpToNext: 0, totalRequired: 412500 },
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

export const determineArchetype = (stats, level) => {
    if (level === 0) {
        return {
            name: 'None',
            tier: 1,
            stage: 'Shut-in'
        };
    }

    const { str, dex, end, int, wis, cha } = stats;

    const axis1 = str >= wis ? 'STR' : 'WIS';
    const axis2 = dex >= int ? 'DEX' : 'INT';
    const axis3 = end >= cha ? 'END' : 'CHA';
    const axis4 = end >= dex ? 'STABLE' : 'ADAPTIVE';

    const map = {
        'STR-DEX-END-STABLE': 'Iron Fist',
        'STR-DEX-END-ADAPTIVE': 'Blade Dancer',
        'STR-DEX-CHA-STABLE': 'Warlord',
        'STR-DEX-CHA-ADAPTIVE': 'Vanguard',
        'STR-INT-END-STABLE': 'Sentinel',
        'STR-INT-END-ADAPTIVE': 'Forge Master',
        'STR-INT-CHA-STABLE': 'Commander',
        'STR-INT-CHA-ADAPTIVE': 'Champion',
        'WIS-DEX-END-STABLE': 'Shadow Monk',
        'WIS-DEX-END-ADAPTIVE': 'Ghost',
        'WIS-DEX-CHA-STABLE': 'Diplomat',
        'WIS-DEX-CHA-ADAPTIVE': 'Bard',
        'WIS-INT-END-STABLE': 'Oracle',
        'WIS-INT-END-ADAPTIVE': 'Druid',
        'WIS-INT-CHA-STABLE': 'Alchemist',
        'WIS-INT-CHA-ADAPTIVE': 'Architect',
    };

    const key = `${axis1}-${axis2}-${axis3}-${axis4}`;
    const archeName = map[key] || 'Shadow Monk';
    
    const archetype = ARCHETYPES[archeName] || ARCHETYPES['None'];
    let tier = 1;
    if (level >= 17) tier = 5;
    else if (level >= 14) tier = 4;
    else if (level >= 11) tier = 3;
    else if (level >= 8) tier = 2;

    return {
        name: archetype.name,
        tier: tier,
        stage: archetype.tiers[tier - 1]
    };
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

    const archetypeInfo = determineArchetype(user.rpg.stats, user.level);
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
