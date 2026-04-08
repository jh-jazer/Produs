import useSWR, { useSWRConfig } from 'swr';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

export const usePlanner = (selectedDate) => {
    const { user } = useAuthStore();
    const userId = user?._id;
    const { mutate } = useSWRConfig();
    
    // Normalize date string (YYYY-MM-DD)
    const dateStr = selectedDate instanceof Date 
        ? selectedDate.toISOString().split('T')[0]
        : selectedDate;

    const fetcher = url => api.get(url).then(res => res.data);
    
    // Fetch tasks for the specific date
    const { data: tasks, error, isLoading } = useSWR(
        userId ? `/planner/tasks?date=${dateStr}` : null, 
        fetcher
    );

    const addTask = async (taskData) => {
        if (!userId) return;
        try {
            await api.post('/planner/tasks', {
                ...taskData,
                date: taskData.date || dateStr
            });
            mutate(`/planner/tasks?date=${dateStr}`);
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
        if (!userId) return;
        try {
            await api.delete(`/planner/tasks/${id}`);
            mutate(`/planner/tasks?date=${dateStr}`);
        } catch (err) {
            console.error('Failed to delete task:', err);
        }
    };

    const toggleComplete = async (id) => {
        const task = tasks?.find(t => t._id === id);
        if (task) {
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
