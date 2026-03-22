import mongoose from 'mongoose';

const yjsStateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    feature: {
        type: String,
        required: true,
        enum: ['journal', 'habits', 'planner', 'finance']
    },
    state: {
        type: Buffer,
        required: true
    }
}, {
    timestamps: true
});

// Unique index for feature per user
yjsStateSchema.index({ user: 1, feature: 1 }, { unique: true });

const YjsState = mongoose.model('YjsState', yjsStateSchema);
export default YjsState;
