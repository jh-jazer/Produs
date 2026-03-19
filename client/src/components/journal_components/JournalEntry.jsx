import React, { useState, useRef } from 'react';
import api from '../../services/api';

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

const JournalEntry = ({ onAction }) => {
    const [content, setContent] = useState('');
    const [mood, setMood] = useState('😊');
    const [loading, setLoading] = useState(false);
    const [promptIndex, setPromptIndex] = useState(Math.floor(Math.random() * JOURNAL_PROMPTS.length));
    const [activeFormats, setActiveFormats] = useState({});
    const [showSizeMenu, setShowSizeMenu] = useState(false);
    const textareaRef = useRef(null);

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

    const moods = ['😠', '🙁', '😐', '🙂', '😊'];

    const handleSave = async () => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            await api.post('/journal', { content, mood });
            setContent('');
            setMood('😊');
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
    };

    const handleFormat = (e, command, value = null) => {
        e.preventDefault(); // crucial to stop focus from jumping out of the editor
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

    const handleClear = () => {
        setContent('');
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
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`;
    };

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Entry</h2>
                        <div className="flex items-center gap-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Mood</p>
                            <div className="flex gap-2">
                                {moods.map(m => (
                                    <button 
                                        key={m}
                                        onClick={() => setMood(m)}
                                        className={`text-xl hover:scale-110 transition-transform ${mood === m ? 'scale-125 grayscale-0 ring-2 ring-primary/20 rounded-full p-0.5' : 'grayscale hover:grayscale-0'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col bg-slate-50 dark:bg-[#1f293a] transition-shadow shadow-sm focus-within:shadow-md focus-within:border-slate-300 dark:focus-within:border-slate-600">
                        {/* Prompt Banner inside input box */}
                        <div className="bg-primary/5 px-4 py-3 flex justify-between items-center group">
                            <p className="text-sm text-slate-700 dark:text-slate-300 italic font-medium">"{JOURNAL_PROMPTS[promptIndex]}"</p>
                            <button 
                                onClick={handleRefreshPrompt}
                                title="Refresh Prompt"
                                className="p-1 rounded-full text-primary opacity-50 hover:opacity-100 hover:bg-primary/10 transition-all ml-4 flex-shrink-0"
                            >
                                <span className="material-symbols-outlined text-md">refresh</span>
                            </button>
                        </div>

                        {/* Text Editor Canvas */}
                        <div 
                            ref={textareaRef}
                            className="w-full bg-white dark:bg-[#192233] border-none focus:ring-0 px-4 py-5 min-h-[220px] text-slate-700 dark:text-slate-300 outline-none font-medium leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 dark:empty:before:text-slate-600 cursor-text [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-1 [&_blockquote]:border-l-[3px] [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 [&_blockquote]:bg-primary/5 [&_blockquote]:py-1 [&_blockquote]:rounded-r-md [&_a]:text-primary [&_a]:underline [&_h1]:text-2xl [&_h1]:font-black [&_h1]:my-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2" 
                            data-placeholder="Start typing your thoughts..."
                            contentEditable="true"
                            suppressContentEditableWarning={true}
                            onInput={(e) => {
                                setContent(e.currentTarget.innerHTML);
                                checkFormatting();
                            }}
                            onKeyUp={checkFormatting}
                            onMouseUp={checkFormatting}
                        />

                        {/* Google Keep Style Bottom Toolbar */}
                        <div className="bg-white dark:bg-[#192233] p-1 px-3 border-t border-slate-100 dark:border-slate-800/50 flex items-start sm:items-center justify-between pb-2 relative">
                            {/* Formatting Row */}
                            <div className="flex flex-wrap gap-0.5 items-center pr-2">
                                {/* Font Size Selector */}
                                <div className="relative flex-shrink-0">
                                    <button 
                                        onMouseDown={(e) => { e.preventDefault(); setShowSizeMenu(!showSizeMenu); }} 
                                        title="Text Size" 
                                        type="button" 
                                        className="p-1 px-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">format_size</span>
                                        <span className="material-symbols-outlined text-[14px]">expand_more</span>
                                    </button>
                                    
                                    {showSizeMenu && (
                                        <div className="absolute bottom-full mb-1 left-0 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg shadow-xl p-1.5 z-50 flex flex-col min-w-[120px]">
                                            <button 
                                                onMouseDown={(e) => { handleFormat(e, 'fontSize', '2'); setShowSizeMenu(false); }} 
                                                className="px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded font-medium"
                                            >
                                                Small
                                            </button>
                                            <button 
                                                onMouseDown={(e) => { handleFormat(e, 'fontSize', '3'); setShowSizeMenu(false); }} 
                                                className="px-3 py-1.5 text-sm text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded font-medium"
                                            >
                                                Normal
                                            </button>
                                            <button 
                                                onMouseDown={(e) => { handleFormat(e, 'fontSize', '5'); setShowSizeMenu(false); }} 
                                                className="px-3 py-1.5 text-lg text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded font-medium"
                                            >
                                                Large
                                            </button>
                                            <button 
                                                onMouseDown={(e) => { handleFormat(e, 'fontSize', '6'); setShowSizeMenu(false); }} 
                                                className="px-3 py-1.5 text-xl font-bold text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded"
                                            >
                                                Huge
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="w-px bg-slate-200 dark:border-slate-700 mx-1 h-5 flex-shrink-0"></div>
                                <button onMouseDown={(e) => handleFormat(e, 'bold')} title="Bold (Ctrl+B)" type="button" className={getBtnClass('bold')}><span className="material-symbols-outlined text-[20px]">format_bold</span></button>
                                <button onMouseDown={(e) => handleFormat(e, 'italic')} title="Italic (Ctrl+I)" type="button" className={getBtnClass('italic')}><span className="material-symbols-outlined text-[20px]">format_italic</span></button>
                                <button onMouseDown={(e) => handleFormat(e, 'underline')} title="Underline (Ctrl+U)" type="button" className={getBtnClass('underline')}><span className="material-symbols-outlined text-[20px]">format_underlined</span></button>
                                <button onMouseDown={(e) => handleFormat(e, 'strikeThrough')} title="Strikethrough" type="button" className={getBtnClass('strikeThrough')}><span className="material-symbols-outlined text-[20px]">format_strikethrough</span></button>
                                <div className="w-px bg-slate-200 dark:border-slate-700 mx-1 h-5 flex-shrink-0"></div>
                                <button onMouseDown={(e) => handleFormat(e, 'insertUnorderedList')} title="Bullet List" type="button" className={getBtnClass('insertUnorderedList')}><span className="material-symbols-outlined text-[20px]">format_list_bulleted</span></button>
                                <button onMouseDown={(e) => handleFormat(e, 'checkbox')} title="Task List" type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 flex-shrink-0"><span className="material-symbols-outlined text-[20px]">check_box</span></button>
                                <div className="w-px bg-slate-200 dark:border-slate-700 mx-1 h-5 flex-shrink-0"></div>
                                <button onMouseDown={(e) => handleFormat(e, 'link')} title="Insert Link" type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 flex-shrink-0"><span className="material-symbols-outlined text-[20px]">link</span></button>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 flex-shrink-0">
                                <button 
                                    onClick={handleClear}
                                    className="px-4 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold uppercase tracking-widest transition-colors"
                                >
                                    Clear
                                </button>
                                <button 
                                    onClick={onSaveWrapper}
                                    disabled={loading || !content.trim()}
                                    className="px-5 py-1.5 rounded-lg bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-30 disabled:hidden"
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JournalEntry;
