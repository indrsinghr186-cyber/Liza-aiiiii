import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Trophy, HelpCircle, Check, Sparkles, RotateCcw } from 'lucide-react';
import { megaFeaturesService } from '../../services/megaFeaturesService';

interface TriviaArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

const QUESTIONS = [
  {
    question: 'Which anime features the protagonist "Monkey D. Luffy" searching for the ultimate treasure?',
    options: ['Naruto', 'One Piece', 'Bleach', 'Dragon Ball Z'],
    correct: 1,
    category: 'Anime & Manga'
  },
  {
    question: 'In Indian Cinema, which historic film won the Oscar for "Best Original Song" for "Naatu Naatu"?',
    options: ['Baahubali 2', 'RRR', 'KGF 2', 'Jawan'],
    correct: 1,
    category: 'Bollywood & Cinema'
  },
  {
    question: 'What is the Japanese word for "Cute" or "Adorable"?',
    options: ['Sugoi', 'Baka', 'Kawaii', 'Ganbatte'],
    correct: 2,
    category: 'Japanese Culture'
  },
  {
    question: 'Who founded SpaceX and leads the mission to land humans on Mars?',
    options: ['Jeff Bezos', 'Elon Musk', 'Bill Gates', 'Jensen Huang'],
    correct: 1,
    category: 'Tech & Space'
  },
];

export const TriviaArenaModal: React.FC<TriviaArenaModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const q = QUESTIONS[currentIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === q.correct) {
      setScore(s => s + 100);
      megaFeaturesService.addXp(25);
    }
    if (playClickSound) playClickSound();
  };

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setCurrentIdx((currentIdx + 1) % QUESTIONS.length);
    if (playClickSound) playClickSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-violet-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="text-violet-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA Anime & General Trivia Arena</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-300">
          <div className="flex justify-between items-center text-xs font-mono-spec">
            <span className="text-violet-300">Question {currentIdx + 1}/{QUESTIONS.length} • {q.category}</span>
            <span className="text-amber-400 font-bold">Score: {score} PTS</span>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-950/80 border border-violet-500/20 space-y-4">
            <h3 className="text-base font-bold text-white leading-snug">{q.question}</h3>

            <div className="space-y-2">
              {q.options.map((opt, i) => {
                let btnStyle = 'bg-black/50 border-white/10 text-neutral-300 hover:border-violet-500/50';
                if (isAnswered) {
                  if (i === q.correct) btnStyle = 'bg-emerald-600/30 border-emerald-400 text-emerald-200 font-bold';
                  else if (i === selectedOption) btnStyle = 'bg-rose-600/30 border-rose-400 text-rose-200';
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && i === q.correct && <Check size={16} className="text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Next Question ➔
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
