import User from '../models/User.js';
import Habit from '../models/Habit.js';
import Journal from '../models/Journal.js';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';
import Budget from '../models/Budget.js';
import Debt from '../models/Debt.js';
import Saving from '../models/Saving.js';
import HealthLog from '../models/HealthLog.js';
import Transaction from '../models/Transaction.js';
import Activity from '../models/Activity.js';
import BugReport from '../models/BugReport.js';
import Wishlist from '../models/Wishlist.js';
import Notification from '../models/Notification.js';
import YjsState from '../models/YjsState.js';

import SystemSettings from '../models/SystemSettings.js';

const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const settings = await SystemSettings.getSettings();

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
        
        // Level distribution: count users per level 1-65
        const rawLevelDist = await User.aggregate([
            { $match: { guardianLevel: { $gte: 1, $lte: 65 } } },
            { $group: { _id: '$guardianLevel', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Build a full 1-65 array (sparse levels default to 0)
        const levelMap = Object.fromEntries(rawLevelDist.map(d => [d._id, d.count]));
        const levelDistribution = Array.from({ length: 65 }, (_, i) => ({
            level: i + 1,
            count: levelMap[i + 1] ?? 0
        }));

        res.json({
            stats: [
                { label: 'Total Users', value: totalUsers.toString(), icon: 'Users', color: 'text-blue-500' },
                { label: 'Active Sessions', value: '156', icon: 'ShieldCheck', color: 'text-green-500' },
                { label: 'Core Pool', value: settings.corePool.toString(), icon: 'Zap', color: 'text-amber-500' },
                { label: 'Growth', value: '+12%', icon: 'BarChart3', color: 'text-orange-500' },
            ],
            archetypeStats,
            levelDistribution,
            corePool: settings.corePool,
            recentUsers: await User.find().sort({ createdAt: -1 }).select('name email username banner avatar settings createdAt isAdmin rpg guardianLevel guardianExp'),
            systemStatus: [
                 { label: 'API Server', status: 'Healthy', color: 'bg-green-500' },
                 { label: 'Database', status: 'Healthy', color: 'bg-green-500' },
                 { label: 'WebSocket', status: 'Healthy', color: 'bg-green-500' },
                 { label: 'Core Registry', status: 'Active', color: 'bg-amber-500' },
            ]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const distributeCores = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const grantAmount = parseInt(amount);

        if (isNaN(grantAmount) || grantAmount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const settings = await SystemSettings.getSettings();
        if (settings.corePool < grantAmount) {
            return res.status(400).json({ message: 'Insufficient Core Pool' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Atomic decrease of pool and increase of user cores
        settings.corePool -= grantAmount;
        user.rpg.cores = (user.rpg.cores || 0) + grantAmount;

        await settings.save();
        await user.save();

        res.json({ 
            message: `Successfully granted ${grantAmount} Cores to ${user.username || user.name}`,
            newBalance: user.rpg.cores,
            remainingPool: settings.corePool
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
        user.guardianLevel = 1;
        user.guardianExp = 100;
        user.rpg.stats = {
            str: 0,
            agi: 0,
            vit: 0,
            int: 0,
            wis: 0,
            luk: 0
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

const bulkDeleteUsers = async (req, res) => {
    try {
        const currentAdminId = req.user._id;
        const masterAdminEmail = 'ernestodesabillejr@gmail.com';

        // 1. Identify all users to delete (Not current admin, not master admin)
        const usersToDelete = await User.find({
            _id: { $ne: currentAdminId },
            email: { $ne: masterAdminEmail }
        }).select('_id');

        const userIds = usersToDelete.map(u => u._id);

        if (userIds.length === 0) {
            return res.json({ message: 'No standard users found to purge.' });
        }

        // 2. Perform Cascading Deletion across all collections
        const deletionPromises = [
            User.deleteMany({ _id: { $in: userIds } }),
            Habit.deleteMany({ user: { $in: userIds } }),
            Journal.deleteMany({ user: { $in: userIds } }),
            Task.deleteMany({ user: { $in: userIds } }),
            Goal.deleteMany({ user: { $in: userIds } }),
            Budget.deleteMany({ user: { $in: userIds } }),
            Debt.deleteMany({ user: { $in: userIds } }),
            Saving.deleteMany({ user: { $in: userIds } }),
            HealthLog.deleteMany({ user: { $in: userIds } }),
            Transaction.deleteMany({ user: { $in: userIds } }),
            Activity.deleteMany({ user: { $in: userIds } }),
            BugReport.deleteMany({ user: { $in: userIds } }),
            Wishlist.deleteMany({ user: { $in: userIds } }),
            Notification.deleteMany({ user: { $in: userIds } }),
            YjsState.deleteMany({ user: { $in: userIds } })
        ];

        await Promise.all(deletionPromises);

        res.json({ 
            message: 'System purge complete.', 
            deletedCount: userIds.length 
        });
    } catch (error) {
        console.error('Purge failed:', error);
        res.status(500).json({ message: error.message });
    }
};

export { getSystemStats, distributeCores, resetUserOnboarding, toggleUserAdmin, bulkDeleteUsers };
