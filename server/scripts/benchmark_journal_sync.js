import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Journal from '../src/models/Journal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function cleanPayload(entry) {
    const payload = { ...entry };
    if (typeof payload._id === 'string' && payload._id.startsWith('local-')) {
        delete payload._id;
    }
    delete payload.isPending;
    return payload;
}

async function runBenchmark() {
    console.log("Connecting to MongoDB...");
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/produs_test_benchmark";
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    const userId = new mongoose.Types.ObjectId();

    console.log("Generating 1000 journal entries...");
    const entries = [];
    for (let i = 0; i < 1000; i++) {
        entries.push({
            _id: `local-${i}`,
            content: `Journal entry ${i} for benchmark`,
            mood: '😊',
            date: new Date().toISOString()
        });
    }

    console.log("\n--- Running BEFORE optimization (N+1 Queries) ---");
    const startN1 = performance.now();
    for (const entry of entries) {
        try {
            if (!entry.date || (typeof entry.date === 'object' && Object.keys(entry.date).length === 0)) {
                entry.date = new Date().toISOString();
            }

            const query = (entry._id && entry._id.startsWith('local-'))
                ? { content: entry.content, user: userId }
                : { _id: entry._id, user: userId };

            await Journal.findOneAndUpdate(
                query,
                { ...cleanPayload(entry), user: userId },
                { upsert: true, returnDocument: 'after' }
            );
        } catch (err) {
            console.error(err);
        }
    }
    const endN1 = performance.now();
    const timeN1 = endN1 - startN1;
    console.log(`N+1 Query Time: ${timeN1.toFixed(2)}ms`);

    await Journal.deleteMany({ user: userId });

    console.log("\n--- Running AFTER optimization (BulkWrite) ---");
    const startBulk = performance.now();

    const operations = entries.map(entry => {
        if (!entry.date || (typeof entry.date === 'object' && Object.keys(entry.date).length === 0)) {
            entry.date = new Date().toISOString();
        }

        const query = (entry._id && entry._id.startsWith('local-'))
            ? { content: entry.content, user: userId }
            : { _id: entry._id, user: userId };

        return {
            updateOne: {
                filter: query,
                update: { $set: { ...cleanPayload(entry), user: userId } },
                upsert: true
            }
        };
    });

    if (operations.length > 0) {
        await Journal.bulkWrite(operations, { ordered: false });
    }

    const endBulk = performance.now();
    const timeBulk = endBulk - startBulk;
    console.log(`BulkWrite Time: ${timeBulk.toFixed(2)}ms`);

    console.log(`\nSpeedup: ${(timeN1 / timeBulk).toFixed(2)}x faster`);

    await mongoose.disconnect();
}

runBenchmark().catch(console.error);
