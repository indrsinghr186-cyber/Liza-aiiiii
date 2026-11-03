import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Eye, Play, Pause, RotateCcw, Sparkles, FileText } from 'lucide-react';

interface SpeedReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

export const SpeedReaderModal: React.FC<SpeedReaderModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const sampleText = "Artificial Intelligence is transforming our everyday reality. LIZA is designed to be your constant companion, study buddy, and intelligent assistant, helping you achieve greatness while bringing joy and warmth to every moment of your day!";
  
  const [inputText, setInputText] = useState(sampleText);
  const [words, setWords] = useState<string[]>(sampleText.split(/\s+/));
  const [wordIndex, setWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setWords(inputText.split(/\s+/).filter(w => w.length > 0));
    setWordIndex(0);
  }, [inputText]);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = (60 / wpm) * 1000;
      timerRef.current = setInterval(() => {
        setWordIndex(prev => {
          if (prev >= words.length - 1) {
            clearInterval(timerRef.current!);
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, wpm, words]);

  const currentWord = words[wordIndex] || 'Ready';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="text-sky-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA Rapid RSVP Speed Reader</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-300">
          {/* Big RSVP Focal Word Display */}
          <div className="p-8 rounded-2xl bg-neutral-950/90 border border-sky-500/30 text-center min-h-[160px] flex flex-col items-center justify-center space-y-3 shadow-inner">
            <div className="text-3xl sm:text-4xl font-black font-mono-spec text-white tracking-wider">
              {currentWord}
            </div>
            <div className="text-[10px] text-sky-400 font-mono-spec">
              Word {wordIndex + 1} / {words.length} • ({Math.round(((wordIndex + 1) / words.length) * 100)}%)
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause' : 'Start Reading'}</span>
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setWordIndex(0);
                }}
                className="p-2 bg-neutral-800 text-neutral-400 hover:text-white rounded-xl"
                title="Reset"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono-spec">
              <span className="text-neutral-400">Speed:</span>
              <select
                value={wpm}
                onChange={(e) => setWpm(parseInt(e.target.value))}
                className="bg-neutral-900 border border-white/15 px-2 py-1 rounded-lg text-sky-300 focus:outline-none"
              >
                <option value={200}>200 WPM</option>
                <option value={300}>300 WPM</option>
                <option value={450}>450 WPM</option>
                <option value={600}>600 WPM (Lightning)</option>
              </select>
            </div>
          </div>

          {/* Text Input Area */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono-spec text-neutral-400 uppercase tracking-wider block">
              Paste Article / Text to Speed Read:
            </span>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={3}
              className="w-full bg-neutral-950 border border-white/10 p-2.5 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
