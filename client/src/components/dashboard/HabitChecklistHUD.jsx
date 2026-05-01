import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useHabits } from '../../hooks/useHabits';
import AddHabitModal from '../intellectual/habits/AddHabitModal';

const ChippedBorder = ({ opacity = 0.8 }) => (
  <div
    className="absolute inset-[-2px] rounded-sm pointer-events-none z-0"
    style={{
      border: '4px solid white',
      opacity,
      clipPath:
        'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)',
    }}
  />
);

export default function HabitChecklistHUD() {
  const { habits, toggleCheck, initHabits, addHabit, isLoading: habitsLoading } = useHabits();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [thumbHeight, setThumbHeight] = useState(30);

  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const thumbTop = useTransform(scrollYProgress, [0, 1], ['0%', `${100 - thumbHeight}%`]);

  const today = new Date().toISOString().split('T')[0];

  // Recalculate thumb height whenever habits or loading state changes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const calculate = () => {
      const { scrollHeight, clientHeight } = el;
      if (scrollHeight > clientHeight) {
        setThumbHeight(Math.max((clientHeight / scrollHeight) * 100, 10));
      } else {
        setThumbHeight(100);
      }
    };

    calculate();
    window.addEventListener('resize', calculate);

    // Recalculate after DOM settles
    const timer = setTimeout(calculate, 150);

    return () => {
      window.removeEventListener('resize', calculate);
      clearTimeout(timer);
    };
  }, [habits, habitsLoading]);

  const handleSyncHabits = async () => {
    setIsSyncing(true);
    await initHabits();
    setIsSyncing(false);
  };

  const handleCreateHabit = async (habitData) => {
    await addHabit(habitData);
  };

  return (
    <div className="flex md:col-span-3 flex-col bg-white/[0.02] rounded-sm p-8 h-[70vh] md:h-[500px] hover:bg-white/[0.04] transition-all group relative overflow-hidden">
      <ChippedBorder opacity={0.7} />

      {/* Header */}
      <div className="mb-10 flex justify-between items-center relative z-10">
        <span className="text-xs font-black uppercase tracking-[0.6em] text-white/60">CHECKLIST</span>
        <button
          onClick={() => setAddModalOpen((prev) => !prev)}
          className={`size-8 flex items-center justify-center border-2 transition-all active:scale-95 ${
            addModalOpen
              ? 'bg-white border-white text-black'
              : 'border-white/20 hover:border-white text-white/40 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {addModalOpen ? 'close' : 'add'}
          </span>
        </button>
      </div>

      {/* Add Habit Modal */}
      <AddHabitModal 
        isOpen={addModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        onAdd={handleCreateHabit} 
      />

      {/* Scrollable list with custom scrollbar */}
      <div className="flex-1 relative overflow-hidden flex flex-col z-10">

        {/* Scroll track + thumb */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/20 pointer-events-none z-20">
          <motion.div
            className="absolute w-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            style={{
              height: `${thumbHeight}%`,
              top: thumbTop,
            }}
          />
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto pr-6 flex flex-col gap-3 overscroll-contain"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {habitsLoading ? (
            <div className="flex flex-col gap-4 opacity-20 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-white/10 rounded-sm w-full" />
              ))}
            </div>
          ) : habits.length > 0 ? (
            habits.map((habit) => {
              const isCompleted = habit.checks?.some(
                (c) => c.date === today && c.completed
              );
              return (
                <motion.div
                  key={habit._id}
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-4 p-4 border rounded-sm transition-all group/item cursor-pointer ${
                    isCompleted
                      ? 'bg-white/[0.05] border-white/20'
                      : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                  }`}
                  onClick={() => toggleCheck(habit._id, today)}
                >
                  {/* Checkbox */}
                  <div
                    className={`size-5 border-2 rounded-sm shrink-0 flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-white border-white'
                        : 'border-white/20 group-hover/item:border-white/40'
                    }`}
                  >
                    {isCompleted && (
                      <span className="material-symbols-outlined text-black text-sm font-bold">
                        check
                      </span>
                    )}
                  </div>
                  {/* Icon */}
                  <div className="shrink-0 flex items-center justify-center size-8 bg-white/5 rounded-sm border border-white/5 group-hover/item:border-white/10 transition-all">
                    <span className="material-symbols-outlined text-white/40 text-lg group-hover/item:text-white/80 transition-colors">
                      {habit.icon}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider truncate ${
                        isCompleted
                          ? 'opacity-100'
                          : 'opacity-40 group-hover/item:opacity-70'
                      }`}
                    >
                      {habit.name}
                    </span>
                    <span className="text-[8px] font-mono opacity-20 tracking-tighter uppercase">
                      Streak: {habit.streak || 0}d
                    </span>
                  </div>
                </motion.div>
              );
            })
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full opacity-40 text-center gap-6 py-8">
              <span className="material-symbols-outlined text-4xl opacity-20">rule</span>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                  No_Active_Habits
                </span>
                <span className="text-[8px] font-mono opacity-40 uppercase">
                  System_Modules_Offline
                </span>
              </div>
              <button
                onClick={handleSyncHabits}
                disabled={isSyncing}
                className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
              >
                {isSyncing ? 'Syncing...' : 'Sync_Core_Modules'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}