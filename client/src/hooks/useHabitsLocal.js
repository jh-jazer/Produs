import useSWR, { useSWRConfig } from 'swr';
import api from '../services/api';
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
    const { mutate } = useSWRConfig();

    const fetcher = url => api.get(url).then(res => res.data);
    const { data: habits, error, isLoading } = useSWR(userId ? '/habits' : null, fetcher);

    const addHabit = async (habitData) => {
        if (!userId) return;
        try {
            await api.post('/habits', habitData);
            mutate('/habits');
        } catch (err) {
            console.error('Failed to add habit:', err);
        }
    };

    const toggleCheck = async (habitId, dateStr) => {
        if (!userId) return;
        try {
            await api.patch(`/habits/${habitId}/check`, { dateStr });
            mutate('/habits');
        } catch (err) {
            console.error('Failed to toggle check:', err);
        }
    };

    const updateHabit = async (id, data) => {
        if (!userId) return;
        try {
            await api.put(`/habits/${id}`, data);
            mutate('/habits');
        } catch (err) {
            console.error('Failed to update habit:', err);
        }
    };

    const deleteHabit = async (id) => {
        if (!userId) return;
        try {
            await api.delete(`/habits/${id}`);
            mutate('/habits');
        } catch (err) {
            console.error('Failed to delete habit:', err);
        }
    };

    const reorderHabits = async (habitIds) => {
        if (!userId) return;
        try {
            await api.put('/habits/reorder', { habitIds });
            mutate('/habits');
        } catch (err) {
            console.error('Failed to reorder habits:', err);
        }
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
        isLoading,
        error
    };
};
