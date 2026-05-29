import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import IdentityCard from './IdentityCard';

function ProfileModal({ username, onClose }) {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const currentUser = useAuthStore((state) => state.user);
    const setCredentials = useAuthStore((state) => state.setCredentials);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!username) return;
                setIsLoading(true);
                setError(null);
                const res = await api.get(`/auth/profile/${username}`);
                setProfile(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Profile not found or is private.");
            } finally {
                setTimeout(() => setIsLoading(false), 200);
            }
        };

        fetchProfile();
    }, [username]);

    const isConnected = currentUser?.connections?.some(id => id === profile?._id || id?._id === profile?._id);
    const isSent = currentUser?.outgoingConnectionRequests?.some(id => id === profile?._id || id?._id === profile?._id);
    const isIncoming = currentUser?.incomingConnectionRequests?.some(id => id === profile?._id || id?._id === profile?._id);

    const handleConnectionAction = async (action) => {
        if (!currentUser || isConnecting) return;
        try {
            setIsConnecting(true);
            const endpoint = `/auth/connection/${action}/${profile._id}`;
            await api.post(endpoint);
            
            const userRes = await api.get('/auth/me');
            setCredentials(userRes.data);
        } catch (err) {
            console.error(`Failed ${action}`, err);
        } finally {
            setIsConnecting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 dark:bg-[#050505]/80 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {isLoading ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-[390px] bg-[#d2d6dc] dark:bg-[#1c1f22] text-black dark:text-white border-[3px] border-black rounded-[4px] shadow-[0_25px_60px_rgba(0,0,0,0.55)] flex flex-col min-h-[520px] items-center justify-center p-8 z-[310] ar-corners"
                >
                    <div className="size-8 rounded-full border-[3px] border-black dark:border-white border-t-transparent animate-spin mb-4" />
                    <p className="text-[9px] font-black text-black/45 dark:text-white/45 uppercase tracking-[0.4em]">Loading ID...</p>
                </motion.div>
            ) : error ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-[390px] bg-[#d2d6dc] dark:bg-[#1c1f22] text-black dark:text-white border-[3px] border-black rounded-[4px] shadow-[0_25px_60px_rgba(0,0,0,0.55)] flex flex-col min-h-[520px] items-center justify-center p-8 text-center z-[310] ar-corners"
                >
                    <span className="material-symbols-outlined text-4xl text-black/40 dark:text-white/40 mb-4">lock</span>
                    <p className="text-xs font-bold text-black/70 dark:text-white/70 uppercase tracking-wider">{error}</p>
                    <button onClick={onClose} className="mt-6 px-4 py-2 border-2 border-black dark:border-white text-[9px] font-black uppercase tracking-widest bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">CLOSE</button>
                </motion.div>
            ) : profile ? (
                <div className="z-[310]">
                    <IdentityCard
                        user={profile}
                        isOwnProfile={false}
                        onClose={onClose}
                        isConnected={isConnected}
                        isSent={isSent}
                        isIncoming={isIncoming}
                        handleConnectionAction={handleConnectionAction}
                        currentUser={currentUser}
                    />
                </div>
            ) : null}
        </div>,
        document.body
    );
}

export default ProfileModal;
