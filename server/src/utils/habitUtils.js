import Habit from '../models/Habit.js';

export const initializeSystemHabits = async (userId) => {
    const habits = [
        {
            user: userId,
            name: 'Daily Planning',
            icon: 'event_note',
            color: 'amber',
            category: 'AGI',
            systemId: 'planner'
        },
        {
            user: userId,
            name: 'Finance Tracking',
            icon: 'payments',
            color: 'purple',
            category: 'WIS',
            systemId: 'finance'
        },
        {
            user: userId,
            name: 'Journaling',
            icon: 'history_edu',
            color: 'blue',
            category: 'INT',
            systemId: 'journal'
        },
        {
            user: userId,
            name: 'Workout',
            icon: 'fitness_center',
            color: 'red',
            category: 'STR',
            systemId: 'workout'
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

        // Update existing habits to ensure name, icon, and category are synchronized
        for (const habit of habits) {
            await Habit.updateOne(
                { user: userId, systemId: habit.systemId },
                {
                    $set: {
                        name: habit.name,
                        icon: habit.icon,
                        color: habit.color,
                        category: habit.category
                    }
                }
            );
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
