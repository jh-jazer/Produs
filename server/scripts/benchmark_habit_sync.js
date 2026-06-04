import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Habit from '../src/models/Habit.js';

// Copy of old function for testing
const oldInitializeSystemHabits = async (userId) => {
    const habits = [
        {
            user: userId,
            name: 'Focus Today',
            icon: 'hourglass_empty',
            color: 'blue',
            systemId: 'focus'
        },
        {
            user: userId,
            name: 'Daily Planning',
            icon: 'event_note',
            color: 'amber',
            systemId: 'planner'
        },
        {
            user: userId,
            name: 'Goal Setting',
            icon: 'track_changes',
            color: 'red',
            systemId: 'workout'
        },
        {
            user: userId,
            name: 'Journaling',
            icon: 'history_edu',
            color: 'blue',
            systemId: 'journal'
        },
        {
            user: userId,
            name: 'Finance Tracking',
            icon: 'payments',
            color: 'purple',
            systemId: 'finance'
        }
    ];

    try {
        const existingHabits = await Habit.find({
            user: userId,
            systemId: { $in: habits.map(h => h.systemId) }
        });

        const existingSystemIds = new Set(existingHabits.map(h => h.systemId));
        const missingHabits = habits.filter(h => !existingSystemIds.has(h.systemId));

        if (missingHabits.length > 0) {
            await Habit.insertMany(missingHabits);
        }

        for (const habit of habits) {
            await Habit.updateOne(
                { user: userId, systemId: habit.systemId },
                {
                    $set: {
                        name: habit.name,
                        icon: habit.icon,
                        color: habit.color
                    }
                }
            );
        }
    } catch (error) {
        console.error('Failed to initialize system habits:', error);
    }
};

const newInitializeSystemHabits = async (userId) => {
    const habits = [
        {
            user: userId,
            name: 'Focus Today',
            icon: 'hourglass_empty',
            color: 'blue',
            systemId: 'focus'
        },
        {
            user: userId,
            name: 'Daily Planning',
            icon: 'event_note',
            color: 'amber',
            systemId: 'planner'
        },
        {
            user: userId,
            name: 'Goal Setting',
            icon: 'track_changes',
            color: 'red',
            systemId: 'workout'
        },
        {
            user: userId,
            name: 'Journaling',
            icon: 'history_edu',
            color: 'blue',
            systemId: 'journal'
        },
        {
            user: userId,
            name: 'Finance Tracking',
            icon: 'payments',
            color: 'purple',
            systemId: 'finance'
        }
    ];

    try {
        const existingHabits = await Habit.find({
            user: userId,
            systemId: { $in: habits.map(h => h.systemId) }
        });

        const existingSystemIds = new Set(existingHabits.map(h => h.systemId));
        const missingHabits = habits.filter(h => !existingSystemIds.has(h.systemId));

        if (missingHabits.length > 0) {
            await Habit.insertMany(missingHabits);
        }

        const bulkOps = habits.map(habit => ({
            updateOne: {
                filter: { user: userId, systemId: habit.systemId },
                update: {
                    $set: {
                        name: habit.name,
                        icon: habit.icon,
                        color: habit.color
                    }
                }
            }
        }));

        if (bulkOps.length > 0) {
            await Habit.bulkWrite(bulkOps, { ordered: false });
        }
    } catch (error) {
        console.error('Failed to initialize system habits:', error);
    }
};

const runBenchmark = async () => {
    let mongod;
    try {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        console.log('Connected to Memory MongoDB');

        const testUser = new mongoose.Types.ObjectId();

        // Seed some data
        await oldInitializeSystemHabits(testUser);

        const iterations = 50;

        // Warmup
        await oldInitializeSystemHabits(testUser);
        await newInitializeSystemHabits(testUser);

        const startOld = process.hrtime();
        for(let i = 0; i < iterations; i++) {
            await oldInitializeSystemHabits(testUser);
        }
        const endOld = process.hrtime(startOld);
        const oldMs = (endOld[0] * 1000) + (endOld[1] / 1e6);
        console.log(`Old N+1 Update Time: ${oldMs.toFixed(2)}ms`);

        const startNew = process.hrtime();
        for(let i = 0; i < iterations; i++) {
            await newInitializeSystemHabits(testUser);
        }
        const endNew = process.hrtime(startNew);
        const newMs = (endNew[0] * 1000) + (endNew[1] / 1e6);
        console.log(`New BulkWrite Update Time: ${newMs.toFixed(2)}ms`);

        console.log(`Improvement: ${((oldMs - newMs) / oldMs * 100).toFixed(2)}%`);

        await Habit.deleteMany({ user: testUser });

        await mongoose.disconnect();
        await mongod.stop();
        console.log('Benchmark complete.');
    } catch (error) {
        console.error(error);
        if (mongod) await mongod.stop();
        process.exit(1);
    }
};

runBenchmark();
