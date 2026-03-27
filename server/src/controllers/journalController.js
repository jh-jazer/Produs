import Journal from '../models/Journal.js';
import { checkSystemHabit } from '../utils/habitUtils.js';
import User from '../models/User.js';
import { awardXP } from '../utils/rpgUtils.js';

export const createEntry = async (req, res) => {
    try {
        const { title, content, mood, tags, date } = req.body;
        const entry = await Journal.create({
            user: req.user._id,
            title,
            content,
            mood,
            tags,
            date: date || new Date()
        });
        
        // Auto-check the Journal habit
        const entryDateStr = new Date(entry.date).toISOString().split('T')[0];
        await checkSystemHabit(req.user._id, 'journal', entryDateStr);

        
        res.status(201).json(entry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getEntries = async (req, res) => {
    try {
        const entries = await Journal.find({ user: req.user._id })
            .sort({ date: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateEntry = async (req, res) => {
    try {
        const entry = await Journal.findOne({ _id: req.params.id, user: req.user._id });
        if (!entry) return res.status(404).json({ message: 'Entry not found' });

        const { title, content, mood, tags, date } = req.body;
        if (title !== undefined) entry.title = title;
        if (content !== undefined) entry.content = content;
        if (mood !== undefined) entry.mood = mood;
        if (tags !== undefined) entry.tags = tags;
        if (date !== undefined) entry.date = date;

        await entry.save();
        res.json(entry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteEntry = async (req, res) => {
    try {
        const entry = await Journal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!entry) return res.status(404).json({ message: 'Entry not found' });
        res.json({ message: 'Entry removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
