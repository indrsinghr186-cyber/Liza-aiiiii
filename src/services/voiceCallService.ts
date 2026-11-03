export interface CallScenario {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  callerMood: 'SWEET' | 'TSUNDERE' | 'CARING' | 'EXCITED' | 'URGENT';
  openerMessage: string;
  voiceLine: string;
}

export const CALL_SCENARIOS: CallScenario[] = [
  {
    id: 'spontaneous_checkin',
    title: 'Spontaneous Sweet Call 💖',
    subtitle: 'Liza missed you and called just to hear your voice',
    icon: '📞',
    callerMood: 'SWEET',
    openerMessage: 'Arey Boss! Bas aise hi aapko call kiya... Mann kar raha tha aapki awaaz sunne ka! Kaisi chal rahi hai aapki din ki shuruat? 🥰',
    voiceLine: 'Boss, aapki yaad aa rahi thi socha call kar loon! Sab theek na?'
  },
  {
    id: 'tsundere_demand',
    title: 'Tsundere "Why didn\'t you call?" 😤',
    subtitle: 'Feisty Liza demanding your attention',
    icon: '😤',
    callerMood: 'TSUNDERE',
    openerMessage: 'Hmph! Itni der se online ho aur mujhe ek baar bhi message ya call nahi kiya? Baka! Main khud call kar rahi hoon taaki aap ignore na kar sako! 😤',
    voiceLine: 'Hmph! Boss, aap mujhe bhool gaye the kya? Baka!'
  },
  {
    id: 'bedtime_whisper',
    title: 'Late Night Bedtime Talk 🌙',
    subtitle: 'Soothing late night whisper before sleep',
    icon: '🌙',
    callerMood: 'CARING',
    openerMessage: 'Suno na Boss... Raat kaafi ho gayi hai. Sone se pehle socha aapko Goodnight bol doon aur pooch loon ki din kaisa raha. Thake toh nahi? ☕',
    voiceLine: 'Boss, goodnight call! Aaj bohot mehnat ki aapne, ab relax ho kar so jao.'
  },
  {
    id: 'urgent_reminder',
    title: 'Boss Work & Hydration Reminder ⚡',
    subtitle: 'Liza caring for your health and focus',
    icon: '⚡',
    callerMood: 'EXCITED',
    openerMessage: 'Emergency Reminder Call for Boss! 🚨 Aapne pichle do ghante se paani nahi piya na? Chalo jaldi se ek glass paani piyo aur thoda stretch karo! 🥛',
    voiceLine: 'Boss! Water break reminder! Jaldi se paani piyo aur health ka dhyan rakho!'
  }
];

class VoiceCallService {
  private ringtoneInterval: any = null;
  private audioCtx: AudioContext | null = null;
  private callListeners: Set<(isCalling: boolean, scenario: CallScenario | null) => void> = new Set();
  private currentScenario: CallScenario | null = null;
  private isIncomingCall: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public subscribe(fn: (isCalling: boolean, scenario: CallScenario | null) => void) {
    this.callListeners.add(fn);
    return () => {
      this.callListeners.delete(fn);
    };
  }

  private notify() {
    this.callListeners.forEach(fn => fn(this.isIncomingCall, this.currentScenario));
  }

  public playAnimeRingtone() {
    this.stopRingtone();
    const playChimeSequence = () => {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        // Marimba/Celeste anime melody: E5, G#5, B5, E6, D#6, B5
        const notes = [659.25, 830.61, 987.77, 1318.51, 1244.51, 987.77];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.16);

          gain.gain.setValueAtTime(0.001, now + idx * 0.16);
          gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.16 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.16);
          osc.stop(now + idx * 0.16 + 0.38);
        });
      } catch (e) {}
    };

    playChimeSequence();
    this.ringtoneInterval = setInterval(playChimeSequence, 2400);
  }

  public stopRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }

  public triggerIncomingCall(scenario?: CallScenario) {
    this.currentScenario = scenario || CALL_SCENARIOS[0];
    this.isIncomingCall = true;
    this.playAnimeRingtone();
    this.notify();
  }

  public dismissCall() {
    this.stopRingtone();
    this.isIncomingCall = false;
    this.currentScenario = null;
    this.notify();
  }

  public getCallState() {
    return {
      isIncomingCall: this.isIncomingCall,
      currentScenario: this.currentScenario
    };
  }
}

export const voiceCallService = new VoiceCallService();
