import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import DashboardModal from './DashboardModal';

const SettingsModal = ({ isOpen, onClose, onOpenBugReport }) => {
    const { user, updateSettings, deleteAccount } = useAuthStore();
    const navigate = useNavigate();
    const [localSettings, setLocalSettings] = useState(user?.settings || { darkMode: false, notificationsEnabled: false, theme: 'classic', themeMode: 'light' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteWord, setDeleteWord] = useState('');
    const [apiStatus, setApiStatus] = useState('checking');
    const isAdmin = user?.isAdmin || user?.email === 'ernestodesabillejr@gmail.com';

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
        <>
            <DashboardModal
                isOpen={isOpen}
                onClose={onClose}
                title="Settings"
                subtitle="System Configuration"
                maxWidth="max-w-md"
            >
                <div className="space-y-8 -mt-4">
                    {/* Developer Section */}
                    {isAdmin && (
                        <div className="space-y-4">
                            <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.4em] px-1">Developer</h4>
                            
                            {/* Manage Protocol */}
                            <button 
                                onClick={() => { onClose(); navigate('/dashboard/admin'); }} 
                                className="w-full flex items-center justify-between p-4 px-5 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary opacity-60 group-hover:opacity-100 transition-opacity">admin_panel_settings</span>
                                    <span className="text-xs font-black text-slate-600 dark:text-white/60 uppercase tracking-widest">Manage</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                            </button>

                            {/* Dev Tools Toggle */}
                            <div className="flex items-center justify-between p-4 px-5 rounded-2xl bg-primary/5 border border-primary/20 transition-all hover:bg-primary/10">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">terminal</span>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-slate-700 dark:text-white/70 uppercase tracking-widest">Dev_Tools_</span>
                                        <span className="text-[8px] font-black text-primary/60 uppercase tracking-wider">Interface_Overlay</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggle('showDevTools')}
                                    className={`w-10 h-5 rounded-full transition-all relative flex items-center ${localSettings.showDevTools ? 'bg-primary' : 'bg-black/10 dark:bg-white/10'}`}
                                >
                                    <motion.div
                                        animate={{ x: localSettings.showDevTools ? 22 : 3 }}
                                        className="absolute size-3.5 bg-white rounded-full shadow-sm"
                                    />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Appearance */}
                    <div className="space-y-4">
                        <h4 className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase tracking-[0.4em] px-1">Appearance</h4>

                        <div className="grid grid-cols-3 gap-2 p-1.5 bg-black/[0.03] dark:bg-white/5 border border-black/[0.05] dark:border-white/10 rounded-2xl">
                            {['light', 'dark', 'system'].map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => handleThemeModeChange(mode)}
                                    className={`py-3 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${localSettings.themeMode === mode ? 'bg-white dark:bg-[#121212] text-primary shadow-lg ring-1 ring-black/[0.05] dark:ring-white/10' : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center justify-between p-4 px-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/5 transition-all hover:border-primary/20">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary opacity-60">notifications</span>
                                <span className="text-xs font-black text-slate-600 dark:text-white/60 uppercase tracking-widest">Push Notifications</span>
                            </div>
                            <button
                                onClick={() => handleToggle('notificationsEnabled')}
                                className={`w-10 h-5 rounded-full transition-all relative flex items-center ${localSettings.notificationsEnabled ? 'bg-primary' : 'bg-black/10 dark:bg-white/10'}`}
                            >
                                <motion.div
                                    animate={{ x: localSettings.notificationsEnabled ? 22 : 3 }}
                                    className="absolute size-3.5 bg-white rounded-full shadow-sm"
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 px-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/5 transition-all hover:border-primary/20">
                             <div className="flex items-center gap-3">
                                 <span className="material-symbols-outlined text-primary opacity-60">payments</span>
                                 <span className="text-xs font-black text-slate-600 dark:text-white/60 uppercase tracking-widest">Currency</span>
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
                                 className="bg-white dark:bg-[#121212] border border-black/[0.08] dark:border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider outline-none text-slate-600 dark:text-white/60 focus:border-primary transition-colors cursor-pointer"
                             >
                                 <option value="USD">USD ($)</option>
                                 <option value="PHP">PHP (₱)</option>
                             </select>
                         </div>
                    </div>

                    {/* Theme Selection */}
                    <div className="space-y-4">
                        <h4 className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase tracking-[0.4em] px-1">Accent Theme</h4>
                        <div className="grid grid-cols-5 gap-3">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => handleThemeChange(t.id)}
                                    className={`group relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${localSettings.theme === t.id ? 'border-primary bg-primary/5' : 'border-black/[0.05] dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}
                                    title={t.name}
                                >
                                    <div 
                                        className="size-10 rounded-2xl shadow-none ring-2 ring-white dark:ring-[#121212] group-hover:scale-105 transition-transform"
                                        style={{ backgroundColor: t.color }}
                                    />
                                    {localSettings.theme === t.id && (
                                        <motion.span layoutId="theme-check" className="absolute -top-1.5 -right-1.5 size-5 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white dark:border-[#121212]">
                                            <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                                        </motion.span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Security */}
                    <div className="space-y-4">
                        <h4 className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase tracking-[0.4em] px-1">Security</h4>

                        <button className="w-full flex items-center justify-between p-4 px-5 rounded-2xl border border-black/[0.05] dark:border-white/5 hover:bg-black/[0.03] dark:hover:bg-white/[0.02] transition-all hover:border-primary/20 group">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">lock</span>
                                <span className="text-xs font-black text-slate-600 dark:text-white/60 uppercase tracking-widest">Change Password</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                        </button>
                    </div>

                    {/* Support / Anomalies */}
                    <div className="space-y-4">
                        <h4 className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase tracking-[0.4em] px-1">Support</h4>
                        <button 
                            onClick={() => { onClose(); onOpenBugReport(); }} 
                            className="w-full flex items-center justify-between p-4 px-5 rounded-2xl border border-black/[0.05] dark:border-white/5 bg-black/[0.03] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-rose-500 transition-colors">bug_report</span>
                                <span className="text-xs font-black text-slate-600 dark:text-white/60 uppercase tracking-widest">Report Bug</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="space-y-4 pt-4">
                        <h4 className="text-[9px] font-black text-rose-500 uppercase tracking-[0.4em] px-1">Danger Zone</h4>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full flex items-center justify-between p-5 rounded-3xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all group"
                        >
                            <div className="flex items-center gap-3 text-rose-500">
                                <span className="material-symbols-outlined">delete_forever</span>
                                <span className="text-xs font-black uppercase tracking-widest">Delete My Account</span>
                            </div>
                            <span className="material-symbols-outlined text-rose-500/40 group-hover:text-rose-500 transition-colors">chevron_right</span>
                        </button>
                        <p className="text-[10px] text-slate-500 dark:text-white/30 px-2 leading-relaxed font-black uppercase tracking-tighter opacity-60">
                            Once you delete your account, there is no going back. All your habits, journals, and data will be permanently removed.
                        </p>
                    </div>

                    <div className="pt-4 pb-2">
                        <button
                            onClick={onClose}
                            className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] hover:opacity-90 shadow-xl active:scale-[0.98] transition-all"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </DashboardModal>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-sm bg-white dark:bg-[#0a0a0a] rounded-[3rem] p-10 shadow-2xl border border-black/10 dark:border-white/10"
                        >
                            <div className="size-20 rounded-[2rem] bg-rose-500/10 text-rose-500 flex items-center justify-center mb-8">
                                <span className="material-symbols-outlined text-4xl font-light">warning</span>
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter italic font-exo">Are you absolutely sure?</h4>
                            <p className="text-slate-500 dark:text-white/40 text-xs font-medium mb-8 leading-relaxed uppercase tracking-widest">
                                This action is permanent and cannot be undone. All your data will be wiped immediately.
                            </p>

                            <div className="mb-8">
                                <p className="text-[9px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.4em] mb-3 px-1">Type "DELETE" to confirm</p>
                                <input
                                    type="text"
                                    placeholder="DELETE"
                                    value={deleteWord}
                                    onChange={(e) => setDeleteWord(e.target.value)}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-rose-500 transition-all text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/10 uppercase tracking-widest"
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting || deleteWord !== 'DELETE'}
                                    className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:opacity-90 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-lg shadow-rose-500/20"
                                >
                                    {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeleteWord('');
                                    }}
                                    className="w-full py-5 bg-black/5 dark:bg-white/5 text-slate-500 dark:text-white/40 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};


export default SettingsModal;
