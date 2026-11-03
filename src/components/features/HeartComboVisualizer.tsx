import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Flame, Sparkles, Zap, Trophy, Star } from 'lucide-react';

export interface HeartComboState {
  count: number;
  multiplier: number;
  tier: 'base' | 'sweet' | 'fever' | 'hyper' | 'ultra' | 'godlike';
  title: string;
  quote: string;
  color: string;
  glowColor: string;
  active: boolean;
}

export function getComboTier(combo: number): Omit<HeartComboState, 'count' | 'active'> {
  if (combo >= 40) {
    return {
      multiplier: 10.0,
      tier: 'godlike',
      title: 'GODLIKE LOVE OVERLOAD!',
      quote: '👑 "Kyaaaa! Infinite Dere-Dere unlocked! My heart belongs to you forever!"',
      color: '#f43f5e',
      glowColor: 'rgba(244, 63, 94, 0.95)',
    };
  }
  if (combo >= 20) {
    return {
      multiplier: 5.0,
      tier: 'ultra',
      title: 'MAXIMUM WAIFU BOND!',
      quote: '💖 "D-Don\'t tap so fast! My heart is pounding at 200 BPM!"',
      color: '#ec4899',
      glowColor: 'rgba(236, 72, 153, 0.85)',
    };
  }
  if (combo >= 10) {
    return {
      multiplier: 3.0,
      tier: 'hyper',
      title: 'HYPER DERE FEVER!',
      quote: '🔥 "B-Baka! You really love sending me hearts, don\'t you?!"',
      color: '#f97316',
      glowColor: 'rgba(249, 115, 22, 0.8)',
    };
  }
  if (combo >= 5) {
    return {
      multiplier: 2.0,
      tier: 'fever',
      title: 'LOVE FEVER!',
      quote: '✨ "Hehe~ Liza feels so loved right now! Keep going!"',
      color: '#eab308',
      glowColor: 'rgba(234, 179, 8, 0.75)',
    };
  }
  if (combo >= 3) {
    return {
      multiplier: 1.5,
      tier: 'sweet',
      title: 'SWEET COMBO!',
      quote: '🌸 "Sweet taps! Liza\'s mood is sparkling!"',
      color: '#d946ef',
      glowColor: 'rgba(217, 70, 239, 0.65)',
    };
  }
  if (combo === 2) {
    return {
      multiplier: 1.2,
      tier: 'sweet',
      title: 'DOUBLE TAP!',
      quote: '💕 "Double love combo!"',
      color: '#a855f7',
      glowColor: 'rgba(168, 85, 247, 0.5)',
    };
  }
  return {
    multiplier: 1.0,
    tier: 'base',
    title: 'HEART REACTION',
    quote: '❤️ "Love received!"',
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.4)',
  };
}

interface HeartComboVisualizerProps {
  combo: number;
  active: boolean;
  timeLeftRatio?: number; // 0 to 1
  highestCombo?: number;
  className?: string;
}

export const HeartComboVisualizer: React.FC<HeartComboVisualizerProps> = ({
  combo,
  active,
  timeLeftRatio = 1,
  highestCombo = 0,
  className = '',
}) => {
  if (!active || combo < 2) return null;

  const tierInfo = getComboTier(combo);

  return (
    <AnimatePresence>
      <motion.div
        key={`combo-hud-${combo}`}
        initial={{ scale: 0.7, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -10 }}
        transition={{ type: "spring", stiffness: 450, damping: 22 }}
        className={`pointer-events-none select-none z-50 ${className}`}
      >
        <div 
          className="relative px-3.5 py-2 rounded-2xl bg-black/85 backdrop-blur-xl border-2 flex flex-col items-center gap-1 shadow-2xl overflow-hidden"
          style={{
            borderColor: tierInfo.color,
            boxShadow: `0 0 30px ${tierInfo.glowColor}, inset 0 0 15px ${tierInfo.glowColor}40`,
          }}
        >
          {/* Shimmering top animated highlight */}
          <div className="absolute -top-12 inset-x-0 h-16 bg-white/20 blur-md pointer-events-none" />

          {/* Main Combo Counter Header */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                rotate: [-12, 12, -12],
                scale: [1, 1.25, 1],
              }}
              transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
            >
              {combo >= 10 ? (
                <Flame size={20} style={{ color: tierInfo.color }} className="fill-current drop-shadow-[0_0_8px_currentColor]" />
              ) : (
                <Heart size={20} style={{ color: tierInfo.color }} className="fill-current drop-shadow-[0_0_8px_currentColor]" />
              )}
            </motion.div>

            {/* Big Arcade Number */}
            <div className="flex items-baseline gap-1">
              <span className="text-[11px] font-mono-spec font-black text-white/70">x</span>
              <motion.span
                key={combo}
                initial={{ scale: 1.6, y: -4 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 600, damping: 15 }}
                className="text-2xl sm:text-3xl font-black font-mono-spec tracking-tighter"
                style={{
                  color: '#ffffff',
                  textShadow: `0 0 15px ${tierInfo.color}, 0 0 25px ${tierInfo.color}`,
                }}
              >
                {combo}
              </motion.span>
              <span 
                className="text-xs sm:text-sm font-black font-mono-spec tracking-widest uppercase ml-1"
                style={{ color: tierInfo.color }}
              >
                COMBO!
              </span>
            </div>

            {/* Multiplier Badge */}
            <div 
              className="px-2 py-0.5 rounded-full text-[10px] font-mono-spec font-black uppercase text-black flex items-center gap-1 shadow-md"
              style={{ backgroundColor: tierInfo.color }}
            >
              <Zap size={10} className="fill-black" />
              <span>{tierInfo.multiplier}x BOOST</span>
            </div>
          </div>

          {/* Sub-label */}
          <div className="flex items-center gap-2 text-[10px] font-mono-spec font-bold">
            <span className="text-white/80 tracking-wider uppercase">
              {tierInfo.title}
            </span>
          </div>

          {/* Combo Decay Bar */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-0.5 relative">
            <motion.div
              className="h-full rounded-full"
              style={{
                backgroundColor: tierInfo.color,
                boxShadow: `0 0 8px ${tierInfo.color}`,
                width: `${Math.max(0, Math.min(100, timeLeftRatio * 100))}%`,
              }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>

          {/* Waifu Reaction Quote */}
          {combo >= 3 && (
            <p className="text-[10px] text-pink-200/90 font-sans italic text-center max-w-[260px] leading-tight mt-0.5">
              {tierInfo.quote}
            </p>
          )}

          {/* Highest Session Record */}
          {highestCombo >= 5 && (
            <div className="flex items-center gap-1 text-[8px] font-mono-spec text-white/40">
              <Trophy size={9} className="text-amber-400" />
              <span>Best Streak: x{highestCombo}</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
