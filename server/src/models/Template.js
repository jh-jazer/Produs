import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    tasks: [{
        title: String,
        startTime: String,
        endTime: String,
        color: String
    }],
    isShared: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Template = mongoose.model('Template', templateSchema);
export default Template;
