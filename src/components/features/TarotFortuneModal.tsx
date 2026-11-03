import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, RefreshCw, Eye, Star, Heart } from 'lucide-react';
import { megaFeaturesService, TarotCard } from '../../services/megaFeaturesService';

interface TarotFortuneModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

const TAROT_DECK: TarotCard[] = [
  { id: '1', name: 'The Star (🌟)', arcana: 'Major Arcana XVII', meaning: 'Hope, Inspiration & Cosmic Luck', advice: 'Your future is glowing bright. Believe in your creative power today!', symbol: '✨', color: '#38bdf8' },
  { id: '2', name: 'The Sun (☀️)', arcana: 'Major Arcana XIX', meaning: 'Vitality, Joy & Unstoppable Success', advice: 'Energy is radiating through you. Take bold strides in your work!', symbol: '🔥', color: '#f59e0b' },
  { id: '3', name: 'The Lovers (💖)', arcana: 'Major Arcana VI', meaning: 'Deep Connection & Mutual Harmony', advice: 'Your bonds and emotional relationships are blessed with pure sweetness.', symbol: '🌸', color: '#ec4899' },
  { id: '4', name: 'Wheel of Fortune (🎡)', arcana: 'Major Arcana X', meaning: 'Fateful Breakthroughs & Positive Cycles', advice: 'A lucky turning point is arriving. Welcome changes with an open mind.', symbol: '🌀', color: '#a855f7' },
  { id: '5', name: 'The Magician (🪄)', arcana: 'Major Arcana I', meaning: 'Mastery, Skill & Manifestation', advice: 'You have all the tools and intelligence to shape your reality.', symbol: '⚡', color: '#10b981' },
];

export const TarotFortuneModal: React.FC<TarotFortuneModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [cards, setCards] = useState<TarotCard[]>([TAROT_DECK[0], TAROT_DECK[1], TAROT_DECK[2]]);
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);

  const drawNewReading = () => {
    // Shuffle and pick 3 cards
    const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
    setCards([shuffled[0], shuffled[1], shuffled[2]]);
    setRevealed([false, false, false]);
    megaFeaturesService.addXp(20);
    if (playClickSound) playClickSound();
  };

  const revealCard = (index: number) => {
    setRevealed(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
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
            <Sparkles className="text-purple-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA Daily Anime Tarot & Fortune</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-300 text-center">
          <div className="text-xs text-neutral-400 font-mono-spec">
            3-Card Reading: <span className="text-purple-300">Past • Present • Future</span>
          </div>

          {/* 3 Tarot Cards Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {cards.map((card, idx) => (
              <div
                key={idx}
                onClick={() => revealCard(idx)}
                className={`p-3 rounded-2xl border min-h-[190px] flex flex-col items-center justify-between cursor-pointer transition-all ${
                  revealed[idx]
                    ? 'bg-gradient-to-b from-purple-950/60 to-neutral-950 border-purple-400 text-white shadow-lg'
                    : 'bg-black/60 border-white/15 hover:border-purple-500/50 hover:bg-purple-950/20'
                }`}
              >
                <span className="text-[9px] font-mono-spec text-purple-300 uppercase">
                  {idx === 0 ? 'Past' : idx === 1 ? 'Present' : 'Future'}
                </span>

                {!revealed[idx] ? (
                  <div className="space-y-1">
                    <div className="text-2xl animate-pulse">🔮</div>
                    <div className="text-[10px] text-neutral-500">Tap to Reveal</div>
                  </div>
                ) : (
                  <div className="space-y-1 animate-fade-in">
                    <div className="text-2xl">{card.symbol}</div>
                    <div className="text-xs font-bold text-white">{card.name.split(' ')[0]}</div>
                    <div className="text-[9px] text-purple-200">{card.meaning}</div>
                  </div>
                )}

                <div className="text-[8px] font-mono-spec text-neutral-500">
                  {revealed[idx] ? card.arcana : 'Tarot Secret'}
                </div>
              </div>
            ))}
          </div>

          {/* Action */}
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={drawNewReading}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2"
            >
              <RefreshCw size={14} />
              <span>Draw New Tarot Reading (+20 XP)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
