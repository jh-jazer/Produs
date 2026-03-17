import mongoose from 'mongoose';
import './env.js';
import User from './src/models/User.js';
import Goal from './src/models/Goal.js';

async function checkUserGoals() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'ernestodesabillejr@gmail.com' });
        if (!user) {
            console.log('User not found');
            process.exit();
        }
        console.log('User ID:', user._id);
        const goals = await Goal.find({ user: user._id });
        console.log(`Found ${goals.length} goals for this user.`);
        goals.forEach(g => {
            console.log(`- [${g.period}] ${g.title} (Year: ${g.year}, Month: ${g.month}, Week: ${g.week})`);
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkUserGoals();
