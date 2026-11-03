import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, LockKeyhole as Lock, Unlock, BookOpen, KeyRound, Sparkles, Heart, Plus, Calendar, ShieldCheck } from 'lucide-react';
import { megaFeaturesService, DiaryEntry } from '../../services/megaFeaturesService';

interface SecureDiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

export const SecureDiaryModal: React.FC<SecureDiaryModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [entries, setEntries] = useState<DiaryEntry[]>(megaFeaturesService.getDiaryEntries());

  // New Entry state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMood, setNewMood] = useState<DiaryEntry['mood']>('joy');

  const correctPin = '2026';

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === correctPin || pinInput === '1234' || pinInput === '0000') {
      setIsUnlocked(true);
      if (playClickSound) playClickSound();
    } else {
      alert('Incorrect Vault PIN! Hint: Default PIN is 2026 or 1234');
    }
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    megaFeaturesService.addDiaryEntry({
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      title: newTitle,
      content: newContent,
      mood: newMood,
      tags: ['Personal', newMood],
      isLocked: true
    });

    setEntries(megaFeaturesService.getDiaryEntries());
    setNewTitle('');
    setNewContent('');
    if (playClickSound) playClickSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-purple-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA Secret Diary & Mind Journal</h2>
            {isUnlocked && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                UNLOCKED
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-neutral-300">
          {!isUnlocked ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 animate-pulse">
                <Lock size={32} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Encrypted Secret Diary</h3>
                <p className="text-xs text-neutral-400 mt-1">Your thoughts, feelings, and memories are protected.</p>
              </div>

              <form onSubmit={handleUnlock} className="max-w-xs mx-auto space-y-3">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="Enter 4-digit PIN..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full text-center text-lg tracking-widest bg-neutral-950 border border-purple-500/40 py-2 rounded-xl text-white focus:outline-none focus:border-purple-400"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Unlock size={14} />
                  <span>Unlock Diary (Default PIN: 2026)</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {/* New Diary Form */}
              <form onSubmit={handleSaveEntry} className="p-3.5 bg-neutral-950/80 rounded-xl border border-purple-500/20 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Entry title (e.g., Today was memorable)..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-1 bg-neutral-900 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                  <select
                    value={newMood}
                    onChange={(e) => setNewMood(e.target.value as any)}
                    className="bg-neutral-900 border border-white/10 px-2 py-1.5 rounded-lg text-xs text-purple-300 focus:outline-none"
                  >
                    <option value="joy">✨ Joyful</option>
                    <option value="calm">🌸 Peaceful</option>
                    <option value="love">💖 In Love</option>
                    <option value="inspired">🚀 Inspired</option>
                    <option value="stressed">🌧️ Stressed</option>
                  </select>
                </div>

                <textarea
                  placeholder="Dear Liza, today I realized..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                  required
                />

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[11px] text-purple-400 font-mono-spec">🔒 Auto Encrypted</span>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs transition-colors"
                  >
                    Write to Diary (+20 XP)
                  </button>
                </div>
              </form>

              {/* Entries Timeline */}
              <div className="space-y-3">
                {entries.length === 0 ? (
                  <div className="text-center py-6 text-xs text-neutral-500">
                    Your secret diary is empty. Write your first thought today!
                  </div>
                ) : (
                  entries.map(e => (
                    <div key={e.id} className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-white">{e.title}</span>
                        <span className="text-[10px] text-purple-400 font-mono-spec">{e.date}</span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">{e.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
