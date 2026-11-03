import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, PhoneOff, PhoneCall, Mic, MicOff, Volume2, VolumeX, 
  Sparkles, Heart, Clock, X, MessageSquare, Zap, Play, Radio
} from 'lucide-react';
import { voiceCallService, CALL_SCENARIOS, CallScenario } from '../../services/voiceCallService';
import cozyTeaImg from '../../assets/images/liza_cozy_tea_1786751107238.jpg';

interface VoiceCallSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptVoiceCall?: (scenario: CallScenario) => void;
  playClickSound?: () => void;
  lizaAvatarUrl?: string;
  isBossMode?: boolean;
}

export const VoiceCallSimulatorModal: React.FC<VoiceCallSimulatorModalProps> = ({
  isOpen,
  onClose,
  onAcceptVoiceCall,
  playClickSound,
  lizaAvatarUrl,
  isBossMode = false,
}) => {
  const [callState, setCallState] = useState(() => voiceCallService.getCallState());
  const [callStatus, setCallStatus] = useState<'IDLE' | 'RINGING' | 'CONNECTED'>('IDLE');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<CallScenario>(CALL_SCENARIOS[0]);
  const [scheduledTimer, setScheduledTimer] = useState<number | null>(null);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    const unsub = voiceCallService.subscribe((isCalling, scenario) => {
      setCallState({ isIncomingCall: isCalling, currentScenario: scenario });
      if (isCalling) {
        setCallStatus('RINGING');
        if (scenario) setSelectedScenario(scenario);
      } else if (callStatus === 'RINGING') {
        setCallStatus('IDLE');
      }
    });
    return () => {
      unsub();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Handle Call Timer when connected
  useEffect(() => {
    if (callStatus === 'CONNECTED') {
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  if (!isOpen) return null;

  const avatar = lizaAvatarUrl || 'https://i.ibb.co/WWHh1m2V/hay.jpg';

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartSimulatedCall = (scenario: CallScenario) => {
    playClickSound?.();
    setSelectedScenario(scenario);
    voiceCallService.triggerIncomingCall(scenario);
  };

  const handleScheduleCall = (seconds: number) => {
    playClickSound?.();
    setScheduledTimer(seconds);
    setTimeout(() => {
      voiceCallService.triggerIncomingCall(selectedScenario);
      setScheduledTimer(null);
    }, seconds * 1000);
  };

  const handleAcceptCall = () => {
    playClickSound?.();
    voiceCallService.stopRingtone();
    setCallStatus('CONNECTED');
    if (onAcceptVoiceCall) {
      onAcceptVoiceCall(selectedScenario);
    }
  };

  const handleEndCall = () => {
    playClickSound?.();
    voiceCallService.dismissCall();
    setCallStatus('IDLE');
  };

  return (
    <div 
      id="voice-call-simulator-modal"
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-lg animate-fade-in font-sans"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        className="w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#180a29] via-[#0f061c] to-black border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.3)] text-white overflow-hidden flex flex-col relative"
      >
        {/* Header bar */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between relative z-10 bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <PhoneCall size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                Liza Direct Voice Call Simulator 📞
              </h3>
              <p className="text-[11px] text-white/50">Simulated AI Incoming & Connected Phone Call</p>
            </div>
          </div>

          <button
            id="close-voice-call-btn"
            onClick={() => {
              playClickSound?.();
              handleEndCall();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dynamic Display Area */}
        <div className="p-5 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Animated Background Atmosphere */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-600/15 via-purple-900/10 to-transparent pointer-events-none" />

          {/* 1. RINGING SCREEN */}
          {callStatus === 'RINGING' && (
            <div className="space-y-6 w-full max-w-sm py-4 relative z-10 animate-fade-in">
              <div className="relative inline-block mx-auto">
                <motion.div 
                  className="w-32 h-32 rounded-full border-2 border-pink-400/80 p-1 relative z-10 shadow-[0_0_30px_rgba(236,72,153,0.5)] overflow-hidden"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <img src={avatar} alt="Liza" className="w-full h-full object-cover rounded-full" />
                </motion.div>
                {/* Expanding pulsing rings */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-pink-500/40"
                  animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-purple-500/30"
                  animate={{ scale: [1, 2.1], opacity: [0.6, 0] }}
                  transition={{ duration: 1.8, delay: 0.4, repeat: Infinity, ease: 'easeOut' }}
                />
              </div>

              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-mono-spec font-bold text-pink-400 uppercase tracking-widest animate-pulse">
                  <Sparkles size={12} />
                  <span>Incoming Call...</span>
                </div>
                <h2 className="text-2xl font-black text-white mt-1">Liza 💖 (Soulmate AI)</h2>
                <p className="text-xs text-white/70 mt-1 max-w-xs mx-auto italic font-sans">
                  "{selectedScenario.voiceLine}"
                </p>
              </div>

              {/* Call Controls: Accept / Decline */}
              <div className="flex items-center justify-around pt-4 max-w-xs mx-auto">
                {/* Decline Button */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    id="decline-call-btn"
                    onClick={handleEndCall}
                    className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <PhoneOff size={26} />
                  </button>
                  <span className="text-[11px] font-bold text-white/60">Decline</span>
                </div>

                {/* Accept Button */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    id="accept-call-btn"
                    onClick={handleAcceptCall}
                    className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-900/50 transition-all hover:scale-110 active:scale-95 animate-bounce cursor-pointer"
                  >
                    <Phone size={26} />
                  </button>
                  <span className="text-[11px] font-bold text-emerald-400">Accept Call</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. CONNECTED CALL SCREEN */}
          {callStatus === 'CONNECTED' && (
            <div className="space-y-5 w-full max-w-sm py-2 relative z-10 animate-fade-in">
              <div className="w-24 h-24 rounded-full border-2 border-emerald-400/80 p-1 mx-auto relative shadow-[0_0_25px_rgba(52,211,153,0.4)] overflow-hidden">
                <img src={avatar} alt="Liza" className="w-full h-full object-cover rounded-full" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Liza 💖</h3>
                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-mono-spec font-bold mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Call Active • {formatDuration(callDuration)}</span>
                </div>
              </div>

              {/* Simulated Audio Waveform */}
              <div className="flex items-center justify-center gap-1 h-10 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                {[40, 75, 95, 60, 100, 80, 45, 90, 70, 85, 50, 65, 95, 75, 40].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-gradient-to-t from-pink-500 to-purple-400 rounded-full"
                    animate={{ height: [`${h * 0.2}%`, `${h * 0.9}%`, `${h * 0.3}%`] }}
                    transition={{
                      duration: 0.8 + (i % 3) * 0.2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                ))}
              </div>

              {/* Opener Dialogue Display */}
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-left text-xs text-purple-200 space-y-1">
                <div className="text-[10px] font-mono-spec font-bold text-pink-400 uppercase flex items-center gap-1">
                  <Radio size={12} className="text-pink-400 animate-pulse" />
                  <span>Live Voice Transcript</span>
                </div>
                <p className="font-sans leading-relaxed">"{selectedScenario.openerMessage}"</p>
              </div>

              {/* Controls bar: Mute, Speaker, End Call */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => {
                    playClickSound?.();
                    setIsMuted(!isMuted);
                  }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
                    isMuted ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-white/10 border-white/10 text-white'
                  }`}
                  title="Mute Mic"
                >
                  {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <button
                  onClick={() => {
                    playClickSound?.();
                    setIsSpeakerOn(!isSpeakerOn);
                  }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
                    !isSpeakerOn ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-white/10 border-white/10 text-white'
                  }`}
                  title="Speaker"
                >
                  {isSpeakerOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>

                <button
                  id="end-active-call-btn"
                  onClick={handleEndCall}
                  className="w-14 h-12 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer font-bold gap-1.5"
                >
                  <PhoneOff size={20} />
                </button>
              </div>
            </div>
          )}

          {/* 3. IDLE / SCENARIO SELECTOR */}
          {callStatus === 'IDLE' && (
            <div className="space-y-4 w-full text-left relative z-10">
              <div className="flex items-center justify-between font-mono-spec text-xs">
                <span className="text-white/70 font-bold flex items-center gap-1.5">
                  <Sparkles size={14} className="text-pink-400" />
                  Choose Call Scenario to Trigger:
                </span>
                <span className="text-[10px] text-pink-400">Instant AI Phone Ring</span>
              </div>

              {/* Scenario cards */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {CALL_SCENARIOS.map(scenario => {
                  const isSelected = selectedScenario.id === scenario.id;
                  return (
                    <div
                      key={scenario.id}
                      onClick={() => setSelectedScenario(scenario)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'bg-purple-950/60 border-purple-400 shadow-md' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{scenario.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            {scenario.title}
                          </div>
                          <div className="text-[10px] text-white/50">{scenario.subtitle}</div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartSimulatedCall(scenario);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
                      >
                        <Phone size={12} />
                        <span>Call</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Auto Schedule Buttons */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono-spec text-white/70">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-amber-400" />
                    Schedule Surprise Call:
                  </span>
                  {scheduledTimer && (
                    <span className="text-[10px] text-amber-300 animate-pulse">
                      Calling in {scheduledTimer}s...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono-spec">
                  {[
                    { label: 'In 5 Sec ⚡', sec: 5 },
                    { label: 'In 15 Sec ⏱️', sec: 15 },
                    { label: 'In 30 Sec 🔔', sec: 30 }
                  ].map(item => (
                    <button
                      key={item.sec}
                      disabled={scheduledTimer !== null}
                      onClick={() => handleScheduleCall(item.sec)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center font-bold text-[11px] disabled:opacity-40 transition-all cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs font-mono-spec">
          <span className="text-white/40 text-[10px]">Web Audio Synthesized Ringtone Engine</span>
          <button
            onClick={() => {
              playClickSound?.();
              handleEndCall();
              onClose();
            }}
            className="px-3.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
