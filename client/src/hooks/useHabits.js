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

        // Build optimistic data by cloning current habits and toggling the check
        const buildOptimisticData = (currentHabits) => {
            if (!currentHabits) return currentHabits;
            return currentHabits.map(h => {
                if (h._id !== habitId) return h;
                const checks = [...(h.checks || [])];
                const existingIdx = checks.findIndex(c => c.date === dateStr);
                if (existingIdx >= 0) {
                    // Toggle: if completed → uncomplete, if uncompleted → complete
                    checks[existingIdx] = { ...checks[existingIdx], completed: !checks[existingIdx].completed };
                } else {
                    // No entry yet → mark as completed
                    checks.push({ date: dateStr, completed: true });
                }
                return { ...h, checks };
            });
        };

        try {
            // Optimistically update the SWR cache immediately (zero lag for the user)
            await mutate(
                habitsKey,
                async (currentData) => {
                    // Fire the actual API call
                    await api.patch(`/habits/${habitId}/check`, { dateStr });
                    mutate('/auth/me');
                    // After success, return undefined to let SWR revalidate with fresh server data
                    return undefined;
                },
                {
                    optimisticData: buildOptimisticData,
                    rollbackOnError: true,
                    revalidate: true,
                    populateCache: false,
                }
            );
            // Also revalidate partner view cache if linked
            if (isLinked) {
                mutate('/habits');
            }
        } catch (err) {
            console.error('Failed to toggle check:', err);
            return { error: true };
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

        // Optimistically remove the habit from the cache
        const buildOptimisticData = (currentHabits) => {
            if (!currentHabits) return currentHabits;
            return currentHabits.filter(h => h._id !== id);
        };

        try {
            await mutate(
                habitsKey,
                async () => {
                    await api.delete(`/habits/${id}`);
                    return undefined;
                },
                {
                    optimisticData: buildOptimisticData,
                    rollbackOnError: true,
                    revalidate: true,
                    populateCache: false,
                }
            );
            if (isLinked) {
                mutate('/habits');
            }
        } catch (err) {
            console.error('Failed to delete habit:', err);
            return { error: true };
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

        // Optimistically reorder the habits in the cache
        const buildOptimisticData = (currentHabits) => {
            if (!currentHabits) return currentHabits;
            const habitMap = new Map(currentHabits.map(h => [h._id, h]));
            const reordered = habitIds
                .map(id => habitMap.get(id))
                .filter(Boolean);
            // Append any habits not in the reorder list (safety)
            const reorderedIds = new Set(habitIds);
            const remaining = currentHabits.filter(h => !reorderedIds.has(h._id));
            return [...reordered, ...remaining];
        };

        try {
            await mutate(
                habitsKey,
                async () => {
                    await api.put('/habits/reorder', { habitIds });
                    return undefined;
                },
                {
                    optimisticData: buildOptimisticData,
                    rollbackOnError: true,
                    revalidate: true,
                    populateCache: false,
                }
            );
            if (isLinked) {
                mutate('/habits');
            }
        } catch (err) {
            console.error('Failed to reorder habits:', err);
            return { error: true };
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
