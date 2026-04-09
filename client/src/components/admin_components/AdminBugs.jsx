import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Reply } from 'lucide-react';
import useSWR from 'swr';
import api from '../../services/api';
import DashboardPanel from '../ui/DashboardPanel';

const AdminBugs = ({ previewMode = false }) => {
    const { data: bugs = [], mutate } = useSWR('/admin/bugs');
    const [showAll, setShowAll] = useState(false);
    const visibleBugs = previewMode && !showAll ? bugs.slice(0, 3) : bugs;
    const containerRef = useRef(null);
    const [expandedBug, setExpandedBug] = useState(null);
    const [response, setResponse] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Collapse back to preview when clicking outside the panel
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

    const handleUpdateStatus = async (id, status, adminResponse = null) => {
        setIsSubmitting(true);
        try {
            await api.patch(`/admin/bugs/${id}`, { status, adminResponse: adminResponse || undefined });
            mutate();
            if (adminResponse) {
                setResponse('');
                setExpandedBug(null);
            }
        } catch (error) {
            console.error('Failed to update bug:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getSeverityStyles = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-rose-500/20 text-rose-500 border-rose-500/30';
            case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
            case 'medium': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
            default: return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'resolved': return <CheckCircle2 size={14} className="text-emerald-500" />;
            case 'in-progress': return <Clock size={14} className="text-blue-500" />;
            default: return <AlertCircle size={14} className="text-slate-400" />;
        }
    };

    return (
        <div ref={containerRef}>
            <DashboardPanel title="BUG_REPORTS_" subtitle={`${bugs.length} Issues Pending`}>
                <div className="space-y-4">
                    {visibleBugs.length > 0 ? visibleBugs.map((bug) => (
                        <div 
                            key={bug._id} 
                            className={`border rounded-2xl transition-all ${expandedBug === bug._id ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-white/10 hover:border-slate-200 dark:hover:border-white/10 bg-white dark:bg-black/20'}`}
                        >
                            <div 
                                className="p-4 flex items-start justify-between cursor-pointer"
                                onClick={() => setExpandedBug(expandedBug === bug._id ? null : bug._id)}
                            >
                                <div className="flex gap-4">
                                    <div className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-widest h-fit mt-1 ${getSeverityStyles(bug.severity)}`}>
                                        {bug.severity}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">{bug.title}</h3>
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1">{getStatusIcon(bug.status)} {bug.status}</span>
                                            <span>•</span>
                                            <span>From {bug.user?.name || 'Unknown'}</span>
                                            <span>•</span>
                                            <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="text-slate-400">
                                    {expandedBug === bug._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>

                            <AnimatePresence>
                                {expandedBug === bug._id && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden border-t border-slate-100 dark:border-white/10"
                                    >
                                        <div className="p-6 space-y-6">
                                            <div className="bg-slate-50 dark:bg-black/40 p-4 rounded-2xl text-sm font-medium text-slate-600 dark:text-slate-300 italic">
                                                "{bug.description}"
                                            </div>

                                            {bug.adminResponse && (
                                                <div className="flex gap-3">
                                                    <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                                        <Reply size={14} className="scale-x-[-1]" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Admin Response</p>
                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{bug.adminResponse}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Actions</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <button 
                                                        onClick={() => handleUpdateStatus(bug._id, 'in-progress')}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${bug.status === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'}`}
                                                    >
                                                        In Progress
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(bug._id, 'resolved')}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${bug.status === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                                                    >
                                                        Resolve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(bug._id, 'closed')}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${bug.status === 'closed' ? 'bg-slate-500 text-white' : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20'}`}
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Send a Response</p>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={response}
                                                        onChange={(e) => setResponse(e.target.value)}
                                                        placeholder="Type your response to the user..."
                                                        className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-primary transition-all"
                                                    />
                                                    <button 
                                                        disabled={isSubmitting || !response.trim()}
                                                        onClick={() => handleUpdateStatus(bug._id, bug.status, response)}
                                                        className="bg-primary text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                                                    >
                                                        Send
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )) : (
                        <div className="py-20 text-center">
                            <div className="size-16 rounded-full bg-slate-50 dark:bg-[#000000] flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-slate-300 text-3xl">sentiment_very_satisfied</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-bold italic">No bugs reported yet. The orbit is stable!</p>
                        </div>
                    )}

                    {/* Expand / Collapse for preview mode */}
                    {previewMode && bugs.length > 3 && (
                        <button
                            onClick={() => setShowAll(v => !v)}
                            className="w-full mt-2 py-3 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all font-mono"
                        >
                            {showAll ? `Show Less` : `Show All ${bugs.length} Reports`}
                        </button>
                    )}
                </div>
            </DashboardPanel>
        </div>
    );
};

export default AdminBugs;
