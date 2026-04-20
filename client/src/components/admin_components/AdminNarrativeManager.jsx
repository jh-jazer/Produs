import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Plus, Save, Trash2, Activity, Zap, MessageSquare, ChevronDown, ChevronUp, RefreshCw, FileJson, Download, X } from 'lucide-react';
import useSWR from 'swr';
import api from '../../services/api';
import DashboardPanel from '../ui/DashboardPanel';
import DashboardModal from '../ui/DashboardModal';

const compareDecimalIds = (a, b) => {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const valA = partsA[i] || 0;
        const valB = partsB[i] || 0;
        if (valA !== valB) return valA - valB;
    }
    return 0;
};

const AdminNarrativeManager = ({ previewMode = false }) => {
    const { data: rawQuestions = [], mutate, isValidating } = useSWR('/admin/narrative');
    const questions = React.useMemo(() => {
        return [...rawQuestions].sort((a, b) => compareDecimalIds(a.questionId, b.questionId));
    }, [rawQuestions]);
    const [showAll, setShowAll] = useState(false);
    const visibleQuestions = previewMode && !showAll ? questions.slice(0, 3) : questions;
    const containerRef = useRef(null);

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
    
    const [expandedId, setExpandedId] = useState(null);
    const [editingNode, setEditingNode] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkJson, setBulkJson] = useState('');
    const [importStatus, setImportStatus] = useState({ type: '', message: '' });
    const [validationErrors, setValidationErrors] = useState([]);

    const validateNeuralJson = (jsonStr) => {
        try {
            const data = JSON.parse(jsonStr);
            if (!Array.isArray(data)) return ["Payload must be a JSON Array [...]"];
            
            const errors = [];
            const newIds = data.map(n => n.questionId);
            const allIds = [...new Set([...questions.map(q => q.questionId), ...newIds])];

            data.forEach(node => {
                if (!node.questionId) errors.push(`Missing questionId in a node.`);
                node.options?.forEach((opt, idx) => {
                    if (opt.nextId && !allIds.includes(String(opt.nextId).trim())) {
                        errors.push(`Node [${node.questionId}] -> Option ${idx + 1}: Points to missing ID [${opt.nextId}]`);
                    }
                    if (!opt.text) errors.push(`Node [${node.questionId}] -> Option ${idx + 1}: Missing text.`);
                });
            });
            return errors;
        } catch (e) {
            return ["Invalid JSON Syntax."];
        }
    };

    React.useEffect(() => {
        if (bulkJson) {
            const errs = validateNeuralJson(bulkJson);
            setValidationErrors(errs);
        } else {
            setValidationErrors([]);
        }
    }, [bulkJson, questions]);

    const handleSave = async (node) => {
        setIsSaving(true);
        try {
            await api.post('/admin/narrative', node);
            mutate();
            setEditingNode(null);
            setExpandedId(node.questionId);
        } catch (error) {
            console.error('Failed to save narrative node:', error);
            alert('Save failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (questionId) => {
        if (!window.confirm(`Delete question ${questionId}? This may break branching paths.`)) return;
        try {
            await api.delete(`/admin/narrative/${questionId}`);
            mutate();
            setExpandedId(null);
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm("WARNING: You are about to DELETE ALL narrative questions. This action is IRREVERSIBLE. Proceed?")) return;
        if (!window.confirm("FINAL SYNC CHECK: Are you ABSOLUTELY sure? This will purge the entire narrative database.")) return;
        
        try {
            await api.delete('/admin/narrative');
            mutate();
            alert("All neural synapses have been purged from the core.");
        } catch (error) {
            console.error('Purge failed:', error);
            alert("System error during database purge.");
        }
    };

    const handleSeed = async () => {
        if (!window.confirm('Seed narrative questions from defaults? This will overwrite or add to existing questions.')) return;
        try {
            await api.post('/admin/narrative/seed');
            mutate();
            alert('Seed completed successfully.');
        } catch (error) {
            console.error('Seed failed:', error);
        }
    };

    const handleBulkImport = async () => {
        setIsSaving(true);
        setImportStatus({ type: 'info', message: 'Initiating Neural Synthesis...' });
        try {
            const payload = JSON.parse(bulkJson);
            const { data } = await api.post('/admin/narrative/bulk', payload);
            setImportStatus({ type: 'success', message: data.message });
            mutate();
            setTimeout(() => {
                setIsBulkModalOpen(false);
                setImportStatus({ type: '', message: '' });
                setBulkJson('');
            }, 3000);
        } catch (error) {
            console.error('Bulk import failed:', error);
            setImportStatus({ 
                type: 'error', 
                message: error.response?.data?.message || error.message || 'JSON synthesis failed.' 
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadJson = () => {
        const dataStr = JSON.stringify(questions, null, 4);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'narrative_nodes.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const startEditing = (q) => {
        setEditingNode({ ...q, originalId: q.questionId });
        setExpandedId(q.questionId);
    };

    const addNewQuestion = () => {
        // Calculate the highest current ID to suggest the next logical number
        const lastId = questions.length > 0 ? 
            Math.max(...questions.map(q => parseFloat(q.questionId) || 0)) : 0;
            
        let newQuestionId = (Math.floor(lastId) + 1).toFixed(1);
        let defaultNextId = (Math.floor(lastId) + 2).toFixed(1);
        let parentSection = 'PATH';
        
        // Context-aware branching: If a node is expanded, attempt to create a child/branch
        if (expandedId) {
            const parent = questions.find(q => q.questionId === expandedId);
            if (parent) {
                parentSection = parent.section;
                const parentBase = parseFloat(parent.questionId);
                const children = questions.filter(q => q.questionId.startsWith(Math.floor(parentBase) + "."));
                
                // If we're branching 1.0 -> 1.1, 1.2 etc
                if (parent.questionId.endsWith(".0")) {
                    newQuestionId = (parentBase + 0.1).toFixed(1);
                    defaultNextId = (parentBase + 0.2).toFixed(1);
                } else {
                    // Deep nesting (e.g. 1.1 -> 1.1.1)
                    newQuestionId = `${parent.questionId}.1`;
                    defaultNextId = `${parent.questionId}.2`;
                }
            }
        }

        const newNode = {
            questionId: newQuestionId,
            title: 'New Neural Synapse',
            section: parentSection,
            type: 'WHY',
            weight: 1.0,
            story: '',
            question: 'New Title',
            options: [
                { text: 'Option A', value: 'Strategist', postText: '', nextId: defaultNextId },
                { text: 'Option B', value: 'Visionary', postText: '', nextId: defaultNextId },
                { text: 'Option C', value: 'Warden', postText: '', nextId: defaultNextId },
                { text: 'Option D', value: 'Scout', postText: '', nextId: defaultNextId }
            ]
        };
        setEditingNode(newNode);
        setExpandedId(newQuestionId);
    };

    return (
        <div ref={containerRef} className="relative space-y-4">
            <DashboardPanel
                title="NARRATIVE_MANAGER_"
                subtitle={`${questions.length} Story Nodes Active`}
            >
                <div className="flex flex-nowrap items-center gap-2 md:gap-3 mb-8 relative z-[70] w-full overflow-x-auto pb-2 custom-scrollbar-mini">
                    <button 
                        onClick={() => setIsBulkModalOpen(true)}
                        className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 cursor-pointer active:scale-95 shrink-0"
                        title="Bulk JSON Import"
                    >
                        <FileJson size={20} />
                    </button>
                    <button 
                        onClick={handleDownloadJson}
                        className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 shrink-0"
                        title="Export JSON"
                    >
                        <Download size={20} />
                    </button>
                    <button 
                        onClick={handleSeed}
                        className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 shrink-0"
                        title="Seed Defaults"
                    >
                        <RefreshCw size={20} className={isValidating ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={handleDeleteAll}
                        className="p-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-transparent hover:border-white/10 shrink-0"
                        title="Purge All Questions"
                    >
                        <Trash2 size={20} />
                    </button>
                    <button 
                        onClick={addNewQuestion}
                        className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 shrink-0 ml-auto md:ml-0"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Create Node</span>
                        <span className="sm:hidden">Create</span>
                    </button>
                </div>

            <div className="grid grid-cols-1 gap-4">
                {/* New Node (Unsaved) Block */}
                {editingNode && !questions.find(q => q.questionId === editingNode.questionId) && (
                    <div className="border border-accent border-dashed rounded-[2rem] bg-accent/5 p-8 space-y-8 animate-pulse-slow">
                        <div className="flex items-center gap-4 mb-2">
                            <input 
                                value={editingNode.questionId}
                                onChange={(e) => setEditingNode({ ...editingNode, questionId: e.target.value })}
                                className="size-12 w-24 rounded-xl bg-accent text-white flex items-center justify-center font-black font-mono text-center text-xs focus:outline-none focus:ring-2 ring-white/20"
                                placeholder="1.0"
                            />
                            <h3 className="font-bold text-accent uppercase tracking-tight font-exo italic text-lg">Creating New Story Node...</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Title</label>
                                    <input 
                                        type="text"
                                        value={editingNode.title || ""}
                                        onChange={(e) => setEditingNode({ ...editingNode, title: e.target.value, question: e.target.value })}
                                        placeholder="e.g. The First Connection"
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-accent transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Narrative Prose (Story)</label>
                                    <textarea 
                                        value={editingNode.story}
                                        onChange={(e) => setEditingNode({ ...editingNode, story: e.target.value })}
                                        placeholder="Narrative prose establishing the scene..."
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-sm font-medium focus:outline-none focus:border-accent transition-all min-h-[160px] leading-relaxed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Section</label>
                                        <select 
                                            value={editingNode.section}
                                            onChange={(e) => setEditingNode({ ...editingNode, section: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none font-mono"
                                        >
                                            {['PATH', 'TIER1', 'STYLE', 'ALIGNMENT', 'TRIAL'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Type</label>
                                        <select 
                                            value={editingNode.type}
                                            onChange={(e) => setEditingNode({ ...editingNode, type: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none font-mono"
                                        >
                                            <option value="WHY">WHY (1.0)</option>
                                            <option value="ACTION">ACTION (2.0)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Weight</label>
                                        <input 
                                            type="number"
                                            step="0.1"
                                            value={editingNode.weight}
                                            onChange={(e) => setEditingNode({ ...editingNode, weight: parseFloat(e.target.value) })}
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Choice Options (Branching)</label>
                                    <div className="space-y-3">
                                        {editingNode.options.map((opt, idx) => (
                                            <div key={idx} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 bg-white dark:bg-black/40 p-3 rounded-2xl border border-slate-100 dark:border-white/5 transition-all focus-within:border-accent/40">
                                                <div className="col-span-12 space-y-2 mt-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Post-Choice Narrative (Optional)</label>
                                                    <input 
                                                        placeholder="Narrative feedback shown after choosing this branch..."
                                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-xl px-4 py-2 text-xs font-medium italic focus:outline-none focus:border-accent transition-all"
                                                        value={opt.postText || ""}
                                                        onChange={(e) => {
                                                            const newOpts = [...editingNode.options];
                                                            newOpts[idx].postText = e.target.value;
                                                            setEditingNode({ ...editingNode, options: newOpts });
                                                        }}
                                                    />
                                                </div>
                                                <input 
                                                    placeholder="Option Text"
                                                    className="col-span-12 sm:col-span-6 bg-transparent text-sm font-bold focus:outline-none px-2 py-1"
                                                    value={opt.text}
                                                    onChange={(e) => {
                                                        const newOpts = [...editingNode.options];
                                                        newOpts[idx].text = e.target.value;
                                                        setEditingNode({ ...editingNode, options: newOpts });
                                                    }}
                                                />
                                                {editingNode.section === 'PATH' ? (
                                                    <select 
                                                        className="col-span-12 sm:col-span-3 bg-transparent text-xs font-mono text-slate-500 focus:outline-none border-y sm:border-y-0 sm:border-x border-slate-100 dark:border-white/10 px-2 py-1"
                                                        value={opt.value}
                                                        onChange={(e) => {
                                                            const newOpts = [...editingNode.options];
                                                            newOpts[idx].value = e.target.value;
                                                            setEditingNode({ ...editingNode, options: newOpts });
                                                        }}
                                                    >
                                                        {['Strategist', 'Visionary', 'Warden', 'Scout'].map(p => (
                                                            <option key={p} value={p}>{p}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input 
                                                        placeholder="Value"
                                                        className="col-span-12 sm:col-span-3 bg-transparent text-xs font-mono text-slate-500 focus:outline-none border-y sm:border-y-0 sm:border-x border-slate-100 dark:border-white/10 px-2 py-1"
                                                        value={opt.value}
                                                        onChange={(e) => {
                                                            const newOpts = [...editingNode.options];
                                                            newOpts[idx].value = e.target.value;
                                                            setEditingNode({ ...editingNode, options: newOpts });
                                                        }}
                                                    />
                                                )}
                                                <div className="col-span-12 sm:col-span-3 flex items-center gap-1 px-2 py-1">
                                                    <Zap size={10} className="text-slate-400" />
                                                    <input 
                                                        placeholder="NextID"
                                                        className="w-full bg-transparent text-xs font-mono text-accent focus:outline-none"
                                                        value={opt.nextId}
                                                        onChange={(e) => {
                                                            const newOpts = [...editingNode.options];
                                                            newOpts[idx].nextId = e.target.value;
                                                            setEditingNode({ ...editingNode, options: newOpts });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-white/10">
                            <button 
                                onClick={() => setEditingNode(null)}
                                className="px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:hover:text-white transition-all"
                            >
                                Discard Node
                            </button>
                                <button 
                                    disabled={isSaving}
                                    onClick={() => handleSave(editingNode)}
                                    className="bg-accent text-white px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Save size={16} />
                                    Save Node
                                </button>
                        </div>
                    </div>
                )}

                {visibleQuestions.map((q) => (
                    <div 
                        key={q.questionId}
                        className={`group border rounded-[2rem] transition-all bg-white dark:bg-[#121212]/30 backdrop-blur-md overflow-hidden ${expandedId === q.questionId ? 'border-accent shadow-[0_0_30px_rgba(var(--accent-rgb),0.1)]' : 'border-slate-100 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}`}
                    >
                        <div 
                            className="p-3 md:p-6 flex items-center justify-between cursor-pointer"
                            onClick={() => setExpandedId(expandedId === q.questionId ? null : q.questionId)}
                        >
                            <div className="flex items-center gap-3 md:gap-5">
                                <div 
                                    className={`size-8 md:size-10 shrink-0 rounded-lg md:rounded-xl flex items-center justify-center font-black font-mono text-[9px] md:text-[10px] ${q.type === 'ACTION' ? 'bg-accent text-white shadow-[0_0_15px_rgba(var(--accent-rgb),0.4)]' : 'bg-slate-100 dark:bg-[#000000] text-slate-400'}`}
                                    style={{ marginLeft: `${Math.min((q.questionId.split('.').length - 1) * (typeof window !== 'undefined' && window.innerWidth < 640 ? 8 : 20), 60)}px` }}
                                >
                                    {q.questionId}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight font-exo italic text-base md:text-lg">
                                        {q.title || q.question}
                                        {q.questionId.split('.').length > 1 && (
                                            <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-[8px] opacity-70">
                                                DEPTH_{q.questionId.split('.').length - 1}
                                            </span>
                                        )}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                                        <span className="flex items-center gap-1"><Activity size={10} /> {q.section}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Zap size={10} /> Weight {q.weight}</span>
                                        {q.story && <span>•</span>}
                                        {q.story && <span className="flex items-center gap-1"><MessageSquare size={10} /> Story Case Active</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {expandedId === q.questionId ? <ChevronUp size={20} className="text-slate-300" /> : <ChevronDown size={20} className="text-slate-300" />}
                            </div>
                        </div>

                        <AnimatePresence>
                            {expandedId === q.questionId && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-slate-100 dark:border-white/10"
                                >
                                    {editingNode && editingNode.questionId === q.questionId ? (
                                        <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50 dark:bg-black/40">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Title</label>
                                                        <input 
                                                            type="text"
                                                            value={editingNode.title || ""}
                                                            onChange={(e) => setEditingNode({ ...editingNode, title: e.target.value, question: e.target.value })}
                                                            placeholder="e.g. The Crossroads"
                                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-accent transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Narrative Prose (Story)</label>
                                                        <textarea 
                                                            value={editingNode.story}
                                                            onChange={(e) => setEditingNode({ ...editingNode, story: e.target.value })}
                                                            placeholder="Narrative prose establishing the scene..."
                                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-sm font-medium focus:outline-none focus:border-accent transition-all min-h-[160px] leading-relaxed"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-accent px-1 flex items-center gap-2">
                                                            Node ID (Coordinates)
                                                            {editingNode.originalId && editingNode.originalId !== editingNode.questionId && (
                                                                <span className="text-[8px] bg-accent/20 px-1.5 py-0.5 rounded animate-pulse">RENAME_CASCADE_PENDING</span>
                                                            )}
                                                        </label>
                                                        <input 
                                                            type="text"
                                                            value={editingNode.questionId}
                                                            onChange={(e) => setEditingNode({ ...editingNode, questionId: e.target.value })}
                                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-2 text-xs font-black font-mono focus:outline-none focus:border-accent transition-all mb-4"
                                                            placeholder="e.g. 1.1"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Section</label>
                                                            <select 
                                                                value={editingNode.section}
                                                                onChange={(e) => setEditingNode({ ...editingNode, section: e.target.value })}
                                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none font-mono"
                                                            >
                                                                {['PATH', 'TIER1', 'STYLE', 'ALIGNMENT', 'TRIAL'].map(s => <option key={s} value={s}>{s}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Type</label>
                                                            <select 
                                                                value={editingNode.type}
                                                                onChange={(e) => setEditingNode({ ...editingNode, type: e.target.value })}
                                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none font-mono"
                                                            >
                                                                <option value="WHY">WHY (1.0)</option>
                                                                <option value="ACTION">ACTION (2.0)</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Weight</label>
                                                            <input 
                                                                type="number"
                                                                step="0.1"
                                                                value={editingNode.weight}
                                                                onChange={(e) => setEditingNode({ ...editingNode, weight: parseFloat(e.target.value) })}
                                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none font-mono"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Adaptive Branches (Options)</label>
                                                        <div className="space-y-3">
                                                            {editingNode.options.map((opt, idx) => (
                                                                <div key={idx} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 bg-white dark:bg-black/40 p-3 rounded-2xl border border-slate-100 dark:border-white/5 transition-all focus-within:border-accent/40">
                                                                    <div className="col-span-12 space-y-2 mt-2">
                                                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Post-Choice Narrative (Optional)</label>
                                                                        <input 
                                                                            placeholder="Narrative feedback shown after choosing this branch..."
                                                                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-xl px-4 py-2 text-xs font-medium italic focus:outline-none focus:border-accent transition-all"
                                                                            value={opt.postText || ""}
                                                                            onChange={(e) => {
                                                                                const newOpts = [...editingNode.options];
                                                                                newOpts[idx].postText = e.target.value;
                                                                                setEditingNode({ ...editingNode, options: newOpts });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <input 
                                                                        placeholder="Option Text"
                                                                        className="col-span-12 sm:col-span-6 bg-transparent text-sm font-bold focus:outline-none px-2 py-1"
                                                                        value={opt.text}
                                                                        onChange={(e) => {
                                                                            const newOpts = [...editingNode.options];
                                                                            newOpts[idx].text = e.target.value;
                                                                            setEditingNode({ ...editingNode, options: newOpts });
                                                                        }}
                                                                    />
                                                                    {editingNode.section === 'PATH' ? (
                                                                        <select 
                                                                            className="col-span-12 sm:col-span-3 bg-transparent text-xs font-mono text-accent focus:outline-none border-y sm:border-y-0 sm:border-x border-slate-100 dark:border-white/10 px-2 py-1"
                                                                            value={opt.value}
                                                                            onChange={(e) => {
                                                                                const newOpts = [...editingNode.options];
                                                                                newOpts[idx].value = e.target.value;
                                                                                setEditingNode({ ...editingNode, options: newOpts });
                                                                            }}
                                                                        >
                                                                            {['Strategist', 'Visionary', 'Warden', 'Scout'].map(p => (
                                                                                <option key={p} value={p}>{p}</option>
                                                                            ))}
                                                                        </select>
                                                                    ) : (
                                                                        <input 
                                                                            placeholder="Value"
                                                                            className="col-span-12 sm:col-span-3 bg-transparent text-xs font-mono text-slate-500 focus:outline-none border-y sm:border-y-0 sm:border-x border-slate-100 dark:border-white/10 px-2 py-1"
                                                                            value={opt.value}
                                                                            onChange={(e) => {
                                                                                const newOpts = [...editingNode.options];
                                                                                newOpts[idx].value = e.target.value;
                                                                                setEditingNode({ ...editingNode, options: newOpts });
                                                                            }}
                                                                        />
                                                                    )}
                                                                    <div className="col-span-12 sm:col-span-3 flex items-center gap-1 px-2 py-1">
                                                                        <Zap size={10} className="text-slate-400" />
                                                                        <input 
                                                                            placeholder="NextID"
                                                                            className="w-full bg-transparent text-xs font-mono text-accent focus:outline-none"
                                                                            value={opt.nextId}
                                                                            onChange={(e) => {
                                                                                const newOpts = [...editingNode.options];
                                                                                newOpts[idx].nextId = e.target.value;
                                                                                setEditingNode({ ...editingNode, options: newOpts });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-nowrap justify-end gap-4 md:gap-6 pt-6 border-t border-slate-200 dark:border-white/10">
                                                <button 
                                                    onClick={() => setEditingNode(null)}
                                                    className="px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:hover:text-white transition-all whitespace-nowrap"
                                                >
                                                    Discard
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(editingNode.questionId)}
                                                    className="p-2.5 rounded-xl text-orange-500 hover:bg-orange-500/10 transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest whitespace-nowrap"
                                                >
                                                    <Trash2 size={16} />
                                                    <span className="hidden sm:inline">Delete Node</span>
                                                    <span className="sm:hidden">Delete</span>
                                                </button>
                                                <button 
                                                    disabled={isSaving}
                                                    onClick={() => handleSave(editingNode)}
                                                    className="bg-accent text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                                                >
                                                    <Save size={16} />
                                                    <span className="hidden sm:inline">Update Node</span>
                                                    <span className="sm:hidden">Update</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 md:p-8 space-y-6">
                                            {q.story && (
                                                <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-[1.5rem] border border-slate-100 dark:border-white/5">
                                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                                        "{q.story}"
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Branching Paths</label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    {q.options.map((opt, idx) => (
                                                        <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-black/40 border border-slate-100 dark:border-white/5 flex flex-col justify-between">
                                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">{opt.text}</p>
                                                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50 dark:border-white/5">
                                                                <span className="text-[9px] font-black font-mono text-slate-400">{opt.value}</span>
                                                                <span className="text-[9px] font-black font-mono text-accent flex items-center gap-1">
                                                                    <Zap size={8} /> {opt.nextId || 'END'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-nowrap justify-end gap-6 pt-4">
                                                    <button 
                                                        onClick={() => handleDelete(q.questionId)}
                                                        className="group flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all hover:underline underline-offset-8 whitespace-nowrap"
                                                    >
                                                        <Trash2 size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                                        Delete Node
                                                    </button>
                                                    <button 
                                                        onClick={() => startEditing(q)}
                                                        className="group flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-white transition-all hover:underline underline-offset-8 whitespace-nowrap"
                                                    >
                                                        <Plus size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                                        Edit Story Node
                                                    </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}

                {questions.length === 0 && !isValidating && (
                    <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem]">
                        <Brain size={48} className="mx-auto mb-4 text-slate-200 dark:text-white/10" />
                        <p className="text-slate-500 font-bold italic mb-6">The narrative repository is currently offline.</p>
                        <button onClick={handleSeed} className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">Restore Default Nodes</button>
                    </div>
                )}

                {/* Expand / Collapse for preview mode */}
                {previewMode && questions.length > 3 && (
                    <button
                        onClick={() => setShowAll(v => !v)}
                        className="w-full mt-2 py-3 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all"
                    >
                        {showAll ? `Show Less` : `Show All ${questions.length} Nodes`}
                    </button>
                )}
                </div>
            </DashboardPanel>

            {/* Bulk Import Modal */}
            {/* Bulk Import Modal */}
            <DashboardModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                title="PROMPT_IMPORT_SEQUENCE_"
                subtitle="Bulk Neural Import"
                headerExtra={
                    validationErrors.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="hidden lg:flex items-center gap-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3"
                        >
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">
                                    <Activity size={10} className="animate-pulse" />
                                    <span>Integrity Failure_</span>
                                </div>
                                <div className="max-h-[40px] overflow-y-auto pr-2 custom-scrollbar-mini">
                                    {validationErrors.map((err, i) => (
                                        <p key={i} className="text-[9px] font-bold text-rose-500/80 font-mono leading-tight truncate max-w-[200px]" title={err}>
                                            {err}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )
                }
            >
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Payload_</h4>
                                <span className="text-[9px] font-mono text-cyan-500/60 uppercase">Ready for synthesis</span>
                            </div>
                            <textarea 
                                value={bulkJson}
                                onChange={(e) => setBulkJson(e.target.value)}
                                placeholder="Paste your JSON array of nodes here..."
                                className="w-full h-[320px] bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-3xl p-6 text-xs font-mono focus:outline-none focus:border-cyan-500/40 transition-all resize-none leading-relaxed"
                            />
                        </div>
                        
                        <div className="space-y-6">
                            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-3xl p-6 space-y-4">
                                <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Neural Matrix Guide_</h4>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-3 leading-relaxed">
                                    <p>1. Must be a valid <b>JSON Array</b> `[...]`</p>
                                    <p>2. `questionId` is the unique sync key (upserts matches)</p>
                                    <p>3. Section must be: `PATH`, `TIER1`, `STYLE`, `ALIGNMENT`</p>
                                </div>
                                <div className="pt-4 border-t border-cyan-500/10">
                                    <button 
                                        onClick={() => setBulkJson(JSON.stringify([
                                            {
                                                questionId: "1.0",
                                                title: "Sample Node",
                                                section: "PATH",
                                                type: "WHY",
                                                weight: 1,
                                                story: "Once upon a time...",
                                                question: "What is your essence?",
                                                options: [
                                                    { text: "Option A", value: "Value", postText: "Feedback", nextId: "1.1" }
                                                ]
                                            }
                                        ], null, 4))}
                                        className="text-[10px] font-black text-cyan-500 hover:text-cyan-400 uppercase tracking-widest transition-colors flex items-center gap-2"
                                    >
                                        <Plus size={10} />
                                        Load Example Template
                                    </button>
                                </div>
                            </div>

                            {importStatus.message && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`p-6 rounded-3xl border flex flex-col gap-2 ${
                                        importStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                        importStatus.type === 'info' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500' :
                                        'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                        <Activity size={12} className={importStatus.type === 'info' ? 'animate-spin' : ''} />
                                        <span>System_Message_</span>
                                    </div>
                                    <p className="text-[10px] font-bold font-mono opacity-80">{importStatus.message}</p>
                                </motion.div>
                            )}

                            <div className="pt-4 space-y-3">
                                <button
                                    disabled={isSaving || validationErrors.length > 0 || !bulkJson}
                                    onClick={handleBulkImport}
                                    className="w-full py-4 rounded-2xl bg-cyan-500 text-white font-black text-[11px] uppercase tracking-[0.2em] hover:scale-[1.02] shadow-xl shadow-cyan-500/20 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            SYNTHESIZING...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={14} />
                                            FINALIZE_IMPORT_
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsBulkModalOpen(false)}
                                    className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all border border-transparent hover:border-black/5 dark:hover:border-white/5"
                                >
                                    Cancel Override
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardModal>
        </div>
    );
};

export default AdminNarrativeManager;
