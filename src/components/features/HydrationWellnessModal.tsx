import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Droplets, Plus, RotateCcw, Sparkles, HeartPulse, Check, Bell } from 'lucide-react';
import { megaFeaturesService } from '../../services/megaFeaturesService';

interface HydrationWellnessModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

export const HydrationWellnessModal: React.FC<HydrationWellnessModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [intake, setIntake] = useState(megaFeaturesService.getWaterIntake());
  const [postureAlert, setPostureAlert] = useState(true);

  const percentage = Math.min(100, Math.round((intake.current / intake.goal) * 100));

  const handleAdd = (amount: number) => {
    megaFeaturesService.addWater(amount);
    setIntake(megaFeaturesService.getWaterIntake());
    if (playClickSound) playClickSound();
  };

  const handleReset = () => {
    megaFeaturesService.resetWater();
    setIntake(megaFeaturesService.getWaterIntake());
    if (playClickSound) playClickSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="text-cyan-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA Hydration & Health Coach</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-300">
          {/* Circular / Glass Water Tank Display */}
          <div className="p-6 rounded-2xl bg-neutral-950/80 border border-cyan-500/20 text-center space-y-4">
            <div className="relative w-36 h-36 mx-auto rounded-full border-4 border-cyan-500/30 overflow-hidden flex items-center justify-center bg-black/50 shadow-inner">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600 to-blue-500 transition-all duration-700 opacity-75"
                style={{ height: `${percentage}%` }}
              />
              <div className="relative z-10 text-center">
                <span className="text-2xl font-black text-white font-mono-spec drop-shadow-md">{intake.current}</span>
                <span className="text-[10px] text-cyan-200 block font-mono-spec">/ {intake.goal} ml</span>
                <span className="text-xs font-bold text-cyan-300 font-mono-spec">{percentage}%</span>
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => handleAdd(250)}
                className="px-3.5 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 font-bold text-xs rounded-xl transition-all shadow-md"
              >
                +250ml Glass
              </button>
              <button
                onClick={() => handleAdd(500)}
                className="px-3.5 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 font-bold text-xs rounded-xl transition-all shadow-md"
              >
                +500ml Bottle
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white"
                title="Reset Daily Log"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          {/* Posture & Wellness Check */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                <HeartPulse size={16} className="text-rose-400" />
                Hourly Posture & Eye Rest Alert
              </span>
              <button
                onClick={() => setPostureAlert(!postureAlert)}
                className={`px-2 py-0.5 text-[10px] rounded-full font-mono-spec font-bold border transition-colors ${
                  postureAlert ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-neutral-800 text-neutral-400 border-white/10'
                }`}
              >
                {postureAlert ? 'ON' : 'OFF'}
              </button>
            </div>
            <p className="text-xs text-neutral-400">
              Straighten your back, relax shoulders, and blink your eyes. Liza wants you to stay healthy and energetic!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
