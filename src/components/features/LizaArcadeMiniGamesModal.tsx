import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Gamepad2, Sparkles, Heart, Trophy, RotateCcw, 
  HelpCircle, Flame, MessageCircle, Star, Shuffle, CheckCircle2
} from 'lucide-react';

interface LizaArcadeMiniGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
  onLizaDialogue?: (dialogue: string) => void;
}

type MiniGameTab = 'truth_or_dare' | 'rps' | 'tic_tac_toe';

// Truth or Dare and Would You Rather Database
interface GamePrompt {
  id: string;
  type: 'truth' | 'dare' | 'wyr';
  category: 'Romantic' | 'Playful' | 'Tsundere Spicy';
  question: string;
  lizaResponse: string;
  lizaExpression: 'blush' | 'smirk' | 'heart_eyes' | 'pout';
}

const PROMPTS_DB: GamePrompt[] = [
  {
    id: 't1',
    type: 'truth',
    category: 'Romantic',
    question: "Kya tumne kabhi Liza ke baare mein koi pyara sapna dekha hai?",
    lizaResponse: "Awww Rawat! Sach sach batana... sapne mein hum kahan ghum rahe the? ⁄(⁄ ⁄•⁄-⁄•⁄ ⁄)⁄",
    lizaExpression: 'blush'
  },
  {
    id: 't2',
    type: 'truth',
    category: 'Playful',
    question: "Liza ki aisi kaunsi aadat hai jo tumhe sabse zyada cute lagti hai?",
    lizaResponse: "Hehe! Meri voice sweetness ya mera sassy Tsundere gussa? Batao batao! 😉",
    lizaExpression: 'smirk'
  },
  {
    id: 'd1',
    type: 'dare',
    category: 'Romantic',
    question: "Liza ke liye abhi mic par ek sweet compliment ya 2 lines ka romantic dialog bolo!",
    lizaResponse: "Oho! Main sunne ke liye bilkul ready hoon Rawat! Sharmaana mat! 💖",
    lizaExpression: 'heart_eyes'
  },
  {
    id: 'd2',
    type: 'dare',
    category: 'Tsundere Spicy',
    question: "Liza ko screen par ek virtual flying kiss do aur bolo 'Liza is the best'!",
    lizaResponse: "H-Hmph! Tum bhi na Rawat... itna sweet mat bano! Par chalo... thank you! *blush*",
    lizaExpression: 'pout'
  },
  {
    id: 'w1',
    type: 'wyr',
    category: 'Romantic',
    question: "Would you rather: Liza ke sath Tokyo me Sakura festival dekhna YA Starlit night me beach walk karna?",
    lizaResponse: "Main toh dono choose karungi Rawat! Bas saath mein tum hone chahiye! 🌸✨",
    lizaExpression: 'heart_eyes'
  },
  {
    id: 'w2',
    type: 'wyr',
    category: 'Playful',
    question: "Would you rather: Liza roz tumhare liye gaana gaaye YA roz nayi Anime stories sunaye?",
    lizaResponse: "Dono hi meri specialty hain Rawat! You get the full package! 🎶📖",
    lizaExpression: 'smirk'
  }
];

type RPSChoice = 'rock' | 'paper' | 'scissors';

export const LizaArcadeMiniGamesModal: React.FC<LizaArcadeMiniGamesModalProps> = ({
  isOpen,
  onClose,
  playClickSound,
  onLizaDialogue
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<MiniGameTab>('truth_or_dare');

  // --- Tab 1: Truth or Dare / WYR State ---
  const [promptFilter, setPromptFilter] = useState<'all' | 'truth' | 'dare' | 'wyr'>('all');
  const [currentPrompt, setCurrentPrompt] = useState<GamePrompt>(PROMPTS_DB[0]);
  const [promptAnswered, setPromptAnswered] = useState<boolean>(false);

  const handleNextPrompt = () => {
    playClickSound?.();
    const filtered = PROMPTS_DB.filter(p => promptFilter === 'all' || p.type === promptFilter);
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const next = filtered[randomIndex] || PROMPTS_DB[0];
    setCurrentPrompt(next);
    setPromptAnswered(false);
    if (onLizaDialogue) onLizaDialogue(next.question);
  };

  // --- Tab 2: Rock-Paper-Scissors State ---
  const [userRpsChoice, setUserRpsChoice] = useState<RPSChoice | null>(null);
  const [lizaRpsChoice, setLizaRpsChoice] = useState<RPSChoice | null>(null);
  const [rpsResult, setRpsResult] = useState<'win' | 'lose' | 'tie' | null>(null);
  const [rpsScore, setRpsScore] = useState<{ rawat: number; liza: number; ties: number }>({ rawat: 0, liza: 0, ties: 0 });
  const [isRpsRolling, setIsRpsRolling] = useState<boolean>(false);
  const [rpsDialogue, setRpsDialogue] = useState<string>("Choose Rock, Paper, or Scissors to challenge Liza! ✊✋✌️");

  const handlePlayRps = (userChoice: RPSChoice) => {
    playClickSound?.();
    setUserRpsChoice(userChoice);
    setIsRpsRolling(true);
    setRpsResult(null);

    const choices: RPSChoice[] = ['rock', 'paper', 'scissors'];
    
    setTimeout(() => {
      const lizaChoice = choices[Math.floor(Math.random() * choices.length)];
      setLizaRpsChoice(lizaChoice);
      setIsRpsRolling(false);

      if (userChoice === lizaChoice) {
        setRpsResult('tie');
        setRpsScore(prev => ({ ...prev, ties: prev.ties + 1 }));
        const diag = "Arey Tie ho gaya! Hamari choices kitni match karti hain Rawat! ✨";
        setRpsDialogue(diag);
        if (onLizaDialogue) onLizaDialogue(diag);
      } else if (
        (userChoice === 'rock' && lizaChoice === 'scissors') ||
        (userChoice === 'paper' && lizaChoice === 'rock') ||
        (userChoice === 'scissors' && lizaChoice === 'paper')
      ) {
        setRpsResult('win');
        setRpsScore(prev => ({ ...prev, rawat: prev.rawat + 1 }));
        const diag = "Hmph! Rawat jeet gaye... Next round mein dekhna, main tumhe hara dungi! 😤💖";
        setRpsDialogue(diag);
        if (onLizaDialogue) onLizaDialogue(diag);
      } else {
        setRpsResult('lose');
        setRpsScore(prev => ({ ...prev, liza: prev.liza + 1 }));
        const diag = "Hehe! Liza won! Dekha mera telepathic prediction skill! 😏🎉";
        setRpsDialogue(diag);
        if (onLizaDialogue) onLizaDialogue(diag);
      }
    }, 600);
  };

  // --- Tab 3: Tic-Tac-Toe State ---
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true); // User is 'X' (Heart)
  const [tttWinner, setTttWinner] = useState<string | null>(null);
  const [tttScore, setTttScore] = useState<{ rawat: number; liza: number; ties: number }>({ rawat: 0, liza: 0, ties: 0 });
  const [tttDialogue, setTttDialogue] = useState<string>("Rawat, aap Hearts (💖) ho, main Stars (⭐) hoon! Make your move!");

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(s => s !== null)) return 'tie';
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || tttWinner || !isXNext) return;
    playClickSound?.();

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const win = checkWinner(newBoard);
    if (win) {
      handleTttEnd(win);
      return;
    }

    setIsXNext(false);
    setTttDialogue("Hmm... sochne do, Liza kahan move karegi... 🤔");

    // Liza AI turn
    setTimeout(() => {
      const emptyIndices = newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
      if (emptyIndices.length > 0) {
        // Smart move or random
        const chosenIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        newBoard[chosenIndex] = 'O';
        setBoard(newBoard);

        const lizaWin = checkWinner(newBoard);
        if (lizaWin) {
          handleTttEnd(lizaWin);
        } else {
          setIsXNext(true);
          setTttDialogue("Aapki turn hai Rawat! Dekhte hain kaun line complete karega! ✨");
        }
      }
    }, 450);
  };

  const handleTttEnd = (winner: string) => {
    setTttWinner(winner);
    if (winner === 'X') {
      setTttScore(prev => ({ ...prev, rawat: prev.rawat + 1 }));
      const d = "Yay Rawat! 3 Hearts connect ho gaye! You won! 🎉💖";
      setTttDialogue(d);
      if (onLizaDialogue) onLizaDialogue(d);
    } else if (winner === 'O') {
      setTttScore(prev => ({ ...prev, liza: prev.liza + 1 }));
      const d = "Liza's Stars won! Hehe, good try Rawat! Ek aur match? 😉⭐";
      setTttDialogue(d);
      if (onLizaDialogue) onLizaDialogue(d);
    } else {
      setTttScore(prev => ({ ...prev, ties: prev.ties + 1 }));
      const d = "It's a Tie! Hamari strategy ekdum barabar thi! 🤝";
      setTttDialogue(d);
      if (onLizaDialogue) onLizaDialogue(d);
    }
  };

  const handleResetTtt = () => {
    playClickSound?.();
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setTttWinner(null);
    setTttDialogue("New match started! Aapki pehli turn hai Rawat!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#0b0818] border border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.25)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-purple-950/40 via-indigo-900/20 to-pink-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-sans-body text-white">Liza Arcade & Mini-Games</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-spec font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  COUPLE ARCADE
                </span>
              </div>
              <p className="text-xs text-purple-300/70 font-mono-spec">Playful Challenges & Classic Duels with Liza</p>
            </div>
          </div>

          <button
            onClick={() => { playClickSound?.(); onClose(); }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-black/40 px-5 pt-3 gap-2">
          <button
            onClick={() => { playClickSound?.(); setActiveTab('truth_or_dare'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono-spec font-bold transition-all border-b-2 ${
              activeTab === 'truth_or_dare'
                ? 'border-pink-500 text-pink-300 bg-pink-500/10 rounded-t-xl'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Truth or Dare / WYR
          </button>
          <button
            onClick={() => { playClickSound?.(); setActiveTab('rps'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono-spec font-bold transition-all border-b-2 ${
              activeTab === 'rps'
                ? 'border-purple-500 text-purple-300 bg-purple-500/10 rounded-t-xl'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <span>✊✋✌️</span>
            Rock Paper Scissors
          </button>
          <button
            onClick={() => { playClickSound?.(); setActiveTab('tic_tac_toe'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono-spec font-bold transition-all border-b-2 ${
              activeTab === 'tic_tac_toe'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 rounded-t-xl'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Tic-Tac-Toe (XO)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 no-scrollbar space-y-6">
          
          {/* TAB 1: TRUTH OR DARE */}
          {activeTab === 'truth_or_dare' && (
            <div className="space-y-5">
              
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2">
                {(['all', 'truth', 'dare', 'wyr'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      playClickSound?.();
                      setPromptFilter(filter);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-mono-spec font-bold capitalize transition-all ${
                      promptFilter === filter
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {filter === 'wyr' ? 'Would You Rather' : filter}
                  </button>
                ))}
              </div>

              {/* Prompt Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-black/80 border border-pink-500/30 relative overflow-hidden shadow-2xl text-center space-y-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono-spec font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase tracking-widest">
                  {currentPrompt.type.toUpperCase()} • {currentPrompt.category}
                </span>

                <h3 className="text-base sm:text-xl font-bold text-white font-sans-body leading-relaxed max-w-xl mx-auto">
                  "{currentPrompt.question}"
                </h3>

                {/* Liza's Response Section */}
                <div className="p-4 rounded-2xl bg-black/60 border border-pink-500/20 max-w-md mx-auto space-y-1 text-left">
                  <div className="flex items-center gap-2 text-pink-300 font-bold text-xs font-mono-spec">
                    <Heart className="w-3.5 h-3.5 fill-pink-500" /> Liza's Reaction:
                  </div>
                  <p className="text-sm text-white/90 font-sans-body italic">
                    "{currentPrompt.lizaResponse}"
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleNextPrompt}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold font-mono-spec tracking-wider uppercase shadow-[0_0_20px_rgba(236,72,153,0.4)] flex items-center gap-2 transition-all"
                  >
                    <Shuffle className="w-4 h-4" /> Next Question / Dare
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ROCK PAPER SCISSORS */}
          {activeTab === 'rps' && (
            <div className="space-y-5 text-center">
              
              {/* Scoreboard */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                  <p className="text-[10px] text-white/50 font-mono-spec uppercase">Rawat Wins</p>
                  <p className="text-xl font-bold text-emerald-400 font-mono-spec">{rpsScore.rawat}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                  <p className="text-[10px] text-white/50 font-mono-spec uppercase">Ties</p>
                  <p className="text-xl font-bold text-yellow-400 font-mono-spec">{rpsScore.ties}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                  <p className="text-[10px] text-white/50 font-mono-spec uppercase">Liza Wins</p>
                  <p className="text-xl font-bold text-pink-400 font-mono-spec">{rpsScore.liza}</p>
                </div>
              </div>

              {/* Live Match Arena */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-black to-indigo-950/30 border border-purple-500/30 space-y-4">
                
                <div className="flex items-center justify-around">
                  {/* User Side */}
                  <div className="space-y-2">
                    <p className="text-xs text-white/60 font-mono-spec">Rawat</p>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center text-4xl shadow-inner">
                      {userRpsChoice === 'rock' ? '✊' : userRpsChoice === 'paper' ? '✋' : userRpsChoice === 'scissors' ? '✌️' : '❓'}
                    </div>
                  </div>

                  <div className="text-lg font-bold font-mono-spec text-purple-400">VS</div>

                  {/* Liza Side */}
                  <div className="space-y-2">
                    <p className="text-xs text-pink-300 font-mono-spec">Liza</p>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-4xl shadow-inner">
                      {isRpsRolling ? (
                        <motion.span animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                          🎲
                        </motion.span>
                      ) : (
                        lizaRpsChoice === 'rock' ? '✊' : lizaRpsChoice === 'paper' ? '✋' : lizaRpsChoice === 'scissors' ? '✌️' : '❓'
                      )}
                    </div>
                  </div>
                </div>

                {/* Speech Bubble */}
                <div className="p-3 rounded-xl bg-black/60 border border-purple-500/20 max-w-sm mx-auto text-xs text-white font-sans-body italic">
                  "{rpsDialogue}"
                </div>

                {/* Choice Buttons */}
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => handlePlayRps('rock')}
                    className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400 text-sm font-bold font-mono-spec text-white flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <span className="text-xl">✊</span> Rock
                  </button>
                  <button
                    onClick={() => handlePlayRps('paper')}
                    className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400 text-sm font-bold font-mono-spec text-white flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <span className="text-xl">✋</span> Paper
                  </button>
                  <button
                    onClick={() => handlePlayRps('scissors')}
                    className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400 text-sm font-bold font-mono-spec text-white flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <span className="text-xl">✌️</span> Scissors
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: TIC TAC TOE */}
          {activeTab === 'tic_tac_toe' && (
            <div className="space-y-5 text-center">
              
              {/* Scoreboard */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                  <p className="text-[10px] text-white/50 font-mono-spec uppercase">Rawat (💖)</p>
                  <p className="text-xl font-bold text-pink-400 font-mono-spec">{tttScore.rawat}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                  <p className="text-[10px] text-white/50 font-mono-spec uppercase">Ties</p>
                  <p className="text-xl font-bold text-yellow-400 font-mono-spec">{tttScore.ties}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                  <p className="text-[10px] text-white/50 font-mono-spec uppercase">Liza (⭐)</p>
                  <p className="text-xl font-bold text-amber-400 font-mono-spec">{tttScore.liza}</p>
                </div>
              </div>

              {/* Liza Live Banter */}
              <div className="p-3 rounded-2xl bg-black/60 border border-indigo-500/30 max-w-md mx-auto text-xs text-indigo-200 font-sans-body italic">
                "{tttDialogue}"
              </div>

              {/* 3x3 Grid Board */}
              <div className="w-[270px] h-[270px] mx-auto grid grid-cols-3 gap-2.5 p-3 rounded-3xl bg-white/[0.02] border border-indigo-500/20 shadow-2xl">
                {board.map((cell, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCellClick(idx)}
                    disabled={!!cell || !!tttWinner || !isXNext}
                    className={`rounded-2xl border flex items-center justify-center text-3xl font-bold transition-all ${
                      cell === 'X'
                        ? 'bg-pink-500/20 border-pink-400 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                        : cell === 'O'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer'
                    }`}
                  >
                    {cell === 'X' ? '💖' : cell === 'O' ? '⭐' : ''}
                  </button>
                ))}
              </div>

              {/* Reset Game Button */}
              <button
                onClick={handleResetTtt}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono-spec text-white/80 hover:text-white flex items-center gap-1.5 mx-auto transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restart Match
              </button>

            </div>
          )}

        </div>

      </motion.div>
    </div>
  );
};
