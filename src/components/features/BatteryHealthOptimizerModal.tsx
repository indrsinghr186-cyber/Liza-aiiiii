import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Battery, BatteryCharging, Zap, ShieldCheck, Cpu, HardDrive, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

interface BatteryHealthOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

export const BatteryHealthOptimizerModal: React.FC<BatteryHealthOptimizerModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [cleanedRamMb, setCleanedRamMb] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(88);

  const handleOptimize = () => {
    setIsOptimizing(true);
    if (playClickSound) playClickSound();
    setTimeout(() => {
      setIsOptimizing(false);
      setCleanedRamMb(640);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-green-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-green-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA System & Battery Optimizer</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-300">
          {/* Main Status HUD */}
          <div className="p-6 rounded-2xl bg-neutral-950/80 border border-green-500/20 text-center space-y-4">
            <div className="flex justify-center items-center gap-3">
              <BatteryCharging className="text-green-400" size={36} />
              <div className="text-4xl font-black font-mono-spec text-white">
                {batteryLevel}%
              </div>
            </div>
            <div className="text-xs text-green-300 font-mono-spec">
              Status: Excellent Condition • ~18 Hours Estimated Runtime
            </div>

            <button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-green-600/30 flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} className={isOptimizing ? 'animate-spin' : ''} />
              <span>{isOptimizing ? 'Flushing Memory & Optimizing...' : 'Run 1-Tap RAM & Cache Clean'}</span>
            </button>

            {cleanedRamMb > 0 && (
              <div className="p-2.5 bg-green-950/40 rounded-xl border border-green-500/30 text-xs text-green-300 flex items-center justify-center gap-2">
                <CheckCircle2 size={16} />
                <span>Freed {cleanedRamMb}MB Background Cache! Performance Boosted.</span>
              </div>
            )}
          </div>

          {/* Metric Breakdown Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Cpu size={15} className="text-blue-400" />
                <span>CPU Frequency</span>
              </div>
              <div className="text-[11px] text-neutral-400 font-mono-spec">Dynamic Turbo Scaling (Active)</div>
            </div>

            <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <ShieldCheck size={15} className="text-emerald-400" />
                <span>Thermal Guard</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-mono-spec">Cool & Optimal (32°C)</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
