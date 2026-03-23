import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/db';
import SyncService from '../services/SyncService';
import useAuthStore from '../store/useAuthStore';

export const useFinanceLocal = () => {
    const { user } = useAuthStore();
    const userId = user?._id;

    // Fetch all finance items for the user
    // In db.finance, we use `type` to distinguish transactions, budgets, etc.
    const allFinanceItems = useLiveQuery(
        async () => {
            if (!userId) return [];
            return await db.finance
                .where('userId')
                .equals(userId)
                .toArray();
        },
        [userId]
    );

    // Grouping helper
    const getItemsByType = (type) => allFinanceItems?.filter(item => item.type === type) || [];

    const transactions = getItemsByType('transaction');
    const budgets = getItemsByType('budget');
    const debts = getItemsByType('debt');
    const wishlist = getItemsByType('wishlist');
    const savings = getItemsByType('saving');

    const addFinanceItem = async (type, data) => {
        if (!userId) return;

        const newItem = {
            _id: `local-${Date.now()}`,
            userId,
            type,
            ...data,
            isPending: true
        };

        if (type === 'transaction') {
             newItem.date = newItem.date || new Date().toISOString();
        }

        // 1. Save to local Dexie
        await db.finance.add(newItem);

        // 2. Update Yjs and trigger background sync
        await SyncService.updateFeatureData('finance', userId, newItem._id, 'set', newItem);
    };

    const updateFinanceItem = async (id, type, updates) => {
        if (!userId) return;

        const item = await db.finance.where('_id').equals(id).first();
        if (item) {
            const updatedItem = { ...item, ...updates, isPending: true };
            await db.finance.put(updatedItem);
            await SyncService.updateFeatureData('finance', userId, id, 'set', updatedItem);
        }
    };

    const deleteFinanceItem = async (id) => {
        if (!userId) return;
        
        await db.finance.where('_id').equals(id).delete();
        await SyncService.updateFeatureData('finance', userId, id, 'delete');
    };

    return {
        transactions,
        budgets,
        debts,
        wishlist,
        savings,
        addFinanceItem,
        updateFinanceItem,
        deleteFinanceItem,
        isLoading: allFinanceItems === undefined
    };
};
