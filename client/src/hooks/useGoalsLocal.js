import useSWR, { useSWRConfig } from 'swr';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

export const useGoalsLocal = (filters = {}) => {
    const { user } = useAuthStore();
    const userId = user?._id;
    const { mutate } = useSWRConfig();
    
    // Construct query params from filters
    const queryParams = new URLSearchParams();
    if (filters.period) queryParams.append('period', filters.period);
    if (filters.year) queryParams.append('year', filters.year);
    if (filters.month !== undefined) queryParams.append('month', filters.month);
    if (filters.week !== undefined) queryParams.append('week', filters.week);
    
    const queryString = queryParams.toString();
    const fetchUrl = userId ? `/goals?${queryString}` : null;

    const fetcher = url => api.get(url).then(res => res.data);
    const { data: goals, error, isLoading } = useSWR(fetchUrl, fetcher);

    const addGoal = async (goalData) => {
        if (!userId) return;
        try {
            await api.post('/goals', goalData);
            mutate(fetchUrl);
        } catch (err) {
            console.error('Failed to add goal:', err);
        }
    };

    const updateGoal = async (id, goalData) => {
        if (!userId) return;
        try {
            await api.put(`/goals/${id}`, goalData);
            mutate(fetchUrl);
        } catch (err) {
            console.error('Failed to update goal:', err);
        }
    };

    const deleteGoal = async (id) => {
        if (!userId) return;
        try {
            await api.delete(`/goals/${id}`);
            mutate(fetchUrl);
        } catch (err) {
            console.error('Failed to delete goal:', err);
        }
    };

    const toggleGoal = async (id) => {
        const goal = goals?.find(g => g._id === id);
        if (goal) {
            await updateGoal(id, { completed: !goal.completed });
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
