/**
 * LIZA Real-Time Animated Avatar System 🎭
 * Layered 2D Interactive Avatar Controller & State Machine
 * 
 * Manages State + Mood compositing, randomized multi-stage blinking,
 * audio-synchronized mouth visemes, wake-word reactions, and power saver optimizations.
 */

export type AvatarState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'WAKE';

export type AvatarMood = 
  | 'CALM'
  | 'HAPPY'
  | 'EXCITED'
  | 'SAD'
  | 'CARING'
  | 'CONFUSED'
  | 'THINKING'
  | 'SURPRISED'
  | 'SLEEPY'
  | 'ANGRY'
  | 'SHY'
  | 'SERIOUS'
  | 'LAUGHING'
  | 'NERVOUS'
  | 'TSUNDERE'
  | 'WINK'
  | 'POUT'
  | 'HEART_EYES';

export type BlinkStage = 'OPEN' | 'HALF_CLOSED' | 'CLOSED';
export type MouthStage = 'MOUTH_CLOSED' | 'MOUTH_SLIGHTLY_OPEN' | 'MOUTH_OPEN';

export interface AvatarExpressionConfig {
  id: string;
  name: string;
  faceUrl: string;
  eyesClosedUrl: string;
  eyesHalfUrl?: string;
  mouthOpenUrl: string;
  mouthSlightlyOpenUrl?: string;
  accentColor: string;
  glowColor: string;
  breathingBpm: number;
  breathingScale: { x: number; y: number };
  headTiltDeg: number;
  hairSwayDuration: number;
  hairSwayAngle: number;
  hairSwayOffset: number;
  idleBobbingY: number;
  blinkMinInterval: number;
  blinkMaxInterval: number;
  gazeWanderProb: number;
  fidgetIntensity: number;
  particleType?: 'hearts' | 'sparkles' | 'sweat' | 'neon_runes' | 'sakura' | 'sleep_bubbles' | 'anger_spark' | 'none';
}

import cyberpunkIdolImg from '../assets/images/liza_cyberpunk_idol_1786749390503.jpg';
import maidCosplayImg from '../assets/images/liza_maid_cosplay_1786749403056.jpg';
import sakuraKimonoImg from '../assets/images/liza_sakura_kimono_1786749413528.jpg';
import schoolUniformImg from '../assets/images/liza_school_uniform_1786749426477.jpg';
import gothicWitchImg from '../assets/images/liza_gothic_witch_1786749438776.jpg';
import cardiganFrontImg from '../assets/images/liza_cardigan_front_1786751081998.jpg';
import laughingHappyImg from '../assets/images/liza_laughing_happy_1786751093557.jpg';
import cozyTeaImg from '../assets/images/liza_cozy_tea_1786751107238.jpg';
import starlitNightImg from '../assets/images/liza_starlit_night_1786751119649.jpg';
import sunsetGoldenImg from '../assets/images/liza_sunset_golden_1786751133256.jpg';
import poutSassyImg from '../assets/images/liza_pout_sassy_1786751147861.jpg';
import listeningFocusImg from '../assets/images/liza_listening_focus_1786751161208.jpg';
import winkSparkleImg from '../assets/images/liza_wink_sparkle_1786751175717.jpg';
import sleepyBedtimeImg from '../assets/images/liza_sleepy_bedtime_1786751187890.jpg';

export const LIZA_ORIGINAL_URLS = {
  GREETING: 'https://i.ibb.co/WWHh1m2V/hay.jpg',      // Normal / Greeting baseline
  HAPPY: 'https://i.ibb.co/Q7dWVLNg/starry-eyes.jpg', // Cheerful / Laughing / Hasne pr
  SAD: 'https://i.ibb.co/rK9HRgg5/nervous2.jpg',      // Crying / Heartbroken / Rone pr
  ANGRY: 'https://i.ibb.co/23v3Jh0y/angry.jpg',       // Gussa / Angry
  POUT: 'https://i.ibb.co/rBPqMhQ/pout.jpg',          // Cute pout / Annoyance
  THINKING: 'https://i.ibb.co/Mx8HBnh3/thinking.jpg', // Thinking / Serious
  BLUSH: 'https://i.ibb.co/k6zJ0Rby/blush.jpg',       // Shy / Praised / Caring
  SMIRK: 'https://i.ibb.co/VWnmW51k/smirk.jpg',       // Sassy / Confident
  HEART_EYES: 'https://i.ibb.co/mVMvKSpt/heart-eyes.jpg', // Affection / Romantic
  WINK: 'https://i.ibb.co/fzg90pKT/wink.jpg',         // Teasing / Flirting
  CONFUSED: 'https://i.ibb.co/LX29jXmW/nervous1.jpg', // Confused / Awkward
  RELAXED: 'https://i.ibb.co/BVSHQHBB/hair-swirl.jpg', // Sleepy / Relaxed
  FALLBACK_ANIME: 'https://i.postimg.cc/HJVN2nJx/anime-girl.png',
};

export const LIZA_FALLBACK_FACE = cyberpunkIdolImg;
export const LIZA_DEFAULT_FACE = LIZA_ORIGINAL_URLS.GREETING;
export const LIZA_MOUTH_OPEN = "";
export const LIZA_EYES_CLOSED = LIZA_ORIGINAL_URLS.RELAXED;

/**
 * Converts any Google Drive share link to a direct viewable image/video URL
 */
export function formatGoogleDriveDirectUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return url;
}

/**
 * Standard Expression Asset Map
 * Uses bundled high-definition local anime artworks for immediate instant rendering
 */
export const AVATAR_EXPRESSIONS: Record<AvatarMood, AvatarExpressionConfig> = {
  CALM: {
    id: 'calm',
    name: 'Calm & Gentle',
    faceUrl: cyberpunkIdolImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    breathingBpm: 14,
    breathingScale: { x: 1.008, y: 1.015 },
    headTiltDeg: 0,
    hairSwayDuration: 3.8,
    hairSwayAngle: 1.6,
    hairSwayOffset: 2.2,
    idleBobbingY: 1.8,
    blinkMinInterval: 2800,
    blinkMaxInterval: 6000,
    gazeWanderProb: 0.25,
    fidgetIntensity: 0.3,
    particleType: 'sakura',
  },
  HAPPY: {
    id: 'happy',
    name: 'Happy & Cheerful',
    faceUrl: laughingHappyImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.45)',
    breathingBpm: 28,
    breathingScale: { x: 1.015, y: 1.028 },
    headTiltDeg: 1.8,
    hairSwayDuration: 2.2,
    hairSwayAngle: 2.8,
    hairSwayOffset: 3.8,
    idleBobbingY: 3.2,
    blinkMinInterval: 2200,
    blinkMaxInterval: 4800,
    gazeWanderProb: 0.4,
    fidgetIntensity: 0.7,
    particleType: 'sparkles',
  },
  EXCITED: {
    id: 'excited',
    name: 'Excited & Hyped',
    faceUrl: winkSparkleImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.55)',
    breathingBpm: 38,
    breathingScale: { x: 1.022, y: 1.036 },
    headTiltDeg: -2.5,
    hairSwayDuration: 1.6,
    hairSwayAngle: 3.6,
    hairSwayOffset: 4.6,
    idleBobbingY: 4.2,
    blinkMinInterval: 1400,
    blinkMaxInterval: 3200,
    gazeWanderProb: 0.6,
    fidgetIntensity: 0.9,
    particleType: 'sparkles',
  },
  SAD: {
    id: 'sad',
    name: 'Sad & Melancholic',
    faceUrl: cozyTeaImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    breathingBpm: 12,
    breathingScale: { x: 1.005, y: 1.01 },
    headTiltDeg: 2.2,
    hairSwayDuration: 4.8,
    hairSwayAngle: 0.9,
    hairSwayOffset: 1.2,
    idleBobbingY: 1.0,
    blinkMinInterval: 3200,
    blinkMaxInterval: 7000,
    gazeWanderProb: 0.15,
    fidgetIntensity: 0.2,
    particleType: 'none',
  },
  CARING: {
    id: 'caring',
    name: 'Caring & Loving',
    faceUrl: cardiganFrontImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#10b981',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    breathingBpm: 18,
    breathingScale: { x: 1.01, y: 1.02 },
    headTiltDeg: 1.5,
    hairSwayDuration: 3.2,
    hairSwayAngle: 2.0,
    hairSwayOffset: 2.8,
    idleBobbingY: 2.0,
    blinkMinInterval: 2500,
    blinkMaxInterval: 5500,
    gazeWanderProb: 0.35,
    fidgetIntensity: 0.4,
    particleType: 'hearts',
  },
  CONFUSED: {
    id: 'confused',
    name: 'Confused & Wondering',
    faceUrl: listeningFocusImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    breathingBpm: 20,
    breathingScale: { x: 1.01, y: 1.018 },
    headTiltDeg: 4.5,
    hairSwayDuration: 3.0,
    hairSwayAngle: 2.2,
    hairSwayOffset: 3.0,
    idleBobbingY: 2.2,
    blinkMinInterval: 2000,
    blinkMaxInterval: 4500,
    gazeWanderProb: 0.7,
    fidgetIntensity: 0.6,
    particleType: 'none',
  },
  THINKING: {
    id: 'thinking',
    name: 'Deep in Thought',
    faceUrl: listeningFocusImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    breathingBpm: 16,
    breathingScale: { x: 1.008, y: 1.014 },
    headTiltDeg: -3.0,
    hairSwayDuration: 3.6,
    hairSwayAngle: 1.4,
    hairSwayOffset: 1.8,
    idleBobbingY: 1.6,
    blinkMinInterval: 3000,
    blinkMaxInterval: 6500,
    gazeWanderProb: 0.8,
    fidgetIntensity: 0.3,
    particleType: 'none',
  },
  SURPRISED: {
    id: 'surprised',
    name: 'Surprised & Amazed',
    faceUrl: winkSparkleImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    breathingBpm: 34,
    breathingScale: { x: 1.018, y: 1.032 },
    headTiltDeg: -1.0,
    hairSwayDuration: 1.8,
    hairSwayAngle: 3.2,
    hairSwayOffset: 4.2,
    idleBobbingY: 3.8,
    blinkMinInterval: 1600,
    blinkMaxInterval: 3500,
    gazeWanderProb: 0.5,
    fidgetIntensity: 0.85,
    particleType: 'sparkles',
  },
  SHY: {
    id: 'shy',
    name: 'Shy & Blushing',
    faceUrl: poutSassyImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    breathingBpm: 22,
    breathingScale: { x: 1.012, y: 1.022 },
    headTiltDeg: 2.0,
    hairSwayDuration: 2.6,
    hairSwayAngle: 1.8,
    hairSwayOffset: 2.4,
    idleBobbingY: 1.9,
    blinkMinInterval: 1800,
    blinkMaxInterval: 4000,
    gazeWanderProb: 0.3,
    fidgetIntensity: 0.5,
    particleType: 'sweat',
  },
  NERVOUS: {
    id: 'nervous',
    name: 'Nervous & Fidgety',
    faceUrl: listeningFocusImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    breathingBpm: 36,
    breathingScale: { x: 1.016, y: 1.026 },
    headTiltDeg: -2.0,
    hairSwayDuration: 1.7,
    hairSwayAngle: 2.6,
    hairSwayOffset: 3.4,
    idleBobbingY: 3.0,
    blinkMinInterval: 1400,
    blinkMaxInterval: 3000,
    gazeWanderProb: 0.75,
    fidgetIntensity: 0.95,
    particleType: 'sweat',
  },
  ANGRY: {
    id: 'angry',
    name: 'Pouty & Angry',
    faceUrl: poutSassyImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    breathingBpm: 40,
    breathingScale: { x: 1.025, y: 1.038 },
    headTiltDeg: -1.5,
    hairSwayDuration: 1.9,
    hairSwayAngle: 3.0,
    hairSwayOffset: 3.6,
    idleBobbingY: 3.4,
    blinkMinInterval: 2400,
    blinkMaxInterval: 5000,
    gazeWanderProb: 0.3,
    fidgetIntensity: 0.8,
    particleType: 'anger_spark',
  },
  SERIOUS: {
    id: 'serious',
    name: 'Focused & Serious',
    faceUrl: cardiganFrontImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.35)',
    breathingBpm: 13,
    breathingScale: { x: 1.006, y: 1.012 },
    headTiltDeg: 0,
    hairSwayDuration: 4.2,
    hairSwayAngle: 1.2,
    hairSwayOffset: 1.6,
    idleBobbingY: 1.4,
    blinkMinInterval: 3200,
    blinkMaxInterval: 6800,
    gazeWanderProb: 0.2,
    fidgetIntensity: 0.2,
    particleType: 'none',
  },
  SLEEPY: {
    id: 'sleepy',
    name: 'Sleepy & Drowsy',
    faceUrl: sleepyBedtimeImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.25)',
    breathingBpm: 10,
    breathingScale: { x: 1.004, y: 1.008 },
    headTiltDeg: 3.5,
    hairSwayDuration: 5.5,
    hairSwayAngle: 0.8,
    hairSwayOffset: 1.0,
    idleBobbingY: 0.9,
    blinkMinInterval: 1200,
    blinkMaxInterval: 2800,
    gazeWanderProb: 0.1,
    fidgetIntensity: 0.1,
    particleType: 'sleep_bubbles',
  },
  LAUGHING: {
    id: 'laughing',
    name: 'Laughing & Giggling',
    faceUrl: laughingHappyImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.55)',
    breathingBpm: 32,
    breathingScale: { x: 1.02, y: 1.035 },
    headTiltDeg: -2.8,
    hairSwayDuration: 1.7,
    hairSwayAngle: 3.4,
    hairSwayOffset: 4.4,
    idleBobbingY: 4.0,
    blinkMinInterval: 1500,
    blinkMaxInterval: 3600,
    gazeWanderProb: 0.45,
    fidgetIntensity: 0.9,
    particleType: 'sparkles',
  },
  TSUNDERE: {
    id: 'tsundere',
    name: 'Tsundere & Sassy',
    faceUrl: poutSassyImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.65)',
    breathingBpm: 30,
    breathingScale: { x: 1.018, y: 1.03 },
    headTiltDeg: 2.2,
    hairSwayDuration: 2.0,
    hairSwayAngle: 2.8,
    hairSwayOffset: 3.6,
    idleBobbingY: 3.2,
    blinkMinInterval: 1600,
    blinkMaxInterval: 3800,
    gazeWanderProb: 0.5,
    fidgetIntensity: 0.8,
    particleType: 'hearts',
  },
  WINK: {
    id: 'wink',
    name: 'Playful Wink',
    faceUrl: winkSparkleImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.5)',
    breathingBpm: 26,
    breathingScale: { x: 1.012, y: 1.022 },
    headTiltDeg: -2.0,
    hairSwayDuration: 2.4,
    hairSwayAngle: 2.5,
    hairSwayOffset: 3.2,
    idleBobbingY: 2.8,
    blinkMinInterval: 2000,
    blinkMaxInterval: 4500,
    gazeWanderProb: 0.4,
    fidgetIntensity: 0.6,
    particleType: 'sparkles',
  },
  POUT: {
    id: 'pout',
    name: 'Cute Pout',
    faceUrl: poutSassyImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#fb7185',
    glowColor: 'rgba(251, 113, 133, 0.45)',
    breathingBpm: 24,
    breathingScale: { x: 1.014, y: 1.02 },
    headTiltDeg: 3.0,
    hairSwayDuration: 2.8,
    hairSwayAngle: 1.8,
    hairSwayOffset: 2.5,
    idleBobbingY: 2.2,
    blinkMinInterval: 2200,
    blinkMaxInterval: 4800,
    gazeWanderProb: 0.35,
    fidgetIntensity: 0.5,
    particleType: 'sweat',
  },
  HEART_EYES: {
    id: 'heart_eyes',
    name: 'Loving Heart Eyes',
    faceUrl: cozyTeaImg,
    eyesClosedUrl: sleepyBedtimeImg,
    mouthOpenUrl: "",
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.6)',
    breathingBpm: 34,
    breathingScale: { x: 1.02, y: 1.034 },
    headTiltDeg: 1.8,
    hairSwayDuration: 1.8,
    hairSwayAngle: 3.2,
    hairSwayOffset: 4.0,
    idleBobbingY: 3.6,
    blinkMinInterval: 1400,
    blinkMaxInterval: 3200,
    gazeWanderProb: 0.45,
    fidgetIntensity: 0.85,
    particleType: 'hearts',
  }
};

// Map each mood expression to its authentic original Liza artwork
export const MOOD_TO_ORIGINAL_IMAGE: Record<AvatarMood, string> = {
  CALM: LIZA_ORIGINAL_URLS.GREETING,
  HAPPY: LIZA_ORIGINAL_URLS.HAPPY,
  EXCITED: LIZA_ORIGINAL_URLS.HAPPY,
  SAD: LIZA_ORIGINAL_URLS.SAD,
  CARING: LIZA_ORIGINAL_URLS.BLUSH,
  CONFUSED: LIZA_ORIGINAL_URLS.CONFUSED,
  THINKING: LIZA_ORIGINAL_URLS.THINKING,
  SURPRISED: LIZA_ORIGINAL_URLS.HAPPY,
  SHY: LIZA_ORIGINAL_URLS.BLUSH,
  NERVOUS: LIZA_ORIGINAL_URLS.CONFUSED,
  ANGRY: LIZA_ORIGINAL_URLS.ANGRY,
  SERIOUS: LIZA_ORIGINAL_URLS.THINKING,
  SLEEPY: LIZA_ORIGINAL_URLS.RELAXED,
  TSUNDERE: LIZA_ORIGINAL_URLS.POUT,
  LAUGHING: LIZA_ORIGINAL_URLS.HAPPY,
  WINK: LIZA_ORIGINAL_URLS.WINK,
  POUT: LIZA_ORIGINAL_URLS.POUT,
  HEART_EYES: LIZA_ORIGINAL_URLS.HEART_EYES,
};

// Wire authentic original images into expression configs
(Object.keys(MOOD_TO_ORIGINAL_IMAGE) as AvatarMood[]).forEach((mood) => {
  if (AVATAR_EXPRESSIONS[mood]) {
    AVATAR_EXPRESSIONS[mood].faceUrl = MOOD_TO_ORIGINAL_IMAGE[mood];
    AVATAR_EXPRESSIONS[mood].eyesClosedUrl = LIZA_ORIGINAL_URLS.RELAXED;
  }
});

/**
 * Avatar Renderer Architecture Interface
 * Facilitates dropping in Live2D or 3D WebGL renderer without breaking state/voice bindings.
 */
export interface IAvatarRenderer {
  type: 'image' | 'live2d' | 'canvas';
  render(context: AvatarRenderContext): void;
}

export interface AvatarRenderContext {
  state: AvatarState;
  mood: AvatarMood;
  blinkStage: BlinkStage;
  mouthStage: MouthStage;
  audioOutputLevel: number;
  isPowerSaver: boolean;
  wakeWordTriggered: boolean;
}

type AvatarListener = (state: AvatarState, mood: AvatarMood) => void;

class AvatarControllerService {
  private state: AvatarState = 'IDLE';
  private mood: AvatarMood = 'CALM';
  private isPowerSaver: boolean = false;
  private isWakeActive: boolean = false;
  private listeners: Set<AvatarListener> = new Set();
  private wakeTimeoutId: any = null;

  constructor() {
    // Check initial battery/power saver preference if saved
    try {
      const savedPowerSaver = localStorage.getItem('liza_power_saver_mode');
      if (savedPowerSaver) {
        this.isPowerSaver = JSON.parse(savedPowerSaver);
      }
    } catch (e) {}
  }

  public getState(): AvatarState {
    return this.state;
  }

  public getMood(): AvatarMood {
    return this.mood;
  }

  public setState(newState: AvatarState): void {
    if (this.state === newState) return;
    this.state = newState;
    this.notify();
  }

  public setMood(newMood: AvatarMood): void {
    if (this.mood === newMood) return;
    this.mood = newMood;
    this.notify();
  }

  public setPowerSaver(enabled: boolean): void {
    this.isPowerSaver = enabled;
    try {
      localStorage.setItem('liza_power_saver_mode', JSON.stringify(enabled));
    } catch (e) {}
    this.notify();
  }

  public getIsPowerSaver(): boolean {
    return this.isPowerSaver;
  }

  /**
   * Trigger instant Wake Word visual reaction ("Hey Liza")
   */
  public triggerWakeWord(): void {
    this.isWakeActive = true;
    this.setState('WAKE');
    
    if (this.wakeTimeoutId) {
      clearTimeout(this.wakeTimeoutId);
    }

    // Wake flare for 900ms, then seamlessly switch to LISTENING state
    this.wakeTimeoutId = setTimeout(() => {
      this.isWakeActive = false;
      this.setState('LISTENING');
    }, 950);

    this.notify();
  }

  public isWakeWordActive(): boolean {
    return this.isWakeActive;
  }

  public subscribe(listener: AvatarListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(fn => fn(this.state, this.mood));
  }
}

export const avatarController = new AvatarControllerService();
