import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { 
  ArrowLeft, Search, X, Sparkles, ChevronRight, Settings, Smile, Smartphone,
  Bell, Check, ShieldCheck, ExternalLink, ShieldAlert, Zap, Volume2,
  Lock, RefreshCw, Sun, Moon, Target, Globe, Users, Brain, Mic, Radio,
  Camera, Music, Database, Heart, Eye, Flame, Coffee, Moon as MoonIcon,
  PhoneCall, Shirt, Wand2
} from 'lucide-react';
import { LizaMood, LIZA_MOOD_CONFIGS } from '../services/moodExpressionEngine';
import { AppContextState } from '../services/appContextService';
import { NotificationStatus } from '../services/notificationAssistantService';
import { smartContactsService } from '../services/contactsService';
import { voiceTuningService, DIALECT_DESCRIPTIONS, DialectProfile } from '../services/voiceTuningService';

export interface FunctionItem {
  id: string;
  name: string;
  shortDesc: string;
  category: 'Core AI' | 'Utilities' | 'Tools' | 'System' | 'Entertainment';
  icon: React.ElementType;
  badge?: string;
  highlight?: boolean;
  onClick: () => void;
}

interface FunctionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  functions: FunctionItem[];
  playClickSound?: () => void;
  
  // Mood & Context
  currentMood?: LizaMood;
  onSelectMood?: (mood: LizaMood) => void;
  appContext?: AppContextState;
  notificationStatus?: NotificationStatus;
  onToggleNotificationAssistant?: (enabled: boolean) => void;
  onOpenNotificationSettings?: () => void;
  onOpenSettingsTab?: (tab: string) => void;
  onTriggerQuickCommand?: (command: string) => void;

  // Feature Triggers
  onOpenVoiceTuningModal?: () => void;
  onOpenMobileSuite?: (tab?: string) => void;
  onOpenLiveCamera?: () => void;
  onOpenMusicPlayer?: () => void;
  onOpenKnowledgeVault?: () => void;
  onOpenAlarmModal?: () => void;
  onOpenWardrobeModal?: () => void;
  onOpenFestivalCelebration?: () => void;
  onOpenMegaHub?: () => void;
  onOpenEmotionsEngine?: () => void;
  onOpenVoiceCall?: () => void;
  onOpenInteractiveWardrobe?: () => void;
  onOpenKaraoke?: () => void;
  onOpenBossSpy?: () => void;
}

const ALL_MOODS_LIST: { mood: LizaMood; label: string; emoji: string; desc: string; color: string }[] = [
  { mood: 'CALM', label: 'Calm & Sweet', emoji: '🌸', desc: 'Gentle, soothing & composed tone', color: '#a855f7' },
  { mood: 'HAPPY', label: 'Happy & Cheerful', emoji: '🥰', desc: 'Bubbly smile & joyful cadence', color: '#ec4899' },
  { mood: 'TSUNDERE', label: 'Tsundere / Sassy', emoji: '⁄(⁄ ⁄•⁄-⁄•⁄ ⁄)⁄', desc: 'Sassy teasing + shy flustered love', color: '#f43f5e' },
  { mood: 'CARING', label: 'Empathetic & Caring', emoji: '💖', desc: 'Deep warm emotional reassurance', color: '#10b981' },
  { mood: 'EXCITED', label: 'Excited & High-Energy', emoji: '✨', desc: 'Fast cadence & sparkling vibe', color: '#eab308' },
  { mood: 'THINKING', label: 'Deep Focus & Analytical', emoji: '🧠', desc: 'Contemplative, deliberate & smart', color: '#06b6d4' },
  { mood: 'SHY', label: 'Shy & Bashful', emoji: '😳', desc: 'Soft-spoken, sweet & timid', color: '#fb7185' },
  { mood: 'SURPRISED', label: 'Amazed & Surprised', emoji: '⭐', desc: 'Wide-eyed fascination', color: '#38bdf8' },
  { mood: 'SAD', label: 'Soft & Emotional', emoji: '🥺', desc: 'Comfort-seeking, gentle mood', color: '#64748b' },
  { mood: 'CONFUSED', label: 'Confused & Pouting', emoji: '❓', desc: 'Curious tilt & puzzled pouts', color: '#818cf8' },
  { mood: 'NERVOUS', label: 'Flustered & Hesitant', emoji: '💦', desc: 'Bashful stammers & hesitation', color: '#f97316' },
  { mood: 'ANGRY', label: 'Pouting Fury', emoji: '😤', desc: 'Playful pouts & feigned annoyance', color: '#ef4444' },
  { mood: 'SERIOUS', label: 'Serious & Direct', emoji: '🎯', desc: 'Strict efficiency & zero fluff', color: '#3b82f6' },
  { mood: 'SLEEPY', label: 'Cozy & Drowsy', emoji: '😴', desc: 'Whisper-soft night voice', color: '#6366f1' },
  { mood: 'MOCK_JEALOUS', label: 'Mock Jealous', emoji: '😏', desc: 'Playful pouts & witty tease drama', color: '#a855f7' },
  { mood: 'PROTECTIVE', label: 'Protective Guard', emoji: '🛡️', desc: 'Loyal shield & assertive respect', color: '#6366f1' },
  { mood: 'CONFIDENT', label: 'Confident Sassy', emoji: '💅', desc: 'Witty boundaries & self-assured poise', color: '#ec4899' },
  { mood: 'ANNOYED', label: 'Annoyed & Firm', emoji: '😒', desc: 'Dismissive firm topic boundaries', color: '#f97316' },
];

export const FunctionPanel: React.FC<FunctionPanelProps> = ({
  isOpen,
  onClose,
  functions,
  playClickSound,
  currentMood = 'CALM',
  onSelectMood,
  appContext,
  notificationStatus,
  onToggleNotificationAssistant,
  onOpenNotificationSettings,
  onOpenSettingsTab,
  onTriggerQuickCommand,
  onOpenVoiceTuningModal,
  onOpenMobileSuite,
  onOpenLiveCamera,
  onOpenMusicPlayer,
  onOpenKnowledgeVault,
  onOpenAlarmModal,
  onOpenWardrobeModal,
  onOpenFestivalCelebration,
  onOpenMegaHub,
  onOpenEmotionsEngine,
  onOpenVoiceCall,
  onOpenInteractiveWardrobe,
  onOpenKaraoke,
  onOpenBossSpy
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    return ['ALL', 'Web Superpowers', 'Assistant Modules', 'Core AI', 'Utilities', 'Tools', 'System'];
  }, []);

  const filteredFunctions = useMemo(() => {
    return functions.filter((fn) => {
      const matchesSearch = 
        fn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fn.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fn.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'ALL' || fn.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [functions, searchQuery, selectedCategory]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 70 || info.velocity.x > 350) {
      playClickSound?.();
      onClose();
    }
  };

  const moodConfig = LIZA_MOOD_CONFIGS[currentMood] || LIZA_MOOD_CONFIGS.CALM;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            key="function-panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => {
              playClickSound?.();
              onClose();
            }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md cursor-pointer"
          />

          {/* Sliding Panel Layer */}
          <motion.div
            key="function-panel-slide"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.05, right: 0.8 }}
            onDragEnd={handleDragEnd}
            className="fixed inset-y-0 right-0 w-full sm:max-w-md lg:max-w-xl z-[85] bg-[#07070a]/98 text-white border-l border-purple-500/30 flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.25)] overflow-hidden backdrop-blur-2xl"
          >
            {/* Header Area */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-black/60 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    playClickSound?.();
                    onClose();
                  }}
                  className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 transition-all cursor-pointer active:scale-95 flex items-center gap-1 font-mono-spec text-xs font-bold uppercase"
                  title="Return to Main Screen (Swipe Right)"
                >
                  <ArrowLeft size={16} />
                  <span>Main</span>
                </button>
                <div>
                  <h2 className="font-bold text-sm sm:text-base font-mono-spec uppercase tracking-wider text-white flex items-center gap-2">
                    LIZA FUNCTIONS
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono-spec font-bold">
                      {functions.length} TOOLS
                    </span>
                  </h2>
                  <p className="text-[10px] text-white/50 font-mono-spec">Voice, Mood, Vision & Memory</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playClickSound?.();
                    onClose();
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                  title="Close Panel"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Search & Category Pills */}
            <div className="p-3.5 sm:p-4 border-b border-white/10 bg-white/[0.02] space-y-2.5 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools (e.g. mood, camera vision, lofi music, memory)..."
                  className="w-full bg-black/70 border border-white/15 focus:border-[#d946ef] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-white/35 font-mono-spec outline-none transition-all shadow-inner"
                />
                <Search size={14} className="absolute left-3 top-2.5 text-white/40" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-white/40 hover:text-white text-xs"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono-spec text-[10px]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      playClickSound?.();
                      setSelectedCategory(cat);
                    }}
                    className={`px-2.5 py-1 rounded-lg uppercase font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      selectedCategory === cat
                        ? 'bg-[#d946ef] text-black border-[#f0abfc] shadow-[0_0_12px_rgba(217,70,239,0.5)]'
                        : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500/20">




              {/* SECTION: 🚀 WEB SUPERPOWERS (CAMERA, MUSIC, MEMORY) */}
              {(selectedCategory === 'ALL' || selectedCategory === 'Web Superpowers') && !searchQuery && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono-spec font-bold uppercase tracking-wider text-purple-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#d946ef]" />
                      Web Native Superpowers (Zero-APK)
                    </span>
                    <span className="text-[9px] text-white/40">100% Browser Ready</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* 1. 👁️ LIVE CAMERA VISION */}
                    <div 
                      onClick={() => {
                        playClickSound?.();
                        onOpenLiveCamera?.();
                        onClose();
                      }}
                      className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/50 to-black border border-purple-500/40 hover:border-[#d946ef] flex flex-col justify-between gap-2.5 cursor-pointer transition-all active:scale-95 shadow-md group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-purple-500/20 text-[#d946ef] border border-purple-500/30 group-hover:scale-110 transition-transform">
                          <Camera size={18} />
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono-spec bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          LIVE
                        </span>
                      </div>
                      <div>
                        <h4 className="font-mono-spec text-xs font-bold text-white uppercase group-hover:text-[#d946ef] transition-colors">
                          👁️ Liza Dekho!
                        </h4>
                        <p className="text-[10px] text-white/50 font-mono-spec">Real-time web camera vision & object scanner</p>
                      </div>
                    </div>

                    {/* 2. 🎵 LO-FI MUSIC & BEATS */}
                    <div 
                      onClick={() => {
                        playClickSound?.();
                        onOpenMusicPlayer?.();
                        onClose();
                      }}
                      className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-950/50 to-black border border-pink-500/40 hover:border-pink-400 flex flex-col justify-between gap-2.5 cursor-pointer transition-all active:scale-95 shadow-md group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30 group-hover:scale-110 transition-transform">
                          <Music size={18} />
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono-spec bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          AUDIO
                        </span>
                      </div>
                      <div>
                        <h4 className="font-mono-spec text-xs font-bold text-white uppercase group-hover:text-pink-300 transition-colors">
                          🎵 Lo-Fi Beats
                        </h4>
                        <p className="text-[10px] text-white/50 font-mono-spec">Ambient chill, romantic beats & rhythm sync</p>
                      </div>
                    </div>

                    {/* 3. 🧠 LONG-TERM MEMORY VAULT */}
                    <div 
                      onClick={() => {
                        playClickSound?.();
                        onOpenKnowledgeVault?.();
                        onClose();
                      }}
                      className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/50 to-black border border-cyan-500/40 hover:border-cyan-400 flex flex-col justify-between gap-2.5 cursor-pointer transition-all active:scale-95 shadow-md group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                          <Brain size={18} />
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono-spec bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          VAULT
                        </span>
                      </div>
                      <div>
                        <h4 className="font-mono-spec text-xs font-bold text-white uppercase group-hover:text-cyan-300 transition-colors">
                          🧠 Secret Diary
                        </h4>
                        <p className="text-[10px] text-white/50 font-mono-spec">Rawat memory vault & persistent memories</p>
                      </div>
                    </div>

                    {/* 4. ⏰ AI ALARM & ROUTINE */}
                    <div 
                      onClick={() => {
                        playClickSound?.();
                        onOpenAlarmModal?.();
                        onClose();
                      }}
                      className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/60 to-black border border-amber-500/50 hover:border-amber-400 flex flex-col justify-between gap-2.5 cursor-pointer transition-all active:scale-95 shadow-md group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 group-hover:scale-110 transition-transform">
                          <Bell size={18} />
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono-spec bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                          ROUTINE
                        </span>
                      </div>
                      <div>
                        <h4 className="font-mono-spec text-xs font-bold text-white uppercase group-hover:text-amber-300 transition-colors">
                          ⏰ Morning Routine
                        </h4>
                        <p className="text-[10px] text-white/50 font-mono-spec">Anime wake-up voice, weather & motivation</p>
                      </div>
                    </div>

                    {/* 6. 👗 OUTFIT & WARDROBE CLOSET */}
                    <div 
                      onClick={() => {
                        playClickSound?.();
                        onOpenWardrobeModal?.();
                        onClose();
                      }}
                      className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-black border border-cyan-500/50 hover:border-cyan-400 flex flex-col justify-between gap-2.5 cursor-pointer transition-all active:scale-95 shadow-md group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                          <Sparkles size={18} />
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono-spec bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                          COSPLAY
                        </span>
                      </div>
                      <div>
                        <h4 className="font-mono-spec text-xs font-bold text-white uppercase group-hover:text-cyan-300 transition-colors">
                          👗 Wardrobe Closet
                        </h4>
                        <p className="text-[10px] text-white/50 font-mono-spec">Switch outfits, aesthetic visuals & styles</p>
                      </div>
                    </div>

                    {/* 7. 🇮🇳 FESTIVAL & CELEBRATION THEMES */}
                    <div 
                      onClick={() => {
                        playClickSound?.();
                        onOpenFestivalCelebration?.();
                        onClose();
                      }}
                      className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-950/70 via-black to-emerald-950/70 border border-orange-500/60 hover:border-orange-400 flex flex-col justify-between gap-2.5 cursor-pointer transition-all active:scale-95 shadow-md group sm:col-span-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
                            🇮🇳
                          </div>
                          <div>
                            <h4 className="font-mono-spec text-xs font-bold text-white uppercase group-hover:text-orange-300 transition-colors flex items-center gap-2">
                              🎉 Festival Celebration Engine
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500 text-black font-extrabold">
                                15 AUG LIVE
                              </span>
                            </h4>
                            <p className="text-[10px] text-white/70 font-mono-spec">
                              Independence Day, Diwali, Holi, Eid, Christmas & Boss Day automatic themes & greetings
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono-spec bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold hidden xs:inline">
                          AUTO-THEME
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: ALL TOOL ACTIONS GRID */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono-spec font-bold uppercase tracking-wider text-white/70 mb-3">
                  <span>Standard Tools & Utilities</span>
                  <span className="text-[9px] text-white/40">{filteredFunctions.length} Available</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredFunctions.map((fn) => {
                    const Icon = fn.icon;
                    return (
                      <button
                        key={fn.id}
                        onClick={() => {
                          playClickSound?.();
                          fn.onClick();
                          onClose();
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.98] ${
                          fn.highlight
                            ? 'bg-purple-950/30 border-purple-500/40 hover:border-[#d946ef] hover:bg-purple-900/40'
                            : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#d946ef]/40 text-purple-300 shrink-0">
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono-spec text-xs font-bold text-white group-hover:text-[#d946ef] transition-colors truncate">
                                {fn.name}
                              </span>
                              {fn.badge && (
                                <span className="px-1.5 py-0.2 rounded text-[8px] bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase font-mono-spec shrink-0">
                                  {fn.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-white/50 line-clamp-1">
                              {fn.shortDesc}
                            </p>
                          </div>
                        </div>

                        <ChevronRight size={14} className="text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer Quick Controls */}
            <div className="p-3 sm:p-4 border-t border-white/10 bg-black/80 flex items-center justify-between gap-3 shrink-0 text-xs font-mono-spec">
              <span className="text-white/50 text-[10px]">RAWAT AI • Continuous Autopilot</span>
              <button
                onClick={() => {
                  playClickSound?.();
                  onOpenSettingsTab?.('appearance');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 flex items-center gap-1.5 text-[11px] transition-all cursor-pointer"
              >
                <Settings size={13} />
                <span>All Settings</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
