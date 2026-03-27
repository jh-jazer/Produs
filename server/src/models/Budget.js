import mongoose from 'mongoose';

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

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
