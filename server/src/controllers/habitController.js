import Habit from '../models/Habit.js';
import User from '../models/User.js';
import { awardXP } from '../utils/rpgUtils.js';

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
            // Return habits for both self and partner
            const habits = await Habit.find({
                user: { $in: [req.user._id, currentUser.partner] }
            }).sort({ order: 1, createdAt: 1 });
            return res.json(habits);
        }

        const habits = await Habit.find({ user: targetUserId }).sort({ order: 1, createdAt: 1 });
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
            const alreadyChecked = habit.checks.some(c => c.date === dateStr && c.completed);
            await habit.toggleCheck(dateStr);
            
            // Award XP if precisely toggled TO completed
            if (!alreadyChecked) {
                const user = await User.findById(req.user._id);
                const category = (habit.category || 'INT').toLowerCase();
                let baseXP = 5;

                // Specific "Iconic" rewards from guideline
                const name = habit.name.toLowerCase();
                const icon = habit.icon.toLowerCase();
                
                if (icon.includes('fitness') || name.includes('workout')) baseXP = 10;
                else if (icon.includes('book') || name.includes('read')) baseXP = 10;
                else if (icon.includes('meditation') || icon.includes('improvement')) baseXP = 10;
                else if (icon.includes('sunny') || name.includes('routine')) baseXP = 10;

                // Award Primary Stat XP
                await awardXP(user, category, baseXP, habit.streak);

                // Award Endurance (END) XP based on streak milestones
                const streak = habit.streak;
                let endXP = 0;
                if (streak === 100) endXP = 300;
                else if (streak === 30) endXP = 100;
                else if (streak === 14) endXP = 50;
                else if (streak === 7) endXP = 25;
                else if (streak === 3) endXP = 10;

                if (endXP > 0) {
                    await awardXP(user, 'end', endXP);
                }

                await user.save();
            }
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
            // Prevent name change if it's a system habit
            const updatePayload = { icon, color, category };
            if (!habit.systemId) {
                updatePayload.name = name;
            }
            
            await Habit.updateMany(
                { sharedGroupId: habit.sharedGroupId },
                { $set: updatePayload }
            );
            const updatedHabit = await Habit.findById(req.params.id);
            return res.json(updatedHabit);
        }

        // Prevent name change if it's a system habit
        if (!habit.systemId) {
            habit.name = name || habit.name;
        }
        
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

            // Prevent deletion of system habits
            if (habit.systemId) {
                return res.status(403).json({ message: 'System habits cannot be deleted' });
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

// @desc    Reorder habits manually using drag and drop
// @route   PUT /api/habits/reorder
// @access  Private
export const reorderHabits = async (req, res) => {
    try {
        const { habitIds } = req.body;
        
        if (!Array.isArray(habitIds)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        const bulkOps = habitIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id, user: req.user._id },
                update: { $set: { order: index } }
            }
        }));

        if (bulkOps.length > 0) {
            await Habit.bulkWrite(bulkOps);
        }

        res.json({ message: 'Habits reordered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
