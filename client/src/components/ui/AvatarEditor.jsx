import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Avatar from './Avatar';

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
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#121212]/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#121212] rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px] md:h-auto"
            >
                {/* Left Side: Preview */}
                <div className="md:w-5/12 bg-black/[0.02] dark:bg-[#050505] p-8 flex flex-col items-center justify-center border-r border-black/[0.05] dark:border-white/10">
                    <div className="size-48 md:size-64 rounded-[40px] bg-white dark:bg-[#121212] shadow-xl border-4 border-white dark:border-white/10 overflow-hidden mb-6">
                        <Avatar config={config} className="size-full" />
                    </div>
                    <h2 className="text-xl font-semibold text-black dark:text-white tracking-[-0.02em]">Customize Avatar</h2>
                    <p className="text-[10px] text-black/40 dark:text-white/40 font-semibold uppercase tracking-[0.2em] text-center mt-3">Design your persona</p>
                </div>

                {/* Right Side: Options */}
                <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#121212]">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-100 dark:border-white/10 p-2 gap-2 overflow-x-auto">
                        {['body', 'hair', 'clothing'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-xl text-[9px] font-semibold uppercase tracking-[0.3em] transition-all ${activeTab === tab
                                        ? 'bg-electric-blue text-white shadow-lg shadow-electric-blue/20'
                                        : 'text-black/30 dark:text-white/30 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {activeTab === 'body' && (
                            <>
                                <div>
                                    <label className="text-[9px] font-semibold uppercase tracking-[0.4em] text-black/40 dark:text-white/40 mb-4 block px-1">Skin Tone</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.skin.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => updateConfig('skin', color)}
                                                className={`size-10 rounded-full border-2 transition-all ${config.skin === color ? 'border-electric-blue ring-2 ring-electric-blue/20 scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-semibold uppercase tracking-[0.4em] text-black/40 dark:text-white/40 mb-4 block px-1">Eye Expression</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.eyes.map(eye => (
                                            <button
                                                key={eye}
                                                onClick={() => updateConfig('eyes', eye)}
                                                className={`px-4 py-2 rounded-xl border-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all ${config.eyes === eye
                                                        ? 'border-electric-blue bg-electric-blue/5 text-electric-blue'
                                                        : 'border-black/[0.05] dark:border-white/10 text-black/40 dark:text-white/40'
                                                    }`}
                                            >
                                                {eye}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'hair' && (
                            <>
                                <div>
                                    <label className="text-[9px] font-semibold uppercase tracking-[0.4em] text-black/40 dark:text-white/40 mb-4 block px-1">Hair Style</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.hair.map(style => (
                                            <button
                                                key={style}
                                                onClick={() => updateConfig('hair', style)}
                                                className={`px-4 py-2 rounded-xl border-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all ${config.hair === style
                                                        ? 'border-electric-blue bg-electric-blue/5 text-electric-blue'
                                                        : 'border-black/[0.05] dark:border-white/10 text-black/40 dark:text-white/40'
                                                    }`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-semibold uppercase tracking-[0.4em] text-black/40 dark:text-white/40 mb-4 block px-1">Hair Color</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.hairColor.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => updateConfig('hairColor', color)}
                                                className={`size-10 rounded-full border-2 transition-all ${config.hairColor === color ? 'border-electric-blue ring-2 ring-electric-blue/20 scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'clothing' && (
                            <>
                                <div>
                                    <label className="text-[9px] font-semibold uppercase tracking-[0.4em] text-black/40 dark:text-white/40 mb-4 block px-1">Clothing Style</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.clothing.map(style => (
                                            <button
                                                key={style}
                                                onClick={() => updateConfig('clothing', style)}
                                                className={`px-4 py-2 rounded-xl border-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all ${config.clothing === style
                                                        ? 'border-electric-blue bg-electric-blue/5 text-electric-blue'
                                                        : 'border-black/[0.05] dark:border-white/10 text-black/40 dark:text-white/40'
                                                    }`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-semibold uppercase tracking-[0.4em] text-black/40 dark:text-white/40 mb-4 block px-1">Clothing Color</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.clothingColor.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => updateConfig('clothingColor', color)}
                                                className={`size-10 rounded-full border-2 transition-all ${config.clothingColor === color ? 'border-electric-blue ring-2 ring-electric-blue/20 scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 dark:border-white/10 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 px-4 rounded-2xl bg-black/[0.05] dark:bg-white/[0.05] text-black/40 dark:text-white/40 text-[10px] font-semibold uppercase tracking-[0.3em] hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(config)}
                            className="flex-1 py-4 px-4 rounded-2xl bg-electric-blue text-white text-[10px] font-semibold uppercase tracking-[0.3em] shadow-lg shadow-electric-blue/20 hover:opacity-90 active:scale-[0.98] transition-all"
                        >
                            Save Avatar
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default AvatarEditor;
