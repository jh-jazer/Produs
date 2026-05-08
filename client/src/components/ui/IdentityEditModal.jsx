import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';
import DashboardModal from './DashboardModal';
import Avatar from './Avatar';

const IdentityEditModal = ({ isOpen, onClose }) => {
    const { user, updateSettings } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = React.useRef(null);
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username?.split('#')[0] || '',
        bio: user?.bio || '',
        avatar: user?.avatar || ''
    });

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            await updateSettings({
                name: formData.name,
                username: formData.username,
                bio: formData.bio,
                avatar: formData.avatar
            });
            onClose();
        } catch (error) {
            console.error('Failed to update identity:', error);
            alert(error.response?.data?.message || 'Update failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const { data } = await api.post('/auth/upload/avatar', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, avatar: data.url }));
        } catch (error) {
            console.error('Upload failed', error);
        }
    };

    return (
        <>
            <DashboardModal
                isOpen={isOpen}
                onClose={onClose}
                title="OPERATIVE_ID_RECONFIGURATION"
                subtitle="Protocol: Identity Modification"
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4 py-2">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            className="hidden" 
                            accept="image/*"
                        />
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="size-24 rounded-full bg-foreground/5 border-2 border-foreground/10 flex items-center justify-center cursor-pointer group relative overflow-hidden ar-corners"
                        >
                            <Avatar config={formData.avatar} className="size-full" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-xl">upload</span>
                            </div>
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40">Upload_Identity_Signature</p>
                    </div>

                    <div className="space-y-4">
                        {/* Name Field */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 px-1">Display_Name</label>
                            <input 
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-sm py-3 px-4 text-xs font-bold text-foreground focus:border-primary/50 outline-none transition-all uppercase tracking-wider"
                                placeholder="ENTER_NAME"
                                required
                            />
                        </div>

                        {/* Username Field */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 px-1">Base_Username</label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') }))}
                                    className="w-full bg-foreground/5 border border-foreground/10 rounded-sm py-3 px-4 text-xs font-bold text-foreground focus:border-primary/50 outline-none transition-all tracking-wider pr-16"
                                    placeholder="OPERATIVE_ID"
                                    maxLength={8}
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-foreground/20 font-mono">
                                    #{user?.username?.split('#')[1] || '0000'}
                                </div>
                            </div>
                            <p className="text-[8px] font-bold text-foreground/20 px-1 uppercase mt-1">Suffix preservation protocol active</p>
                        </div>

                        {/* Bio / Quote Field */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 px-1">Identity_Manifesto</label>
                            <textarea 
                                value={formData.bio}
                                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-sm py-3 px-4 text-xs font-bold text-foreground focus:border-primary/50 outline-none transition-all tracking-wide min-h-[80px] resize-none"
                                placeholder="SYSTEM_ACCESS_GRANTED"
                                maxLength={160}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-sm border border-foreground/10 text-foreground/40 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-foreground/5 transition-all"
                        >
                            Abort_
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-3 px-4 rounded-sm bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'SYNCING...' : 'SYNC_IDENTITY_'}
                        </button>
                    </div>
                </form>
            </DashboardModal>
        </>
    );
};

export default IdentityEditModal;
