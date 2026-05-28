/**
 * migrateGuardianFields.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time migration: renames the old `level` and `exp` top-level fields on
 * every User document to `guardianLevel` and `guardianExp`.
 *
 * Run once with:
 *   node server/src/scripts/migrateGuardianFields.js
 *
 * Safe to run multiple times — already-migrated documents are skipped.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('❌  MONGO_URI not found in environment. Check your .env file.');
    process.exit(1);
}

async function migrate() {
    await mongoose.connect(MONGO_URI);
    console.log('✅  Connected to MongoDB.');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Step 1: Rename level → guardianLevel, exp → guardianExp
    //         Only on documents that still have the old fields
    const renameResult = await users.updateMany(
        { level: { $exists: true } },
        [
            {
                $set: {
                    guardianLevel: '$level',
                    guardianExp:   '$exp'
                }
            },
            {
                $unset: ['level', 'exp']
            }
        ]
    );

    console.log(`✅  Renamed fields on ${renameResult.modifiedCount} documents.`);

    // Step 2: Ensure every document has the hero sub-document
    const heroResult = await users.updateMany(
        { hero: { $exists: false } },
        {
            $set: {
                hero: { name: 'Unnamed Hero', class: null, level: 0, exp: 0 }
            }
        }
    );

    console.log(`✅  Added hero sub-doc to ${heroResult.modifiedCount} documents.`);

    await mongoose.disconnect();
    console.log('✅  Migration complete. Connection closed.');
}

migrate().catch((err) => {
    console.error('❌  Migration failed:', err);
    process.exit(1);
});
