import mongoose from 'mongoose';
import dotenv from 'dotenv';
import NarrativeQuestion from '../src/models/NarrativeQuestion.js';

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const node1 = await NarrativeQuestion.findOne({ questionId: "1.0" });
        const node2 = await NarrativeQuestion.findOne({ questionId: "2.0" });
        const node2Numeric = await NarrativeQuestion.findOne({ questionId: 2 });
        const node2Regex = await NarrativeQuestion.findOne({ questionId: /^2(\.0)?$/ });

        console.log("NODE 1.0:", JSON.stringify(node1, null, 2));
        console.log("NODE 2.0:", JSON.stringify(node2, null, 2));
        console.log("NODE 2.0 (Numeric Search):", !!node2Numeric);
        console.log("NODE 2.0 (Regex Search):", !!node2Regex);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
