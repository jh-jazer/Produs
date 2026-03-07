import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileModal = ({ isOpen, onClose, user }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative z-10 w-full max-w-md bg-white dark:bg-[#192233] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="relative h-32 bg-gradient-to-r from-primary/20 to-primary/5 dark:from-primary/10 dark:to-transparent">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="px-8 pb-8">
                            <div className="relative -mt-12 mb-6">
                                <div className="size-24 rounded-3xl bg-white dark:bg-[#192233] p-1 shadow-xl">
                                    <div className="size-full rounded-[20px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                            <span className="text-4xl font-black text-slate-400">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button className="absolute bottom-0 left-16 size-8 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center border-2 border-white dark:border-[#192233] hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{user?.name}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Personal Account</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Email Address</p>
                                        <p className="text-sm font-bold dark:text-slate-200">{user?.email}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Membership</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold dark:text-slate-200">Free Tier</span>
                                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase">Standard</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm hover:opacity-90 transition-opacity active:scale-[0.98] transform"
                                >
                                    Update Profile
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProfileModal;
