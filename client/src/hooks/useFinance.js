import useSWR, { useSWRConfig } from 'swr';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

export const useFinance = () => {
    const { user } = useAuthStore();
    const userId = user?._id;
    const { mutate } = useSWRConfig();

    const fetcher = url => api.get(url).then(res => res.data);
    const { data: allFinanceItems, error, isLoading } = useSWR(userId ? '/finance' : null, fetcher);

    // Grouping helper
    const getItemsByType = (type) => allFinanceItems?.filter(item => item.type === type) || [];

    const transactions = getItemsByType('transaction');
    const budgets = getItemsByType('budget');
    const debts = getItemsByType('debt');
    const wishlist = getItemsByType('wishlist');
    const savings = getItemsByType('saving');

    const addFinanceItem = async (type, data) => {
        if (!userId) return;
        try {
            await api.post('/finance', { ...data, type });
            mutate('/finance');
        } catch (err) {
            console.error('Failed to add finance item:', err);
        }
    };

    const updateFinanceItem = async (id, type, updates) => {
        if (!userId) return;
        try {
            await api.put(`/finance/${id}`, updates);
            mutate('/finance');
        } catch (err) {
            console.error('Failed to update finance item:', err);
        }
    };

    const deleteFinanceItem = async (id) => {
        if (!userId) return;
        try {
            await api.delete(`/finance/${id}`);
            mutate('/finance');
        } catch (err) {
            console.error('Failed to delete finance item:', err);
        }
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
        isLoading,
        error
    };
};
