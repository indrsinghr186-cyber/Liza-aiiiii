import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, ShieldCheck, Lock, Unlock, Crown, KeyRound, 
  X, Check, AlertCircle, Sparkles, Mic, Volume2, Eye, EyeOff, RefreshCw, Smartphone
} from 'lucide-react';

interface BossSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPin: string;
  secretPassphrase?: string;
  playClickSound?: () => void;
}

export const BossSecurityModal: React.FC<BossSecurityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPin = '007',
  secretPassphrase = 'code 007',
  playClickSound,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceHeardText, setVoiceHeardText] = useState('');
  const [shake, setShake] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  };

  const playBeep = (freq: number, type: OscillatorType = 'sine', duration: number = 0.08) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const playDeniedBuzzer = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [180, 140].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.18, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.15);
      });
    } catch (e) {}
  };

  const playSuccessChime = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0.2, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.35);
      });
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setStatus('idle');
      setErrorMessage('');
      setVoiceHeardText('');
      setIsVoiceListening(false);
    }
  }, [isOpen]);

  const handleKeyPress = (num: string) => {
    if (status === 'success') return;
    playClickSound?.() || playBeep(580, 'sine', 0.06);
    if (pinInput.length < 8) {
      const next = pinInput + num;
      setPinInput(next);
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handleDelete = () => {
    playClickSound?.() || playBeep(420, 'sine', 0.06);
    setPinInput(prev => prev.slice(0, -1));
    setStatus('idle');
    setErrorMessage('');
  };

  const handleClear = () => {
    playClickSound?.() || playBeep(350, 'sine', 0.06);
    setPinInput('');
    setStatus('idle');
    setErrorMessage('');
  };

  const handleVerifyPin = () => {
    const cleanInput = pinInput.trim();
    const cleanTarget = (currentPin || '007').trim();

    if (cleanInput === cleanTarget) {
      setStatus('success');
      playSuccessChime();
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } else {
      setStatus('error');
      setShake(true);
      playDeniedBuzzer();
      setErrorMessage('Access Denied! Galat Passcode. Boss Mode sirf Paramveer Rawat ke liye hai! 😤');
      setTimeout(() => setShake(false), 600);
    }
  };

  // Voice Verification Web Speech recognition
  const handleStartVoiceVerification = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Speech Recognition is not supported on this browser. Please use the PIN keypad.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN, en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsVoiceListening(true);
      setErrorMessage('');
      setVoiceHeardText('Listening for secret phrase...');

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.toLowerCase()?.trim() || '';
        setVoiceHeardText(`Heard: "${transcript}"`);
        setIsVoiceListening(false);

        const targetPhrase = (secretPassphrase || 'code 007').toLowerCase().trim();
        const pinCode = (currentPin || '007').toLowerCase().trim();

        const isMatch = transcript.includes(targetPhrase) || 
                        transcript.includes(pinCode) || 
                        transcript.includes('boss rawat') ||
                        transcript.includes('paramveer rawat') ||
                        transcript.includes('paramveer');

        if (isMatch) {
          setStatus('success');
          playSuccessChime();
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 800);
        } else {
          setStatus('error');
          playDeniedBuzzer();
          setShake(true);
          setErrorMessage(`Secret phrase mismatch! Voice not authorized for Boss Mode. 😤`);
          setTimeout(() => setShake(false), 600);
        }
      };

      recognition.onerror = (e: any) => {
        setIsVoiceListening(false);
        setVoiceHeardText('');
        setErrorMessage('Voice recognition failed or microphone denied. Try PIN keypad.');
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognition.start();
    } catch (e: any) {
      setIsVoiceListening(false);
      setErrorMessage('Could not activate voice recognition.');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="boss-security-modal"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          x: shake ? [-10, 10, -8, 8, -4, 4, 0] : 0 
        }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1a102f] via-[#0d0718] to-black border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-white p-5 sm:p-6 overflow-hidden relative"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-gradient-to-b from-amber-500/20 to-transparent blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Crown size={18} className="text-amber-400 fill-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wider text-amber-200 uppercase font-mono-spec">
                Boss Bio-Security Lock
              </h3>
              <p className="text-[10px] text-white/50 font-mono-spec">
                Paramveer Rawat Authentication
              </p>
            </div>
          </div>

          <button
            id="boss-security-close-btn"
            onClick={() => {
              playClickSound?.();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Subtitle Message */}
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3 mb-4 text-center">
          <p className="text-[11px] text-amber-100/90 leading-snug">
            Boss Mode activate karne ke liye apna <strong>Secret PIN Code</strong> ya <strong>Voice Passphrase</strong> verify karein.
          </p>
        </div>

        {/* PIN Input Display */}
        <div className="relative mb-4">
          <div className={`w-full py-3.5 px-4 rounded-2xl border bg-black/60 flex items-center justify-between font-mono-spec transition-all ${
            status === 'error' 
              ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
              : status === 'success'
              ? 'border-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.4)]'
              : 'border-amber-500/30 focus-within:border-amber-400'
          }`}>
            <div className="flex items-center gap-2 flex-1 overflow-x-auto">
              <KeyRound size={16} className={status === 'success' ? 'text-emerald-400' : 'text-amber-400'} />
              {pinInput.length === 0 ? (
                <span className="text-white/30 text-xs tracking-wider">Enter Boss PIN...</span>
              ) : (
                <span className="text-lg font-bold tracking-widest text-amber-300">
                  {showPin ? pinInput : '•'.repeat(pinInput.length)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                title={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              {pinInput.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[10px] uppercase font-bold text-white/50 hover:text-white px-1.5 py-0.5 rounded bg-white/5"
                >
                  CLR
                </button>
              )}
            </div>
          </div>

          {/* Error / Status Alert */}
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-[11px] text-red-300 font-medium flex items-center gap-1.5 bg-red-950/60 border border-red-500/40 p-2 rounded-xl"
            >
              <AlertCircle size={13} className="shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {voiceHeardText && !errorMessage && (
            <div className="mt-2 text-[11px] text-cyan-300 font-medium flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-500/40 p-2 rounded-xl">
              <Mic size={13} className="shrink-0 text-cyan-400 animate-pulse" />
              <span className="truncate">{voiceHeardText}</span>
            </div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 text-[11px] text-emerald-300 font-bold flex items-center justify-center gap-1.5 bg-emerald-950/60 border border-emerald-500/50 p-2 rounded-xl shadow-[0_0_12px_rgba(52,211,153,0.3)]"
            >
              <Check size={14} className="text-emerald-400" />
              <span>Boss Verified! Unlocking Liza Boss Mode... 👑</span>
            </motion.div>
          )}
        </div>

        {/* 3x4 Cyberpunk Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              id={`boss-keypad-${num}`}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 text-base font-bold font-mono-spec text-white transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
            >
              {num}
            </button>
          ))}

          {/* DEL Button */}
          <button
            id="boss-keypad-del"
            type="button"
            onClick={handleDelete}
            className="h-12 rounded-2xl bg-white/5 hover:bg-red-500/20 active:bg-red-500/30 border border-white/10 hover:border-red-500/40 text-xs font-bold font-mono-spec text-red-300 transition-all flex items-center justify-center cursor-pointer active:scale-95"
          >
            DEL
          </button>

          {/* 0 Button */}
          <button
            id="boss-keypad-0"
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 text-base font-bold font-mono-spec text-white transition-all flex items-center justify-center cursor-pointer active:scale-95"
          >
            0
          </button>

          {/* UNLOCK Submit Button */}
          <button
            id="boss-keypad-enter"
            type="button"
            onClick={handleVerifyPin}
            disabled={pinInput.length === 0 || status === 'success'}
            className="h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-[#d946ef] hover:from-amber-400 hover:to-pink-500 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border border-amber-300 text-black font-bold font-mono-spec transition-all flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer"
          >
            <Unlock size={14} />
            <span className="text-xs">OK</span>
          </button>
        </div>

        {/* Alternative Voice Passphrase Authentication Button */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            id="boss-voice-verify-btn"
            type="button"
            onClick={handleStartVoiceVerification}
            disabled={isVoiceListening || status === 'success'}
            className={`flex-1 py-2.5 px-3 rounded-2xl border text-xs font-bold font-mono-spec flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isVoiceListening
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
            }`}
          >
            <Mic size={14} className={isVoiceListening ? 'text-cyan-400 animate-bounce' : 'text-[#d946ef]'} />
            <span>{isVoiceListening ? 'Listening Secret Phrase...' : 'Voice Passphrase'}</span>
          </button>

          <div className="text-[10px] font-mono-spec text-white/40 text-right pr-1">
            <span>Default PIN: <strong className="text-amber-300 font-bold">{currentPin || '007'}</strong></span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
