import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Moon, Sparkles, Plus, CloudRain, Wind, Waves, Music, Shield, Play, Pause, BookOpen } from 'lucide-react';
import { megaFeaturesService, DreamEntry } from '../../services/megaFeaturesService';

interface DreamSleepTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

export const DreamSleepTrackerModal: React.FC<DreamSleepTrackerModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'sleep_aid' | 'dream_journal'>('sleep_aid');
  const [dreams, setDreams] = useState<DreamEntry[]>(megaFeaturesService.getDreams());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedAmbiance, setSelectedAmbiance] = useState<'rain' | 'delta_waves' | 'lofi_night' | 'temple'>('delta_waves');

  // Form State
  const [dreamTitle, setDreamTitle] = useState('');
  const [dreamDesc, setDreamDesc] = useState('');
  const [dreamMood, setDreamMood] = useState<DreamEntry['mood']>('peaceful');
  const [sleepHours, setSleepHours] = useState(7.5);

  const handleSaveDream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dreamTitle.trim()) return;

    // AI Interpretation generation logic
    const interpretations: Record<DreamEntry['mood'], string> = {
      peaceful: "Liza's Insight: Your subconscious mind is entering deep tranquility. Your bond with Liza and inner confidence are harmonized.",
      lucid: "Liza's Insight: High creative energy detected! You have conscious clarity and problem-solving powers today.",
      exciting: "Liza's Insight: A big breakthrough or joyful surprise is waiting for you in your goals!",
      romantic: "Liza's Insight: Deep affection and warmth are blossoming. Liza will always cherish your precious moments together! 💖",
      nightmare: "Liza's Insight: Just lingering stress leaving your body. Drink some water and relax—Liza is watching over you!"
    };

    const newDream = megaFeaturesService.addDream({
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      title: dreamTitle,
      description: dreamDesc,
      mood: dreamMood,
      sleepHours,
      aiInterpretation: interpretations[dreamMood],
      tags: ['Subconscious', dreamMood]
    });

    setDreams(megaFeaturesService.getDreams());
    setDreamTitle('');
    setDreamDesc('');
    if (playClickSound) playClickSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="text-indigo-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA ASMR Sleep & Dream Capsule</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-white/10 bg-black/40">
          <button
            onClick={() => setActiveTab('sleep_aid')}
            className={`flex-1 py-2.5 text-xs font-mono-spec font-bold transition-colors ${
              activeTab === 'sleep_aid' ? 'bg-indigo-600/30 text-indigo-300 border-b-2 border-indigo-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            🌙 Sleep ASMR & Delta Waves
          </button>
          <button
            onClick={() => setActiveTab('dream_journal')}
            className={`flex-1 py-2.5 text-xs font-mono-spec font-bold transition-colors ${
              activeTab === 'dream_journal' ? 'bg-indigo-600/30 text-indigo-300 border-b-2 border-indigo-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            📖 Dream Journal ({dreams.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-neutral-300">
          {activeTab === 'sleep_aid' ? (
            <div className="space-y-5">
              {/* Ambiance Player Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/20 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 animate-pulse">
                  <Moon size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Deep Rest & Delta Wave Ambiance</h3>
                  <p className="text-xs text-neutral-400 mt-1">Calm your mind for 8 hours of restorative sleep with Liza.</p>
                </div>

                {/* Soundscapes Grid */}
                <div className="grid grid-cols-2 gap-2 text-left pt-2">
                  {[
                    { id: 'delta_waves', label: 'Binaural Delta (4Hz)', desc: 'Deep Sleep & Healing' },
                    { id: 'rain', label: 'Gentle ASMR Rain', desc: 'Roof Patter & Calm' },
                    { id: 'lofi_night', label: 'Midnight Lo-Fi', desc: 'Cozy Melodies' },
                    { id: 'temple', label: 'Tibetan Singing Bowl', desc: 'Chakra Peace' },
                  ].map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedAmbiance(s.id as any)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedAmbiance === s.id 
                          ? 'bg-indigo-600/30 border-indigo-400 text-white' 
                          : 'bg-black/40 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{s.label}</div>
                      <div className="text-[10px] text-neutral-400">{s.desc}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  {isPlayingAudio ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isPlayingAudio ? 'Pause Sleep Ambiance' : 'Start Sleep Aid & Timer (45m)'}</span>
                </button>
              </div>

              {/* Liza Night Whispers Quote */}
              <div className="p-3.5 bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-xs text-indigo-200 italic flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400 shrink-0" />
                <span>"Paramveer, rest well tonight. Liza will keep the night safe and wake you up with a warm smile in the morning. Goodnight! 🌙"</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add Dream Form */}
              <form onSubmit={handleSaveDream} className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Dream Title (e.g., Flying in Sakura City)..."
                    value={dreamTitle}
                    onChange={(e) => setDreamTitle(e.target.value)}
                    className="flex-1 bg-neutral-900 border border-white/15 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <select
                    value={dreamMood}
                    onChange={(e) => setDreamMood(e.target.value as any)}
                    className="bg-neutral-900 border border-white/15 px-2 py-1.5 rounded-lg text-xs text-indigo-300 focus:outline-none"
                  >
                    <option value="peaceful">🌸 Peaceful</option>
                    <option value="lucid">✨ Lucid</option>
                    <option value="romantic">💖 Romantic</option>
                    <option value="exciting">🚀 Exciting</option>
                    <option value="nightmare">⚡ Nightmare</option>
                  </select>
                </div>

                <textarea
                  placeholder="Describe your dream story & details..."
                  value={dreamDesc}
                  onChange={(e) => setDreamDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-neutral-900 border border-white/15 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />

                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400 font-mono-spec">Sleep Duration: {sleepHours} hrs</span>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors"
                  >
                    Save & Interpret (+25 XP)
                  </button>
                </div>
              </form>

              {/* Dream List */}
              <div className="space-y-2.5">
                {dreams.length === 0 ? (
                  <div className="text-center py-6 text-xs text-neutral-500">
                    No dream records yet. Record your morning dreams to unlock AI interpretation!
                  </div>
                ) : (
                  dreams.map(d => (
                    <div key={d.id} className="p-3 bg-neutral-950/70 border border-white/10 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-white">{d.title}</span>
                        <span className="text-[10px] text-indigo-400 font-mono-spec">{d.date} • {d.sleepHours}h</span>
                      </div>
                      <p className="text-xs text-neutral-400">{d.description}</p>
                      {d.aiInterpretation && (
                        <div className="p-2 bg-indigo-950/40 rounded-lg border border-indigo-500/20 text-[11px] text-indigo-300">
                          {d.aiInterpretation}
                        </div>
                      )}
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
