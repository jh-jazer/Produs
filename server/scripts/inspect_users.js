import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env from server/.env
dotenv.config();

import User from '../src/models/User.js';

async function run() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is not set in environment");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const users = await User.find({}, 'name username email partner outgoingPartnerRequest incomingPartnerRequest connections');
        console.log("ALL USERS IN DATABASE:");
        console.log(JSON.stringify(users, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
