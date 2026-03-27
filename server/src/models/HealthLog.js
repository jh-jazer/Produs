import mongoose from 'mongoose';

const healthLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    type: {
        type: String,
        enum: ['workout', 'sleep', 'nutrition', 'hydration'],
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        default: ''
    },
    isGoalHit: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const HealthLog = mongoose.model('HealthLog', healthLogSchema);
export default HealthLog;
