import React, { useState, useRef, useEffect } from 'react';
import { Search, Settings, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import DashboardPanel from '../ui/DashboardPanel';
import ConfirmDialog from '../ui/ConfirmDialog';

const ChippedBorder = ({ opacity = 0.8 }) => (
  <div 
    className="absolute inset-[-2px] rounded-sm pointer-events-none z-0"
    style={{
      border: '4px solid currentColor',
      opacity,
      clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
    }}
  />
);

const HUDPanel = ({ title, subtitle, children, headerExtra, className = "" }) => (
  <div className={`relative bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all p-8 rounded-sm group overflow-hidden ${className}`}>
    <ChippedBorder opacity={0.6} />
    <div className="relative z-10">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/40">{title}</span>
          {subtitle && <span className="text-[8px] font-mono uppercase tracking-widest opacity-20">{subtitle}</span>}
        </div>
        {headerExtra && <div className="flex gap-2">{headerExtra}</div>}
      </div>
      {children}
    </div>
  </div>
);

const AdminUserRegistry = ({ recentUsers, isValidating, onResetOnboarding, onToggleAdmin, onBulkPurge, activeTab, previewMode = false }) => {
    const [showAll, setShowAll] = useState(false);
    const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = useState(false);
    const containerRef = useRef(null);
    const visibleUsers = previewMode && !showAll ? recentUsers.slice(0, 10) : recentUsers;

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
            <HUDPanel
                title="USER_REGISTRY_"
                subtitle={`${recentUsers.length} Active Neural Links`}
                headerExtra={
                    recentUsers.length > 1 && (
                        <button 
                            onClick={() => setIsPurgeConfirmOpen(true)}
                            className="bg-rose-500/10 text-rose-500 px-3 py-1.5 rounded-sm font-black text-[8px] uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                        >
                            INITIATE_PURGE_
                        </button>
                    )
                }
            >
                {/* Search / Filter */}
                <div className="mb-8 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 size-3 group-focus-within:text-foreground transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Identity Registry..."
                        className="bg-foreground/[0.03] border-b border-foreground/10 rounded-none pl-11 pr-4 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none transition-all w-full focus:border-foreground/40"
                    />
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-4">
                    {visibleUsers.map((user) => (
                        <div key={user._id} className="relative bg-foreground/[0.03] border border-foreground/5 p-5 rounded-none overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <div className="size-8 bg-foreground text-background flex items-center justify-center font-black text-[10px] uppercase rounded-sm">
                                        {user.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-black text-xs uppercase tracking-tighter">{user.name || 'Anonymous'}</p>
                                        <p className="text-[8px] font-mono opacity-40 uppercase truncate max-w-[120px]">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[8px] font-black font-mono px-1.5 py-0.5 rounded-none bg-foreground/10 opacity-60">LVL.{user.level ?? 0}</span>
                                    {user.isAdmin && <span className="text-[8px] font-black font-mono px-1.5 py-0.5 bg-foreground text-background">ADMIN</span>}
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-4 border-t border-foreground/5">
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-20">DATA_LINK_ACTIVE</span>
                                <div className="flex gap-4">
                                    <button onClick={() => onResetOnboarding(user._id, user.name)} className="text-foreground/20 hover:text-foreground transition-colors">
                                        <RotateCcw size={12} />
                                    </button>
                                    {user.email !== 'ernestodesabillejr@gmail.com' && (
                                        <button onClick={() => onToggleAdmin(user._id, user.name, user.isAdmin)} className="text-foreground/20 hover:text-foreground transition-colors">
                                            <Settings size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-center text-foreground/20 text-[9px] uppercase font-black tracking-[0.3em] border-b border-foreground/5">
                                <th className="pb-4 text-left px-2">Identity</th>
                                <th className="pb-4">Role</th>
                                <th className="pb-4">Level</th>
                                <th className="pb-4">Path</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 text-right px-2">Protocols</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleUsers.map((user) => (
                                <tr key={user._id} className="border-b border-foreground/[0.02] hover:bg-foreground/[0.02] transition-colors group">
                                    <td className="py-4 px-2">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 bg-foreground/[0.05] border border-foreground/10 text-foreground flex items-center justify-center font-black uppercase text-[10px] rounded-sm group-hover:bg-foreground group-hover:text-background transition-colors">
                                                {user.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-black text-[10px] uppercase tracking-widest">{user.name || 'Anonymous'}</p>
                                                <p className="text-[8px] font-mono opacity-30 uppercase tracking-widest">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className={`text-[8px] font-black font-mono px-2 py-0.5 rounded-none ${user.isAdmin ? 'bg-foreground text-background' : 'bg-foreground/5 opacity-40'}`}>
                                            {user.isAdmin ? 'ADMIN' : 'USER'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="text-[10px] font-black font-mono">LVL.{user.level ?? 0}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="text-[9px] font-black font-mono uppercase opacity-40">{user.rpg?.path || '—'}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 opacity-60">Synced</span>
                                    </td>
                                    <td className="py-4 px-2 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onResetOnboarding(user._id, user.name)} className="hover:text-foreground transition-colors" title="Reset_Onboarding">
                                                <RotateCcw size={14} />
                                            </button>
                                            {user.email !== 'ernestodesabillejr@gmail.com' && (
                                                <button onClick={() => onToggleAdmin(user._id, user.name, user.isAdmin)} className="hover:text-foreground transition-colors" title="Toggle_Admin">
                                                    <Settings size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination / Show All */}
                {previewMode && recentUsers.length > 10 && (
                    <button
                        onClick={() => setShowAll(v => !v)}
                        className="w-full mt-8 py-4 border border-dashed border-foreground/10 text-[9px] font-black uppercase tracking-[0.4em] text-foreground/40 hover:text-foreground hover:border-foreground/20 transition-all font-mono"
                    >
                        {showAll ? `TERMINATE_OVERRIDE_` : `INITIATE_FULL_REGISTRY_ACCESS_ (${recentUsers.length})`}
                    </button>
                )}
            </HUDPanel>

            <ConfirmDialog
                isOpen={isPurgeConfirmOpen}
                onClose={() => setIsPurgeConfirmOpen(false)}
                onConfirm={() => {
                    setIsPurgeConfirmOpen(false);
                    onBulkPurge();
                }}
                title="INITIATE_SYSTEM_PURGE_"
                message={`This will permanently delete all ${recentUsers.length - 1} users and all their associated data. Only you and the developer will remain. This action is irreversible.`}
                confirmText="CONFIRM_PURGE_"
                type="danger"
            />
        </div>
    );
};

export default AdminUserRegistry;
