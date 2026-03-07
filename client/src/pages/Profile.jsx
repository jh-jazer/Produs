import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

function Profile() {
    const { user, updateSettings } = useAuthStore();
    const [topHabits, setTopHabits] = useState([]);
    const [currentTasks, setCurrentTasks] = useState([]);
    const [wishlistInput, setWishlistInput] = useState("");
    const [wishlist, setWishlist] = useState(user?.settings?.wishlist || []);
    const [mood, setMood] = useState(user?.settings?.mood || "neutral");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Fetch habits to calculate top streaks
                const habitsRes = await api.get('/habits');
                const sortedHabits = habitsRes.data.sort((a, b) => b.streak - a.streak).slice(0, 3);
                setTopHabits(sortedHabits);

                // Fetch tasks for today's focus
                const today = new Date().toISOString().split('T')[0];
                const plannerRes = await api.get(`/planner/tasks?date=${today}`);
                // Simple sort by priority for focus
                const sortedTasks = plannerRes.data.sort((a, b) => {
                    const priorityScore = { high: 3, medium: 2, low: 1, none: 0 };
                    return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
                }).slice(0, 3);
                setCurrentTasks(sortedTasks);

            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleAddWishlist = async (e) => {
        e.preventDefault();
        if (!wishlistInput.trim()) return;

        const newItem = { id: Date.now().toString(), text: wishlistInput, completed: false };
        const newWishlist = [...wishlist, newItem];

        setWishlist(newWishlist);
        setWishlistInput("");

        try {
            await updateSettings({ wishlist: newWishlist });
        } catch (error) {
            console.error("Failed to save wishlist", error);
        }
    };

    const toggleWishlist = async (id) => {
        const newWishlist = wishlist.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        );
        setWishlist(newWishlist);

        try {
            await updateSettings({ wishlist: newWishlist });
        } catch (error) {
            console.error("Failed to update wishlist", error);
        }
    };

    const updateMood = async (newMood) => {
        setMood(newMood);
        try {
            await updateSettings({ mood: newMood });
        } catch (error) {
            console.error("Failed to update mood", error);
        }
    };

    const moodEmojis = {
        great: { emoji: "🤩", label: "Great" },
        good: { emoji: "🙂", label: "Good" },
        neutral: { emoji: "😐", label: "Neutral" },
        bad: { emoji: "😔", label: "Bad" },
        awful: { emoji: "😭", label: "Awful" },
    };

    if (isLoading) {
        return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl mx-auto space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Profile Dashboard</h1>
                    <p className="text-slate-500 font-medium mt-1">Your stats, focus, and vibes.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Mood Tracker */}
                <div className="bg-white dark:bg-[#192233] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 w-full text-center">How are you feeling?</h3>
                    <div className="flex items-center gap-2">
                        {Object.entries(moodEmojis).map(([key, data]) => (
                            <button
                                key={key}
                                onClick={() => updateMood(key)}
                                className={`text-3xl hover:scale-110 transition-transform p-2 rounded-2xl ${mood === key ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
                                title={data.label}
                            >
                                {data.emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Top Streaks */}
                <div className="bg-white dark:bg-[#192233] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Top 3 Habit Streaks 🔥</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {topHabits.length > 0 ? topHabits.map((habit) => (
                            <div key={habit._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <div className={`size-10 rounded-xl bg-${habit.color}-500/20 text-${habit.color}-500 flex items-center justify-center shrink-0`}>
                                    <span className="material-symbols-outlined">{habit.icon}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold truncate">{habit.name}</p>
                                    <p className="text-xs font-black text-orange-500">{habit.streak} days</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500 col-span-3 text-center py-4">Complete habits to start standard streaks!</p>
                        )}
                    </div>
                </div>

                {/* Today's Focus */}
                <div className="bg-white dark:bg-[#192233] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Today's Deep Focus 🎯</h3>
                    <div className="space-y-3">
                        {currentTasks.length > 0 ? currentTasks.map((task) => (
                            <div key={task._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`size-3 rounded-full ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : task.priority === 'low' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    <p className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.title}</p>
                                </div>
                                {task.time && <span className="text-xs font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{task.time}</span>}
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500 text-center py-4">No high priority tasks for today.</p>
                        )}
                    </div>
                </div>

                {/* Wishlist */}
                <div className="bg-white dark:bg-[#192233] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Wishlist ✨</h3>

                    <form onSubmit={handleAddWishlist} className="mb-4">
                        <input
                            type="text"
                            placeholder="Add something..."
                            value={wishlistInput}
                            onChange={(e) => setWishlistInput(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors"
                        />
                    </form>

                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {wishlist.length > 0 ? wishlist.map(item => (
                            <div key={item.id} className="flex items-center gap-3 group">
                                <button
                                    onClick={() => toggleWishlist(item.id)}
                                    className={`size-5 rounded border flex items-center justify-center shrink-0 transition-colors ${item.completed ? 'bg-primary border-primary text-white' : 'border-slate-300 dark:border-slate-600'}`}
                                >
                                    {item.completed && <span className="material-symbols-outlined text-[14px]">check</span>}
                                </button>
                                <span className={`text-sm font-medium ${item.completed ? 'line-through text-slate-400' : ''}`}>{item.text}</span>
                            </div>
                        )) : (
                            <p className="text-xs text-slate-500 text-center pt-2">Nothing on your wishlist yet.</p>
                        )}
                    </div>
                </div>

            </div>
        </motion.div>
    );
}

export default Profile;
