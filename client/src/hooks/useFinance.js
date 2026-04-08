import useSWR, { useSWRConfig } from 'swr';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

export const useFinance = () => {
    const { user } = useAuthStore();
    const userId = user?._id;
    const { mutate } = useSWRConfig();

    const fetcher = url => api.get(url).then(res => res.data);
    
    const { data: transactionsData, error: txError, isLoading: txLoading } = useSWR(userId ? '/finance/transactions' : null, fetcher);
    const { data: budgetsData, error: budError, isLoading: budLoading } = useSWR(userId ? '/finance/budgets' : null, fetcher);
    const { data: debtsData, error: debtError, isLoading: debtLoading } = useSWR(userId ? '/finance/debts' : null, fetcher);
    const { data: wishlistData, error: wishError, isLoading: wishLoading } = useSWR(userId ? '/finance/wishlist' : null, fetcher);
    const { data: savingsData, error: saveError, isLoading: saveLoading } = useSWR(userId ? '/finance/savings' : null, fetcher);

    const transactions = transactionsData || [];
    const budgets = budgetsData || [];
    const debts = debtsData || [];
    const wishlist = wishlistData || [];
    const savings = savingsData || [];

    const endpoints = {
        transaction: '/finance/transactions',
        budget: '/finance/budgets',
        debt: '/finance/debts',
        wishlist: '/finance/wishlist',
        saving: '/finance/savings'
    };

    const addFinanceItem = async (type, data) => {
        if (!userId) return;
        try {
            if (type === 'budget') {
                await api.put('/finance/budgets', data);
            } else if (type === 'saving') {
                await api.post('/finance/savings', data);
            } else {
                await api.post(endpoints[type], data);
            }
            mutate(endpoints[type]);
        } catch (err) {
            console.error(`Failed to add finance item [${type}]:`, err);
        }
    };

    const updateFinanceItem = async (id, type, updates) => {
        if (!userId) return;
        try {
            if (type === 'budget') {
                await api.put('/finance/budgets', updates);
            } else if (type === 'debt' || type === 'wishlist') {
                await api.patch(`${endpoints[type]}/${id}`, updates);
            } else if (type === 'saving') {
                await api.post('/finance/savings', updates);
            } else {
                await api.put(`${endpoints[type]}/${id}`, updates);
            }
            mutate(endpoints[type]);
        } catch (err) {
            console.error(`Failed to update finance item [${type}]:`, err);
        }
    };

    const deleteFinanceItem = async (id) => {
        if (!userId) return;
        
        let type = null;
        if (transactions.find(item => item._id === id)) type = 'transaction';
        else if (budgets.find(item => item._id === id)) type = 'budget';
        else if (debts.find(item => item._id === id)) type = 'debt';
        else if (wishlist.find(item => item._id === id)) type = 'wishlist';
        else if (savings.find(item => item._id === id)) type = 'saving';

        if (!type) {
            console.error('Could not determine type for deletion of id:', id);
            return;
        }

        try {
            await api.delete(`${endpoints[type]}/${id}`);
            mutate(endpoints[type]);
        } catch (err) {
            console.error(`Failed to delete finance item [${type}]:`, err);
        }
    };

    const isLoading = txLoading || budLoading || debtLoading || wishLoading || saveLoading;
    const error = txError || budError || debtError || wishError || saveError;

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
