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
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">WORKOUT HISTORY</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        className={`size-8 rounded-sm border transition-all flex items-center justify-center ${showGuide ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:bg-white/5'}`}
                        title="Workout Guide"
                    >
                        <span className="material-symbols-outlined text-lg">menu_book</span>
                    </button>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`size-8 rounded-sm border transition-all flex items-center justify-center ${isAdding ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:bg-white/5'}`}
                        title="New Workout"
                    >
                        <span className="material-symbols-outlined text-lg">{isAdding ? 'close' : 'add'}</span>
                    </button>
                </div>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 rounded-sm bg-white/[0.02] border border-white/10 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">WORKOUT TITLE</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-2 text-sm text-white focus:outline-none focus:border-white/40 font-black uppercase tracking-wider"
                                placeholder="E.G. MORNING RUN"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">DURATION (MIN)</label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-2 text-sm text-white focus:outline-none focus:border-white/40 font-black"
                                placeholder="45"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">BODY FOCUS</label>
                            <select
                                value={targetArea}
                                onChange={(e) => setTargetArea(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-2 text-sm text-white focus:outline-none focus:border-white/40 font-black uppercase tracking-wider cursor-pointer"
                            >
                                <option value="full_body">Full Body</option>
                                <option value="upper_body">Upper Body</option>
                                <option value="lower_body">Lower Body</option>
                                <option value="push">Push</option>
                                <option value="pull">Pull</option>
                                <option value="legs">Legs</option>
                                <option value="core">Core</option>
                                <option value="cardio">Cardio</option>
                                <option value="mobility">Mobility</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">INTENSITY LEVEL</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['low', 'moderate', 'vigorous', 'high'].map(lvl => (
                                    <button
                                        key={lvl}
                                        type="button"
                                        onClick={() => setIntensity(lvl)}
                                        className={`py-2 rounded-sm text-[9px] font-black uppercase tracking-widest border transition-all ${
                                            intensity === lvl ? 'bg-white text-black border-white' : 'bg-white/5 text-white/20 border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-white text-black rounded-sm text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/90 transition-all border border-white/10">
                        SAVE WORKOUT
                    </button>
                </form>
            )}

            {showGuide && (
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-sm text-[11px] text-white/60 leading-relaxed overflow-y-auto max-h-[300px] custom-scrollbar animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <span className="size-1.5 bg-white rounded-full animate-pulse" />
                        WORKOUT GUIDE
                    </h4>
                    <div className="space-y-6">
                        <section>
                            <p className="font-black text-white uppercase tracking-widest mb-2 italic">01. TRAINING GOALS</p>
                            <p>Define kinetic goals: Hypertrophy (Muscle), Strength (Power), or Endurance (Cardio). Align focus vectors with weekly operational capacity.</p>
                        </section>
                        <section>
                            <p className="font-black text-white uppercase tracking-widest mb-2 italic">02. INTENSITY LEVELS (RPE)</p>
                            <ul className="space-y-1">
                                <li>GRADE_1-3: Active Recovery / Walking</li>
                                <li>GRADE_4-6: Aerobic Base (Talking Possible)</li>
                                <li>GRADE_7-9: Vigorous Operational Threshold</li>
                                <li>GRADE_10: Maximum Physiological Limit</li>
                            </ul>
                        </section>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {workouts.length > 0 ? workouts.map(workout => (
                    <div key={workout._id} className="flex items-center justify-between p-4 rounded-sm border border-white/5 bg-white/[0.01] group transition-all hover:bg-white/[0.03] hover:border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="size-8 rounded-sm flex items-center justify-center bg-white/5 text-white/20 border border-white/5 group-hover:rotate-12 transition-transform">
                                <span className="material-symbols-outlined text-sm">fitness_center</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-white uppercase tracking-wider">{workout.title}</span>
                                <div className="flex flex-wrap items-center gap-3 mt-1">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
                                        {workout.date}
                                    </span>
                                    {workout.details?.targetArea && (
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40">
                                            {workout.details.targetArea.replace('_', ' ')}
                                        </span>
                                    )}
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${
                                        (workout.details?.intensity === 'vigorous' || workout.details?.intensity === 'high') ? 'text-rose-500' : 'text-white/40'
                                    }`}>
                                        {workout.details?.intensity}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right flex items-baseline gap-2">
                                <span className="text-lg font-black text-white italic">{workout.details?.duration}</span>
                                <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">MINS</span>
                            </div>
                            <button
                                onClick={() => deleteHealthLog(workout._id)}
                                className="opacity-0 group-hover:opacity-100 size-6 flex items-center justify-center rounded-sm text-white/10 hover:text-rose-500 transition-all border border-white/5"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="py-12 text-center bg-white/[0.02] rounded-sm border border-dashed border-white/5 flex flex-col items-center justify-center gap-4 opacity-10">
                        <span className="material-symbols-outlined text-4xl">directions_run</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">NO WORKOUTS RECORDED</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutTracker;
