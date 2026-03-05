import React from 'react';

const SearchTags = () => {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">search</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Search & Tags</h3>
                </div>
            </div>
            <div className="relative mb-4 flex-none">
                <input className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 dark:text-white" placeholder="Search entries..." type="text" />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            </div>
            <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase cursor-pointer hover:bg-blue-500/20">#Work</span>
                <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-bold uppercase cursor-pointer hover:bg-purple-500/20">#Reflections</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase cursor-pointer hover:bg-emerald-500/20">#Success</span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase cursor-pointer hover:bg-amber-500/20">#Gratitude</span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase cursor-pointer">+ Add Tag</span>
            </div>
        </div>
    );
};

export default SearchTags;
