/* eslint-disable */
import useSWR, { useSWRConfig } from 'swr';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

export const useHealth = () => {
    const { user } = useAuthStore();
    const userId = user?._id;
    const { mutate } = useSWRConfig();

    const fetcher = url => api.get(url).then(res => res.data);
    const { data: allHealthLogs, error, isLoading } = useSWR(userId ? '/health' : null, fetcher);

    // Grouping helper
    const getLogsByType = (type) => allHealthLogs?.filter(log => log.type === type) || [];

    const workouts = getLogsByType('workout');
    const nutrition = getLogsByType('nutrition');
    const metrics = getLogsByType('metric');

    const addHealthLog = async (type, data) => {
        if (!userId) return;
        try {
            await api.post('/health', { ...data, type });
            mutate('/health');
        } catch (err) {
            console.error('Failed to add health log:', err);
        }
    };

    const updateHealthLog = async (id, type, updates) => {
        if (!userId) return;
        try {
            await api.put(`/health/${id}`, updates);
            mutate('/health');
        } catch (err) {
            console.error('Failed to update health log:', err);
        }
    };

    const deleteHealthLog = async (id) => {
        if (!userId) return;
        try {
            await api.delete(`/health/${id}`);
            mutate('/health');
        } catch (err) {
            console.error('Failed to delete health log:', err);
        }
    };

    return {
        workouts,
        nutrition,
        metrics,
        allHealthLogs,
        addHealthLog,
        updateHealthLog,
        deleteHealthLog,
        isLoading,
        error
    };
};
