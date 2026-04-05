import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be "Strategist" (String) or 0 (Number)
    nextId: { type: String, default: null }, // The ID of the next question in the narrative
    postText: { type: String, default: "" } // Text shown immediately after making this choice
});

const narrativeQuestionSchema = new mongoose.Schema({
    questionId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    title: { 
        type: String, 
        default: "" 
    },
    section: { 
        type: String, 
        required: true,
        enum: ['PATH', 'TIER1', 'STYLE', 'ALIGNMENT', 'TRIAL']
    },
    type: { 
        type: String, 
        required: true,
        enum: ['WHY', 'ACTION'],
        default: 'WHY'
    },
    weight: { 
        type: Number, 
        required: true,
        default: 1.0 
    },
    story: { 
        type: String, 
        default: "" 
    },
    question: { 
        type: String, 
        required: true 
    },
    options: [optionSchema]
}, {
    timestamps: true
});

const NarrativeQuestion = mongoose.model('NarrativeQuestion', narrativeQuestionSchema);
export default NarrativeQuestion;
