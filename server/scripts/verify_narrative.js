import mongoose from 'mongoose';
import dotenv from 'dotenv';
import NarrativeQuestion from '../src/models/NarrativeQuestion.js';

dotenv.config();

/**
 * verifyNarrativeChain - Validates that the narrative nodes are correctly linked.
 */
const verifyNarrativeChain = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.\n');

        const firstNode = await NarrativeQuestion.findOne({ questionId: "1.0" });
        if (!firstNode) {
            console.error('CRITICAL: Node 1.0 not found in database.');
            process.exit(1);
        }

        console.log(`Node 1.0: Found. [${firstNode.question.substring(0, 50)}...]`);
        
        for (const opt of firstNode.options) {
            const nextId = opt.nextId;
            if (!nextId) {
                console.warn(`- Option "${opt.text}" has no nextId.`);
                continue;
            }

            // Perform the robust lookup logic we implemented in the controller
            const cleanNextId = String(nextId).trim().toLowerCase();
            const numericNextId = parseFloat(cleanNextId);
            const normalizedId = !isNaN(numericNextId) ? String(numericNextId) : cleanNextId;

            const nextExists = await NarrativeQuestion.findOne({ 
                $or: [
                    { questionId: cleanNextId },
                    { questionId: normalizedId },
                    { questionId: normalizedId + ".0" },
                    { questionId: { $regex: new RegExp(`^${cleanNextId.replace('.', '\\.')}$`, 'i') } }
                ]
            });

            if (nextExists) {
                console.log(`- Option "${opt.text}" -> ${nextId} (Verified). Next Question: "${nextExists.question.substring(0, 30)}..."`);
            } else {
                console.error(`- Option "${opt.text}" -> ${nextId} (**MISSING** in Database)`);
            }
        }

        console.log('\nVerification complete.');
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verifyNarrativeChain();
