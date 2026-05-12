import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    period: {
        type: String,
        enum: ['weekly', 'monthly', 'yearly'],
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number, // 0-11
    },
    week: {
        type: Number, // 0-5
    },
    day: {
        type: Number, // 0-6
    },
    completed: {
        type: Boolean,
        default: false
    },
    targetValue: {
        type: Number,
        default: 100
    },
    currentValue: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Encryption Hooks
goalSchema.pre('save', function() {
    if (this.isModified('title')) this.title = encrypt(this.title);
});

goalSchema.post('init', function(doc) {
    if (doc.title) doc.title = decrypt(doc.title);
});

goalSchema.post('save', function(doc) {
    if (doc.title) doc.title = decrypt(doc.title);
});

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
