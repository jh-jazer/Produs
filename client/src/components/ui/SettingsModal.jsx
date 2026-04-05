import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

const SettingsModal = ({ isOpen, onClose }) => {
    const { user, updateSettings, deleteAccount } = useAuthStore();
    const navigate = useNavigate();
    const [localSettings, setLocalSettings] = useState(user?.settings || { darkMode: false, notificationsEnabled: false, theme: 'classic', themeMode: 'light' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteWord, setDeleteWord] = useState('');
    const [apiStatus, setApiStatus] = useState('checking');

    const themes = [
        { id: 'classic', name: 'Classic Blue', color: '#135bec' },
        { id: 'rose', name: 'Rose Petal', color: '#ec4899' },
        { id: 'forest', name: 'Forest Zen', color: '#10b981' },
        { id: 'amber', name: 'Sunset Amber', color: '#f59e0b' },
        { id: 'midnight', name: 'Midnight', color: '#6366f1' },
    ];

    const checkApiStatus = async () => {
        setApiStatus('checking');
        try {
            await api.get('/status');
            setApiStatus('online');
        } catch (error) {
            setApiStatus('offline');
        }
    };

    useEffect(() => {
        if (isOpen) {
            checkApiStatus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (user?.settings) {
            setLocalSettings(user.settings);
        }
    }, [user?.settings]);

    const handleToggle = async (key) => {
        const newValue = !localSettings[key];
        const updatedLocal = { ...localSettings, [key]: newValue };
        setLocalSettings(updatedLocal);

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
            setLocalSettings(localSettings);
            console.error('Failed to sync setting:', err);
        }
    };

    const handleThemeModeChange = async (mode) => {
        const updatedLocal = { ...localSettings, themeMode: mode };
        setLocalSettings(updatedLocal);

        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (mode === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            // System
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }

        try {
            await updateSettings({ themeMode: mode });
        } catch (err) {
            console.error('Failed to sync theme mode:', err);
        }
    };

    const handleThemeChange = async (themeId) => {
        const updatedLocal = { ...localSettings, theme: themeId };
        setLocalSettings(updatedLocal);

        const theme = themes.find(t => t.id === themeId);
        if (theme) {
            document.documentElement.style.setProperty('--primary', theme.color);
            document.documentElement.setAttribute('data-theme', themeId);
        }

        try {
            await updateSettings({ theme: themeId });
        } catch (err) {
            console.error('Failed to sync theme:', err);
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
                        className="absolute inset-0 bg-[#121212]/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative z-10 w-full max-w-md bg-white dark:bg-[#121212] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-black/[0.08] dark:border-white/10 overflow-hidden ar-corners"
                    >
                        <div className="p-6 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
                            <h3 className="text-xl font-semibold text-black dark:text-white tracking-[-0.02em]">Settings</h3>
                            <button
                                onClick={onClose}
                                className="size-8 flex items-center justify-center rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-black/40 dark:text-white/40 transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* General */}
                            <div className="space-y-4">
                                <h4 className="text-[9px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-[0.4em] px-1">Appearance</h4>

                                <div className="grid grid-cols-3 gap-2 p-1 bg-black/[0.03] dark:bg-[#000000]/40 border border-black/[0.05] dark:border-white/10 rounded-2xl">
                                    {['light', 'dark', 'system'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => handleThemeModeChange(mode)}
                                            className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${localSettings.themeMode === mode ? 'bg-white dark:bg-[#121212] text-electric-blue shadow-sm ring-1 ring-black/[0.05] dark:ring-white/10' : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/[0.03] dark:bg-[#000000]/40 border border-black/[0.05] dark:border-white/10">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-electric-blue">notifications</span>
                                        <span className="text-xs font-semibold text-black/70 dark:text-white/70">Push Notifications</span>
                                    </div>
                                    <button
                                        onClick={() => handleToggle('notificationsEnabled')}
                                        className={`w-10 h-5 rounded-full transition-all relative flex items-center ${localSettings.notificationsEnabled ? 'bg-electric-blue' : 'bg-black/10 dark:bg-white/10'}`}
                                    >
                                        <motion.div
                                            animate={{ x: localSettings.notificationsEnabled ? 22 : 3 }}
                                            className="absolute size-3.5 bg-white rounded-full shadow-sm"
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/[0.03] dark:bg-[#000000]/40 border border-black/[0.05] dark:border-white/10">
                                     <div className="flex items-center gap-3">
                                         <span className="material-symbols-outlined text-electric-blue">payments</span>
                                         <span className="text-xs font-semibold text-black/70 dark:text-white/70">Currency</span>
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
                                         className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider outline-none text-black/70 dark:text-white/70 focus:border-electric-blue transition-colors"
                                     >
                                         <option value="USD">USD ($)</option>
                                         <option value="PHP">PHP (₱)</option>
                                     </select>
                                 </div>
                            </div>

                            {/* Theme Selection */}
                            <div className="space-y-4">
                                <h4 className="text-[9px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-[0.4em] px-1">Accent Theme</h4>
                                <div className="grid grid-cols-5 gap-3">
                                    {themes.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => handleThemeChange(t.id)}
                                            className={`group relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${localSettings.theme === t.id ? 'border-electric-blue bg-electric-blue/5' : 'border-black/[0.05] dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}
                                            title={t.name}
                                        >
                                            <div 
                                                className="size-10 rounded-2xl shadow-none ring-2 ring-white dark:ring-[#121212] group-hover:scale-105 transition-transform"
                                                style={{ backgroundColor: t.color }}
                                            />
                                            {localSettings.theme === t.id && (
                                                <motion.span layoutId="theme-check" className="absolute -top-1.5 -right-1.5 size-5 bg-electric-blue text-white rounded-full flex items-center justify-center border-2 border-white dark:border-[#121212]">
                                                    <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                                                </motion.span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            {/* Security */}
                            <div className="space-y-4">
                                <h4 className="text-[9px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-[0.4em] px-1">Security</h4>

                                <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-black/[0.05] dark:border-white/10 hover:bg-black/[0.03] dark:hover:bg-[#000000]/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-black/30 dark:text-white/30">lock</span>
                                        <span className="text-xs font-semibold text-black/70 dark:text-white/70">Change Password</span>
                                    </div>
                                    <span className="material-symbols-outlined text-black/20 dark:text-white/20">chevron_right</span>
                                </button>
                            </div>

                            {/* Danger Zone */}
                            <div className="space-y-4 pt-4">
                                <h4 className="text-[9px] font-semibold text-signal-orange uppercase tracking-[0.4em] px-1">Danger Zone</h4>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-signal-orange/20 bg-signal-orange/5 hover:bg-signal-orange/10 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 text-signal-orange">
                                        <span className="material-symbols-outlined">delete_forever</span>
                                        <span className="text-xs font-semibold">Delete My Account</span>
                                    </div>
                                    <span className="material-symbols-outlined text-signal-orange/40 group-hover:text-signal-orange transition-colors">chevron_right</span>
                                </button>
                                <p className="text-[10px] text-black/40 dark:text-white/40 px-2 leading-relaxed font-medium">
                                    Once you delete your account, there is no going back. All your habits, journals, and data will be permanently removed.
                                </p>
                            </div>

                            <div className="pt-4 pb-2">
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-[24px] font-semibold text-xs uppercase tracking-[0.3em] hover:opacity-90 shadow-lg active:scale-[0.98] transition-all"
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
                                className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#121212]/60 backdrop-blur-md"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    className="w-full max-w-sm bg-white dark:bg-[#121212] rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-black/[0.08] dark:border-white/10 ar-corners"
                                >
                                    <div className="size-16 rounded-[24px] bg-signal-orange/10 text-signal-orange flex items-center justify-center mb-6">
                                        <span className="material-symbols-outlined text-3xl font-light">warning</span>
                                    </div>
                                    <h4 className="text-xl font-semibold text-black dark:text-white mb-2 tracking-[-0.02em]">Are you absolutely sure?</h4>
                                    <p className="text-black/50 dark:text-white/40 text-xs font-semibold mb-6 leading-relaxed">
                                        This action is permanent and cannot be undone. All your data will be wiped from our servers immediately.
                                    </p>

                                    <div className="mb-6">
                                        <p className="text-[9px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-[0.4em] mb-2 px-1">Type "DELETE" to confirm</p>
                                        <input
                                            type="text"
                                            placeholder="DELETE"
                                            value={deleteWord}
                                            onChange={(e) => setDeleteWord(e.target.value)}
                                            className="w-full bg-black/[0.03] dark:bg-[#000000]/40 border border-black/[0.08] dark:border-white/10 rounded-[20px] px-5 py-4 text-xs font-semibold outline-none focus:border-signal-orange transition-all text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={isDeleting || deleteWord !== 'DELETE'}
                                            className="w-full py-4 bg-signal-orange text-white rounded-[20px] font-semibold text-xs uppercase tracking-[0.3em] hover:opacity-90 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                                        >
                                            {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDeleteConfirm(false);
                                                setDeleteWord('');
                                            }}
                                            className="w-full py-4 bg-black/[0.05] dark:bg-white/[0.05] text-black/60 dark:text-white/60 rounded-[20px] font-semibold text-xs uppercase tracking-[0.3em] hover:bg-black/10 dark:hover:bg-white/10 transition-all"
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
