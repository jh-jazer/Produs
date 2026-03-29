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

export const getLevelProgress = (totalXP) => {
    let currentLevel = LEVEL_TABLE[0];
    let nextLevel = LEVEL_TABLE[1];

    for (let i = LEVEL_TABLE.length - 1; i >= 0; i--) {
        if (totalXP >= LEVEL_TABLE[i].totalRequired) {
            currentLevel = LEVEL_TABLE[i];
            nextLevel = LEVEL_TABLE[i + 1] || LEVEL_TABLE[i];
            break;
        }
    }

    const xpInCurrentLevel = totalXP - currentLevel.totalRequired;
    const xpNeededForNext = nextLevel.xpToNext;
    const progress = (xpInCurrentLevel / xpNeededForNext) * 100;

    return {
        level: currentLevel.level,
        title: currentLevel.title,
        xpInLevel: xpInCurrentLevel,
        xpRequired: xpNeededForNext,
        progress: Math.min(progress, 100),
        totalXP
    };
};

export const getStreakMultiplier = (streak) => {
    if (streak >= 100) return 2.0;
    if (streak >= 30) return 1.75;
    if (streak >= 14) return 1.5;
    if (streak >= 7) return 1.25;
    if (streak >= 3) return 1.1;
    return 1.0;
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
