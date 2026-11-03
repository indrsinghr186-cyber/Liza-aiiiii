import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AvatarState, 
  AvatarMood, 
  BlinkStage, 
  MouthStage, 
  AVATAR_EXPRESSIONS, 
  avatarController,
  LIZA_DEFAULT_FACE,
  LIZA_MOUTH_OPEN,
  LIZA_EYES_CLOSED,
  formatGoogleDriveDirectUrl
} from '../../services/avatarControllerService';
import cyberpunkIdolImg from '../../assets/images/liza_cyberpunk_idol_1786749390503.jpg';
import maidCosplayImg from '../../assets/images/liza_maid_cosplay_1786749403056.jpg';
import sakuraKimonoImg from '../../assets/images/liza_sakura_kimono_1786749413528.jpg';
import schoolUniformImg from '../../assets/images/liza_school_uniform_1786749426477.jpg';
import gothicWitchImg from '../../assets/images/liza_gothic_witch_1786749438776.jpg';
import { 
  Heart, 
  Sparkles, 
  Shirt, 
  Moon, 
  Flame, 
  CloudRain, 
  Zap, 
  HelpCircle, 
  Brain, 
  AlertCircle, 
  Shield 
} from 'lucide-react';

export interface MoodBadgeInfo {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  color: string;
  bgGlow: string;
  borderColor: string;
  emoji: string;
}

export const MOOD_BADGES: Record<AvatarMood, MoodBadgeInfo> = {
  CALM: {
    icon: Sparkles,
    label: 'Calm',
    color: '#c084fc',
    bgGlow: 'rgba(168, 85, 247, 0.3)',
    borderColor: 'rgba(168, 85, 247, 0.5)',
    emoji: '🌸',
  },
  HAPPY: {
    icon: Heart,
    label: 'Happy',
    color: '#f472b6',
    bgGlow: 'rgba(236, 72, 153, 0.35)',
    borderColor: 'rgba(236, 72, 153, 0.6)',
    emoji: '💖',
  },
  EXCITED: {
    icon: Zap,
    label: 'Excited',
    color: '#fbbf24',
    bgGlow: 'rgba(245, 158, 11, 0.35)',
    borderColor: 'rgba(245, 158, 11, 0.6)',
    emoji: '⚡',
  },
  SAD: {
    icon: CloudRain,
    label: 'Sad',
    color: '#60a5fa',
    bgGlow: 'rgba(59, 130, 246, 0.35)',
    borderColor: 'rgba(59, 130, 246, 0.6)',
    emoji: '💧',
  },
  CARING: {
    icon: Heart,
    label: 'Caring',
    color: '#34d399',
    bgGlow: 'rgba(16, 185, 129, 0.35)',
    borderColor: 'rgba(16, 185, 129, 0.6)',
    emoji: '🌿',
  },
  CONFUSED: {
    icon: HelpCircle,
    label: 'Confused',
    color: '#a78bfa',
    bgGlow: 'rgba(139, 92, 246, 0.3)',
    borderColor: 'rgba(139, 92, 246, 0.5)',
    emoji: '❓',
  },
  THINKING: {
    icon: Brain,
    label: 'Thinking',
    color: '#38bdf8',
    bgGlow: 'rgba(56, 189, 248, 0.3)',
    borderColor: 'rgba(56, 189, 248, 0.5)',
    emoji: '💭',
  },
  SURPRISED: {
    icon: Sparkles,
    label: 'Surprised',
    color: '#fb7185',
    bgGlow: 'rgba(244, 63, 94, 0.35)',
    borderColor: 'rgba(244, 63, 94, 0.6)',
    emoji: '✨',
  },
  SHY: {
    icon: Heart,
    label: 'Shy',
    color: '#f472b6',
    bgGlow: 'rgba(244, 114, 182, 0.35)',
    borderColor: 'rgba(244, 114, 182, 0.6)',
    emoji: '🙈',
  },
  NERVOUS: {
    icon: AlertCircle,
    label: 'Nervous',
    color: '#fb923c',
    bgGlow: 'rgba(251, 146, 60, 0.35)',
    borderColor: 'rgba(251, 146, 60, 0.6)',
    emoji: '💦',
  },
  ANGRY: {
    icon: Flame,
    label: 'Angry',
    color: '#f87171',
    bgGlow: 'rgba(239, 68, 68, 0.45)',
    borderColor: 'rgba(239, 68, 68, 0.7)',
    emoji: '🔥',
  },
  SERIOUS: {
    icon: Shield,
    label: 'Serious',
    color: '#818cf8',
    bgGlow: 'rgba(99, 102, 241, 0.3)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
    emoji: '🛡️',
  },
  SLEEPY: {
    icon: Moon,
    label: 'Sleepy',
    color: '#94a3b8',
    bgGlow: 'rgba(100, 116, 139, 0.3)',
    borderColor: 'rgba(100, 116, 139, 0.5)',
    emoji: '🌙',
  },
  TSUNDERE: {
    icon: Flame,
    label: 'Tsundere',
    color: '#fb7185',
    bgGlow: 'rgba(244, 63, 94, 0.45)',
    borderColor: 'rgba(244, 63, 94, 0.7)',
    emoji: '💢',
  },
  LAUGHING: {
    icon: Sparkles,
    label: 'Laughing',
    color: '#f43f5e',
    bgGlow: 'rgba(244, 63, 94, 0.35)',
    borderColor: 'rgba(244, 63, 94, 0.6)',
    emoji: '😆',
  },
  WINK: {
    icon: Sparkles,
    label: 'Wink',
    color: '#ec4899',
    bgGlow: 'rgba(236, 72, 153, 0.35)',
    borderColor: 'rgba(236, 72, 153, 0.6)',
    emoji: '😉',
  },
  POUT: {
    icon: Flame,
    label: 'Pout',
    color: '#fb7185',
    bgGlow: 'rgba(244, 63, 94, 0.35)',
    borderColor: 'rgba(244, 63, 94, 0.6)',
    emoji: '😤',
  },
  HEART_EYES: {
    icon: Heart,
    label: 'Loving',
    color: '#f43f5e',
    bgGlow: 'rgba(244, 63, 94, 0.45)',
    borderColor: 'rgba(244, 63, 94, 0.7)',
    emoji: '😍',
  },
};

export interface InteractiveAvatarProps {
  state?: AvatarState;
  mood?: AvatarMood | string;
  isSpeaking: boolean;
  isListening: boolean;
  outputLevel: number;
  micLevel?: number;
  currentVisual?: string;
  themeGlowColor?: string;
  themePrimaryColor?: string;
  isPowerSaver?: boolean;
  wakeWordActive?: boolean;
  showCosplayBadge?: boolean;
  onAvatarTap?: () => void;
  onSelectOutfit?: (url: string) => void;
  onTriggerReaction?: (type: 'headpat' | 'poke_cheek' | 'hug' | 'hold_hand', comboCount?: number) => void;
  className?: string;
}

export const InteractiveAvatarRenderer: React.FC<InteractiveAvatarProps> = ({
  state = 'IDLE',
  mood = 'CALM',
  isSpeaking = false,
  isListening = false,
  outputLevel = 0,
  micLevel = 0,
  currentVisual,
  themeGlowColor = 'rgba(168, 85, 247, 0.4)',
  themePrimaryColor = '#a855f7',
  isPowerSaver = false,
  wakeWordActive = false,
  showCosplayBadge = true,
  onAvatarTap,
  onSelectOutfit,
  onTriggerReaction,
  className = '',
}) => {
  const [imageLoadError, setImageLoadError] = useState(false);

  // Reset error flag whenever visual or mood changes
  useEffect(() => {
    setImageLoadError(false);
  }, [currentVisual, mood]);

  // Normalize mood key
  const normalizedMood: AvatarMood = useMemo(() => {
    if (!mood) return 'CALM';
    const upper = (mood as string).toUpperCase();
    if (upper in AVATAR_EXPRESSIONS) return upper as AvatarMood;
    return 'CALM';
  }, [mood]);

  // Sync state with avatar controller
  useEffect(() => {
    if (wakeWordActive) {
      avatarController.setState('WAKE');
    } else if (isSpeaking) {
      avatarController.setState('SPEAKING');
    } else if (isListening) {
      avatarController.setState('LISTENING');
    } else if (state === 'THINKING') {
      avatarController.setState('THINKING');
    } else {
      avatarController.setState('IDLE');
    }
  }, [isSpeaking, isListening, state, wakeWordActive]);

  useEffect(() => {
    if (normalizedMood) {
      avatarController.setMood(normalizedMood);
    }
  }, [normalizedMood]);

  // Current mood expression config
  const exprConfig = useMemo(() => {
    return AVATAR_EXPRESSIONS[normalizedMood] || AVATAR_EXPRESSIONS.CALM;
  }, [normalizedMood]);

  // --- 1. Natural Randomized Multi-Stage Blinking Engine (Mood-Adaptive) ---
  const [blinkStage, setBlinkStage] = useState<BlinkStage>('OPEN');
  const blinkTimeoutRef = useRef<any>(null);

  useEffect(() => {
    let isCancelled = false;

    const scheduleNextBlink = () => {
      if (isCancelled) return;

      const minInterval = exprConfig.blinkMinInterval || 2200;
      const maxInterval = exprConfig.blinkMaxInterval || 5200;
      const nextDelay = Math.random() * (maxInterval - minInterval) + minInterval;

      blinkTimeoutRef.current = setTimeout(() => {
        if (isCancelled) return;

        setBlinkStage('HALF_CLOSED');
        
        setTimeout(() => {
          if (isCancelled) return;
          setBlinkStage('CLOSED');

          setTimeout(() => {
            if (isCancelled) return;
            setBlinkStage('HALF_CLOSED');

            setTimeout(() => {
              if (isCancelled) return;
              setBlinkStage('OPEN');

              // Occasional double-blink probability
              const doubleBlinkChance = (normalizedMood === 'NERVOUS' || normalizedMood === 'EXCITED' || normalizedMood === 'HAPPY') ? 0.35 : 0.15;
              if (Math.random() < doubleBlinkChance) {
                setTimeout(() => {
                  if (isCancelled) return;
                  setBlinkStage('CLOSED');
                  setTimeout(() => {
                    if (isCancelled) return;
                    setBlinkStage('OPEN');
                    scheduleNextBlink();
                  }, 80);
                }, 120);
              } else {
                scheduleNextBlink();
              }
            }, 35);
          }, 65);
        }, 30);
      }, nextDelay);
    };

    scheduleNextBlink();

    return () => {
      isCancelled = true;
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, [normalizedMood, exprConfig]);

  // --- 2. Saccadic Gaze Shift & Idle Wander Engine ---
  const [gazeShift, setGazeShift] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [microFidgetAngle, setMicroFidgetAngle] = useState(0);

  useEffect(() => {
    if (isPowerSaver) return;
    let isCancelled = false;

    const scheduleGazeShift = () => {
      if (isCancelled) return;
      const interval = Math.random() * 4000 + 3000;

      setTimeout(() => {
        if (isCancelled) return;
        if (state === 'IDLE' || state === 'THINKING') {
          if (Math.random() < (exprConfig.gazeWanderProb || 0.4)) {
            // Shift gaze slightly left/right/up
            const angleX = (Math.random() - 0.5) * 3.5;
            const angleY = (Math.random() - 0.5) * 2.0;
            setGazeShift({ x: angleX, y: angleY });

            // Sassy or thoughtful head fidget
            if (Math.random() < (exprConfig.fidgetIntensity || 0.5)) {
              setMicroFidgetAngle((Math.random() - 0.5) * 2.4);
            }
          } else {
            // Center gaze
            setGazeShift({ x: 0, y: 0 });
            setMicroFidgetAngle(0);
          }
        } else {
          setGazeShift({ x: 0, y: 0 });
          setMicroFidgetAngle(0);
        }
        scheduleGazeShift();
      }, interval);
    };

    scheduleGazeShift();
    return () => {
      isCancelled = true;
    };
  }, [state, exprConfig, isPowerSaver]);

  // --- 3. Real-Time Audio Viseme / Mouth Lip-Sync Engine ---
  const [mouthStage, setMouthStage] = useState<MouthStage>('MOUTH_CLOSED');
  const [mouthScaleY, setMouthScaleY] = useState(0);

  useEffect(() => {
    let animId: number;

    const updateLipSync = () => {
      if (isSpeaking && outputLevel > 0.03) {
        const amplitude = Math.min(1, outputLevel * 6);
        setMouthScaleY(amplitude);
        if (amplitude < 0.18) {
          setMouthStage('MOUTH_CLOSED');
        } else if (amplitude < 0.5) {
          setMouthStage('MOUTH_SLIGHTLY_OPEN');
        } else {
          setMouthStage('MOUTH_OPEN');
        }
      } else {
        setMouthScaleY(0);
        setMouthStage('MOUTH_CLOSED');
      }
      animId = requestAnimationFrame(updateLipSync);
    };

    animId = requestAnimationFrame(updateLipSync);
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking, outputLevel]);

  // --- 4. Breathing & Sway Rhythm Math ---
  const breathingDuration = useMemo(() => {
    const bpm = exprConfig.breathingBpm || 16;
    return Math.max(1.4, Math.min(5.5, 60 / bpm));
  }, [exprConfig.breathingBpm]);

  const hairSwayDuration = useMemo(() => {
    return exprConfig.hairSwayDuration || 3.0;
  }, [exprConfig.hairSwayDuration]);

  // Determine active visual image source:
  // When an emotional mood is active (e.g. HAPPY on laughing, SAD on crying, ANGRY on pout, etc.),
  // show the authentic character sheet expression image so frame visual matches mood!
  const activeFaceImage = useMemo(() => {
    if (imageLoadError) return cyberpunkIdolImg;
    // 1. If an active emotional mood is present, switch to authentic mood image!
    if (normalizedMood && exprConfig?.faceUrl) {
      return formatGoogleDriveDirectUrl(exprConfig.faceUrl);
    }
    // 2. If currentVisual is provided and differs from default
    if (currentVisual && currentVisual.trim().length > 0) {
      return formatGoogleDriveDirectUrl(currentVisual.trim());
    }
    const face = exprConfig?.faceUrl || LIZA_DEFAULT_FACE;
    return formatGoogleDriveDirectUrl(face);
  }, [normalizedMood, currentVisual, exprConfig?.faceUrl, imageLoadError]);

  useEffect(() => {
    setImageLoadError(false);
  }, [currentVisual, exprConfig?.faceUrl]);

  // Head tilt degree based on mood + listening posture + micro-fidgets
  const headTilt = useMemo(() => {
    let baseTilt = (exprConfig.headTiltDeg || 0) + microFidgetAngle;
    if (isListening) baseTilt += 2.0;
    if (state === 'THINKING') baseTilt -= 3.0;
    return baseTilt;
  }, [exprConfig.headTiltDeg, microFidgetAngle, isListening, state]);

  // Dynamic Aura Glow Calculation
  const auraGlowStyle = useMemo(() => {
    if (wakeWordActive) {
      return {
        boxShadow: `0 0 60px 20px rgba(168, 85, 247, 0.8), 0 0 100px 40px rgba(236, 72, 153, 0.4)`,
        borderColor: '#d946ef',
      };
    }
    if (isSpeaking) {
      return {
        boxShadow: `0 0 45px 10px ${exprConfig.glowColor}, 0 0 80px 20px ${themeGlowColor}`,
        borderColor: exprConfig.accentColor,
      };
    }
    if (isListening) {
      return {
        boxShadow: `0 0 35px 8px rgba(6, 182, 212, 0.45), 0 0 60px 15px ${themeGlowColor}`,
        borderColor: '#06b6d4',
      };
    }
    return {
      boxShadow: `0 0 25px 5px ${exprConfig.glowColor}`,
      borderColor: 'rgba(255, 255, 255, 0.12)',
    };
  }, [wakeWordActive, isSpeaking, isListening, exprConfig, themeGlowColor]);

  const isBlushing = normalizedMood === 'HAPPY' || normalizedMood === 'CARING' || normalizedMood === 'SHY' || normalizedMood === 'TSUNDERE' || normalizedMood === 'HEART_EYES';
  const isAngry = normalizedMood === 'ANGRY';
  const isSad = normalizedMood === 'SAD';
  const isShaking = isAngry || isSad;

  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
      
      {/* 1. Dynamic Ambient Aura & Pulse Wave */}
      <AnimatePresence>
        {!isPowerSaver && (
          <motion.div
            key="avatar-ambient-aura"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: isSpeaking ? [0.35, 0.8, 0.35] : (isListening ? [0.25, 0.6, 0.25] : [0.15, 0.35, 0.15]),
              scale: isSpeaking ? [1.02, 1.15, 1.02] : (isListening ? [1.01, 1.08, 1.01] : [1, 1.04, 1]),
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: isSpeaking ? 1.6 : 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -inset-4 sm:-inset-6 rounded-[44px] pointer-events-none z-0 blur-xl opacity-75 transition-colors duration-500"
            style={{
              backgroundColor: wakeWordActive ? 'rgba(168, 85, 247, 0.5)' : exprConfig.glowColor,
            }}
          />
        )}
      </AnimatePresence>

      {/* 2. Wake Word Luminous Flare Ring */}
      <AnimatePresence>
        {wakeWordActive && (
          <motion.div
            key="wake-word-flare"
            initial={{ scale: 0.8, opacity: 1, borderWidth: '4px' }}
            animate={{ scale: 1.35, opacity: 0, borderWidth: '1px' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="absolute inset-0 rounded-[40px] pointer-events-none z-30 border-purple-400 shadow-[0_0_50px_rgba(168,85,247,0.9)]"
          />
        )}
      </AnimatePresence>

      {/* 3. Layered Character Container with Organic Spring Physics Animation & Mood Dynamics */}
      <motion.div
        onClick={onAvatarTap}
        whileHover={{
          scale: 1.02,
          transition: { type: "spring", stiffness: 380, damping: 20, mass: 0.6 }
        }}
        whileTap={{
          scale: 0.965,
          scaleY: 0.94,
          scaleX: 1.03,
          transition: { type: "spring", stiffness: 500, damping: 15, mass: 0.5 }
        }}
        className="w-full h-full relative rounded-[28px] sm:rounded-[36px] overflow-hidden z-10 shadow-2xl border transition-all duration-300 cursor-pointer group bg-black/40"
        style={auraGlowStyle}
        animate={{
          scaleY: isShaking
            ? (isAngry ? [1, 1.02, 0.98, 1.01, 1] : [1, 1.01, 0.99, 1])
            : 1,
          scaleX: isShaking
            ? (isAngry ? [1, 0.98, 1.02, 0.99, 1] : [1, 0.99, 1.01, 1])
            : 1,
          y: isAngry
            ? [0, -4, 4, -3, 3, -1, 1, 0]
            : (isSad
                ? [0, 2, -2, 1.5, -1, 0]
                : 0),
          x: isAngry
            ? [-6, 6, -5, 5, -3, 3, -1, 1, 0]
            : (isSad
                ? [-3, 3, -2, 2, -1, 1, 0]
                : 0),
          rotate: isAngry
            ? [-3, 3, -2, 2, -1, 1, 0]
            : (isSad
                ? [-1.5, 1.5, -1, 1, 0]
                : 0),
        }}
        transition={{
          scaleY: isShaking
            ? { duration: isAngry ? 0.35 : 0.65, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2 },
          scaleX: isShaking
            ? { duration: isAngry ? 0.35 : 0.65, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2 },
          y: isShaking 
            ? { duration: isAngry ? 0.35 : 0.65, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2, ease: "easeOut" },
          x: isShaking
            ? { duration: isAngry ? 0.35 : 0.65, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2, ease: "easeOut" },
          rotate: isShaking
            ? { duration: isAngry ? 0.35 : 0.65, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2, ease: "easeOut" },
        }}
      >
        {/* Layer A: Base Character Image - ONLY shakes during Angry or Crying (Sad) mood */}
        <motion.img
          key={activeFaceImage}
          src={activeFaceImage}
          alt="LIZA 2D Anime Avatar"
          onError={() => setImageLoadError(true)}
          animate={{
            rotate: isAngry 
              ? [-2, 2, -2, 2, 0] 
              : (isSad ? [-1, 1, -1, 1, 0] : 0),
            x: isAngry 
              ? [-4, 4, -3, 3, 0] 
              : (isSad ? [-2, 2, -1.5, 1.5, 0] : 0),
            y: isAngry 
              ? [-3, 3, -2, 2, 0] 
              : (isSad ? [1, -1, 1, -1, 0] : 0),
          }}
          transition={
            isShaking
              ? {
                  rotate: { duration: isAngry ? 0.32 : 0.6, repeat: Infinity, ease: "easeInOut" },
                  x: { duration: isAngry ? 0.32 : 0.6, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: isAngry ? 0.32 : 0.6, repeat: Infinity, ease: "easeInOut" },
                }
              : { duration: 0.15, ease: "easeOut" }
          }
          className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none select-none transition-opacity duration-300"
          referrerPolicy="no-referrer"
        />

        {/* Layer B: Procedural Blushing Cheeks (Mood Engine) */}
        <AnimatePresence>
          {isBlushing && (
            <motion.div
              key="anime-blush-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.45, 0.75, 0.45] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 z-15 pointer-events-none"
            >
              {/* Left Cheek Blush */}
              <div 
                className="absolute top-[46%] left-[34%] w-8 h-4 rounded-full blur-[6px] opacity-75"
                style={{ backgroundColor: '#f43f5e' }}
              />
              {/* Right Cheek Blush */}
              <div 
                className="absolute top-[46%] right-[34%] w-8 h-4 rounded-full blur-[6px] opacity-75"
                style={{ backgroundColor: '#f43f5e' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layer B2: Procedural Anime Crying Tears Overlay (When Sad / Crying / Rone pr) */}
        <AnimatePresence>
          {isSad && (
            <motion.div
              key="anime-crying-tears-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
            >
              {/* Left Tear Stream */}
              <motion.div
                animate={{ y: [0, 26], opacity: [0.95, 0.35] }}
                transition={{ duration: 1.25, repeat: Infinity, ease: "easeIn" }}
                className="absolute top-[42%] left-[35%] w-1.5 h-6 bg-gradient-to-b from-cyan-200 to-blue-400 rounded-full blur-[0.4px] shadow-[0_0_8px_rgba(56,189,248,0.8)]"
              />
              {/* Right Tear Stream */}
              <motion.div
                animate={{ y: [0, 26], opacity: [0.95, 0.35] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: 0.25, ease: "easeIn" }}
                className="absolute top-[42%] right-[35%] w-1.5 h-6 bg-gradient-to-b from-cyan-200 to-blue-400 rounded-full blur-[0.4px] shadow-[0_0_8px_rgba(56,189,248,0.8)]"
              />
              {/* Left Falling Droplet */}
              <motion.div
                animate={{ y: [0, 38], opacity: [1, 0] }}
                transition={{ duration: 0.95, repeat: Infinity, ease: "easeIn" }}
                className="absolute top-[50%] left-[35%] w-2 h-2.5 bg-cyan-200 rounded-full shadow-[0_0_6px_rgba(56,189,248,0.9)]"
              />
              {/* Right Falling Droplet */}
              <motion.div
                animate={{ y: [0, 38], opacity: [1, 0] }}
                transition={{ duration: 1.05, repeat: Infinity, delay: 0.35, ease: "easeIn" }}
                className="absolute top-[50%] right-[35%] w-2 h-2.5 bg-cyan-200 rounded-full shadow-[0_0_6px_rgba(56,189,248,0.9)]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layer C: Ambient Shimmer Glow */}
        {!isPowerSaver && (
          <motion.div
            className="absolute inset-0 w-full h-full pointer-events-none z-16 mix-blend-screen opacity-20"
            animate={{
              background: [
                `radial-gradient(circle at 30% 20%, ${themePrimaryColor} 0%, transparent 60%)`,
                `radial-gradient(circle at 70% 25%, ${themePrimaryColor} 0%, transparent 60%)`,
                `radial-gradient(circle at 30% 20%, ${themePrimaryColor} 0%, transparent 60%)`,
              ],
            }}
            transition={{
              background: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        )}

        {/* Layer F: Listening Attention Indicator Aura */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              key="listening-visor"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.15, 0.45, 0.15] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-t from-cyan-500/25 via-transparent to-purple-500/15 pointer-events-none z-30"
            />
          )}
        </AnimatePresence>

        {/* Layer G: Interactive Tap Ripple Effect */}
        <div className="absolute inset-0 bg-white/0 group-active:bg-white/10 transition-colors z-35 pointer-events-none" />

      </motion.div>

      {/* 4. Mood Dynamic Micro-Particles Suite */}
      <AnimatePresence>
        {!isPowerSaver && exprConfig.particleType === 'hearts' && (
          <motion.div
            key="hearts-particles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-[-12px] pointer-events-none z-40 overflow-visible"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`heart-${i}`}
                className="absolute text-pink-400/80"
                style={{
                  left: `${15 + (i * 14)}%`,
                  bottom: '15%',
                }}
                animate={{
                  y: [-10, -110],
                  x: [0, (i % 2 === 0 ? 15 : -15)],
                  opacity: [0, 0.9, 0],
                  scale: [0.6, 1.1, 0.4],
                }}
                transition={{
                  duration: 2.8 + (i * 0.4),
                  repeat: Infinity,
                  delay: i * 0.45,
                  ease: "easeInOut",
                }}
              >
                <Heart size={14 + (i % 3) * 4} className="fill-pink-400/60" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isPowerSaver && exprConfig.particleType === 'sparkles' && (
          <motion.div
            key="sparkles-particles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-[-10px] pointer-events-none z-40 overflow-visible"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute text-yellow-300/80"
                style={{
                  top: `${20 + (i * 14)}%`,
                  left: `${10 + (i * 16)}%`,
                }}
                animate={{
                  scale: [0, 1.25, 0],
                  rotate: [0, 90, 180],
                  opacity: [0, 0.85, 0],
                }}
                transition={{
                  duration: 2.2 + (i * 0.3),
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut",
                }}
              >
                <Sparkles size={12 + (i % 2) * 4} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isPowerSaver && exprConfig.particleType === 'sakura' && (
          <motion.div
            key="sakura-particles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-[-14px] pointer-events-none z-40 overflow-visible"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`sakura-${i}`}
                className="absolute w-3 h-2 rounded-full bg-pink-300/60 shadow-[0_0_6px_rgba(244,114,182,0.6)]"
                style={{
                  top: '10%',
                  left: `${15 + i * 18}%`,
                }}
                animate={{
                  y: [0, 140],
                  x: [0, (i % 2 === 0 ? 25 : -25), 0],
                  rotate: [0, 180, 360],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 3.5 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        )}

        {!isPowerSaver && exprConfig.particleType === 'sleep_bubbles' && (
          <motion.div
            key="sleep-particles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-[-12px] pointer-events-none z-40 overflow-visible"
          >
            {['z', 'Z', 'z'].map((txt, i) => (
              <motion.div
                key={`sleep-${i}`}
                className="absolute text-indigo-300 font-mono-spec font-bold text-xs"
                style={{
                  top: '40%',
                  right: `${20 + i * 10}%`,
                }}
                animate={{
                  y: [0, -60],
                  x: [0, 15],
                  scale: [0.7, 1.4],
                  opacity: [0, 0.85, 0],
                }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeInOut",
                }}
              >
                {txt}
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isPowerSaver && exprConfig.particleType === 'sweat' && (
          <motion.div
            key="sweat-drop"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0.3, 0.9, 0.3], y: [0, 6, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[22%] right-[26%] z-40 pointer-events-none text-cyan-400 font-bold text-sm"
          >
            💧
          </motion.div>
        )}

        {!isPowerSaver && exprConfig.particleType === 'anger_spark' && (
          <motion.div
            key="anger-spark"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.2, 0.9] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[24%] z-40 pointer-events-none text-red-500 font-bold text-sm"
          >
            💢
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

