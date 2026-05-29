import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Check, AlertCircle } from 'lucide-react';
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

const QRModal = ({ isOpen, onClose, userId }) => {
    const [mode, setMode] = useState('scan'); // 'scan' | 'profile'
    const [scannedUser, setScannedUser] = useState(null);
    const [scanResult, setScanResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [requestStatus, setRequestStatus] = useState('none');
    const scannerRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            stopScanner();
            setMode('scan');
            setScanResult(null);
            setScannedUser(null);
            setError(null);
            setRequestStatus('none');
        } else {
            // Auto start camera sensor scanning mode immediately
            const timer = setTimeout(() => {
                startCamera();
            }, 250);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

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
                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        const minDim = Math.min(viewfinderWidth, viewfinderHeight);
                        const size = Math.floor(minDim * 0.8);
                        return { width: size, height: size };
                    }
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
        if (!isValidId) { setError("INVALID_OPERATOR_ID"); setMode('scan'); return; }
        if (id === userId) { setError("CANNOT_SYNC_SELF"); setMode('scan'); return; }

        setIsSubmitting(true);
        try {
            const [{ data: userProfile }, { data: connectionsData }] = await Promise.all([
                api.get(`/auth/profile/${id}`),
                api.get('/auth/connections'),
            ]);
            setScannedUser(userProfile);

            const isConnected = connectionsData.connections?.some(c => c._id === id);
            const isPending  = connectionsData.outgoing?.some(c => c._id === id);
            setRequestStatus(isConnected ? 'connected' : isPending ? 'pending' : 'none');

            setMode('profile');
        } catch (err) {
            setError(err.response?.data?.message || "SYNC_FAILED");
            setMode('scan');
        } finally { setIsSubmitting(false); }
    };

    const handleConnect = async () => {
        if (!scannedUser) return;
        setIsSubmitting(true);
        try {
            await api.post(`/auth/connection/request/${scannedUser._id}`);
            setRequestStatus('pending');
            setScanResult('SUCCESS');
            setTimeout(() => { onClose(); setMode('scan'); setScanResult(null); setScannedUser(null); setRequestStatus('none'); }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "SYNC_FAILED");
        } finally { setIsSubmitting(false); }
    };

    const handleCancel = async () => {
        if (!scannedUser) return;
        setIsSubmitting(true);
        try {
            await api.post(`/auth/connection/cancel/${scannedUser._id}`);
            setRequestStatus('none');
        } catch (err) {
            setError(err.response?.data?.message || "CANCEL_FAILED");
        } finally { setIsSubmitting(false); }
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
                    className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-sm p-6 md:p-8 shadow-2xl overflow-hidden"
                >
                    <ChippedBorder opacity={0.2} />

                    <div className="relative z-10 flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">QR SCANNER</span>
                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">
                                    {mode === 'scan' ? 'SCANNING_PROTOCOL' : 'OPERATIVE_PROFILE'}
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
                                {mode === 'scan' && (
                                    <div className="flex flex-col gap-6">
                                        <div className="w-64 h-64 md:w-72 md:h-72 mx-auto bg-black border border-white/10 relative overflow-hidden flex items-center justify-center">
                                            <div 
                                                id="reader" 
                                                className="w-full h-full"
                                                style={{ 
                                                    position: 'relative',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            ></div>
                                            {!isCameraActive && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4 z-20">
                                                    <Camera size={32} className="text-white/10" />
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">INITIALIZING_CAMERA...</span>
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
                                            {!isCameraActive && (
                                                <button 
                                                    onClick={startCamera}
                                                    className="w-full py-3 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
                                                >
                                                    <Camera size={14} />
                                                    RETRY CAMERA INITIALIZATION
                                                </button>
                                            )}
                                            
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                                            
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full py-3 bg-white/[0.02] border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/[0.05] transition-all flex items-center justify-center gap-3"
                                            >
                                                <Camera size={14} className="rotate-180" />
                                                SCAN_IMAGE_FILE
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {mode === 'profile' && scannedUser && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center gap-5"
                                    >
                                        {/* ── Hanging ID Badge ── */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-0.5 h-5 bg-white/20" />
                                            <div className="size-4 rounded-full border-2 border-white/20 bg-[#0a0a0a] mb-0" />
                                            <div
                                                className="relative w-[220px] bg-[#111] border border-white/10 rounded-sm overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
                                                style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)' }}
                                            >
                                                {/* Card top bar */}
                                                <div className="h-7 bg-white flex items-center justify-between px-3">
                                                    <span className="text-[7px] font-black text-black uppercase tracking-[0.5em]">PRODUS</span>
                                                    <span className="text-[7px] font-black text-black/40 uppercase tracking-widest">OPERATOR</span>
                                                </div>

                                                {/* Card body */}
                                                <div className="p-4 flex flex-col items-center gap-3">
                                                    {/* Photo */}
                                                    <div className="size-20 bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                                                        {scannedUser.avatar ? (
                                                            <img src={scannedUser.avatar} alt={scannedUser.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-white/20 text-3xl font-black">
                                                                {scannedUser.name?.[0]?.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Name + role */}
                                                    <div className="text-center">
                                                        <p className="text-[13px] font-black text-white uppercase tracking-widest leading-none">{scannedUser.name}</p>
                                                        {scannedUser.username && (
                                                            <p className="text-[8px] font-mono text-white/30 tracking-widest mt-0.5">{scannedUser.username}</p>
                                                        )}
                                                        <div className="mt-2 inline-block px-2 py-0.5 border border-white/10 bg-white/5">
                                                            <span className="text-[7px] font-black text-white/50 uppercase tracking-[0.3em]">
                                                                {scannedUser.rpg?.archetype?.name || 'OPERATOR'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Divider */}
                                                    <div className="w-full h-px bg-white/5" />

                                                    {/* ID string */}
                                                    <div className="w-full flex flex-col gap-1">
                                                        <span className="text-[6px] font-black text-white/20 uppercase tracking-[0.4em]">OPERATOR ID</span>
                                                        <span className="text-[8px] font-mono text-white/50 tracking-widest break-all leading-relaxed">
                                                            {scannedUser._id}
                                                        </span>
                                                    </div>

                                                    {/* Bio */}
                                                    {scannedUser.bio && (
                                                        <p className="text-[8px] text-white/20 text-center leading-relaxed italic border-t border-white/5 pt-2 w-full">
                                                            "{scannedUser.bio}"
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Card bottom bar */}
                                                <div className="h-5 bg-white/[0.03] border-t border-white/5 flex items-center justify-center">
                                                    <div className="flex gap-1">
                                                        {Array.from({ length: 24 }).map((_, i) => (
                                                            <div key={i} className="w-0.5 h-2 bg-white/10" style={{ height: `${4 + (i % 3) * 3}px` }} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex flex-col gap-2 w-full">
                                            {requestStatus === 'connected' ? (
                                                <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                                                    <Check size={14} />
                                                    Already Connected
                                                </div>
                                            ) : requestStatus === 'pending' ? (
                                                <button
                                                    onClick={handleCancel}
                                                    disabled={isSubmitting}
                                                    className="w-full py-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-black text-[10px] uppercase tracking-[0.4em] hover:bg-rose-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                                >
                                                    <X size={14} />
                                                    {isSubmitting ? 'Cancelling...' : 'Cancel Request'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleConnect}
                                                    disabled={isSubmitting}
                                                    className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 disabled:opacity-50"
                                                >
                                                    <Check size={14} />
                                                    {isSubmitting ? 'Sending...' : 'Connect'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { setScannedUser(null); setMode('scan'); }}
                                                className="w-full py-3 bg-white/[0.02] border border-white/10 text-white/40 font-black text-[9px] uppercase tracking-[0.4em] hover:bg-white/[0.05] hover:text-white transition-all"
                                            >
                                                Scan Again
                                            </button>
                                        </div>
                                    </motion.div>
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
