import React from 'react';
import { motion } from 'framer-motion';
import { useGoals } from '../../../hooks/useGoals';

const WeeklyView = ({ onBack }) => {
    const today = new Date();
    
    const dayOfMonth = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get total days in month
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const weekRanges = [
        { start: 1, end: 7, label: '1ST WEEK' },
        { start: 8, end: 14, label: '2ND WEEK' },
        { start: 15, end: 21, label: '3RD WEEK' },
        { start: 22, end: 28, label: '4TH WEEK' },
    ];

    if (totalDays > 28) {
        weekRanges.push({ start: 29, end: totalDays, label: '5TH WEEK' });
    }

    // Initialize selected week based on current date
    const initialWeekIdx = weekRanges.findIndex(range => dayOfMonth >= range.start && dayOfMonth <= range.end);
    const [selectedWeekIdx, setSelectedWeekIdx] = React.useState(initialWeekIdx !== -1 ? initialWeekIdx : 0);
    const [isAdding, setIsAdding] = React.useState(false);
    const [newGoalText, setNewGoalText] = React.useState('');

    const weeks = weekRanges.map((range, idx) => {
        const isCurrent = dayOfMonth >= range.start && dayOfMonth <= range.end;
        const monthName = today.toLocaleDateString('en-US', { month: 'short' });
        
        return {
            id: idx + 1,
            label: range.label,
            isCurrent: isCurrent,
            dateRange: `${monthName} ${range.start} - ${monthName} ${range.end}`
        };
    });

    const selectedWeek = weeks[selectedWeekIdx];

    // Use actual goals data
    const { goals, addGoal, toggleGoal, deleteGoal } = useGoals({
        period: 'weekly',
        year: currentYear,
        month: currentMonth,
        week: selectedWeek.id
    });

    const handleAddGoal = async () => {
        if (!newGoalText.trim()) {
            setIsAdding(false);
            return;
        }
        await addGoal({
            title: newGoalText.trim(),
            period: 'weekly',
            year: currentYear,
            month: currentMonth,
            week: selectedWeek.id,
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
            <div className="grid grid-cols-3 gap-4 md:gap-6 flex-1">
                {/* Columns 1 & 2: Goal List */}
                <div className="col-span-2 flex flex-col gap-4 border border-white/5 bg-white/[0.01] p-4 md:p-6 rounded-sm overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">{selectedWeek.label}</span>
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
                                    placeholder="TYPE GOAL TITLE..."
                                />
                            </div>
                        ) : (
                            <div 
                                onClick={() => setIsAdding(true)}
                                className="group relative flex items-center justify-between p-4 bg-white/[0.03] border border-dashed border-white/10 rounded-sm hover:bg-white/5 hover:border-white/30 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-white/40 group-hover:text-white transition-colors">add</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">ADD NEW GOAL</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 3: Week Selector */}
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase mb-1 pb-6">SELECT</span>
                    {weeks.map((week, idx) => (
                        <motion.div
                            key={idx}
                            onClick={() => setSelectedWeekIdx(idx)}
                            className={`relative p-4 border rounded-sm flex flex-col gap-1 transition-all cursor-pointer group overflow-hidden ${
                                selectedWeekIdx === idx 
                                ? 'bg-white/[0.08] border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                                : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
                            }`}
                        >
                            {week.isCurrent && (
                                <div className="absolute top-3 right-3 size-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                            )}
                            
                            <span className={`text-[10px] font-black tracking-[0.4em] uppercase transition-all ${selectedWeekIdx === idx ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-white/40 group-hover:text-white/60'}`}>
                                {week.label}
                            </span>
                            <span className={`text-[8px] font-mono tracking-widest ${selectedWeekIdx === idx ? 'text-white/40' : 'text-white/10'}`}>
                                {week.dateRange}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeeklyView;
