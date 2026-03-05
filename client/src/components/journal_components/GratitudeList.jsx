import React from 'react';

const GratitudeList = () => {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">favorite</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gratitude</h3>
            </div>
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">1</span>
                    <input className="bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-primary outline-none focus:ring-0 w-full py-1 text-sm dark:text-slate-300" placeholder="I am thankful for..." type="text" />
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">2</span>
                    <input className="bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-primary outline-none focus:ring-0 w-full py-1 text-sm dark:text-slate-300" placeholder="Something good that happened..." type="text" />
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">3</span>
                    <input className="bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-primary outline-none focus:ring-0 w-full py-1 text-sm dark:text-slate-300" placeholder="A person I appreciate..." type="text" />
                </div>
            </div>
        </div>
    );
};

export default GratitudeList;
