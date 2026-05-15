import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoals } from '../../hooks/useGoals';

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

const AddGoalModal = ({ isOpen, onClose }) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    const [step, setStep] = useState(1);
    const [type, setType] = useState('weekly'); // 'weekly' | 'monthly' | 'yearly'
    const [period, setPeriod] = useState(1);
    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { addGoal } = useGoals();

    const months = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];

    const weeks = ["1ST WEEK", "2ND WEEK", "3RD WEEK", "4TH WEEK", "5TH WEEK"];
    const years = Array.from({ length: 12 }, (_, i) => currentYear + i);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setTitle('');
            setType('weekly');
            setPeriod(1);
        }
    }, [isOpen]);

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleSubmit = async () => {
        if (!title.trim()) return;
        setIsSubmitting(true);
        
        const goalData = {
            title: title.trim(),
            period: type,
            year: type === 'yearly' ? period : currentYear,
            month: type === 'monthly' ? period : (type === 'weekly' ? currentMonth : undefined),
            week: type === 'weekly' ? period : undefined,
            completed: false
        };

        await addGoal(goalData);
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
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
                                <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">ADD NEW GOAL</span>
                            <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">STEP {step} OF 3</span>
                        </div>
                        <button onClick={onClose} className="material-symbols-outlined text-white/20 hover:text-white transition-colors">close</button>
                    </div>

                    {/* Step 1: Type Selection */}
                    {step === 1 && (
                        <div className="flex flex-col gap-4">
                            <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">SELECT SCALE:</span>
                            <div className="grid grid-cols-1 gap-2">
                                {['weekly', 'monthly', 'yearly'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => { setType(t); setStep(2); }}
                                        className="w-full p-3.5 border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/20 transition-all rounded-sm flex items-center justify-between group"
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white">{t}</span>
                                        <span className="material-symbols-outlined text-white/10 group-hover:text-white transition-all transform group-hover:translate-x-1">chevron_right</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Period Selection */}
                    {step === 2 && (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">SELECT {type}:</span>
                                
                                <div className={`grid gap-2 ${type === 'weekly' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                                    {type === 'weekly' && weeks.map((w, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setPeriod(i + 1); setStep(3); }}
                                            className={`p-3 border rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${
                                                period === i + 1 
                                                ? 'bg-white text-black border-white' 
                                                : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                                            }`}
                                        >
                                            {w}
                                        </button>
                                    ))}
                                    
                                    {type === 'monthly' && months.map((m, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setPeriod(i); setStep(3); }}
                                            className={`py-3 px-1 border rounded-sm text-[8px] font-black uppercase tracking-widest transition-all ${
                                                period === i 
                                                ? 'bg-white text-black border-white' 
                                                : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                                            }`}
                                        >
                                            {m.substring(0, 3)}
                                        </button>
                                    ))}
                                    
                                    {type === 'yearly' && years.map((y) => (
                                        <button
                                            key={y}
                                            onClick={() => { setPeriod(y); setStep(3); }}
                                            className={`py-3 border rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${
                                                period === y 
                                                ? 'bg-white text-black border-white' 
                                                : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                                            }`}
                                        >
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setStep(1)} className="text-[8px] font-black text-white/20 hover:text-white/40 uppercase tracking-widest text-left">BACK TO SCALE</button>
                        </div>
                    )}

                    {/* Step 3: Title Input */}
                    {step === 3 && (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">GOAL TITLE:</span>
                                <input
                                    autoFocus
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                    className="w-full p-3.5 bg-white/[0.02] border border-white/10 rounded-sm text-[10px] font-black uppercase tracking-[0.3em] text-white outline-none placeholder:text-white/10 focus:border-white/30 transition-all"
                                    placeholder="TYPE GOAL TITLE..."
                                />
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!title.trim() || isSubmitting}
                                    className="w-full p-3.5 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-sm hover:bg-white/90 disabled:opacity-20 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <>CREATE GOAL <span className="material-symbols-outlined text-sm">rocket_launch</span></>
                                    )}
                                </button>
                                <button onClick={() => setStep(2)} className="text-[8px] font-black text-white/20 hover:text-white/40 uppercase tracking-widest text-center mt-2">REVISE PERIOD</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-8xl">target</span>
                </div>
            </motion.div>
        </div>
    );
};

export default AddGoalModal;
