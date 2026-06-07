import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, CheckSquare, Square, Image as ImageIcon, X } from 'lucide-react';

const ListEntry = ({ onSave, onBack, initialList, onAutosave }) => {
    const [title, setTitle] = useState('');
    const [items, setItems] = useState([]);
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    const fileInputRef = useRef(null);

    // Autosave states & refs
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
    const currentIdRef = useRef(initialList?.id || null);
    const isFirstLoad = useRef(true);
    const isDirtyRef = useRef(false);

    useEffect(() => {
        if (initialList) {
            // Only update local inputs if list ID changes or it's the first render
            if (isFirstLoad.current || initialList.id !== currentIdRef.current) {
                setTitle(initialList.title || '');
                setItems(initialList.items || []);
                setImageUrl(initialList.imageUrl || '');
                currentIdRef.current = initialList.id;
                isFirstLoad.current = false;
            }
        } else {
            if (currentIdRef.current || isFirstLoad.current) {
                setTitle('');
                setItems([]);
                setImageUrl('');
                currentIdRef.current = null;
                isFirstLoad.current = false;
            }
        }
    }, [initialList]);

    // Track latest values in a ref for debounced autosave execution
    const latestValues = useRef({ title, items, imageUrl });
    useEffect(() => {
        latestValues.current = { title, items, imageUrl };
    }, [title, items, imageUrl]);

    // Autosave Effect
    useEffect(() => {
        if (!isDirtyRef.current) return;
        if (!title.trim() && items.length === 0) {
            setSaveStatus('idle');
            return;
        }

        setSaveStatus('saving');

        const timer = setTimeout(() => {
            const { title: t, items: its, imageUrl: img } = latestValues.current;
            try {
                const activeId = onAutosave?.({
                    title: t.trim() || 'UNTITLED_CHECKLIST',
                    items: its,
                    imageUrl: img
                });
                if (activeId) {
                    currentIdRef.current = activeId;
                }
                setSaveStatus('saved');
            } catch (err) {
                console.error('Autosave failed:', err);
                setSaveStatus('error');
            }
        }, 1500); // 1.5s debounce

        return () => clearTimeout(timer);
    }, [title, items, imageUrl]);

    const handleAddItem = (e) => {
        e?.preventDefault();
        if (!newItemText.trim()) return;
        setItems([...items, { id: Date.now().toString(), text: newItemText.trim(), done: false }]);
        isDirtyRef.current = true;
        setNewItemText('');
    };

    const handleToggleItem = (id) => {
        setItems(items.map(item => item.id === id ? { ...item, done: !item.done } : item));
        isDirtyRef.current = true;
    };

    const handleDeleteItem = (id) => {
        setItems(items.filter(item => item.id !== id));
        isDirtyRef.current = true;
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (cloudName === 'your_cloud_name' || !cloudName) {
            alert('Cloudinary configuration missing. Please update .env file.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.secure_url) {
                setImageUrl(data.secure_url);
                isDirtyRef.current = true;
            } else {
                console.error('Cloudinary upload error:', data);
                alert('Upload failed: ' + (data.error?.message || 'Check Cloudinary settings'));
            }
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Critical communication error with Cloudinary.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleClear = () => {
        setTitle('');
        setItems([]);
        setImageUrl('');
        setNewItemText('');
    };

    const handleConfirm = () => {
        if (!title.trim() && items.length === 0) return;
        isDirtyRef.current = false;
        onSave?.({
            title: title.trim() || 'UNTITLED_CHECKLIST',
            items,
            imageUrl
        });
        handleClear();
    };

    return (
        <div className="border-y md:border border-slate-200 dark:border-white/10 rounded-none md:rounded-[2rem] overflow-hidden flex flex-col bg-slate-50 dark:bg-black transition-shadow shadow-none text-left">
            {/* Top Bar: Navigation & Action */}
            <div className="bg-white dark:bg-black p-3 px-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between z-40">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onBack}
                        className="p-1.5 rounded-xl bg-black/5 dark:bg-white/5 text-slate-500 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-90 flex items-center justify-center"
                        title="Back"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {/* Autosave Status Indicator */}
                    {saveStatus === 'saving' && (
                        <span className="text-[9px] font-mono text-slate-400 dark:text-white/40 uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-slate-400 dark:bg-white/40 animate-ping shrink-0" />
                            Saving...
                        </span>
                    )}
                    {saveStatus === 'saved' && (
                        <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                            Saved
                        </span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="text-[9px] font-mono text-rose-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">error</span>
                            Error
                        </span>
                    )}
                </div>
                <button 
                    onClick={handleConfirm}
                    disabled={loading || (!title.trim() && items.length === 0)}
                    className="px-6 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-30 active:scale-95 shadow-lg shadow-black/5"
                >
                    {loading ? 'SAVING...' : 'Save'}
                </button>
            </div>

            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*" 
            />

            {/* Top Visual / Attach Image Section */}
            <div className="relative w-full border-b border-dashed border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-black">
                <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                    {imageUrl && (
                        <button 
                            onClick={() => { setImageUrl(''); isDirtyRef.current = true; }}
                            className="size-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-rose-500 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {imageUrl ? (
                    <div className="relative w-full h-48 md:h-64 bg-slate-900 overflow-hidden">
                        <img src={imageUrl} alt="List visuals" className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    </div>
                ) : (
                    <button 
                        onClick={handleAddImage}
                        disabled={loading}
                        className="w-full py-8 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all group disabled:opacity-50"
                    >
                        <div className="size-12 rounded-full border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-black dark:group-hover:border-white group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-all">
                            {loading ? (
                                <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            ) : (
                                <ImageIcon size={20} className="group-hover:scale-110 transition-transform" />
                            )}
                        </div>
                        <div className="text-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] block">
                                {loading ? 'UPLOADING...' : 'Attach image'}
                            </span>
                        </div>
                    </button>
                )}
            </div>

            {/* Top Bar: Navigation Back button */}
            <div className="bg-white dark:bg-black px-6 pt-6 flex justify-between items-center gap-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">CREATE LIST</span>
            </div>

            {/* Title Input Area */}
            <div className="bg-white dark:bg-black px-4 pt-2 pb-2 flex items-center gap-3">
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); isDirtyRef.current = true; }}
                    placeholder="Checklist Title"
                    className="bg-transparent border-none focus:ring-0 text-2xl md:text-3xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 w-full p-0 tracking-tight outline-none"
                />
            </div>

            {/* Interactive Items Roster */}
            <div className="w-full bg-white dark:bg-black px-6 pt-4 pb-40 md:pb-4 flex flex-col min-h-[calc(100vh-320px)] md:min-h-[500px] justify-between">
                <div className="flex flex-col gap-2">
                    {items.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4">No items added yet. Add items below.</p>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex items-center justify-between group/item py-2 px-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                <button 
                                    type="button"
                                    onClick={() => handleToggleItem(item.id)}
                                    className="flex items-center gap-3 text-left flex-1 min-w-0"
                                >
                                    {item.done ? (
                                        <CheckSquare className="size-4 text-black dark:text-white shrink-0" />
                                    ) : (
                                        <Square className="size-4 text-slate-400 shrink-0" />
                                    )}
                                    <span className={`text-lg font-medium truncate ${item.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {item.text}
                                    </span>
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="opacity-0 group-hover/item:opacity-100 transition-opacity text-slate-400 hover:text-red-500 p-1"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Subform Input Row */}
                <form onSubmit={handleAddItem} className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                    <input 
                        type="text" 
                        placeholder="Add an item..." 
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        className="flex-1 bg-transparent border-b border-slate-200 dark:border-white/10 px-2 py-1.5 text-sm outline-none text-slate-800 dark:text-slate-200 focus:border-black dark:focus:border-white font-medium"
                    />
                    <button 
                        type="submit"
                        className="text-[10px] font-black tracking-wider uppercase bg-black/10 dark:bg-white/10 text-black dark:text-white px-3 py-1.5 hover:bg-black/20 dark:hover:bg-white/20 rounded-lg transition-colors shrink-0"
                    >
                        <Plus className="size-3.5 inline mr-1" /> Add
                    </button>
                </form>
            </div>

            {/* Bottom Toolbar */}
            <div 
                className="fixed bottom-24 md:static left-0 right-0 md:left-auto md:right-auto z-[140] md:z-auto bg-white dark:bg-black p-4 px-6 border-t border-slate-100 dark:border-white/10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.5)] md:shadow-none flex items-center justify-end"
            >
                <button 
                    onClick={handleAddImage}
                    title="Add Image"
                    className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded text-slate-600 dark:text-slate-400 shrink-0"
                >
                    <ImageIcon size={20} />
                </button>
            </div>
        </div>
    );
};

export default ListEntry;
