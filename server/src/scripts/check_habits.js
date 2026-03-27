import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Habit from '../models/Habit.js';

dotenv.config({ path: '.env' });

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await Habit.countDocuments({});
        const categories = await Habit.distinct('category');
        console.log(`Habit count: ${count}`);
        console.log(`Categories: ${categories.join(', ')}`);
        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
};

check();
