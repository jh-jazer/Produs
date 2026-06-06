import useSWR, { useSWRConfig } from 'swr';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { soundManager } from '../services/sound';

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

export const useHabits = () => {
    const { user } = useAuthStore();
    const userId = user?._id;
    const isLinked = !!user?.partner;
    const { mutate } = useSWRConfig();

    const fetcher = url => api.get(url).then(res => res.data);
    const habitsKey = userId ? (isLinked ? '/habits?view=partner' : '/habits') : null;
    const { data: habits, error, isLoading } = useSWR(habitsKey, fetcher);

    const mutateHabits = () => {
        mutate(habitsKey);
        if (isLinked) {
            mutate('/habits');
        }
    };

    const addHabit = async (habitData) => {
        if (!userId) return;
        try {
            await api.post('/habits', habitData);
            mutateHabits();
        } catch (err) {
            console.error('Failed to add habit:', err);
        }
    };

    const toggleCheck = async (habitId, dateStr) => {
        if (!userId) return;
        const habit = processedHabits.find(h => h._id === habitId);
        const wasChecked = habit?.checks?.some(c => c.date === dateStr && c.completed);
        if (!wasChecked) {
            soundManager.play('ding');
        }
        try {
            await api.patch(`/habits/${habitId}/check`, { dateStr });
            mutateHabits();
        } catch (err) {
            console.error('Failed to toggle check:', err);
        }
    };

    const updateHabit = async (id, data) => {
        if (!userId) return;
        try {
            await api.put(`/habits/${id}`, data);
            mutateHabits();
        } catch (err) {
            console.error('Failed to update habit:', err);
        }
    };

    const deleteHabit = async (id) => {
        if (!userId) return;
        try {
            await api.delete(`/habits/${id}`);
            mutateHabits();
        } catch (err) {
            console.error('Failed to delete habit:', err);
        }
    };

    const initHabits = async () => {
        if (!userId) return;
        try {
            await api.post('/habits/init');
            mutateHabits();
        } catch (err) {
            console.error('Failed to initialize habits:', err);
        }
    };

    const reorderHabits = async (habitIds) => {
        if (!userId) return;
        try {
            await api.put('/habits/reorder', { habitIds });
            mutateHabits();
        } catch (err) {
            console.error('Failed to reorder habits:', err);
        }
    };

    const processedHabits = habits?.map(habit => {
        const idVal = habit.user || habit.userId;
        let finalStreak = 0;

        if (habit.isShared && habit.sharedGroupId) {
            const partnerPart = habits.find(h => h.sharedGroupId === habit.sharedGroupId && h._id !== habit._id);
            if (partnerPart) {
                const myChecks = habit.checks || [];
                const partnerChecks = partnerPart.checks || [];
                const myCompletedDates = new Set(myChecks.filter(c => c.completed).map(c => c.date));
                const partnerCompletedDates = new Set(partnerChecks.filter(c => c.completed).map(c => c.date));

                const combinedChecks = [];
                const allDates = new Set([...myCompletedDates, ...partnerCompletedDates]);
                allDates.forEach(date => {
                    combinedChecks.push({
                        date,
                        completed: myCompletedDates.has(date) && partnerCompletedDates.has(date)
                    });
                });

                finalStreak = calculateStreak(combinedChecks);
            } else {
                finalStreak = calculateStreak(habit.checks || []);
            }
        } else {
            finalStreak = calculateStreak(habit.checks || []);
        }

        return {
            ...habit,
            userId: idVal,
            user: idVal,
            streak: finalStreak
        };
    }) || [];

    return {
        habits: processedHabits,
        addHabit,
        toggleCheck,
        updateHabit,
        deleteHabit,
        initHabits,
        reorderHabits,
        isLoading,
        error
    };
};
