import React from 'react';
import { motion } from 'framer-motion';
import { useGoals } from '../../../hooks/useGoals';

const YearlyView = ({ onBack }) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Generate 12 year range
    const years = Array.from({ length: 12 }, (_, i) => currentYear + i);

    const [selectedYear, setSelectedYear] = React.useState(currentYear);
    const [isAdding, setIsAdding] = React.useState(false);
    const [newGoalText, setNewGoalText] = React.useState('');

    // Use actual goals data for the selected year
    const { goals, addGoal, toggleGoal, deleteGoal } = useGoals({
        period: 'yearly',
        year: selectedYear
    });

    const handleAddGoal = async () => {
        if (!newGoalText.trim()) {
            setIsAdding(false);
            return;
        }
        await addGoal({
            title: newGoalText.trim(),
            period: 'yearly',
            year: selectedYear,
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
            <div className="grid grid-cols-3 gap-4 md:gap-6 flex-1 overflow-hidden">
                {/* Columns 1 & 2: Goal List */}
                <div className="col-span-2 flex flex-col gap-4 border border-white/5 bg-white/[0.01] p-4 md:p-6 rounded-sm overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">{selectedYear}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-white/20 tracking-widest uppercase">STATUS</span>
                            <span className="text-lg font-mono font-black text-white">{completionRate}% COMPLETE</span>
                        </div>
                    </div>

                    {/* Goals List */}
                    <div className="flex flex-col gap-2">
                        {goals.map((goal) => (
                            <div 
                                key={goal._id} 
                                onClick={() => toggleGoal(goal._id)}
                                className="group relative flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-sm hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`size-2 rounded-full transition-all ${goal.completed ? 'bg-white shadow-[0_0_8px_white]' : 'bg-white/10'}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${goal.completed ? 'text-white line-through opacity-40' : 'text-white'}`}>
                                        {goal.title}
                                    </span>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteGoal(goal._id); }}
                                    className="material-symbols-outlined text-white/10 hover:text-red-500 transition-colors text-sm"
                                >
                                    delete
                                </button>
                            </div>
                        ))}

                        {isAdding ? (
                            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/20 rounded-sm">
                                <div className="size-2 rounded-full bg-white animate-pulse" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={newGoalText}
                                    onChange={(e) => setNewGoalText(e.target.value)}
                                    onBlur={handleAddGoal}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                                    className="flex-1 bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-white placeholder:text-white/20"
                                    placeholder="TYPE STRATEGIC GOAL..."
                                />
                            </div>
                        ) : (
                            <div 
                                onClick={() => setIsAdding(true)}
                                className="group relative flex items-center justify-between p-4 bg-white/[0.03] border border-dashed border-white/10 rounded-sm hover:bg-white/5 hover:border-white/30 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-white/40 group-hover:text-white transition-colors">add</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">ADD YEARLY GOAL</span>
                                </div>
                            </div>
                        )}


                    </div>
                </div>

                {/* Column 3: Year Selector */}
                <div className="flex flex-col h-full overflow-hidden">
                    <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase pb-6">SELECT</span>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2">
                        {years.map((year, idx) => (
                        <motion.div
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`relative py-12 px-6 border rounded-sm flex flex-col gap-2 transition-all cursor-pointer group overflow-hidden ${
                                selectedYear === year 
                                ? 'bg-white/[0.08] border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                                : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
                            }`}
                        >
                            {currentYear === year && (
                                <div className="absolute top-2.5 right-2.5 size-1 rounded-full bg-white shadow-[0_0_8px_white]" />
                            )}
                            
                            <span className={`text-[12px] font-black tracking-[0.3em] uppercase transition-all ${selectedYear === year ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-white/40 group-hover:text-white/60'}`}>
                                {year}
                            </span>
                            <span className={`text-[7px] font-mono tracking-[0.5em] uppercase ${selectedYear === year ? 'text-white/40' : 'text-white/10'}`}>
                                FISCAL PERIOD
                            </span>
                        </motion.div>
                    ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YearlyView;
