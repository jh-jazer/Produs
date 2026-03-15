import User from '../models/User.js';
import Habit from '../models/Habit.js';

// @desc    Get activity feed (partner + public users)
// @route   GET /api/feed
// @access  Private
export const getFeed = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id).populate('partner', '_id name username avatar');

        const feedEntries = [];

        // --- Partner Activity ---
        if (currentUser.partner) {
            const partnerId = currentUser.partner._id;
            const partnerUser = await User.findById(partnerId).select('name username avatar bio');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];

            const partnerHabits = await Habit.find({ user: partnerId });

            for (const habit of partnerHabits) {
                const todayCheck = habit.checks?.find(c => c.date === todayStr && c.completed);
                if (todayCheck) {
                    feedEntries.push({
                        id: `${habit._id}-check-${todayStr}`,
                        type: 'habit_check',
                        user: {
                            name: partnerUser.name,
                            username: partnerUser.username,
                            avatar: partnerUser.avatar,
                        },
                        data: {
                            habitName: habit.name,
                            habitIcon: habit.icon,
                            habitColor: habit.color,
                            streak: habit.streak,
                        },
                        timestamp: new Date(),
                        isPartner: true,
                    });
                }

                if (habit.streak > 0 && habit.streak % 7 === 0) {
                    feedEntries.push({
                        id: `${habit._id}-milestone-${habit.streak}`,
                        type: 'streak_milestone',
                        user: {
                            name: partnerUser.name,
                            username: partnerUser.username,
                            avatar: partnerUser.avatar,
                        },
                        data: {
                            habitName: habit.name,
                            habitIcon: habit.icon,
                            habitColor: habit.color,
                            streak: habit.streak,
                        },
                        timestamp: new Date(),
                        isPartner: true,
                    });
                }
            }
        }

        // Sort by timestamp desc
        let combinedFeed = [...feedEntries].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(combinedFeed.slice(0, 30));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
