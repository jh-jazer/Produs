import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['habit', 'quiz', 'journal', 'perk', 'system'],
        required: true
    },
    action: {
        type: String, // e.g., "Pushed 50kg" or "Mirror Reflection"
        required: true
    },
    stat: {
        type: String,
        enum: ['str', 'dex', 'end', 'int', 'wis', 'cha', 'none'],
        default: 'none'
    },
    amount: {
        type: Number,
        required: true
    },
    perkActivated: {
        type: String,
        default: null
    },
    metadata: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

// Index for fetching last 20 entries quickly
activitySchema.index({ user: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
