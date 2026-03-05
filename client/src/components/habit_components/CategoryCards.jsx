import React from 'react';

const CategoryCards = () => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-5 shadow-sm min-h-[180px]">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-habit-health/10 text-habit-health">
                        <span className="material-symbols-outlined text-lg">favorite</span>
                    </div>
                    <h4 className="text-sm font-bold dark:text-white">Health</h4>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-2xl font-black dark:text-white">92%</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Consistency</p>
                    </div>
                    <div className="flex gap-0.5 items-end h-10">
                        <div className="w-1.5 h-6 bg-habit-health/30 rounded-full"></div>
                        <div className="w-1.5 h-8 bg-habit-health/30 rounded-full"></div>
                        <div className="w-1.5 h-10 bg-habit-health rounded-full"></div>
                        <div className="w-1.5 h-7 bg-habit-health/30 rounded-full"></div>
                        <div className="w-1.5 h-9 bg-habit-health rounded-full"></div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-5 shadow-sm min-h-[180px]">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-habit-mindset/10 text-habit-mindset">
                        <span className="material-symbols-outlined text-lg">psychology</span>
                    </div>
                    <h4 className="text-sm font-bold dark:text-white">Mindset</h4>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-2xl font-black dark:text-white">74%</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Consistency</p>
                    </div>
                    <div className="flex gap-0.5 items-end h-10">
                        <div className="w-1.5 h-4 bg-habit-mindset/30 rounded-full"></div>
                        <div className="w-1.5 h-10 bg-habit-mindset rounded-full"></div>
                        <div className="w-1.5 h-8 bg-habit-mindset rounded-full"></div>
                        <div className="w-1.5 h-6 bg-habit-mindset/30 rounded-full"></div>
                        <div className="w-1.5 h-5 bg-habit-mindset/30 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryCards;
