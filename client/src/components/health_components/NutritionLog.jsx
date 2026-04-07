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
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nutrition Log</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">Track daily intake</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[16px]">{isAdding ? 'close' : 'add'}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Log Meal</span>
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#000000]/50 border border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Food/Meal Name</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                                placeholder="e.g., Oatmeal with berries"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Calories</label>
                            <input
                                type="number"
                                value={calories}
                                onChange={(e) => setCalories(e.target.value)}
                                className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                                placeholder="e.g., 350"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Meal Type</label>
                            <select
                                value={mealType}
                                onChange={(e) => setMealType(e.target.value)}
                                className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                            >
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snack">Snack</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="w-full py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors">
                        Save Nutrition Entry
                    </button>
                </form>
            )}

            <div className="flex flex-col gap-3">
                {nutrition.length > 0 ? nutrition.map(entry => (
                    <div key={entry._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#000000]/20 group transition-all hover:bg-slate-100 dark:hover:bg-[#000000]/40">
                        <div className="flex items-center gap-4">
                            <div className={`size-10 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-500`}>
                                <span className="material-symbols-outlined text-xl">restaurant</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{entry.title}</span>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                        {entry.date}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500">
                                        {entry.details?.mealType}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right flex flex-col items-end">
                                <span className="text-sm font-black text-slate-900 dark:text-white">{entry.details?.calories}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">KCAL</span>
                            </div>
                            <button
                                onClick={() => deleteHealthLog(entry._id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 transition-all rounded-lg hover:bg-rose-500/10"
                                aria-label="Delete entry"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="py-8 text-center bg-slate-50 dark:bg-[#000000]/20 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-3xl">set_meal</span>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No nutrition logged</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NutritionLog;
