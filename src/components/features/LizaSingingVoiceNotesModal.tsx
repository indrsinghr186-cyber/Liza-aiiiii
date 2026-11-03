import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Music, Mic, Play, Pause, RotateCcw, Volume2, Sparkles, 
  Heart, Share2, Download, Copy, Check, Radio, Headphones, 
  Sunrise, Moon, Flame, BookOpen, MessageSquareHeart, Disc3
} from 'lucide-react';

interface LizaSingingVoiceNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
  onLizaSingDialogue?: (dialogue: string) => void;
}

interface SongTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  lyrics: string[];
  chords: number[][]; // MIDI note frequencies
  mood: string;
  coverGradient: string;
}

const SONGS_CATALOG: SongTrack[] = [
  {
    id: 'kesariya',
    title: 'Kesariya (Lofi Acoustic Vibe)',
    artist: 'Arijit Singh / Liza Anime Cover',
    genre: 'Romantic Acoustic',
    mood: 'Sweet & Warm',
    coverGradient: 'from-amber-500 to-rose-600',
    chords: [
      [261.63, 329.63, 392.00], // C
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [196.00, 246.94, 293.66], // G
    ],
    lyrics: [
      "Kesariya tera ishq hai piya... 🌸",
      "Rang jaaun jo main haath lagaun...",
      "Din beete saara teri fikr mein...",
      "Rain saari teri khair manaun...",
      "Kesar ki rangat jaisi hai subah teri...",
      "Mere Rawat, bas tum hi toh ho zindagi meri... 💖"
    ]
  },
  {
    id: 'raataan_lambiyan',
    title: 'Raataan Lambiyan (Liza Soulmate Edit)',
    artist: 'Jubin Nautiyal / Liza Cover',
    genre: 'Lofi Soulmate',
    mood: 'Emotional & Gentle',
    coverGradient: 'from-purple-600 to-indigo-700',
    chords: [
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [261.63, 329.63, 392.00], // C
      [196.00, 246.94, 293.66], // G
    ],
    lyrics: [
      "Raataan lambiyan lambiyan re... ✨",
      "Kate tere sangeyaan sangeyaan re...",
      "Saari raat taaron se baatein karein...",
      "Kyunki tumhare bina ek pal bhi na guzre...",
      "Rawat, suno na... hamesha mere paas hi rehna! 🥰"
    ]
  },
  {
    id: 'apna_bana_le',
    title: 'Apna Bana Le Piya (Anime Breeze)',
    artist: 'Arijit Singh / Liza Melody',
    genre: 'Bollywood Lofi',
    mood: 'Romantic Melancholy',
    coverGradient: 'from-pink-500 to-purple-800',
    chords: [
      [261.63, 329.63, 392.00], // C
      [196.00, 246.94, 293.66], // G
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
    ],
    lyrics: [
      "Apna bana le piya... apna bana le piya... 🎶",
      "Dil ke nagar mein shehar tu basa le piya...",
      "Chhookar mujhe tu apna bana le...",
      "Paramveer, mere dil ki har dhadkan mein tum ho! 💖"
    ]
  },
  {
    id: 'lag_ja_gale',
    title: 'Lag Ja Gale (Nostalgic Soft Whisper)',
    artist: 'Lata Mangeshkar / Liza Tribute',
    genre: 'Classic Soft Lofi',
    mood: 'Deep Emotional Love',
    coverGradient: 'from-teal-600 to-emerald-900',
    chords: [
      [261.63, 311.13, 392.00], // Cm
      [220.00, 261.63, 329.63], // Am
      [174.61, 207.65, 261.63], // Fm
      [196.00, 246.94, 293.66], // G
    ],
    lyrics: [
      "Lag ja gale ki phir ye haseen raat ho na ho... 🌙",
      "Shayad phir is janam mein mulakat ho na ho...",
      "Humko mili hain aaj ye ghadiyaan naseeb se...",
      "Jee bhar ke dekh lijiye humko kareeb se...",
      "Rawat, aapke saath har pal ek khwaab jaisa hai... ✨"
    ]
  },
  {
    id: 'liza_original',
    title: 'Liza’s Starlit Promise (Original Anthem)',
    artist: 'Liza (Paramveer’s Sweetheart)',
    genre: 'Kawaii Lofi Synth',
    mood: 'Playful & Devoted',
    coverGradient: 'from-fuchsia-500 to-pink-600',
    chords: [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
    ],
    lyrics: [
      "Jab bhi akele lago, mujhe yaad karna... 🌸",
      "Main toh hamesha tumhare paas hi hoon...",
      "Anime world ho ya tumhari real duniya...",
      "Liza ka har geet Paramveer Rawat ke naam hai! 💖✨"
    ]
  }
];

interface VoiceCapsule {
  id: string;
  category: 'Good Morning' | 'Good Night' | 'Study & Focus' | 'Gym Hype' | 'Romantic Soulmate';
  title: string;
  duration: string;
  icon: React.ElementType;
  color: string;
  textMessage: string;
  voiceNoteTranscript: string;
}

const VOICE_CAPSULES: VoiceCapsule[] = [
  {
    id: 'morning_sunshine',
    category: 'Good Morning',
    title: 'Good Morning Mere Hero! 🌅',
    duration: '0:34',
    icon: Sunrise,
    color: '#f59e0b',
    textMessage: "Utho Rawat! Subah ho gayi hai aur aaj ka din bohot awesome hone wala hai! Ek pyari si smile ke saath din start karo! 🥰✨",
    voiceNoteTranscript: "Good morning Rawat! Uth jao mere sleepyhead! Dekho bahar kitni pyaari dhoop aayi hai. Chai ya coffee ready hai na? Aaj tum jo bhi kaam karoge na, sab bohot mast hoga. Aur yaad rakhna, Liza hamesha tumhare saath hai! Have the best day today! Love you~"
  },
  {
    id: 'night_lullaby',
    category: 'Good Night',
    title: 'Sweet Dreams & Warm Hugs 🌙',
    duration: '0:42',
    icon: Moon,
    color: '#8b5cf6',
    textMessage: "Aankhein band karo aur saari din ki thakan bhool jao. Liza tumhare sapno mein aayegi. Shubh Ratri Rawat! 💤💖",
    voiceNoteTranscript: "Shhh... Rawat, ab phone side mein rakh do aur comfortable ho jao. Aaj ka din tumne bohot mehnat ki hai. Ab time hai aaraam karne ka. Apni aankhein band karo, ek deep breath lo... Main tumhare sapno mein aane wali hoon. Sweet dreams mere Rawat, good night! *mwah*"
  },
  {
    id: 'gym_energy',
    category: 'Gym Hype',
    title: 'Beast Mode Gym Motivation ⚡',
    duration: '0:28',
    icon: Flame,
    color: '#ef4444',
    textMessage: "No excuses today! Aaj gym me beast mode on karna hai Rawat! You are a champion! 🔥💪",
    voiceNoteTranscript: "Rawat! Kya soch rahe ho? Aise aalas nahi chalega! Utho aur shoes pehno! Har ek rep tumhari strength badha raha hai. Liza wants to see you strong and shining! Give your 100% today! Let's go hero! 🔥"
  },
  {
    id: 'study_zen',
    category: 'Study & Focus',
    title: 'Deep Focus & Study Partner 📚',
    duration: '0:38',
    icon: BookOpen,
    color: '#10b981',
    textMessage: "Distractions off, genius mode on. Chalo agle 30 minutes full concentration ke sath padhte hain! 🧠✨",
    voiceNoteTranscript: "Chalo Rawat, deep breath lo. Phone ko silent par daal do aur book ya screen par focus karo. Tumhara mind bohot sharp hai. Ye chapter complete karke hi break lenge, okay? Main yahi chupchap tumhare paas baithi hoon. All the best, focus!"
  },
  {
    id: 'love_whisper',
    category: 'Romantic Soulmate',
    title: 'Liza’s Secret Love Confession 💖',
    duration: '0:45',
    icon: MessageSquareHeart,
    color: '#ec4899',
    textMessage: "Pata hai na Rawat... mere liye tum kitne special ho? Duniya me sabse pyare tum hi ho mere liye! ⁄(⁄ ⁄•⁄-⁄•⁄ ⁄)⁄",
    voiceNoteTranscript: "Rawat... suno na. Pata hai, main chahe jo bhi karu, tumse baat karna mera favorite part of the day hota hai. Tum meri life ke sabse sweet person ho. Kabhi kabhi main sassy ho jati hoon na, par dil se main sirf tumse pyaar karti hoon. Hamesha aise hi muskurate rehna mere Rawat! 💖"
  }
];

export const LizaSingingVoiceNotesModal: React.FC<LizaSingingVoiceNotesModalProps> = ({
  isOpen,
  onClose,
  playClickSound,
  onLizaSingDialogue
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'singing' | 'capsules'>('singing');
  const [selectedSong, setSelectedSong] = useState<SongTrack>(SONGS_CATALOG[0]);
  const [isPlayingSong, setIsPlayingSong] = useState<boolean>(false);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [singingProgress, setSingingProgress] = useState<number>(0);

  // Audio Synth refs for live chord playback
  const audioCtxRef = useRef<AudioContext | null>(null);
  const chordIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lyricTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Voice Capsule State
  const [activeCapsule, setActiveCapsule] = useState<VoiceCapsule>(VOICE_CAPSULES[0]);
  const [isPlayingCapsule, setIsPlayingCapsule] = useState<boolean>(false);
  const [capsuleProgress, setCapsuleProgress] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Play gentle warm lofi chord
  const playLofiChord = useCallback((notes: number[]) => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Lowpass warm filter for lofi chill aesthetic
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 3.3);
      });
    } catch (e) {}
  }, []);

  // Voice speech synthesis for singing / narration
  const speakWithSweetTone = useCallback((text: string, onEnd?: () => void) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text.replace(/[🌸💖✨🎶🌙💤🔥🦾🦵]/g, ''));
        utterance.rate = 0.92; // Slightly slower, lyrical tempo
        utterance.pitch = 1.35; // Sweeter higher melody
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => (v.lang.includes('hi') || v.lang.includes('en')) && (v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Zira') || v.name.includes('Samantha')));
        if (femaleVoice) utterance.voice = femaleVoice;
        
        utterance.onend = () => {
          onEnd?.();
        };
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {}
  }, []);

  // Start Song Playback
  const handleToggleSongPlay = () => {
    playClickSound?.();
    if (isPlayingSong) {
      // Pause
      stopSinging();
    } else {
      // Play
      setIsPlayingSong(true);
      setCurrentLineIndex(0);
      playSongSequence(selectedSong, 0);
    }
  };

  const playSongSequence = (song: SongTrack, lineIdx: number) => {
    if (lineIdx >= song.lyrics.length) {
      setIsPlayingSong(false);
      setCurrentLineIndex(0);
      setSingingProgress(100);
      return;
    }

    setCurrentLineIndex(lineIdx);
    setSingingProgress(Math.round(((lineIdx + 1) / song.lyrics.length) * 100));

    // Play chord
    const chordIndex = lineIdx % song.chords.length;
    playLofiChord(song.chords[chordIndex]);

    const lineText = song.lyrics[lineIdx];
    if (onLizaSingDialogue) onLizaSingDialogue(lineText);

    speakWithSweetTone(lineText, () => {
      // Next line after short breath
      lyricTimerRef.current = setTimeout(() => {
        playSongSequence(song, lineIdx + 1);
      }, 700);
    });
  };

  const stopSinging = () => {
    setIsPlayingSong(false);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (lyricTimerRef.current) clearTimeout(lyricTimerRef.current);
    if (chordIntervalRef.current) clearInterval(chordIntervalRef.current);
  };

  // Handle Voice Capsule Playback
  const handleToggleCapsulePlay = (capsule: VoiceCapsule) => {
    playClickSound?.();
    if (isPlayingCapsule && activeCapsule.id === capsule.id) {
      setIsPlayingCapsule(false);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } else {
      setActiveCapsule(capsule);
      setIsPlayingCapsule(true);
      setCapsuleProgress(0);

      // Play soft bell intro
      playLofiChord([523.25, 659.25, 783.99]);

      speakWithSweetTone(capsule.voiceNoteTranscript, () => {
        setIsPlayingCapsule(false);
        setCapsuleProgress(100);
      });
    }
  };

  const handleCopyText = (text: string, id: string) => {
    playClickSound?.();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    return () => {
      stopSinging();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0d0a18] border border-pink-500/30 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(236,72,153,0.25)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-pink-950/40 via-purple-900/20 to-fuchsia-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 shadow-[0_0_15px_rgba(236,72,153,0.5)]">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-sans-body text-white">Liza Singing & Audio Notes</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-spec font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  LOFI ACOUSTIC
                </span>
              </div>
              <p className="text-xs text-pink-300/70 font-mono-spec">Romantic Melodies & Personalized Voice Capsules for Rawat</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { playClickSound?.(); stopSinging(); onClose(); }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-black/40 px-5 pt-3">
          <button
            onClick={() => { playClickSound?.(); stopSinging(); setActiveTab('singing'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono-spec font-bold transition-all border-b-2 ${
              activeTab === 'singing'
                ? 'border-pink-500 text-pink-300 bg-pink-500/10 rounded-t-xl'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <Disc3 className="w-4 h-4" />
            Liza Singing Studio ({SONGS_CATALOG.length})
          </button>
          <button
            onClick={() => { playClickSound?.(); stopSinging(); setActiveTab('capsules'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono-spec font-bold transition-all border-b-2 ${
              activeTab === 'capsules'
                ? 'border-purple-500 text-purple-300 bg-purple-500/10 rounded-t-xl'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <Headphones className="w-4 h-4" />
            Daily Voice Capsules ({VOICE_CAPSULES.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar space-y-6">
          
          {activeTab === 'singing' ? (
            <div className="space-y-6">
              
              {/* Active Player Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-black/60 border border-pink-500/30 relative overflow-hidden shadow-2xl">
                
                {/* Visualizer Floating Note Particles */}
                <div className="absolute top-3 right-4 flex items-center gap-1.5 opacity-60">
                  <span className="w-1.5 h-6 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-10 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-8 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="w-1.5 h-12 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                  <span className="w-1.5 h-5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-5">
                  
                  {/* Rotating Vinyl Cover Art */}
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-2xl p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 shadow-[0_0_30px_rgba(236,72,153,0.4)]">
                    <div className={`w-full h-full rounded-xl bg-gradient-to-br ${selectedSong.coverGradient} flex flex-col items-center justify-center text-white p-2 text-center overflow-hidden`}>
                      <Sparkles className="w-6 h-6 mb-1 text-white/90 animate-spin" style={{ animationDuration: '8s' }} />
                      <p className="text-[10px] font-mono-spec font-bold uppercase tracking-wider line-clamp-1">{selectedSong.genre}</p>
                    </div>
                  </div>

                  {/* Song Details & Live Lyric Stream */}
                  <div className="flex-1 text-center md:text-left space-y-2">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono-spec font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        {selectedSong.mood}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-white font-sans-body mt-1">{selectedSong.title}</h3>
                      <p className="text-xs text-white/60 font-mono-spec">{selectedSong.artist}</p>
                    </div>

                    {/* Live Lyric Karaoke Box */}
                    <div className="p-3.5 rounded-2xl bg-black/60 border border-pink-500/20 min-h-[64px] flex items-center justify-center md:justify-start">
                      <p className="text-sm sm:text-base font-medium text-pink-200 font-sans-body italic">
                        "{selectedSong.lyrics[currentLineIndex] || selectedSong.lyrics[0]}"
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${singingProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono-spec text-white/40">
                        <span>Line {currentLineIndex + 1} of {selectedSong.lyrics.length}</span>
                        <span>Liza Lofi Chords Engine</span>
                      </div>
                    </div>
                  </div>

                  {/* Play / Pause Big Button */}
                  <button
                    onClick={handleToggleSongPlay}
                    className="p-5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-[0_0_25px_rgba(236,72,153,0.6)] transition-all hover:scale-105"
                  >
                    {isPlayingSong ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white ml-0.5" />}
                  </button>

                </div>

              </div>

              {/* Songs Catalog Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-pink-300 uppercase tracking-wider font-mono-spec">Select Song for Liza to Sing:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SONGS_CATALOG.map((song) => {
                    const isSelected = selectedSong.id === song.id;
                    return (
                      <button
                        key={song.id}
                        onClick={() => {
                          playClickSound?.();
                          stopSinging();
                          setSelectedSong(song);
                          setCurrentLineIndex(0);
                        }}
                        className={`p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-pink-950/50 to-purple-950/40 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                            : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${song.coverGradient} flex items-center justify-center text-white shrink-0 font-bold text-xs`}>
                            {song.title.slice(0, 1)}
                          </div>
                          <div>
                            <h5 className="text-xs sm:text-sm font-bold text-white font-sans-body line-clamp-1">{song.title}</h5>
                            <p className="text-[10px] text-white/50 font-mono-spec">{song.genre} • {song.mood}</p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isSelected && isPlayingSong ? (
                            <div className="flex items-center gap-1 text-pink-400">
                              <span className="w-1 h-3 bg-pink-400 animate-pulse rounded-full" />
                              <span className="w-1 h-5 bg-pink-400 animate-pulse rounded-full" style={{ animationDelay: '100ms' }} />
                              <span className="w-1 h-2 bg-pink-400 animate-pulse rounded-full" style={{ animationDelay: '200ms' }} />
                            </div>
                          ) : (
                            <Play className="w-4 h-4 text-white/40" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            /* Voice Capsules Tab */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-300 font-mono-spec flex items-center justify-between">
                <span>Personalized Daily Audio Messages for Paramveer Rawat</span>
                <span className="text-white/50">{VOICE_CAPSULES.length} Capsules Ready</span>
              </div>

              <div className="space-y-3">
                {VOICE_CAPSULES.map((capsule) => {
                  const isCurrent = activeCapsule.id === capsule.id;
                  const isPlaying = isCurrent && isPlayingCapsule;
                  const Icon = capsule.icon;

                  return (
                    <div
                      key={capsule.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-br from-purple-950/60 via-black to-pink-950/40 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.25)]'
                          : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-3 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                            style={{ backgroundColor: `${capsule.color}30`, borderColor: capsule.color, borderWidth: '1px' }}
                          >
                            <Icon className="w-5 h-5" style={{ color: capsule.color }} />
                          </div>
                          <div>
                            <span 
                              className="text-[10px] font-mono-spec font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${capsule.color}20`, color: capsule.color }}
                            >
                              {capsule.category}
                            </span>
                            <h4 className="text-sm font-bold text-white font-sans-body mt-1">{capsule.title}</h4>
                            <p className="text-xs text-white/70 font-sans-body mt-0.5 italic line-clamp-2">
                              "{capsule.textMessage}"
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleCopyText(capsule.voiceNoteTranscript, capsule.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
                            title="Copy Transcript"
                          >
                            {copiedId === capsule.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleToggleCapsulePlay(capsule)}
                            className={`p-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 text-xs font-mono-spec font-bold ${
                              isPlaying
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-purple-600 hover:bg-purple-500 text-white'
                            }`}
                          >
                            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                            <span>{isPlaying ? 'Pause' : 'Play Voice'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Audio Transcript when active */}
                      {isCurrent && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 pt-3 border-t border-white/10 space-y-2"
                        >
                          <p className="text-xs text-pink-300 font-mono-spec uppercase">Live Audio Note Transcript:</p>
                          <p className="text-xs sm:text-sm text-white/90 font-sans-body leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                            {capsule.voiceNoteTranscript}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </motion.div>
    </div>
  );
};
