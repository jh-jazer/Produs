import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    limit: {
        type: Number,
        required: true
    },
    period: {
        type: String,
        default: 'monthly'
    }
}, {
    timestamps: true
});

// Encryption Hooks
budgetSchema.pre('save', function() {
    if (this.isModified('category')) this.category = encrypt(this.category);
});

budgetSchema.post('init', function(doc) {
    if (doc.category) doc.category = decrypt(doc.category);
});

budgetSchema.post('save', function(doc) {
    if (doc.category) doc.category = decrypt(doc.category);
});

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
