import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

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

// Encryption Hooks
healthLogSchema.pre('save', function() {
    if (this.isModified('title')) this.title = encrypt(this.title);
    if (this.isModified('details')) this.details = encrypt(this.details);
});

healthLogSchema.post('init', function(doc) {
    if (doc.title) doc.title = decrypt(doc.title);
    if (doc.details) doc.details = decrypt(doc.details);
});

healthLogSchema.post('save', function(doc) {
    if (doc.title) doc.title = decrypt(doc.title);
    if (doc.details) doc.details = decrypt(doc.details);
});

const HealthLog = mongoose.model('HealthLog', healthLogSchema);
export default HealthLog;
