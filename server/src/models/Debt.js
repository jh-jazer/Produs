import mongoose from 'mongoose';

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
        enum: ['credit', 'loan', 'personal'],
        default: 'credit'
    },
    interestRate: {
        type: Number,
        default: 0
    },
    dueDate: {
        type: String
    }
}, {
    timestamps: true
});

const Debt = mongoose.model('Debt', debtSchema);
export default Debt;
