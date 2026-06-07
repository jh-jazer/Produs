import useSWR, { useSWRConfig } from 'swr';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

export const useGoals = (filters = {}, options = {}) => {
    const { view } = options;
    const { user } = useAuthStore();
    const userId = user?._id;
    const { mutate } = useSWRConfig();
    
    // Construct query params from filters
    const queryParams = new URLSearchParams();
    if (filters.period) queryParams.append('period', filters.period);
    if (filters.year) queryParams.append('year', filters.year);
    if (filters.month !== undefined) queryParams.append('month', filters.month);
    if (filters.week !== undefined) queryParams.append('week', filters.week);
    if (view === 'partner') queryParams.append('view', 'partner');
    
    const queryString = queryParams.toString();
    const fetchUrl = userId ? `/planner/goals?${queryString}` : null;

    const fetcher = url => api.get(url).then(res => res.data);
    const { data: goals, error, isLoading } = useSWR(fetchUrl, fetcher);

    const addGoal = async (goalData) => {
        if (!userId) return;
        try {
            await api.post('/planner/goals', goalData);
            mutate(fetchUrl);
        } catch (err) {
            console.error('Failed to add goal:', err);
        }
    };

    const updateGoal = async (id, goalData) => {
        if (!userId) return;
        try {
            await api.patch(`/planner/goals/${id}`, goalData);
            mutate(fetchUrl);
        } catch (err) {
            console.error('Failed to update goal:', err);
        }
    };

    const deleteGoal = async (id) => {
        if (!userId) return;

        // Optimistically remove the goal from the cache
        const buildOptimisticData = (currentGoals) => {
            if (!currentGoals) return currentGoals;
            return currentGoals.filter(g => g._id !== id);
        };

        try {
            await mutate(
                fetchUrl,
                async () => {
                    await api.delete(`/planner/goals/${id}`);
                    return undefined;
                },
                {
                    optimisticData: buildOptimisticData,
                    rollbackOnError: true,
                    revalidate: true,
                    populateCache: false,
                }
            );
        } catch (err) {
            console.error('Failed to delete goal:', err);
            return { error: true };
        }
    };

    const toggleGoal = async (id) => {
        const goal = goals?.find(g => g._id === id);
        if (!goal) return;

        // Optimistically flip the completed state
        const buildOptimisticData = (currentGoals) => {
            if (!currentGoals) return currentGoals;
            return currentGoals.map(g =>
                g._id === id ? { ...g, completed: !g.completed } : g
            );
        };

        try {
            await mutate(
                fetchUrl,
                async () => {
                    await api.patch(`/planner/goals/${id}`, { completed: !goal.completed });
                    return undefined;
                },
                {
                    optimisticData: buildOptimisticData,
                    rollbackOnError: true,
                    revalidate: true,
                    populateCache: false,
                }
            );
        } catch (err) {
            console.error('Failed to toggle goal:', err);
            return { error: true };
        }
    };

    return {
        goals: goals || [],
        addGoal,
        updateGoal,
        deleteGoal,
        toggleGoal,
        isLoading,
        error
    };
};
