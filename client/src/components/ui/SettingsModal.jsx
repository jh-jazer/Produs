import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import DashboardModal from './DashboardModal';
import { useTheme } from '../../hooks/useTheme';
import ThemeToggle from './ThemeToggle';
import { soundManager } from '../../services/sound';

const SettingsModal = ({ isOpen, onClose, onOpenBugReport }) => {
    const { user, updateSettings, deleteAccount } = useAuthStore();
    const { themeMode, setThemeMode } = useTheme();
    const navigate = useNavigate();
    const [localSettings, setLocalSettings] = useState(user?.settings || { notificationsEnabled: false, theme: 'classic', themeMode: 'light', soundsEnabled: true });
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
        if (key === 'soundsEnabled' && newValue) {
            setTimeout(() => soundManager.play('click'), 50);
        }
        try {
            await updateSettings({ [key]: newValue });
        } catch (err) {
            setLocalSettings(localSettings);
            console.error('Failed to sync setting:', err);
        }
    };

    const handleThemeModeChange = async (mode) => {
        setLocalSettings(prev => ({ ...prev, themeMode: mode }));
        await setThemeMode(mode); // centralized — applies class + persists
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
                            <div className="text-[8px] font-mono uppercase tracking-widest text-foreground/40 px-1 mb-2">Developer</div>
                            
                            {/* Manage Protocol */}
                            <button 
                                onClick={() => { onClose(); navigate('/dashboard/admin'); }} 
                                className="w-full flex items-center justify-between p-4 px-5 rounded-sm border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-foreground opacity-60 group-hover:opacity-100 transition-opacity">admin_panel_settings</span>
                                    <span className="text-[8px] font-mono uppercase tracking-widest text-foreground">Manage</span>
                                </div>
                                <span className="material-symbols-outlined text-foreground/40">chevron_right</span>
                            </button>

                            {/* Dev Tools Toggle */}
                            <div className="flex items-center justify-between p-4 px-5 rounded-sm bg-foreground/5 border border-foreground/10 transition-all hover:bg-foreground/10">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-foreground opacity-60">terminal</span>
                                    <span className="text-[8px] font-mono uppercase tracking-widest text-foreground">Developer Tools</span>
                                </div>
                                <button
                                    onClick={() => handleToggle('showDevTools')}
                                    className={`w-10 h-5 rounded-sm transition-all relative flex items-center ${localSettings.showDevTools ? 'bg-foreground' : 'bg-foreground/10'}`}
                                >
                                    <motion.div
                                        animate={{ x: localSettings.showDevTools ? 22 : 3 }}
                                        className={`absolute size-3.5 rounded-sm shadow-sm ${localSettings.showDevTools ? 'bg-background' : 'bg-foreground/50'}`}
                                    />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Appearance */}
                    <div className="space-y-4">
                        <div className="text-[8px] font-mono uppercase tracking-widest text-foreground/40 px-1 mb-2">Appearance</div>

                        <div className="flex items-center justify-between p-4 px-5 rounded-sm bg-foreground/5 border border-foreground/10 transition-all hover:border-foreground/20">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-foreground opacity-60">palette</span>
                                <span className="text-[8px] font-mono text-foreground uppercase tracking-widest">Interface Protocol</span>
                            </div>
                            
                            <ThemeToggle />
                        </div>

                        <div className="flex items-center justify-between p-4 px-5 rounded-sm bg-foreground/5 border border-foreground/10 transition-all hover:border-foreground/20">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-foreground opacity-60">notifications</span>
                                <span className="text-[8px] font-mono text-foreground uppercase tracking-widest">Push Notifications</span>
                            </div>
                            <button
                                onClick={() => handleToggle('notificationsEnabled')}
                                className={`w-10 h-5 rounded-sm transition-all relative flex items-center ${localSettings.notificationsEnabled ? 'bg-foreground' : 'bg-foreground/10'}`}
                            >
                                <motion.div
                                    animate={{ x: localSettings.notificationsEnabled ? 22 : 3 }}
                                    className={`absolute size-3.5 rounded-sm shadow-sm ${localSettings.notificationsEnabled ? 'bg-background' : 'bg-foreground/50'}`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 px-5 rounded-sm bg-foreground/5 border border-foreground/10 transition-all hover:border-foreground/20">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-foreground opacity-60">volume_up</span>
                                <span className="text-[8px] font-mono text-foreground uppercase tracking-widest">Sound Effects</span>
                            </div>
                            <button
                                onClick={() => handleToggle('soundsEnabled')}
                                className={`w-10 h-5 rounded-sm transition-all relative flex items-center ${localSettings.soundsEnabled !== false ? 'bg-foreground' : 'bg-foreground/10'}`}
                            >
                                <motion.div
                                    animate={{ x: localSettings.soundsEnabled !== false ? 22 : 3 }}
                                    className={`absolute size-3.5 rounded-sm shadow-sm ${localSettings.soundsEnabled !== false ? 'bg-background' : 'bg-foreground/50'}`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 px-5 rounded-sm bg-foreground/5 border border-foreground/10 transition-all hover:border-foreground/20">
                             <div className="flex items-center gap-3">
                                 <span className="material-symbols-outlined text-foreground opacity-60">payments</span>
                                 <span className="text-[8px] font-mono text-foreground uppercase tracking-widest">Currency</span>
                             </div>
                             <select
                                 value={user?.currency || 'PHP'}
                                 onChange={async (e) => {
                                     const val = e.target.value;
                                     try {
                                         await updateSettings({ currency: val });
                                     } catch (err) {
                                         console.error('Failed to sync currency:', err);
                                     }
                                 }}
                                 className="bg-transparent border border-foreground/20 rounded-sm px-3 py-1.5 text-[10px] font-black uppercase tracking-wider outline-none text-foreground focus:border-foreground transition-colors cursor-pointer"
                             >
                                 <option value="USD">USD ($)</option>
                                 <option value="PHP">PHP (₱)</option>
                             </select>
                         </div>
                    </div>

                    {/* Theme Selection */}
                    <div className="space-y-4">
                        <div className="text-[8px] font-mono uppercase tracking-widest text-foreground/40 px-1 mb-2">Accent Theme</div>
                        <div className="grid grid-cols-5 gap-3">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => handleThemeChange(t.id)}
                                    className={`group relative flex flex-col items-center gap-2 p-3 rounded-sm border transition-all ${localSettings.theme === t.id ? 'border-primary bg-primary/5' : 'border-foreground/10 hover:border-foreground/20 hover:bg-foreground/5'}`}
                                    title={t.name}
                                >
                                    <div 
                                        className="size-10 rounded-sm shadow-none group-hover:scale-105 transition-transform"
                                        style={{ backgroundColor: t.color }}
                                    />
                                    {localSettings.theme === t.id && (
                                        <motion.span layoutId="theme-check" className="absolute -top-1.5 -right-1.5 size-5 bg-primary text-white rounded-sm flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                                        </motion.span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Security */}
                    <div className="space-y-4">
                        <div className="text-[8px] font-mono uppercase tracking-widest text-foreground/40 px-1 mb-2">Security</div>

                        <button className="w-full flex items-center justify-between p-4 px-5 rounded-sm border border-foreground/10 hover:bg-foreground/5 transition-all group">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-foreground opacity-60 group-hover:opacity-100 transition-colors">lock</span>
                                <span className="text-[8px] font-mono text-foreground uppercase tracking-widest">Change Password</span>
                            </div>
                            <span className="material-symbols-outlined text-foreground/40">chevron_right</span>
                        </button>
                    </div>


                    {/* Danger Zone */}
                    <div className="space-y-4 pt-4">
                        <div className="text-[8px] font-mono uppercase tracking-widest text-rose-500/60 px-1 mb-2">Danger Zone</div>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full flex items-center justify-between p-5 rounded-sm border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all group"
                        >
                            <div className="flex items-center gap-3 text-rose-500">
                                <span className="material-symbols-outlined">delete_forever</span>
                                <span className="text-[8px] font-mono text-rose-500 uppercase tracking-widest">Delete My Account</span>
                            </div>
                            <span className="material-symbols-outlined text-rose-500/40 group-hover:text-rose-500 transition-colors">chevron_right</span>
                        </button>
                        <p className="text-[10px] text-foreground/30 px-2 leading-relaxed font-mono uppercase tracking-widest">
                            Once you delete your account, there is no going back. All your habits, journals, and data will be permanently removed.
                        </p>
                    </div>

                    <div className="pt-4 pb-2">
                        <button
                            onClick={onClose}
                            className="w-full py-5 bg-foreground text-background rounded-sm font-black text-[10px] uppercase tracking-[0.4em] hover:opacity-90 shadow-xl active:scale-[0.98] transition-all"
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
