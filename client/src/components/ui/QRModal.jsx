import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, X, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../services/api';

const QRModal = ({ isOpen, onClose, userId }) => {
    const [mode, setMode] = useState('choice'); // 'choice' | 'display' | 'scan'
    const [scanResult, setScanResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);

    useEffect(() => {
        if (mode === 'scan' && isOpen) {
            const scanner = new Html5QrcodeScanner("reader", { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            }, false);

            const onScanSuccess = async (decodedText) => {
                await scanner.clear();
                handleScannedId(decodedText);
            };

            const onScanFailure = (error) => {
                // Ignore failures to keep scanning
            };

            scanner.render(onScanSuccess, onScanFailure);
            scannerRef.current = scanner;

            return () => {
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
                }
            };
        }
    }, [mode, isOpen]);

    const handleScannedId = async (id) => {
        // Basic validation: user ID should be a 24-character hex string (standard MongoDB ID)
        const isValidId = /^[0-9a-fA-F]{24}$/.test(id);
        
        if (!isValidId) {
            setError("INVALID_OPERATOR_ID");
            setMode('choice');
            return;
        }

        if (id === userId) {
            setError("CANNOT_SYNC_SELF");
            setMode('choice');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post(`/connection/request/${id}`);
            setScanResult('SUCCESS');
            setTimeout(() => {
                onClose();
                // Reset state for next open
                setMode('choice');
                setScanResult(null);
            }, 2000);
        } catch (err) {
            console.error("Connection request failed", err);
            setError(err.response?.data?.message || "SYNC_FAILED");
            setMode('choice');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500 mb-1">
                                QR_PROTOCOL_v1.0
                            </h2>
                            <p className="text-xl font-black text-white italic uppercase font-exo tracking-tighter">
                                {mode === 'choice' && 'Select Mode'}
                                {mode === 'display' && 'My Identity'}
                                {mode === 'scan' && 'Scanning...'}
                            </p>
                        </div>
                        <button onClick={onClose} className="size-10 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500"
                            >
                                <AlertCircle size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                            </motion.div>
                        )}

                        {scanResult === 'SUCCESS' ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="size-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-500">
                                    <Check size={40} />
                                </div>
                                <p className="text-sm font-black text-white uppercase tracking-widest">REQUEST_SENT_</p>
                            </div>
                        ) : (
                            <>
                                {mode === 'choice' && (
                                    <div className="grid grid-cols-1 gap-4">
                                        <button 
                                            onClick={() => setMode('display')}
                                            className="flex items-center gap-6 p-6 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all text-left group"
                                        >
                                            <div className="size-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                                                <QrCode size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white uppercase tracking-widest mb-1">DISPLAY_MY_QR_</p>
                                                <p className="text-[9px] text-slate-500 uppercase tracking-wider">Show your code to be scanned</p>
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => {
                                                setError(null);
                                                setMode('scan');
                                            }}
                                            className="flex items-center gap-6 p-6 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all text-left group"
                                        >
                                            <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                                <Camera size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white uppercase tracking-widest mb-1">SCAN_OPERATOR_</p>
                                                <p className="text-[9px] text-slate-500 uppercase tracking-wider">Use camera to link profile</p>
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {mode === 'display' && (
                                    <div className="flex flex-col items-center space-y-8">
                                        <div className="p-6 bg-white rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-transform duration-500">
                                            <QRCodeCanvas 
                                                value={userId} 
                                                size={200}
                                                level={"H"}
                                                includeMargin={false}
                                                style={{ borderRadius: '1rem' }}
                                            />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">IDENT_TOKEN: {userId.slice(-8).toUpperCase()}</p>
                                        </div>
                                        <button 
                                            onClick={() => setMode('choice')}
                                            className="w-full py-4 rounded-2xl bg-white/5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                                        >
                                            BACK_TO_OPTIONS
                                        </button>
                                    </div>
                                )}

                                {mode === 'scan' && (
                                    <div className="flex flex-col items-center space-y-6">
                                        <div className="w-full aspect-square rounded-[2rem] overflow-hidden border-2 border-white/5 bg-black relative">
                                            <div id="reader" className="w-full h-full"></div>
                                            {/* Tactical Overlays */}
                                            <div className="absolute inset-0 pointer-events-none z-10">
                                                <div className="absolute top-4 left-4 size-8 border-t-2 border-l-2 border-emerald-500/50" />
                                                <div className="absolute top-4 right-4 size-8 border-t-2 border-r-2 border-emerald-500/50" />
                                                <div className="absolute bottom-4 left-4 size-8 border-b-2 border-l-2 border-emerald-500/50" />
                                                <div className="absolute bottom-4 right-4 size-8 border-b-2 border-r-2 border-emerald-500/50" />
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent animate-scan-line" />
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 w-full">
                                            <button 
                                                onClick={() => setMode('choice')}
                                                className="flex-1 py-4 rounded-2xl bg-white/5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                                            >
                                                CANCEL_SCAN_
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer Status */}
                    <div className="px-8 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`size-1.5 rounded-full ${isSubmitting ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`} />
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                                {isSubmitting ? 'SYNCING_DATA...' : 'LINK_STANDBY'}
                            </span>
                        </div>
                        <span className="text-[8px] font-mono text-slate-700 uppercase">SYS_REF: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default QRModal;
