import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Shirt, Wand2, Volume2, ShieldCheck, Heart, Crown, 
  X, Check, RotateCcw, Zap, Flame, Eye, Star
} from 'lucide-react';
import { OUTFITS, LizaOutfit } from '../WardrobeCustomizerModal';

interface InteractiveWardrobeAnimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOutfitId: string;
  onSelectOutfit: (outfit: LizaOutfit) => void;
  playClickSound?: () => void;
  onTriggerVoiceDialogue?: (dialogue: string) => void;
}

export const InteractiveWardrobeAnimationModal: React.FC<InteractiveWardrobeAnimationModalProps> = ({
  isOpen,
  onClose,
  currentOutfitId,
  onSelectOutfit,
  playClickSound,
  onTriggerVoiceDialogue
}) => {
  const [selectedOutfit, setSelectedOutfit] = useState<LizaOutfit>(() => {
    return OUTFITS.find(o => o.id === currentOutfitId) || OUTFITS[0];
  });
  const [isTransforming, setIsTransforming] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [transformationParticles, setTransformationParticles] = useState(false);

  if (!isOpen) return null;

  const categories = ['ALL', 'Classic', 'Cosplay', 'Casual', 'Formal', 'Fantasy'];

  const filteredOutfits = activeCategory === 'ALL' 
    ? OUTFITS 
    : OUTFITS.filter(o => o.category === activeCategory);

  const handleApplyTransformation = (outfit: LizaOutfit) => {
    playClickSound?.();
    setSelectedOutfit(outfit);
    setIsTransforming(true);
    setTransformationParticles(true);

    // Play transformation sound effect via Web Audio if available
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.45);
      });
    } catch (e) {}

    setTimeout(() => {
      onSelectOutfit(outfit);
      setIsTransforming(false);
      if (onTriggerVoiceDialogue) {
        onTriggerVoiceDialogue(outfit.tsundereRemark);
      }
    }, 900);

    setTimeout(() => {
      setTransformationParticles(false);
    }, 1800);
  };

  return (
    <div 
      id="interactive-wardrobe-modal"
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-lg animate-fade-in font-sans"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#1c0e2e] via-[#0e0717] to-black border border-pink-500/30 shadow-[0_0_60px_rgba(236,72,153,0.3)] text-white overflow-hidden relative"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between relative z-10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-500 p-[1px] flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-[#180d26] rounded-2xl flex items-center justify-center">
                <Shirt size={20} className="text-pink-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Interactive Wardrobe & Live Outfit Transformation ✨
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono-spec bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  Live 2D FX
                </span>
              </div>
              <p className="text-xs text-white/50">
                Magical Anime Transformation Sequence & Outfit Personality Perks
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound?.();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-4 sm:px-5 py-2.5 flex items-center gap-2 overflow-x-auto border-b border-white/10 bg-white/5 scrollbar-none font-mono-spec text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                playClickSound?.();
                setActiveCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-pink-500 text-black shadow-md shadow-pink-500/30' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Body with Split View (Live Stage + Outfits Grid) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5 relative z-10 custom-scrollbar">
          
          {/* LEFT: Live Transformation Stage (5 Cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-between p-4 rounded-3xl bg-black/60 border border-pink-500/30 relative overflow-hidden shadow-inner">
            {/* Magical aura flash overlay */}
            <AnimatePresence>
              {isTransforming && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1.2 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 bg-gradient-to-tr from-pink-500/80 via-purple-500/60 to-white/90 z-30 flex items-center justify-center pointer-events-none"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  >
                    <Wand2 size={48} className="text-white drop-shadow-[0_0_20px_#fff]" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glowing Backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Outfit Preview Card */}
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="relative group">
                <motion.div 
                  className="w-44 h-56 sm:w-48 sm:h-64 rounded-2xl overflow-hidden border-2 border-pink-400/80 shadow-[0_0_30px_rgba(236,72,153,0.4)] relative"
                  animate={isTransforming ? { rotateY: 360, scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 0.8 }}
                >
                  <img 
                    src={selectedOutfit.imageUrl} 
                    alt={selectedOutfit.name} 
                    className="w-full h-full object-cover"
                  />
                  {/* Badge */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono-spec font-bold uppercase bg-black/80 border border-pink-400/60 text-pink-300 backdrop-blur-sm">
                    {selectedOutfit.badge}
                  </div>
                </motion.div>
              </div>

              <div className="text-center mt-3 space-y-1">
                <h4 className="text-base font-bold text-white">{selectedOutfit.name}</h4>
                <p className="text-xs text-pink-300 font-mono-spec">
                  Voice Tone: <span className="text-white">{selectedOutfit.voiceStyle}</span>
                </p>
              </div>
            </div>

            {/* Tsundere Quote Box */}
            <div className="w-full p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 mt-3 relative z-10">
              <div className="flex items-center gap-1.5 text-[10px] font-mono-spec font-bold text-pink-400 uppercase">
                <Sparkles size={12} />
                <span>Outfit Dialogue:</span>
              </div>
              <p className="font-sans italic leading-relaxed mt-1">{selectedOutfit.tsundereRemark}</p>
            </div>

            {/* Transform Action Button */}
            <button
              onClick={() => handleApplyTransformation(selectedOutfit)}
              disabled={isTransforming}
              className="w-full py-3 mt-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 disabled:opacity-40 text-black font-bold text-xs font-mono-spec flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 transition-all active:scale-98 cursor-pointer uppercase tracking-wider"
            >
              <Wand2 size={16} />
              <span>{isTransforming ? 'Transforming...' : 'Equip & Transform ✨'}</span>
            </button>
          </div>

          {/* RIGHT: Outfits Selection Grid (7 Cols) */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center justify-between font-mono-spec text-xs">
              <span className="text-white/70 font-bold flex items-center gap-1.5">
                <Crown size={14} className="text-amber-400" />
                Available Cosplay & Wardrobe ({filteredOutfits.length})
              </span>
              <span className="text-[10px] text-pink-400">All Outfits Unlocked ✨</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredOutfits.map(outfit => {
                const isSelected = selectedOutfit.id === outfit.id;
                const isEquipped = currentOutfitId === outfit.id;

                return (
                  <div
                    key={outfit.id}
                    onClick={() => {
                      playClickSound?.();
                      setSelectedOutfit(outfit);
                    }}
                    className={`p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                      isSelected 
                        ? 'bg-pink-950/60 border-pink-400 shadow-md shadow-pink-500/20' 
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="w-full aspect-[4/5] rounded-xl overflow-hidden relative mb-2 bg-black/40">
                      <img 
                        src={outfit.imageUrl} 
                        alt={outfit.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isEquipped && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold font-mono-spec bg-emerald-500 text-black flex items-center gap-0.5">
                          <Check size={9} />
                          <span>EQUIPPED</span>
                        </div>
                      )}
                    </div>

                    {/* Outfit Name & Category */}
                    <div>
                      <div className="text-[11px] font-bold text-white truncate">{outfit.name}</div>
                      <div className="text-[9px] text-white/40 font-mono-spec flex items-center justify-between mt-0.5">
                        <span>{outfit.category}</span>
                        <span className="text-pink-300 font-bold">{outfit.badge}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs font-mono-spec">
          <div className="flex items-center gap-2 text-white/50">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            <span>Interactive 3D/2D Wardrobe Engine Active</span>
          </div>

          <button
            onClick={() => {
              playClickSound?.();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
          >
            Close Wardrobe
          </button>
        </div>
      </motion.div>
    </div>
  );
};
