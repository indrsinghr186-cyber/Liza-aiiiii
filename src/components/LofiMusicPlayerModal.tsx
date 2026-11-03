import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, X, Play, Pause, SkipForward, SkipBack, 
  Volume2, VolumeX, Sparkles, Disc, Radio, Heart, ListMusic
} from 'lucide-react';
import { LizaMood } from '../services/moodExpressionEngine';

interface Track {
  id: string;
  title: string;
  artist: string;
  moodTheme: LizaMood;
  audioUrl: string;
  coverColor: string;
  tag: string;
}

const LOFI_PLAYLIST: Track[] = [
  {
    id: 'track_1',
    title: 'Beautiful Dream & Lo-Fi Chill',
    artist: 'LIZA Ambient Studio',
    moodTheme: 'CALM',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3',
    coverColor: 'from-purple-600 to-indigo-900',
    tag: '🌸 Relax & Study'
  },
  {
    id: 'track_2',
    title: 'Dreaming Big (Anime Sweetheart)',
    artist: 'Paramveer & Liza Vibe',
    moodTheme: 'HAPPY',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3',
    coverColor: 'from-fuchsia-600 to-pink-900',
    tag: '💖 Romantic & Sweet'
  },
  {
    id: 'track_3',
    title: 'Cyberpunk Synthwave Pulse',
    artist: 'Neo Tokyo Grid',
    moodTheme: 'EXCITED',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    coverColor: 'from-cyan-600 to-blue-950',
    tag: '⚡ High Energy Beats'
  },
  {
    id: 'track_4',
    title: 'Serene View & Rainy Piano',
    artist: 'Late Night Thoughts',
    moodTheme: 'CARING',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    coverColor: 'from-emerald-600 to-teal-950',
    tag: '🌧️ Cozy Rainy Day'
  },
  {
    id: 'track_5',
    title: 'Sun and Reach Melodies',
    artist: 'Sunrise Cafe',
    moodTheme: 'SHY',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-sun-and-reach-47.mp3',
    coverColor: 'from-amber-500 to-orange-950',
    tag: '☕ Lo-Fi Cafe'
  }
];

interface LofiMusicPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMoodTheme?: (mood: LizaMood) => void;
  playClickSound?: () => void;
}

export const LofiMusicPlayerModal: React.FC<LofiMusicPlayerModalProps> = ({
  isOpen,
  onClose,
  onSelectMoodTheme,
  playClickSound
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = LOFI_PLAYLIST[currentTrackIndex];

  // Initialize or handle audio track change
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.audioUrl);
      audioRef.current.loop = true;
    } else {
      audioRef.current.src = currentTrack.audioUrl;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.warn('Audio play prevented:', e));
      }
    }

    const audio = audioRef.current;
    const updateTime = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Clean up audio playback on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = '';
        } catch (e) {}
      }
    };
  }, []);

  const togglePlay = () => {
    playClickSound?.();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        if (onSelectMoodTheme) {
          onSelectMoodTheme(currentTrack.moodTheme);
        }
      }).catch(e => console.warn('Playback error:', e));
    }
  };

  const nextTrack = () => {
    playClickSound?.();
    const nextIdx = (currentTrackIndex + 1) % LOFI_PLAYLIST.length;
    setCurrentTrackIndex(nextIdx);
    if (onSelectMoodTheme) {
      onSelectMoodTheme(LOFI_PLAYLIST[nextIdx].moodTheme);
    }
  };

  const prevTrack = () => {
    playClickSound?.();
    const prevIdx = (currentTrackIndex - 1 + LOFI_PLAYLIST.length) % LOFI_PLAYLIST.length;
    setCurrentTrackIndex(prevIdx);
    if (onSelectMoodTheme) {
      onSelectMoodTheme(LOFI_PLAYLIST[prevIdx].moodTheme);
    }
  };

  const selectTrack = (idx: number) => {
    playClickSound?.();
    setCurrentTrackIndex(idx);
    setIsPlaying(true);
    if (onSelectMoodTheme) {
      onSelectMoodTheme(LOFI_PLAYLIST[idx].moodTheme);
    }
    if (audioRef.current) {
      audioRef.current.src = LOFI_PLAYLIST[idx].audioUrl;
      audioRef.current.play().catch(e => console.warn(e));
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5"
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-[#09090d] border border-purple-500/40 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.3)] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-black/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-[#d946ef] border border-purple-500/30">
              <Music size={20} />
            </div>
            <div>
              <h3 className="font-mono-spec font-bold text-sm sm:text-base text-white uppercase tracking-wider flex items-center gap-2">
                LO-FI & BEATS PLAYER
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  WEB AUDIO
                </span>
              </h3>
              <p className="text-[11px] text-white/50 font-mono-spec">Background music & ambient vibes for Liza</p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound?.();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Track Display */}
        <div className="p-5 sm:p-6 flex flex-col items-center gap-4 bg-gradient-to-b from-purple-950/20 to-black">
          {/* Animated Vinyl Disc */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className={`w-full h-full rounded-full bg-gradient-to-br ${currentTrack.coverColor} p-2 shadow-[0_0_40px_rgba(217,70,239,0.3)] border-2 border-white/20 flex items-center justify-center`}
            >
              <div className="w-12 h-12 rounded-full bg-black/80 border border-white/30 flex items-center justify-center">
                <Disc className={`w-6 h-6 text-[#d946ef] ${isPlaying ? 'animate-pulse' : ''}`} />
              </div>
            </motion.div>
          </div>

          {/* Track Information */}
          <div className="text-center space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono-spec font-bold border border-purple-500/30">
              {currentTrack.tag}
            </span>
            <h4 className="font-mono-spec font-bold text-white text-base">{currentTrack.title}</h4>
            <p className="text-xs text-white/60 font-mono-spec">{currentTrack.artist}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full space-y-1">
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#d946ef] h-full transition-all shadow-[0_0_8px_#d946ef]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-5 my-1">
            <button
              onClick={prevTrack}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={togglePlay}
              className="p-4 rounded-2xl bg-[#d946ef] hover:bg-fuchsia-400 text-black shadow-[0_0_25px_rgba(217,70,239,0.5)] transition-all cursor-pointer active:scale-95"
            >
              {isPlaying ? <Pause size={22} className="fill-black" /> : <Play size={22} className="fill-black ml-0.5" />}
            </button>

            <button
              onClick={nextTrack}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-3 w-full max-w-xs text-white/60 text-xs font-mono-spec">
            <button onClick={() => setIsMuted(!isMuted)} className="cursor-pointer hover:text-white">
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="flex-1 accent-[#d946ef] cursor-pointer"
            />
            <span>{Math.round((isMuted ? 0 : volume) * 100)}%</span>
          </div>
        </div>

        {/* Playlist List */}
        <div className="p-4 border-t border-white/10 bg-black/90 max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin">
          <div className="text-[10px] font-mono-spec font-bold uppercase text-white/40 mb-2 flex items-center gap-1.5">
            <ListMusic size={12} />
            LO-FI AMBIENT STATIONS
          </div>

          {LOFI_PLAYLIST.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => selectTrack(idx)}
              className={`p-2.5 rounded-xl flex items-center justify-between text-xs font-mono-spec transition-all cursor-pointer border ${
                currentTrackIndex === idx
                  ? 'bg-purple-500/20 border-purple-500/50 text-white font-bold'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] text-white/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="text-[10px] text-[#d946ef]">{idx + 1}.</span>
                <span className="truncate">{track.title}</span>
              </div>
              <span className="text-[9px] text-purple-300 shrink-0">{track.tag}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
