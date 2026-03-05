import React from 'react';

const JournalHistory = () => {
    return (
        <div className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Journal History</h3>
                <button className="text-xs font-bold text-primary hover:underline">View All</button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                <div className="group cursor-pointer p-4 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">😊</span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Today</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">10:45 AM</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">Feeling productive today. Managed to finish the design system and started working on the journal module...</p>
                </div>

                <div className="group cursor-pointer p-4 rounded-lg bg-white dark:bg-transparent border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🙂</span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Yesterday</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">9:15 PM</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">Had a long day but the walk in the park helped clear my mind. Realized I need to prioritize rest more...</p>
                </div>

                <div className="group cursor-pointer p-4 rounded-lg bg-white dark:bg-transparent border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">😐</span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Oct 22, 2023</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">11:30 PM</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">A bit of a mixed bag today. The client meeting was stressful, but I finally understood that complex API...</p>
                </div>

                <div className="group cursor-pointer p-4 rounded-lg bg-white dark:bg-transparent border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🙁</span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Oct 21, 2023</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">8:00 AM</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">Woke up feeling a bit tired and unmotivated. Need to check if my sleep schedule is being interrupted...</p>
                </div>
            </div>
        </div>
    );
};

export default JournalHistory;
