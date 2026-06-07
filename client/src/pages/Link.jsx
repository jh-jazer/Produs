import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { ArrowLeft, Image as ImageIcon, RotateCcw, Upload } from 'lucide-react';
import { soundManager } from '../services/sound';
import useSWR from 'swr';
import api from '../services/api';
import Avatar from '../components/ui/Avatar';

const Link = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isLinked = !!user?.partner;
    const fileInputRef = useRef(null);

    const fetcher = url => api.get(url).then(res => res.data);
    const { data: partner } = useSWR(user?.partner ? '/auth/partner' : null, fetcher);

    // Initial state: load from localStorage
    const [linkImage, setLinkImage] = useState(() => {
        return localStorage.getItem('settableLinkImage') || null;
    });

    const [isHovered, setIsHovered] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    // If they are not linked, redirect them back to dashboard (safety fallback)
    useEffect(() => {
        if (!isLinked) {
            navigate('/dashboard');
        }
    }, [isLinked, navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        soundManager.play('click');
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Url = event.target.result;
            localStorage.setItem('settableLinkImage', base64Url);
            setLinkImage(base64Url);
            setShowOptions(false);
        };
        reader.readAsDataURL(file);
    };

    const handleReset = () => {
        soundManager.play('click');
        localStorage.removeItem('settableLinkImage');
        setLinkImage(null);
        setShowOptions(false);
    };

    if (!isLinked) return null;

    return (
        <div className="w-full bg-transparent text-foreground px-4 pt-28 pb-12 md:pt-24 md:pb-16 font-sans overflow-x-hidden flex flex-col items-start justify-start min-h-[80vh]">

            

            {/* 2-column top grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-0 md:mt-2">

                {/* LEFT COLUMN — image holder */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col gap-4"
                >
                    {/* Settable Link Image Container */}
                    <div className="relative bg-transparent dark:bg-foreground/[0.02] rounded-sm border border-black/10 dark:border-white/10 p-4 flex flex-col items-center justify-center group/panel overflow-hidden shadow-sm hover:border-black/20 dark:hover:border-white/20 transition-all">

                        <div
                            className="relative w-full aspect-[4/3] bg-black/5 dark:bg-white/5 rounded-sm border border-black/5 dark:border-white/5 overflow-hidden flex items-center justify-center cursor-pointer shadow-inner"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onClick={() => setShowOptions(true)}
                        >
                            {linkImage ? (
                                <img
                                    src={linkImage}
                                    alt="Shared Connection"
                                    className="w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover/panel:scale-105"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-3 w-full h-full border border-dashed border-black/10 dark:border-white/10 rounded-sm p-4">
                                    <ImageIcon className="text-black/35 dark:text-white/20 w-7 h-7 stroke-[1.2]" />
                                    <span className="text-[8px] font-mono font-black uppercase tracking-[0.2em] text-black/35 dark:text-white/20">NO IMAGE UPLOADED</span>
                                </div>
                            )}

                            {/* Hover overlay */}
                            <AnimatePresence>
                                {isHovered && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 pointer-events-none"
                                    >
                                        <div className="size-9 rounded-full bg-white/10 flex items-center justify-center border border-white/25">
                                            <ImageIcon className="text-white w-4 h-4" />
                                        </div>
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Set Image</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Connection metadata footer */}
                        <div className="w-full mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[9px] font-mono text-black/50 dark:text-white/40">
                            <span>@{(user?.username || 'USER').toUpperCase()}</span>
                            <span>@{(user?.partner?.username || 'PARTNER').toUpperCase()}</span>
                        </div>
                    </div>
                </motion.div>

                {/* RIGHT COLUMN — Link points & status */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    className="flex flex-col gap-4"
                >
                    <div className="relative bg-transparent dark:bg-foreground/[0.02] rounded-sm border border-black/10 dark:border-white/10 p-6 flex flex-col gap-6 overflow-hidden shadow-sm hover:border-black/20 dark:hover:border-white/20 transition-all min-h-[300px]">
                        
                        {/* Title & Badge */}
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-slate-400">SHARED SYNC METRICS</span>
                                <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white mt-1">LINK POWER</h3>
                            </div>
                            <span className="px-2 py-0.5 rounded-sm bg-rose-500/10 text-rose-500 text-[8px] font-mono font-black tracking-widest uppercase animate-pulse">
                                ACTIVE
                            </span>
                        </div>

                        {/* Large Link Points Display */}
                        <div className="flex-1 flex flex-col items-center justify-center py-6">
                            <span className="text-4xl md:text-5xl font-black font-mono tracking-tight text-rose-500 flex items-center gap-2">
                                {user?.rpg?.linkPoints || 0}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/60 dark:text-rose-500/40 mt-2">LINK POINTS (LPT)</span>
                        </div>

                        {/* Footer description */}
                        <div className="pt-4 border-t border-black/5 dark:border-white/5 text-[9px] leading-relaxed text-black/55 dark:text-white/40">
                            <span className="font-bold text-black dark:text-white uppercase tracking-wider block mb-1">HOW TO EARN</span>
                            Link points are awarded only when both you and your partner complete a shared habit on the same day. Focus on synchronization to grow your shared Link Power.
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Change Image Options Dialog */}
            <AnimatePresence>
                {showOptions && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowOptions(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            className="bg-[#FFFBF4] dark:bg-[#080808] border border-black/10 dark:border-white/10 rounded-sm p-6 max-w-sm w-full shadow-2xl relative z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xs font-black uppercase tracking-widest text-black dark:text-white mb-4">Set Link Image</h3>
                            
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex items-center justify-between p-3.5 border border-black/15 dark:border-white/10 hover:border-black dark:hover:border-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <Upload size={14} />
                                        <span>Upload File</span>
                                    </div>
                                    <span className="text-[8px] opacity-40 font-mono">PNG / JPG</span>
                                </button>
                                
                                {linkImage !== null && (
                                    <button 
                                        onClick={handleReset}
                                        className="w-full flex items-center gap-3.5 p-3.5 border border-rose-500/20 hover:border-rose-500 text-rose-500 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/5 transition-all text-left"
                                    >
                                        <RotateCcw size={14} />
                                        <span>Remove Image</span>
                                    </button>
                                )}
                            </div>

                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="hidden" 
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Link;
