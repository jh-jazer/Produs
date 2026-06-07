import useSWR, { useSWRConfig } from 'swr';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

export const useJournal = () => {
    const { user } = useAuthStore();
    const userId = user?._id;
    const { mutate } = useSWRConfig();

    const fetcher = url => api.get(url).then(res => res.data);
    const { data: entries, error, isLoading } = useSWR(userId ? '/journal' : null, fetcher);

    const addEntry = async (content, mood, title, imageUrl) => {
        if (!userId) return;
        const tempId = `temp-${Date.now()}`;
        const optimisticEntry = { content, mood, title, imageUrl, _id: tempId, createdAt: new Date().toISOString() };

        const buildOptimisticData = (currentEntries) => {
            if (!currentEntries) return [optimisticEntry];
            return [optimisticEntry, ...currentEntries];
        };

        try {
            const res = await mutate(
                '/journal',
                async () => {
                    const response = await api.post('/journal', { content, mood, title, imageUrl });
                    return response.data;
                },
                {
                    optimisticData: buildOptimisticData,
                    rollbackOnError: true,
                    revalidate: true,
                    populateCache: false,
                }
            );
            return res;
        } catch (err) {
            console.error('Failed to add journal entry:', err);
            return { error: true };
        }
    };

    const deleteEntry = async (id) => {
        if (!userId) return;
        const buildOptimisticData = (currentEntries) => {
            if (!currentEntries) return currentEntries;
            return currentEntries.filter(e => e._id !== id);
        };

        try {
            await mutate(
                '/journal',
                async () => {
                    await api.delete(`/journal/${id}`);
                    return undefined;
                },
                {
                    optimisticData: buildOptimisticData,
                    rollbackOnError: true,
                    revalidate: true,
                    populateCache: false,
                }
            );
        } catch (err) {
            console.error('Failed to delete journal entry:', err);
            return { error: true };
        }
    };

    const updateEntry = async (id, content, mood, title, imageUrl) => {
        if (!userId) return;
        const updates = { content, mood, title, imageUrl };
        const buildOptimisticData = (currentEntries) => {
            if (!currentEntries) return currentEntries;
            return currentEntries.map(e => e._id === id ? { ...e, ...updates } : e);
        };

        try {
            const res = await mutate(
                '/journal',
                async () => {
                    const response = await api.patch(`/journal/${id}`, updates);
                    return response.data;
                },
                {
                    optimisticData: buildOptimisticData,
                    rollbackOnError: true,
                    revalidate: true,
                    populateCache: false,
                }
            );
            return res;
        } catch (err) {
            console.error('Failed to update journal entry:', err);
            return { error: true };
        }
    };

    return {
        entries: Array.isArray(entries) ? entries : [],
        addEntry,
        updateEntry,
        deleteEntry,
        isLoading,
        error
    };
};
