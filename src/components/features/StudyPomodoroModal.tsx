import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Timer, Play, Pause, RotateCcw, CheckCircle2, Sparkles, BookOpen, Coffee } from 'lucide-react';
import { megaFeaturesService } from '../../services/megaFeaturesService';

interface StudyPomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

export const StudyPomodoroModal: React.FC<StudyPomodoroModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'study' | 'short_break' | 'long_break'>('study');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(2);
  const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: '1', text: 'Master React & Node.js Architecture', done: true },
    { id: '2', text: 'Complete Daily Coding Project', done: false },
    { id: '3', text: 'Revise Japanese & English Vocab', done: false },
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            if (mode === 'study') {
              setCompletedSessions(c => c + 1);
              alert('🎉 Pomodoro Session Finished! Great job Paramveer! Take a well-earned break.');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const switchMode = (newMode: 'study' | 'short_break' | 'long_break') => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === 'study') setTimeLeft(25 * 60);
    else if (newMode === 'short_break') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
    if (playClickSound) playClickSound();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks(prev => [...prev, { id: Date.now().toString(), text: newTaskText.trim(), done: false }]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="text-emerald-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA Study Buddy & Pomodoro</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-300">
          {/* Mode Selector */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => switchMode('study')}
              className={`px-4 py-1.5 rounded-xl text-xs font-mono-spec font-bold transition-all ${
                mode === 'study' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              📚 Focus (25m)
            </button>
            <button
              onClick={() => switchMode('short_break')}
              className={`px-4 py-1.5 rounded-xl text-xs font-mono-spec font-bold transition-all ${
                mode === 'short_break' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              ☕ Short Break (5m)
            </button>
            <button
              onClick={() => switchMode('long_break')}
              className={`px-4 py-1.5 rounded-xl text-xs font-mono-spec font-bold transition-all ${
                mode === 'long_break' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              🌿 Long Break (15m)
            </button>
          </div>

          {/* Big Digital Timer Display */}
          <div className="p-6 rounded-2xl bg-neutral-950/80 border border-emerald-500/20 text-center space-y-4 shadow-inner">
            <div className="text-6xl font-black font-mono-spec tracking-tight text-white drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              {formatTime(timeLeft)}
            </div>

            <div className="flex justify-center items-center gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold font-mono-spec flex items-center gap-2 text-white transition-all shadow-lg ${
                  isRunning 
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30' 
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                }`}
              >
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                <span>{isRunning ? 'Pause Timer' : 'Start Focus'}</span>
              </button>
              <button
                onClick={() => switchMode(mode)}
                className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="text-[11px] text-neutral-400 font-mono-spec">
              Completed Focus Blocks Today: <span className="text-emerald-400 font-bold">{completedSessions}</span>
            </div>
          </div>

          {/* Task Checklist */}
          <div className="space-y-3">
            <span className="text-xs font-bold font-mono-spec text-neutral-400 uppercase tracking-wider block">
              Focus Goal Checklist:
            </span>
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a focus task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="flex-1 bg-neutral-950 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors"
              >
                Add
              </button>
            </form>

            <div className="space-y-1.5">
              {tasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    t.done ? 'bg-black/30 border-white/5 opacity-60' : 'bg-neutral-950/60 border-white/10 hover:border-emerald-500/40'
                  }`}
                >
                  <CheckCircle2 size={16} className={t.done ? 'text-emerald-400' : 'text-neutral-600'} />
                  <span className={`text-xs ${t.done ? 'line-through text-neutral-400' : 'text-white'}`}>
                    {t.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
