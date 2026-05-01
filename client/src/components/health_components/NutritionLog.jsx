import React, { useState } from 'react';

const NutritionLog = ({ nutrition, addHealthLog, deleteHealthLog }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [calories, setCalories] = useState('');
    const [mealType, setMealType] = useState('breakfast');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !calories) return;

        addHealthLog('nutrition', {
            title,
            date: new Date().toISOString().split('T')[0],
            details: {
                calories: parseInt(calories),
                mealType
            }
        });
        setTitle('');
        setCalories('');
        setMealType('breakfast');
        setIsAdding(false);
    };

    return (
        <div className="flex flex-col gap-6 relative">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">NUTRITION HISTORY</span>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`size-8 rounded-sm border transition-all flex items-center justify-center ${isAdding ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:bg-white/5'}`}
                    title="New Entry"
                >
                    <span className="material-symbols-outlined text-lg">{isAdding ? 'close' : 'add'}</span>
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 rounded-sm bg-white/[0.02] border border-white/10 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">MEAL NAME</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-2 text-sm text-white focus:outline-none focus:border-white/40 font-black uppercase tracking-wider"
                                placeholder="E.G. PROTEIN SHAKE"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">CALORIES (KCAL)</label>
                            <input
                                type="number"
                                value={calories}
                                onChange={(e) => setCalories(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-2 text-sm text-white focus:outline-none focus:border-white/40 font-black"
                                placeholder="350"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">MEAL TYPE</label>
                            <select
                                value={mealType}
                                onChange={(e) => setMealType(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-2 text-sm text-white focus:outline-none focus:border-white/40 font-black uppercase tracking-wider cursor-pointer"
                            >
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snack">Snack</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-white text-black rounded-sm text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/90 transition-all border border-white/10">
                        SAVE ENTRY
                    </button>
                </form>
            )}

            <div className="flex flex-col gap-3">
                {nutrition.length > 0 ? nutrition.map(entry => (
                    <div key={entry._id} className="flex items-center justify-between p-4 rounded-sm border border-white/5 bg-white/[0.01] group transition-all hover:bg-white/[0.03] hover:border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="size-8 rounded-sm flex items-center justify-center bg-white/5 text-white/20 border border-white/5 group-hover:rotate-12 transition-transform">
                                <span className="material-symbols-outlined text-sm">restaurant</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-white uppercase tracking-wider">{entry.title}</span>
                                <div className="flex flex-wrap items-center gap-3 mt-1">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
                                        {entry.date}
                                    </span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">
                                        {entry.details?.mealType}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right flex items-baseline gap-2">
                                <span className="text-lg font-black text-white italic">{entry.details?.calories}</span>
                                <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">KCAL</span>
                            </div>
                            <button
                                onClick={() => deleteHealthLog(entry._id)}
                                className="opacity-0 group-hover:opacity-100 size-6 flex items-center justify-center rounded-sm text-white/10 hover:text-rose-500 transition-all border border-white/5"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="py-12 text-center bg-white/[0.02] rounded-sm border border-dashed border-white/5 flex flex-col items-center justify-center gap-4 opacity-10">
                        <span className="material-symbols-outlined text-4xl">set_meal</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">NO ENTRIES RECORDED</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NutritionLog;
