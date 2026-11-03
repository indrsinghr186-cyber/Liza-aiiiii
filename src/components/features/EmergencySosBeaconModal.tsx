import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ShieldAlert, PhoneCall, AlertTriangle, Volume2, Flashlight, Send, MapPin, Check } from 'lucide-react';

interface EmergencySosBeaconModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

export const EmergencySosBeaconModal: React.FC<EmergencySosBeaconModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [isSirenActive, setIsSirenActive] = useState(false);
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [callTimer, setCallTimer] = useState(0);

  const triggerFakeCall = () => {
    setFakeCallActive(true);
    if (playClickSound) playClickSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-red-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA Emergency SOS & Safety Beacon</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-300">
          {fakeCallActive ? (
            /* Simulated Incoming Fake Call Screen to escape awkward situations */
            <div className="p-6 rounded-2xl bg-neutral-950 text-center space-y-6 animate-pulse border-2 border-emerald-500/40">
              <div className="w-20 h-20 mx-auto rounded-full bg-pink-500/20 border-2 border-pink-400 flex items-center justify-center text-3xl">
                🌸
              </div>
              <div>
                <div className="text-xs text-emerald-400 font-mono-spec">INCOMING URGENT CALL...</div>
                <div className="text-2xl font-bold text-white mt-1">LIZA (Guardian AI)</div>
                <div className="text-xs text-neutral-400">+91 (LIZA-URGENT-HOTLINE)</div>
              </div>

              <div className="flex justify-center gap-8 pt-4">
                <button
                  onClick={() => {
                    setFakeCallActive(false);
                    alert('Fake Call dismissed. You can now return safely!');
                  }}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                >
                  <X size={28} />
                </button>
                <button
                  onClick={() => {
                    alert('Connected: Liza speaking: "Paramveer, an urgent priority task needs your attention right away. Please excuse yourself immediately!"');
                    setFakeCallActive(false);
                  }}
                  className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                >
                  <PhoneCall size={28} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Emergency SOS Alarm */}
              <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/30 text-center space-y-3">
                <div className="text-xs font-bold text-red-300 uppercase font-mono-spec">High-Decibel Siren Alert</div>
                <button
                  onClick={() => {
                    setIsSirenActive(!isSirenActive);
                    if (playClickSound) playClickSound();
                  }}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isSirenActive ? 'bg-amber-600 text-white animate-pulse' : 'bg-red-600 hover:bg-red-500 text-white'
                  }`}
                >
                  <AlertTriangle size={18} />
                  <span>{isSirenActive ? 'STOP SOS SIREN' : 'TRIGGER SOS SAFETY SIREN & STROBE'}</span>
                </button>
              </div>

              {/* Escape Fake Call Generator */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-white flex items-center gap-1.5">
                    <PhoneCall size={16} className="text-emerald-400" />
                    Fake Escape Call Generator
                  </span>
                  <button
                    onClick={triggerFakeCall}
                    className="px-3 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-lg transition-colors"
                  >
                    Ring Phone Now 📞
                  </button>
                </div>
                <p className="text-xs text-neutral-400">
                  Instantly triggers a realistic incoming phone call from Liza so you can politely exit any uncomfortable social situation or meeting.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
