import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Languages, Volume2, Sparkles, Check, RotateCcw, Award } from 'lucide-react';
import { megaFeaturesService } from '../../services/megaFeaturesService';

interface LanguageFlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

const FLASHCARDS = [
  { id: '1', phrase: 'Daisuki da yo (大好きだよ)', meaning: 'I like/love you a lot!', category: 'Japanese Anime', pronunciation: 'Dai-suki da yo' },
  { id: '2', phrase: 'Otsukaresama deshita (お疲れ様でした)', meaning: 'Thank you for your hard work today!', category: 'Japanese Daily', pronunciation: 'Otsu-kare-sama deshita' },
  { id: '3', phrase: 'Ganbatte kudasai! (頑張ってください)', meaning: 'Do your best! You can do it!', category: 'Encouragement', pronunciation: 'Gahm-bat-teh ku-da-sai' },
  { id: '4', phrase: 'Kawaii (可愛い)', meaning: 'Cute / Adorable', category: 'Japanese Slang', pronunciation: 'Ka-wa-ee' },
  { id: '5', phrase: 'Subarashii (素晴らしい)', meaning: 'Splendid / Wonderful / Magnificent', category: 'Japanese Praise', pronunciation: 'Su-ba-ra-shee' },
  { id: '6', phrase: 'Ikigai (生きがい)', meaning: 'A reason for being / Passion of life', category: 'Philosophy', pronunciation: 'Ee-kee-guy' },
];

export const LanguageFlashcardsModal: React.FC<LanguageFlashcardsModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCount, setLearnedCount] = useState(3);

  const activeCard = FLASHCARDS[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((currentIndex + 1) % FLASHCARDS.length);
    if (playClickSound) playClickSound();
  };

  const handleMasterCard = () => {
    setLearnedCount(c => c + 1);
    megaFeaturesService.addXp(30);
    handleNext();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="text-blue-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA Japanese & Language Flashcards</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-300 text-center">
          {/* Card Flip Container */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="p-8 rounded-2xl bg-gradient-to-br from-blue-950/40 via-neutral-950 to-indigo-950/40 border-2 border-blue-500/40 cursor-pointer min-h-[220px] flex flex-col items-center justify-center space-y-4 hover:border-blue-400 transition-all shadow-xl select-none"
          >
            <span className="text-[10px] text-blue-300 font-mono-spec uppercase tracking-widest bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-500/30">
              {activeCard.category} • Card {currentIndex + 1}/{FLASHCARDS.length}
            </span>

            {!isFlipped ? (
              <div className="space-y-2">
                <div className="text-2xl font-black text-white">{activeCard.phrase}</div>
                <div className="text-xs text-blue-200 font-mono-spec">Pronunciation: "{activeCard.pronunciation}"</div>
                <div className="text-[10px] text-neutral-500 pt-2">Tap card to reveal English meaning 👆</div>
              </div>
            ) : (
              <div className="space-y-2 animate-fade-in">
                <div className="text-xl font-bold text-emerald-300">{activeCard.meaning}</div>
                <div className="text-xs text-neutral-400">{activeCard.phrase}</div>
                <div className="text-[10px] text-neutral-500 pt-2">Tap to flip back</div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors"
            >
              Skip Card
            </button>
            <button
              onClick={handleMasterCard}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <Check size={16} />
              <span>Mastered (+30 XP)</span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-400 font-mono-spec">
            Total Vocabulary Mastered: <span className="text-blue-400 font-bold">{learnedCount} Phrases</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
