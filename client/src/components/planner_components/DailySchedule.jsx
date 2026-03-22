import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import api from '../../services/api';
import ConfirmDialog from '../ui/ConfirmDialog';
import { usePlannerLocal } from '../../hooks/usePlannerLocal';

const fetcher = url => api.get(url).then(res => res.data);

const DailySchedule = ({ viewMode = 'me', isReadOnly = false, onFlip }) => {
    const containerRef = useRef(null);
    const today = new Date();
    const { tasks, addTask, updateTask, deleteTask, isLoading } = usePlannerLocal(today);
    const { data: customTemplates, mutate: mutateTemplates } = useSWR('/planner/templates', fetcher);
    
    const [isAdding, setIsAdding] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [templateStep, setTemplateStep] = useState('add');
    const [templateName, setTemplateName] = useState('');
    const [shareTemplate, setShareTemplate] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [newHabit, setNewHabit] = useState({ title: '', startTime: '09:00', endTime: '10:00' });
    const [snapKey, setSnapKey] = useState(0);
    const [confirmDelete, setConfirmDelete] = useState(null);
    
    const { data: user, mutate: mutateUser } = useSWR('/auth/me', fetcher);
    const sleepEnabled = true;
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
        if (e1 === null || e1 <= s1) e1 = s1 + 30;
        if (e2 === null || e2 <= s2) e2 = s2 + 30;
        return s1 < e2 && s2 < e1;
    };

    const handleAddTask = async () => {
        if (!newHabit.title.trim()) return;
        const allTimedTasks = tasks?.filter(t => t.startTime) || [];
        const overlaps = allTimedTasks.some(item => 
            isOverlapping(newHabit.startTime, newHabit.endTime, item.startTime, item.endTime)
        );
        if (overlaps) return;
        await addTask({ ...newHabit, type: 'task' });
        setNewHabit({ title: '', startTime: '09:00', endTime: '10:00' });
        setIsAdding(false);
        setTemplateStep('add');
    };

    const handleApplyTemplate = async () => {
        if (!selectedTemplate) return;
        try {
            await api.post('/planner/tasks/template', {
                date: today.toISOString().split('T')[0],
                templateId: selectedTemplate.id || selectedTemplate._id
            });
            setIsAdding(false);
            setTemplateStep('add');
            setSelectedTemplate(null);
            // In a full local-first world, this would update IndexedDB directly
        } catch (error) {
            console.error('Failed to apply template:', error);
        }
    };

    const handleSaveAsTemplate = async () => {
        if (!templateName.trim()) return;
        try {
            await api.post('/planner/templates', {
                name: templateName,
                date: today.toISOString().split('T')[0],
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
        await deleteTask(id);
    };

    const moveTaskAtTime = async (task, newStartTime) => {
        const [h1, m1] = task.startTime.split(':').map(Number);
        const [h2, m2] = task.endTime.split(':').map(Number);
        const durationMin = (h2 * 60 + m2) - (h1 * 60 + m1);
        const [nh, nm] = newStartTime.split(':').map(Number);
        const totalEndMin = (nh * 60 + nm) + durationMin;
        const [nEh, nEm] = [Math.floor(totalEndMin / 60), totalEndMin % 60];
        const newEndTime = `${String(nEh).padStart(2, '0')}:${String(nEm).padStart(2, '0')}`;
        const allTimedTasks = tasks?.filter(t => t.startTime) || [];
        const overlaps = allTimedTasks.some(other => 
            other._id !== task._id && isOverlapping(newStartTime, newEndTime, other.startTime, other.endTime)
        );
        if (overlaps) {
            setSnapKey(prev => prev + 1);
            return;
        }
        await updateTask(task._id, { startTime: newStartTime, endTime: newEndTime });
    };

    const getTopPos = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
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
        if (startH < endH) return h >= startH && h < endH;
        return h >= startH || h < endH;
    };

    const times = [];
    for (let i = 0; i <= 23; i++) {
        const h = i === 0 ? 12 : (i > 12 ? i - 12 : i);
        const ampm = i >= 12 ? 'PM' : 'AM';
        times.push({ label: `${h}:00 ${ampm}`, val: `${String(i).padStart(2, '0')}:00`, hour: i });
    }
    const visibleTimes = times.filter(t => !isDuringSleep(t.hour));
    const scheduleItems = tasks?.filter(t => t.startTime) || [];

    return (
        <>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="Delete Task"
                message="Are you sure you want to delete this scheduled task?"
                confirmLabel="Delete"
                onConfirm={() => { handleDeleteTask(confirmDelete); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />
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
                                <button onClick={() => setIsSettingsOpen(true)} className="p-1 sm:p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors flex items-center justify-center" title="Sleep Settings"><span className="material-symbols-outlined text-[18px]">bedtime</span></button>
                                <button onClick={() => { if (scheduleItems.length > 0) { setTemplateStep('save'); setIsAdding(true); }}} className={`p-1 sm:p-1.5 rounded-lg transition-colors flex items-center justify-center ${scheduleItems.length === 0 ? 'opacity-30 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary'}`} title="Save as Template"><span className="material-symbols-outlined text-[18px]">save</span></button>
                                <button onClick={() => { setIsAdding(!isAdding); setTemplateStep('add'); }} className={`p-1 sm:p-1.5 rounded-lg transition-colors flex items-center justify-center ${isAdding && templateStep === 'add' ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary'}`} title="Add Task"><span className="material-symbols-outlined text-[18px]">{isAdding && templateStep === 'add' ? 'close' : 'add'}</span></button>
                            </div>
                        )}
                        <button onClick={onFlip} className="p-1 sm:p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5 group" title="Back to Priority"><span className="text-[10px] font-black uppercase tracking-widest text-primary">Priority</span><span className="material-symbols-outlined text-[20px]">close_fullscreen</span></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-slate-50/30 dark:bg-transparent">
                    {/* Sleep Settings Portal */}
                    {isSettingsOpen && createPortal(
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsSettingsOpen(false)}></div>
                            <div className="relative bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700">
                                <h4 className="text-sm font-black mb-4 uppercase">Sleep Settings</h4>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <input type="time" value={tempSleepSettings.start} onChange={(e) => setTempSleepSettings({ ...tempSleepSettings, start: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border" />
                                    <input type="time" value={tempSleepSettings.end} onChange={(e) => setTempSleepSettings({ ...tempSleepSettings, end: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border" />
                                </div>
                                <button onClick={handleUpdateSleepSettings} className="w-full py-3 bg-primary text-white rounded-xl font-black text-xs uppercase">Save</button>
                            </div>
                        </div>, document.body
                    )}

                    {/* Add Task Portal */}
                    {isAdding && createPortal(
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsAdding(false)}></div>
                            <div className="relative bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                                {templateStep === 'add' && (
                                    <div className="flex flex-col gap-4">
                                        <input type="text" value={newHabit.title} onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })} placeholder="What are you doing?" className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border" autoFocus />
                                        <div className="flex gap-2">
                                            <input type="time" value={newHabit.startTime} onChange={(e) => setNewHabit({ ...newHabit, startTime: e.target.value })} className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border" />
                                            <input type="time" value={newHabit.endTime} onChange={(e) => setNewHabit({ ...newHabit, endTime: e.target.value })} className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setTemplateStep('picker')} className="flex-1 py-3 border rounded-xl font-bold text-xs uppercase">Template</button>
                                            <button onClick={handleAddTask} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase">Add</button>
                                        </div>
                                    </div>
                                )}
                                {templateStep === 'picker' && (
                                    <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                                        {TEMPLATES_LIST.map(tmpl => (
                                            <button key={tmpl.id} onClick={() => { setSelectedTemplate(tmpl); setTemplateStep('warning'); }} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-primary/5">
                                                <span className="material-symbols-outlined">{tmpl.icon}</span>
                                                <span className="font-bold text-xs uppercase">{tmpl.name}</span>
                                            </button>
                                        ))}
                                        {customTemplates?.map(tmpl => (
                                            <button key={tmpl._id} onClick={() => { setSelectedTemplate(tmpl); setTemplateStep('warning'); }} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-primary/5">
                                                <span className="material-symbols-outlined">description</span>
                                                <span className="font-bold text-xs uppercase">{tmpl.name}</span>
                                            </button>
                                        ))}
                                        <button onClick={() => setTemplateStep('add')} className="mt-2 py-2 text-xs font-bold uppercase text-slate-400">Back</button>
                                    </div>
                                )}
                                {templateStep === 'save' && (
                                    <div className="flex flex-col gap-4">
                                        <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Template name..." className="w-full px-4 py-2 rounded-xl border" autoFocus />
                                        <button onClick={handleSaveAsTemplate} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase">Save</button>
                                    </div>
                                )}
                                {templateStep === 'warning' && (
                                    <div className="flex flex-col items-center gap-4 text-center">
                                        <span className="material-symbols-outlined text-4xl text-amber-500">warning</span>
                                        <p className="text-sm">Apply template <b>"{selectedTemplate?.name}"</b>? This replaces all today's tasks.</p>
                                        <button onClick={handleApplyTemplate} className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold text-xs uppercase">Yes, Replace</button>
                                        <button onClick={() => setTemplateStep('picker')} className="w-full py-2 text-xs font-bold uppercase text-slate-400">Cancel</button>
                                    </div>
                                )}
                            </div>
                        </div>, document.body
                    )}

                    <div ref={containerRef} className="relative p-6 pt-10">
                        {/* Hour markers */}
                        <div className="space-y-[59px] relative">
                            {visibleTimes.map((t, idx) => (
                                <div key={idx} className="flex items-center gap-4 text-[10px] font-black text-slate-300 dark:text-slate-700 h-px relative group/line">
                                    <span className="w-12">{t.label}</span>
                                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800/50"></div>
                                    {!isReadOnly && (
                                        <button onClick={() => { setNewHabit({ ...newHabit, startTime: t.val }); setIsAdding(true); }} className="absolute left-16 opacity-0 group-hover/line:opacity-100 bg-white dark:bg-slate-800 border rounded-full size-6 flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-all z-20"><span className="material-symbols-outlined text-sm">add</span></button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Task Blocks */}
                        {scheduleItems.map((task) => {
                            const top = getTopPos(task.startTime);
                            const height = getHeight(task.startTime, task.endTime);
                            return (
                                <motion.div
                                    key={`${task._id}-${task.startTime}-${snapKey}`}
                                    drag={!isReadOnly ? "y" : false}
                                    dragConstraints={containerRef}
                                    dragMomentum={false}
                                    onDragEnd={async (_, info) => {
                                        if (isReadOnly) return;
                                        const dy = info.offset.y;
                                        const currentTop = getTopPos(task.startTime);
                                        const newTop = currentTop + dy;
                                        const firstHour = visibleTimes.length > 0 ? Number(visibleTimes[0].val.split(':')[0]) : 0;
                                        let totalMin = (newTop / 60) * 60 + (firstHour * 60);
                                        totalMin = Math.round(totalMin / 15) * 15;
                                        const h = Math.floor(totalMin / 60);
                                        const m = totalMin % 60;
                                        const newStartTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                                        if (newStartTime !== task.startTime) await moveTaskAtTime(task, newStartTime);
                                    }}
                                    className={`absolute left-[5rem] right-6 rounded-xl border-l-4 ${task.priority ? 'border-emerald-500 bg-emerald-500/10' : 'border-primary bg-primary/10'} p-2 group overflow-hidden flex flex-col justify-center items-center text-center`}
                                    style={{ top: `${top}px`, height: `${height}px` }}
                                >
                                    <p className="text-xs font-black truncate">{task.title}</p>
                                    {height > 30 && <p className="text-[10px] opacity-70">{task.startTime} - {task.endTime}</p>}
                                    {!isReadOnly && <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(task._id); }} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500"><span className="material-symbols-outlined text-xs">close</span></button>}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DailySchedule;
