import Habit from '../models/Habit.js';
import User from '../models/User.js';
import { awardXP } from '../utils/rpgUtils.js';
import { initializeSystemHabits } from '../utils/habitUtils.js';

// @desc    Get all habits for a user
// @route   GET /api/habits
// @access  Private
export const getHabits = async (req, res) => {
    try {
        let targetUserId = req.user._id;

        if (req.query.view !== 'partner') {
            await initializeSystemHabits(targetUserId);
        }

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
    const { name, icon, color, isShared } = req.body;
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
                name, icon, color,
                isShared: true,
                sharedGroupId
            });

            await Habit.create({
                user: currentUser.partner,
                name, icon, color,
                isShared: true,
                sharedGroupId
            });

            return res.status(201).json(habitSelf);
        }

        const habit = await Habit.create({
            user: req.user._id,
            name,
            icon,
            color
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
            
            // Award XP & Prod Coins or Link Points if precisely toggled TO completed
            if (!alreadyChecked) {
                const isSharedHabit = habit.isShared && !!habit.sharedGroupId;

                if (isSharedHabit) {
                    // Find partner's habit
                    const partnerHabit = await Habit.findOne({
                        sharedGroupId: habit.sharedGroupId,
                        _id: { $ne: habit._id }
                    });
                    const partnerChecked = partnerHabit && partnerHabit.checks.some(c => c.date === dateStr && c.completed);
                    
                    // If both have now completed the habit for this date
                    if (partnerChecked) {
                        const isSystemHabit = !!habit.systemId;
                        const linkPointsToAward = isSystemHabit ? 10 : 1;
                        
                        // Award link points to current user
                        const user = await User.findById(req.user._id);
                        user.rpg.linkPoints = (user.rpg.linkPoints || 0) + linkPointsToAward;
                        await user.save();
                        
                        // Award link points to partner user
                        if (partnerHabit.user) {
                            const partnerUser = await User.findById(partnerHabit.user);
                            if (partnerUser) {
                                partnerUser.rpg.linkPoints = (partnerUser.rpg.linkPoints || 0) + linkPointsToAward;
                                await partnerUser.save();
                            }
                        }
                    }
                } else {
                    // Non-shared habit: award plain Guardian XP & Prod Coins
                    const user = await User.findById(req.user._id);
                    const isSystemHabit = !!habit.systemId;
                    const xpToAward = isSystemHabit ? 10 : 1;
                    const coinsToAward = isSystemHabit ? 10 : 1;

                    // Award plain guardian XP (passing streak = 1 to ignore multipliers)
                    await awardXP(user, 'none', xpToAward, 1);

                    // Award prod points (productivity coins)
                    user.rpg.prodCoins = (user.rpg.prodCoins || 0) + coinsToAward;

                    // Award streak milestone bonus guardian XP
                    const streak = habit.streak;
                    let streakBonusXP = 0;
                    if (streak === 100) streakBonusXP = 20;
                    else if (streak === 30) streakBonusXP = 10;
                    else if (streak === 14) streakBonusXP = 5;
                    else if (streak === 7) streakBonusXP = 3;
                    else if (streak === 3) streakBonusXP = 1;

                    if (isSystemHabit) {
                        streakBonusXP *= 10;
                    }

                    if (streakBonusXP > 0) {
                        await awardXP(user, 'none', streakBonusXP, 1);
                    }

                    await user.save();
                }
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
    const { name, icon, color } = req.body;
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
            const updatePayload = { icon, color };
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

// @desc    Initialize core habits for a user
// @route   POST /api/habits/init
// @access  Private
export const initCoreHabits = async (req, res) => {
    try {
        await initializeSystemHabits(req.user._id);
        const habits = await Habit.find({ user: req.user._id }).sort({ order: 1, createdAt: 1 });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
