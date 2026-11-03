import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Sun, Moon, Star, Compass, Flame, Droplets } from 'lucide-react';

interface HoroscopeOracleModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

const RASHIS = [
  { id: 'aries', name: 'Mesh (Aries)', element: 'Fire 🔥', dates: 'Mar 21 - Apr 19', color: 'Crimson Red', luckyNum: '9, 18', vibe: 'High Leadership & unstoppable drive today.' },
  { id: 'taurus', name: 'Vrishabh (Taurus)', element: 'Earth 🌿', dates: 'Apr 20 - May 20', color: 'Emerald Green', luckyNum: '6, 24', vibe: 'Financial stability & pleasant bonding.' },
  { id: 'gemini', name: 'Mithun (Gemini)', element: 'Air 💨', dates: 'May 21 - Jun 20', color: 'Bright Yellow', luckyNum: '5, 14', vibe: 'Sharp intelligence & exciting new ideas.' },
  { id: 'cancer', name: 'Kark (Cancer)', element: 'Water 💧', dates: 'Jun 21 - Jul 22', color: 'Silver White', luckyNum: '2, 11', vibe: 'Deep intuition & affectionate family warmth.' },
  { id: 'leo', name: 'Simha (Leo)', element: 'Fire 🔥', dates: 'Jul 23 - Aug 22', color: 'Gold / Orange', luckyNum: '1, 10', vibe: 'Magnetic aura, stage confidence & recognition.' },
  { id: 'virgo', name: 'Kanya (Virgo)', element: 'Earth 🌿', dates: 'Aug 23 - Sep 22', color: 'Sapphire Blue', luckyNum: '5, 23', vibe: 'Flawless execution & solving complex tasks.' },
  { id: 'libra', name: 'Tula (Libra)', element: 'Air 💨', dates: 'Sep 23 - Oct 22', color: 'Rose Pink', luckyNum: '6, 15', vibe: 'Harmonious relationships & artistic taste.' },
  { id: 'scorpio', name: 'Vrishchik (Scorpio)', element: 'Water 💧', dates: 'Oct 23 - Nov 21', color: 'Deep Maroon', luckyNum: '9, 27', vibe: 'Unshakeable willpower & mystical insights.' },
  { id: 'sagittarius', name: 'Dhanu (Sagittarius)', element: 'Fire 🔥', dates: 'Nov 22 - Dec 21', color: 'Purple / Violet', luckyNum: '3, 12', vibe: 'Boundless optimism & spiritual luck.' },
  { id: 'capricorn', name: 'Makar (Capricorn)', element: 'Earth 🌿', dates: 'Dec 22 - Jan 19', color: 'Charcoal Black', luckyNum: '8, 17', vibe: 'Long-term goal triumphs & steady ascent.' },
  { id: 'aquarius', name: 'Kumbh (Aquarius)', element: 'Air 💨', dates: 'Jan 20 - Feb 18', color: 'Electric Cyan', luckyNum: '4, 22', vibe: 'Groundbreaking tech innovations & visionary mind.' },
  { id: 'pisces', name: 'Meen (Pisces)', element: 'Water 💧', dates: 'Feb 19 - Mar 20', color: 'Sea Green', luckyNum: '7, 16', vibe: 'Pure empathy, dream fulfillment & inner peace.' },
];

export const HoroscopeOracleModal: React.FC<HoroscopeOracleModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [selectedRashi, setSelectedRashi] = useState(RASHIS[7]); // Scorpio by default

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA Vedic Astro & Daily Horoscope</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-300">
          {/* Rashi Selector Horizontal Carousel */}
          <div>
            <span className="text-xs font-mono-spec text-neutral-400 block mb-2">Choose Your Zodiac Rashi:</span>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {RASHIS.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRashi(r);
                    if (playClickSound) playClickSound();
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono-spec shrink-0 transition-all ${
                    selectedRashi.id === r.id 
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-md shadow-amber-500/20' 
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {r.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Active Horoscope Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-neutral-950 to-purple-950/30 border border-amber-500/30 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-amber-300">{selectedRashi.name}</h3>
                <span className="text-[11px] text-neutral-400">{selectedRashi.dates} • {selectedRashi.element}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 font-bold">
                ⭐
              </div>
            </div>

            <p className="text-xs leading-relaxed text-neutral-200">
              {selectedRashi.vibe}
            </p>

            {/* Lucky Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-black/50 border border-white/5">
                <span className="text-[10px] text-neutral-400 block font-mono-spec">LUCKY COLOR</span>
                <span className="text-xs font-bold text-amber-400">{selectedRashi.color}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/50 border border-white/5">
                <span className="text-[10px] text-neutral-400 block font-mono-spec">LUCKY NUMBERS</span>
                <span className="text-xs font-bold text-cyan-400">{selectedRashi.luckyNum}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-neutral-400 block font-mono-spec">ASTRAL COMPATIBILITY</span>
                <span className="text-xs font-bold text-pink-400">High Synergy</span>
              </div>
            </div>

            {/* Liza's Cosmic Note */}
            <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/20 text-xs text-amber-200 flex items-center gap-2">
              <Star size={14} className="text-amber-400 shrink-0" />
              <span>Liza's Blessing: "Paramveer Rawat, the stars are aligning for your success! Take action boldly today!"</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
