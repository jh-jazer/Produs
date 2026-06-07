import React from 'react';
import { motion } from 'framer-motion';
import { useGoals } from '../../../hooks/useGoals';
import SyncErrorToast from '../../ui/SyncErrorToast';

const MonthlyView = ({ onBack }) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const months = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];

    const [selectedMonthIdx, setSelectedMonthIdx] = React.useState(currentMonth);
    const [isAdding, setIsAdding] = React.useState(false);
    const [newGoalText, setNewGoalText] = React.useState('');
    const [showErrorToast, setShowErrorToast] = React.useState(false);

    // Use actual goals data for the selected month
    const { goals, addGoal, toggleGoal, deleteGoal } = useGoals({
        period: 'monthly',
        year: currentYear,
        month: selectedMonthIdx
    });

    const handleAddGoal = async () => {
        if (!newGoalText.trim()) {
            setIsAdding(false);
            return;
        }
        await addGoal({
            title: newGoalText.trim(),
            period: 'monthly',
            year: currentYear,
            month: selectedMonthIdx,
            completed: false
        });
        setNewGoalText('');
        setIsAdding(false);
    };

    const completionRate = goals.length > 0 
        ? Math.round((goals.filter(g => g.completed).length / goals.length) * 100) 
        : 0;

    return (
        <div className="flex flex-col gap-6 w-full h-[400px] md:h-[508px]">
            <SyncErrorToast show={showErrorToast} onDismiss={() => setShowErrorToast(false)} />
            <div className="grid grid-cols-3 gap-4 md:gap-6 flex-1 overflow-hidden">
                {/* Columns 1 & 2: Goal List */}
                <div className="col-span-2 flex flex-col gap-4 border border-black/10 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] p-4 md:p-6 rounded-sm overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-end border-b border-black/10 dark:border-white/10 pb-4 mb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-black/50 dark:text-white/40 tracking-[0.4em] uppercase">{months[selectedMonthIdx]} {currentYear}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-black/30 dark:text-white/20 tracking-widest uppercase">STATUS</span>
                            <span className="text-lg font-mono font-black text-black dark:text-white">{completionRate}% COMPLETE</span>
                        </div>
                    </div>

                    {/* Goals List */}
                    <div className="flex flex-col gap-2">
                        {goals.map((goal) => (
                            <div 
                                key={goal._id} 
                                onClick={async () => {
                                    const result = await toggleGoal(goal._id);
                                    if (result?.error) setShowErrorToast(true);
                                }}
                                className="group relative flex items-center justify-between p-4 bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/5 rounded-sm hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/30 dark:hover:border-white/20 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`size-2 rounded-full transition-all ${goal.completed ? 'bg-black dark:bg-white shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_8px_white]' : 'bg-black/20 dark:bg-white/10'}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${goal.completed ? 'text-black/40 dark:text-white/30 line-through' : 'text-black/80 dark:text-white/80'}`}>
                                        {goal.title}
                                    </span>
                                </div>
                                <button 
                                    onClick={async (e) => { e.stopPropagation(); const result = await deleteGoal(goal._id); if (result?.error) setShowErrorToast(true); }}
                                    className="material-symbols-outlined text-black/20 dark:text-white/10 hover:text-red-500 transition-colors text-sm"
                                >
                                    delete
                                </button>
                            </div>
                        ))}

                        {isAdding ? (
                            <div className="flex items-center gap-4 p-4 bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-sm">
                                <div className="size-2 rounded-full bg-black dark:bg-white animate-pulse" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={newGoalText}
                                    onChange={(e) => setNewGoalText(e.target.value)}
                                    onBlur={handleAddGoal}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                                    className="flex-1 bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20"
                                    placeholder="TYPE MONTHLY GOAL..."
                                />
                            </div>
                        ) : (
                            <div 
                                onClick={() => setIsAdding(true)}
                                className="group relative flex items-center justify-between p-4 bg-black/[0.01] dark:bg-white/[0.03] border border-dashed border-black/15 dark:border-white/10 rounded-sm hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/40 dark:hover:border-white/30 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white transition-colors">add</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white">ADD MONTHLY GOAL</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 3: Month Selector */}
                <div className="flex flex-col h-full overflow-hidden">
                    <span className="text-[10px] font-black text-black/40 dark:text-white/40 tracking-[0.4em] uppercase pb-6">SELECT</span>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2">
                        {months.map((month, idx) => (
                        <motion.div
                            key={idx}
                            onClick={() => setSelectedMonthIdx(idx)}
                            className={`relative py-8 px-6 border rounded-sm flex flex-col gap-1 transition-all cursor-pointer group overflow-hidden ${
                                selectedMonthIdx === idx 
                                ? 'bg-black/5 dark:bg-white/[0.08] border-black/30 dark:border-white/30 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                                : 'bg-black/[0.01] dark:bg-white/[0.02] border-black/15 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/[0.05]'
                            }`}
                        >
                            {currentMonth === idx && (
                                <div className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-black dark:bg-white shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_8px_white]" />
                            )}
                            
                            <span className={`text-[10px] font-black tracking-[0.3em] uppercase transition-all ${selectedMonthIdx === idx ? 'text-black dark:text-white' : 'text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60'}`}>
                                {month}
                            </span>
                            <span className={`text-[7px] font-mono tracking-widest ${selectedMonthIdx === idx ? 'text-black/40 dark:text-white/40' : 'text-black/15 dark:text-white/10'}`}>
                                {currentYear}
                            </span>
                        </motion.div>
                    ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyView;
