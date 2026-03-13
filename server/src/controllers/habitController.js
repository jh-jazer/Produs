import Habit from '../models/Habit.js';
import User from '../models/User.js';

// @desc    Get all habits for a user
// @route   GET /api/habits
// @access  Private
export const getHabits = async (req, res) => {
    try {
        let targetUserId = req.user._id;

        if (req.query.view === 'partner') {
            const currentUser = await User.findById(req.user._id);
            if (!currentUser || !currentUser.partner) {
                return res.status(400).json({ message: 'No linked partner found' });
            }

            // Return habits for both self and partner
            const habits = await Habit.find({
                user: { $in: [req.user._id, currentUser.partner] }
            });
            return res.json(habits);
        }

        const habits = await Habit.find({ user: targetUserId });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a habit
// @route   POST /api/habits
// @access  Private
export const createHabit = async (req, res) => {
    const { name, icon, color, category, isShared } = req.body;
    try {
        if (isShared) {
            const currentUser = await User.findById(req.user._id);
            if (!currentUser.partner) {
                return res.status(400).json({ message: 'Must link a partner to create shared habits' });
            }

            const sharedGroupId = `shared-${Date.now()}`;

            // Create for both
            const habitSelf = await Habit.create({
                user: req.user._id,
                name, icon, color, category,
                isShared: true,
                sharedGroupId
            });

            await Habit.create({
                user: currentUser.partner,
                name, icon, color, category,
                isShared: true,
                sharedGroupId
            });

            return res.status(201).json(habitSelf);
        }

        const habit = await Habit.create({
            user: req.user._id,
            name,
            icon,
            color,
            category
        });
        res.status(201).json(habit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Toggle habit check
// @route   PATCH /api/habits/:id/check
// @access  Private
export const toggleCheck = async (req, res) => {
    const { dateStr } = req.body;
    try {
        const habit = await Habit.findById(req.params.id);
        if (habit) {
            await habit.toggleCheck(dateStr);
            res.json(habit);
        } else {
            res.status(404).json({ message: 'Habit not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a habit
// @route   PUT /api/habits/:id
// @access  Private
export const updateHabit = async (req, res) => {
    const { name, icon, color, category } = req.body;
    try {
        const habit = await Habit.findById(req.params.id);
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        // Check if habit belongs to user
        if (habit.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized' });
        }

        if (habit.isShared && habit.sharedGroupId) {
            // Update all habits in shared group
            await Habit.updateMany(
                { sharedGroupId: habit.sharedGroupId },
                { $set: { name, icon, color, category } }
            );
            const updatedHabit = await Habit.findById(req.params.id);
            return res.json(updatedHabit);
        }

        habit.name = name || habit.name;
        habit.icon = icon || habit.icon;
        habit.color = color || habit.color;
        habit.category = category || habit.category;

        const updatedHabit = await habit.save();
        res.json(updatedHabit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
export const deleteHabit = async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (habit) {
            // Check if habit belongs to user
            if (habit.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'User not authorized' });
            }

            if (habit.isShared && habit.sharedGroupId) {
                // Delete both parts of shared habit
                await Habit.deleteMany({ sharedGroupId: habit.sharedGroupId });
                return res.json({ message: 'Shared habit removed' });
            }

            await habit.deleteOne();
            res.json({ message: 'Habit removed' });
        } else {
            res.status(404).json({ message: 'Habit not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
