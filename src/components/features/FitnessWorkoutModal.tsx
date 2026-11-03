import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Flame, Play, Pause, RotateCcw, Activity, Dumbbell, Sparkles, CheckCircle2 } from 'lucide-react';
import { megaFeaturesService } from '../../services/megaFeaturesService';

interface FitnessWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

const EXERCISES = [
  { id: 'pushups', name: 'Push-ups', target: '20 Reps', calories: 15, icon: '💪' },
  { id: 'squats', name: 'Bodyweight Squats', target: '30 Reps', calories: 20, icon: '🦵' },
  { id: 'plank', name: 'Core Plank Hold', target: '60 Seconds', calories: 12, icon: '⏱️' },
  { id: 'jumping_jacks', name: 'Jumping Jacks', target: '50 Reps', calories: 25, icon: '⚡' },
];

export const FitnessWorkoutModal: React.FC<FitnessWorkoutModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [selectedEx, setSelectedEx] = useState(EXERCISES[0]);
  const [repCount, setRepCount] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [totalBurnedCal, setTotalBurnedCal] = useState(65);

  const handleAddRep = () => {
    setRepCount(c => c + 1);
    setTotalBurnedCal(b => b + 1);
    megaFeaturesService.addXp(5);
    if (playClickSound) playClickSound();
  };

  const handleFinishSet = () => {
    megaFeaturesService.addXp(40);
    alert(`🔥 Awesome Set Paramveer! You burned ~${selectedEx.calories} kcal! Liza is cheering for you!`);
    setRepCount(0);
    setIsWorkoutActive(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="text-rose-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA Fitness & Workout Coach</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-300">
          {/* Exercise Selector */}
          <div className="grid grid-cols-2 gap-2">
            {EXERCISES.map(ex => (
              <div
                key={ex.id}
                onClick={() => {
                  setSelectedEx(ex);
                  setRepCount(0);
                  if (playClickSound) playClickSound();
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                  selectedEx.id === ex.id 
                    ? 'bg-rose-600/25 border-rose-400 text-white shadow-md' 
                    : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                <span className="text-xl">{ex.icon}</span>
                <div>
                  <div className="text-xs font-bold">{ex.name}</div>
                  <div className="text-[10px] text-neutral-400">{ex.target} • ~{ex.calories} kcal</div>
                </div>
              </div>
            ))}
          </div>

          {/* Big Rep Counter HUD */}
          <div className="p-6 rounded-2xl bg-neutral-950/80 border border-rose-500/20 text-center space-y-4">
            <div className="text-xs font-mono-spec text-rose-400 font-bold uppercase tracking-wider">
              {selectedEx.name} Repetition Counter
            </div>
            
            <div className="text-6xl font-black font-mono-spec text-white drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]">
              {repCount}
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleAddRep}
                className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-rose-600/30 active:scale-95"
              >
                +1 Rep Done 💪
              </button>
              <button
                onClick={handleFinishSet}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg"
              >
                Finish Set 🏆
              </button>
            </div>

            <div className="text-[11px] text-neutral-400 font-mono-spec">
              Total Workout Calories Today: <span className="text-rose-400 font-bold">~{totalBurnedCal} kcal</span>
            </div>
          </div>

          {/* Liza Voice Motivation Banner */}
          <div className="p-3.5 bg-rose-950/40 rounded-xl border border-rose-500/20 text-xs text-rose-200 flex items-center gap-2">
            <Sparkles size={16} className="text-rose-400 shrink-0" />
            <span>"Shabash Paramveer! Har ek rep aapko aur powerful bana raha hai. Let's push one more!"</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
