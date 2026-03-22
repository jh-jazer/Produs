import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/db';
import SyncService from '../services/SyncService';
import useAuthStore from '../store/useAuthStore';

export const usePlannerLocal = (selectedDate) => {
    const { user } = useAuthStore();
    const userId = user?._id;
    
    // Normalize date string (YYYY-MM-DD)
    const dateStr = selectedDate instanceof Date 
        ? selectedDate.toISOString().split('T')[0]
        : selectedDate;

    const tasks = useLiveQuery(
        async () => {
            if (!userId) return [];
            // If dateStr is provided, filter by date, otherwise get all (for calendar/goals)
            let query = db.planner.where('userId').equals(userId);
            if (dateStr) {
                return await query.filter(t => t.date === dateStr).sortBy('order');
            }
            return await query.sortBy('order');
        },
        [userId, dateStr]
    );

    const addTask = async (taskData) => {
        if (!userId) return;

        const newTask = {
            _id: `local-${Date.now()}`,
            userId,
            title: taskData.title,
            description: taskData.description || '',
            date: taskData.date || dateStr,
            endDate: taskData.endDate || taskData.date || dateStr,
            startTime: taskData.startTime || '',
            endTime: taskData.endTime || '',
            priority: taskData.priority || false,
            completed: taskData.completed || false,
            type: taskData.type || 'task',
            color: taskData.color || '#3b82f6',
            order: (tasks?.length || 0),
            isPending: true
        };

        await db.planner.add(newTask);
        await SyncService.updateFeatureData('planner', userId, newTask._id, 'set', newTask);
    };

    const updateTask = async (id, taskData) => {
        if (!userId) return;
        const task = await db.planner.get(id);
        if (task) {
            const updatedTask = { ...task, ...taskData, isPending: true };
            await db.planner.put(updatedTask);
            await SyncService.updateFeatureData('planner', userId, id, 'set', updatedTask);
        }
    };

    const deleteTask = async (id) => {
        if (!userId) return;
        await db.planner.delete(id);
        await SyncService.updateFeatureData('planner', userId, id, 'delete');
    };

    const toggleComplete = async (id) => {
        const task = await db.planner.get(id);
        if (task) {
            await updateTask(id, { completed: !task.completed });
        }
    };

    const reorderTasks = async (taskIds) => {
        if (!userId) return;
        await db.transaction('rw', db.planner, async () => {
            for (let i = 0; i < taskIds.length; i++) {
                const id = taskIds[i];
                const task = await db.planner.get(id);
                if (task) {
                    const updatedTask = { ...task, order: i, isPending: true };
                    await db.planner.put(updatedTask);
                    await SyncService.updateFeatureData('planner', userId, id, 'set', updatedTask);
                }
            }
        });
    };

    return {
        tasks: tasks || [],
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        reorderTasks,
        isLoading: tasks === undefined
    };
};
