import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUBSCRIPTION_TOPICS } from '../../data/subscriptions';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

const SubscriptionModal = ({ isOpen, onClose, currentSubscriptions = [] }) => {
    const [selected, setSelected] = useState(currentSubscriptions);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { setCredentials } = useAuthStore();

    // Sync selected with currentSubscriptions whenever the modal opens or currentSubscriptions changes
    React.useEffect(() => {
        if (isOpen) {
            setSelected(currentSubscriptions);
        }
    }, [isOpen, currentSubscriptions]);

    const toggleTopic = (topicId) => {
        setSelected(prev => 
            prev.includes(topicId) 
                ? prev.filter(id => id !== topicId) 
                : [...prev, topicId]
        );
    };

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            console.log('Sending subscriptions to API:', selected);
            const res = await api.put('/auth/settings', { subscriptions: selected });
            console.log('Successfully saved subscriptions:', res.data);
            
            // Check if returned user has subscriptions in the expected place
            const updatedUser = res.data;
            if (updatedUser && updatedUser.settings) {
                setCredentials(updatedUser);
                onClose();
            } else {
                console.error('Save succeeded but response format was unexpected:', updatedUser);
                alert('Subscriptions saved, but we had trouble updating the view. Please refresh.');
                onClose();
            }
        } catch (error) {
            console.error('Failed to save subscriptions:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Failed to save subscriptions: ${errorMsg}. Please check your connection and try again.`);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredTopics = SUBSCRIPTION_TOPICS.filter(topic =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl z-[110]"
                    >
                        <div className="bg-white dark:bg-[#192233] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Daily Inspiration</h3>
                                    <p className="text-sm font-medium text-slate-500">Choose what you want to see in your feed</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="size-10 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search topics (e.g. Bible, biology...)"
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                    />
                                    {searchTerm && (
                                        <button 
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            <span className="material-symbols-outlined text-lg">cancel</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                {filteredTopics.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {filteredTopics.map((topic) => (
                                            <button
                                                key={topic.id}
                                                onClick={() => toggleTopic(topic.id)}
                                                className={`flex items-center gap-4 p-4 rounded-[1.5rem] border-2 transition-all text-left ${
                                                    selected.includes(topic.id)
                                                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                        : 'border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-200 dark:hover:border-slate-700'
                                                }`}
                                            >
                                                <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                                    selected.includes(topic.id)
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                        : 'bg-white dark:bg-slate-800 text-slate-400 shadow-sm'
                                                }`}>
                                                    <span className="material-symbols-outlined text-2xl">{topic.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-bold truncate ${selected.includes(topic.id) ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {topic.name}
                                                    </p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Daily Dose</p>
                                                </div>
                                                {selected.includes(topic.id) && (
                                                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center flex flex-col items-center justify-center">
                                        <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4">
                                            <span className="material-symbols-outlined text-5xl">search_off</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">No topics found</h4>
                                        <p className="text-sm text-slate-500 mt-1">Try searching for something else</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 px-6 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-[2] py-4 px-6 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">auto_awesome</span>
                                            Update Subscriptions
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SubscriptionModal;
