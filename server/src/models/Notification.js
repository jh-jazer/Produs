import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['system', 'achievement', 'habit', 'finance', 'partner', 'connection'],
        default: 'system'
    },
    read: {
        type: Boolean,
        default: false
    },
    icon: {
        type: String,
        default: 'notifications'
    },
    color: {
        type: String,
        default: 'text-primary'
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
