import React from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart3, ShieldCheck, Database, RefreshCcw, BookOpen, FileDown, Zap, Activity } from 'lucide-react';
import useSWR, { useSWRConfig } from 'swr';
import api from '../services/api';
import MobileTabNav from '../components/ui/MobileTabNav';
import DashboardModal from '../components/ui/DashboardModal';

import AdminStats from '../components/admin_components/AdminStats';
import AdminUserRegistry from '../components/admin_components/AdminUserRegistry';
import AdminSystemHealth from '../components/admin_components/AdminSystemHealth';
import AdminBugs from '../components/admin_components/AdminBugs';
import AdminNarrativeManager from '../components/admin_components/AdminNarrativeManager';

const Admin = () => {
    const { mutate: globalMutate } = useSWRConfig();
    const { data, mutate, isValidating } = useSWR('/admin/stats');
    const [activeTab, setActiveTab] = React.useState('overview');
    const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
    const [isExporting, setIsExporting] = React.useState(false);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'health', label: 'Health', icon: ShieldCheck },
        { id: 'bugs', label: 'Bugs', icon: Database },
        { id: 'narrative', label: 'Narrative', icon: BookOpen },
    ];

    const stats = React.useMemo(() => data?.stats || [
        { label: 'Total Users', value: '...', icon: Users, color: 'text-blue-500' },
        { label: 'Active Sessions', value: '...', icon: ShieldCheck, color: 'text-green-500' },
        { label: 'Database Size', value: '...', icon: Database, color: 'text-purple-500' },
        { label: 'Growth', value: '...', icon: BarChart3, color: 'text-orange-500' },
    ], [data?.stats]);

    const recentUsers = React.useMemo(() => data?.recentUsers || [], [data?.recentUsers]);
    const archetypeStats = React.useMemo(() => data?.archetypeStats || [], [data?.archetypeStats]);
    const levelDistribution = React.useMemo(() => data?.levelDistribution || [], [data?.levelDistribution]);
    const systemStatus = React.useMemo(() => data?.systemStatus || [
        { label: 'API Server', status: 'Checking...', color: 'bg-zinc-700' },
        { label: 'Database', status: 'Checking...', color: 'bg-zinc-700' },
        { label: 'WebSocket', status: 'Checking...', color: 'bg-zinc-700' },
        { label: 'Static Assets', status: 'Checking...', color: 'bg-zinc-700' },
    ], [data?.systemStatus]);

    const handleResetOnboarding = async (userId, userName) => {
        if (!window.confirm(`Reset onboarding for ${userName}? This will clear their username, RPG stats, and interests.`)) return;
        try {
            await api.post(`/admin/users/${userId}/reset-onboarding`);
            alert('User data has been reset successfully.');
            mutate();
            globalMutate('/auth/me');
        } catch (error) {
            alert('Error resetting user data: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleToggleAdmin = async (userId, userName, currentStatus) => {
        if (!window.confirm(`${currentStatus ? 'Demote' : 'Promote'} ${userName}?`)) return;
        try {
            await api.post(`/admin/users/${userId}/toggle-admin`);
            alert(`User successfully ${currentStatus ? 'demoted' : 'promoted'}.`);
            mutate();
        } catch (error) {
            alert('Error toggling admin status: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleBulkPurge = async () => {
        try {
            const { data } = await api.delete('/admin/users');
            alert(data.message || 'System purge completed successfully.');
            mutate();
            globalMutate('/auth/me');
        } catch (error) {
            alert('Error performing system purge: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleExportLogs = (type = 'all') => {
        setIsExporting(true);
        
        // Short delay to simulate synthesis aesthetic
        setTimeout(() => {
            const exportData = {
                metadata: {
                    version: "2.4.0-PROD",
                    timestamp: new Date().toISOString(),
                    origin: "SYSTEM_MANAGEMENT_OVERRIDE",
                    scope: type.toUpperCase()
                },
                payload: {
                    stats: type === 'all' || type === 'stats' ? stats : null,
                    users: type === 'all' || type === 'users' ? recentUsers : null,
                    systemStatus: type === 'all' || type === 'system' ? systemStatus : null,
                    archetypes: type === 'all' || type === 'archetypes' ? archetypeStats : null
                }
            };

            const dataStr = JSON.stringify(exportData, null, 4);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const fileName = `produs_audit_trail_${new Date().toISOString().split('T')[0]}.json`;

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', fileName);
            linkElement.click();
            
            setIsExporting(false);
            setIsExportModalOpen(false);
        }, 800);
    };

    return (
        <div className="bg-transparent text-slate-900 dark:text-slate-100 p-4 md:p-8 w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-none relative z-0"
            >
                {/* Desktop Header */}
                <header className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">System Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Welcome back, Admin. Here's what's happening today.</p>
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto">
                        <button 
                            onClick={() => setIsExportModalOpen(true)}
                            className="flex-1 md:flex-none bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 flex items-center justify-center gap-3"
                        >
                            <FileDown size={18} />
                            Export Audit Logs
                        </button>
                        <button 
                            onClick={() => mutate()} 
                            disabled={isValidating}
                            className="flex-1 md:flex-none bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50"
                        >
                            <RefreshCcw size={18} className={isValidating ? 'animate-spin' : ''} />
                            {isValidating ? 'Syncing...' : 'Neural Sync'}
                        </button>
                    </div>
                </header>

                {/* Mobile Header */}
                {activeTab === 'overview' && (
                    <div className="md:hidden mt-4 mb-8">
                        <h1 className="text-3xl font-black tracking-tight mb-1">Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Administrator Dashboard</p>
                    </div>
                )}

                {/* Mobile Navigation */}
                <MobileTabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

                {/* Desktop Tab Navigation */}
                <div className="hidden md:flex items-center gap-1 mb-8 bg-zinc-100 dark:bg-zinc-900/50 p-1.5 rounded-2xl w-fit border border-zinc-200 dark:border-white/5">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'}`}
                            >
                                <Icon size={16} strokeWidth={isActive ? 3 : 2} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Content Sections: Use conditional rendering to prevent hidden-chart errors ── */}

                {/* OVERVIEW SECTION */}
                {(activeTab === 'overview' || activeTab === 'users' || activeTab === 'health') && (
                    <div className="space-y-8 mb-12">
                        {/* We show stats on Overview and specifically requested tabs */}
                        {(activeTab === 'overview') && (
                            <AdminStats 
                                stats={stats} 
                                archetypeStats={archetypeStats} 
                                levelDistribution={levelDistribution} 
                                activeTab={activeTab} 
                            />
                        )}

                        {(activeTab === 'overview' || activeTab === 'users') && (
                            <AdminUserRegistry
                                recentUsers={recentUsers}
                                isValidating={isValidating}
                                onResetOnboarding={handleResetOnboarding}
                                onToggleAdmin={handleToggleAdmin}
                                onBulkPurge={handleBulkPurge}
                                activeTab={activeTab}
                                previewMode={activeTab === 'overview'}
                            />
                        )}

                        {(activeTab === 'overview' || activeTab === 'health') && (
                            <AdminSystemHealth systemStatus={systemStatus} activeTab={activeTab} />
                        )}
                    </div>
                )}

                {/* BUGS SECTION */}
                {(activeTab === 'bugs' || activeTab === 'overview') && (
                    <div className="w-full mb-12">
                        <AdminBugs previewMode={activeTab === 'overview'} />
                    </div>
                )}

                {/* NARRATIVE SECTION */}
                {(activeTab === 'narrative' || activeTab === 'overview') && (
                    <div className="w-full">
                        <AdminNarrativeManager previewMode={activeTab === 'overview'} />
                    </div>
                )}

            </motion.div>

            {/* Export Modal */}
            <DashboardModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                title="LOG_EXPORT_SEQUENCE_"
                subtitle="Generate Audit Trail"
            >
                <div className="space-y-8">
                    <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                <Database size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg dark:text-white">System Snapshot Export</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Download a compiled JSON archive of current platform metrics and user telemetry.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { id: 'all', label: 'Complete System Snapshot', icon: Zap, desc: 'Includes users, stats, & health' },
                                { id: 'users', label: 'User Registry Only', icon: Users, desc: 'Current user data & archetype distribution' },
                                { id: 'stats', label: 'Analytic Payload', icon: BarChart3, desc: 'Growth, sessions, & level distribution' },
                                { id: 'system', label: 'Diagnostic Logs', icon: ShieldCheck, desc: 'API health & database metrics' },
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleExportLogs(option.id)}
                                    disabled={isExporting}
                                    className="group p-5 rounded-2xl bg-white dark:bg-black/40 border border-slate-100 dark:border-white/5 hover:border-primary/50 transition-all text-left flex items-start gap-4 active:scale-[0.98]"
                                >
                                    <div className="size-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                        <option.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">{option.label}</p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{option.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-2">
                        <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Note: Data is exported in plain-text JSON format. Handle with caution.</span>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            onClick={() => setIsExportModalOpen(false)}
                            className="px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                        >
                            Cancel Override
                        </button>
                    </div>
                </div>
            </DashboardModal>
        </div>
    );
};

export default Admin;
