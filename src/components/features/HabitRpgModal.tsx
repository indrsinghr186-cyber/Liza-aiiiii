import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2, Circle, Plus, Sparkles, CheckSquare, Flame } from 'lucide-react';
import { megaFeaturesService, HabitItem } from '../../services/megaFeaturesService';

interface HabitRpgModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

export const HabitRpgModal: React.FC<HabitRpgModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [habits, setHabits] = useState<HabitItem[]>(megaFeaturesService.getHabits());
  const [newTitle, setNewTitle] = useState('');

  const completedCount = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const progressPercent = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  const handleToggle = (id: string) => {
    megaFeaturesService.toggleHabit(id);
    setHabits([...megaFeaturesService.getHabits()]);
    if (playClickSound) playClickSound();
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    megaFeaturesService.addHabit(newTitle.trim(), 'Daily');
    setHabits([...megaFeaturesService.getHabits()]);
    setNewTitle('');
    if (playClickSound) playClickSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-yellow-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="text-yellow-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA Daily Habit Tracker</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-300">
          {/* Daily Progress Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-950/40 via-neutral-950 to-amber-950/30 border border-yellow-500/30 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono-spec text-yellow-300 uppercase tracking-wider block">DAILY HABIT GOALS</span>
                <h3 className="text-lg font-black text-white">{completedCount} of {totalHabits} Completed Today</h3>
              </div>
              <div className="px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded-full font-mono-spec font-bold text-xs">
                {progressPercent}% Done
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono-spec text-neutral-400">
                <span>Today's Consistency</span>
                <span>{completedCount} / {totalHabits} Habits</span>
              </div>
              <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Add Habit Form */}
          <form onSubmit={handleAddHabit} className="flex gap-2">
            <input
              type="text"
              placeholder="Add new daily habit (e.g. Read 15 mins)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 bg-neutral-950 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-yellow-500"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-xs rounded-lg transition-colors"
            >
              Add Habit
            </button>
          </form>

          {/* Habit Checklist */}
          <div className="space-y-2">
            {habits.map(h => (
              <div
                key={h.id}
                onClick={() => handleToggle(h.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  h.completedToday 
                    ? 'bg-yellow-500/15 border-yellow-500/40 text-white' 
                    : 'bg-neutral-950/70 border-white/10 hover:border-white/20 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {h.completedToday ? (
                    <CheckCircle2 size={20} className="text-yellow-400 shrink-0" />
                  ) : (
                    <Circle size={20} className="text-neutral-500 shrink-0" />
                  )}
                  <div>
                    <div className={`text-xs font-semibold ${h.completedToday ? 'line-through text-neutral-400' : 'text-white'}`}>
                      {h.title}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono-spec">
                      🔥 {h.streak} Day Streak • {h.category || 'Daily'}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono-spec font-bold text-yellow-400">
                  {h.completedToday ? 'DONE' : 'INCOMPLETE'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
