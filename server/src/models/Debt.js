import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

const debtSchema = new mongoose.Schema({
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
        type: Number, // Current balance
        required: true
    },
    total: {
        type: Number, // Total limit or original amount
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'loan', 'personal', 'salary', 'freelance', 'investment', 'other'],
        default: 'personal'
    },
    nature: {
        type: String,
        enum: ['debt', 'income'],
        default: 'debt'
    },
    interestRate: {
        type: Number,
        default: 0
    },
    dueDate: {
        type: String
    },
    isMonthly: {
        type: Boolean,
        default: false
    },
    monthsLeft: {
        type: Number
    }
}, {
    timestamps: true
});

// Encryption Hooks
debtSchema.pre('save', function() {
    if (this.isModified('title')) this.title = encrypt(this.title);
});

debtSchema.post('init', function(doc) {
    if (doc.title) doc.title = decrypt(doc.title);
});

debtSchema.post('save', function(doc) {
    if (doc.title) doc.title = decrypt(doc.title);
});

const Debt = mongoose.model('Debt', debtSchema);
export default Debt;
