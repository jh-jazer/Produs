import React from 'react';

const MonthlyObjectives = () => {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Monthly Objectives</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-slate-600 dark:text-slate-400 uppercase">Product Launch Q4</span>
                            <span className="text-primary">85%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full shadow-sm" style={{ width: '85%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-slate-600 dark:text-slate-400 uppercase">Learning: TypeScript</span>
                            <span className="text-purple-500">42%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full shadow-sm" style={{ width: '42%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-slate-600 dark:text-slate-400 uppercase">Fitness: 20 Workouts</span>
                            <span className="text-emerald-500">60%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full shadow-sm" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-slate-600 dark:text-slate-400 uppercase">Read 2 Books</span>
                            <span className="text-orange-500">10%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full rounded-full shadow-sm" style={{ width: '10%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyObjectives;
