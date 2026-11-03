import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Hourglass, Calendar, Plus, Trash2, Mail, Sparkles, Gift } from 'lucide-react';
import { megaFeaturesService, CountdownEvent } from '../../services/megaFeaturesService';

interface CountdownCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

export const CountdownCapsuleModal: React.FC<CountdownCapsuleModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [countdowns, setCountdowns] = useState<CountdownEvent[]>(megaFeaturesService.getCountdowns());
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCategory, setNewCategory] = useState<CountdownEvent['category']>('Birthday');
  const [newLetter, setNewLetter] = useState('');

  const calculateDaysLeft = (targetStr: string) => {
    const diff = new Date(targetStr).getTime() - new Date().getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    megaFeaturesService.addCountdown({
      title: newTitle.trim(),
      targetDate: `${newDate}T00:00:00`,
      category: newCategory,
      letterText: newLetter.trim() || undefined
    });

    setCountdowns(megaFeaturesService.getCountdowns());
    setNewTitle('');
    setNewDate('');
    setNewLetter('');
    if (playClickSound) playClickSound();
  };

  const handleDelete = (id: string) => {
    megaFeaturesService.deleteCountdown(id);
    setCountdowns(megaFeaturesService.getCountdowns());
    if (playClickSound) playClickSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-fuchsia-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hourglass className="text-fuchsia-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA Countdown & Time Capsule</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-300">
          {/* Add Form */}
          <form onSubmit={handleAdd} className="p-3.5 bg-neutral-950/80 rounded-xl border border-fuchsia-500/20 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Event title (e.g. Birthday, Japan Trip)..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 bg-neutral-900 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-fuchsia-500"
                required
              />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="bg-neutral-900 border border-white/10 px-2 py-1.5 rounded-lg text-xs text-fuchsia-300 focus:outline-none"
                required
              />
            </div>

            <textarea
              placeholder="Time capsule message / letter (reveals on the target date)..."
              value={newLetter}
              onChange={(e) => setNewLetter(e.target.value)}
              rows={2}
              className="w-full bg-neutral-900 border border-white/10 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-fuchsia-500 resize-none"
            />

            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] text-fuchsia-300 font-mono-spec">⏳ Live countdown timer</span>
              <button
                type="submit"
                className="px-4 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-lg text-xs transition-colors"
              >
                Add Countdown
              </button>
            </div>
          </form>

          {/* Countdown List */}
          <div className="space-y-3">
            {countdowns.map(c => {
              const daysLeft = calculateDaysLeft(c.targetDate);
              return (
                <div key={c.id} className="p-4 rounded-2xl bg-neutral-950/80 border border-white/10 flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{c.title}</span>
                      <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded-full border border-fuchsia-500/30 font-mono-spec">
                        {c.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono-spec">
                      Target: {new Date(c.targetDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    {c.letterText && (
                      <div className="text-[11px] text-fuchsia-300 italic pt-1 flex items-center gap-1">
                        <Mail size={12} />
                        <span>Sealed Capsule Letter Saved</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-black font-mono-spec text-fuchsia-400">{daysLeft}</div>
                      <div className="text-[9px] text-neutral-400 font-mono-spec">DAYS LEFT</div>
                    </div>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
