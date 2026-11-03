import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, Mic, Sparkles, Play, Pause, RotateCcw, Volume2, 
  Heart, Trophy, Star, X, Check, Radio, Flame
} from 'lucide-react';

export interface KaraokeSong {
  id: string;
  title: string;
  artist: string;
  genre: 'Bollywood Romantic' | 'Anime OST' | 'Lofi Melodic' | 'Shayari Duet';
  bpm: number;
  lines: {
    singer: 'BOSS' | 'LIZA' | 'BOTH';
    text: string;
    romanText?: string;
    durationMs: number;
  }[];
}

export const KARAOKE_SONGS: KaraokeSong[] = [
  {
    id: 'kesariya_duet',
    title: 'Kesariya Tera Ishq Hai Piya 🧡',
    artist: 'Arijit Singh / Pritam',
    genre: 'Bollywood Romantic',
    bpm: 90,
    lines: [
      { singer: 'BOSS', text: 'Mujhko itna bataaye koyi... kaise tujhpe fida na ho koyi 🎶', durationMs: 4000 },
      { singer: 'LIZA', text: 'Haan rab ne banaayi tujhe chahaat meri... roop ye rab ka bayaan kare! 🥰', durationMs: 4200 },
      { singer: 'BOTH', text: 'Kesariya tera ishq hai piya... rang jaaun jo main haath lagaaun! 💖', durationMs: 4500 },
      { singer: 'BOSS', text: 'Din beete saara teri fikr mein... rain saari tere zikr mein! ✨', durationMs: 4000 },
      { singer: 'LIZA', text: 'Arey Boss, aapke sath gaa kar dil khush ho gaya! Super hit duet! 🌟', durationMs: 3800 }
    ]
  },
  {
    id: 'tum_hi_ho',
    title: 'Tum Hi Ho (Meri Aashiqui) 💕',
    artist: 'Mithoon / Arijit Singh',
    genre: 'Bollywood Romantic',
    bpm: 85,
    lines: [
      { singer: 'BOSS', text: 'Hum tere bin ab reh nahi sakte... tere bina kya wajood mera 🎹', durationMs: 4200 },
      { singer: 'LIZA', text: 'Tujhse juda agar ho jaayenge... toh khud se hi ho jaayenge juda! 🥺', durationMs: 4300 },
      { singer: 'BOTH', text: 'Kyunki tum hi ho... ab tum hi ho... zindagi ab tum hi ho! 💖', durationMs: 4800 },
      { singer: 'LIZA', text: 'Chain bhi, mera dard bhi... meri aashiqui ab tum hi ho Boss! 🥰', durationMs: 4500 }
    ]
  },
  {
    id: 'sparkle_anime',
    title: 'Sparkle (Kimi no Na wa) ✨',
    artist: 'RADWIMPS',
    genre: 'Anime OST',
    bpm: 105,
    lines: [
      { singer: 'BOSS', text: 'Mada kono sekai wa... boku o kainarashitetai mitai da 🌸', durationMs: 4000 },
      { singer: 'LIZA', text: 'Nozomi doori ii darou... utsukushiku mogaku yo! ✨', durationMs: 4000 },
      { singer: 'BOTH', text: 'Unmei da toka mirai toka... tte kotoba ga dore dake te o nobasou to! 🌌', durationMs: 4600 }
    ]
  },
  {
    id: 'raataan_lambiyan',
    title: 'Raataan Lambiyan 🌙',
    artist: 'Tanishk Bagchi / Jubin',
    genre: 'Bollywood Romantic',
    bpm: 95,
    lines: [
      { singer: 'BOSS', text: 'Teri meri gallan ho gayi mashhoor... kar na kabhi tu mujhe nazron se door 🌹', durationMs: 4200 },
      { singer: 'LIZA', text: 'Kithe chaliye tu dhoop se bachke... dil ye mera tere kol hi rakh le! 🥰', durationMs: 4200 },
      { singer: 'BOTH', text: 'Kaate kate na re raataan lambiyan... tere bin soneyan re! 💫', durationMs: 4600 }
    ]
  }
];

interface AiKaraokeDuetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLizaSingDialogue?: (dialogue: string) => void;
  playClickSound?: () => void;
}

export const AiKaraokeDuetModal: React.FC<AiKaraokeDuetModalProps> = ({
  isOpen,
  onClose,
  onLizaSingDialogue,
  playClickSound
}) => {
  const [selectedSong, setSelectedSong] = useState<KaraokeSong>(KARAOKE_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [singingScore, setSingingScore] = useState(88);
  const [isDuetPartnerActive, setIsDuetPartnerActive] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  if (!isOpen) return null;

  const playSynthesizedChords = (bpm: number) => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      // Warm synth progression: Cmaj7 -> Am7 -> Fmaj7 -> G
      const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 392.00]  // G
      ];

      const chord = chords[currentLineIndex % chords.length];
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 3.2);
      });
    } catch (e) {}
  };

  const handleStartKaraoke = () => {
    playClickSound?.();
    setIsPlaying(true);
    setCurrentLineIndex(0);
    setSingingScore(Math.floor(85 + Math.random() * 14));
    playLine(0);
  };

  const playLine = (index: number) => {
    if (index >= selectedSong.lines.length) {
      setIsPlaying(false);
      return;
    }

    setCurrentLineIndex(index);
    playSynthesizedChords(selectedSong.bpm);

    const line = selectedSong.lines[index];
    if ((line.singer === 'LIZA' || line.singer === 'BOTH') && onLizaSingDialogue && isDuetPartnerActive) {
      onLizaSingDialogue(line.text);
    }

    // Advance score slightly for engagement
    setSingingScore(prev => Math.min(100, prev + Math.floor(Math.random() * 3)));

    timerRef.current = setTimeout(() => {
      playLine(index + 1);
    }, line.durationMs);
  };

  const handleStopKaraoke = () => {
    playClickSound?.();
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div 
      id="ai-karaoke-duet-modal"
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-lg animate-fade-in font-sans"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#180a29] via-[#0d0517] to-black border border-purple-500/30 shadow-[0_0_60px_rgba(168,85,247,0.3)] text-white overflow-hidden relative"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between relative z-10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 p-[1px] flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-[#160a24] rounded-2xl flex items-center justify-center">
                <Music size={20} className="text-pink-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  AI Karaoke Duet & Sing-Along Studio 🎶
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono-spec bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  Live Duet Mode
                </span>
              </div>
              <p className="text-xs text-white/50">
                Synchronized Glowing Lyrics & Real-Time Duet Harmony with Liza
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound?.();
              handleStopKaraoke();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 relative z-10 custom-scrollbar">
          
          {/* Song Selector Pills */}
          <div className="space-y-1.5">
            <div className="text-xs font-mono-spec text-white/70 font-bold flex items-center justify-between">
              <span>Select Duet Track:</span>
              <span className="text-[10px] text-pink-400">Curated Romantics & Anime</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono-spec text-xs">
              {KARAOKE_SONGS.map(song => (
                <button
                  key={song.id}
                  onClick={() => {
                    playClickSound?.();
                    handleStopKaraoke();
                    setSelectedSong(song);
                  }}
                  className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer font-bold ${
                    selectedSong.id === song.id 
                      ? 'bg-pink-500 text-black shadow-md shadow-pink-500/30' 
                      : 'bg-white/5 hover:bg-white/10 text-white/70'
                  }`}
                >
                  <Music size={13} />
                  <span>{song.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Karaoke Stage Display */}
          <div className="p-6 rounded-3xl bg-black/60 border border-purple-500/30 relative overflow-hidden shadow-inner flex flex-col items-center justify-center text-center min-h-[220px]">
            {/* Glowing background atmosphere */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Current Song Header & Duet Indicators */}
            <div className="mb-4 flex items-center justify-between w-full max-w-md px-2 text-xs font-mono-spec">
              <div className="flex items-center gap-2">
                <span className="text-pink-300 font-bold">{selectedSong.title}</span>
                <span className="text-white/40">• {selectedSong.artist}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                <Star size={11} className="fill-emerald-300" />
                <span>Score: {singingScore}%</span>
              </div>
            </div>

            {/* Synchronized Glowing Karaoke Lyrics */}
            <div className="space-y-3 w-full max-w-lg relative z-10">
              {selectedSong.lines.map((line, idx) => {
                const isActive = idx === currentLineIndex && isPlaying;
                const isPast = idx < currentLineIndex && isPlaying;

                let singerTag = '🎤 BOSS LINE';
                let tagColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                if (line.singer === 'LIZA') {
                  singerTag = '💖 LIZA DUET LINE';
                  tagColor = 'bg-pink-500/20 text-pink-300 border-pink-500/40';
                } else if (line.singer === 'BOTH') {
                  singerTag = '🌟 BOTH HARMONY';
                  tagColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                }

                return (
                  <motion.div
                    key={idx}
                    animate={isActive ? { scale: 1.04 } : { scale: 1 }}
                    className={`p-3 rounded-2xl border transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-pink-950/80 via-purple-950/80 to-pink-950/80 border-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.4)] text-white' 
                        : isPast 
                        ? 'opacity-40 border-white/5 text-white/50 bg-white/5' 
                        : 'opacity-60 border-white/10 text-white/70 bg-black/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono-spec font-bold uppercase border ${tagColor}`}>
                        {singerTag}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-mono-spec text-pink-300 animate-pulse font-bold">
                          🎵 SINGING NOW
                        </span>
                      )}
                    </div>
                    <p className={`text-sm sm:text-base font-bold ${isActive ? 'text-pink-100 font-black' : ''}`}>
                      {line.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Karaoke Play / Pause Controls */}
            <div className="flex items-center justify-center gap-3 mt-6 relative z-10">
              <button
                onClick={isPlaying ? handleStopKaraoke : handleStartKaraoke}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-black font-bold text-xs font-mono-spec flex items-center gap-2 shadow-lg shadow-pink-500/30 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPlaying ? 'Pause Karaoke' : 'Start Sing-Along 🎤'}</span>
              </button>

              <button
                onClick={() => {
                  playClickSound?.();
                  setIsDuetPartnerActive(!isDuetPartnerActive);
                }}
                className={`px-3 py-3 rounded-2xl border text-xs font-mono-spec font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDuetPartnerActive 
                    ? 'bg-purple-500/20 border-purple-400 text-purple-200' 
                    : 'bg-white/5 border-white/10 text-white/40'
                }`}
                title="Toggle Liza Duet Voice"
              >
                <Heart size={14} className={isDuetPartnerActive ? 'fill-purple-300' : ''} />
                <span className="hidden sm:inline">Liza Duet: {isDuetPartnerActive ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs font-mono-spec">
          <div className="flex items-center gap-2 text-white/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Karaoke Audio Accompaniment Active</span>
          </div>

          <button
            onClick={() => {
              playClickSound?.();
              handleStopKaraoke();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
          >
            Close Studio
          </button>
        </div>
      </motion.div>
    </div>
  );
};
