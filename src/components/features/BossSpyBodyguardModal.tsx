import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, ShieldAlert, ShieldCheck, Siren, Lock, Unlock, 
  Volume2, AlertTriangle, Clock, X, Smartphone, Eye, Bell
} from 'lucide-react';

interface SecurityIncident {
  id: string;
  timeString: string;
  triggerType: string;
  details: string;
}

interface BossSpyBodyguardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLizaAlertDialogue?: (dialogue: string) => void;
  playClickSound?: () => void;
}

export const BossSpyBodyguardModal: React.FC<BossSpyBodyguardModalProps> = ({
  isOpen,
  onClose,
  onLizaAlertDialogue,
  playClickSound
}) => {
  const [securityState, setSecurityState] = useState<'DISARMED' | 'ARMING' | 'ARMED' | 'TRIGGERED'>('DISARMED');
  const [countdown, setCountdown] = useState(5);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([
    {
      id: 'inc-1',
      timeString: 'Yesterday 11:45 PM',
      triggerType: 'Device Motion Sensor',
      details: 'Unauthorized phone lift detected while Boss was away. Siren triggered.'
    }
  ]);
  const [motionSensitivity, setMotionSensitivity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  const sirenIntervalRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Siren Audio Synthesizer
  const playSirenLoop = () => {
    stopSiren();
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
      const ctx = audioCtxRef.current;

      const triggerWail = () => {
        if (!ctx || ctx.state === 'closed') return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        // Alternating police siren frequency: 650Hz to 1100Hz
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.linearRampToValueAtTime(1100, now + 0.45);
        osc.frequency.linearRampToValueAtTime(650, now + 0.9);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
        gain.gain.setValueAtTime(0.2, now + 0.85);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.92);
      };

      triggerWail();
      sirenIntervalRef.current = setInterval(triggerWail, 950);
    } catch (e) {}
  };

  const stopSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  // Device Motion Sensor detection
  useEffect(() => {
    if (securityState !== 'ARMED') return;

    let threshold = 15;
    if (motionSensitivity === 'LOW') threshold = 25;
    if (motionSensitivity === 'HIGH') threshold = 8;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const totalMovement = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs((acc.z || 9.8) - 9.8);
      if (totalMovement > threshold) {
        triggerAlarm('Device Motion (Phone Lifted)');
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [securityState, motionSensitivity]);

  // Arming Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (securityState === 'ARMING') {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setSecurityState('ARMED');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [securityState]);

  useEffect(() => {
    return () => {
      stopSiren();
    };
  }, []);

  if (!isOpen) return null;

  const triggerAlarm = (triggerReason: string) => {
    setSecurityState('TRIGGERED');
    playSirenLoop();

    const newInc: SecurityIncident = {
      id: 'inc-' + Date.now(),
      timeString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      triggerType: triggerReason,
      details: 'Intruder touched/moved the device. Liza bodyguard alarm activated!'
    };
    setIncidents(prev => [newInc, ...prev.slice(0, 9)]);

    if (onLizaAlertDialogue) {
      onLizaAlertDialogue('🚨 ALERT! INTRUDER DETECTED! DO NOT TOUCH MY BOSS\'S PHONE! STEP AWAY IMMEDIATELY! 🚨');
    }
  };

  const handleArmSecurity = () => {
    playClickSound?.();
    setSecurityState('ARMING');
  };

  const handleDisarm = () => {
    playClickSound?.();
    stopSiren();
    setSecurityState('DISARMED');
  };

  return (
    <div 
      id="boss-spy-bodyguard-modal"
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-lg animate-fade-in font-sans"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border text-white overflow-hidden relative transition-all duration-500 ${
          securityState === 'TRIGGERED'
            ? 'bg-gradient-to-b from-rose-950 via-black to-black border-rose-500 shadow-[0_0_80px_rgba(244,63,94,0.6)]'
            : securityState === 'ARMED'
            ? 'bg-gradient-to-b from-emerald-950/60 via-[#0a120e] to-black border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.3)]'
            : 'bg-gradient-to-b from-[#180a29] via-[#0b0514] to-black border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.25)]'
        }`}
      >
        {/* Police Strobe Overlay when Triggered */}
        {securityState === 'TRIGGERED' && (
          <motion.div
            className="absolute inset-0 bg-rose-600/30 pointer-events-none z-20"
            animate={{ opacity: [0.1, 0.7, 0.1] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between relative z-30 bg-black/40">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl p-[1px] flex items-center justify-center shadow-lg ${
              securityState === 'TRIGGERED' 
                ? 'bg-rose-500 text-rose-100 animate-bounce' 
                : securityState === 'ARMED'
                ? 'bg-emerald-500 text-black'
                : 'bg-gradient-to-tr from-purple-500 to-indigo-500 text-purple-200'
            }`}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Boss Spy / Bodyguard Anti-Theft Alarm 🕶️🚨
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono-spec border ${
                  securityState === 'TRIGGERED'
                    ? 'bg-rose-500 text-black border-rose-300 animate-pulse'
                    : securityState === 'ARMED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                }`}>
                  {securityState}
                </span>
              </div>
              <p className="text-xs text-white/50">
                Device Motion Tripwire, Police Siren & Liza Angry Defense Voice
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound?.();
              handleDisarm();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 relative z-30 custom-scrollbar">
          
          {/* Main Status Center */}
          <div className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden ${
            securityState === 'TRIGGERED'
              ? 'bg-rose-950/80 border-rose-500/80 text-rose-100'
              : securityState === 'ARMED'
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-100'
              : 'bg-black/40 border-white/10 text-white'
          }`}>
            {/* Status Icon */}
            <div className="relative">
              {securityState === 'TRIGGERED' ? (
                <div className="w-24 h-24 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 animate-pulse shadow-[0_0_40px_rgba(244,63,94,0.6)]">
                  <Siren size={48} className="animate-bounce" />
                </div>
              ) : securityState === 'ARMED' ? (
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  <ShieldCheck size={48} />
                </div>
              ) : securityState === 'ARMING' ? (
                <div className="w-24 h-24 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-300 text-3xl font-black font-mono-spec animate-pulse">
                  {countdown}s
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Lock size={44} />
                </div>
              )}
            </div>

            {/* Status Headline */}
            <div>
              <h2 className="text-xl font-black tracking-wide">
                {securityState === 'TRIGGERED' && '🚨 INTRUDER ALERT! SIREN ACTIVE!'}
                {securityState === 'ARMED' && '🛡️ SPY GUARD ARMED & ACTIVE'}
                {securityState === 'ARMING' && `⏳ ARMING IN ${countdown} SECONDS...`}
                {securityState === 'DISARMED' && '🔒 Security System Disarmed'}
              </h2>
              <p className="text-xs text-white/70 mt-1 max-w-md mx-auto">
                {securityState === 'TRIGGERED' && 'Someone moved or picked up your device! Liza is shouting at the intruder.'}
                {securityState === 'ARMED' && 'Place your phone flat on the table. Any movement or screen touch will trip the alarm!'}
                {securityState === 'ARMING' && 'Place phone down flat on a desk or bed now.'}
                {securityState === 'DISARMED' && 'Activate Boss Spy Guard whenever leaving your phone unattended.'}
              </p>
            </div>

            {/* Arm / Disarm Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              {securityState === 'DISARMED' && (
                <button
                  onClick={handleArmSecurity}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs font-mono-spec flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  <Shield size={16} />
                  <span>ARM SPY GUARD NOW 🛡️</span>
                </button>
              )}

              {(securityState === 'ARMED' || securityState === 'TRIGGERED' || securityState === 'ARMING') && (
                <button
                  onClick={handleDisarm}
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono-spec flex items-center gap-2 shadow-lg shadow-rose-900/50 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  <Unlock size={16} />
                  <span>DISARM / STOP SIREN (BOSS AUTH)</span>
                </button>
              )}

              {securityState === 'ARMED' && (
                <button
                  onClick={() => triggerAlarm('Manual Test Tripwire')}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono-spec font-bold transition-all cursor-pointer"
                >
                  Test Tripwire ⚡
                </button>
              )}
            </div>
          </div>

          {/* Sensitivity Settings */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between flex-wrap gap-3 font-mono-spec text-xs">
            <span className="text-white/70 font-bold flex items-center gap-1.5">
              <Smartphone size={14} className="text-amber-400" />
              Motion Sensitivity:
            </span>
            <div className="flex items-center gap-1.5">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => {
                    playClickSound?.();
                    setMotionSensitivity(lvl);
                  }}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer text-[11px] ${
                    motionSensitivity === lvl 
                      ? 'bg-amber-400 text-black shadow' 
                      : 'bg-white/5 hover:bg-white/10 text-white/60'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Security Incident Logs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono-spec text-xs">
              <span className="text-white/70 font-bold flex items-center gap-1.5">
                <Clock size={14} className="text-pink-400" />
                Security Incident Logs:
              </span>
              <span className="text-[10px] text-white/40">{incidents.length} Events</span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar font-sans text-xs">
              {incidents.map(inc => (
                <div key={inc.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between font-mono-spec text-[10px]">
                    <span className="text-rose-400 font-bold uppercase">{inc.triggerType}</span>
                    <span className="text-white/40">{inc.timeString}</span>
                  </div>
                  <p className="text-white/80">{inc.details}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs font-mono-spec">
          <div className="flex items-center gap-2 text-white/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Anti-Theft DeviceMotion Sensor Connected</span>
          </div>

          <button
            onClick={() => {
              playClickSound?.();
              handleDisarm();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
