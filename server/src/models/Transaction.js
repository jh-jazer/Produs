import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

const transactionSchema = new mongoose.Schema({
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
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['income', 'expense', 'savings'],
        required: true
    },
    category: {
        type: String,
        required: true,
        default: 'Other'
    },
    date: {
        type: String, // String format YYYY-MM-DD for consistency with frontend
        required: true
    }
}, {
    timestamps: true
});

// Encryption Hooks
transactionSchema.pre('save', function() {
    if (this.isModified('title')) this.title = encrypt(this.title);
});

transactionSchema.post('init', function(doc) {
    if (doc.title) doc.title = decrypt(doc.title);
});

transactionSchema.post('save', function(doc) {
    if (doc.title) doc.title = decrypt(doc.title);
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
