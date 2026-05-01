import React, { useState, useEffect } from "react";
import { usePlanner } from '../../../hooks/usePlanner';
import { motion } from 'framer-motion';

const Priority = ({
  isCompact = false,
  viewMode = "me",
  isReadOnly = false,
  onFlip,
}) => {
  const today = new Date();
  const { tasks, toggleComplete, isLoading } = usePlanner(today);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getActiveTask = () => {
    if (!tasks) return null;
    const nowStr = currentTime.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    return tasks.find((t) => {
      if (!t.startTime || !t.endTime) return false;
      return nowStr >= t.startTime && nowStr <= t.endTime;
    });
  };

  const activeTask = getActiveTask();
  const otherTasks = tasks?.filter((t) => t._id !== activeTask?._id) || [];
  const events = otherTasks.filter((t) => t.type === "event");
  const todoTasks = otherTasks.filter((t) => t.type === "task" || !t.type);

  const handleToggle = async (task) => {
    if (isReadOnly) return;
    await toggleComplete(task._id);
  };

  return (
    <div className={`flex flex-col text-white font-sans ${isCompact ? "gap-6" : "gap-8"} relative`}>
      <button 
        onClick={onFlip}
        className="absolute -top-16 right-0 size-10 flex items-center justify-center border border-white/20 hover:bg-white hover:text-black transition-all active:scale-95 z-20"
      >
        <span className="material-symbols-outlined text-sm font-bold italic">east</span>
      </button>

      {/* Active Now Section */}
      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">CURRENT STATUS</span>
        {activeTask ? (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-white text-black rounded-sm relative overflow-hidden group shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
          >
            <div className="absolute top-[-10px] right-[-10px] opacity-10 rotate-12 scale-150">
              <span className="material-symbols-outlined text-[80px]">bolt</span>
            </div>
            <div className="relative z-10 flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">ACTIVE TASK</span>
              <h5 className="text-2xl font-black uppercase tracking-tighter leading-none">{activeTask.title}</h5>
              <div className="flex items-center gap-2 mt-4 text-[10px] font-bold opacity-60 italic">
                <span className="material-symbols-outlined text-xs">schedule</span>
                <span>{activeTask.startTime} - {activeTask.endTime}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="p-8 border-2 border-dashed border-white/5 rounded-sm flex flex-col items-center justify-center text-center gap-2 opacity-30">
            <span className="material-symbols-outlined text-3xl">terminal</span>
            <span className="text-[10px] font-black uppercase tracking-widest">NO ACTIVE TASKS</span>
          </div>
        )}
      </div>

      {/* Briefing Section */}
      {!isCompact && (
        <div className="flex flex-col gap-6">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">DAILY BRIEFING</span>
          <div className="flex flex-col gap-3">
            {events.length > 0 && events.map((event) => (
              <div key={event._id} className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-sm group hover:bg-white/[0.05] transition-all">
                <div className="size-2 bg-white/40 rounded-full group-hover:scale-125 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wide flex-1 opacity-80">{event.title}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">EVENT</span>
              </div>
            ))}

            {todoTasks.length > 0 ? (
              todoTasks.map((task) => (
                <motion.div
                  key={task._id}
                  whileHover={{ x: 4 }}
                  onClick={() => handleToggle(task)}
                  className={`flex items-center gap-4 p-4 border transition-all cursor-pointer rounded-sm ${
                    task.completed 
                      ? "bg-white/[0.02] border-white/5 opacity-30" 
                      : "bg-white/[0.04] border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className={`size-4 border-2 rounded-sm shrink-0 flex items-center justify-center transition-all ${
                    task.completed ? "bg-white border-white" : "border-white/20"
                  }`}>
                    {task.completed && <span className="material-symbols-outlined text-black text-[10px] font-bold">check</span>}
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-wider flex-1 ${task.completed ? "line-through opacity-40" : "opacity-90"}`}>
                    {task.title}
                  </span>
                  {task.startTime && (
                    <span className="text-[9px] font-mono opacity-20 uppercase">{task.startTime}</span>
                  )}
                </motion.div>
              ))
            ) : (
              events.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 opacity-10">
                  <span className="material-symbols-outlined text-2xl">inbox</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">CLEAR FOR TODAY</span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Priority;
