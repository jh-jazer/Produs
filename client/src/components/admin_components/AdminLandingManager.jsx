import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCcw, Monitor, Smartphone, Type, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import useSWR from 'swr';

const ChippedBorder = ({ opacity = 0.8 }) => (
  <div 
    className="absolute inset-[-2px] rounded-sm pointer-events-none z-0"
    style={{
      border: '4px solid currentColor',
      opacity,
      clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
    }}
  />
);

const HUDPanel = ({ title, subtitle, children, headerExtra, className = "" }) => (
  <div className={`relative bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all p-8 rounded-sm group overflow-hidden ${className}`}>
    <ChippedBorder opacity={0.6} />
    <div className="relative z-10">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/40">{title}</span>
          {subtitle && <span className="text-[8px] font-mono uppercase tracking-widest opacity-20">{subtitle}</span>}
        </div>
        {headerExtra && <div className="flex gap-2">{headerExtra}</div>}
      </div>
      {children}
    </div>
  </div>
);

const AdminLandingManager = () => {
    const { data: config, mutate, isValidating } = useSWR('/landing-config');
    const [formData, setFormData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (config) {
            setFormData(config);
        }
    }, [config]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put('/landing-config', formData);
            await mutate();
            alert('Landing page configuration updated successfully.');
        } catch (error) {
            alert('Error updating configuration: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSaving(false);
        }
    };

    if (!formData) return (
        <div className="flex items-center justify-center p-20">
            <RefreshCcw className="animate-spin text-foreground opacity-20" size={32} />
        </div>
    );

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto">
            <div className="flex justify-between items-start mb-12">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/40">LANDING_INTERFACE_</span>
                    <span className="text-[8px] font-mono uppercase tracking-widest opacity-20">Global_Configuration_Override</span>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || isValidating}
                    className="bg-foreground text-background px-8 py-3 rounded-sm font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                >
                    {isSaving ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}
                    {isSaving ? 'Synchronizing...' : 'Sync Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Hero Section */}
                <div className="lg:col-span-7">
                    <HUDPanel title="HERO MODULE" subtitle="PRIMARY NARRATIVE">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">Title_String</label>
                                <input 
                                    type="text"
                                    value={formData.hero.title}
                                    onChange={(e) => setFormData({...formData, hero: {...formData.hero, title: e.target.value}})}
                                    className="w-full bg-foreground/[0.03] border-b border-foreground/10 rounded-none px-4 py-3 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-foreground/40 transition-all"
                                    placeholder="Enter title..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">Subtitle_Payload</label>
                                <input 
                                    type="text"
                                    value={formData.hero.subtitle}
                                    onChange={(e) => setFormData({...formData, hero: {...formData.hero, subtitle: e.target.value}})}
                                    className="w-full bg-foreground/[0.03] border-b border-foreground/10 rounded-none px-4 py-3 text-sm font-bold uppercase focus:outline-none focus:border-foreground/40 transition-all"
                                    placeholder="Enter subtitle..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">Narrative_Description</label>
                                <textarea 
                                    value={formData.hero.description}
                                    onChange={(e) => setFormData({...formData, hero: {...formData.hero, description: e.target.value}})}
                                    className="w-full bg-foreground/[0.03] border-b border-foreground/10 rounded-none px-4 py-3 text-sm font-medium focus:outline-none focus:border-foreground/40 transition-all min-h-[120px] resize-none"
                                    placeholder="Enter description..."
                                />
                            </div>
                        </div>
                    </HUDPanel>
                </div>

                {/* Mockups Section */}
                <div className="lg:col-span-5">
                    <HUDPanel title="VISUAL ASSETS" subtitle="MOCKUP ARCHIVE">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">Desktop_Buffer</label>
                                <div className="flex flex-col gap-4">
                                    <input 
                                        type="text"
                                        value={formData.mockups.desktopImage}
                                        onChange={(e) => setFormData({...formData, mockups: {...formData.mockups, desktopImage: e.target.value}})}
                                        className="w-full bg-foreground/[0.03] border-b border-foreground/10 rounded-none px-4 py-3 text-[10px] font-mono focus:outline-none focus:border-foreground/40 transition-all"
                                    />
                                    <div className="w-full aspect-video bg-foreground/[0.05] border border-foreground/10 rounded-sm flex items-center justify-center overflow-hidden">
                                        <img src={formData.mockups.desktopImage} alt="Preview" className="w-full h-full object-cover opacity-60" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">Mobile_Buffer</label>
                                <div className="flex flex-col gap-4">
                                    <input 
                                        type="text"
                                        value={formData.mockups.mobileImage}
                                        onChange={(e) => setFormData({...formData, mockups: {...formData.mockups, mobileImage: e.target.value}})}
                                        className="w-full bg-foreground/[0.03] border-b border-foreground/10 rounded-none px-4 py-3 text-[10px] font-mono focus:outline-none focus:border-foreground/40 transition-all"
                                    />
                                    <div className="w-24 aspect-[9/16] bg-foreground/[0.05] border border-foreground/10 rounded-sm flex items-center justify-center overflow-hidden">
                                        <img src={formData.mockups.mobileImage} alt="Preview" className="w-full h-full object-cover opacity-60" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </HUDPanel>
                </div>

                {/* Marketing Section */}
                <div className="lg:col-span-12">
                    <HUDPanel title="MARKETING PROTOCOL" subtitle="RESPONSIVE OVERRIDE">
                        <div className="space-y-4">
                            <label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">Display_Text_String</label>
                            <textarea 
                                value={formData.mockups.responsivenessText}
                                onChange={(e) => setFormData({...formData, mockups: {...formData.mockups, responsivenessText: e.target.value}})}
                                className="w-full bg-foreground/[0.03] border-b border-foreground/10 rounded-none px-4 py-3 text-lg font-black uppercase italic tracking-widest focus:outline-none focus:border-foreground/40 transition-all min-h-[80px] resize-none"
                                placeholder="Enter marketing text..."
                            />
                        </div>
                    </HUDPanel>
                </div>
            </div>

            {/* Preview Section */}
            <div className="mt-12">
                <HUDPanel title="RENDER PREVIEW" subtitle="CLIENT_SIDE_OUTPUT" className="bg-black text-white p-12">
                    <div className="max-w-3xl">
                        <span className="text-[10px] font-black tracking-[0.5em] opacity-40 uppercase mb-4 block">Deployment Status: Active</span>
                        <h1 className="text-5xl font-black tracking-tighter mb-6 uppercase leading-none">{formData.hero.title}</h1>
                        <p className="text-xl text-white/60 font-light max-w-xl italic uppercase tracking-wide leading-relaxed">
                            {formData.hero.description}
                        </p>
                    </div>

                    <div className="mt-12 flex items-center gap-8 opacity-40 grayscale">
                        <div className="w-48 aspect-video bg-white/10 rounded-sm border border-white/20 overflow-hidden">
                            <img src={formData.mockups.desktopImage} className="w-full h-full object-cover" />
                        </div>
                        <div className="w-16 aspect-[9/16] bg-white/10 rounded-sm border border-white/20 overflow-hidden">
                            <img src={formData.mockups.mobileImage} className="w-full h-full object-cover" />
                        </div>
                    </div>
                </HUDPanel>
            </div>

            {/* System Metadata Footer */}
            <div className="mt-16 pt-8 border-t border-foreground/5 flex justify-between items-center opacity-20">
              <span className="text-[8px] font-black uppercase tracking-[0.5em]">PRODUS SYSTEM MANAGEMENT v2.4</span>
              <div className="flex gap-2">
                {[1,2,3,4,5,6].map(i => <div key={i} className="size-1 bg-foreground rounded-full" />)}
              </div>
            </div>
        </div>
    );
};

export default AdminLandingManager;
