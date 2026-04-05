import mongoose from 'mongoose';
import dotenv from 'dotenv';
import NarrativeQuestion from '../src/models/NarrativeQuestion.js';
import { ARCHETYPE_QUIZ } from '../src/shared/assessment.js';

dotenv.config();

const seedNarrative = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        console.log(`Seeding ${ARCHETYPE_QUIZ.length} questions...`);
        
        for (const q of ARCHETYPE_QUIZ) {
            const narrativeQ = {
                questionId: `${q.id}.0`,
                section: q.section,
                type: q.weight >= 2.0 ? 'ACTION' : 'WHY',
                weight: q.weight,
                question: q.question,
                story: "", // Placeholder
                options: q.options.map(opt => ({
                    text: opt.text,
                    value: opt.value,
                    nextId: q.id < 32 ? `${q.id + 1}.0` : null // Decimal defaults
                }))
            };

            await NarrativeQuestion.findOneAndUpdate(
                { questionId: narrativeQ.questionId },
                narrativeQ,
                { new: true, upsert: true }
            );
            console.log(`- Seeded Q#${q.id}`);
        }

        console.log('Seed completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
};

seedNarrative();
