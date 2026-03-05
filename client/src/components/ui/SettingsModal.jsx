import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const SettingsModal = ({ isOpen, onClose }) => {
    const { user, updateSettings, deleteAccount } = useAuthStore();
    const navigate = useNavigate();
    const [localSettings, setLocalSettings] = useState(user?.settings || { darkMode: true, notificationsEnabled: false });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteWord, setDeleteWord] = useState('');

    useEffect(() => {
        if (user?.settings) {
            setLocalSettings(user.settings);
        }
    }, [user?.settings]);

    const handleToggle = async (key) => {
        const newValue = !localSettings[key];
        const updatedLocal = { ...localSettings, [key]: newValue };
        setLocalSettings(updatedLocal);

        // Apply theme immediately if darkMode changed
        if (key === 'darkMode') {
            if (newValue) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }

        try {
            await updateSettings({ [key]: newValue });
        } catch (err) {
            // Rollback local state on error
            setLocalSettings(localSettings);
            console.error('Failed to sync setting:', err);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await deleteAccount();
            onClose();
            navigate('/auth');
        } catch (err) {
            setIsDeleting(false);
            console.error('Failed to delete account:', err);
            alert('Failed to delete account. Please try again.');
        }
    };

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
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h3>
                            <button
                                onClick={onClose}
                                className="size-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* General */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">General</h4>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">dark_mode</span>
                                        <span className="text-sm font-bold dark:text-slate-200">Dark Mode</span>
                                    </div>
                                    <button
                                        onClick={() => handleToggle('darkMode')}
                                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${localSettings.darkMode ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <motion.div
                                            animate={{ x: localSettings.darkMode ? 26 : 4 }}
                                            className="absolute size-4 bg-white rounded-full shadow-sm"
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">notifications</span>
                                        <span className="text-sm font-bold dark:text-slate-200">Push Notifications</span>
                                    </div>
                                    <button
                                        onClick={() => handleToggle('notificationsEnabled')}
                                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${localSettings.notificationsEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <motion.div
                                            animate={{ x: localSettings.notificationsEnabled ? 26 : 4 }}
                                            className="absolute size-4 bg-white rounded-full shadow-sm"
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">payments</span>
                                        <span className="text-sm font-bold dark:text-slate-200">Currency</span>
                                    </div>
                                    <select
                                        value={user?.currency || 'USD'}
                                        onChange={async (e) => {
                                            const val = e.target.value;
                                            try {
                                                await updateSettings({ currency: val });
                                            } catch (err) {
                                                console.error('Failed to sync currency:', err);
                                            }
                                        }}
                                        className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold outline-none dark:text-white"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="PHP">PHP (₱)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Security */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Security</h4>

                                <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-400">lock</span>
                                        <span className="text-sm font-bold dark:text-slate-200">Change Password</span>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                                </button>
                            </div>

                            {/* Danger Zone */}
                            <div className="space-y-4 pt-4">
                                <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest">Danger Zone</h4>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-500/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 text-rose-500">
                                        <span className="material-symbols-outlined">delete_forever</span>
                                        <span className="text-sm font-bold">Delete My Account</span>
                                    </div>
                                    <span className="material-symbols-outlined text-rose-300 group-hover:text-rose-500 transition-colors">chevron_right</span>
                                </button>
                                <p className="text-[10px] text-slate-400 px-2 leading-relaxed">
                                    Once you delete your account, there is no going back. All your habits, journals, and data will be permanently removed.
                                </p>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm hover:opacity-90 shadow-xl transition-all active:scale-[0.98]"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Delete Confirmation Modal */}
                    <AnimatePresence>
                        {showDeleteConfirm && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    className="w-full max-w-sm bg-white dark:bg-[#1e293b] rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800"
                                >
                                    <div className="size-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
                                        <span className="material-symbols-outlined text-3xl">warning</span>
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Are you absolutely sure?</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6 leading-relaxed">
                                        This action is permanent and cannot be undone. All your data will be wiped from our servers immediately.
                                    </p>

                                    <div className="mb-6">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Type "delete" to confirm</p>
                                        <input
                                            type="text"
                                            placeholder="delete"
                                            value={deleteWord}
                                            onChange={(e) => setDeleteWord(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all dark:text-white"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={isDeleting || deleteWord !== 'delete'}
                                            className="w-full py-3.5 bg-rose-500 text-white rounded-2xl font-black text-sm hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                                        >
                                            {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDeleteConfirm(false);
                                                setDeleteWord('');
                                            }}
                                            className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
