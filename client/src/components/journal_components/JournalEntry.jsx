import React, { useState, useRef } from 'react';
import { useJournal } from '../../hooks/useJournal';
import { Image as ImageIcon, Type, X } from 'lucide-react';
import { MoodTracker } from '../dashboard/DashboardRealityWidgets';

const JOURNAL_PROMPTS = [
    "What is one small victory you achieved today, and how did it make you feel?",
    "What was the most peaceful moment of your day?",
    "Describe a challenge you faced today and what you learned from it.",
    "Who is someone that made a positive impact on your day today?",
    "What is something you are looking forward to tomorrow?",
    "Write about a moment today that made you laugh or smile.",
    "What is something new you learned today?",
    "How did you practice self-care today?",
    "If today was a chapter in a book, what would its title be?",
    "What is a thought or feeling you've been avoiding that you need to acknowledge?",
    "Write about a simple joy you experienced today.",
    "What is something you are grateful for right now?"
];

const JournalEntry = ({ onAction, initialEntry }) => {
    const [mood, setMood] = useState(null);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [promptIndex, setPromptIndex] = useState(Math.floor(Math.random() * JOURNAL_PROMPTS.length));
    const [activePrompt, setActivePrompt] = useState(null);
    const [activeFormats, setActiveFormats] = useState({});
    const [showSizeMenu, setShowSizeMenu] = useState(false);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const { addEntry, updateEntry } = useJournal();

    // Populate editor if editing an existing entry
    React.useEffect(() => {
        if (initialEntry) {
            setContent(initialEntry.content);
            setMood(initialEntry.mood);
            setTitle(initialEntry.title || '');
            setImageUrl(initialEntry.imageUrl || '');
            if (textareaRef.current) {
                textareaRef.current.innerHTML = initialEntry.content;
            }
        } else {
            // Reset for new entry
            setContent('');
            setTitle('');
            setImageUrl('');
            setMood(null);
            setActivePrompt(null);
            if (textareaRef.current) {
                textareaRef.current.innerHTML = '';
            }
        }
    }, [initialEntry, setMood]);

    const checkFormatting = () => {
        if (!textareaRef.current) return;
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            strikeThrough: document.queryCommandState('strikeThrough'),
            insertUnorderedList: document.queryCommandState('insertUnorderedList'),
            quote: document.queryCommandValue('formatBlock') === 'blockquote',
        });
    };

    const handleSave = async () => {
        if (!content.trim()) return;
        
        setLoading(true);
        try {
            if (initialEntry?._id) {
                await updateEntry(initialEntry._id, content, mood || 'neutral', title, imageUrl);
            } else {
                await addEntry(content, mood || 'neutral', title, imageUrl);
            }
            setContent('');
            setTitle('');
            setImageUrl('');
            setMood(null);
            setActivePrompt(null);
            if (onAction) onAction();
        } catch (error) {
            console.error('Failed to save journal entry:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshPrompt = () => {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * JOURNAL_PROMPTS.length);
        } while (newIndex === promptIndex && JOURNAL_PROMPTS.length > 1);
        setPromptIndex(newIndex);
        return JOURNAL_PROMPTS[newIndex];
    };

    const handleApplyPrompt = () => {
        const prompt = handleRefreshPrompt();
        const editor = textareaRef.current;
        if (!editor) return;

        const formattedPrompt = `<p class="prompt-layer"><strong>${prompt}</strong></p><br class="prompt-br"/>`;
        
        // Check if there's already a prompt layer
        const existingPrompt = editor.querySelector('.prompt-layer');
        const existingBr = editor.querySelector('.prompt-br');
        
        if (existingPrompt) {
            existingPrompt.innerHTML = `<strong>${prompt}</strong>`;
        } else {
            editor.innerHTML = formattedPrompt + editor.innerHTML;
        }

        setContent(editor.innerHTML);
        setActivePrompt(prompt);
        editor.focus();
    };

    const handleFormat = (e, command, value = null) => {
        e.preventDefault();
        const editor = textareaRef.current;
        if (!editor) return;

        if (command === 'checkbox') {
            document.execCommand('insertHTML', false, '<div class="flex items-start gap-2 my-1"><span class="material-symbols-outlined text-slate-400 text-[16px] mt-0.5" contenteditable="false">check_box_outline_blank</span> <span contenteditable="true">&#8203;</span></div><br/>');
        } else if (command === 'quote') {
            document.execCommand('formatBlock', false, 'BLOCKQUOTE');
        } else if (command === 'link') {
            const url = window.prompt('Enter link URL:');
            if (url) {
                document.execCommand('createLink', false, url);
            }
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
        setContent('');
        setTitle('');
        setImageUrl('');
        if (textareaRef.current) textareaRef.current.innerHTML = '';
    };

    const onSaveWrapper = async () => {
        await handleSave();
        if (textareaRef.current) textareaRef.current.innerHTML = '';
    };

    const getBtnClass = (cmd) => {
        return `p-1.5 rounded flex-shrink-0 transition-colors ${
            activeFormats[cmd] 
                ? 'bg-primary/20 text-primary dark:bg-primary/30' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#121212]'
        }`;
    };

    return (
        <div className="border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden flex flex-col bg-slate-50 dark:bg-[#1f293a] transition-shadow shadow-none focus-within:shadow-none focus-within:border-slate-300 dark:focus-within:border-slate-600">
            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*" 
            />

            {/* Image Preview at Top */}
            {imageUrl ? (
                <div className="relative w-full h-48 md:h-64 bg-slate-900 overflow-hidden">
                    <img src={imageUrl} alt="Journal visuals" className="w-full h-full object-cover opacity-80" />
                    <button 
                        onClick={() => setImageUrl('')}
                        className="absolute top-4 right-4 size-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-rose-500 transition-colors z-20"
                    >
                        <X size={16} />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
            ) : (
                <button 
                    onClick={handleAddImage}
                    disabled={loading}
                    className="w-full py-8 border-b border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all group disabled:opacity-50"
                >
                    <div className="size-12 rounded-full border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
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
                        <span className="text-[8px] font-bold text-slate-400 tracking-widest opacity-60">Standard Upload</span>
                    </div>
                </button>
            )}

            {/* Title Input Area */}
            <div className="bg-white dark:bg-[#121212] px-6 pt-6 flex items-center gap-3">
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="bg-transparent border-none focus:ring-0 text-lg md:text-xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 w-full p-0 tracking-tight"
                />
            </div>

            <div className="relative">
                <div 
                    ref={textareaRef}
                    className="w-full bg-white dark:bg-[#121212] border-none focus:ring-0 px-6 py-5 min-h-[260px] text-slate-700 dark:text-slate-300 outline-none font-medium leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 dark:empty:before:text-slate-600 cursor-text [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-1 [&_blockquote]:border-l-[3px] [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 [&_blockquote]:bg-primary/5 [&_blockquote]:py-1 [&_blockquote]:rounded-r-md [&_a]:text-primary [&_a]:underline [&_h1]:text-2xl [&_h1]:font-black [&_h1]:my-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2"
                    data-placeholder="Input text"
                    contentEditable="true"
                    suppressContentEditableWarning={true}
                    onInput={(e) => {
                        setContent(e.currentTarget.innerHTML);
                        checkFormatting();
                    }}
                    onKeyUp={checkFormatting}
                    onMouseUp={checkFormatting}
                />

                {/* Integrated Mood Tracker - Lower Left */}
                <div className="absolute bottom-4 left-4 z-20">
                    <MoodTracker 
                        user={{ settings: { mood: mood } }} 
                        updateMood={(val) => setMood(val)} 
                        standalone 
                    />
                </div>
            </div>

            {/* Google Keep Style Bottom Toolbar */}
            {/* Journal Toolbar */}
            <div className="bg-white dark:bg-[#121212] p-4 px-6 border-t border-slate-100 dark:border-white/10 flex flex-col gap-4">
                {/* 1. All Operation Icons Row */}
                <div className="flex flex-wrap gap-1.5 items-center justify-between sm:justify-start w-full">
                    <div className="flex items-center gap-1">
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
                                    <button onMouseDown={(e) => { handleFormat(e, 'fontSize', '6'); setShowSizeMenu(false); }} className="px-3 py-1.5 text-xl font-bold text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#121212] rounded">Huge</button>
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
                
                {/* 2. Clear & Confirm Buttons Row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-white/5">
                    <button 
                        onClick={handleApplyPrompt} 
                        title="Prompt Bowl - Insert Reflection" 
                        className="size-10 flex items-center justify-center hover:bg-primary/10 hover:text-primary rounded-xl text-slate-500 flex-shrink-0 transition-all active:scale-90 border border-transparent hover:border-primary/20"
                    >
                        <span className="material-symbols-outlined text-[24px]">soup_kitchen</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleClear}
                            className="px-6 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                        >
                            Clear
                        </button>
                        <button 
                            onClick={onSaveWrapper}
                            disabled={loading || !content.trim()}
                            className="px-8 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-30 shadow-xl shadow-black/10 active:scale-95 flex items-center gap-2"
                        >
                            {loading ? 'SAVING...' : 'Confirm'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JournalEntry;
