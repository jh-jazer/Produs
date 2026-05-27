import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Habit from './src/models/Habit.js';
import User from './src/models/User.js';

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const user = await User.findOne();
        if (!user) {
            console.log("No user found in the database.");
            process.exit(0);
        }
        console.log(`Checking habits for user: ${user.name} (${user._id})`);

        const habits = await Habit.find({ user: user._id });
        console.log(`Found ${habits.length} habits:`);
        habits.forEach(h => {
            console.log(`- Name: ${h.name}, systemId: ${h.systemId}, category: ${h.category}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
