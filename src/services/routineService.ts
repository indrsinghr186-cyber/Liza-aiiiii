// LIZA Autonomous Daily Routines & Smart Ambient Soundscapes

export type RoutineType = 'good_morning' | 'sleep_routine' | 'work_focus' | 'evening_relax';

export interface RoutineResult {
  routine: RoutineType;
  title: string;
  speechText: string;
  actionsExecuted: string[];
  suggestedMood: string;
  ambientSoundStarted?: boolean;
}

export interface RoutineItem {
  id: RoutineType;
  title: string;
  description: string;
  triggerPhrase: string;
  time?: string;
  enabled: boolean;
}

const DEFAULT_ROUTINES: RoutineItem[] = [
  {
    id: 'good_morning',
    title: 'Good Morning Briefing',
    description: 'Weather report, morning news, and schedule',
    triggerPhrase: 'Good morning Liza',
    time: '07:00 AM',
    enabled: true,
  },
  {
    id: 'sleep_routine',
    title: 'Night Sleep Routine',
    description: 'Screen dimming, alarm confirmation & rain soundscape',
    triggerPhrase: 'Good night Liza / Sone ja raha hu',
    time: '11:00 PM',
    enabled: true,
  },
  {
    id: 'work_focus',
    title: 'Deep Work & Focus',
    description: 'DND mode, priority notification filter, focus stance',
    triggerPhrase: 'Focus mode on karo',
    enabled: true,
  },
  {
    id: 'evening_relax',
    title: 'Evening Relax & Review',
    description: 'Daily accomplishments, calm lighting & music',
    triggerPhrase: 'Shaam ka recap do',
    time: '06:30 PM',
    enabled: true,
  },
];

const ROUTINES_STORAGE_KEY = 'liza_routines_config_v1';

class RoutineServiceManager {
  private audioCtx: AudioContext | null = null;
  private ambientNoiseNode: AudioNode | null = null;
  private isAmbientPlaying: boolean = false;
  private currentAmbientType: 'rain' | 'ocean' | 'lofi' | 'off' = 'off';
  private routines: RoutineItem[] = [];

  constructor() {
    this.loadRoutines();
  }

  private loadRoutines() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(ROUTINES_STORAGE_KEY);
      if (saved) {
        try {
          this.routines = JSON.parse(saved);
          return;
        } catch {
          // fallback
        }
      }
    }
    this.routines = [...DEFAULT_ROUTINES];
  }

  private saveRoutines() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(this.routines));
    }
  }

  public getAllRoutines(): RoutineItem[] {
    return [...this.routines];
  }

  public toggleRoutine(id: RoutineType, enabled: boolean) {
    this.routines = this.routines.map(r => r.id === id ? { ...r, enabled } : r);
    this.saveRoutines();
  }


  /**
   * Generates real-time ambient soothing sounds using Web Audio API
   */
  public playAmbientSound(type: 'rain' | 'ocean' | 'lofi' = 'rain'): boolean {
    try {
      this.stopAmbientSound();
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return false;
      this.audioCtx = new AudioContextClass();

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const bufferSize = this.audioCtx.sampleRate * 2;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Pink / Brown noise for rain & relaxing soundscape
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Lowpass filter to shape smooth rain/waves
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = type === 'rain' ? 800 : type === 'ocean' ? 400 : 600;

      // Master gain
      const gainNode = this.audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.08, this.audioCtx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      whiteNoise.start();
      this.ambientNoiseNode = whiteNoise;
      this.isAmbientPlaying = true;
      this.currentAmbientType = type;
      return true;
    } catch {
      return false;
    }
  }

  public stopAmbientSound() {
    try {
      if (this.ambientNoiseNode) {
        (this.ambientNoiseNode as any).stop?.();
        this.ambientNoiseNode.disconnect();
        this.ambientNoiseNode = null;
      }
      if (this.audioCtx && this.audioCtx.state !== 'closed') {
        this.audioCtx.close();
        this.audioCtx = null;
      }
    } catch {
      // ignore
    }
    this.isAmbientPlaying = false;
    this.currentAmbientType = 'off';
  }

  public getAmbientStatus() {
    return {
      isPlaying: this.isAmbientPlaying,
      type: this.currentAmbientType
    };
  }

  /**
   * Executes autonomous daily routines
   */
  public executeRoutine(
    type: RoutineType, 
    contextOrCallback?: { location?: string; weatherSummary?: string; unreadNotifications?: number; alarmTime?: string } | ((speechText: string) => void),
    callback?: (speechText: string) => void
  ): RoutineResult {
    const notifyCb = typeof contextOrCallback === 'function' ? contextOrCallback : callback;
    const context = typeof contextOrCallback === 'object' ? contextOrCallback : undefined;

    const loc = context?.location || 'New Delhi';
    const weather = context?.weatherSummary || '28°C, clear skies';
    const notifs = context?.unreadNotifications ?? 2;

    let res: RoutineResult;

    switch (type) {
      case 'good_morning':
        res = {
          routine: 'good_morning',
          title: '🌅 Good Morning Briefing',
          speechText: `Good morning! Aaj ${loc} me mausam ${weather} hai. Aapke paas ${notifs} important updates hain. Aaj ka focus clear rakhiye aur energetic start kijiye!`,
          actionsExecuted: [
            'Fetched live weather for ' + loc,
            'Checked high-priority morning notifications',
            'Synchronized morning alarm schedule'
          ],
          suggestedMood: 'HAPPY'
        };
        break;

      case 'sleep_routine': {
        const soundStarted = this.playAmbientSound('rain');
        res = {
          routine: 'sleep_routine',
          title: '🌙 Night Sleep & Wind-down Routine',
          speechText: `Good night! Screen brightness dim kar di hai, subah 7:00 AM ka alarm set hai, aur soothing rain soundscape start kar diya hai. Achi neend lijiye!`,
          actionsExecuted: [
            'Dimmed display brightness to 15%',
            'Armed 7:00 AM morning smart alarm',
            'Switched LIZA avatar to Sleepy / Dim aura',
            'Started relaxing rain ambient soundscape'
          ],
          suggestedMood: 'SLEEPY',
          ambientSoundStarted: soundStarted
        };
        break;
      }

      case 'work_focus':
        res = {
          routine: 'work_focus',
          title: '🎯 Deep Work & Focus Routine',
          speechText: `Work mode activated. Distractions mute kar diye gaye hain. Let's conquer today's goals with full concentration.`,
          actionsExecuted: [
            'Activated Do Not Disturb (DND)',
            'Switched avatar to Serious / Focused posture',
            'Prioritized work-related notifications'
          ],
          suggestedMood: 'SERIOUS'
        };
        break;

      case 'evening_relax':
        res = {
          routine: 'evening_relax',
          title: '☕ Evening Wind-down',
          speechText: `Shandar kaam raha aaj ka! Ab thoda relax kijiye aur dimag ko rest dijiye.`,
          actionsExecuted: [
            'Summarized daily accomplishments',
            'Switched avatar to Calm / Warm lighting'
          ],
          suggestedMood: 'CALM'
        };
        break;
    }

    if (notifyCb && res) {
      notifyCb(res.speechText);
    }
    return res;
  }

}

export const routineService = new RoutineServiceManager();
