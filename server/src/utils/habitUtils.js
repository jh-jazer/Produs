import Habit from '../models/Habit.js';

export const initializeSystemHabits = async (userId) => {
    const habits = [
        {
            user: userId,
            name: 'Journal',
            icon: 'menu_book',
            color: 'violet',
            category: 'WIS',
            systemId: 'journal'
        },
        {
            user: userId,
            name: 'Finance Tracking',
            icon: 'payments',
            color: 'emerald',
            category: 'PER',
            systemId: 'finance'
        },
        {
            user: userId,
            name: 'Daily Planning',
            icon: 'event_note',
            color: 'amber',
            category: 'DEX',
            systemId: 'planner'
        }
    ];

    try {
        // Find existing system habits for this user
        const existingHabits = await Habit.find({
            user: userId,
            systemId: { $in: habits.map(h => h.systemId) }
        });

        const existingSystemIds = new Set(existingHabits.map(h => h.systemId));

        // Filter out habits that already exist
        const missingHabits = habits.filter(h => !existingSystemIds.has(h.systemId));

        // Bulk insert missing habits
        if (missingHabits.length > 0) {
            await Habit.insertMany(missingHabits);
        }
    } catch (error) {
        console.error('Failed to initialize system habits:', error);
    }
};

export const checkSystemHabit = async (userId, systemId, dateStr = null) => {
    if (!userId || !systemId) return;

    try {
        const targetDateStr = dateStr || new Date().toISOString().split('T')[0];
        const habit = await Habit.findOne({ user: userId, systemId });
        
        if (habit) {
            const alreadyChecked = habit.checks.some(c => c.date === targetDateStr && c.completed);
            if (!alreadyChecked) {
                await habit.toggleCheck(targetDateStr);
            }
        }
    } catch (error) {
        console.error(`Failed to check system habit ${systemId}:`, error);
    }
};
