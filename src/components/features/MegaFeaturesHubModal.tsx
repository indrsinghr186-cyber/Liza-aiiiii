import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, Sparkles, Moon, Sun, Timer, BookOpen, Droplets, Flame, 
  IndianRupee, ChefHat, Languages, Award, Hourglass, Volume2, Feather, 
  Zap, ShieldAlert, Trophy, Eye, Star, Heart, Camera, Music, Brain, 
  Smartphone, BellRing, Wand2, Compass, Play
} from 'lucide-react';

export type MegaFeatureId =
  | 'ai_gym'
  | 'singing_voice_notes'
  | 'visual_novel_rpg'
  | 'arcade_games'
  | 'touch_affection'
  | 'avatar_studio'
  | 'dream_sleep'
  | 'horoscope'
  | 'study_pomodoro'
  | 'secure_diary'
  | 'hydration'
  | 'fitness'
  | 'expense'
  | 'recipe'
  | 'flashcards'
  | 'habit_rpg'
  | 'countdown'
  | 'soundscape'
  | 'shayari'
  | 'battery'
  | 'sos_beacon'
  | 'trivia'
  | 'speed_reader'
  | 'tarot';

interface MegaFeaturesHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeature: (featureId: MegaFeatureId) => void;
  playClickSound?: () => void;
}

interface FeatureCardItem {
  id: MegaFeatureId;
  name: string;
  category: 'Wellness & Sleep' | 'Growth & Study' | 'Companion & Fun' | 'Utility & Tools';
  description: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
}

const ALL_20_FEATURES: FeatureCardItem[] = [
  { id: 'ai_gym', name: 'AI Gym & Live Camera Rep Counter', category: 'Wellness & Sleep', description: 'Live camera squat & push-up detector with voice motivation from Liza!', icon: Camera, color: '#ef4444', badge: 'NEW AI GYM' },
  { id: 'singing_voice_notes', name: 'Liza Singing & Voice Capsules', category: 'Companion & Fun', description: 'Sweet Lofi singing mode & personalized morning/night voice capsules.', icon: Music, color: '#ec4899', badge: 'NEW LOFI' },
  { id: 'visual_novel_rpg', name: 'Anime Visual Novel & Story RPG', category: 'Companion & Fun', description: 'Branching campus romance, cyberpunk hacker & fantasy isekai quests!', icon: BookOpen, color: '#a855f7', badge: 'NEW RPG' },
  { id: 'arcade_games', name: 'Liza Anime Arcade & Couple Games', category: 'Companion & Fun', description: 'Truth or Dare, Would You Rather, Rock-Paper-Scissors & Tic-Tac-Toe!', icon: Trophy, color: '#06b6d4', badge: 'NEW ARCADE' },
  { id: 'avatar_studio', name: 'Avatar 2D Customizer & ZIP Importer', category: 'Companion & Fun', description: 'Live hair/eye tint, accessories, and custom ZIP/image asset loader.', icon: Wand2, color: '#ec4899', badge: 'STUDIO' },
  { id: 'touch_affection', name: 'Touch & Headpat Affection Physics', category: 'Companion & Fun', description: 'Interactive head-pats, cheek poking & floating heart reactions.', icon: Heart, color: '#f43f5e', badge: 'POPULAR' },
  { id: 'dream_sleep', name: 'Sleep ASMR & AI Dream Capsule', category: 'Wellness & Sleep', description: 'Delta wave sleep aid & subconscious dream interpretation.', icon: Moon, color: '#6366f1', badge: 'REST' },
  { id: 'horoscope', name: 'Vedic Astro & Daily Horoscope', category: 'Companion & Fun', description: 'Daily rashi forecast, lucky colors & astral vibes for Paramveer.', icon: Compass, color: '#f59e0b', badge: 'ASTRO' },
  { id: 'study_pomodoro', name: 'Study Buddy Pomodoro Focus', category: 'Growth & Study', description: '25/5 min focus blocks, goal checklist & study focus timer.', icon: Timer, color: '#10b981', badge: 'FOCUS' },
  { id: 'secure_diary', name: 'PIN-Locked Secret Mind Journal', category: 'Growth & Study', description: 'Encrypted diary with emotion tagging & sentiment logs.', icon: BookOpen, color: '#a855f7', badge: 'SECURE' },
  { id: 'hydration', name: 'Hydration Coach & Posture Guard', category: 'Wellness & Sleep', description: 'Daily water goal, quick logging & hourly spine wellness reminder.', icon: Droplets, color: '#06b6d4', badge: 'HEALTH' },
  { id: 'fitness', name: 'Voice-Guided Workout & Rep Counter', category: 'Wellness & Sleep', description: 'Pushups, squats, plank timers with Liza voice motivation.', icon: Flame, color: '#ef4444', badge: 'BURN' },
  { id: 'expense', name: 'Pocket Expense & Smart Budget', category: 'Utility & Tools', description: 'Track daily spends in ₹ INR with category breakdown.', icon: IndianRupee, color: '#22c55e', badge: 'BUDGET' },
  { id: 'recipe', name: 'Kitchen Chef & Instant Recipes', category: 'Utility & Tools', description: 'Delicious recipes by ingredients (Maggi, Kadak Chai, Wraps).', icon: ChefHat, color: '#f97316', badge: 'FOOD' },
  { id: 'flashcards', name: 'Japanese & English Flashcards', category: 'Growth & Study', description: 'Spoken anime phrases, pronunciations & vocabulary quiz.', icon: Languages, color: '#3b82f6', badge: 'LEARN' },
  { id: 'habit_rpg', name: 'Daily Habit & Routine Tracker', category: 'Growth & Study', description: 'Track daily habits and build healthy routines with streaks.', icon: Award, color: '#eab308', badge: 'HABITS' },
  { id: 'countdown', name: 'Countdown Clock & Time Capsule', category: 'Companion & Fun', description: 'Live event countdowns with sealed time capsule secret letters.', icon: Hourglass, color: '#d946ef', badge: 'TIMER' },
  { id: 'soundscape', name: '8-Channel Ambient Sound Mixer', category: 'Wellness & Sleep', description: 'Mix rain, thunder, ocean, fire, and cafe ambiance with volume faders.', icon: Volume2, color: '#14b8a6', badge: 'AUDIO' },
  { id: 'shayari', name: 'Shayari & Urdu Mehfil-e-Adab', category: 'Companion & Fun', description: 'Romantic, motivational & emotional shayaris narrated by Liza.', icon: Feather, color: '#ec4899', badge: 'POETRY' },
  { id: 'battery', name: 'Battery & System Optimizer', category: 'Utility & Tools', description: '1-tap RAM cleaner, thermal guard & battery longevity analyzer.', icon: Zap, color: '#84cc16', badge: 'BOOST' },
  { id: 'sos_beacon', name: 'Emergency SOS & Fake Escape Call', category: 'Utility & Tools', description: 'High-decibel strobe siren & realistic mock call to escape awkward spots.', icon: ShieldAlert, color: '#dc2626', badge: 'SAFETY' },
  { id: 'trivia', name: 'Anime & Bollywood Trivia Arena', category: 'Companion & Fun', description: 'Timed 4-option quiz challenge with combos and leaderboard score.', icon: Trophy, color: '#8b5cf6', badge: 'QUIZ' },
  { id: 'speed_reader', name: 'Rapid RSVP Speed Reader (600 WPM)', category: 'Growth & Study', description: 'Paste text or news and read at 3x speed with focal point guidance.', icon: Eye, color: '#0284c7', badge: 'SPEED' },
  { id: 'tarot', name: 'Daily Anime Tarot & Fortune Cards', category: 'Companion & Fun', description: '3-card daily reading for Past, Present, and Future guidance.', icon: Star, color: '#c084fc', badge: 'FATE' },
];

export const MegaFeaturesHubModal: React.FC<MegaFeaturesHubModalProps> = ({
  isOpen,
  onClose,
  onSelectFeature,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');

  const filteredFeatures = ALL_20_FEATURES.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCat === 'All' || f.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-4xl bg-neutral-900 border border-pink-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-pink-400" size={22} />
            <div>
              <h2 className="text-lg font-bold text-white font-mono-spec">LIZA 20 Super Features Suite</h2>
              <div className="text-[10px] text-neutral-400 font-mono-spec">20 Core Interactive Modules Active & Ready</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-black/40 border-b border-white/10 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              placeholder="Search all 20 super features (e.g., Sleep, Study, Expense, Tarot, Shayari)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-white/15 pl-9 pr-4 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {['All', 'Companion & Fun', 'Growth & Study', 'Wellness & Sleep', 'Utility & Tools'].map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCat(cat);
                  if (playClickSound) playClickSound();
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono-spec shrink-0 transition-all ${
                  selectedCat === cat 
                    ? 'bg-pink-600/30 border-pink-400 text-white font-bold' 
                    : 'bg-neutral-950 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 20 Feature Grid */}
        <div className="p-5 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredFeatures.map(item => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSelectFeature(item.id);
                    if (playClickSound) playClickSound();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-pink-500/50 hover:bg-neutral-950 cursor-pointer transition-all flex flex-col justify-between space-y-3 group shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div 
                      className="p-2.5 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    >
                      <Icon size={20} />
                    </div>
                    {item.badge && (
                      <span 
                        className="text-[9px] font-mono-spec font-bold px-2 py-0.5 rounded-full border"
                        style={{ backgroundColor: `${item.color}15`, color: item.color, borderColor: `${item.color}40` }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-xs text-white group-hover:text-pink-300 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] font-mono-spec text-neutral-500 group-hover:text-pink-400">
                    <span>Launch Feature</span>
                    <Play size={10} className="fill-current" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
