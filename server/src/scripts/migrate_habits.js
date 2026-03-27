import '../../env.js';
import connectDB from '../config/db.js';
import Habit from '../models/Habit.js';
import mongoose from 'mongoose';

const migrate = async () => {
    try {
        await connectDB();
        
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
        console.log(`Analyzing ${habits.length} habits...`);
        let updatedCount = 0;

        for (const habit of habits) {
            if (mapping[habit.category]) {
                console.log(`Migrating habit "${habit.name}": ${habit.category} -> ${mapping[habit.category]}`);
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
