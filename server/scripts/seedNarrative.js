import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import NarrativeQuestion from '../src/models/NarrativeQuestion.js';
import { ARCHETYPE_QUIZ } from '../src/shared/assessment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedNarrative = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        console.log(`Seeding ${ARCHETYPE_QUIZ.length} questions...`);
        
        for (const q of ARCHETYPE_QUIZ) {
            const narrativeQ = {
                questionId: String(q.id),
                title: q.title || "Neural Synthesis",
                section: q.section,
                type: q.type || (q.weight >= 4.0 ? 'ACTION' : 'WHY'),
                weight: q.weight || 1.0,
                story: q.story || "",
                question: q.question,
                options: q.options.map(opt => ({
                    text: opt.text,
                    value: opt.value,
                    postText: opt.postText || "",
                    nextId: opt.nextId || null
                }))
            };

            await NarrativeQuestion.findOneAndUpdate(
                { questionId: narrativeQ.questionId },
                { $set: narrativeQ },
                { new: true, upsert: true }
            );
            console.log(`- Seeded Q#${narrativeQ.questionId}`);
        }

        console.log('Seed completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
};

seedNarrative();
