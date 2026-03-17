import mongoose from 'mongoose';
import './env.js';
import Goal from './src/models/Goal.js';
import User from './src/models/User.js';

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const goals = await Goal.find({});
        console.log(`Found ${goals.length} goals in total.`);

        if (goals.length > 0) {
            console.log('Sample Goal:', JSON.stringify(goals[0], null, 2));
            console.log('Types of first goal fields:');
            console.log('year:', typeof goals[0].year);
            console.log('month:', typeof goals[0].month);
            console.log('period:', typeof goals[0].period);
        }

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

diagnose();
