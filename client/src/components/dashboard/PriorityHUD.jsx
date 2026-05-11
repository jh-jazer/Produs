import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlanner } from '../../hooks/usePlanner';

const ChippedBorder = ({ opacity = 0.8 }) => (
  <div
    className="absolute inset-[-2px] rounded-sm pointer-events-none z-0"
    style={{
      border: '4px solid currentColor',
      opacity,
      clipPath:
        'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)',
    }}
  />
);

export default function PriorityHUD() {
  const today = new Date();
  const { tasks, toggleComplete, isLoading } = usePlanner(today);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const itemsPerPage = 4;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalPages = Math.ceil((tasks?.length || 0) / itemsPerPage);
  const currentTasks = (tasks || []).slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const formattedDate = currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [tasks?.length, totalPages, currentPage]);

  const handleToggle = async (taskId) => {
    await toggleComplete(taskId);
  };

  return (
    <div className="flex md:col-span-3 flex-col bg-foreground/[0.02] rounded-sm p-8 h-[45vh] md:h-[380px] hover:bg-foreground/[0.04] transition-all group relative overflow-hidden">
      <ChippedBorder opacity={0.7} />

      {/* Header */}
      <div className="mb-10 flex justify-between items-start relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/40">PRIORITY LIST</span>
          <span className="text-[8px] font-mono uppercase tracking-widest opacity-20">DAILY OBJECTIVES</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[14px] font-black tracking-tighter leading-none">{formattedTime}</span>
          <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">{formattedDate}</span>
        </div>
      </div>

      {/* Paginated list */}
      <div className="flex-1 relative flex flex-col z-10 overflow-hidden">
        {/* Content */}
        <div className="flex-1 flex flex-col gap-3">
          {isLoading ? (
            <div className="flex flex-col gap-4 opacity-20 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-white/10 rounded-sm w-full" />
              ))}
            </div>
          ) : currentTasks.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                {currentTasks.map((task) => {
                  return (
                    <motion.div
                      key={task._id}
                      whileHover={{ x: 4 }}
                      className={`flex items-center gap-4 p-4 border rounded-sm transition-all group/item cursor-pointer ${
                        task.completed
                          ? 'bg-foreground/[0.05] border-foreground/20'
                          : 'bg-foreground/[0.01] border-foreground/5 hover:border-foreground/10'
                      }`}
                      onClick={() => handleToggle(task._id)}
                    >
                      {/* Checkbox */}
                      <div
                        className={`size-5 border-2 rounded-sm shrink-0 flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-foreground border-foreground'
                            : 'border-foreground/20 group-hover/item:border-foreground/40'
                        }`}
                      >
                        {task.completed && (
                          <span className="material-symbols-outlined text-background text-sm font-bold">
                            check
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span
                          className={`text-[11px] font-black uppercase tracking-wider truncate ${
                            task.completed
                              ? 'opacity-100'
                              : 'opacity-40 group-hover/item:opacity-70'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-[8px] font-mono opacity-20 tracking-tighter uppercase">
                          {task.startTime && task.endTime ? `${task.startTime} - ${task.endTime}` : 'NO SCHEDULE'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full opacity-40 text-center gap-6 py-8">
              <span className="material-symbols-outlined text-4xl opacity-20">checklist</span>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                  NO_ACTIVE_TASKS
                </span>
                <span className="text-[8px] font-mono opacity-40 uppercase">
                  CLEAR_FOR_TODAY
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-auto pt-6 flex items-center justify-between border-t border-foreground/5">
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 transition-all duration-300 ${
                    currentPage === i ? 'w-4 bg-foreground' : 'w-1 bg-foreground/20'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="size-8 flex items-center justify-center border border-foreground/10 hover:border-foreground/40 disabled:opacity-10 transition-all"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="size-8 flex items-center justify-center border border-foreground/10 hover:border-foreground/40 disabled:opacity-10 transition-all"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
