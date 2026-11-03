import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Sparkles, Volume2, Calendar, Check, Flame, Heart, 
  Crown, Play, Zap, Award, Flag, Music, RefreshCw, PowerOff,
  RotateCw, EyeOff, CheckCircle2, ShieldOff
} from 'lucide-react';
import { 
  festivalCelebrationService, 
  FESTIVAL_PRESETS, 
  FestivalThemeConfig, 
  FestivalCelebrationState 
} from '../services/festivalCelebrationService';

interface FestivalCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
  onTriggerLizaDialogue?: (dialogue: string) => void;
  showRotatingAura?: boolean;
  onToggleRotatingAura?: (enabled: boolean) => void;
}

export const FestivalCelebrationModal: React.FC<FestivalCelebrationModalProps> = ({
  isOpen,
  onClose,
  playClickSound,
  onTriggerLizaDialogue,
  showRotatingAura = false,
  onToggleRotatingAura
}) => {
  const [celebrationState, setCelebrationState] = useState<FestivalCelebrationState>(
    festivalCelebrationService.getState()
  );
  const [activeTab, setActiveTab] = useState<'all' | 'indian' | 'special'>('all');
  const [currentSampleDialogue, setCurrentSampleDialogue] = useState<string>('');

  useEffect(() => {
    return festivalCelebrationService.subscribe((state) => {
      setCelebrationState(state);
    });
  }, []);

  if (!isOpen) return null;

  const currentFestival = festivalCelebrationService.getActiveFestival();
  const isFestivalActive = celebrationState.activeFestivalId !== null;

  const handleSelectFestival = (fest: FestivalThemeConfig) => {
    playClickSound?.();
    festivalCelebrationService.setFestival(fest.id, true);
    festivalCelebrationService.playCelebrationChime();
    setCelebrationState(festivalCelebrationService.getState());

    const dialogue = fest.voiceGreetings[0] || '';
    setCurrentSampleDialogue(dialogue);
    onTriggerLizaDialogue?.(dialogue);
  };

  const handleTurnOffFestival = () => {
    playClickSound?.();
    festivalCelebrationService.turnOffFestival();
    setCelebrationState(festivalCelebrationService.getState());
  };

  const handleToggleAutoMode = (enabled: boolean) => {
    playClickSound?.();
    festivalCelebrationService.setAutoMode(enabled);
    setCelebrationState(festivalCelebrationService.getState());
  };

  const handleToggleParticles = () => {
    playClickSound?.();
    festivalCelebrationService.toggleParticles();
    setCelebrationState(festivalCelebrationService.getState());
  };

  const handlePlayVoiceGreeting = (fest: FestivalThemeConfig) => {
    playClickSound?.();
    festivalCelebrationService.playCelebrationChime();
    const idx = Math.floor(Math.random() * fest.voiceGreetings.length);
    const greeting = fest.voiceGreetings[idx];
    setCurrentSampleDialogue(greeting);
    onTriggerLizaDialogue?.(greeting);
  };

  const filteredPresets = FESTIVAL_PRESETS.filter(p => {
    if (activeTab === 'indian') return p.isIndianNational || p.id === 'diwali' || p.id === 'holi' || p.id === 'raksha_bandhan';
    if (activeTab === 'special') return p.id === 'boss_day' || p.id === 'valentines_day' || p.id === 'christmas_new_year';
    return true;
  });

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl max-h-[92dvh] bg-[#090912] border border-orange-500/30 rounded-3xl shadow-[0_0_50px_rgba(255,153,51,0.25)] flex flex-col overflow-hidden text-white font-sans my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-orange-950/60 via-black/80 to-emerald-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-white to-green-600 flex items-center justify-center shadow-lg p-0.5">
              <div className="w-full h-full bg-black/90 rounded-[14px] flex items-center justify-center">
                <Flag size={20} className="text-orange-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold font-mono-spec tracking-wide text-white">
                  FESTIVAL & CELEBRATION THEMES
                </h2>
                <span className={`px-2 py-0.5 text-[9px] font-mono-spec font-bold rounded-full border ${
                  isFestivalActive 
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' 
                    : 'bg-white/10 text-white/50 border-white/20'
                }`}>
                  {isFestivalActive ? 'THEME ACTIVE 🇮🇳' : 'THEME OFF'}
                </span>
              </div>
              <p className="text-[11px] text-white/60 font-mono-spec">
                Date-based celebration engine & avatar background effect controls
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound?.();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          
          {/* Master Turn OFF Festival Theme Card */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isFestivalActive
              ? 'bg-gradient-to-r from-red-950/40 via-black/60 to-purple-950/40 border-red-500/30'
              : 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${
                isFestivalActive ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              }`}>
                {isFestivalActive ? <PowerOff size={18} /> : <CheckCircle2 size={18} />}
              </div>
              <div>
                <span className="text-xs font-mono-spec font-bold text-white block">
                  {isFestivalActive ? 'Turn OFF Festival Theme (Normal Mode)' : 'Festival Theme is currently TURNED OFF'}
                </span>
                <span className="text-[10px] text-white/60 font-mono-spec block">
                  {isFestivalActive 
                    ? 'Disables festival badges, tri-color colors & active festival dialogs' 
                    : 'Standard anime UI & original theme palette is active'}
                </span>
              </div>
            </div>

            {isFestivalActive ? (
              <button
                onClick={handleTurnOffFestival}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 border border-red-400 text-white font-mono-spec font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg cursor-pointer transition-all hover:scale-105"
              >
                <PowerOff size={13} />
                <span>Turn OFF Theme</span>
              </button>
            ) : (
              <button
                onClick={() => handleSelectFestival(FESTIVAL_PRESETS[0])}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-400 text-white font-mono-spec font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg cursor-pointer transition-all hover:scale-105"
              >
                <Flag size={13} />
                <span>Enable 15 Aug Theme</span>
              </button>
            )}
          </div>

          {/* Active Festival Spotlight Card */}
          {currentFestival && isFestivalActive ? (
            <div 
              className={`p-4 sm:p-5 rounded-2xl border ${currentFestival.colors.cardBorder} bg-gradient-to-r ${currentFestival.colors.bannerGradient} relative overflow-hidden space-y-3.5`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentFestival.symbol}</span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono-spec rounded-full ${currentFestival.colors.badgeBg} ${currentFestival.colors.badgeText}`}>
                      {currentFestival.badge}
                    </span>
                    <span className="text-[10px] font-mono-spec text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ACTIVE NOW
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-mono-spec text-white">
                    {currentFestival.name}
                  </h3>
                  <p className="text-xs text-white/80 font-mono-spec">
                    {currentFestival.hindiName} • <span className="text-amber-300 font-semibold">{currentFestival.tagline}</span>
                  </p>
                </div>

                <button
                  onClick={() => handlePlayVoiceGreeting(currentFestival)}
                  className="px-3.5 py-2 rounded-xl bg-white text-black font-bold font-mono-spec text-xs flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all cursor-pointer"
                  title="Play Liza Festive Voice Greeting"
                >
                  <Volume2 size={14} className="text-orange-600" />
                  <span>Hear Greeting</span>
                </button>
              </div>

              {/* Sample Dialogue Box */}
              <div className="p-3 rounded-xl bg-black/60 border border-white/15 text-xs text-white/90 font-mono-spec leading-relaxed flex items-start gap-2">
                <Sparkles size={14} className="text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-orange-300 font-bold">LIZA Festive Dialogue: </span>
                  <span>
                    &quot;{currentSampleDialogue || currentFestival.voiceGreetings[0]}&quot;
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center text-xs font-mono-spec text-white/60 flex flex-col items-center justify-center gap-2 py-6">
              <ShieldOff size={24} className="text-white/30" />
              <span>Festival theme is OFF (Normal Mode). Select any preset below if you wish to activate one.</span>
            </div>
          )}

          {/* Quick Celebration Controls & Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Auto Mode Switch */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-cyan-400" />
                  <span className="text-xs font-mono-spec font-bold text-white">
                    Automatic Date Detection
                  </span>
                </div>
                <p className="text-[10px] text-white/50 font-mono-spec mt-0.5">
                  Auto-tunes theme on 15 Aug, 26 Jan, Diwali, etc.
                </p>
              </div>
              <button
                onClick={() => handleToggleAutoMode(!celebrationState.isAutoMode)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  celebrationState.isAutoMode ? 'bg-emerald-500' : 'bg-white/20'
                }`}
                title={celebrationState.isAutoMode ? 'Disable Auto Date Sync' : 'Enable Auto Date Sync'}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                    celebrationState.isAutoMode ? 'left-6' : 'left-1'
                  }`} 
                />
              </button>
            </div>

            {/* Floating Particles Switch */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-pink-400" />
                  <span className="text-xs font-mono-spec font-bold text-white">
                    Floating Festive Particles
                  </span>
                </div>
                <p className="text-[10px] text-white/50 font-mono-spec mt-0.5">
                  Tiranga confetti, sparklers, snow & petals overlay
                </p>
              </div>
              <button
                onClick={handleToggleParticles}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  celebrationState.particlesEnabled ? 'bg-pink-500' : 'bg-white/20'
                }`}
                title={celebrationState.particlesEnabled ? 'Turn OFF Particles' : 'Turn ON Particles'}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                    celebrationState.particlesEnabled ? 'left-6' : 'left-1'
                  }`} 
                />
              </button>
            </div>

            {/* Rotating Background Aura / Halo Switch */}
            {onToggleRotatingAura && (
              <div className="p-3.5 rounded-2xl bg-black/50 border border-purple-500/30 sm:col-span-2 flex items-center justify-between shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <div>
                  <div className="flex items-center gap-1.5">
                    <RotateCw size={14} className={`text-purple-400 ${showRotatingAura ? 'animate-spin' : ''}`} />
                    <span className="text-xs font-mono-spec font-bold text-white">
                      Avatar Background Rotating Aura (घूमने वाली थीम Halo)
                    </span>
                  </div>
                  <p className="text-[10px] text-white/50 font-mono-spec mt-0.5">
                    Liza ke avatar ke peeche ghoomti hui spinning aura rings on/off karein
                  </p>
                </div>
                <button
                  onClick={() => {
                    playClickSound?.();
                    onToggleRotatingAura(!showRotatingAura);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    showRotatingAura ? 'bg-purple-600' : 'bg-white/20'
                  }`}
                  title={showRotatingAura ? 'Turn OFF Rotating Aura' : 'Turn ON Rotating Aura'}
                >
                  <div 
                    className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                      showRotatingAura ? 'left-6' : 'left-1'
                    }`} 
                  />
                </button>
              </div>
            )}
          </div>

          {/* Festival Categories Tabs */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-spec font-bold uppercase tracking-wider text-white/80">
                Choose Festival Theme Preset:
              </span>
              <div className="flex gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-[10px] font-mono-spec">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                    activeTab === 'all' ? 'bg-orange-500 text-black font-bold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  All ({FESTIVAL_PRESETS.length})
                </button>
                <button
                  onClick={() => setActiveTab('indian')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                    activeTab === 'indian' ? 'bg-orange-500 text-black font-bold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  🇮🇳 Indian
                </button>
                <button
                  onClick={() => setActiveTab('special')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                    activeTab === 'special' ? 'bg-orange-500 text-black font-bold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  👑 Boss & Special
                </button>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option to select "No Festival (Normal Mode)" in the grid */}
              <div
                onClick={handleTurnOffFestival}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  !isFestivalActive
                    ? 'border-emerald-500 bg-emerald-950/30 scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'border-white/10 bg-black/60 hover:border-white/25 hover:bg-black/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs font-mono-spec text-white">
                          Normal Mode (No Festival)
                        </h4>
                        {!isFestivalActive && (
                          <Check size={12} className="text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-white/60 font-mono-spec block">
                        Standard Theme & Minimal Palette
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono-spec px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                    OFF
                  </span>
                </div>

                <p className="text-[10px] text-white/70 font-mono-spec mt-2.5 line-clamp-1">
                  Turns off all festival decorations and tri-color styling
                </p>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono-spec">
                  <span className="text-white/50">
                    Mode: <span className="text-white/80 font-bold">Standard</span>
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {!isFestivalActive ? 'ACTIVE' : 'Click to Apply'}
                  </span>
                </div>
              </div>

              {filteredPresets.map((fest) => {
                const isSelected = celebrationState.activeFestivalId === fest.id;

                return (
                  <div
                    key={fest.id}
                    onClick={() => handleSelectFestival(fest)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? `${fest.colors.cardBorder} bg-gradient-to-r ${fest.colors.bannerGradient} scale-[1.02]`
                        : 'border-white/10 bg-black/60 hover:border-white/25 hover:bg-black/80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{fest.symbol}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs font-mono-spec text-white">
                              {fest.name}
                            </h4>
                            {isSelected && (
                              <Check size={12} className="text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-white/60 font-mono-spec block">
                            {fest.hindiName}
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] font-mono-spec px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                        {fest.dateRange}
                      </span>
                    </div>

                    <p className="text-[10px] text-white/70 font-mono-spec mt-2.5 line-clamp-1">
                      {fest.tagline}
                    </p>

                    {/* Footer Actions */}
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono-spec">
                      <span className="text-white/50">
                        Particles: <span className="text-white/80 font-bold">{fest.particlesType}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayVoiceGreeting(fest);
                        }}
                        className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Volume2 size={11} /> Play Greeting
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-black/90 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs font-mono-spec shrink-0">
          <div className="flex items-center gap-2 text-white/60">
            <Sparkles size={13} className="text-orange-400" />
            <span>{isFestivalActive ? `Current Festival: ${currentFestival?.name || 'Active'}` : 'Festival Theme: Disabled (Normal Mode)'}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isFestivalActive && (
              <button
                onClick={handleTurnOffFestival}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Turn OFF
              </button>
            )}
            <button
              onClick={() => {
                playClickSound?.();
                onClose();
              }}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg"
            >
              Done & Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
