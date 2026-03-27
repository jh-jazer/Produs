import './env.js';
import mongoose from 'mongoose';

async function run() {
    try {
        console.log("Connecting to:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
        
        const goals = await db.collection('goals').find({}).toArray();
        console.log("Found goals:", goals.length);
        if (goals.length > 0) {
            console.log("Sample Goal:", goals[0]);
        }
        
        await mongoose.disconnect();
        console.log("Done.");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}
run();
