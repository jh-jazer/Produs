import React, { useState, useRef, useEffect } from 'react';
import { Search, Settings, RotateCcw } from 'lucide-react';
import DashboardPanel from '../ui/DashboardPanel';

const AdminUserRegistry = ({ recentUsers, isValidating, onResetOnboarding, onToggleAdmin, activeTab, previewMode = false }) => {
    const [showAll, setShowAll] = useState(false);
    const containerRef = useRef(null);
    const visibleUsers = previewMode && !showAll ? recentUsers.slice(0, 10) : recentUsers;

    // Collapse back to preview when clicking outside
    useEffect(() => {
        if (!previewMode || !showAll) return;
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowAll(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [previewMode, showAll]);

    return (
        <div ref={containerRef} className={`w-full ${activeTab !== 'overview' && activeTab !== 'users' ? 'hidden' : ''}`}>
            <DashboardPanel
                title="USER_REGISTRY_"
                subtitle={`${recentUsers.length} Active Neural Links`}
                headerExtra={
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-primary transition-colors w-48"
                        />
                    </div>
                }
            >
                <div className="overflow-x-auto custom-scrollbar text-xs md:text-sm">
                    <table className="w-full min-w-[560px]">
                        <thead>
                            <tr className="text-left text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-white/10">
                                <th className="pb-4 font-black px-1">User</th>
                                <th className="pb-4 font-black">Role</th>
                                <th className="pb-4 font-black">Status</th>
                                <th className="pb-4 font-black hidden sm:table-cell">Joined</th>
                                <th className="pb-4 font-black"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleUsers.map((user) => (
                                <tr key={user._id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 font-black uppercase text-xs shrink-0">
                                                {user.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 dark:text-white truncate">{user.name || 'Anonymous'}</p>
                                                <p className="text-[10px] text-slate-500 font-medium truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        {user.isAdmin || user.email === 'ernestodesabillejr@gmail.com' ? (
                                            <span className="text-[9px] md:text-[10px] font-black font-mono text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-md">ADMIN</span>
                                        ) : (
                                            <span className="text-[9px] md:text-[10px] font-black font-mono text-slate-400 bg-slate-100 dark:bg-[#000000] px-2 py-0.5 rounded-md">USER</span>
                                        )}
                                    </td>
                                    <td className="py-4">
                                        <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">Active</span>
                                    </td>
                                    <td className="py-4 text-slate-500 text-[10px] font-bold hidden sm:table-cell">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => onResetOnboarding(user._id, user.name)} className="text-slate-400 hover:text-orange-500 transition-colors" title="Reset Onboarding">
                                                <RotateCcw size={15} />
                                            </button>
                                            {user.email !== 'ernestodesabillejr@gmail.com' && (
                                                <button onClick={() => onToggleAdmin(user._id, user.name, user.isAdmin)} className={`${user.isAdmin ? 'text-cyan-500 hover:text-cyan-400' : 'text-slate-400 hover:text-primary'} transition-colors`} title={user.isAdmin ? 'Demote' : 'Promote to Admin'}>
                                                    <Settings size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {visibleUsers.length === 0 && !isValidating && (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-500 italic font-medium text-sm">No users found in the galaxy.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Expand / Collapse for preview mode */}
                    {previewMode && recentUsers.length > 10 && (
                        <button
                            onClick={() => setShowAll(v => !v)}
                            className="w-full mt-4 py-3 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all font-mono"
                        >
                            {showAll ? `Show Less` : `Show All ${recentUsers.length} Users`}
                        </button>
                    )}
                </div>
            </DashboardPanel>
        </div>
    );
};

export default AdminUserRegistry;
