import useSWR, { useSWRConfig } from 'swr';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

export const useFinance = () => {
    const { user } = useAuthStore();
    const userId = user?._id;
    const { mutate } = useSWRConfig();

    const fetcher = url => api.get(url).then(res => res.data);
    const { data: financeData, error, isLoading } = useSWR(userId ? '/finance' : null, fetcher);

    const transactions = financeData?.transactions || [];
    const budgets = financeData?.budgets || [];
    const debts = financeData?.debts || [];
    const wishlist = financeData?.wishlist || [];
    const savings = financeData?.savings || [];

    const getApiPath = (type) => {
        switch (type) {
            case 'transaction': return '/finance/transactions';
            case 'budget': return '/finance/budgets';
            case 'debt': return '/finance/debts';
            case 'wishlist': return '/finance/wishlist';
            case 'saving': return '/finance/savings';
            default: return '/finance';
        }
    };

    const addFinanceItem = async (type, data) => {
        if (!userId) return;
        try {
            await api.post(getApiPath(type), data);
            mutate('/finance');
        } catch (err) {
            console.error('Failed to add finance item:', err);
        }
    };

    const updateFinanceItem = async (id, type, updates) => {
        if (!userId) return;
        try {
            // Some updates might not need ID in URL if they use category/title (like budgets)
            const path = (type === 'budget')
                ? getApiPath(type)
                : `${getApiPath(type)}/${id}`;
            await api.patch(path, updates);
            mutate('/finance');
        } catch (err) {
            console.error('Failed to update finance item:', err);
        }
    };

    const deleteFinanceItem = async (id, type) => {
        if (!userId) return;
        try {
            await api.delete(`${getApiPath(type)}/${id}`);
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
