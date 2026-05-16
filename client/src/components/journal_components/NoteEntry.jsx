import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Image as ImageIcon, X } from 'lucide-react';

const NoteEntry = ({ onSave, onBack, initialNote }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('blue');
    const [activeFormats, setActiveFormats] = useState({});
    const [showSizeMenu, setShowSizeMenu] = useState(false);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialNote) {
            setTitle(initialNote.title || '');
            setContent(initialNote.content || '');
            setImageUrl(initialNote.imageUrl || '');
            setSelectedCategory(initialNote.category || 'blue');
            if (textareaRef.current) {
                textareaRef.current.innerHTML = initialNote.content || '';
            }
        } else {
            setTitle('');
            setContent('');
            setImageUrl('');
            setSelectedCategory('blue');
            if (textareaRef.current) {
                textareaRef.current.innerHTML = '';
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
        editor.focus();
        checkFormatting();
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
        setContent('');
        setImageUrl('');
        if (textareaRef.current) textareaRef.current.innerHTML = '';
    };

    const handleConfirm = () => {
        if (!title.trim() && !content.trim()) return;
        onSave?.({
            title: title.trim() || 'UNTITLED_NOTE',
            content: content.trim(),
            imageUrl,
            category: selectedCategory
        });
        handleClear();
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
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-black dark:hover:text-white transition-colors text-[11px] font-black uppercase tracking-[0.2em] active:scale-95"
                >
                    <ChevronLeft size={16} />
                    Back
                </button>
                <button 
                    onClick={handleConfirm}
                    disabled={loading || (!title.trim() && !content.trim())}
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

            {/* Top Bar: Category selectors on left, Back button on right */}
            <div className="bg-white dark:bg-black px-4 pt-4 flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">COLOR:</span>
                    {['blue', 'gray', 'white'].map(c => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setSelectedCategory(c)}
                            className={`size-4 rounded-full border-2 transition-all ${selectedCategory === c ? 'scale-125 ring-2 ring-black/40 dark:ring-white/40' : 'opacity-40'} ${
                                c === 'blue' ? 'bg-black dark:bg-white border-black dark:border-white' : c === 'gray' ? 'bg-slate-400 border-slate-500' : 'bg-white border-white'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Title Input Area */}
            <div className="bg-white dark:bg-black px-4 pt-2 flex items-center gap-3">
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note Title"
                    className="bg-transparent border-none focus:ring-0 text-2xl md:text-3xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 w-full p-0 tracking-tight outline-none"
                />
            </div>

            {/* Rich Editor Canvas */}
            <div className="relative">
                <div 
                    ref={textareaRef}
                    className="w-full bg-white dark:bg-black border-none focus:ring-0 px-6 py-5 min-h-[260px] text-lg md:text-xl text-slate-700 dark:text-slate-300 outline-none font-medium leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 dark:empty:before:text-slate-600 cursor-text [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-1"
                    data-placeholder="Write your note here..."
                    contentEditable="true"
                    suppressContentEditableWarning={true}
                    onInput={(e) => {
                        setContent(e.currentTarget.innerHTML);
                        checkFormatting();
                    }}
                    onKeyUp={checkFormatting}
                    onMouseUp={checkFormatting}
                />
            </div>

            {/* Editor Toolbar */}
            <div className="bg-white dark:bg-black p-4 px-6 border-t border-slate-100 dark:border-white/10 flex flex-col gap-4">
                {/* Formatting Tools */}
                <div className="flex flex-wrap gap-1.5 items-center justify-start w-full">
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
