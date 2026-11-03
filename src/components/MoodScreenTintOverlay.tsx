import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LizaMood } from '../services/moodExpressionEngine';

export interface MoodScreenTintConfig {
  mood: LizaMood;
  name: string;
  primaryColor: string;
  gradient: string;
  vignette: string;
  topGlow: string;
  bottomGlow: string;
  baseOpacity: number;
  pulseScale: [number, number];
  pulseDuration: number;
}

export const MOOD_SCREEN_TINTS: Record<LizaMood, MoodScreenTintConfig> = {
  CALM: {
    mood: 'CALM',
    name: 'Serene Lavender',
    primaryColor: '#a855f7',
    gradient: 'radial-gradient(ellipse at 50% 30%, rgba(168, 85, 247, 0.14) 0%, rgba(147, 51, 234, 0.06) 50%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 100px 20px rgba(168, 85, 247, 0.08)',
    topGlow: 'rgba(168, 85, 247, 0.22)',
    bottomGlow: 'rgba(147, 51, 234, 0.16)',
    baseOpacity: 0.85,
    pulseScale: [0.8, 1.0],
    pulseDuration: 5.5,
  },
  HAPPY: {
    mood: 'HAPPY',
    name: 'Joyful Blossom Pink',
    primaryColor: '#ec4899',
    gradient: 'radial-gradient(ellipse at 50% 35%, rgba(236, 72, 153, 0.20) 0%, rgba(244, 114, 182, 0.09) 55%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 120px 30px rgba(236, 72, 153, 0.14)',
    topGlow: 'rgba(236, 72, 153, 0.28)',
    bottomGlow: 'rgba(244, 63, 94, 0.20)',
    baseOpacity: 0.95,
    pulseScale: [0.85, 1.05],
    pulseDuration: 3.2,
  },
  EXCITED: {
    mood: 'EXCITED',
    name: 'Electric Sunburst Gold',
    primaryColor: '#f59e0b',
    gradient: 'radial-gradient(ellipse at 50% 30%, rgba(245, 158, 11, 0.22) 0%, rgba(234, 179, 8, 0.10) 50%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 130px 35px rgba(245, 158, 11, 0.16)',
    topGlow: 'rgba(245, 158, 11, 0.32)',
    bottomGlow: 'rgba(234, 179, 8, 0.24)',
    baseOpacity: 1.0,
    pulseScale: [0.88, 1.08],
    pulseDuration: 2.2,
  },
  SAD: {
    mood: 'SAD',
    name: 'Melancholic Rain Blue',
    primaryColor: '#3b82f6',
    gradient: 'radial-gradient(ellipse at 50% 40%, rgba(59, 130, 246, 0.18) 0%, rgba(30, 64, 175, 0.08) 55%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 140px 45px rgba(30, 58, 138, 0.24)',
    topGlow: 'rgba(59, 130, 246, 0.20)',
    bottomGlow: 'rgba(30, 64, 175, 0.26)',
    baseOpacity: 0.90,
    pulseScale: [0.82, 0.98],
    pulseDuration: 6.0,
  },
  CARING: {
    mood: 'CARING',
    name: 'Empathy Mint Emerald',
    primaryColor: '#10b981',
    gradient: 'radial-gradient(ellipse at 50% 35%, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.08) 55%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 110px 25px rgba(16, 185, 129, 0.12)',
    topGlow: 'rgba(16, 185, 129, 0.25)',
    bottomGlow: 'rgba(5, 150, 105, 0.18)',
    baseOpacity: 0.90,
    pulseScale: [0.85, 1.02],
    pulseDuration: 4.5,
  },
  CONFUSED: {
    mood: 'CONFUSED',
    name: 'Mystic Violet Teal',
    primaryColor: '#8b5cf6',
    gradient: 'radial-gradient(ellipse at 50% 35%, rgba(139, 92, 246, 0.16) 0%, rgba(14, 165, 233, 0.07) 50%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 110px 25px rgba(139, 92, 246, 0.12)',
    topGlow: 'rgba(139, 92, 246, 0.22)',
    bottomGlow: 'rgba(14, 165, 233, 0.16)',
    baseOpacity: 0.85,
    pulseScale: [0.84, 1.02],
    pulseDuration: 4.0,
  },
  THINKING: {
    mood: 'THINKING',
    name: 'Deep Analytical Cobalt',
    primaryColor: '#3b82f6',
    gradient: 'radial-gradient(ellipse at 50% 30%, rgba(59, 130, 246, 0.17) 0%, rgba(99, 102, 241, 0.08) 50%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 120px 30px rgba(59, 130, 246, 0.14)',
    topGlow: 'rgba(59, 130, 246, 0.24)',
    bottomGlow: 'rgba(99, 102, 241, 0.20)',
    baseOpacity: 0.88,
    pulseScale: [0.85, 1.0],
    pulseDuration: 5.0,
  },
  SURPRISED: {
    mood: 'SURPRISED',
    name: 'Starlight Sparkle Rose',
    primaryColor: '#f43f5e',
    gradient: 'radial-gradient(ellipse at 50% 30%, rgba(244, 63, 94, 0.22) 0%, rgba(251, 191, 36, 0.10) 50%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 130px 35px rgba(244, 63, 94, 0.18)',
    topGlow: 'rgba(244, 63, 94, 0.32)',
    bottomGlow: 'rgba(251, 191, 36, 0.22)',
    baseOpacity: 0.95,
    pulseScale: [0.88, 1.08],
    pulseDuration: 2.5,
  },
  SHY: {
    mood: 'SHY',
    name: 'Flustered Peach Blush',
    primaryColor: '#f472b6',
    gradient: 'radial-gradient(ellipse at 50% 35%, rgba(244, 114, 182, 0.22) 0%, rgba(251, 146, 60, 0.09) 55%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 120px 30px rgba(244, 114, 182, 0.16)',
    topGlow: 'rgba(244, 114, 182, 0.30)',
    bottomGlow: 'rgba(251, 146, 60, 0.20)',
    baseOpacity: 0.92,
    pulseScale: [0.86, 1.04],
    pulseDuration: 3.8,
  },
  NERVOUS: {
    mood: 'NERVOUS',
    name: 'Amber Jitter Flare',
    primaryColor: '#fb923c',
    gradient: 'radial-gradient(ellipse at 50% 35%, rgba(251, 146, 60, 0.18) 0%, rgba(245, 158, 11, 0.08) 50%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 115px 30px rgba(251, 146, 60, 0.15)',
    topGlow: 'rgba(251, 146, 60, 0.26)',
    bottomGlow: 'rgba(245, 158, 11, 0.18)',
    baseOpacity: 0.90,
    pulseScale: [0.85, 1.06],
    pulseDuration: 2.0,
  },
  ANGRY: {
    mood: 'ANGRY',
    name: 'Fiery Crimson Fury',
    primaryColor: '#ef4444',
    gradient: 'radial-gradient(ellipse at 50% 30%, rgba(239, 68, 68, 0.26) 0%, rgba(185, 28, 28, 0.14) 50%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 160px 50px rgba(220, 38, 38, 0.32)',
    topGlow: 'rgba(239, 68, 68, 0.40)',
    bottomGlow: 'rgba(185, 28, 28, 0.32)',
    baseOpacity: 1.0,
    pulseScale: [0.90, 1.12],
    pulseDuration: 1.8,
  },
  SERIOUS: {
    mood: 'SERIOUS',
    name: 'Focused Slate Indigo',
    primaryColor: '#6366f1',
    gradient: 'radial-gradient(ellipse at 50% 30%, rgba(99, 102, 241, 0.16) 0%, rgba(79, 70, 229, 0.07) 50%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 120px 30px rgba(99, 102, 241, 0.14)',
    topGlow: 'rgba(99, 102, 241, 0.22)',
    bottomGlow: 'rgba(79, 70, 229, 0.18)',
    baseOpacity: 0.86,
    pulseScale: [0.85, 1.0],
    pulseDuration: 5.2,
  },
  SLEEPY: {
    mood: 'SLEEPY',
    name: 'Midnight Dream Twilight',
    primaryColor: '#64748b',
    gradient: 'radial-gradient(ellipse at 50% 40%, rgba(71, 85, 105, 0.20) 0%, rgba(30, 41, 59, 0.12) 55%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 150px 50px rgba(15, 23, 42, 0.45)',
    topGlow: 'rgba(100, 116, 139, 0.18)',
    bottomGlow: 'rgba(30, 41, 59, 0.28)',
    baseOpacity: 0.95,
    pulseScale: [0.80, 0.95],
    pulseDuration: 7.0,
  },
  TSUNDERE: {
    mood: 'TSUNDERE',
    name: 'Sassy Ruby Blush',
    primaryColor: '#f43f5e',
    gradient: 'radial-gradient(ellipse at 50% 30%, rgba(244, 63, 94, 0.24) 0%, rgba(225, 29, 72, 0.12) 50%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 140px 40px rgba(225, 29, 72, 0.22)',
    topGlow: 'rgba(244, 63, 94, 0.35)',
    bottomGlow: 'rgba(225, 29, 72, 0.24)',
    baseOpacity: 1.0,
    pulseScale: [0.88, 1.10],
    pulseDuration: 2.6,
  },
  MOCK_JEALOUS: {
    mood: 'MOCK_JEALOUS',
    name: 'Playful Purple Pout',
    primaryColor: '#a855f7',
    gradient: 'radial-gradient(ellipse at 50% 30%, rgba(168, 85, 247, 0.26) 0%, rgba(147, 51, 234, 0.14) 50%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 145px 45px rgba(147, 51, 234, 0.24)',
    topGlow: 'rgba(168, 85, 247, 0.38)',
    bottomGlow: 'rgba(192, 132, 252, 0.26)',
    baseOpacity: 1.0,
    pulseScale: [0.88, 1.08],
    pulseDuration: 2.6,
  },
  PROTECTIVE: {
    mood: 'PROTECTIVE',
    name: 'Loyal Indigo Guard',
    primaryColor: '#6366f1',
    gradient: 'radial-gradient(ellipse at 50% 30%, rgba(99, 102, 241, 0.25) 0%, rgba(79, 70, 229, 0.12) 50%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 140px 40px rgba(79, 70, 229, 0.22)',
    topGlow: 'rgba(99, 102, 241, 0.35)',
    bottomGlow: 'rgba(129, 140, 248, 0.24)',
    baseOpacity: 0.95,
    pulseScale: [0.86, 1.04],
    pulseDuration: 3.2,
  },
  CONFIDENT: {
    mood: 'CONFIDENT',
    name: 'Sassy Magenta Charm',
    primaryColor: '#ec4899',
    gradient: 'radial-gradient(ellipse at 50% 32%, rgba(236, 72, 153, 0.22) 0%, rgba(219, 39, 119, 0.11) 50%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 130px 35px rgba(219, 39, 119, 0.18)',
    topGlow: 'rgba(236, 72, 153, 0.32)',
    bottomGlow: 'rgba(244, 114, 182, 0.22)',
    baseOpacity: 0.95,
    pulseScale: [0.88, 1.06],
    pulseDuration: 2.8,
  },
  ANNOYED: {
    mood: 'ANNOYED',
    name: 'Annoyed Amber Sunset',
    primaryColor: '#f97316',
    gradient: 'radial-gradient(ellipse at 50% 35%, rgba(249, 115, 22, 0.22) 0%, rgba(234, 88, 12, 0.10) 50%, rgba(3, 3, 5, 0) 100%)',
    vignette: 'inset 0 0 135px 38px rgba(234, 88, 12, 0.20)',
    topGlow: 'rgba(249, 115, 22, 0.30)',
    bottomGlow: 'rgba(251, 146, 60, 0.20)',
    baseOpacity: 0.92,
    pulseScale: [0.85, 1.02],
    pulseDuration: 3.6,
  },
};

interface MoodScreenTintOverlayProps {
  mood: LizaMood;
  enabled?: boolean;
  intensity?: number; // 0.0 to 1.5 (default 1.0)
}

export const MoodScreenTintOverlay: React.FC<MoodScreenTintOverlayProps> = ({
  mood,
  enabled = true,
  intensity = 1.0,
}) => {
  if (!enabled) return null;

  const config = MOOD_SCREEN_TINTS[mood] || MOOD_SCREEN_TINTS.CALM;

  return (
    <div 
      id="liza-mood-screen-tint-overlay"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={`mood-tint-layer-${mood}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: config.baseOpacity * intensity }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Layer 1: Core Radial Gradient Atmosphere */}
          <div
            className="absolute inset-0 w-full h-full transition-opacity duration-1000"
            style={{
              background: config.gradient,
            }}
          />

          {/* Layer 2: Full-screen Corner Vignette */}
          <div
            className="absolute inset-0 w-full h-full transition-all duration-1000"
            style={{
              boxShadow: config.vignette,
            }}
          />

          {/* Layer 3: Dynamic Breathing Ambient Orbs */}
          <motion.div
            animate={{
              opacity: [config.pulseScale[0] * intensity, config.pulseScale[1] * intensity, config.pulseScale[0] * intensity],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: config.pulseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full blur-[110px] pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${config.topGlow} 0%, transparent 70%)`,
            }}
          />

          <motion.div
            animate={{
              opacity: [config.pulseScale[1] * 0.8 * intensity, config.pulseScale[0] * 0.8 * intensity, config.pulseScale[1] * 0.8 * intensity],
              scale: [1.03, 0.97, 1.03],
            }}
            transition={{
              duration: config.pulseDuration * 1.1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -bottom-[20%] right-[-10%] w-[600px] h-[450px] rounded-full blur-[120px] pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${config.bottomGlow} 0%, transparent 70%)`,
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
