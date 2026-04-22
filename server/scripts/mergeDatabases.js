import mongoose from 'mongoose';
import '../env.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function migrate() {
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI not found in environment');
        process.exit(1);
    }

    try {
        console.log('🚀 INITIALIZING_NEURAL_MIGRATION_');
        console.log(`Connecting to: ${MONGODB_URI.split('@')[1]}`); // Mask credentials
        
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');
        
        const testDb = mongoose.connection.useDb('test');
        const produsDb = mongoose.connection.useDb('produs');

        // Get all collection names from the 'test' database
        const collections = await testDb.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log(`Found ${collectionNames.length} collections in "test" database:`, collectionNames);

        for (const colName of collectionNames) {
            console.log(`\n--- Processing: ${colName.toUpperCase()} ---`);
            const data = await testDb.collection(colName).find({}).toArray();
            
            if (data.length === 0) {
                console.log(`- Collection is empty, skipping.`);
                continue;
            }

            console.log(`- Found ${data.length} documents. Synchronizing...`);

            let migratedCount = 0;
            let skippedCount = 0;

            for (const doc of data) {
                try {
                    // Check if document already exists in produs to prevent duplicates
                    const exists = await produsDb.collection(colName).findOne({ _id: doc._id });
                    
                    if (!exists) {
                        await produsDb.collection(colName).insertOne(doc);
                        migratedCount++;
                    } else {
                        skippedCount++;
                    }
                } catch (err) {
                    console.error(`  ❌ Error migrating doc ${doc._id}:`, err.message);
                }
            }
            
            console.log(`- Result: ${migratedCount} Migrated, ${skippedCount} Skipped (Duplicates)`);
        }

        console.log('\n✨ MIGRATION_COMPLETE_');
        console.log('All unique data from "test" has been merged into "produs".');
        console.log('You can now safely delete the "test" database in Atlas.');
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('\n💥 CRITICAL_MIGRATION_FAILURE_:', error);
        process.exit(1);
    }
}

migrate();
