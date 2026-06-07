import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Image as ImageIcon, X, ChevronDown } from 'lucide-react';
import api from '../../services/api';

const NoteEntry = ({ onSave, onBack, initialNote, onAutosave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState(() => {
        const savedNotes = JSON.parse(localStorage.getItem('produs_notes_store') || '[]');
        const existingCats = savedNotes.map(n => n.category).filter(Boolean);
        const defaults = ['PERSONAL', 'WORK', 'IDEAS', 'GENERAL'];
        const unique = Array.from(new Set([...defaults, ...existingCats.map(c => c.toUpperCase())]));
        return unique;
    });
    const [selectedCategory, setSelectedCategory] = useState('GENERAL');
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [activeFormats, setActiveFormats] = useState({});
    const [showSizeMenu, setShowSizeMenu] = useState(false);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    // Autosave state & refs
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
    const currentIdRef = useRef(initialNote?.id || null);
    const isFirstLoad = useRef(true);
    const isDirtyRef = useRef(false);

    // Custom dropdown states
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (initialNote) {
            // Only update local inputs if the note ID changes or it's the first render
            if (isFirstLoad.current || initialNote.id !== currentIdRef.current) {
                setTitle(initialNote.title || '');
                setContent(initialNote.content || '');
                setImageUrl(initialNote.imageUrl || '');
                const noteCat = (initialNote.category || 'GENERAL').toUpperCase();
                setSelectedCategory(noteCat);
                currentIdRef.current = initialNote.id;
                setCategories(prev => {
                    if (!prev.includes(noteCat)) {
                        return [...prev, noteCat];
                    }
                    return prev;
                });
                if (textareaRef.current) {
                    textareaRef.current.innerHTML = initialNote.content || '';
                }
                isFirstLoad.current = false;
            }
        } else {
            if (currentIdRef.current || isFirstLoad.current) {
                setTitle('');
                setContent('');
                setImageUrl('');
                setSelectedCategory('GENERAL');
                currentIdRef.current = null;
                if (textareaRef.current) {
                    textareaRef.current.innerHTML = '';
                }
                isFirstLoad.current = false;
            }
        }
    }, [initialNote]);

    const checkFormatting = () => {
        if (!textareaRef.current) return;
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        });
    };

    const handleFormat = (e, command, value = null) => {
        e.preventDefault();
        const editor = textareaRef.current;
        if (!editor) return;

        if (command === 'checkbox') {
            document.execCommand('insertHTML', false, '<div class="flex items-start gap-2 my-1"><span class="material-symbols-outlined text-slate-400 text-[16px] mt-0.5" contenteditable="false">check_box_outline_blank</span> <span contenteditable="true">&#8203;</span></div><br/>');
        } else {
            document.execCommand(command, false, value);
        }

        setContent(editor.innerHTML);
        isDirtyRef.current = true;
        editor.focus();
        checkFormatting();
    };

    // Track latest values in a ref for debounced autosave execution
    const latestValues = useRef({ title, content, imageUrl, selectedCategory });
    useEffect(() => {
        latestValues.current = { title, content, imageUrl, selectedCategory };
    }, [title, content, imageUrl, selectedCategory]);

    // Autosave Effect
    useEffect(() => {
        if (!isDirtyRef.current) return;
        if (!title.trim() && !content.trim()) {
            setSaveStatus('idle');
            return;
        }

        setSaveStatus('saving');

        const timer = setTimeout(() => {
            const { title: t, content: c, imageUrl: img, selectedCategory: cat } = latestValues.current;
            try {
                const activeId = onAutosave?.({
                    title: t.trim() || 'UNTITLED_NOTE',
                    content: c.trim(),
                    imageUrl: img,
                    category: cat
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
    }, [title, content, imageUrl, selectedCategory]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/auth/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data && (res.data.secure_url || res.data.url)) {
                setImageUrl(res.data.secure_url || res.data.url);
                isDirtyRef.current = true;
            } else {
                console.error('Upload error:', res.data);
                alert('Upload failed: Invalid response from server');
            }
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Upload failed: ' + (error.response?.data?.message || error.message || 'Check Cloudinary settings'));
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
        setContent('');
        setImageUrl('');
        if (textareaRef.current) textareaRef.current.innerHTML = '';
    };

    const handleConfirm = () => {
        if (!title.trim() && !content.trim()) return;
        isDirtyRef.current = false;
        onSave?.({
            title: title.trim() || 'UNTITLED_NOTE',
            content: content.trim(),
            imageUrl,
            category: selectedCategory
        });
        handleClear();
    };

    const handleSaveNewCategory = () => {
        const trimmed = newCategoryName.trim();
        if (!trimmed) return;
        const formatted = trimmed.toUpperCase();
        if (!categories.includes(formatted)) {
            setCategories(prev => [...prev, formatted]);
        }
        setSelectedCategory(formatted);
        isDirtyRef.current = true;
        setIsCreatingNew(false);
    };

    const getBtnClass = (cmd) => {
        return `p-1.5 rounded flex-shrink-0 transition-colors ${
            activeFormats[cmd]                        ? 'bg-black/10 text-black dark:bg-white/10 dark:text-white' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#121212]'
        }`;
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
                <div className="flex items-center gap-2">
                    {/* Category Selector */}
                    {isCreatingNew ? (
                        <div className="flex items-center gap-1.5">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="NEW..."
                                className="px-2 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#121212] text-[10px] font-black uppercase tracking-wider outline-none focus:border-primary w-20"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveNewCategory();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleSaveNewCategory}
                                className="px-2 py-1.5 rounded bg-black dark:bg-white text-white dark:text-black text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all"
                            >
                                Add
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreatingNew(false)}
                                className="p-1.5 rounded bg-black/5 dark:bg-white/5 text-slate-500 hover:text-black dark:hover:text-white flex items-center justify-center"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ) : (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#121212] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 outline-none transition-all cursor-pointer flex items-center justify-between gap-1.5 max-w-[110px] md:max-w-[140px] truncate select-none active:scale-95"
                            >
                                <span className="truncate">{selectedCategory}</span>
                                <ChevronDown size={12} className={`stroke-[3] text-slate-500 shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-[#0c0c0c] border border-black/10 dark:border-white/10 rounded-lg shadow-xl p-1.5 min-w-[130px] md:min-w-[150px] flex flex-col gap-0.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                    <div className="max-h-[160px] overflow-y-auto flex flex-col gap-0.5 custom-scrollbar pr-0.5">
                                        {categories.map(cat => {
                                            const isSelected = cat === selectedCategory;
                                            return (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedCategory(cat);
                                                        isDirtyRef.current = true;
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-colors ${
                                                        isSelected 
                                                            ? 'bg-black text-white dark:bg-white dark:text-black font-black' 
                                                            : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                                    }`}
                                                >
                                                    {cat}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="h-px bg-black/5 dark:bg-white/5 my-1" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCreatingNew(true);
                                            setNewCategoryName('');
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-primary hover:bg-primary/5 rounded-md transition-colors flex items-center gap-1"
                                    >
                                        <span>➕ NEW...</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <button 
                        onClick={handleConfirm}
                        disabled={loading || (!title.trim() && !content.trim())}
                        className="px-4 md:px-6 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-30 active:scale-95 shadow-lg shadow-black/5 shrink-0"
                    >
                        {loading ? 'SAVING...' : 'Save'}
                    </button>
                </div>
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
                        <img src={imageUrl} alt="Note visuals" className="w-full h-full object-cover opacity-80" />
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



            {/* Title Input Area */}
            <div className="bg-white dark:bg-black px-4 pt-2 flex items-center gap-3">
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); isDirtyRef.current = true; }}
                    placeholder="Note Title"
                    className="bg-transparent border-none focus:ring-0 text-2xl md:text-3xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 w-full p-0 tracking-tight outline-none"
                />
            </div>

            {/* Rich Editor Canvas */}
            <div className="relative">
                <div 
                    ref={textareaRef}
                    className="w-full bg-white dark:bg-black border-none focus:ring-0 px-6 pt-5 pb-40 md:pb-5 min-h-[calc(100vh-320px)] md:min-h-[500px] text-lg md:text-xl text-slate-700 dark:text-slate-300 outline-none font-medium leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 dark:empty:before:text-slate-600 cursor-text [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-1"
                    data-placeholder="Write your note here..."
                    contentEditable="true"
                    suppressContentEditableWarning={true}
                    onInput={(e) => {
                        setContent(e.currentTarget.innerHTML);
                        isDirtyRef.current = true;
                        checkFormatting();
                    }}
                    onKeyUp={checkFormatting}
                    onMouseUp={checkFormatting}
                />
            </div>

            {/* Editor Toolbar */}
            <div 
                className="fixed bottom-24 md:static left-0 right-0 md:left-auto md:right-auto z-[140] md:z-auto bg-white dark:bg-black border-t border-slate-100 dark:border-white/10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.5)] md:shadow-none p-4 px-6 flex flex-col gap-4"
            >
                {/* Formatting Tools */}
                <div className="flex flex-wrap gap-1.5 items-center justify-end w-full">
                    <button 
                        onClick={handleAddImage}
                        title="Add Image"
                        className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded text-slate-600 dark:text-slate-400 shrink-0"
                    >
                        <ImageIcon size={20} />
                    </button>
                    <div className="w-px bg-slate-200 dark:border-white/10 mx-1 h-5 flex-shrink-0"></div>

                    <div className="relative flex-shrink-0">
                        <button 
                            onMouseDown={(e) => { e.preventDefault(); setShowSizeMenu(!showSizeMenu); }} 
                            title="Text Size" 
                            type="button" 
                            className="p-1 px-2 hover:bg-slate-200 dark:hover:bg-[#121212] rounded text-slate-600 dark:text-slate-400 flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[20px]">format_size</span>
                            <span className="material-symbols-outlined text-[14px]">expand_more</span>
                        </button>
                        
                        {showSizeMenu && (
                            <div className="absolute bottom-full mb-1 left-0 bg-white dark:bg-[#000000] border border-slate-100 dark:border-white/10 rounded-lg shadow-xl p-1.5 z-50 flex flex-col min-w-[120px]">
                                <button onMouseDown={(e) => { handleFormat(e, 'fontSize', '2'); setShowSizeMenu(false); }} className="px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#121212] rounded font-medium">Small</button>
                                <button onMouseDown={(e) => { handleFormat(e, 'fontSize', '3'); setShowSizeMenu(false); }} className="px-3 py-1.5 text-sm text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#121212] rounded font-medium">Normal</button>
                                <button onMouseDown={(e) => { handleFormat(e, 'fontSize', '5'); setShowSizeMenu(false); }} className="px-3 py-1.5 text-lg text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#121212] rounded font-medium">Large</button>
                            </div>
                        )}
                    </div>
                    <div className="w-px bg-slate-200 dark:border-white/10 mx-1 h-5 flex-shrink-0"></div>
                    <button onMouseDown={(e) => handleFormat(e, 'bold')} title="Bold" type="button" className={getBtnClass('bold')}><span className="material-symbols-outlined text-[20px]">format_bold</span></button>
                    <button onMouseDown={(e) => handleFormat(e, 'italic')} title="Italic" type="button" className={getBtnClass('italic')}><span className="material-symbols-outlined text-[20px]">format_italic</span></button>
                    <button onMouseDown={(e) => handleFormat(e, 'insertUnorderedList')} title="Bullet List" type="button" className={getBtnClass('insertUnorderedList')}><span className="material-symbols-outlined text-[20px]">format_list_bulleted</span></button>
                    <button onMouseDown={(e) => handleFormat(e, 'checkbox')} title="Task List" type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#121212] rounded text-slate-600 dark:text-slate-400 flex-shrink-0"><span className="material-symbols-outlined text-[20px]">check_box</span></button>
                </div>

            </div>
        </div>
    );
};

export default NoteEntry;
