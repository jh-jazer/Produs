import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

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

// Encryption Hooks
journalSchema.pre('save', function() {
    if (this.isModified('title')) this.title = encrypt(this.title);
    if (this.isModified('content')) this.content = encrypt(this.content);
});

journalSchema.post('init', function(doc) {
    if (doc.title) doc.title = decrypt(doc.title);
    if (doc.content) doc.content = decrypt(doc.content);
});

journalSchema.post('save', function(doc) {
    if (doc.title) doc.title = decrypt(doc.title);
    if (doc.content) doc.content = decrypt(doc.content);
});

const Journal = mongoose.model('Journal', journalSchema);
export default Journal;
