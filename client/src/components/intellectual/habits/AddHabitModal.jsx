import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export const ICON_OPTIONS = [
    { icon: 'local_drink', label: 'Water' },
    { icon: 'menu_book', label: 'Reading' },
    { icon: 'directions_run', label: 'Running' },
    { icon: 'self_improvement', label: 'Meditation' },
    { icon: 'fitness_center', label: 'Gym' },
    { icon: 'code', label: 'Coding' },
    { icon: 'bedtime', label: 'Sleep' },
    { icon: 'restaurant', label: 'Nutrition' },
    { icon: 'brush', label: 'Creative' },
    { icon: 'school', label: 'Study' },
    { icon: 'music_note', label: 'Music' },
    { icon: 'favorite', label: 'Wellness' },
];

const AddHabitModal = ({ isOpen, onClose, onAdd }) => {
    const [newHabit, setNewHabit] = useState({ name: '', icon: 'local_drink', color: 'white', isShared: false, category: 'INT' });

    if (!isOpen) return null;

    const handleAdd = async () => {
        if (!newHabit.name.trim()) return;
        await onAdd({ ...newHabit, name: newHabit.name.trim() });
        setNewHabit({ name: '', icon: 'local_drink', color: 'white', isShared: false, category: 'INT' });
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 backdrop-blur-md">
            <div className="absolute inset-0 bg-black/80" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#0a0a0a] border-4 border-white p-8 shadow-[0_0_100px_rgba(255,255,255,0.1)]">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white">ADD NEW HABIT</h3>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">HABIT NAME</span>
                        <div className="flex gap-2">
                            <div className="size-14 shrink-0 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm">
                                <span className="material-symbols-outlined text-2xl text-white/60">{newHabit.icon}</span>
                            </div>
                            <input 
                                autoFocus
                                value={newHabit.name}
                                onChange={e => setNewHabit({...newHabit, name: e.target.value})}
                                placeholder="ENTER HABIT NAME..."
                                className="flex-1 bg-white/5 border border-white/10 p-4 text-sm font-black uppercase tracking-widest text-white focus:border-white transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">SELECT ICON</span>
                        <div className="grid grid-cols-6 gap-2 bg-white/5 p-4 border border-white/10">
                            {ICON_OPTIONS.map(opt => (
                                <button 
                                    key={opt.icon}
                                    type="button"
                                    onClick={() => setNewHabit({...newHabit, icon: opt.icon})}
                                    className={`size-10 flex items-center justify-center rounded-sm transition-all ${newHabit.icon === opt.icon ? 'bg-white text-black' : 'hover:bg-white/10 text-white/40'}`}
                                >
                                    <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">CATEGORY</span>
                        <div className="grid grid-cols-6 gap-1">
                            {['STR', 'INT', 'WIS', 'DEX', 'CHA', 'END'].map(cat => (
                                <button 
                                    key={cat} 
                                    type="button"
                                    onClick={() => setNewHabit({...newHabit, category: cat})}
                                    className={`p-3 border text-[10px] font-black tracking-widest transition-all ${newHabit.category === cat ? 'bg-white text-black border-white' : 'border-white/10 text-white/40'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={handleAdd} className="mt-4 w-full py-6 bg-white text-black font-black uppercase tracking-[0.5em] text-xs hover:bg-white/90 active:scale-95 transition-all">
                        ADD HABIT
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AddHabitModal;
