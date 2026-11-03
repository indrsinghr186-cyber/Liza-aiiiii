// LIZA Pro Voice Tuning & Multilingual Accent Switcher Service

export type DialectProfile = 'hinglish' | 'pure_hindi' | 'indian_english' | 'global_english';
export type HotwordSensitivity = 'low' | 'normal' | 'high';

export interface VoiceTuningConfig {
  speed: number;             // 0.75 to 1.5 (default 1.0)
  pitch: number;             // 0.8 to 1.3 (default 1.0)
  warmth: number;            // 0.0 to 1.0 (default 0.7)
  dialect: DialectProfile;   // 'hinglish' | 'pure_hindi' | 'indian_english' | 'global_english'
  selectedWakeWord: string;  // e.g. "Hey Liza", "Hey Rawat", "Namaste Liza", "Suno Liza", "RAWAT AI"
  hotwordSensitivity: HotwordSensitivity;
  availableWakeWords: string[];
}

const STORAGE_KEY = 'liza_voice_tuning_config_v1';

export const DIALECT_DESCRIPTIONS: Record<DialectProfile, { label: string; desc: string; sample: string; promptGuide: string }> = {
  hinglish: {
    label: 'Casual Hinglish (Default)',
    desc: 'Friendly, natural conversational blend of Hindi & English.',
    sample: 'Hey! Main bilkul ready hu. Bataiye kya help kar sakti hu?',
    promptGuide: 'Speak naturally in casual Hinglish, warm and relatable.'
  },
  pure_hindi: {
    label: 'Pure Hindi (शुद्ध हिन्दी)',
    desc: 'Fluent, courteous, and grammatically rich Hindi speech.',
    sample: 'नमस्ते! मैं आपकी किस प्रकार सहायता कर सकती हूँ?',
    promptGuide: 'Speak in pure, formal, courteous Hindi with respectful vocabulary.'
  },
  indian_english: {
    label: 'Indian English',
    desc: 'Crisp, natural English with authentic Indian phrasing & warmth.',
    sample: 'Hello! I am ready to assist you. What shall we work on today?',
    promptGuide: 'Speak in fluent, clear Indian English with warm conversational tone.'
  },
  global_english: {
    label: 'Global / Pure English',
    desc: 'Standard international neutral English accent & pacing.',
    sample: 'Hi there! Everything is set. How can I help you right now?',
    promptGuide: 'Speak in standard, articulate international English.'
  }
};

export const DEFAULT_WAKE_WORDS = [
  'Hey Liza',
  'Hey Rawat',
  'Namaste Liza',
  'Suno Liza',
  'RAWAT AI'
];

class VoiceTuningManager {
  private config: VoiceTuningConfig = {
    speed: 1.0,
    pitch: 1.0,
    warmth: 0.8,
    dialect: 'hinglish',
    selectedWakeWord: 'Hey Liza',
    hotwordSensitivity: 'normal',
    availableWakeWords: [...DEFAULT_WAKE_WORDS]
  };

  private listeners: Set<(config: VoiceTuningConfig) => void> = new Set();

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          this.config = { ...this.config, ...JSON.parse(saved) };
        } catch {
          // ignore
        }
      }
    }
  }

  private saveConfig() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.getConfig()));
  }

  public subscribe(cb: (config: VoiceTuningConfig) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public getConfig(): VoiceTuningConfig {
    return { ...this.config, availableWakeWords: [...this.config.availableWakeWords] };
  }

  public updateConfig(partial: Partial<VoiceTuningConfig>) {
    this.config = { ...this.config, ...partial };
    this.saveConfig();
  }

  public setDialect(dialect: DialectProfile) {
    this.updateConfig({ dialect });
  }

  public setSpeed(speed: number) {
    this.updateConfig({ speed: Math.max(0.5, Math.min(2.0, speed)) });
  }

  public setPitch(pitch: number) {
    this.updateConfig({ pitch: Math.max(0.5, Math.min(1.8, pitch)) });
  }

  public setWarmth(warmth: number) {
    this.updateConfig({ warmth: Math.max(0.0, Math.min(1.0, warmth)) });
  }

  public addCustomWakeWord(word: string): boolean {

    const trimmed = word.trim();
    if (!trimmed || this.config.availableWakeWords.includes(trimmed)) return false;
    this.config.availableWakeWords.push(trimmed);
    this.config.selectedWakeWord = trimmed;
    this.saveConfig();
    return true;
  }

  /**
   * Plays real-time preview audio sample of current voice settings
   */
  public playPreviewSample() {
    const text = DIALECT_DESCRIPTIONS[this.config.dialect].sample;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.config.speed;
      utterance.pitch = this.config.pitch;
      
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        (v.lang.includes('hi') || v.lang.includes('IN') || v.name.includes('India') || v.name.includes('Female'))
      ) || voices[0];

      if (femaleVoice) utterance.voice = femaleVoice;
      window.speechSynthesis.speak(utterance);
    }
  }
}

export const voiceTuningService = new VoiceTuningManager();
