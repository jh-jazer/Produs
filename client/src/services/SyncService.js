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
                    
                    // Hydrate local UI databases from the ultimate Yjs truth!
                    const map = doc.getMap(feature);
                    const items = Array.from(map.values());
                    const dbTable = feature === 'habits' ? db.habits :
                                    feature === 'journal' ? db.journal :
                                    feature === 'planner' ? db.tasks :
                                    feature === 'finance' ? db.transactions : null;
                    
                    if (dbTable) {
                        await db.transaction('rw', dbTable, async () => {
                            // Find deleted keys by checking what's in local DB but not in Yjs Map
                            const localKeys = await dbTable.where('userId').equals(userId).primaryKeys();
                            const yjsKeys = new Set(map.keys());
                            const toDelete = localKeys.filter(k => !yjsKeys.has(k));
                            
                            if (toDelete.length > 0) await dbTable.bulkDelete(toDelete);
                            if (items.length > 0) await dbTable.bulkPut(items);
                        });
                    }
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
     * Initialize docs and perform a sync down for all available features.
     */
    async syncAll(userId) {
        const features = ['habits', 'journal', 'planner', 'finance'];
        try {
            await Promise.all(features.map(feature => this.getDoc(feature, userId)));
            await this.performSync();
        } catch (error) {
            console.error("Failed to execute full sync:", error);
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
