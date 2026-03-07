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

        // --- Public Users' Recent Milestones ---
        const publicUsers = await User.find({
            'settings.isPublic': true,
            _id: { $ne: req.user.id },
        }).select('_id name username avatar').limit(15);

        const publicUserIds = publicUsers.map(u => u._id);
        const publicHabits = await Habit.find({
            user: { $in: publicUserIds },
            streak: { $gte: 7 },
        }).limit(30);

        for (const habit of publicHabits) {
            const owner = publicUsers.find(u => u._id.toString() === habit.user.toString());
            if (!owner) continue;
            feedEntries.push({
                id: `pub-${habit._id}-streak`,
                type: 'streak_milestone',
                user: {
                    name: owner.name,
                    username: owner.username,
                    avatar: owner.avatar,
                },
                data: {
                    habitName: habit.name,
                    habitIcon: habit.icon,
                    habitColor: habit.color,
                    streak: habit.streak,
                },
                timestamp: new Date(Date.now() - Math.random() * 86400000 * 3),
                isPartner: false,
            });
        }

        // Sort by timestamp desc
        let combinedFeed = [...feedEntries].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // 3. Mock Data for Scrollability (only if less than 15 items)
        if (combinedFeed.length < 15) {
            const mockUsers = [
                { name: 'Sarah Chen', username: 'sarahc', avatar: { skin: '#F3C5A5', hair: 'long', hairColor: '#4A2C2A', eyes: 'happy', clothing: 'hoodie', clothingColor: '#EC4899' } },
                { name: 'Marcus Miller', username: 'marcus', avatar: { skin: '#8D5524', hair: 'short', hairColor: '#000000', eyes: 'default', clothing: 'shirt', clothingColor: '#3B82F6' } },
                { name: 'Elena Rodriguez', username: 'elena_r', avatar: { skin: '#E0AC69', hair: 'bob', hairColor: '#A52A2A', eyes: 'sleepy', clothing: 'tank', clothingColor: '#10B981' } },
                { name: 'Alex Thompson', username: 'alext', avatar: { skin: '#FFDBAC', hair: 'short', hairColor: '#D1D1D1', eyes: 'default', clothing: 'hoodie', clothingColor: '#6366F1' } },
                { name: 'Jamal Washington', username: 'jamal_w', avatar: { skin: '#3C2E28', hair: 'bald', hairColor: '#000000', eyes: 'happy', clothing: 'shirt', clothingColor: '#F59E0B' } },
            ];

            const mockHabits = [
                { name: 'Deep Work', icon: 'bolt', color: 'amber' },
                { name: 'Drinking Water', icon: 'local_drink', color: 'emerald' },
                { name: 'Reading', icon: 'menu_book', color: 'blue' },
                { name: 'Meditation', icon: 'self_improvement', color: 'purple' },
                { name: 'Gym Session', icon: 'fitness_center', color: 'red' },
            ];

            const countNeeded = 15 - combinedFeed.length;
            for (let i = 0; i < countNeeded; i++) {
                const user = mockUsers[i % mockUsers.length];
                const habit = mockHabits[Math.floor(Math.random() * mockHabits.length)];
                const type = Math.random() > 0.3 ? 'habit_check' : 'streak_milestone';

                combinedFeed.push({
                    id: `mock-${i}-${Date.now()}`,
                    user: {
                        name: user.name,
                        username: user.username,
                        avatar: user.avatar,
                    },
                    type,
                    timestamp: new Date(Date.now() - (i + 1) * 3600000 * 4), // staggered by 4 hours
                    data: {
                        habitName: habit.name,
                        habitIcon: habit.icon,
                        habitColor: habit.color,
                        streak: type === 'streak_milestone' ? Math.floor(Math.random() * 20) + 5 : 1
                    },
                    isMock: true
                });
            }
            // Re-sort
            combinedFeed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }

        res.json(combinedFeed.slice(0, 30));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
