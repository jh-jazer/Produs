import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Habit from '../server/src/models/Habit.js';

dotenv.config({ path: '../server/.env' });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const mapping = {
            'Health': 'STR',
            'Learning': 'INT',
            'Creative': 'INT',
            'Mindset': 'WIS',
            'Spiritual': 'WIS',
            'Productivity': 'DEX',
            'Social': 'CHA',
            'Finance': 'PER'
        };

        const habits = await Habit.find({});
        let updatedCount = 0;

        for (const habit of habits) {
            if (mapping[habit.category]) {
                habit.category = mapping[habit.category];
                await habit.save();
                updatedCount++;
            }
        }

        console.log(`Successfully migrated ${updatedCount} habits.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
