import React from 'react';
import { motion } from 'framer-motion';
import { Users, Settings, BarChart3, ShieldCheck, Database, Search, RefreshCcw, RotateCcw } from 'lucide-react';
import useSWR, { useSWRConfig } from 'swr';
import api from '../services/api';
import AdminBugs from '../components/AdminBugs';
import MobileTabNav from '../components/ui/MobileTabNav';

const Admin = () => {
    const { mutate: globalMutate } = useSWRConfig();
    const { data, mutate, isValidating } = useSWR('/admin/stats');
    const [activeTab, setActiveTab] = React.useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'health', label: 'Health', icon: ShieldCheck },
        { id: 'bugs', label: 'Bugs', icon: Database },
    ];

    const stats = data?.stats || [
        { label: 'Total Users', value: '...', icon: Users, color: 'text-blue-500' },
        { label: 'Active Sessions', value: '...', icon: ShieldCheck, color: 'text-green-500' },
        { label: 'Database Size', value: '...', icon: Database, color: 'text-purple-500' },
        { label: 'Growth', value: '...', icon: BarChart3, color: 'text-orange-500' },
    ];

    const recentUsers = data?.recentUsers || [];
    const handleResetOnboarding = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to reset onboarding for ${userName}? This will clear their username, RPG stats, and interests, and force them to re-onboard.`)) {
            return;
        }

        try {
            await api.post(`/admin/users/${userId}/reset-onboarding`);
            alert('User data has been reset successfully. They will be prompted for onboarding on their next session/navigation.');
            mutate(); // Refresh the user list
            globalMutate('/auth/me'); // Just in case the admin resets their own data
        } catch (error) {
            console.error('Failed to reset onboarding:', error);
            alert('Error resetting user data: ' + (error.response?.data?.message || error.message));
        }
    };

    const systemStatus = data?.systemStatus || [
        { label: 'API Server', status: 'Checking...', color: 'bg-zinc-700' },
        { label: 'Database', status: 'Checking...', color: 'bg-zinc-700' },
        { label: 'WebSocket', status: 'Checking...', color: 'bg-zinc-700' },
        { label: 'Static Assets', status: 'Checking...', color: 'bg-zinc-700' },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                {/* Desktop Header */}
                <header className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">System Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Welcome back, Admin. Here's what's happening today.</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button className="flex-1 md:flex-none bg-slate-200 dark:bg-[#000000] text-slate-900 dark:text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-slate-300 dark:hover:bg-[#121212] transition-all active:scale-95">
                            Export Logs
                        </button>
                        <button
                            onClick={() => mutate()}
                            className="flex-1 md:flex-none bg-primary text-white px-6 py-2.5 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <RefreshCcw size={18} className={isValidating ? 'animate-spin' : ''} />
                            Refresh Data
                        </button>
                    </div>
                </header>

                {/* Mobile Header (Visible only on Overview Tab) */}
                {activeTab === 'overview' && (
                    <div className="md:hidden mt-4 mb-8">
                        <h1 className="text-3xl font-black tracking-tight mb-1">Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Administrator Dashboard</p>
                    </div>
                )}

                {/* Mobile Navigation */}
                <MobileTabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

                {/* Overview Tab Content */}
                {activeTab === 'overview' && (
                    <div className="md:hidden space-y-6">
                        {/* Stats 2x2 Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-[#121212]/50 border border-slate-200 dark:border-white/10 p-5 rounded-[2rem] shadow-none flex flex-col justify-between aspect-square"
                                >
                                    <div className={`size-10 rounded-2xl bg-slate-100 dark:bg-[#000000] ${stat.color} flex items-center justify-center`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">{stat.label}</p>
                                        <p className="text-2xl font-black">{stat.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        

                    </div>
                )}

                {/* Desktop Tabs / Stats Grid */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 hidden md:grid ${activeTab !== 'overview' && 'lg:hidden'}`}>
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-[#121212]/50 border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-none backdrop-blur-xl transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-[#000000] ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                                <span className="text-emerald-500 text-xs font-black uppercase tracking-widest">↑ 5%</span>
                            </div>
                            <h3 className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest leading-none mb-2">{stat.label}</h3>
                            <p className="text-3xl font-black">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Management Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* User Management */}
                    <div className={`lg:col-span-2 bg-white dark:bg-[#121212]/30 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-none ${activeTab !== 'users' && 'hidden lg:block'}`}>
                        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-xl font-black">Recent Users</h2>
                            <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="w-full sm:w-64 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                        <div className="p-6 overflow-x-auto custom-scrollbar text-xs md:text-sm">
                            <table className="w-full min-w-[600px] md:min-w-full">
                                <thead>
                                    <tr className="text-left text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-white/10">
                                        <th className="pb-4 font-black">User</th>
                                        <th className="pb-4 font-black">Role</th>
                                        <th className="pb-4 font-black">Status</th>
                                        <th className="pb-4 font-black hidden sm:table-cell">Joined</th>
                                        <th className="pb-4 font-black"></th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {recentUsers.map((user) => (
                                        <tr key={user._id} className="border-b border-slate-50 dark:border-slate-900/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden font-black uppercase">
                                                        {user.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="max-w-[120px] md:max-w-none truncate">
                                                        <p className="font-bold text-slate-900 dark:text-white truncate">{user.name || 'Anonymous'}</p>
                                                        <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className="text-[9px] md:text-[10px] font-black font-mono text-slate-400 bg-slate-100 dark:bg-[#000000] px-2 py-0.5 rounded-md">USER</span>
                                            </td>
                                            <td className="py-4">
                                                <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">Active</span>
                                            </td>
                                            <td className="py-4 text-slate-500 text-[10px] md:text-xs font-bold hidden sm:table-cell">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleResetOnboarding(user._id, user.name)}
                                                        className="text-slate-400 hover:text-orange-500 transition-colors"
                                                        title="Reset Onboarding"
                                                    >
                                                        <RotateCcw size={16} />
                                                    </button>
                                                    <button className="text-slate-400 hover:text-primary transition-colors">
                                                        <Settings size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {recentUsers.length === 0 && !isValidating && (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-slate-500 italic font-medium">No users found in the galaxy.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* System Health Section (Conditional visibility for tabs) */}
                    <div className={`space-y-6 ${activeTab !== 'health' && 'hidden lg:block'}`}>
                        <div className="bg-white dark:bg-[#121212]/30 border border-slate-200 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-none">
                            <h2 className="text-lg font-black mb-4">System Health</h2>
                            <div className="space-y-3">
                                {systemStatus.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/10/50">
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{item.label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${item.color} animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)]`} />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-primary rounded-3xl p-6 text-white overflow-hidden relative shadow-lg shadow-primary/20">
                            <div className="relative z-10">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-widest mb-3">System Alert</span>
                                <h3 className="font-black text-xl mb-2">New Update Available</h3>
                                <p className="text-primary-foreground/80 text-sm font-medium mb-5">Version 2.4.0 is ready to be deployed. Check out the latest features and security patches.</p>
                                <button className="bg-white text-primary px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95">
                                    View Changelog
                                </button>
                            </div>
                            <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
                        </div>
                    </div>
                </div>

                {/* Bug Reports Section */}
                <div className={activeTab !== 'bugs' ? 'hidden lg:block' : 'block'}>
                    <AdminBugs />
                </div>
            </motion.div>
        </div>
    );
};

export default Admin;
