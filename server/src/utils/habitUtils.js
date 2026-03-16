import Habit from '../models/Habit.js';

export const initializeSystemHabits = async (userId) => {
    const habits = [
        {
            user: userId,
            name: 'Journal',
            icon: 'menu_book',
            color: 'violet',
            category: 'Mindset',
            systemId: 'journal'
        },
        {
            user: userId,
            name: 'Finance Tracking',
            icon: 'payments',
            color: 'emerald',
            category: 'Finance',
            systemId: 'finance'
        },
        {
            user: userId,
            name: 'Daily Planning',
            icon: 'event_note',
            color: 'amber',
            category: 'Productivity',
            systemId: 'planner'
        }
    ];

    try {
        for (const h of habits) {
            const exists = await Habit.findOne({ user: userId, systemId: h.systemId });
            if (!exists) {
                await Habit.create(h);
            }
        }
    } catch (error) {
        console.error('Failed to initialize system habits:', error);
    }
};

export const checkSystemHabit = async (userId, systemId, dateStr = null) => {
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
