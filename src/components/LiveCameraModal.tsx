import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, X, RotateCw, Eye, Sparkles, RefreshCw, 
  Volume2, ShieldCheck, Zap, Maximize2, AlertCircle
} from 'lucide-react';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeFrame?: (base64Image: string, promptText: string) => void;
  playClickSound?: () => void;
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onAnalyzeFrame,
  playClickSound
}) => {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<string>('Liza, dekho ye kya hai aur explain karo!');
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeSessionIdRef = useRef<number>(0);

  // Stop Camera Stream cleanly
  const stopCamera = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  // Start Camera Stream
  const startCamera = async (facing: 'user' | 'environment') => {
    const sessionId = ++activeSessionIdRef.current;
    setCameraError(null);

    // Stop prior stream before requesting new one
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      // If user closed modal or switched camera while waiting for getUserMedia
      if (sessionId !== activeSessionIdRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        } catch (playErr: any) {
          // Play interruption due to new load or DOM removal is benign
          if (
            playErr.name === 'AbortError' ||
            playErr.name === 'NotAllowedError' ||
            playErr.message?.includes('interrupted') ||
            playErr.message?.includes('removed from the document')
          ) {
            return;
          }
          throw playErr;
        }
      }

      if (sessionId === activeSessionIdRef.current) {
        setIsStreaming(true);
      }
    } catch (err: any) {
      // Gracefully ignore abort / interruption errors when unmounting or switching streams
      if (
        sessionId !== activeSessionIdRef.current ||
        err.name === 'AbortError' ||
        err.message?.includes('interrupted') ||
        err.message?.includes('removed from the document')
      ) {
        return;
      }

      console.error('Camera stream error:', err);
      setIsStreaming(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please grant camera permission in browser settings.');
      } else {
        setCameraError(`Failed to access camera (${err.message || 'Unknown device error'}).`);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
      setLastScanResult(null);
    }

    return () => {
      activeSessionIdRef.current++;
      stopCamera();
    };
  }, [isOpen, facingMode]);

  // Flip Front / Back Camera
  const toggleFacingMode = () => {
    playClickSound?.();
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Capture Single Frame as Base64 JPEG
  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // Trigger Visual Analysis
  const handleAnalyze = (customPrompt?: string) => {
    playClickSound?.();
    const promptToUse = customPrompt || activePrompt;
    const base64 = captureFrame();
    if (!base64) return;

    setIsAnalyzing(true);
    setLastScanResult('Analyzing frame with Liza Vision...');

    if (onAnalyzeFrame) {
      onAnalyzeFrame(base64, promptToUse);
    }

    setTimeout(() => {
      setIsAnalyzing(false);
      setLastScanResult(`Frame sent to Liza: "${promptToUse}"`);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5"
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 20 }}
        className="w-full max-w-2xl bg-[#09090d] border border-purple-500/40 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.3)] flex flex-col max-h-[92dvh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-black/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-[#d946ef] border border-purple-500/30">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="font-mono-spec font-bold text-sm sm:text-base text-white uppercase tracking-wider flex items-center gap-2">
                LIZA REAL-TIME VISION
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {facingMode === 'environment' ? 'BACK CAMERA' : 'FRONT / SELFIE'}
                </span>
              </h3>
              <p className="text-[11px] text-white/50 font-mono-spec">Instant Web Camera Vision (Zero-APK)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFacingMode}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer flex items-center gap-1 text-xs font-mono-spec"
              title="Switch Front/Back Camera"
            >
              <RotateCw size={15} />
              <span className="hidden xs:inline">Flip</span>
            </button>
            <button
              onClick={() => {
                playClickSound?.();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Viewfinder Container */}
        <div className="relative flex-1 bg-black min-h-[300px] sm:min-h-[380px] flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center max-w-md space-y-3">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto animate-bounce" />
              <h4 className="font-mono-spec font-bold text-rose-300 text-sm">Camera Permission Needed</h4>
              <p className="font-mono-spec text-xs text-white/60">{cameraError}</p>
              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono-spec text-xs font-bold uppercase transition-all shadow-lg cursor-pointer"
              >
                Retry Camera
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Cyber HUD Overlays */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                {/* Top HUD indicators */}
                <div className="flex justify-between items-center text-[10px] font-mono-spec text-[#d946ef] bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-purple-500/30">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE OPTICAL STREAM
                  </span>
                  <span>1080P • AI SCAN READY</span>
                </div>

                {/* Center Target Box */}
                <div className="self-center w-48 h-48 sm:w-64 sm:h-64 border-2 border-dashed border-[#d946ef]/60 rounded-3xl relative flex items-center justify-center">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-[#d946ef] absolute top-2 left-2" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-[#d946ef] absolute top-2 right-2" />
                  <div className="w-4 h-4 border-b-2 border-l-2 border-[#d946ef] absolute bottom-2 left-2" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-[#d946ef] absolute bottom-2 right-2" />
                  
                  {isAnalyzing && (
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#d946ef] to-transparent shadow-[0_0_15px_#d946ef] animate-pulse" />
                  )}
                </div>

                {/* Bottom HUD notification */}
                {lastScanResult && (
                  <div className="self-center bg-black/80 border border-purple-500/40 text-purple-200 px-3.5 py-1.5 rounded-xl text-xs font-mono-spec shadow-xl">
                    {lastScanResult}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action Controls & Presets */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/80 space-y-3">
          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-[11px] font-mono-spec">
            <button
              onClick={() => handleAnalyze('Liza, dekho ye kya hai aur explain karo!')}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 whitespace-nowrap cursor-pointer active:scale-95 transition-all"
            >
              🔍 Identify Object
            </button>
            <button
              onClick={() => handleAnalyze('Liza, screen ka code aur error check karke fix batao!')}
              className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/40 whitespace-nowrap cursor-pointer active:scale-95 transition-all"
            >
              💻 Code & Error Fix
            </button>
            <button
              onClick={() => handleAnalyze('Liza, mera outfit aur look kaisa lag raha hai?')}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 whitespace-nowrap cursor-pointer active:scale-95 transition-all"
            >
              👗 Outfit & Style
            </button>
            <button
              onClick={() => handleAnalyze('Liza, is medicine / document ko summarize karo')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 whitespace-nowrap cursor-pointer active:scale-95 transition-all"
            >
              💊 Medicine / Doc
            </button>
          </div>

          {/* Main Shutter & Voice Trigger Bar */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={activePrompt}
              onChange={(e) => setActivePrompt(e.target.value)}
              placeholder="Ask Liza about what she is seeing..."
              className="flex-1 bg-black/60 border border-white/15 focus:border-[#d946ef] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 font-mono-spec outline-none"
            />

            <button
              onClick={() => handleAnalyze()}
              disabled={!isStreaming || isAnalyzing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d946ef] to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-black font-bold font-mono-spec text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(217,70,239,0.4)] flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
            >
              {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              <span>Liza Dekho!</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
