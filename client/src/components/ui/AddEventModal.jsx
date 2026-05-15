import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlanner } from '../../hooks/usePlanner';
import ConfirmDialog from './ConfirmDialog';

const ChippedBorder = ({ opacity = 0.8 }) => (
    <div 
      className="absolute inset-[-1px] rounded-sm pointer-events-none z-0"
      style={{
        border: '2px solid white',
        opacity,
        clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
      }}
    />
);

const AddEventModal = ({ isOpen, onClose, initialDate }) => {
    const { addTask, tasks } = usePlanner();
    const [step, setStep] = useState(1);
    const [month, setMonth] = useState('');
    const [isAnnual, setIsAnnual] = useState(false);
    const [isRange, setIsRange] = useState(false);
    const [dateInput, setDateInput] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startMonth, setStartMonth] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endMonth, setEndMonth] = useState('');
    const [eventTitle, setEventTitle] = useState('');
    const [eventColor, setEventColor] = useState('cyan');
    const [showConflictWarning, setShowConflictWarning] = useState(false);

    const months = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];

    const colors = [
        { id: 'cyan', bg: 'bg-cyan-500', border: 'border-cyan-500' },
        { id: 'rose', bg: 'bg-rose-500', border: 'border-rose-500' },
        { id: 'emerald', bg: 'bg-emerald-500', border: 'border-emerald-500' },
        { id: 'amber', bg: 'bg-amber-500', border: 'border-amber-500' },
        { id: 'purple', bg: 'bg-purple-500', border: 'border-purple-500' },
    ];

    useEffect(() => {
        if (isOpen && initialDate && initialDate instanceof Date) {
            const mIdx = initialDate.getMonth();
            const d = initialDate.getDate();
            const mName = months[mIdx];
            
            setMonth(mName);
            setDateInput(d.toString());
            setStartMonth(mName);
            setStartDate(d.toString());
        }
    }, [isOpen, initialDate]);

    const getDaysInMonth = (m) => {
        const monthIndex = months.indexOf(m);
        if (monthIndex === -1) return 31;
        return new Date(2026, monthIndex + 1, 0).getDate();
    };

    const maxDays = getDaysInMonth(month);
    const daysArray = Array.from({ length: maxDays }, (_, i) => i + 1);

    const resetAndClose = () => {
        setStep(1);
        setMonth('');
        setIsAnnual(false);
        setIsRange(false);
        setDateInput('');
        setStartDate('');
        setStartMonth('');
        setEndDate('');
        setEndMonth('');
        setEventTitle('');
        onClose();
    };

    const handleNext = async () => {
        if (step < 2) setStep(step + 1);
        else {
            if (!eventTitle.trim()) return;

            const currentYear = 2026;
            
            // CONFLICT CHECK: Max 2 range events per day
            if (isRange) {
                const sMonthIdx = months.indexOf(startMonth);
                const eMonthIdx = months.indexOf(endMonth);
                const startStr = `${currentYear}-${String(sMonthIdx + 1).padStart(2, '0')}-${String(startDate).padStart(2, '0')}`;
                const endStr = `${currentYear}-${String(eMonthIdx + 1).padStart(2, '0')}-${String(endDate).padStart(2, '0')}`;
                
                const start = new Date(startStr);
                const end = new Date(endStr);
                
                let hasConflict = false;
                // Check each day in the requested range
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0];
                    // Count existing range events for this date
                    const dayConflicts = tasks?.filter(t => t.type === 'event' && t.endDate && (
                        (dateStr >= t.date && dateStr <= t.endDate)
                    )) || [];
                    
                    if (dayConflicts.length >= 2) {
                        hasConflict = true;
                        break;
                    }
                }

                if (hasConflict) {
                    setShowConflictWarning(true);
                    return;
                }
            }

            let finalData = {
                title: eventTitle,
                type: 'event',
                color: eventColor,
                recurrence: isAnnual ? 'Annually' : 'Once'
            };

            if (isRange) {
                const sMonthIdx = months.indexOf(startMonth);
                const eMonthIdx = months.indexOf(endMonth);
                finalData.date = `${currentYear}-${String(sMonthIdx + 1).padStart(2, '0')}-${String(startDate).padStart(2, '0')}`;
                finalData.endDate = `${currentYear}-${String(eMonthIdx + 1).padStart(2, '0')}-${String(endDate).padStart(2, '0')}`;
            } else {
                const mIdx = months.indexOf(startMonth);
                finalData.date = `${currentYear}-${String(mIdx + 1).padStart(2, '0')}-${String(dateInput).padStart(2, '0')}`;
            }

            await addTask(finalData);
            resetAndClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={resetAndClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-md"
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-sm pt-6 px-6 pb-24 shadow-2xl overflow-hidden"
                >
                    <ChippedBorder opacity={0.2} />

                    <div className="relative z-10 flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">ADD EVENT</span>
                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">STEP {step} OF 2</span>
                            </div>
                            <button onClick={resetAndClose} className="material-symbols-outlined text-white/20 hover:text-white transition-colors">close</button>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex flex-col gap-4"
                                    >
                                        {/* Range Toggle at the very top */}
                                        <div 
                                            onClick={() => {
                                                const nextRange = !isRange;
                                                setIsRange(nextRange);
                                                
                                                if (nextRange) {
                                                    // Switching TO range mode
                                                    if (dateInput) {
                                                        setStartDate(dateInput);
                                                        setStartMonth(startMonth);
                                                        setEndDate('');
                                                        setEndMonth('');
                                                    }
                                                } else {
                                                    // Switching TO single mode
                                                    if (startDate) {
                                                        setDateInput(startDate);
                                                        setMonth(startMonth);
                                                        setStartMonth(startMonth);
                                                    }
                                                }
                                            }}
                                            className="flex items-center justify-between p-3.5 rounded-sm border border-white/5 bg-white/[0.02] cursor-pointer hover:border-white/20 transition-all group"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">DATE RANGE</span>
                                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest text-left">SET START AND END POINTS</span>
                                            </div>
                                            <div className={`size-5 border rounded-sm flex items-center justify-center transition-all ${isRange ? 'bg-white border-white' : 'bg-transparent border-white/20'}`}>
                                                {isRange && <span className="material-symbols-outlined text-black text-sm font-bold">check</span>}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">
                                                    {isRange ? "SELECT DATES:" : "SELECT DATE:"}
                                                </span>
                                                <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">
                                                    {month || "CHOOSE MONTH"}
                                                </span>
                                            </div>

                                            {/* Month Selector (Compact) */}
                                            <div className="grid grid-cols-6 gap-1 mb-2">
                                                {months.map(m => (
                                                    <button
                                                        key={m}
                                                        onClick={() => setMonth(m)}
                                                        className={`py-2 rounded-sm text-[8px] font-black uppercase tracking-widest transition-all border ${
                                                            month === m 
                                                            ? 'bg-white text-black border-transparent shadow-lg' 
                                                            : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                                                        }`}
                                                    >
                                                        {m.substring(0, 3)}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Grid Selector */}
                                            <div className="mt-2">
                                                <div className="grid grid-cols-7 gap-1">
                                                    {daysArray.map(d => {
                                                        const currentVal = months.indexOf(month) * 100 + d;
                                                        const startVal = startMonth ? months.indexOf(startMonth) * 100 + parseInt(startDate) : null;
                                                        const endVal = endMonth ? months.indexOf(endMonth) * 100 + parseInt(endDate) : null;

                                                        const isSelected = isRange 
                                                            ? (currentVal === startVal || currentVal === endVal)
                                                            : (d === parseInt(dateInput) && month === startMonth);
                                                        
                                                        const isInRange = isRange && startVal && endVal && 
                                                            currentVal > Math.min(startVal, endVal) && 
                                                            currentVal < Math.max(startVal, endVal);

                                                        return (
                                                            <button
                                                                key={d}
                                                                disabled={!month}
                                                                onClick={() => {
                                                                    if (isRange) {
                                                                        if (!startDate || (startDate && endDate)) {
                                                                            setStartDate(d.toString());
                                                                            setStartMonth(month);
                                                                            setEndDate('');
                                                                            setEndMonth('');
                                                                        } else {
                                                                            // Second selection: Check which is earlier
                                                                            const newVal = months.indexOf(month) * 100 + d;
                                                                            const oldVal = months.indexOf(startMonth) * 100 + parseInt(startDate);
                                                                            
                                                                            if (newVal < oldVal) {
                                                                                setEndDate(startDate);
                                                                                setEndMonth(startMonth);
                                                                                setStartDate(d.toString());
                                                                                setStartMonth(month);
                                                                            } else {
                                                                                setEndDate(d.toString());
                                                                                setEndMonth(month);
                                                                            }
                                                                        }
                                                                    } else {
                                                                        setDateInput(d.toString());
                                                                        setStartMonth(month);
                                                                    }
                                                                }}
                                                                className={`aspect-square flex items-center justify-center text-[9px] font-black rounded-sm border transition-all ${
                                                                    isSelected 
                                                                    ? 'bg-white text-black border-transparent shadow-lg scale-105 z-10' 
                                                                    : isInRange
                                                                    ? 'bg-white/20 border-transparent text-white'
                                                                    : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                                                                } disabled:opacity-5`}
                                                            >
                                                                {d}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <div className="mt-4 flex justify-between items-center px-1">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                                                        {isRange 
                                                            ? (startDate && endDate 
                                                                ? `RANGE: ${startMonth.substring(0,3)} ${startDate} - ${endMonth.substring(0,3)} ${endDate}` 
                                                                : startDate ? "SELECT END DATE..." : "SELECT START DATE...")
                                                            : (dateInput && startMonth ? `SELECTED: ${startMonth.substring(0,3)} ${dateInput}` : "SELECT SPECIFIC DAY...")
                                                        }
                                                    </span>
                                                    {(startDate || dateInput) && (
                                                        <button 
                                                            onClick={() => { 
                                                                setStartDate(''); setStartMonth(''); 
                                                                setEndDate(''); setEndMonth(''); 
                                                                setDateInput(''); 
                                                            }}
                                                            className="text-[8px] font-black text-rose-500/40 hover:text-rose-500 uppercase tracking-widest"
                                                        >
                                                            CLEAR
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            {(isRange ? (startDate && endDate) : (dateInput && startMonth)) && (
                                                <button onClick={() => setStep(2)} className="w-full p-3.5 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-sm hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                                    CONTINUE <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex flex-col gap-6"
                                    >
                                        <div className="flex flex-col gap-4">
                                            <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">EVENT NAME:</span>
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="WHAT IS THE EVENT?"
                                                value={eventTitle}
                                                onChange={(e) => setEventTitle(e.target.value.toUpperCase())}
                                                onKeyDown={(e) => e.key === 'Enter' && eventTitle && handleNext()}
                                                className="w-full p-3.5 bg-white/[0.02] border border-white/10 rounded-sm text-[10px] font-black uppercase tracking-[0.3em] text-white outline-none placeholder:text-white/10 focus:border-white/30 transition-all"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">PROTOCOL COLOR:</span>
                                            <div className="flex gap-3">
                                                {colors.map(c => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => setEventColor(c.id)}
                                                        className={`size-8 rounded-full transition-all border-2 flex items-center justify-center ${eventColor === c.id ? `${c.border} bg-white/10 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.1)]` : 'border-transparent bg-white/5 opacity-40 hover:opacity-100'}`}
                                                    >
                                                        <div className={`size-3 rounded-full ${c.bg}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">RECURRENCE PROTOCOL:</span>
                                            
                                            <div className="flex flex-col gap-3">
                                                {/* Annual Toggle */}
                                                <div 
                                                    onClick={() => setIsAnnual(!isAnnual)}
                                                    className="flex items-center justify-between p-3.5 rounded-sm border border-white/5 bg-white/[0.02] cursor-pointer hover:border-white/20 transition-all group"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">REPEAT EVERY YEAR</span>
                                                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest text-left">ONCE A YEAR ON THIS DATE</span>
                                                    </div>
                                                    <div className={`size-5 border rounded-sm flex items-center justify-center transition-all ${isAnnual ? 'bg-white border-white' : 'bg-transparent border-white/20'}`}>
                                                        {isAnnual && <span className="material-symbols-outlined text-black text-sm font-bold">check</span>}
                                                    </div>
                                                </div>

                                                <div className="px-1">
                                                    {!isAnnual ? (
                                                        <p className="text-[8px] font-black text-cyan-500 uppercase tracking-widest animate-pulse">
                                                            PROTOCOL: ONE-TIME EVENT (NO RECURRENCE)
                                                        </p>
                                                    ) : (
                                                        <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">
                                                            PROTOCOL: ANNUAL RECURRENCE ACTIVE
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col gap-2 mt-2">
                                            <button
                                                onClick={handleNext}
                                                disabled={!eventTitle.trim()}
                                                className="w-full p-3.5 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-sm hover:bg-white/90 disabled:opacity-20 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                            >
                                                CONFIRM EVENT <span className="material-symbols-outlined text-sm">event_available</span>
                                            </button>
                                            <button onClick={() => setStep(1)} className="text-[8px] font-black text-white/20 hover:text-white/40 uppercase tracking-widest text-center mt-2">REVISE DATE</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Decorative Background Icon */}
                    <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none">
                        <span className="material-symbols-outlined text-8xl">event</span>
                    </div>
                </motion.div>
            </div>
            <ConfirmDialog 
                isOpen={showConflictWarning}
                title="PROTOCOL CONFLICT"
                message="MAXIMUM RANGE CAPACITY REACHED. YOU CANNOT DEPLOY MORE THAN 2 CONCURRENT RANGE EVENTS ON THE SAME TIMELINE. PLEASE TERMINATE 1 CONFLICTING EVENT BEFORE PROCEEDING."
                confirmLabel="UNDERSTOOD"
                cancelLabel="ABORT"
                onConfirm={() => setShowConflictWarning(false)}
                onCancel={() => setShowConflictWarning(false)}
            />
        </AnimatePresence>
    );
};

export default AddEventModal;
