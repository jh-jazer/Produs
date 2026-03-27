/**
 * RPG Utility Engine for Produs
 * Handles Leveling, XP awarding, Daily Caps, and Archetype Evolution.
 */

export const LEVEL_TABLE = [
    { level: 1, title: 'Archetype Tier 1', xpToNext: 100, totalRequired: 0 },
    { level: 2, title: 'Archetype Tier 1', xpToNext: 250, totalRequired: 100 },
    { level: 3, title: 'Archetype Tier 1', xpToNext: 500, totalRequired: 350 },
    { level: 4, title: 'Archetype Tier 1', xpToNext: 1000, totalRequired: 850 },
    { level: 5, title: 'Archetype Tier 1', xpToNext: 1750, totalRequired: 1850 },
    { level: 6, title: 'Archetype Tier 1', xpToNext: 2750, totalRequired: 3600 },
    { level: 7, title: 'Archetype Tier 1', xpToNext: 4000, totalRequired: 6350 },
    { level: 8, title: 'Archetype Tier 2', xpToNext: 5500, totalRequired: 10350 },
    { level: 9, title: 'Archetype Tier 2', xpToNext: 7500, totalRequired: 15850 },
    { level: 10, title: 'Archetype Tier 2', xpToNext: 10000, totalRequired: 23350 },
    { level: 11, title: 'Archetype Tier 3', xpToNext: 13000, totalRequired: 33350 },
    { level: 12, title: 'Archetype Tier 3', xpToNext: 17000, totalRequired: 46350 },
    { level: 13, title: 'Archetype Tier 3', xpToNext: 22000, totalRequired: 63350 },
    { level: 14, title: 'Archetype Tier 4', xpToNext: 28000, totalRequired: 85350 },
    { level: 15, title: 'Archetype Tier 4', xpToNext: 35000, totalRequired: 113350 },
    { level: 16, title: 'Archetype Tier 4', xpToNext: 45000, totalRequired: 148350 },
    { level: 17, title: 'Archetype Tier 5', xpToNext: 57000, totalRequired: 193350 },
    { level: 18, title: 'Archetype Tier 5', xpToNext: 72000, totalRequired: 250350 },
    { level: 19, title: 'Archetype Tier 5', xpToNext: 90000, totalRequired: 322350 },
    { level: 20, title: 'Archetype Tier 5', xpToNext: 0, totalRequired: 412350 },
];

export const ARCHETYPES = {
    BLADE_DANCER: {
        name: 'Blade Dancer',
        dominant: ['str', 'dex'],
        secondary: 'end',
        tiers: ['Street Brawler', 'Blade Dancer', 'Phantom Edge', 'Death\'s Silhouette', 'The Undying Blade']
    },
    SENTINEL: {
        name: 'Sentinel',
        dominant: ['str', 'end'],
        secondary: 'wis',
        tiers: ['The Stubborn', 'Sentinel', 'Iron Bulwark', 'The Immovable', 'Eternal Fortress']
    },
    ALCHEMIST: {
        name: 'Alchemist',
        dominant: ['int', 'wis'],
        secondary: 'dex',
        tiers: ['Tinkerer', 'Alchemist', 'Formula Breaker', 'Grand Synthesist', 'Architect of Truth']
    },
    ARCHITECT: {
        name: 'Architect',
        dominant: ['int', 'dex'],
        secondary: 'wis',
        tiers: ['Draftsman', 'Architect', 'System Lord', 'World Builder', 'The Eternal Planner']
    },
    ORACLE: {
        name: 'Oracle',
        dominant: ['wis', 'end'],
        secondary: 'int',
        tiers: ['Dreamer', 'Oracle', 'The Farsighted', 'Keeper of Inevitable Truths', 'The One Who Already Knew']
    },
    COMMANDER: {
        name: 'Commander',
        dominant: ['cha', 'str'],
        secondary: 'wis',
        tiers: ['Squad Leader', 'Commander', 'Warlord', 'Iron Sovereign', 'The Undefeated King']
    },
    BARD: {
        name: 'Bard',
        dominant: ['cha', 'int'],
        secondary: 'wis',
        tiers: ['Storyteller', 'Bard', 'Silver Tongue', 'Voice of Legends', 'The Word That Moves Worlds']
    },
    SHADOW_MONK: {
        name: 'Shadow Monk',
        dominant: ['wis', 'dex'],
        secondary: 'int',
        tiers: ['Introvert', 'Shadow Monk', 'The Unseen', 'Void Walker', 'He Who Needs No Witness']
    },
    DRUID: {
        name: 'Druid',
        dominant: ['wis', 'end'],
        secondary: 'str',
        tiers: ['Wanderer', 'Druid', 'Pattern Seer', 'Voice of the Wild', 'The Living Codex']
    }
};

export const XP_CAPS = {
    str: 60,
    dex: 50,
    end: 40,
    int: 55,
    wis: 65,
    cha: 45,
    total: 315
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
    const statEntries = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    const highest = statEntries[0][0];
    const secondHighest = statEntries[1][0];

    let archeKey = '';

    // Synchronized Neural Link Mapping (Exhaustive)
    switch (highest) {
        case 'str':
            if (secondHighest === 'dex') archeKey = 'BLADE_DANCER';
            else if (secondHighest === 'end') archeKey = 'SENTINEL';
            else if (secondHighest === 'cha') archeKey = 'COMMANDER';
            else archeKey = 'SENTINEL';
            break;
        case 'dex':
            if (secondHighest === 'str') archeKey = 'BLADE_DANCER';
            else if (secondHighest === 'int') archeKey = 'ARCHITECT';
            else if (secondHighest === 'end') archeKey = 'SHADOW_MONK';
            else archeKey = 'ARCHITECT';
            break;
        case 'int':
            if (secondHighest === 'wis') archeKey = 'ALCHEMIST';
            else if (secondHighest === 'dex') archeKey = 'ARCHITECT';
            else if (secondHighest === 'cha') archeKey = 'BARD';
            else archeKey = 'ALCHEMIST';
            break;
        case 'wis':
            if (secondHighest === 'end') archeKey = stats.str > 15 ? 'DRUID' : 'ORACLE';
            else if (secondHighest === 'dex') archeKey = 'SHADOW_MONK';
            else if (secondHighest === 'int') archeKey = 'ALCHEMIST';
            else archeKey = 'ORACLE';
            break;
        case 'cha':
            if (secondHighest === 'str') archeKey = 'COMMANDER';
            else if (secondHighest === 'int') archeKey = 'BARD';
            else if (secondHighest === 'wis') archeKey = 'ORACLE';
            else archeKey = 'COMMANDER';
            break;
        case 'end':
            if (secondHighest === 'str') archeKey = 'SENTINEL';
            else if (secondHighest === 'wis') archeKey = 'DRUID';
            else if (secondHighest === 'cha') archeKey = 'COMMANDER';
            else archeKey = 'SENTINEL';
            break;
        default:
            archeKey = 'SENTINEL';
    }

    const archetype = ARCHETYPES[archeKey];
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

export const awardXP = async (user, stat, amount, streak = 1) => {
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

    // Check Total Daily Cap
    if (user.rpg.dailyXP.total >= XP_CAPS.total) return;

    // Check Stat Daily Cap
    const currentStatXP = user.rpg.dailyXP.byStat[stat] || 0;
    const statCap = XP_CAPS[stat] || 50;
    
    if (currentStatXP >= statCap) return;
    
    // Adjust finalXP if it exceeds caps
    if (user.rpg.dailyXP.total + finalXP > XP_CAPS.total) {
        finalXP = XP_CAPS.total - user.rpg.dailyXP.total;
    }
    if (currentStatXP + finalXP > statCap) {
        finalXP = statCap - currentStatXP;
    }

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

    return {
        leveledUp: user.level > oldLevel,
        transformed: oldArchetype !== 'None' && oldArchetype !== archetypeInfo.name,
        xpAwarded: finalXP
    };
};
