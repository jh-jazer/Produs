import Habit from '../models/Habit.js';

export const initializeSystemHabits = async (userId) => {
    const habits = [
        {
            user: userId,
            name: 'Focus Today',
            icon: 'hourglass_empty',
            color: 'blue',
            systemId: 'focus'
        },
        {
            user: userId,
            name: 'Daily Planning',
            icon: 'event_note',
            color: 'amber',
            systemId: 'planner'
        },
        {
            user: userId,
            name: 'Goal Setting',
            icon: 'track_changes',
            color: 'red',
            systemId: 'workout'
        },
        {
            user: userId,
            name: 'Journaling',
            icon: 'history_edu',
            color: 'blue',
            systemId: 'journal'
        },
        {
            user: userId,
            name: 'Finance Tracking',
            icon: 'payments',
            color: 'purple',
            systemId: 'finance'
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

        // Update existing habits to ensure name and icon are synchronized
        const bulkOps = habits.map(habit => ({
            updateOne: {
                filter: { user: userId, systemId: habit.systemId },
                update: {
                    $set: {
                        name: habit.name,
                        icon: habit.icon,
                        color: habit.color
                    }
                }
            }
        }));

        if (bulkOps.length > 0) {
            await Habit.bulkWrite(bulkOps, { ordered: false });
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
