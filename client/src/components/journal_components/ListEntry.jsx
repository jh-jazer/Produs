import React, { useState, useRef } from 'react';
import { ChevronLeft, Plus, Trash2, CheckSquare, Square, Image as ImageIcon, X } from 'lucide-react';

const ListEntry = ({ onSave, onBack, initialList }) => {
    const [title, setTitle] = useState(initialList ? initialList.title : '');
    const [items, setItems] = useState(initialList ? initialList.items : []);
    const [imageUrl, setImageUrl] = useState(initialList ? initialList.imageUrl || '' : '');
    const [loading, setLoading] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    const fileInputRef = useRef(null);

    const handleAddItem = (e) => {
        e?.preventDefault();
        if (!newItemText.trim()) return;
        setItems([...items, { id: Date.now().toString(), text: newItemText.trim(), done: false }]);
        setNewItemText('');
    };

    const handleToggleItem = (id) => {
        setItems(items.map(item => item.id === id ? { ...item, done: !item.done } : item));
    };

    const handleDeleteItem = (id) => {
        setItems(items.filter(item => item.id !== id));
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
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-black dark:hover:text-white transition-colors text-[11px] font-black uppercase tracking-[0.2em] active:scale-95"
                >
                    <ChevronLeft size={16} />
                    Back
                </button>
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
                            onClick={() => setImageUrl('')}
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
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Checklist Title"
                    className="bg-transparent border-none focus:ring-0 text-2xl md:text-3xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 w-full p-0 tracking-tight outline-none"
                />
            </div>

            {/* Interactive Items Roster */}
            <div className="w-full bg-white dark:bg-black px-6 py-4 flex flex-col min-h-[220px] justify-between">
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
            <div className="bg-white dark:bg-black p-4 px-6 border-t border-slate-100 dark:border-white/10 flex items-center">
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
