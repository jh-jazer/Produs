import User from '../models/User.js';

const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        
        // Return dummy data for things that aren't fully tracked yet
        // but provide some structure for the dashboard
        res.json({
            stats: [
                { label: 'Total Users', value: totalUsers.toString(), icon: 'Users', color: 'text-blue-500' },
                { label: 'Active Sessions', value: '156', icon: 'ShieldCheck', color: 'text-green-500' },
                { label: 'Database Size', value: '2.4 GB', icon: 'Database', color: 'text-purple-500' },
                { label: 'Growth', value: '+12%', icon: 'BarChart3', color: 'text-orange-500' },
            ],
            recentUsers: await User.find().sort({ createdAt: -1 }).limit(10).select('name email username banner avatar settings createdAt'),
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

export { getSystemStats };
