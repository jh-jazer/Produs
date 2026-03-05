import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
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
    description: {
        type: String,
        trim: true
    },
    date: {
        type: String, // Start date (YYYY-MM-DD)
        required: true
    },
    endDate: {
        type: String, // End date (YYYY-MM-DD)
    },
    startTime: {
        type: String, // HH:mm
    },
    endTime: {
        type: String, // HH:mm
    },
    priority: {
        type: Boolean,
        default: false
    },
    completed: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['task', 'event'],
        default: 'task'
    },
    order: {
        type: Number,
        default: 0
    },
    color: {
        type: String,
        default: '#3b82f6' // Default primary blue
    }
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
