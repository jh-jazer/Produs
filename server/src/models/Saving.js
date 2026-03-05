import mongoose from 'mongoose';

const savingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    target: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    }
}, {
    timestamps: true
});

const Saving = mongoose.model('Saving', savingSchema);
export default Saving;
