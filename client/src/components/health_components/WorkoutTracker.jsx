import React, { useState } from 'react';

const WorkoutTracker = ({ workouts, addHealthLog, deleteHealthLog }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [intensity, setIntensity] = useState('moderate');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !duration) return;

        addHealthLog('workout', {
            title,
            date: new Date().toISOString().split('T')[0],
            details: {
                duration: parseInt(duration),
                intensity
            }
        });
        setTitle('');
        setDuration('');
        setIntensity('moderate');
        setIsAdding(false);
    };

    return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 flex flex-col gap-6 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Workout Tracker</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">Log physical activity</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-2 rounded-lg bg-electric-blue/10 text-electric-blue hover:bg-electric-blue/20 transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[16px]">{isAdding ? 'close' : 'add'}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">New Workout</span>
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#000000]/50 border border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Workout Name</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-electric-blue/50"
                                placeholder="e.g., Morning Run, Weightlifting"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Duration (min)</label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-electric-blue/50"
                                placeholder="e.g., 45"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Intensity</label>
                            <select
                                value={intensity}
                                onChange={(e) => setIntensity(e.target.value)}
                                className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-electric-blue/50"
                            >
                                <option value="low">Low</option>
                                <option value="moderate">Moderate</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="w-full py-2 bg-electric-blue text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-electric-blue/90 transition-colors">
                        Save Workout
                    </button>
                </form>
            )}

            <div className="flex flex-col gap-3">
                {workouts.length > 0 ? workouts.map(workout => (
                    <div key={workout._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#000000]/20 group transition-all hover:bg-slate-100 dark:hover:bg-[#000000]/40">
                        <div className="flex items-center gap-4">
                            <div className={`size-10 rounded-full flex items-center justify-center bg-electric-blue/10 text-electric-blue`}>
                                <span className="material-symbols-outlined text-xl">fitness_center</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{workout.title}</span>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                        {workout.date}
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                        workout.details?.intensity === 'high' ? 'bg-rose-500/10 text-rose-500' :
                                        workout.details?.intensity === 'moderate' ? 'bg-amber-500/10 text-amber-500' :
                                        'bg-emerald-500/10 text-emerald-500'
                                    }`}>
                                        {workout.details?.intensity}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right flex flex-col items-end">
                                <span className="text-sm font-black text-slate-900 dark:text-white">{workout.details?.duration}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">MINS</span>
                            </div>
                            <button
                                onClick={() => deleteHealthLog(workout._id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 transition-all rounded-lg hover:bg-rose-500/10"
                                aria-label="Delete workout"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="py-8 text-center bg-slate-50 dark:bg-[#000000]/20 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-3xl">directions_run</span>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No workouts logged</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutTracker;
