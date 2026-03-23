import Dexie from 'dexie';

/**
 * Produs Local Database
 * 
 * Stores all user data locally first.
 * Each document contains a 'crdt' blob which stores the Yjs update binary.
 */
export const db = new Dexie('ProdusDB');

db.version(4).stores({
    habits: '++id, _id, name, category, userId, isPending',
    journal: '++id, _id, title, date, userId, isPending',
    planner: '++id, _id, type, date, userId, isPending',
    finance: '++id, _id, type, date, category, userId, isPending',
    goals: '++id, _id, period, year, month, week, userId, isPending',
    // Separate table for Yjs binary states to keep main tables clean
    yjs_state: 'id, state', // id will be feature:userId (e.g., 'journal:123')
    sync_queue: '++id, collection, docId, action, timestamp'
});

export default db;
