import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/db';
import SyncService from '../services/SyncService';
import useAuthStore from '../store/useAuthStore';

/**
 * Helper to calculate habit streak matching server logic.
 */
const calculateStreak = (checks) => {
    if (!checks || checks.length === 0) return 0;

    const completedDates = checks
        .filter(c => c.completed)
        .map(c => c.date)
        .sort((a, b) => b.localeCompare(a));

    if (completedDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let latestDate = completedDates[0];
    if (latestDate !== today && latestDate !== yesterdayStr) {
        return 0;
    }

    let currentStreak = 0;
    let expectedDate = new Date(latestDate);

    for (const dateStr of completedDates) {
        const actualDateStr = expectedDate.toISOString().split('T')[0];
        if (dateStr === actualDateStr) {
            currentStreak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
            break;
        }
    }

    return currentStreak;
};

export const useHabitsLocal = () => {
    const { user } = useAuthStore();
    const userId = user?._id;

    const habits = useLiveQuery(
        async () => {
            if (!userId) return [];
            return await db.habits
                .where('userId')
                .equals(userId)
                .sortBy('order');
        },
        [userId]
    );

    const addHabit = async (habitData) => {
        if (!userId) return;

        const newHabit = {
            _id: `local-${Date.now()}`,
            userId,
            ...habitData,
            streak: 0,
            checks: [],
            isPending: true,
            order: (habits?.length || 0)
        };

        await db.habits.add(newHabit);
        await SyncService.updateFeatureData('habits', userId, newHabit._id, 'set', newHabit);
    };

    const toggleCheck = async (habitId, dateStr) => {
        if (!userId) return;

        const habit = await db.habits.get(habitId);
        if (!habit) return;

        const checks = habit.checks || [];
        const checkIndex = checks.findIndex(c => c.date === dateStr);
        const newChecks = [...checks];

        if (checkIndex > -1) {
            newChecks[checkIndex] = { ...newChecks[checkIndex], completed: !newChecks[checkIndex].completed };
        } else {
            newChecks.push({ date: dateStr, completed: true });
        }

        const newStreak = calculateStreak(newChecks);
        const updatedHabit = { ...habit, checks: newChecks, streak: newStreak, isPending: true };

        await db.habits.put(updatedHabit);
        await SyncService.updateFeatureData('habits', userId, habitId, 'set', updatedHabit);
    };

    const updateHabit = async (id, data) => {
        if (!userId) return;
        const habit = await db.habits.get(id);
        if (habit) {
            const updatedHabit = { ...habit, ...data, isPending: true };
            await db.habits.put(updatedHabit);
            await SyncService.updateFeatureData('habits', userId, id, 'set', updatedHabit);
        }
    };

    const deleteHabit = async (id) => {
        if (!userId) return;
        await db.habits.delete(id);
        await SyncService.updateFeatureData('habits', userId, id, 'delete');
    };

    const reorderHabits = async (habitIds) => {
        if (!userId) return;
        
        await db.transaction('rw', db.habits, async () => {
            for (let i = 0; i < habitIds.length; i++) {
                const id = habitIds[i];
                const habit = await db.habits.get(id);
                if (habit) {
                    const updatedHabit = { ...habit, order: i, isPending: true };
                    await db.habits.put(updatedHabit);
                    await SyncService.updateFeatureData('habits', userId, id, 'set', updatedHabit);
                }
            }
        });
    };

    const processedHabits = habits?.map(habit => ({
        ...habit,
        streak: calculateStreak(habit.checks || [])
    })) || [];

    return {
        habits: processedHabits,
        addHabit,
        toggleCheck,
        updateHabit,
        deleteHabit,
        reorderHabits,
        isLoading: habits === undefined
    };
};
