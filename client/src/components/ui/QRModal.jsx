import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, X, Check, AlertCircle, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../services/api';

const ChippedBorder = ({ opacity = 0.8 }) => (
    <div 
      className="absolute inset-[-1px] rounded-sm pointer-events-none z-0"
      style={{
        border: '2px solid white',
        opacity,
        clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
      }}
    />
);

const QRModal = ({ isOpen, onClose, userId, initialMode = 'choice' }) => {
    const [mode, setMode] = useState(initialMode);
    const [scannedUser, setScannedUser] = useState(null);
    const [scanResult, setScanResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const scannerRef = useRef(null);
    const qrCanvasRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            stopScanner();
            setMode(initialMode);
            setScanResult(null);
            setScannedUser(null);
            setError(null);
        }
    }, [isOpen, initialMode]);

    const stopScanner = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
                setIsCameraActive(false);
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
        }
    };

    const startCamera = async () => {
        setError(null);
        try {
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;
            
            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    handleScannedId(decodedText);
                    stopScanner();
                },
                (errorMessage) => {}
            );
            setIsCameraActive(true);
        } catch (err) {
            console.error("Camera start failed", err);
            setError("CAMERA_PERMISSION_DENIED");
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError(null);
        const html5QrCode = new Html5Qrcode("reader");
        try {
            const decodedText = await html5QrCode.scanFile(file, true);
            handleScannedId(decodedText);
        } catch (err) {
            setError("NO_QR_CODE_FOUND");
        }
    };

    const handleScannedId = async (id) => {
        const isValidId = /^[0-9a-fA-F]{24}$/.test(id);
        if (!isValidId) { setError("INVALID_OPERATOR_ID"); setMode('choice'); return; }
        if (id === userId) { setError("CANNOT_SYNC_SELF"); setMode('choice'); return; }

        setIsSubmitting(true);
        try {
            const { data: userProfile } = await api.get(`/auth/user/${id}`);
            setScannedUser(userProfile);
            setMode('profile');
        } catch (err) {
            setError(err.response?.data?.message || "SYNC_FAILED");
            setMode('choice');
        } finally { setIsSubmitting(false); }
    };

    const handleConnect = async () => {
        if (!scannedUser) return;
        setIsSubmitting(true);
        try {
            await api.post(`/connection/request/${scannedUser._id}`);
            setScanResult('SUCCESS');
            setTimeout(() => { onClose(); setMode('choice'); setScanResult(null); setScannedUser(null); }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "SYNC_FAILED");
        } finally { setIsSubmitting(false); }
    };

    const handleSaveQR = () => {
        const canvas = qrCanvasRef.current;
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `produs_id_${userId.slice(-6).toUpperCase()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
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
                    className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-sm p-8 shadow-2xl overflow-hidden"
                >
                    <ChippedBorder opacity={0.2} />

                    <div className="relative z-10 flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">QR SYNC HUB</span>
                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">
                                    {mode === 'choice' ? 'MODE_SELECTION' : mode === 'display' ? 'MY_IDENTITY' : 'SCANNING_PROTOCOL'}
                                </span>
                            </div>
                            <button onClick={onClose} className="material-symbols-outlined text-white/20 hover:text-white transition-colors">close</button>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3"
                            >
                                <AlertCircle size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{error}</span>
                            </motion.div>
                        )}

                        {scanResult === 'SUCCESS' ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="size-20 bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                    <Check size={40} />
                                </div>
                                <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">REQUEST_SENT</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {mode === 'choice' && (
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={() => setMode('display')}
                                            className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-sm hover:bg-white/[0.05] hover:border-white/20 transition-all text-left group"
                                        >
                                            <div className="size-12 bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                                                <QrCode size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">DISPLAY MY QR</p>
                                                <p className="text-[8px] text-white/20 uppercase tracking-wider font-medium">SHOW CODE FOR SCANNING</p>
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => { setError(null); setMode('scan'); }}
                                            className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-sm hover:bg-white/[0.05] hover:border-white/20 transition-all text-left group"
                                        >
                                            <div className="size-12 bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                                                <Camera size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">SCAN QR CODE</p>
                                                <p className="text-[8px] text-white/20 uppercase tracking-wider font-medium">ACTIVATE CAMERA SENSOR</p>
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {mode === 'display' && (
                                    <div className="flex flex-col items-center gap-6 py-4">
                                        <div className="flex flex-col items-center gap-1 mb-2">
                                            <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">SYSTEM METADATA</span>
                                            <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">GLOBAL_UNIQUE_IDENTIFIER</span>
                                        </div>

                                        <div className="p-4 bg-white rounded-sm shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                                            <QRCodeCanvas 
                                                ref={qrCanvasRef}
                                                value={userId} 
                                                size={180}
                                                level={"H"}
                                                includeMargin={false}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-4 w-full">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">FULL ACCESS KEY</span>
                                                <p className="text-[9px] font-bold text-white uppercase tracking-[0.3em] font-mono break-all text-center max-w-[280px]">
                                                    {userId}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 pt-2">
                                                <button 
                                                    onClick={handleSaveQR}
                                                    className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
                                                >
                                                    <Download size={14} />
                                                    SAVE QR CODE
                                                </button>
                                                <button 
                                                    onClick={() => setMode('scan')}
                                                    className="w-full py-4 bg-white/[0.02] border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/[0.05] transition-all flex items-center justify-center gap-3"
                                                >
                                                    <Camera size={14} />
                                                    SCAN QR CODE
                                                </button>
                                            </div>
                                            <button onClick={() => setMode('choice')} className="text-[8px] font-black text-white/20 hover:text-white uppercase tracking-widest text-center mt-2">EXIT_TO_SELECTOR</button>
                                        </div>
                                    </div>
                                )}

                                {mode === 'scan' && (
                                    <div className="flex flex-col gap-6">
                                        <div className="w-full aspect-square bg-black border border-white/10 relative overflow-hidden flex items-center justify-center">
                                            <div id="reader" className="w-full h-full"></div>
                                            {!isCameraActive && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4 z-20">
                                                    <Camera size={32} className="text-white/10" />
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">SENSOR_OFFLINE</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 pointer-events-none z-10">
                                                <div className="absolute top-4 left-4 size-8 border-t border-l border-white/20" />
                                                <div className="absolute top-4 right-4 size-8 border-t border-r border-white/20" />
                                                <div className="absolute bottom-4 left-4 size-8 border-b border-l border-white/20" />
                                                <div className="absolute bottom-4 right-4 size-8 border-b border-r border-white/20" />
                                                {isCameraActive && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scan-line" />}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            {!isCameraActive ? (
                                                <button 
                                                    onClick={startCamera}
                                                    className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
                                                >
                                                    <Camera size={14} />
                                                    ACTIVATE CAMERA
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={stopScanner}
                                                    className="w-full py-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black text-[10px] uppercase tracking-[0.4em] hover:bg-rose-500/20 transition-all flex items-center justify-center gap-3"
                                                >
                                                    <X size={14} />
                                                    TERMINATE_SENSOR
                                                </button>
                                            )}
                                            
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                                            
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full py-4 bg-white/[0.02] border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/[0.05] transition-all flex items-center justify-center gap-3"
                                            >
                                                <Download size={14} className="rotate-180" />
                                                SCAN_IMAGE_FILE
                                            </button>
                                            <button onClick={() => setMode('choice')} className="text-[8px] font-black text-white/20 hover:text-white uppercase tracking-widest text-center mt-2">BACK_TO_SELECTOR</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="pt-6 border-t border-white/5 flex items-center justify-between opacity-40">
                            <div className="flex items-center gap-2">
                                <div className={`size-1.5 rounded-full ${isSubmitting ? 'bg-white animate-pulse' : 'bg-white/20'}`} />
                                <span className="text-[7px] font-black text-white uppercase tracking-[0.2em]">
                                    {isSubmitting ? 'SYNC_ACTIVE' : 'IDLE_MODE'}
                                </span>
                            </div>
                            <span className="text-[7px] font-mono text-white uppercase">S_REF: {userId?.slice(-6).toUpperCase()}</span>
                        </div>
                    </div>

                    <div className="absolute bottom-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                        <span className="material-symbols-outlined text-8xl">qr_code_2</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default QRModal;
