import * as Y from 'yjs';
import YjsState from '../models/YjsState.js';
import Journal from '../models/Journal.js';
import Habit from '../models/Habit.js';
import Task from '../models/Task.js';
import Transaction from '../models/Transaction.js';

/**
 * Handle synchronization for a specific feature.
 * Pushes updates from client and returns new server state.
 */
export const syncFeature = async (req, res) => {
    const { feature } = req.params;
    const { update } = req.body;
    const userId = req.user._id;

    if (!update) return res.status(400).json({ message: 'Missing update' });

    try {
        // 1. Get current server state
        let yjsState = await YjsState.findOne({ user: userId, feature });
        const doc = new Y.Doc();
        
        if (yjsState) {
            Y.applyUpdate(doc, yjsState.state);
        }

        // HYDRATION: Pull from existing MongoDB collections if the Yjs Map is completely empty!
        // This ensures users migrating to the offline-first version don't lose their data
        // even if an empty YjsState record was already generated for them.
        const map = doc.getMap(feature);
        if (map.size === 0) {
            let legacyData = [];
            if (feature === 'journal') legacyData = await Journal.find({ user: userId }).lean();
            if (feature === 'habits') legacyData = await Habit.find({ user: userId }).lean();
            if (feature === 'planner') legacyData = await Task.find({ user: userId }).lean();
            if (feature === 'finance') legacyData = await Transaction.find({ user: userId }).lean();
            
            // Add existing items into the Y.Map using their specific ID patterns or _id
            const serializedData = JSON.parse(JSON.stringify(legacyData));
            serializedData.forEach(item => {
                const id = item._id.toString();
                // Ensure IDs match the client expectation, client maps _id directly usually.
                map.set(id, { ...item, _id: id, userId: item.user || item.userId });
            });
        }

        // 2. Apply incoming update
        const clientUpdate = new Uint8Array(update);
        Y.applyUpdate(doc, clientUpdate);

        // 3. Save new state
        const newState = Y.encodeStateAsUpdate(doc);
        if (yjsState) {
            yjsState.state = Buffer.from(newState);
            await yjsState.save();
        } else {
            await YjsState.create({ user: userId, feature, state: Buffer.from(newState) });
        }

        // 4. Update the individual models for UI compatibility (Legacy REST support)
        // This makes the CRDT data accessible to standard APIs
        await updateLegacyModels(feature, userId, doc);

        // 5. Return the merged state to client if needed (or just ack)
        res.json({ success: true, update: Array.from(newState) });
    } catch (error) {
        console.error(`Sync error for ${feature}:`, error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Helper to keep MongoDB documents in sync with the CRDT state.
 * This ensures that standard GET /api/journal still works and returns the latest data.
 */
async function updateLegacyModels(feature, userId, doc) {
    const map = doc.getMap(feature);
    const data = map.toJSON();

    if (feature === 'journal') {
        const entries = Object.values(data);
        for (const entry of entries) {
            try {
                // Safeguard against corrupted dates
                if (entry.date && typeof entry.date === 'object' && Object.keys(entry.date).length === 0) {
                    console.error("🚨 CORRUPTED JOURNAL ENTRY DATE DETECTED! Skipping.", JSON.stringify(entry));
                    continue;
                }

                // Update or Create the Journal record
                // We use the _id from the CRDT (which might contain 'local-') 
                // but we should probably handle mapping carefully.
                const query = (entry._id && entry._id.startsWith('local-'))
                    ? { content: entry.content, user: userId }
                    : { _id: entry._id, user: userId };
                    
                await Journal.findOneAndUpdate(
                    query,
                    { ...entry, user: userId },
                    { upsert: true, new: true }
                );
            } catch (err) {
                console.error("🚨 Failed to update legacy model for journal entry:", entry._id, err.message);
            }
        }
    }
    // TODO: Implement for other features (Habits, Planner, Finance)
}
