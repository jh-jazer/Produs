import React from 'react';
import { ShieldCheck } from 'lucide-react';
import DashboardPanel from '../ui/DashboardPanel';

const AdminSystemHealth = ({ systemStatus, activeTab }) => {
    return (
        <div className={`w-full space-y-6 ${activeTab !== 'overview' && activeTab !== 'health' ? 'hidden' : ''}`}>
            <DashboardPanel title="SYSTEM_HEALTH_" subtitle="Core Diagnostics & Deployment Status">
                <div className="space-y-3">
                    {systemStatus.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/10">
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{item.label}</span>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${item.color} animate-pulse`} />
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.status}</span>
                            </div>
                        </div>
                    ))}

                    {/* Divider */}
                    <div className="border-t border-slate-100 dark:border-white/10 pt-4 mt-2">
                        <div className="flex items-start gap-3">
                            <div className="size-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                <ShieldCheck size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-slate-900 dark:text-white text-sm mb-0.5">Platform Status</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">Version 1.0.9 is deployed as the active production release.</p>
                            </div>
                        </div>
                        <button className="w-full mt-4 bg-primary text-white py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20">
                            View Platform Status
                        </button>
                    </div>
                </div>
            </DashboardPanel>
        </div>
    );
};

export default AdminSystemHealth;
