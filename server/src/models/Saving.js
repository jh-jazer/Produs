import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

const savingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    target: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    }
}, {
    timestamps: true
});

// Encryption Hooks
savingSchema.pre('save', function(next) {
    if (this.isModified('title')) this.title = encrypt(this.title);
    next();
});

savingSchema.post('init', function(doc) {
    if (doc.title) doc.title = decrypt(doc.title);
});

savingSchema.post('save', function(doc) {
    if (doc.title) doc.title = decrypt(doc.title);
});

const Saving = mongoose.model('Saving', savingSchema);
export default Saving;
