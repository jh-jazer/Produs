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
        try {
            const res = await api.post('/journal', { content, mood, title, imageUrl });
            mutate('/journal');
            return res.data;
        } catch (err) {
            console.error('Failed to add journal entry:', err);
        }
    };

    const deleteEntry = async (id) => {
        if (!userId) return;
        try {
            await api.delete(`/journal/${id}`);
            mutate('/journal');
        } catch (err) {
            console.error('Failed to delete journal entry:', err);
        }
    };

    const updateEntry = async (id, content, mood, title, imageUrl) => {
        if (!userId) return;
        try {
            const res = await api.patch(`/journal/${id}`, { content, mood, title, imageUrl });
            mutate('/journal');
            return res.data;
        } catch (err) {
            console.error('Failed to update journal entry:', err);
        }
    };

    return {
        entries: entries || [],
        addEntry,
        updateEntry,
        deleteEntry,
        isLoading,
        error
    };
};
