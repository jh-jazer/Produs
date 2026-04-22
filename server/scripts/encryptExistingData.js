import mongoose from 'mongoose';
import '../env.js';
import Journal from '../src/models/Journal.js';
import Goal from '../src/models/Goal.js';
import HealthLog from '../src/models/HealthLog.js';
import Transaction from '../src/models/Transaction.js';
import Budget from '../src/models/Budget.js';
import Debt from '../src/models/Debt.js';
import Saving from '../src/models/Saving.js';
import { encrypt } from '../src/utils/encryption.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function migrate() {
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI not found');
        process.exit(1);
    }

    try {
        console.log('🚀 INITIATING_NEURAL_ENCRYPTION_MIGRATION_');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const modelsToEncrypt = [
            { model: Journal, fields: ['title', 'content'] },
            { model: Goal, fields: ['title'] },
            { model: HealthLog, fields: ['title', 'details'] },
            { model: Transaction, fields: ['title'] },
            { model: Budget, fields: ['category'] },
            { model: Debt, fields: ['title'] },
            { model: Saving, fields: ['title'] }
        ];

        for (const item of modelsToEncrypt) {
            const { model, fields } = item;
            const name = model.modelName;
            console.log(`\n--- Processing ${name} ---`);
            
            const docs = await model.find({});
            console.log(`Found ${docs.length} documents.`);

            let count = 0;
            for (const doc of docs) {
                let modified = false;
                
                for (const field of fields) {
                    const value = doc[field];
                    
                    // Check if already encrypted (contains ':')
                    if (value && typeof value === 'string' && value.includes(':')) {
                        continue; 
                    }
                    
                    if (value !== undefined && value !== null) {
                        doc[field] = encrypt(value);
                        modified = true;
                    }
                }

                if (modified) {
                    // We use .updateOne to bypass the hooks during migration if we want,
                    // but since the hooks are already in place, doc.save() would re-encrypt.
                    // To be safe and precise, we use a direct update or save the modified doc.
                    // Actually, if I save() now, the PRE-SAVE hook will trigger.
                    // If I've already encrypted it manually here, the hook will see it as modified and encrypt it AGAIN.
                    // THAT IS BAD.
                    
                    // Solution: Either disable hooks or just let the script do the work via direct update.
                    const updateData = {};
                    fields.forEach(f => {
                        if (doc[f] && typeof doc[f] === 'string' && doc[f].includes(':')) {
                            updateData[f] = doc[f];
                        }
                    });
                    
                    if (Object.keys(updateData).length > 0) {
                        await model.collection.updateOne({ _id: doc._id }, { $set: updateData });
                        count++;
                    }
                }
            }
            console.log(`✅ ${count} documents encrypted in ${name}.`);
        }

        console.log('\n✨ ENCRYPTION_MIGRATION_COMPLETE_');
        console.log('All sensitive fields are now encrypted at rest.');
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('\n💥 MIGRATION_FAILURE_:', error);
        process.exit(1);
    }
}

migrate();
