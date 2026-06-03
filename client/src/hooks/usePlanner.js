import useSWR, { useSWRConfig } from 'swr';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { soundManager } from '../services/sound';

export const usePlanner = (dateInput) => {
    const { user } = useAuthStore();
    const userId = user?._id;
    const { mutate } = useSWRConfig();
    
    // Determine query params and key
    let queryParams = '';
    let dateStr = '';

    if (dateInput && typeof dateInput === 'object' && dateInput.year && dateInput.month) {
        queryParams = `year=${dateInput.year}&month=${dateInput.month}`;
        dateStr = `${dateInput.year}-${String(dateInput.month).padStart(2, '0')}`; // For mutation matching if needed
    } else if (dateInput) {
        dateStr = dateInput instanceof Date 
            ? dateInput.toISOString().split('T')[0]
            : dateInput;
        queryParams = `date=${dateStr}`;
    }

    const fetcher = url => api.get(url).then(res => res.data);
    
    // Fetch tasks for the specific date or month
    const swrKey = userId ? (queryParams ? `/planner/tasks?${queryParams}` : `/planner/tasks`) : null;
    const { data: tasks, error, isLoading } = useSWR(swrKey, fetcher);

    const addTask = async (taskData) => {
        if (!userId) return;
        try {
            const taskDate = taskData.date || (dateInput instanceof Date ? dateInput.toISOString().split('T')[0] : dateInput);
            await api.post('/planner/tasks', {
                ...taskData,
                date: taskDate
            });
            // Global mutate to refresh any matching planner queries
            mutate(key => typeof key === 'string' && key.startsWith('/planner/tasks'));
        } catch (err) {
            console.error('Failed to add task:', err);
        }
    };

    const updateTask = async (id, taskData) => {
        if (!userId) return;
        try {
            await api.patch(`/planner/tasks/${id}`, taskData);
            mutate(`/planner/tasks?date=${dateStr}`);
        } catch (err) {
            console.error('Failed to update task:', err);
        }
    };

    const deleteTask = async (id) => {
        if (!userId || !id) return;
        try {
            await api.delete(`/planner/tasks/${id}`);
            // Explicitly mutate current key and all relevant planner keys
            if (swrKey) mutate(swrKey);
            mutate(key => typeof key === 'string' && key.includes('/planner/tasks'));
        } catch (err) {
            console.error('Failed to delete task:', err);
        }
    };

    const toggleComplete = async (id) => {
        const task = tasks?.find(t => t._id === id);
        if (task) {
            if (!task.completed) {
                soundManager.play('ding');
            }
            await updateTask(id, { completed: !task.completed });
        }
    };

    const reorderTasks = async (taskIds) => {
        if (!userId) return;
        try {
            await api.put('/planner/tasks/reorder', { habitIds: taskIds }); 
            mutate(`/planner/tasks?date=${dateStr}`);
        } catch (err) {
            console.error('Failed to reorder tasks:', err);
        }
    };

    return {
        tasks: tasks || [],
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        reorderTasks,
        isLoading,
        error
    };
};
