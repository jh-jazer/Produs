import './env.js';
import mongoose from 'mongoose';
import User from './src/models/User.js';

const testDeletion = async () => {
    try {
        console.log('Connecting to MongoDB using MONGODB_URI...');
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create a dummy user
        const dummy = await User.create({
            name: 'Delete Test',
            email: `delete-test-${Date.now()}@example.com`,
            password: 'password123'
        });
        console.log('Created dummy user:', dummy._id);

        // Try to delete
        const result = await User.deleteOne({ _id: dummy._id });
        console.log('Deletion result:', result);

        if (result.deletedCount === 1) {
            console.log('SUCCESS: Dummy user deleted');
        } else {
            console.log('FAILURE: Dummy user not deleted');
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('ERROR during test:', error);
        process.exit(1);
    }
};

testDeletion();
