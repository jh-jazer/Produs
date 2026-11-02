import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../../hooks/useJournal';
import { Image as ImageIcon, Type, X, ChevronLeft } from 'lucide-react';
import { MoodTracker } from '../dashboard/DashboardRealityWidgets';
import api from '../../services/api';
import { sanitizeEditorHtml } from '../../utils/sanitize';

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

const JournalEntry = ({ onAction, onBack, initialEntry }) => {
    const navigate = useNavigate();
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

    // Autosave state & refs
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
    const currentIdRef = useRef(initialEntry?._id || null);
    const isFirstLoad = useRef(true);
    const isDirtyRef = useRef(false);

    // Populate editor if editing an existing entry
    useEffect(() => {
        if (initialEntry) {
            // Only update local states if ID changes or it's the first render
            if (isFirstLoad.current || initialEntry._id !== currentIdRef.current) {
                setContent(initialEntry.content || '');
                setMood(initialEntry.mood);
                setTitle(initialEntry.title || '');
                setImageUrl(initialEntry.imageUrl || '');
                currentIdRef.current = initialEntry._id;
                if (textareaRef.current) {
                    textareaRef.current.innerHTML = sanitizeEditorHtml(initialEntry.content || '');
                }
                isFirstLoad.current = false;
            }
        } else {
            if (currentIdRef.current || isFirstLoad.current) {
                setContent('');
                setTitle('');
                setImageUrl('');
                setMood(null);
                setActivePrompt(null);
                currentIdRef.current = null;
                if (textareaRef.current) {
                    textareaRef.current.innerHTML = '';
                }
                isFirstLoad.current = false;
            }
        }
    }, [initialEntry]);

    // Track latest values in a ref for debounced autosave execution
    const latestValues = useRef({ title, content, mood, imageUrl });
    useEffect(() => {
        latestValues.current = { title, content, mood, imageUrl };
    }, [title, content, mood, imageUrl]);

    // Autosave Effect
    useEffect(() => {
        if (!isDirtyRef.current) return;
        if (!title.trim() && !content.trim()) {
            setSaveStatus('idle');
            return;
        }

        setSaveStatus('saving');

        const timer = setTimeout(async () => {
            const { title: t, content: c, mood: m, imageUrl: img } = latestValues.current;
            try {
                if (currentIdRef.current) {
                    const result = await updateEntry(currentIdRef.current, c, m || 'neutral', t, img);
                    if (result?.error) {
                        setSaveStatus('error');
                        return;
                    }
                } else {
                    const newEntry = await addEntry(c, m || 'neutral', t, img);
                    if (newEntry?.error) {
                        setSaveStatus('error');
                        return;
                    }
                    if (newEntry && newEntry._id) {
                        currentIdRef.current = newEntry._id;
                        navigate(`/dashboard/writing/journal/${newEntry._id}`, { replace: true });
                    }
                }
                setSaveStatus('saved');
            } catch (err) {
                console.error('Autosave failed:', err);
                setSaveStatus('error');
            }
        }, 1500); // 1.5s debounce

        return () => clearTimeout(timer);
    }, [title, content, mood, imageUrl]);

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
        if (!content.trim() && !title.trim()) return;
        
        setLoading(true);
        try {
            const { title: t, content: c, mood: m, imageUrl: img } = latestValues.current;
            let result;
            if (currentIdRef.current) {
                result = await updateEntry(currentIdRef.current, c, m || 'neutral', t, img);
            } else {
                result = await addEntry(c, m || 'neutral', t, img);
            }
            if (result?.error) {
                setSaveStatus('error');
                return;
            }
            isDirtyRef.current = false;
            setContent('');
            setTitle('');
            setImageUrl('');
            setMood(null);
            setActivePrompt(null);
            if (onAction) onAction();
        } catch (error) {
            console.error('Failed to save journal entry:', error);
            setSaveStatus('error');
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
        isDirtyRef.current = true;
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
        isDirtyRef.current = true;
        editor.focus();
        checkFormatting();
    };

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
            activeFormats[cmd]                        ? 'bg-black/10 text-black dark:bg-white/10 dark:text-white' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#121212]'
        }`;
    };

    return (
        <div className="border-y md:border border-slate-200 dark:border-white/10 rounded-none md:rounded-[2rem] overflow-hidden flex flex-col bg-slate-50 dark:bg-black transition-shadow shadow-none focus-within:shadow-none focus-within:border-slate-300 dark:focus-within:border-slate-600">
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
                    onClick={onSaveWrapper}
                    disabled={loading || !content.trim()}
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

            {/* Top Visual / Attach Image Section with Integrated Back Button */}
            <div className="relative w-full border-b border-dashed border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-black">
                {/* Absolute Controls Row (Top Right) */}
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

                {/* Image Preview or Trigger */}
                {imageUrl ? (
                    <div className="relative w-full h-48 md:h-64 bg-slate-900 overflow-hidden">
                        <img src={imageUrl} alt="Journal visuals" className="w-full h-full object-cover opacity-80" />
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

            {/* Header Block: Mood Tracker (Left) & Date (Right) */}
            <div className="bg-white dark:bg-black px-4 pt-4 flex justify-between items-start gap-4">
                <div className="z-20 shrink-0">
                    <MoodTracker 
                        user={{ settings: { mood: mood } }} 
                        updateMood={(val) => { setMood(val); isDirtyRef.current = true; }} 
                        standalone 
                    />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white/80 mt-2 text-right">
                    {new Date(initialEntry ? initialEntry.date : Date.now()).toLocaleDateString(undefined, { 
                        month: 'long', 
                        day: 'numeric', 
                        weekday: 'long' 
                    }).toUpperCase()}
                </span>
            </div>

            {/* Title Input Area */}
            <div className="bg-white dark:bg-black px-4 pt-2 flex items-center gap-3">
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); isDirtyRef.current = true; }}
                    placeholder="Title"
                    className="bg-transparent border-none focus:ring-0 text-2xl md:text-3xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 w-full p-0 tracking-tight"
                />
            </div>

            <div className="relative">
                <div 
                    ref={textareaRef}
                    className="w-full bg-white dark:bg-black border-none focus:ring-0 px-6 pt-5 pb-40 md:pb-5 min-h-[calc(100vh-320px)] md:min-h-[500px] text-lg md:text-xl text-slate-700 dark:text-slate-300 outline-none font-medium leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 dark:empty:before:text-slate-600 cursor-text [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-1 [&_blockquote]:border-l-[3px] [&_blockquote]:border-slate-400/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 [&_blockquote]:bg-slate-400/5 [&_blockquote]:py-1 [&_blockquote]:rounded-r-md [&_a]:text-black dark:[&_a]:text-white [&_a]:underline [&_h1]:text-3xl [&_h1]:font-black [&_h1]:my-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-2"
                    data-placeholder="Input text"
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

            {/* Google Keep Style Bottom Toolbar */}
            {/* Journal Toolbar */}
            <div 
                className="fixed bottom-24 md:static left-0 right-0 md:left-auto md:right-auto z-[140] md:z-auto bg-white dark:bg-black border-t border-slate-100 dark:border-white/10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.5)] md:shadow-none p-4 px-6 flex flex-col gap-4"
            >
                {/* 1. All Operation Icons Row */}
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
                                <button onMouseDown={(e) => { handleFormat(e, 'fontSize', '6'); setShowSizeMenu(false); }} className="px-3 py-1.5 text-xl font-bold text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#121212] rounded">Huge</button>
                            </div>
                        )}
                    </div>
                    <div className="w-px bg-slate-200 dark:border-white/10 mx-1 h-5 flex-shrink-0"></div>
                    <button onMouseDown={(e) => handleFormat(e, 'bold')} title="Bold" type="button" className={getBtnClass('bold')}><span className="material-symbols-outlined text-[20px]">format_bold</span></button>
                    <button onMouseDown={(e) => handleFormat(e, 'italic')} title="Italic" type="button" className={getBtnClass('italic')}><span className="material-symbols-outlined text-[20px]">format_italic</span></button>
                    <button onMouseDown={(e) => handleFormat(e, 'insertUnorderedList')} title="Bullet List" type="button" className={getBtnClass('insertUnorderedList')}><span className="material-symbols-outlined text-[20px]">format_list_bulleted</span></button>
                    <button onMouseDown={(e) => handleFormat(e, 'checkbox')} title="Task List" type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#121212] rounded text-slate-600 dark:text-slate-400 flex-shrink-0"><span className="material-symbols-outlined text-[20px]">check_box</span></button>
                    <div className="w-px bg-slate-200 dark:border-white/10 mx-1 h-5 flex-shrink-0"></div>
                    <button 
                        onClick={handleApplyPrompt} 
                        title="Prompt Bowl - Insert Reflection" 
                        className="p-1.5 flex items-center justify-center hover:bg-black/10 hover:text-black dark:hover:bg-white/10 dark:hover:text-white rounded text-slate-600 dark:text-slate-400 flex-shrink-0 transition-all active:scale-90"
                    >
                        <span className="material-symbols-outlined text-[22px]">soup_kitchen</span>
                    </button>
                </div>
                
            </div>
        </div>
    );
};

export default JournalEntry;
