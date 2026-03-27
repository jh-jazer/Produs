import mongoose from 'mongoose';

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

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
