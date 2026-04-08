/* eslint-disable */
import React, { useState } from 'react';

const WorkoutTracker = ({ workouts, addHealthLog, deleteHealthLog }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [intensity, setIntensity] = useState('moderate');
    const [targetArea, setTargetArea] = useState('full_body');
    const [showGuide, setShowGuide] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !duration) return;

        addHealthLog('workout', {
            title,
            date: new Date().toISOString().split('T')[0],
            details: {
                duration: parseInt(duration),
                intensity,
                targetArea
            }
        });
        setTitle('');
        setDuration('');
        setIntensity('moderate');
        setTargetArea('full_body');
        setIsAdding(false);
    };

    return (
        <div className="flex flex-col gap-6 relative">
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
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Body Part / Focus</label>
                            <select
                                value={targetArea}
                                onChange={(e) => setTargetArea(e.target.value)}
                                className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-electric-blue/50"
                            >
                                <option value="full_body">Full Body</option>
                                <option value="upper_body">Upper Body</option>
                                <option value="lower_body">Lower Body</option>
                                <option value="push">Push (Chest, Shoulders, Triceps)</option>
                                <option value="pull">Pull (Back, Biceps)</option>
                                <option value="legs">Legs</option>
                                <option value="core">Core</option>
                                <option value="cardio">Cardio / Endurance</option>
                                <option value="mobility">Yoga / Mobility</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Intensity</label>
                            <select
                                value={intensity}
                                onChange={(e) => setIntensity(e.target.value)}
                                className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-electric-blue/50"
                            >
                                <option value="low">Low (RPE 1-3)</option>
                                <option value="moderate">Moderate (RPE 4-6)</option>
                                <option value="vigorous">Vigorous (RPE 7-9)</option>
                                <option value="high">High (RPE 10)</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="w-full py-2 bg-electric-blue text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-electric-blue/90 transition-colors">
                        Save Workout
                    </button>
                </form>
            )}

            <div className="flex justify-between items-center mt-2 border-b border-slate-100 dark:border-white/10 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Logs</span>
                <button onClick={() => setShowGuide(!showGuide)} className="text-[10px] font-bold text-electric-blue uppercase tracking-widest hover:opacity-80 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">menu_book</span>
                    {showGuide ? 'Hide Guide' : 'Read Guide'}
                </button>
            </div>

            {showGuide && (
                <div className="bg-slate-50 dark:bg-[#000000]/20 border border-slate-200 dark:border-white/10 p-5 rounded-xl text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed overflow-y-auto max-h-[400px] custom-scrollbar mb-4 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-sm font-bold text-electric-blue mb-3 uppercase tracking-widest">Choosing the Right Workout & Intensity</h4>
                    <p className="mb-4">Choosing the right workout and intensity is a balancing act between your current fitness level, your specific goals, and how much time you can realistically commit. Instead of jumping into the most intense program you find online, it’s better to build a foundation that you can actually sustain.</p>
                    
                    <h5 className="font-bold text-slate-900 dark:text-white mt-4 mb-1">1. Define Your Primary Goal</h5>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                        <li><strong>Hypertrophy (Muscle Growth):</strong> Focus on resistance training (weights or calisthenics) with moderate reps (8–12) and sets.</li>
                        <li><strong>Strength & Power:</strong> Focus on heavy weights with low reps (1–5) and longer rest periods.</li>
                        <li><strong>Endurance & Cardiovascular Health:</strong> Focus on steady-state cardio (running, swimming) or High-Intensity Interval Training (HIIT).</li>
                    </ul>

                    <h5 className="font-bold text-slate-900 dark:text-white mt-4 mb-1">2. Determine Your Weekly Volume</h5>
                    <p className="mb-2 italic opacity-80">Be honest about your schedule. It is better to commit to 3 days a week and hit them every time than to plan for 6 days and fail by Wednesday.</p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                        <li><strong>Full Body (2–3 days/week):</strong> Great for beginners or busy schedules. You hit every major muscle group each session.</li>
                        <li><strong>Upper/Lower Split (4 days/week):</strong> Allows for more focus on specific areas while providing ample recovery.</li>
                        <li><strong>Push/Pull/Legs (3 or 6 days/week):</strong> An advanced split that categorizes movements by function.</li>
                    </ul>

                    <h5 className="font-bold text-slate-900 dark:text-white mt-4 mb-1">3. Gauging Your Intensity</h5>
                    <p className="mb-2">Intensity isn't just about how much you sweat; it’s about the stress placed on your body.</p>
                    <div className="bg-white dark:bg-[#121212] p-3 rounded-lg border border-slate-100 dark:border-white/5 mb-3">
                        <strong className="text-electric-blue block mb-1">The RPE Scale (Rate of Perceived Exertion)</strong>
                        <ul className="list-disc pl-5 space-y-1 text-xs">
                            <li><strong>RPE 1–3:</strong> Very light (walking, active recovery).</li>
                            <li><strong>RPE 4–6:</strong> Moderate (you can talk but not sing). Sweet spot for building a base.</li>
                            <li><strong>RPE 7–9:</strong> Vigorous (difficult to speak, muscles burning). Where most growth happens.</li>
                            <li><strong>RPE 10:</strong> Maximum effort (cannot do one more inch of movement). Use sparingly.</li>
                        </ul>
                    </div>
                    
                    <h5 className="font-bold text-slate-900 dark:text-white mt-4 mb-1">4. The Principle of Progressive Overload</h5>
                    <p className="mb-2">Whatever you choose, the intensity must eventually increase. If you lift the same weight for the same reps every week, your body stops adapting. Every 1–2 weeks, try to:</p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                        <li>Increase the weight slightly.</li>
                        <li>Add one more repetition.</li>
                        <li>Decrease your rest time between sets.</li>
                    </ul>
                    
                    <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 p-3 rounded-lg border border-rose-500/20 text-xs mt-4">
                        <strong>A Note on Recovery:</strong> Intensity is only effective if you can recover from it. If you find yourself constantly sore, irritable, or unable to sleep, your intensity is likely too high for your current recovery capacity (food and sleep).
                    </div>
                </div>
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
                                    {workout.details?.targetArea && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10">
                                            {workout.details.targetArea.replace('_', ' ')}
                                        </span>
                                    )}
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                        (workout.details?.intensity === 'vigorous' || workout.details?.intensity === 'high') ? 'bg-rose-500/10 text-rose-500' :
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
