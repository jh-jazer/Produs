import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    mood: {
        type: String, // Emoji
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    date: {
        type: Date,
        default: Date.now
    },
    imageUrl: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Ensure only one journal entry per user per day if needed, 
// or allow multiple. Usually journalers write once a day, 
// but let's allow multiple for flexibility unless specified.

const Journal = mongoose.model('Journal', journalSchema);
export default Journal;
