import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Reply, Activity } from 'lucide-react';
import useSWR from 'swr';
import api from '../../services/api';

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

const AdminBugs = ({ previewMode = false }) => {
    const { data: bugs = [], mutate } = useSWR('/admin/bugs');
    const [showAll, setShowAll] = useState(false);
    const visibleBugs = previewMode && !showAll ? bugs.slice(0, 3) : bugs;
    const containerRef = useRef(null);
    const [expandedBug, setExpandedBug] = useState(null);
    const [response, setResponse] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            case 'critical': return 'bg-rose-500 text-white border-rose-500';
            case 'high': return 'bg-orange-500 text-white border-orange-500';
            case 'medium': return 'bg-amber-500 text-white border-amber-500';
            default: return 'bg-blue-500 text-white border-blue-500';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'resolved': return <CheckCircle2 size={12} className="text-emerald-500" />;
            case 'in-progress': return <Clock size={12} className="text-blue-500" />;
            default: return <AlertCircle size={12} className="text-foreground/40" />;
        }
    };

    return (
        <div ref={containerRef}>
            <HUDPanel title="BUG_REPORTS_" subtitle={`${bugs.length} Issues Pending`}>
                <div className="space-y-4">
                    {visibleBugs.length > 0 ? visibleBugs.map((bug) => (
                        <div 
                            key={bug._id} 
                            className={`relative group bg-foreground/[0.03] border border-foreground/5 p-5 rounded-none overflow-hidden transition-all ${expandedBug === bug._id ? 'border-foreground/20 bg-foreground/[0.05]' : 'hover:border-foreground/10'}`}
                        >
                            <div 
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => setExpandedBug(expandedBug === bug._id ? null : bug._id)}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`size-8 shrink-0 flex items-center justify-center font-black font-mono text-[9px] border rounded-sm ${getSeverityStyles(bug.severity)}`}>
                                        {bug.severity.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-[10px] uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
                                            {bug.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 text-[8px] font-black uppercase tracking-widest text-foreground/40 font-mono">
                                            <span className="flex items-center gap-1">{getStatusIcon(bug.status)} {bug.status}</span>
                                            <span>•</span>
                                            <span>From {bug.user?.name || 'Unknown'}</span>
                                            <span>•</span>
                                            <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {expandedBug === bug._id ? <ChevronUp size={16} className="text-foreground/20" /> : <ChevronDown size={16} className="text-foreground/20" />}
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedBug === bug._id && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-6 pt-6 border-t border-foreground/5"
                                    >
                                        <div className="space-y-8">
                                            <div className="bg-foreground/[0.02] p-5 rounded-none border border-foreground/5 italic">
                                                <p className="text-xs font-bold text-foreground/60 leading-relaxed">
                                                    "{bug.description}"
                                                </p>
                                            </div>

                                            {bug.adminResponse && (
                                                <div className="flex gap-4 p-5 rounded-none bg-foreground/5 border border-foreground/10">
                                                    <div className="size-8 rounded-sm bg-foreground text-background flex items-center justify-center shrink-0">
                                                        <Reply size={14} className="scale-x-[-1]" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                                            SYSTEM_FEEDBACK_
                                                        </p>
                                                        <p className="text-[11px] font-bold text-foreground/80 leading-relaxed">{bug.adminResponse}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Protocol Status_</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['in-progress', 'resolved', 'closed'].map(status => (
                                                            <button 
                                                                key={status}
                                                                onClick={() => handleUpdateStatus(bug._id, status)}
                                                                className={`px-3 py-1.5 rounded-none text-[8px] font-black uppercase tracking-widest transition-all ${bug.status === status ? 'bg-foreground text-background' : 'bg-foreground/5 text-foreground/40 hover:bg-foreground/10 border border-foreground/10'}`}
                                                            >
                                                                {status}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Transmit Response_</label>
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            value={response}
                                                            onChange={(e) => setResponse(e.target.value)}
                                                            placeholder="Type neural feedback..."
                                                            className="flex-1 bg-foreground/[0.03] border-b border-foreground/10 rounded-none px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-foreground/40 transition-all"
                                                        />
                                                        <button 
                                                            disabled={isSubmitting || !response.trim()}
                                                            onClick={() => handleUpdateStatus(bug._id, bug.status, response)}
                                                            className="bg-foreground text-background px-4 py-2 rounded-none font-black text-[8px] uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                                                        >
                                                            Send
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    )) : (
                        <div className="py-20 text-center border border-dashed border-foreground/10">
                            <p className="text-foreground/40 font-black text-[10px] uppercase tracking-[0.4em]">NO_ISSUES_REPORTED_</p>
                        </div>
                    )}

                    {previewMode && bugs.length > 3 && (
                        <button
                            onClick={() => setShowAll(v => !v)}
                            className="w-full mt-4 py-4 border border-dashed border-foreground/10 text-[9px] font-black uppercase tracking-[0.4em] text-foreground/40 hover:text-foreground hover:border-foreground/20 transition-all font-mono"
                        >
                            {showAll ? `TERMINATE_OVERRIDE_` : `INITIATE_FULL_REGISTRY_ACCESS_ (${bugs.length})`}
                        </button>
                    )}
                </div>
            </HUDPanel>
        </div>
    );
};

export default AdminBugs;
