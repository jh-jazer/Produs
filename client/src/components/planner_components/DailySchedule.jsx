import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import api from '../../services/api';

const fetcher = url => api.get(url).then(res => res.data);

const DailySchedule = ({ viewMode = 'me', isReadOnly = false, onFlip }) => {
    const containerRef = useRef(null);
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-CA');
    const { data: tasks, mutate } = useSWR(`/planner/tasks?date=${dateStr}${viewMode === 'partner' ? '&view=partner' : ''}`, fetcher);
    const { data: customTemplates, mutate: mutateTemplates } = useSWR('/planner/templates', fetcher);
    
    const [isAdding, setIsAdding] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [templateStep, setTemplateStep] = useState('add'); // 'add', 'picker', 'warning', 'save'
    const [templateName, setTemplateName] = useState('');
    const [shareTemplate, setShareTemplate] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [newTask, setNewTask] = useState({ title: '', startTime: '09:00', endTime: '10:00' });
    const [snapKey, setSnapKey] = useState(0);
    
    const { data: user, mutate: mutateUser } = useSWR('/auth/me', fetcher);
    const sleepEnabled = true; // Forced enabled
    const sleepStart = user?.settings?.sleepMode?.start || "22:00";
    const sleepEnd = user?.settings?.sleepMode?.end || "07:00";

    const [tempSleepSettings, setTempSleepSettings] = useState({
        enabled: true,
        start: sleepStart,
        end: sleepEnd
    });

    useEffect(() => {
        if (user?.settings?.sleepMode) {
            setTempSleepSettings(user.settings.sleepMode);
        }
    }, [user]);

    const handleUpdateSleepSettings = async () => {
        try {
            await api.put('/auth/settings', {
                sleepMode: { ...tempSleepSettings, enabled: true }
            });
            mutateUser();
            setIsSettingsOpen(false);
        } catch (error) {
            console.error('Failed to update sleep settings:', error);
        }
    };

    const TEMPLATES_LIST = [
        { id: 'deep-work', name: 'Deep Work Day', icon: 'bolt', desc: 'Focus sprints & recovery' },
        { id: 'development', name: 'Dev Sprint', icon: 'code', desc: 'Coding, review & research' },
        { id: 'reset-day', name: 'Reset & Relax', icon: 'spa', desc: 'Meditation & skill learning' },
        { id: 'high-performance', name: 'High Impact', icon: 'rocket_launch', desc: 'Top priority sprints' },
    ];

    // Filter tasks that have time set (including priority tasks)
    const scheduleItems = tasks?.filter(t => t.startTime) || [];

    const isOverlapping = (start1, end1, start2, end2) => {
        const toMin = (s) => {
            if (!s) return null;
            const [h, m] = s.split(':').map(Number);
            return h * 60 + m;
        };
        const s1 = toMin(start1);
        let e1 = toMin(end1);
        const s2 = toMin(start2);
        let e2 = toMin(end2);

        // Fallback for missing end times (assume 30 mins)
        if (e1 === null || e1 <= s1) e1 = s1 + 30;
        if (e2 === null || e2 <= s2) e2 = s2 + 30;

        return s1 < e2 && s2 < e1;
    };

    const handleAddTask = async () => {
        if (!newTask.title.trim()) return;

        // Check for overlap against ALL tasks (scheduled and priority)
        const allTimedTasks = tasks?.filter(t => t.startTime) || [];
        const overlaps = allTimedTasks.some(item => 
            isOverlapping(newTask.startTime, newTask.endTime, item.startTime, item.endTime)
        );

        if (overlaps) {
            return;
        }

        try {
            await api.post('/planner/tasks', {
                ...newTask,
                date: dateStr,
                type: 'task'
            });
            setNewTask({ title: '', startTime: '09:00', endTime: '10:00' });
            setIsAdding(false);
            setTemplateStep('add');
            mutate();
        } catch (error) {
            console.error('Failed to add schedule item:', error);
        }
    };

    const handleApplyTemplate = async () => {
        if (!selectedTemplate) return;
        try {
            await api.post('/planner/tasks/template', {
                date: dateStr,
                templateId: selectedTemplate.id || selectedTemplate._id
            });
            setIsAdding(false);
            setTemplateStep('add');
            setSelectedTemplate(null);
            mutate();
        } catch (error) {
            console.error('Failed to apply template:', error);
        }
    };

    const handleSaveAsTemplate = async () => {
        if (!templateName.trim()) return;
        try {
            await api.post('/planner/templates', {
                name: templateName,
                date: dateStr,
                isShared: shareTemplate
            });
            setTemplateName('');
            setShareTemplate(false);
            setTemplateStep('add');
            setIsAdding(false);
            mutateTemplates();
        } catch (error) {
            console.error('Failed to save template:', error);
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await api.delete(`/planner/tasks/${id}`);
            mutate();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const moveTaskAtTime = async (task, newStartTime) => {
        // Calculate new end time (keep duration same)
        const [h1, m1] = task.startTime.split(':').map(Number);
        const [h2, m2] = task.endTime.split(':').map(Number);
        const durationMin = (h2 * 60 + m2) - (h1 * 60 + m1);

        const [nh, nm] = newStartTime.split(':').map(Number);
        const totalEndMin = (nh * 60 + nm) + durationMin;
        const [nEh, nEm] = [Math.floor(totalEndMin / 60), totalEndMin % 60];
        const newEndTime = `${String(nEh).padStart(2, '0')}:${String(nEm).padStart(2, '0')}`;

        // Check for overlap with other tasks (regardless of priority status)
        const allTimedTasks = tasks?.filter(t => t.startTime) || [];
        const overlaps = allTimedTasks.some(other => 
            other._id !== task._id && isOverlapping(newStartTime, newEndTime, other.startTime, other.endTime)
        );

        if (overlaps) {
            setSnapKey(prev => prev + 1); // Increment to force re-render/snap back
            mutate(); // Refresh to snap back
            return;
        }

        try {
            await api.patch(`/planner/tasks/${task._id}`, { startTime: newStartTime, endTime: newEndTime });
            mutate();
        } catch (error) {
            console.error('Failed to move task:', error);
            mutate(); // Refresh to snap back on error
        }
    };

    const getTopPos = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        
        // Find first visible hour
        const firstHour = visibleTimes.length > 0 ? Number(visibleTimes[0].val.split(':')[0]) : 0;
        const totalMin = (h - firstHour) * 60 + m;
        return (totalMin / 60) * 60;
    };

    const getHeight = (start, end) => {
        if (!start || !end) return 30;
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        const durationMin = (h2 * 60 + m2) - (h1 * 60 + m1);
        return (durationMin / 60) * 60;
    };

    const isDuringSleep = (h) => {
        if (!sleepEnabled) return false;
        const startH = Number(sleepStart.split(':')[0]);
        const endH = Number(sleepEnd.split(':')[0]);
        
        if (startH < endH) {
            return h >= startH && h < endH;
        } else {
            // Overnights (e.g., 22:00 to 07:00)
            return h >= startH || h < endH;
        }
    };

    const times = [];
    for (let i = 0; i <= 23; i++) {
        const h = i === 0 ? 12 : (i > 12 ? i - 12 : i);
        const ampm = i >= 12 ? 'PM' : 'AM';
        times.push({ label: `${h}:00 ${ampm}`, val: `${String(i).padStart(2, '0')}:00`, hour: i });
    }

    const visibleTimes = times.filter(t => !isDuringSleep(t.hour));

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] flex flex-col shadow-xl transition-all hover:shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-white/80 dark:bg-[#192233]/80 backdrop-blur-md z-30 sticky top-0">
                <div className="flex items-center gap-3 mt-0.5">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary">calendar_month</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Planner</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Time blocking</p>
                    </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    {!isReadOnly && (
                        <div className="flex items-center gap-0.5 sm:gap-2">
                            <button 
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-1 sm:p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                                title="Sleep Settings"
                            >
                                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">bedtime</span>
                            </button>
                            <button
                                onClick={() => {
                                    if (scheduleItems.length > 0) {
                                        setTemplateStep('save');
                                        setIsAdding(true);
                                    }
                                }}
                                className={`p-1 sm:p-1.5 rounded-lg transition-colors flex items-center justify-center ${scheduleItems.length === 0 ? 'opacity-30 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                title="Save as Template"
                            >
                                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">save</span>
                            </button>
                            <button
                                onClick={() => { setIsAdding(!isAdding); setTemplateStep('add'); }}
                                className={`p-1 sm:p-1.5 rounded-lg transition-colors flex items-center justify-center ${isAdding && templateStep === 'add' ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                title="Add Task"
                            >
                                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{isAdding && templateStep === 'add' ? 'close' : 'add'}</span>
                            </button>
                        </div>
                    )}
                    <button 
                        onClick={onFlip}
                        className="p-1 sm:p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5 group"
                        title="Back to Priority"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest transition-opacity text-primary">Priority</span>
                        <span className="material-symbols-outlined text-[20px]">close_fullscreen</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative font-inter bg-slate-50/30 dark:bg-transparent">
                {isSettingsOpen && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsSettingsOpen(false)}></div>
                        <div className="relative bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col gap-5">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">Sleep Settings</h4>
                                <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700 group">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">bedtime</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-black dark:text-white uppercase tracking-wider">Sleep Mode</p>
                                    <p className="text-[9px] text-slate-400 font-medium">Schedule your rest hours</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center">Lights Out</label>
                                        <input
                                            type="time"
                                            value={tempSleepSettings.start}
                                            onChange={(e) => setTempSleepSettings({ ...tempSleepSettings, start: e.target.value })}
                                            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm font-bold text-center"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center">Wake Up</label>
                                        <input
                                            type="time"
                                            value={tempSleepSettings.end}
                                            onChange={(e) => setTempSleepSettings({ ...tempSleepSettings, end: e.target.value })}
                                            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm font-bold text-center"
                                        />
                                    </div>
                                </div>
                            <button
                                onClick={handleUpdateSleepSettings}
                                className="w-full py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-2"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
                {isAdding && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsAdding(false)}></div>
                        <div className="relative bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col gap-4">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">
                                    {templateStep === 'add' ? 'Add Schedule Item' : 
                                     templateStep === 'picker' ? 'Choose Template' : 
                                     templateStep === 'save' ? 'Save as Template' : 'Careful!'}
                                </h4>
                                <button onClick={() => { setIsAdding(false); setTemplateStep('add'); }} className="text-slate-400 hover:text-slate-600">
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>

                            {templateStep === 'add' && (
                                <div className="flex flex-col gap-4 mt-2">
                                    <input
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        placeholder="What are you doing?"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 flex flex-col gap-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start</p>
                                            <input
                                                type="time"
                                                value={newTask.startTime}
                                                onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm"
                                            />
                                        </div>
                                        <div className="mt-4 text-slate-400">
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End</p>
                                            <input
                                                type="time"
                                                value={newTask.endTime}
                                                onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <button
                                            onClick={() => setTemplateStep('picker')}
                                            className="py-3 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                                            Template
                                        </button>
                                        <button
                                            onClick={handleAddTask}
                                            className="py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            Schedule
                                        </button>
                                    </div>
                                </div>
                            )}

                            {templateStep === 'picker' && (
                                <div className="flex flex-col gap-4 mt-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">System Templates</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            {TEMPLATES_LIST.map(tmpl => (
                                                <button
                                                    key={tmpl.id}
                                                    onClick={() => { setSelectedTemplate(tmpl); setTemplateStep('warning'); }}
                                                    className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                                                >
                                                    <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                                                        <span className="material-symbols-outlined text-base">{tmpl.icon}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[10px] font-black dark:text-white uppercase tracking-wider">{tmpl.name}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {(customTemplates && customTemplates.length > 0) && (
                                        <div className="space-y-2 mt-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Custom Templates</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {customTemplates.map(tmpl => (
                                                    <button
                                                        key={tmpl._id}
                                                        onClick={() => { setSelectedTemplate(tmpl); setTemplateStep('warning'); }}
                                                        className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                                                    >
                                                        <div className="size-8 rounded-lg bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-primary transition-colors">
                                                            <span className="material-symbols-outlined text-base">
                                                                {tmpl.isShared ? 'diversity_3' : 'person'}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-black dark:text-white uppercase tracking-wider">{tmpl.name}</p>
                                                            <p className="text-[9px] text-slate-400 font-medium">{tmpl.tasks?.length} tasks</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => setTemplateStep('add')}
                                        className="mt-2 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-colors"
                                    >
                                        Back to Custom
                                    </button>
                                </div>
                            )}

                            {templateStep === 'save' && (
                                <div className="flex flex-col gap-4 mt-2">
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Template Name</label>
                                            <input
                                                type="text"
                                                value={templateName}
                                                onChange={(e) => setTemplateName(e.target.value)}
                                                placeholder="e.g., Heavy Focus Monday"
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                autoFocus
                                            />
                                        </div>
                                        
                                        <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={shareTemplate}
                                                onChange={(e) => setShareTemplate(e.target.checked)}
                                                className="size-4 rounded-md border-slate-300 text-primary focus:ring-primary/20"
                                            />
                                            <div className="flex-1">
                                                <p className="text-[11px] font-black dark:text-white uppercase tracking-wider">Share with Partner</p>
                                                <p className="text-[9px] text-slate-400">Partner can see and apply this template</p>
                                            </div>
                                            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">diversity_3</span>
                                        </label>
                                    </div>

                                    <button
                                        onClick={handleSaveAsTemplate}
                                        disabled={!templateName.trim()}
                                        className="w-full py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        Save Template
                                    </button>
                                </div>
                            )}

                            {templateStep === 'warning' && (
                                <div className="flex flex-col items-center text-center gap-4 py-2">
                                    <div className="size-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2">
                                        <span className="material-symbols-outlined text-4xl">warning</span>
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="text-sm font-black dark:text-white uppercase tracking-tight">Replace Daily Plan?</h5>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed px-4">
                                            Choosing <span className="text-amber-500 font-bold">"{selectedTemplate?.name}"</span> will <span className="font-bold">permanently delete</span> all your existing plans for today.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 w-full mt-4">
                                        <button
                                            onClick={handleApplyTemplate}
                                            className="w-full py-3 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            Yes, Replace Everything
                                        </button>
                                        <button
                                            onClick={() => setTemplateStep('picker')}
                                            className="w-full py-3 border border-slate-100 dark:border-slate-800 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                        >
                                            Nevermind, Go Back
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}

                <div ref={containerRef} className="relative p-6 pt-10">
                    {/* Hourly marks */}
                    <div className="space-y-[59px] relative">
                        {visibleTimes.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-4 text-[10px] font-black text-slate-300 dark:text-slate-700 h-px relative group/line">
                                <span className="w-12 whitespace-nowrap group-hover/line:text-primary transition-colors">{t.label}</span>
                                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800/50 group-hover/line:bg-primary/20 transition-all"></div>
                                {!isReadOnly && (
                                    <button
                                        onClick={() => { setNewTask({ ...newTask, startTime: t.val }); setIsAdding(true); }}
                                        className="absolute left-16 opacity-0 group-hover/line:opacity-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full size-6 flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-all z-20"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Current Time Indicator */}
                        {(() => {
                            const now = new Date();
                            const hours = now.getHours();
                            const minutes = now.getMinutes();
                            
                            if (isDuringSleep(hours)) return null;

                            const firstHour = visibleTimes.length > 0 ? Number(visibleTimes[0].val.split(':')[0]) : 0;
                            const topPos = ((hours - firstHour) * 60) + (minutes / 60) * 60;
                            
                            return (
                                <div className="absolute left-16 right-0 flex items-center z-20 pointer-events-none" style={{ top: `${topPos}px` }}>
                                    <div className="size-2 bg-red-500 rounded-full shadow-lg -ml-1 ring-4 ring-red-500/20"></div>
                                    <div className="flex-1 h-0.5 bg-red-500/40"></div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Task Blocks */}
                    {scheduleItems.map((task) => {
                        const top = getTopPos(task.startTime);
                        const height = getHeight(task.startTime, task.endTime);
                        const isShort = height <= 30;
                        
                        const handleDragEnd = async (_, info) => {
                            if (isReadOnly) return;
                            
                            const dy = info.offset.y;
                            const currentTop = getTopPos(task.startTime);
                            const newTop = currentTop + dy;
                            
                            // Calculate total minutes from midnight
                            const firstHour = visibleTimes.length > 0 ? Number(visibleTimes[0].val.split(':')[0]) : 0;
                            let totalMin = (newTop / 60) * 60 + (firstHour * 60);
                            
                            // Snap to nearest 15 minutes
                            totalMin = Math.round(totalMin / 15) * 15;
                            
                            // Constraints (Stay within visible range)
                            const lastHour = visibleTimes.length > 0 ? Number(visibleTimes[visibleTimes.length - 1].val.split(':')[0]) : 23;
                            const minMin = firstHour * 60;
                            const maxMin = lastHour * 60 + 45;
                            totalMin = Math.max(minMin, Math.min(totalMin, maxMin));
                            
                            const h = Math.floor(totalMin / 60);
                            const m = totalMin % 60;
                            const newStartTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                            
                            if (newStartTime !== task.startTime) {
                                await moveTaskAtTime(task, newStartTime);
                            }
                        };

                        return (
                            <motion.div
                                key={`${task._id}-${task.startTime}-${snapKey}`}
                                drag={!isReadOnly ? "y" : false}
                                dragConstraints={containerRef}
                                dragMomentum={false}
                                dragElastic={0.05}
                                onDragEnd={handleDragEnd}
                                animate={{ y: 0 }}
                                whileDrag={{ scale: 1.02, zIndex: 50, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                                className={`absolute left-[5rem] right-6 rounded-xl border-l-4 ${task.priority ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20' : 'border-primary bg-primary/10 dark:bg-primary/20'} backdrop-blur-sm p-2 group hover:ring-2 hover:ring-primary/30 transition-all cursor-grab active:cursor-grabbing overflow-hidden flex flex-col justify-center items-center text-center`}
                                style={{ top: `${top}px`, height: `${height}px` }}
                            >
                                <div className="max-w-full px-2">
                                    <p className={`text-xs font-black text-slate-900 dark:text-white truncate leading-tight ${isShort ? 'text-[10px]' : ''}`}>{task.title}</p>
                                    {!isShort && (
                                        <p className="text-[10px] font-bold text-primary opacity-80 mt-0.5">{task.startTime} - {task.endTime}</p>
                                    )}
                                </div>

                                {!isReadOnly && (
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                                            className="p-1 hover:bg-red-500/20 rounded text-red-500 flex items-center justify-center transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xs">close</span>
                                        </button>
                                    </div>
                                )}

                                {/* Drag Handle indicator */}
                                {!isReadOnly && (
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
                                        <div className="w-6 h-1 rounded-full bg-slate-400"></div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DailySchedule;
