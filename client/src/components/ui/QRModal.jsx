import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, X, Check, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../services/api';
import DashboardModal from './DashboardModal';

const QRModal = ({ isOpen, onClose, userId }) => {
    const [mode, setMode] = useState('choice'); // 'choice' | 'display' | 'scan'
    const [scanResult, setScanResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);
    const qrCanvasRef = useRef(null);

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

    const handleSaveQR = () => {
        const canvas = qrCanvasRef.current;
        if (!canvas) return;
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `produs_id_${userId.slice(-6).toUpperCase()}.png`;
        link.href = url;
        link.click();
    };

    if (!isOpen) return null;

    return (
        <DashboardModal
            isOpen={isOpen}
            onClose={onClose}
            onBack={mode !== 'choice' ? () => setMode('choice') : null}
            title="QR SYNC"
            subtitle={
                mode === 'choice' ? 'Select Mode' :
                mode === 'display' ? 'My Identity' :
                'Scanning...'
            }
            maxWidth="max-w-md"
        >
            <div className="space-y-6">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500"
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
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">REQUEST SENT</p>
                    </div>
                ) : (
                    <>
                        {mode === 'choice' && (
                            <div className="grid grid-cols-1 gap-4">
                                <button 
                                    onClick={() => setMode('display')}
                                    className="flex items-center gap-6 p-6 bg-white dark:bg-zinc-900/40 border border-black/5 dark:border-white/5 rounded-3xl hover:bg-black/10 dark:hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all text-left group shadow-sm"
                                >
                                    <div className="size-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                                        <QrCode size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">DISPLAY MY QR</p>
                                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">Show your code to be scanned</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => {
                                        setError(null);
                                        setMode('scan');
                                    }}
                                    className="flex items-center gap-6 p-6 bg-white dark:bg-zinc-900/40 border border-black/5 dark:border-white/5 rounded-3xl hover:bg-black/10 dark:hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all text-left group shadow-sm"
                                >
                                    <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                        <Camera size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">SCAN QR CODE</p>
                                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">Use camera to link profile</p>
                                    </div>
                                </button>
                            </div>
                        )}

                        {mode === 'display' && (
                            <div className="flex flex-col items-center space-y-8 py-4">
                                <div className="p-6 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.05)] transition-transform duration-500">
                                    <QRCodeCanvas 
                                        ref={qrCanvasRef}
                                        value={userId} 
                                        size={200}
                                        level={"H"}
                                        includeMargin={false}
                                        style={{ borderRadius: '1.2rem' }}
                                    />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] font-mono">IDENT_TOKEN: {userId.slice(-8).toUpperCase()}</p>
                                </div>
                                
                                <div className="flex flex-col gap-3 w-full">
                                    <button 
                                        onClick={handleSaveQR}
                                        className="w-full py-5 rounded-3xl bg-cyan-500 text-white font-black text-[11px] uppercase tracking-[0.3em] hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                                    >
                                        <Download size={16} />
                                        SAVE QR CODE
                                    </button>
                                </div>
                            </div>
                        )}

                        {mode === 'scan' && (
                            <div className="flex flex-col items-center space-y-6">
                                <div className="w-full aspect-square rounded-[2.5rem] overflow-hidden border-2 border-black/5 dark:border-white/5 bg-slate-100 dark:bg-black relative shadow-inner">
                                    <div id="reader" className="w-full h-full"></div>
                                    {/* Tactical Overlays */}
                                    <div className="absolute inset-0 pointer-events-none z-10">
                                        <div className="absolute top-6 left-6 size-12 border-t-2 border-l-2 border-emerald-500/40" />
                                        <div className="absolute top-6 right-6 size-12 border-t-2 border-r-2 border-emerald-500/40" />
                                        <div className="absolute bottom-6 left-6 size-12 border-b-2 border-l-2 border-emerald-500/40" />
                                        <div className="absolute bottom-6 right-6 size-12 border-b-2 border-r-2 border-emerald-500/40" />
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent animate-scan-line" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Footer Status */}
                <div className="px-2 pt-4 flex items-center justify-between border-t border-black/5 dark:border-white/5 opacity-60">
                    <div className="flex items-center gap-2">
                        <div className={`size-1.5 rounded-full ${isSubmitting ? 'bg-cyan-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
                        <span className="text-[8px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest">
                            {isSubmitting ? 'SYNCING DATA...' : 'READY'}
                        </span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 dark:text-slate-700 uppercase">SYS_REF: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                </div>
            </div>
        </DashboardModal>
    );
};

export default QRModal;
