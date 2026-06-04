import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import User from '../src/models/User.js';

async function runBenchmark() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Creating test users...");
    await User.deleteMany({ username: { $regex: /^bench_user_/ } });

    const users = [];
    for (let i = 0; i < 500; i++) {
        users.push({
            username: `bench_user_${i}`,
            email: `bench_user_${i}@example.com`,
            passwordHash: "test",
            connections: [],
            outgoingConnectionRequests: [],
            incomingConnectionRequests: [],
            settings: {}
        });
    }

    const inserted = await User.insertMany(users);

    // Create asymmetrical connections
    for (let i = 0; i < inserted.length - 1; i++) {
        // user i connects to user i+1, but i+1 doesn't connect back
        inserted[i].connections.push(inserted[i+1]._id);
        await inserted[i].save();
    }

    console.log("Running baseline...");

    // We'll mimic the exact controller logic in a function
    async function fixConnectionsBaseline() {
        const start = Date.now();
        const allConnUsers = await User.find({ username: { $regex: /^bench_user_/ } });
        const report = [];
        const allUserIds = new Set(allConnUsers.map(u => u._id.toString()));
        for (const u of allConnUsers) {
            let changed = false;
            // Clean connections
            const validConns = (u.connections || []).filter(id => allUserIds.has(id.toString()));
            if (validConns.length !== (u.connections || []).length) {
                const removed = (u.connections || []).length - validConns.length;
                u.connections = validConns;
                changed = true;
            }
            // Clean outgoing connection requests
            const validOut = (u.outgoingConnectionRequests || []).filter(id => allUserIds.has(id.toString()));
            if (validOut.length !== (u.outgoingConnectionRequests || []).length) {
                u.outgoingConnectionRequests = validOut;
                changed = true;
            }
            // Clean incoming connection requests
            const validIn = (u.incomingConnectionRequests || []).filter(id => allUserIds.has(id.toString()));
            if (validIn.length !== (u.incomingConnectionRequests || []).length) {
                u.incomingConnectionRequests = validIn;
                changed = true;
            }
            // Ensure mutual connections (if A has B, B must have A)
            for (const connId of validConns) {
                const connUser = allConnUsers.find(x => x._id.toString() === connId.toString());
                if (connUser && !(connUser.connections || []).some(id => id.toString() === u._id.toString())) {
                    connUser.connections.push(u._id);
                    await connUser.save();
                }
            }
            if (changed) await u.save();
        }
        return Date.now() - start;
    }

    const timeBaseline = await fixConnectionsBaseline();
    console.log(`Baseline time: ${timeBaseline}ms`);

    console.log("Resetting connections...");
    // Reset connections
    await User.updateMany({ username: { $regex: /^bench_user_/ } }, { $set: { connections: [] } });

    const inserted2 = await User.find({ username: { $regex: /^bench_user_/ } });
    // Create asymmetrical connections
    for (let i = 0; i < inserted2.length - 1; i++) {
        // user i connects to user i+1, but i+1 doesn't connect back
        inserted2[i].connections.push(inserted2[i+1]._id);
        await inserted2[i].save();
    }

    console.log("Running optimized...");

    async function fixConnectionsOptimized() {
        const start = Date.now();
        const allConnUsers = await User.find({ username: { $regex: /^bench_user_/ } });
        const allUserIds = new Set(allConnUsers.map(u => u._id.toString()));

        const bulkOps = [];
        const mutualUpdates = new Map(); // targetUserId -> Set of User Ids to add

        for (const u of allConnUsers) {
            let changed = false;

            // Filter connections in-memory
            const validConns = (u.connections || []).filter(id => allUserIds.has(id.toString()));
            if (validConns.length !== (u.connections || []).length) {
                changed = true;
            }

            const validOut = (u.outgoingConnectionRequests || []).filter(id => allUserIds.has(id.toString()));
            if (validOut.length !== (u.outgoingConnectionRequests || []).length) {
                changed = true;
            }

            const validIn = (u.incomingConnectionRequests || []).filter(id => allUserIds.has(id.toString()));
            if (validIn.length !== (u.incomingConnectionRequests || []).length) {
                changed = true;
            }

            // Find missing mutual connections
            for (const connId of validConns) {
                const connIdStr = connId.toString();
                const connUser = allConnUsers.find(x => x._id.toString() === connIdStr);

                if (connUser && !(connUser.connections || []).some(id => id.toString() === u._id.toString())) {
                    if (!mutualUpdates.has(connIdStr)) {
                        mutualUpdates.set(connIdStr, new Set());
                    }
                    mutualUpdates.get(connIdStr).add(u._id.toString());

                    // Optimistically update memory so we don't duplicate logic
                    connUser.connections.push(u._id);
                }
            }

            if (changed) {
                bulkOps.push({
                    updateOne: {
                        filter: { _id: u._id },
                        update: {
                            $set: {
                                connections: validConns,
                                outgoingConnectionRequests: validOut,
                                incomingConnectionRequests: validIn
                            }
                        }
                    }
                });
            }
        }

        // Add mutual connection updates to bulk ops
        for (const [userId, missingConnections] of mutualUpdates.entries()) {
            bulkOps.push({
                updateOne: {
                    filter: { _id: userId },
                    update: {
                        $addToSet: {
                            connections: { $each: Array.from(missingConnections) }
                        }
                    }
                }
            });
        }

        if (bulkOps.length > 0) {
            await User.bulkWrite(bulkOps, { ordered: false });
        }

        return Date.now() - start;
    }

    const timeOptimized = await fixConnectionsOptimized();
    console.log(`Optimized time: ${timeOptimized}ms`);

    await User.deleteMany({ username: { $regex: /^bench_user_/ } });
    process.exit(0);
}

runBenchmark().catch(console.error);
