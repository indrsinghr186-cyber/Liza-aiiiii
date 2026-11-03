import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Volume2, CloudRain, Flame, Waves, Wind, Coffee, Bell, Trees, Play, Pause, RotateCcw } from 'lucide-react';

interface SoundscapeMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

const CHANNELS = [
  { id: 'rain', name: 'Monsoon Rain', icon: CloudRain, color: '#38bdf8' },
  { id: 'thunder', name: 'Distant Thunder', icon: Wind, color: '#a855f7' },
  { id: 'fire', name: 'Campfire Crackle', icon: Flame, color: '#f97316' },
  { id: 'waves', name: 'Ocean Waves', icon: Waves, color: '#06b6d4' },
  { id: 'cafe', name: 'Tokyo Cafe Ambiance', icon: Coffee, color: '#eab308' },
  { id: 'forest', name: 'Night Forest & Crickets', icon: Trees, color: '#10b981' },
  { id: 'temple', name: 'Tibetan Peace Chimes', icon: Bell, color: '#ec4899' },
];

export const SoundscapeMixerModal: React.FC<SoundscapeMixerModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [volumes, setVolumes] = useState<Record<string, number>>({
    rain: 60,
    thunder: 20,
    fire: 0,
    waves: 0,
    cafe: 40,
    forest: 0,
    temple: 15,
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVolumeChange = (id: string, val: number) => {
    setVolumes(prev => ({ ...prev, [id]: val }));
  };

  const handleReset = () => {
    setVolumes({ rain: 0, thunder: 0, fire: 0, waves: 0, cafe: 0, forest: 0, temple: 0 });
    if (playClickSound) playClickSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-teal-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="text-teal-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA 8-Channel Soundscape Mixer</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-300">
          {/* Master Controller */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-950/60 to-neutral-950 border border-teal-500/20 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-mono-spec text-teal-300 uppercase tracking-wider block">Master Soundscape</span>
              <div className="text-base font-bold text-white">Focus & Sleep Multi-Track Ambiance</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono-spec flex items-center gap-2 text-white transition-all shadow-md ${
                  isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-teal-600 hover:bg-teal-500'
                }`}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                <span>{isPlaying ? 'Pause' : 'Play Live'}</span>
              </button>
              <button onClick={handleReset} className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white" title="Mute All">
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          {/* Sound Sliders Grid */}
          <div className="space-y-3">
            {CHANNELS.map(ch => {
              const Icon = ch.icon;
              const val = volumes[ch.id] || 0;
              return (
                <div key={ch.id} className="p-3 bg-neutral-950/70 border border-white/10 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <Icon size={16} style={{ color: ch.color }} />
                      <span className="font-semibold text-white">{ch.name}</span>
                    </div>
                    <span className="text-[10px] font-mono-spec text-teal-400 font-bold">{val}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={val}
                    onChange={(e) => handleVolumeChange(ch.id, parseInt(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
