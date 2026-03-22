import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/db';
import SyncService from '../services/SyncService';
import useAuthStore from '../store/useAuthStore';

export const useGoalsLocal = (filters = {}) => {
    const { user } = useAuthStore();
    const userId = user?._id;
    
    const goals = useLiveQuery(
        async () => {
            if (!userId) return [];
            let collection = db.goals.where('userId').equals(userId);
            
            // Apply filters if provided
            const allGoals = await collection.toArray();
            return allGoals.filter(g => {
                if (filters.period && g.period !== filters.period) return false;
                if (filters.year && g.year !== filters.year) return false;
                if (filters.month !== undefined && g.month !== filters.month) return false;
                if (filters.week !== undefined && g.week !== filters.week) return false;
                return true;
            });
        },
        [userId, filters.period, filters.year, filters.month, filters.week]
    );

    const addGoal = async (goalData) => {
        if (!userId) return;

        const newGoal = {
            _id: `local-${Date.now()}`,
            userId,
            title: goalData.title,
            period: goalData.period,
            year: goalData.year,
            month: goalData.month,
            week: goalData.week,
            completed: false,
            isPending: true
        };

        await db.goals.add(newGoal);
        await SyncService.updateFeatureData('planner', userId, newGoal._id, 'set', { ...newGoal, type: 'goal' });
    };

    const updateGoal = async (id, goalData) => {
        if (!userId) return;
        const goal = await db.goals.get(id);
        if (goal) {
            const updatedGoal = { ...goal, ...goalData, isPending: true };
            await db.goals.put(updatedGoal);
            await SyncService.updateFeatureData('planner', userId, id, 'set', { ...updatedGoal, type: 'goal' });
        }
    };

    const deleteGoal = async (id) => {
        if (!userId) return;
        await db.goals.delete(id);
        await SyncService.updateFeatureData('planner', userId, id, 'delete');
    };

    const toggleGoal = async (id) => {
        const goal = await db.goals.get(id);
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
        isLoading: goals === undefined
    };
};
