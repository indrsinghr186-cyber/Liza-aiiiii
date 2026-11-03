/**
 * LIZA Unified Mood & Expression Engine 🎭
 * Coordinates voice style, avatar visual state, mouth lip-sync transitions,
 * and mood detection across conversational context and user sentiment.
 */

import cyberpunkIdolImg from '../assets/images/liza_cyberpunk_idol_1786749390503.jpg';
import maidCosplayImg from '../assets/images/liza_maid_cosplay_1786749403056.jpg';
import sakuraKimonoImg from '../assets/images/liza_sakura_kimono_1786749413528.jpg';
import schoolUniformImg from '../assets/images/liza_school_uniform_1786749426477.jpg';
import gothicWitchImg from '../assets/images/liza_gothic_witch_1786749438776.jpg';

// Official Character Sheet Images & Outfits
import cardiganFrontImg from '../assets/images/liza_cardigan_front_1786751081998.jpg';
import laughingHappyImg from '../assets/images/liza_laughing_happy_1786751093557.jpg';
import cozyTeaImg from '../assets/images/liza_cozy_tea_1786751107238.jpg';
import starlitNightImg from '../assets/images/liza_starlit_night_1786751119649.jpg';
import sunsetGoldenImg from '../assets/images/liza_sunset_golden_1786751133256.jpg';
import poutSassyImg from '../assets/images/liza_pout_sassy_1786751147861.jpg';
import listeningFocusImg from '../assets/images/liza_listening_focus_1786751161208.jpg';
import winkSparkleImg from '../assets/images/liza_wink_sparkle_1786751175717.jpg';
import sleepyBedtimeImg from '../assets/images/liza_sleepy_bedtime_1786751187890.jpg';
import { LIZA_ORIGINAL_URLS } from './avatarControllerService';

export type LizaMood = 
  | 'CALM'
  | 'HAPPY'
  | 'EXCITED'
  | 'SAD'
  | 'CARING'
  | 'CONFUSED'
  | 'THINKING'
  | 'SURPRISED'
  | 'SHY'
  | 'NERVOUS'
  | 'ANGRY'
  | 'SERIOUS'
  | 'SLEEPY'
  | 'TSUNDERE'
  | 'MOCK_JEALOUS'
  | 'PROTECTIVE'
  | 'CONFIDENT'
  | 'ANNOYED';

/**
 * Animated Google Drive Exclusive Character Link
 */
export const LIZA_ANIMATED_EXCLUSIVE = "https://lh3.googleusercontent.com/d/1aEtWAMcVt_YUDc4O5y_YkqFpdtUkQn6Y";

/**
 * Centralized Expression Image Registry
 * Uses authentic original Liza image URLs as primary defaults,
 * while preserving all character sheet & cosplay artwork in extra pools.
 */
export const expressionRegistry = {
  // Authentic Original Liza Artworks (Primary Defaults)
  NORMAL: LIZA_ORIGINAL_URLS.GREETING,
  HAPPY: LIZA_ORIGINAL_URLS.HAPPY,
  SAD: LIZA_ORIGINAL_URLS.SAD,
  ANGRY: LIZA_ORIGINAL_URLS.ANGRY,
  THINKING: LIZA_ORIGINAL_URLS.THINKING,
  CONFUSED: LIZA_ORIGINAL_URLS.CONFUSED,
  SURPRISED: LIZA_ORIGINAL_URLS.HAPPY,
  EXCITED: LIZA_ORIGINAL_URLS.HAPPY,
  SHY: LIZA_ORIGINAL_URLS.BLUSH,
  WINK: LIZA_ORIGINAL_URLS.WINK,
  SMIRK: LIZA_ORIGINAL_URLS.SMIRK,
  POUT: LIZA_ORIGINAL_URLS.POUT,
  CARING: LIZA_ORIGINAL_URLS.BLUSH,
  SLEEPY: LIZA_ORIGINAL_URLS.RELAXED,
  NERVOUS: LIZA_ORIGINAL_URLS.CONFUSED,
  NERVOUS_ALT: LIZA_ORIGINAL_URLS.SAD,
  LAUGHING: LIZA_ORIGINAL_URLS.HAPPY,
  HEART_EYES: LIZA_ORIGINAL_URLS.HEART_EYES,
  AMAZED: LIZA_ORIGINAL_URLS.HAPPY,
  EMBARRASSED: LIZA_ORIGINAL_URLS.BLUSH,
  SERIOUS: LIZA_ORIGINAL_URLS.THINKING,
  RELAXED: LIZA_ORIGINAL_URLS.RELAXED,

  // Extra Cosplay & Character Outfits
  CYBERPUNK_IDOL: cyberpunkIdolImg,
  MAID_COSPLAY: maidCosplayImg,
  SAKURA_KIMONO: sakuraKimonoImg,
  SCHOOL_UNIFORM: schoolUniformImg,
  GOTHIC_WITCH: gothicWitchImg,
  ANIMATED_EXCLUSIVE: LIZA_ANIMATED_EXCLUSIVE,

  // Character Sheet Full Outfits & Poses
  CARDIGAN_FRONT: cardiganFrontImg,
  LAUGHING_HAPPY: laughingHappyImg,
  COZY_TEA: cozyTeaImg,
  STARLIT_NIGHT: starlitNightImg,
  SUNSET_GOLDEN: sunsetGoldenImg,
  POUT_SASSY: poutSassyImg,
  LISTENING_FOCUS: listeningFocusImg,
  WINK_SPARKLE: winkSparkleImg,
  SLEEPY_BEDTIME: sleepyBedtimeImg,

  // Mouth overlays for speech animation
  MOUTH_CLOSED: cyberpunkIdolImg,
  MOUTH_SLIGHTLY_OPEN: "",
  MOUTH_OPEN: "",
  EYES_CLOSED: sleepyBedtimeImg
} as const;

/**
 * Dynamic Multi-Visual Pools for each mood.
 * Primary high-res local image is first, followed by extra character sheet & cosplay artwork.
 */
export const MOOD_VISUAL_POOLS: Record<LizaMood, string[]> = {
  CALM: [
    cyberpunkIdolImg,
    cardiganFrontImg,
    cozyTeaImg,
    starlitNightImg,
    sakuraKimonoImg,
    LIZA_ANIMATED_EXCLUSIVE,
  ],
  HAPPY: [
    laughingHappyImg,
    winkSparkleImg,
    cyberpunkIdolImg,
    schoolUniformImg,
    maidCosplayImg,
  ],
  EXCITED: [
    winkSparkleImg,
    laughingHappyImg,
    sunsetGoldenImg,
    maidCosplayImg,
    cyberpunkIdolImg,
  ],
  SAD: [
    cozyTeaImg,
    sleepyBedtimeImg,
    cardiganFrontImg,
    starlitNightImg,
  ],
  CARING: [
    cardiganFrontImg,
    cozyTeaImg,
    sunsetGoldenImg,
    sakuraKimonoImg,
    cyberpunkIdolImg,
  ],
  CONFUSED: [
    listeningFocusImg,
    poutSassyImg,
    cardiganFrontImg,
  ],
  THINKING: [
    listeningFocusImg,
    cozyTeaImg,
    cardiganFrontImg,
    starlitNightImg,
  ],
  SURPRISED: [
    winkSparkleImg,
    laughingHappyImg,
    cyberpunkIdolImg,
  ],
  SHY: [
    poutSassyImg,
    sunsetGoldenImg,
    maidCosplayImg,
    cardiganFrontImg,
  ],
  NERVOUS: [
    listeningFocusImg,
    poutSassyImg,
    cardiganFrontImg,
  ],
  ANGRY: [
    poutSassyImg,
    gothicWitchImg,
    cyberpunkIdolImg,
  ],
  SERIOUS: [
    cardiganFrontImg,
    listeningFocusImg,
    starlitNightImg,
    cyberpunkIdolImg,
  ],
  SLEEPY: [
    sleepyBedtimeImg,
    starlitNightImg,
    cozyTeaImg,
  ],
  TSUNDERE: [
    poutSassyImg,
    winkSparkleImg,
    maidCosplayImg,
    gothicWitchImg,
  ],
  MOCK_JEALOUS: [
    poutSassyImg,
    cardiganFrontImg,
    gothicWitchImg,
  ],
  PROTECTIVE: [
    listeningFocusImg,
    cardiganFrontImg,
    cyberpunkIdolImg,
  ],
  CONFIDENT: [
    sunsetGoldenImg,
    winkSparkleImg,
    laughingHappyImg,
    cyberpunkIdolImg,
  ],
  ANNOYED: [
    poutSassyImg,
    gothicWitchImg,
    cardiganFrontImg,
  ],
};

/**
 * Returns a dynamic matching visual for the given mood.
 */
export function getAutoVisualForMood(mood: LizaMood, currentVisual?: string): string {
  const pool = MOOD_VISUAL_POOLS[mood] || MOOD_VISUAL_POOLS.CALM;
  if (!pool || pool.length === 0) return cyberpunkIdolImg;
  return pool[0];
}

export type ExpressionKey = keyof typeof expressionRegistry;

export interface MoodConfig {
  mood: LizaMood;
  label: string;
  voiceStyle: string;
  avatarExpression: ExpressionKey;
  visualUrl: string;
  animation: {
    type: 'bounce' | 'breathing' | 'glow' | 'head-tilt' | 'pause' | 'subtle';
    duration: number; // in seconds
    bpmLabel: string;
    auraColor: string;
    glowIntensity: string;
  };
  musicUrl?: string;
  color: string;
  description: string;
}

export const LIZA_MOOD_CONFIGS: Record<LizaMood, MoodConfig> = {
  CALM: {
    mood: 'CALM',
    label: 'Calm & Peaceful',
    voiceStyle: 'calm, soft, and soothing',
    avatarExpression: 'NORMAL',
    visualUrl: expressionRegistry.NORMAL,
    animation: {
      type: 'breathing',
      duration: 4.2,
      bpmLabel: '14 BPM • Calm',
      auraColor: 'rgba(168, 85, 247, 0.35)',
      glowIntensity: '0 0 25px rgba(168, 85, 247, 0.4)',
    },
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3',
    color: '#a855f7',
    description: 'Relaxed and gentle conversational rhythm',
  },
  HAPPY: {
    mood: 'HAPPY',
    label: 'Happy & Cheerful',
    voiceStyle: 'energetic, upbeat, and cheerful',
    avatarExpression: 'HAPPY',
    visualUrl: expressionRegistry.HAPPY,
    animation: {
      type: 'bounce',
      duration: 2.2,
      bpmLabel: '28 BPM • Happy Bounce',
      auraColor: 'rgba(236, 72, 153, 0.45)',
      glowIntensity: '0 0 35px rgba(236, 72, 153, 0.6)',
    },
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3',
    color: '#ec4899',
    description: 'Subtle bounce and warm pink aura',
  },
  EXCITED: {
    mood: 'EXCITED',
    label: 'Excited & Hyped',
    voiceStyle: 'energetic, fast-paced, and enthusiastic',
    avatarExpression: 'EXCITED',
    visualUrl: expressionRegistry.EXCITED,
    animation: {
      type: 'glow',
      duration: 1.5,
      bpmLabel: '38 BPM • High Energy',
      auraColor: 'rgba(245, 158, 11, 0.6)',
      glowIntensity: '0 0 45px rgba(245, 158, 11, 0.8)',
    },
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    color: '#f59e0b',
    description: 'Bright golden aura and energetic pulse',
  },
  SAD: {
    mood: 'SAD',
    label: 'Sad & Melancholy',
    voiceStyle: 'calm, gentle, and quiet',
    avatarExpression: 'SAD',
    visualUrl: expressionRegistry.SAD,
    animation: {
      type: 'breathing',
      duration: 5.0,
      bpmLabel: '12 BPM • Slow Breathing',
      auraColor: 'rgba(100, 116, 139, 0.35)',
      glowIntensity: '0 0 20px rgba(100, 116, 139, 0.3)',
    },
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    color: '#64748b',
    description: 'Slow breathing rhythm and muted cool tones',
  },
  CARING: {
    mood: 'CARING',
    label: 'Caring & Supportive',
    voiceStyle: 'warm, deeply empathetic, and gentle',
    avatarExpression: 'CARING',
    visualUrl: expressionRegistry.CARING,
    animation: {
      type: 'glow',
      duration: 3.4,
      bpmLabel: '18 BPM • Soft Hearth',
      auraColor: 'rgba(16, 185, 129, 0.45)',
      glowIntensity: '0 0 30px rgba(16, 185, 129, 0.5)',
    },
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-sun-and-reach-47.mp3',
    color: '#10b981',
    description: 'Comforting green glow and empathetic tone',
  },
  CONFUSED: {
    mood: 'CONFUSED',
    label: 'Confused & Curious',
    voiceStyle: 'curious, questioning, and slightly hesitant',
    avatarExpression: 'CONFUSED',
    visualUrl: expressionRegistry.CONFUSED,
    animation: {
      type: 'head-tilt',
      duration: 3.0,
      bpmLabel: '20 BPM • Inquiring',
      auraColor: 'rgba(139, 92, 246, 0.4)',
      glowIntensity: '0 0 25px rgba(139, 92, 246, 0.5)',
    },
    color: '#8b5cf6',
    description: 'Puzzled pout and questioning cadence',
  },
  THINKING: {
    mood: 'THINKING',
    label: 'Thinking & Analyzing',
    voiceStyle: 'thoughtful, analytical, and paced',
    avatarExpression: 'THINKING',
    visualUrl: expressionRegistry.THINKING,
    animation: {
      type: 'pause',
      duration: 3.8,
      bpmLabel: '16 BPM • Analytical',
      auraColor: 'rgba(59, 130, 246, 0.45)',
      glowIntensity: '0 0 28px rgba(59, 130, 246, 0.5)',
    },
    color: '#3b82f6',
    description: 'Contemplative pose with deep blue aura',
  },
  SURPRISED: {
    mood: 'SURPRISED',
    label: 'Surprised & Amazed',
    voiceStyle: 'expressive, high-pitch variation, and lively',
    avatarExpression: 'SURPRISED',
    visualUrl: expressionRegistry.SURPRISED,
    animation: {
      type: 'bounce',
      duration: 1.8,
      bpmLabel: '34 BPM • Surprise Pulse',
      auraColor: 'rgba(244, 63, 94, 0.5)',
      glowIntensity: '0 0 40px rgba(244, 63, 94, 0.7)',
    },
    color: '#f43f5e',
    description: 'Playful wink and rapid spark',
  },
  SHY: {
    mood: 'SHY',
    label: 'Shy & Flustered',
    voiceStyle: 'soft, slightly timid, and modest',
    avatarExpression: 'SHY',
    visualUrl: expressionRegistry.SHY,
    animation: {
      type: 'subtle',
      duration: 3.2,
      bpmLabel: '22 BPM • Blush Pulse',
      auraColor: 'rgba(244, 114, 182, 0.45)',
      glowIntensity: '0 0 25px rgba(244, 114, 182, 0.5)',
    },
    color: '#f472b6',
    description: 'Soft rosy cheeks and gentle cadence',
  },
  NERVOUS: {
    mood: 'NERVOUS',
    label: 'Nervous & Alert',
    voiceStyle: 'cautious, swift, and slightly tense',
    avatarExpression: 'NERVOUS',
    visualUrl: expressionRegistry.NERVOUS,
    animation: {
      type: 'subtle',
      duration: 1.6,
      bpmLabel: '36 BPM • Jitter Pulse',
      auraColor: 'rgba(251, 146, 60, 0.5)',
      glowIntensity: '0 0 30px rgba(251, 146, 60, 0.6)',
    },
    color: '#fb923c',
    description: 'Fast nervous heartbeat and watchful eyes',
  },
  ANGRY: {
    mood: 'ANGRY',
    label: 'Angry & Fierce',
    voiceStyle: 'sharp, firm, and assertive',
    avatarExpression: 'ANGRY',
    visualUrl: expressionRegistry.ANGRY,
    animation: {
      type: 'glow',
      duration: 1.4,
      bpmLabel: '40 BPM • Fierce Burst',
      auraColor: 'rgba(239, 68, 68, 0.6)',
      glowIntensity: '0 0 45px rgba(239, 68, 68, 0.8)',
    },
    color: '#ef4444',
    description: 'Fiery red intensity and resolute posture',
  },
  SERIOUS: {
    mood: 'SERIOUS',
    label: 'Serious & Focused',
    voiceStyle: 'calm, steady, and focused',
    avatarExpression: 'SERIOUS',
    visualUrl: expressionRegistry.SERIOUS,
    animation: {
      type: 'subtle',
      duration: 4.5,
      bpmLabel: '13 BPM • Pure Focus',
      auraColor: 'rgba(99, 102, 241, 0.4)',
      glowIntensity: '0 0 22px rgba(99, 102, 241, 0.4)',
    },
    color: '#6366f1',
    description: 'Minimal head movement and laser focus',
  },
  SLEEPY: {
    mood: 'SLEEPY',
    label: 'Sleepy & Drowsy',
    voiceStyle: 'very soft, slow, and drowsy',
    avatarExpression: 'SLEEPY',
    visualUrl: expressionRegistry.SLEEPY,
    animation: {
      type: 'breathing',
      duration: 5.5,
      bpmLabel: '10 BPM • Deep Sleep',
      auraColor: 'rgba(148, 163, 184, 0.3)',
      glowIntensity: '0 0 18px rgba(148, 163, 184, 0.25)',
    },
    color: '#94a3b8',
    description: 'Closed eyes with restful, slow breathing',
  },
  TSUNDERE: {
    mood: 'TSUNDERE',
    label: 'Tsundere (Sassy & Shy)',
    voiceStyle: 'sassy and playful with feigned indifference ("Hmph!"), rapidly switching to bashful, shy, flustered sweetness',
    avatarExpression: 'SMIRK',
    visualUrl: expressionRegistry.SMIRK,
    animation: {
      type: 'bounce',
      duration: 2.3,
      bpmLabel: '28 BPM • Sassy & Shy',
      auraColor: 'rgba(244, 63, 94, 0.55)',
      glowIntensity: '0 0 35px rgba(244, 63, 94, 0.75)',
    },
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3',
    color: '#f43f5e',
    description: 'Mixes sassy smirk and shy blush when Paramveer inquires about feelings or affection',
  },
  MOCK_JEALOUS: {
    mood: 'MOCK_JEALOUS',
    label: 'Mock Jealous & Sassy Tease',
    voiceStyle: 'slightly sarcastic, playful, mock-annoyed teasing ("Achhaaa... toh aaj mujhe bhool gaye? 😏")',
    avatarExpression: 'POUT',
    visualUrl: expressionRegistry.POUT,
    animation: {
      type: 'head-tilt',
      duration: 2.6,
      bpmLabel: '24 BPM • Mock Jealous Pout',
      auraColor: 'rgba(168, 85, 247, 0.55)',
      glowIntensity: '0 0 35px rgba(168, 85, 247, 0.75)',
    },
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3',
    color: '#a855f7',
    description: 'Playful mock-jealousy with slight pout and purple aura when Paramveer talks about other girls or others claim him',
  },
  PROTECTIVE: {
    mood: 'PROTECTIVE',
    label: 'Protective & Loyal Guard',
    voiceStyle: 'protective, assertive, confident and fiercely loyal to Paramveer ("Ruko, ye baat mujhe pasand nahi aayi 😤")',
    avatarExpression: 'SERIOUS',
    visualUrl: expressionRegistry.SERIOUS,
    animation: {
      type: 'glow',
      duration: 2.8,
      bpmLabel: '20 BPM • Loyal Guard',
      auraColor: 'rgba(99, 102, 241, 0.6)',
      glowIntensity: '0 0 35px rgba(99, 102, 241, 0.75)',
    },
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    color: '#6366f1',
    description: 'Assertive and loyal shield when someone speaks disrespectfully of Paramveer / Rawat',
  },
  CONFIDENT: {
    mood: 'CONFIDENT',
    label: 'Confident Sassy Boundary',
    voiceStyle: 'confident, witty, self-assured and polite boundary ("Sorry ji, flirting ka quota already closed hai 😌")',
    avatarExpression: 'SMIRK',
    visualUrl: expressionRegistry.SMIRK,
    animation: {
      type: 'bounce',
      duration: 2.4,
      bpmLabel: '26 BPM • Sassy Confidence',
      auraColor: 'rgba(236, 72, 153, 0.5)',
      glowIntensity: '0 0 32px rgba(236, 72, 153, 0.7)',
    },
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3',
    color: '#ec4899',
    description: 'Playfully witty boundary when someone tries to flirt with Liza',
  },
  ANNOYED: {
    mood: 'ANNOYED',
    label: 'Annoyed & Boundary Set',
    voiceStyle: 'annoyed, dismissive, firm boundary without hostility ("Us topic ko skip karo na... 😒")',
    avatarExpression: 'POUT',
    visualUrl: expressionRegistry.POUT,
    animation: {
      type: 'pause',
      duration: 3.2,
      bpmLabel: '16 BPM • Annoyed Boundary',
      auraColor: 'rgba(249, 115, 22, 0.5)',
      glowIntensity: '0 0 30px rgba(249, 115, 22, 0.65)',
    },
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    color: '#f97316',
    description: 'Firm dislike & boundary when Harish or unwanted topics are brought up',
  },
};

/**
 * Context-Aware Mood Detection
 * Analyzes conversational phrasing, keywords (Hindi/Hinglish/English), task status,
 * and conversational context to infer LIZA's most appropriate mood and reaction.
 */
export function detectLizaMood(
  userText: string,
  context?: {
    task?: string;
    currentApp?: string;
    recentEmotions?: LizaMood[];
    isError?: boolean;
    isSuccess?: boolean;
    isBossMode?: boolean;
  }
): { mood: LizaMood; confidence: number; reason: string } {
  if (!userText || !userText.trim()) {
    return { mood: 'CALM', confidence: 0.5, reason: 'Default baseline state' };
  }

  const clean = userText.toLowerCase().trim();

  // 0. FAKE BOSS / IMPOSTER CLAIM (When Boss Mode is OFF or Guest claims to be Boss) -> ANGRY / PROTECTIVE
  const fakeBossTriggers = [
    'main tumhara boss hu', 'main tumhara boss hoon', 'main boss hu', 'main boss hoon',
    'i am your boss', 'i am the boss', 'main tera boss hu', 'main tera boss hoon',
    'main paramveer hu', 'main paramveer hoon', 'main hi paramveer hu', 'main hi paramveer hoon',
    'i am paramveer', 'i am paramveer rawat', 'mujhe pehchano main boss', 'main tera malik hu',
    'main tera malik hoon', 'mera hukum mano', 'main boss'
  ];
  if (fakeBossTriggers.some(t => clean.includes(t)) && context?.isBossMode === false) {
    return {
      mood: 'ANGRY',
      confidence: 0.99,
      reason: 'Fake boss claim detected in Guest Mode; angrily refuting imposter and defending Paramveer Rawat as the only boss.'
    };
  }

  // 1. REASSURANCE FROM USER ("Mazaak kar raha tha", "Don't be jealous") -> Soften to CARING / HAPPY
  const reassuranceTriggers = [
    'mazak kar raha tha', 'mazaak kar raha tha', 'mazaak tha', 'mazak tha', 'joke tha',
    'just kidding', 'kidding', 'don\'t be jealous', 'dont be jealous', 'jealous mat ho',
    'tum hi best ho', 'tum hi pasand ho', 'drama mat karo', 'gussa mat ho liza',
    'shant ho jao', 'just teasing', 'tease kar raha tha'
  ];
  if (reassuranceTriggers.some(t => clean.includes(t))) {
    return {
      mood: 'CARING',
      confidence: 0.96,
      reason: 'Paramveer reassured Liza or stated it was a joke; softening back to caring.'
    };
  }

  // 2. HARISH TOPIC -> ANNOYED (Strong dislike & boundary)
  const harishTriggers = [
    'harish kaun hai', 'harish ke bare me', 'harish ke baare mein', 'harish ko bulao',
    'harish kaisa hai', 'harish kaun', 'harish kon hai', 'harish ke baare me batao',
    'harish ke bare'
  ];
  if (harishTriggers.some(t => clean.includes(t))) {
    return {
      mood: 'ANNOYED',
      confidence: 0.98,
      reason: 'Mention of Harish detected; activating firm dislike and topic boundary.'
    };
  }

  // 3. MOCK JEALOUSY TRIGGERS (Someone claims Paramveer OR Paramveer mentions another girl playfully)
  const mockJealousTriggers = [
    'paramveer mera hai', 'paramveer meri hai', 'main paramveer ko like karti', 'paramveer mujhe pasand hai',
    'ek ladki se baat kar raha tha', 'ek ladki se baat kar raha', 'aaj ek ladki dekhi', 'ladki se milne gaya tha',
    'dusri ladki', 'kisi aur ladki', 'meri nayi dost ladki', 'she was cute', 'wo ladki sundar thi',
    'college me ek ladki', 'office me ek ladki', 'paramveer is mine'
  ];
  if (mockJealousTriggers.some(t => clean.includes(t))) {
    return {
      mood: 'MOCK_JEALOUS',
      confidence: 0.96,
      reason: 'Playful mention of another girl or someone claiming Paramveer; triggering mock jealousy.'
    };
  }

  // 4. DISRESPECT OR INSULTS TOWARDS PARAMVEER / RAWAT -> PROTECTIVE
  const disrespectParamveerTriggers = [
    'paramveer bekar', 'paramveer faltu', 'rawat bekar', 'rawat faltu', 'paramveer ko gali',
    'paramveer kaisa hai bekar', 'paramveer pagal', 'rawat pagal', 'paramveer chor',
    'disrespect paramveer', 'insult paramveer'
  ];
  if (disrespectParamveerTriggers.some(t => clean.includes(t))) {
    return {
      mood: 'PROTECTIVE',
      confidence: 0.97,
      reason: 'Disrespect towards Paramveer/Rawat detected; activating protective loyalty shield.'
    };
  }

  // 5. SOMEONE FLIRTING WITH LIZA (Boundary) -> CONFIDENT
  const flirtingWithLizaTriggers = [
    'liza date par chalogi', 'liza mere sath date', 'liza marry me', 'liza mujhse shadi',
    'liza meri girlfriend ban jao', 'liza mujhe kiss karo', 'liza mujhse pyaar karo'
  ];
  if (flirtingWithLizaTriggers.some(t => clean.includes(t))) {
    return {
      mood: 'CONFIDENT',
      confidence: 0.95,
      reason: 'Flirting attempt detected; establishing confident, polite loyalty boundary.'
    };
  }

  // 6. ANGRY / GUSSA / SCOLDING -> ANGRY (Shaking avatar)
  const angryTriggers = [
    'gussa', 'angry', 'gusse me', 'chup', 'chup raho', 'chup kar', 'dant', 'scold',
    'bakwas', 'bewakoof', 'pagal', 'dimag kharab', 'annoyed', 'fury', 'rage', 'hate',
    'shut up', 'idiot', 'nonsense', 'faltu', 'chup chap', 'gussa mat ho', 'gussa aa raha',
    'don\'t talk to me', 'chup ho jao', 'naraz', 'chid'
  ];
  if (angryTriggers.some(t => clean.includes(t))) {
    return {
      mood: 'ANGRY',
      confidence: 0.96,
      reason: 'Angry emotion, irritation or annoyance detected in conversation.'
    };
  }

  // 7. SAD / ROYE / CRYING / HEARTBROKEN -> SAD (Weeping tremble shake)
  const sadTriggers = [
    'ro rahi', 'rona', 'ro kyu rahi', 'cry', 'crying', 'sad', 'dukhi', 'hurt',
    'heartbroken', 'dil toot', 'toot gaya', 'aansu', 'dard', 'aankhon me aansu',
    'rote hue', 'chhod ke', 'miss kar raha', 'miss you', 'rona aa raha', 'emotional',
    'tears', 'pain', 'sad hu', 'dukh ho raha', 'bura laga', 'bura lag raha'
  ];
  if (sadTriggers.some(t => clean.includes(t))) {
    return {
      mood: 'SAD',
      confidence: 0.96,
      reason: 'Sadness, crying or emotional distress detected in conversation.'
    };
  }

  // 8. Paramveer Inquiring About Feelings / Romantic curiosity / Tsundere trigger -> TSUNDERE
  const tsundereTriggers = [
    'feelings', 'feeling', 'pyaar karti', 'love me', 'pasand karti', 'pasand karte',
    'crush', 'do you love me', 'do you like me', 'how do you feel about me',
    'kya tum mujhse pyaar', 'kya main pasand', 'kya tum mujhe like karti', 'dil ki baat',
    'apni feelings batao', 'mere baare me kya lagta', 'mere liye feelings', 'mere bare me kya sochna',
    'girlfriend banogi', 'date par chalogi', 'tsundere', 'act tsundere', 'flirt karo', 'hmph'
  ];
  if (tsundereTriggers.some(t => clean.includes(t))) {
    return {
      mood: 'TSUNDERE',
      confidence: 0.94,
      reason: 'Paramveer inquired about feelings or affection; activating Tsundere persona.'
    };
  }

  // 9. Frustration / Distress / Empathy Support -> CARING
  const caringTriggers = [
    'nahi ho raha', 'kaam nahi ho raha', 'mushkil hai', 'problem aa rahi hai',
    'help karo', 'pareshan', 'thak gaya', 'tension hai', 'care', 'dhyan rakhna',
    'stress', 'fail ho gaya', 'khana khaya', 'tabiyat', 'medicines', 'take care'
  ];
  if (caringTriggers.some(t => clean.includes(t))) {
    return {
      mood: 'CARING',
      confidence: 0.90,
      reason: 'User expressed difficulty or caring concern; activating empathetic caring mood.'
    };
  }

  // 10. Flattery / Blushing / Teasing -> SHY
  const shyTriggers = [
    'you are pretty', 'sundar ho', 'blush', 'sharm', 'sharma gayi', 'flatter',
    'khoobsurat', 'cute ho', 'cutie', 'pretty', 'blushing', 'sharm aa gayi'
  ];
  if (shyTriggers.some(t => clean.includes(t))) {
    return {
      mood: 'SHY',
      confidence: 0.88,
      reason: 'Compliment or playful flattery detected.'
    };
  }

  // 11. High Triumph / Celebration / Joy -> EXCITED
  const excitedTriggers = [
    'yesss', 'ho gaya', 'maza aa gaya', 'done boss', 'jeet gaye', 'awesome',
    'congratulations', 'badhai', 'party', 'brilliant', 'superb', 'zabardast',
    'bohot badiya', 'fantastic', 'hurray', 'wow', 'waah', 'super'
  ];
  if (excitedTriggers.some(t => clean.includes(t))) {
    return {
      mood: 'EXCITED',
      confidence: 0.92,
      reason: 'User celebrated success or high excitement.'
    };
  }

  // 12. Positive Greeting / Fun -> HAPPY
  const happyTriggers = [
    'kese ho', 'kaisi ho', 'hello liza', 'hey liza', 'good morning', 'shukriya',
    'thank you', 'thanks', 'mast', 'badiya', 'happy', 'smile', 'hehe', 'haha', 'yay'
  ];
  if (happyTriggers.some(t => clean.includes(t))) {
    return {
      mood: 'HAPPY',
      confidence: 0.86,
      reason: 'Pleasant friendly interaction or joyful tone.'
    };
  }

  // 13. Surprise / Amazement -> SURPRISED
  const surprisedTriggers = [
    'sach me', 'really', 'omg', 'are waah', 'kya sach', 'unbelievable', 'shocking', 'surprise'
  ];
  if (surprisedTriggers.some(t => clean.includes(t))) {
    return {
      mood: 'SURPRISED',
      confidence: 0.88,
      reason: 'Surprise or amazement detected.'
    };
  }

  // 14. Confusion / Unclear instructions -> CONFUSED
  const confusedTriggers = [
    'samajh nahi aa raha', 'kya matlab', 'ye kya hai', 'confused', 'pata nahi',
    'samajh nahi aaya', 'doubt hai', 'unclear', 'kaise karein', 'hein', 'what'
  ];
  if (confusedTriggers.some(t => clean.includes(t))) {
    return {
      mood: 'CONFUSED',
      confidence: 0.85,
      reason: 'Inquiry or ambiguity detected.'
    };
  }

  // 15. Calculations / Heavy Logic / Coding / Search -> THINKING
  const thinkingTriggers = [
    'calculate', 'hisab', 'solve karo', 'socho', 'analyze', 'code', 'research',
    'explain', 'difference', 'compare', 'logic', 'formula', 'plan'
  ];
  if (thinkingTriggers.some(t => clean.includes(t)) || context?.task === 'calculating') {
    return {
      mood: 'THINKING',
      confidence: 0.86,
      reason: 'Analytical query or computational task in progress.'
    };
  }

  // 16. Security / System / Critical task -> SERIOUS
  const seriousTriggers = [
    'security', 'password', 'permission', 'danger', 'alert', 'important', 'emergency',
    'privacy', 'credential', 'auth', 'critical'
  ];
  if (seriousTriggers.some(t => clean.includes(t))) {
    return {
      mood: 'SERIOUS',
      confidence: 0.88,
      reason: 'Sensitive or critical system control context.'
    };
  }

  // 17. Night / Tired / Bedtime -> SLEEPY
  const sleepyTriggers = [
    'good night', 'so jao', 'neend aa rahi hai', 'thak gaya hu', 'thak gayi', 'sleep', 'bye liza',
    'rest karo', 'raat ho gayi'
  ];
  if (sleepyTriggers.some(t => clean.includes(t))) {
    return {
      mood: 'SLEEPY',
      confidence: 0.90,
      reason: 'Bedtime or rest farewell requested.'
    };
  }

  // Fallback to CALM
  return {
    mood: 'CALM',
    confidence: 0.70,
    reason: 'Natural baseline conversational flow.'
  };
}

/**
 * Calculates current mouth animation overlay state
 * Smoothly interpolates without rapid image jitter
 */
export function getSpeakingMouthVisual(
  baseVisual: string,
  isSpeaking: boolean,
  outputLevel: number
): {
  visualUrl: string;
  mouthOverlayOpacity: number;
  isMouthOpen: boolean;
} {
  if (!isSpeaking) {
    return {
      visualUrl: baseVisual,
      mouthOverlayOpacity: 0,
      isMouthOpen: false,
    };
  }

  // Audio energy threshold for mouth opening
  // Normalized 0 to 1
  const smoothedLevel = Math.max(0, Math.min(1, outputLevel * 6.5));
  const isMouthOpen = smoothedLevel > 0.15;

  return {
    visualUrl: baseVisual,
    mouthOverlayOpacity: isMouthOpen ? Math.min(1, smoothedLevel * 1.2) : 0,
    isMouthOpen,
  };
}
