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
                <div className="md:w-5/12 bg-slate-50 dark:bg-[#121212] p-8 flex flex-col items-center justify-center border-r border-slate-100 dark:border-white/10">
                    <div className="size-48 md:size-64 rounded-[40px] bg-white dark:bg-[#000000] shadow-xl border-4 border-white dark:border-white/10 overflow-hidden mb-6">
                        <Avatar config={config} className="size-full" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Customize Avatar</h2>
                    <p className="text-sm text-slate-500 font-medium text-center mt-2">Design your productive persona</p>
                </div>

                {/* Right Side: Options */}
                <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#121212]">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-100 dark:border-white/10 p-2 gap-2 overflow-x-auto">
                        {['body', 'hair', 'clothing'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-[#000000]'
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
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Skin Tone</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.skin.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => updateConfig('skin', color)}
                                                className={`size-10 rounded-full border-2 transition-all ${config.skin === color ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Eye Expression</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.eyes.map(eye => (
                                            <button
                                                key={eye}
                                                onClick={() => updateConfig('eyes', eye)}
                                                className={`px-4 py-2 rounded-xl border-2 text-sm font-bold capitalize transition-all ${config.eyes === eye
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-slate-100 dark:border-white/10 text-slate-500'
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
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Hair Style</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.hair.map(style => (
                                            <button
                                                key={style}
                                                onClick={() => updateConfig('hair', style)}
                                                className={`px-4 py-2 rounded-xl border-2 text-sm font-bold capitalize transition-all ${config.hair === style
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-slate-100 dark:border-white/10 text-slate-500'
                                                    }`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Hair Color</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.hairColor.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => updateConfig('hairColor', color)}
                                                className={`size-10 rounded-full border-2 transition-all ${config.hairColor === color ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent'}`}
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
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Clothing Style</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.clothing.map(style => (
                                            <button
                                                key={style}
                                                onClick={() => updateConfig('clothing', style)}
                                                className={`px-4 py-2 rounded-xl border-2 text-sm font-bold capitalize transition-all ${config.clothing === style
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-slate-100 dark:border-white/10 text-slate-500'
                                                    }`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Clothing Color</label>
                                    <div className="flex flex-wrap gap-3">
                                        {OPTIONS.clothingColor.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => updateConfig('clothingColor', color)}
                                                className={`size-10 rounded-full border-2 transition-all ${config.clothingColor === color ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent'}`}
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
                            className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-[#000000] text-slate-600 dark:text-slate-400 text-sm font-black hover:bg-slate-200 dark:hover:bg-[#121212] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(config)}
                            className="flex-1 py-3 px-4 rounded-2xl bg-primary text-white text-sm font-black shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
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
