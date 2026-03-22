import * as Y from 'yjs';
import db from '../db/db';
import api from './api';

class SyncService {
    constructor() {
        this.docs = new Map(); // feature -> Y.Doc
        this.isSyncing = false;
    }

    /**
     * Get or create a Y.Doc for a specific feature and user.
     */
    async getDoc(feature, userId) {
        const docId = `${feature}:${userId}`;
        if (this.docs.has(docId)) return this.docs.get(docId);

        const doc = new Y.Doc();
        this.docs.set(docId, doc);

        // 1. Load from IndexedDB
        const storedState = await db.yjs_state.get(docId);
        if (storedState) {
            Y.applyUpdate(doc, storedState.state);
        }

        // 2. Listen for local changes and persist to Dexie
        doc.on('update', async (update) => {
            const currentState = Y.encodeStateAsUpdate(doc);
            await db.yjs_state.put({ id: docId, state: currentState });
            
            // 3. Register background sync
            this.registerSync();
        });

        return doc;
    }

    /**
     * Register a background sync with the browser.
     */
    async registerSync() {
        if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('sync-produs');
            } catch (err) {
                console.warn('Background sync registration failed, falling back to immediate sync:', err);
                this.performSync();
            }
        } else {
            this.performSync();
        }
    }

    /**
     * Perform the actual synchronization with the server.
     * This can be called by the Service Worker or as a fallback.
     */
    async performSync() {
        if (this.isSyncing) return;
        this.isSyncing = true;

        try {
            // Iterate over all active docs and sync them
            for (const [docId, doc] of this.docs.entries()) {
                const [feature, userId] = docId.split(':');
                const currentState = Y.encodeStateAsUpdate(doc);

                // Push to server
                const response = await api.post(`/sync/${feature}`, {
                    update: Array.from(currentState), // Binary to array for JSON
                    userId
                });

                // Apply any updates from the server (if any)
                if (response.data && response.data.update) {
                    const serverUpdate = new Uint8Array(response.data.update);
                    Y.applyUpdate(doc, serverUpdate);
                }
            }
            console.log('Sync completed successfully');
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Update data for a feature using Yjs.
     */
    async updateFeatureData(feature, userId, dataId, action, data = null) {
        const doc = await this.getDoc(feature, userId);
        const map = doc.getMap(feature);

        doc.transact(() => {
            if (action === 'set') {
                map.set(dataId, data);
            } else if (action === 'delete') {
                map.delete(dataId);
            }
        });

        // The 'update' event listener in getDoc will handle persistence and sync registration
    }
}

export default new SyncService();
