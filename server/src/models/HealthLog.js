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
        type: String, // 'workout', 'sleep', 'nutrition', 'metric', 'hydration', etc
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    value: {
        type: Number // kept for legacy or simple logs
    },
    unit: {
        type: String,
        default: ''
    },
    details: {
        type: mongoose.Schema.Types.Mixed, // flexible object for duration, intensity, metricType, etc.
        default: {}
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
