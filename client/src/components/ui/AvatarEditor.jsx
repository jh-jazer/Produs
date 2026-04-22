import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Avatar from './Avatar';
import DashboardModal from './DashboardModal';

const OPTIONS = {
    skin: ["#F3C5A5", "#E0AC69", "#8D5524", "#C68642", "#FFDBAC"],
    hair: ["short", "long", "bob", "bald"],
    hairColor: ["#4A2C2A", "#24140E", "#D6B370", "#A52A2A", "#4A5568"],
    eyes: ["default", "happy", "sleepy"],
    clothing: ["hoodie", "shirt", "tank"],
    clothingColor: ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#6366F1", "#EC4899", "#111827"]
};

function AvatarEditor({ initialConfig, onSave, onClose }) {
    const [config, setConfig] = useState(initialConfig || {
        skin: "#F3C5A5",
        hair: "short",
        hairColor: "#4A2C2A",
        eyes: "default",
        clothing: "hoodie",
        clothingColor: "#3B82F6"
    });

    const [activeTab, setActiveTab] = useState('body');

    const updateConfig = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    return (
        <DashboardModal
            isOpen={true}
            onClose={onClose}
            title="NEURAL_AVATAR_EDITOR_"
            subtitle="Protocol: Visual Identity Configuration"
            maxWidth="max-w-3xl"
        >
            <div className="flex flex-col md:flex-row gap-8 min-h-[500px]">
                {/* Left Side: Preview */}
                <div className="md:w-5/12 flex flex-col items-center justify-center space-y-6">
                    <div className="size-48 md:size-64 rounded-[40px] bg-white dark:bg-black/40 shadow-2xl border-4 border-white dark:border-white/10 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-grid-light dark:bg-grid opacity-10" />
                        <Avatar config={config} className="size-full relative z-10" />
                    </div>
                    
                    <div className="text-center space-y-1">
                        <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20 inline-block">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Live Preview_</span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.1em] mt-2">Visual changes applied in real-time</p>
                    </div>
                </div>

                {/* Right Side: Options */}
                <div className="flex-1 flex flex-col space-y-6">
                    {/* Tabs */}
                    <div className="flex bg-black/5 dark:bg-white/5 rounded-2xl p-1 gap-1">
                        {['body', 'hair', 'clothing'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab
                                        ? 'bg-white dark:bg-white/10 text-primary shadow-sm'
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 space-y-8">
                        {activeTab === 'body' && (
                            <motion.div 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-4 block px-1">Skin Tone_</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.skin.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => updateConfig('skin', color)}
                                                className={`size-10 rounded-xl border-2 transition-all ${config.skin === color ? 'border-primary ring-4 ring-primary/20 scale-110' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-4 block px-1">Eye Expression_</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.eyes.map(eye => (
                                            <button
                                                key={eye}
                                                onClick={() => updateConfig('eyes', eye)}
                                                className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${config.eyes === eye
                                                        ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10'
                                                        : 'border-black/[0.05] dark:border-white/10 text-slate-400 dark:text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                {eye}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'hair' && (
                            <motion.div 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-4 block px-1">Hair Style_</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.hair.map(style => (
                                            <button
                                                key={style}
                                                onClick={() => updateConfig('hair', style)}
                                                className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${config.hair === style
                                                        ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10'
                                                        : 'border-black/[0.05] dark:border-white/10 text-slate-400 dark:text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-4 block px-1">Hair Color_</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.hairColor.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => updateConfig('hairColor', color)}
                                                className={`size-10 rounded-xl border-2 transition-all ${config.hairColor === color ? 'border-primary ring-4 ring-primary/20 scale-110' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'clothing' && (
                            <motion.div 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-4 block px-1">Clothing Style_</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.clothing.map(style => (
                                            <button
                                                key={style}
                                                onClick={() => updateConfig('clothing', style)}
                                                className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${config.clothing === style
                                                        ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10'
                                                        : 'border-black/[0.05] dark:border-white/10 text-slate-400 dark:text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-4 block px-1">Clothing Color_</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.clothingColor.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => updateConfig('clothingColor', color)}
                                                className={`size-10 rounded-xl border-2 transition-all ${config.clothingColor === color ? 'border-primary ring-4 ring-primary/20 scale-110' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-8 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 px-4 rounded-2xl bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-black/10 dark:border-white/10"
                        >
                            Abort
                        </button>
                        <button
                            onClick={() => onSave(config)}
                            className="flex-1 py-4 px-4 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Sync Identity
                        </button>
                    </div>
                </div>
            </div>
        </DashboardModal>
    );
}


export default AvatarEditor;
