import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mockUsersCount = 500;

async function setup() {
    await mongoose.connect(process.env.MONGODB_URI);

    // Create mock users
    await User.deleteMany({ username: { $regex: /^test_fixPartners_/ } });

    const usersToInsert = [];
    for (let i = 0; i < mockUsersCount; i++) {
        usersToInsert.push({
            name: `Test User ${i}`,
            username: `test_fixPartners_${i}`,
            email: `test_fixPartners_${i}@example.com`,
            password: 'password',
            partner: new mongoose.Types.ObjectId(), // dangling
            outgoingPartnerRequest: new mongoose.Types.ObjectId(), // dangling
            incomingPartnerRequest: new mongoose.Types.ObjectId(), // dangling
        });
    }

    await User.insertMany(usersToInsert);
    console.log(`Setup complete with ${mockUsersCount} test users.`);
}

async function runOriginal() {
    const allDbUsers = await User.find({ username: { $regex: /^test_fixPartners_/ } });

    const startTime = Date.now();
    for (const u of allDbUsers) {
        if (u.partner) {
            const p = await User.findById(u.partner);
        }
        if (u.outgoingPartnerRequest) {
            const p = await User.findById(u.outgoingPartnerRequest);
        }
        if (u.incomingPartnerRequest) {
            const p = await User.findById(u.incomingPartnerRequest);
        }
    }
    const endTime = Date.now();
    return endTime - startTime;
}

async function runOptimized() {
    const allDbUsers = await User.find({ username: { $regex: /^test_fixPartners_/ } });

    const startTime = Date.now();

    // Optimized way: we know all users we might look up are users in the db.
    // We can fetch all users ONCE or we can fetch them via a Map, or even better,
    // just put all user IDs in a Set since we only need to know if they exist and maybe their partner ID.
    const allUsersComplete = await User.find({}, '_id partner username');
    const userMap = new Map();
    for (const u of allUsersComplete) {
        userMap.set(u._id.toString(), u);
    }

    for (const u of allDbUsers) {
        if (u.partner) {
            const p = userMap.get(u.partner.toString());
        }
        if (u.outgoingPartnerRequest) {
            const p = userMap.get(u.outgoingPartnerRequest.toString());
        }
        if (u.incomingPartnerRequest) {
            const p = userMap.get(u.incomingPartnerRequest.toString());
        }
    }
    const endTime = Date.now();
    return endTime - startTime;
}

async function run() {
    try {
        await setup();

        console.log("Running original...");
        const originalTime = await runOriginal();
        console.log(`Original Time: ${originalTime}ms`);

        console.log("Running optimized...");
        const optimizedTime = await runOptimized();
        console.log(`Optimized Time: ${optimizedTime}ms`);

        // Clean up
        await User.deleteMany({ username: { $regex: /^test_fixPartners_/ } });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
