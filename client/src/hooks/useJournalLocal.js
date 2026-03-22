import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/db';
import SyncService from '../services/SyncService';
import useAuthStore from '../store/useAuthStore';

export const useJournalLocal = () => {
    const { user } = useAuthStore();
    const userId = user?._id;

    const entries = useLiveQuery(
        async () => {
            if (!userId) return [];
            return await db.journal
                .where('userId')
                .equals(userId)
                .reverse()
                .toArray();
        },
        [userId]
    );

    const addEntry = async (content, mood) => {
        if (!userId) return;

        const newEntry = {
            _id: `local-${Date.now()}`,
            userId,
            content,
            mood,
            date: new Date().toISOString(),
            isPending: true
        };

        // 1. Save to local Dexie for instant UI feedback
        await db.journal.add(newEntry);

        // 2. Update Yjs and trigger background sync
        await SyncService.updateFeatureData('journal', userId, newEntry._id, 'set', newEntry);
    };

    const deleteEntry = async (id) => {
        if (!userId) return;

        // 1. Remove from local Dexie
        await db.journal.where('_id').equals(id).delete();

        // 2. Update Yjs and trigger background sync
        await SyncService.updateFeatureData('journal', userId, id, 'delete');
    };

    return {
        entries: entries || [],
        addEntry,
        deleteEntry,
        isLoading: entries === undefined
    };
};
