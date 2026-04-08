import User from '../models/User.js';

const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        const archetypeStats = await User.aggregate([
            {
                $match: {
                    "rpg.archetype.name": { $exists: true, $ne: "None" }
                }
            },
            {
                $group: {
                    _id: {
                        name: "$rpg.archetype.name",
                        tier: "$rpg.archetype.tier"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.name",
                    total: { $sum: "$count" },
                    tiers: {
                        $push: {
                            tier: "$_id.tier",
                            count: "$count"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    total: 1,
                    tiers: 1
                }
            },
            { $sort: { total: -1 } }
        ]);
        
        // Return dummy data for things that aren't fully tracked yet
        // but provide some structure for the dashboard
        res.json({
            stats: [
                { label: 'Total Users', value: totalUsers.toString(), icon: 'Users', color: 'text-blue-500' },
                { label: 'Active Sessions', value: '156', icon: 'ShieldCheck', color: 'text-green-500' },
                { label: 'Database Size', value: '2.4 GB', icon: 'Database', color: 'text-purple-500' },
                { label: 'Growth', value: '+12%', icon: 'BarChart3', color: 'text-orange-500' },
            ],
            archetypeStats,
            recentUsers: await User.find().sort({ createdAt: -1 }).limit(10).select('name email username banner avatar settings createdAt isAdmin'),
            systemStatus: [
                 { label: 'API Server', status: 'Healthy', color: 'bg-green-500' },
                 { label: 'Database', status: 'Healthy', color: 'bg-green-500' },
                 { label: 'WebSocket', status: 'Healthy', color: 'bg-green-500' },
                 { label: 'Static Assets', status: 'Healthy', color: 'bg-green-500' },
            ]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetUserOnboarding = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.onboardingCompleted = false;
        user.username = undefined;
        user.interests = [];
        user.level = 1;
        user.exp = 0;
        user.rpg.stats = {
            str: 0,
            dex: 0,
            end: 0,
            int: 0,
            wis: 0,
            cha: 0
        };
        user.rpg.archetype = {
            name: 'None',
            tier: 1,
            stage: 'Unawakened'
        };
        user.settings.subscriptions = [];

        user.markModified('rpg');
        user.markModified('settings');

        await user.save();

        res.json({ message: 'User onboarding data reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleUserAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent modifying the master admin
        if (user.email === 'ernestodesabillejr@gmail.com') {
            return res.status(403).json({ message: 'Cannot modify master admin status' });
        }

        user.isAdmin = !user.isAdmin;
        await user.save();

        res.json({ message: `User admin status set to ${user.isAdmin}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getSystemStats, resetUserOnboarding, toggleUserAdmin };
