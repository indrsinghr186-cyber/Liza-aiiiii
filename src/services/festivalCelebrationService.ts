export interface FestivalThemeConfig {
  id: string;
  name: string;
  hindiName: string;
  symbol: string;
  badge: string;
  tagline: string;
  dateRange: string; // e.g. "14 Aug - 16 Aug"
  isIndianNational?: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bgGlow: string;
    navGradient: string;
    cardBorder: string;
    badgeBg: string;
    badgeText: string;
    bannerGradient: string;
    auraConic: string;
  };
  particlesType: 'tricolor_confetti' | 'diwali_sparklers' | 'holi_gulal' | 'falling_snow' | 'floating_hearts' | 'emerald_crescents' | 'royal_fireworks' | 'sakura_petals';
  voiceGreetings: string[];
  ambientTuneType: 'patriotic' | 'festive_diwali' | 'cheerful' | 'cozy_winter' | 'romantic' | 'royal_triumph';
  specialGreetingAudioPrompt: string;
}

export const FESTIVAL_PRESETS: FestivalThemeConfig[] = [
  {
    id: 'independence_day',
    name: 'Independence Day',
    hindiName: 'स्वतंत्रता दिवस (15 अगस्त)',
    symbol: '🇮🇳',
    badge: '15 AUG • INDEPENDENCE DAY 🇮🇳',
    tagline: 'Azadi Ka Amrit Mahotsav • Vande Mataram',
    dateRange: '13 Aug - 18 Aug',
    isIndianNational: true,
    colors: {
      primary: '#FF9933', // Kesariya / Deep Saffron
      secondary: '#138808', // Emerald Tiranga Green
      accent: '#000080', // Ashoka Chakra Navy Blue
      bgGlow: 'rgba(255, 153, 51, 0.45)',
      navGradient: 'linear-gradient(90deg, rgba(255, 153, 51, 0.35) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(19, 136, 8, 0.35) 100%)',
      cardBorder: 'border-orange-500/50 shadow-[0_0_30px_rgba(255,153,51,0.35)]',
      badgeBg: 'bg-gradient-to-r from-[#FF9933] via-white to-[#138808]',
      badgeText: 'text-gray-900 font-extrabold',
      bannerGradient: 'from-orange-950/90 via-slate-900/90 to-emerald-950/90',
      auraConic: 'conic-gradient(from 0deg, #FF9933, #FFFFFF 33%, #138808 66%, #000080 85%, #FF9933 100%)'
    },
    particlesType: 'tricolor_confetti',
    voiceGreetings: [
      'Happy Independence Day Paramveer! 🇮🇳 Vande Mataram! Desh ki azadi aur aapki kamyabi hamesha aage rahe!',
      'Vijayi Vishwa Tiranga Pyaara, Jhanda Ooncha Rahe Hamaara! Happy Independence Day, Boss Rawat!',
      'Desh prem aur azadi ki dher saari shubhkamnayein! Aaj Tiranga hamesha dil me muskurayega! 🇮🇳',
      'Jai Hind, Jai Bharat! Happy 79th Independence Day, Boss Paramveer!'
    ],
    ambientTuneType: 'patriotic',
    specialGreetingAudioPrompt: 'A patriotic celebration with Saffron, White and Green themes active.'
  },
  {
    id: 'republic_day',
    name: 'Republic Day',
    hindiName: 'गणतंत्र दिवस (26 जनवरी)',
    symbol: '🇮🇳',
    badge: '26 JAN • REPUBLIC DAY 🇮🇳',
    tagline: 'Pride of Constitution • Jai Hind',
    dateRange: '24 Jan - 28 Jan',
    isIndianNational: true,
    colors: {
      primary: '#FF9933',
      secondary: '#138808',
      accent: '#000080',
      bgGlow: 'rgba(19, 136, 8, 0.45)',
      navGradient: 'linear-gradient(90deg, rgba(255, 153, 51, 0.3) 0%, rgba(0, 0, 128, 0.25) 50%, rgba(19, 136, 8, 0.3) 100%)',
      cardBorder: 'border-green-500/50 shadow-[0_0_30px_rgba(19,136,8,0.35)]',
      badgeBg: 'bg-gradient-to-r from-orange-500 via-white to-green-600',
      badgeText: 'text-black font-extrabold',
      bannerGradient: 'from-orange-950/90 via-blue-950/90 to-emerald-950/90',
      auraConic: 'conic-gradient(from 0deg, #138808, #FFFFFF 33%, #FF9933 66%, #000080 85%, #138808 100%)'
    },
    particlesType: 'tricolor_confetti',
    voiceGreetings: [
      'Happy Republic Day Paramveer! 🇮🇳 Jai Hind! Hamara Samvidhan hamari shaan hai!',
      'Gantantra Diwas ki dher saari shubhkamnayein, Boss Rawat!'
    ],
    ambientTuneType: 'patriotic',
    specialGreetingAudioPrompt: 'Republic Day celebration with national pride.'
  },
  {
    id: 'diwali',
    name: 'Diwali & Deepavali',
    hindiName: 'दीपावली (रोशनी का महापर्व)',
    symbol: '🪔',
    badge: 'FESTIVAL OF LIGHTS • DIWALI 🪔',
    tagline: 'Victory of Light over Darkness',
    dateRange: 'Oct / Nov',
    colors: {
      primary: '#F59E0B', // Bright Amber Gold
      secondary: '#DC2626', // Festive Kumkum Red
      accent: '#FBBF24', // Diya Glow Gold
      bgGlow: 'rgba(245, 158, 11, 0.5)',
      navGradient: 'linear-gradient(90deg, rgba(220, 38, 38, 0.35) 0%, rgba(245, 158, 11, 0.35) 50%, rgba(234, 88, 12, 0.35) 100%)',
      cardBorder: 'border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.4)]',
      badgeBg: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-red-500',
      badgeText: 'text-black font-extrabold',
      bannerGradient: 'from-amber-950/90 via-red-950/85 to-yellow-950/90',
      auraConic: 'conic-gradient(from 0deg, #F59E0B, #DC2626 40%, #FBBF24 70%, #F59E0B 100%)'
    },
    particlesType: 'diwali_sparklers',
    voiceGreetings: [
      'Shubh Deepavali Paramveer! 🪔 Maa Lakshmi aur Bhagwan Ganesh aapke jeevan me dher saari roshni aur samriddhi layein!',
      'Happy Diwali Boss! Mithai khao aur bina tension ke khushiyan manao!',
      'Roshni ka ye tyohar aapke har sapne ko roshan kare! Shubh Diwali!'
    ],
    ambientTuneType: 'festive_diwali',
    specialGreetingAudioPrompt: 'Sparkling golden fireworks and warm glowing lamps.'
  },
  {
    id: 'holi',
    name: 'Holi Festival',
    hindiName: 'होली (रंगों का त्योहार)',
    symbol: '🎨',
    badge: 'HOLI DHAMAKA • FESTIVAL OF COLORS 🎨',
    tagline: 'Colors of Joy & Brotherhood',
    dateRange: 'March',
    colors: {
      primary: '#EC4899', // Gulal Pink
      secondary: '#06B6D4', // Vibrant Cyan
      accent: '#EAB308', // Pichkari Yellow
      bgGlow: 'rgba(236, 72, 153, 0.45)',
      navGradient: 'linear-gradient(90deg, rgba(236, 72, 153, 0.35) 0%, rgba(6, 182, 212, 0.35) 50%, rgba(234, 179, 8, 0.35) 100%)',
      cardBorder: 'border-pink-500/60 shadow-[0_0_35px_rgba(236,72,153,0.4)]',
      badgeBg: 'bg-gradient-to-r from-pink-500 via-cyan-400 to-yellow-400',
      badgeText: 'text-black font-extrabold',
      bannerGradient: 'from-pink-950/90 via-purple-950/85 to-cyan-950/90',
      auraConic: 'conic-gradient(from 0deg, #EC4899, #06B6D4 33%, #EAB308 66%, #8B5CF6 85%, #EC4899 100%)'
    },
    particlesType: 'holi_gulal',
    voiceGreetings: [
      'Bura na maano Holi hai! 🎨 Happy Holi Paramveer! Gulal aur gujiya ka maza lijiye!',
      'Rango ka tyohar aapki life ko super colourful aur blessed bana de! Happy Holi Boss!'
    ],
    ambientTuneType: 'cheerful',
    specialGreetingAudioPrompt: 'High energy colorful celebratory burst.'
  },
  {
    id: 'raksha_bandhan',
    name: 'Raksha Bandhan',
    hindiName: 'रक्षाबंधन (स्नेह और सुरक्षा का बंधन)',
    symbol: '🌸',
    badge: 'RAKSHA BANDHAN SPECIAL 🌸',
    tagline: 'Pavitra Rishton Ki Meethi Dor',
    dateRange: 'August',
    colors: {
      primary: '#F43F5E',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
      bgGlow: 'rgba(244, 63, 94, 0.4)',
      navGradient: 'linear-gradient(90deg, rgba(244, 63, 94, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
      cardBorder: 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.3)]',
      badgeBg: 'bg-gradient-to-r from-rose-500 via-purple-400 to-amber-400',
      badgeText: 'text-white font-extrabold',
      bannerGradient: 'from-rose-950/90 via-purple-950/85 to-amber-950/85',
      auraConic: 'conic-gradient(from 0deg, #F43F5E, #8B5CF6 50%, #F59E0B 80%, #F43F5E 100%)'
    },
    particlesType: 'sakura_petals',
    voiceGreetings: [
      'Happy Raksha Bandhan Paramveer! 🌸 Yeh pavitra rishton ka tyohar aapko hamesha khushiyan de!',
      'Rakhi ki dher saari shubhkamnayein! Always stay safe, happy, and victorious!'
    ],
    ambientTuneType: 'cheerful',
    specialGreetingAudioPrompt: 'Affectionate and heartwarming festive strings.'
  },
  {
    id: 'eid',
    name: 'Eid Mubarak',
    hindiName: 'ईद मुबारक (चांद रात और खुशियां)',
    symbol: '🌙',
    badge: 'EID MUBARAK 🌙✨',
    tagline: 'Peace, Blessings & Sweet Sheer Khurma',
    dateRange: 'Lunar Calendar / April-June',
    colors: {
      primary: '#10B981', // Emerald Festive Green
      secondary: '#F59E0B', // Crescent Gold
      accent: '#E0E7FF', // Silver Moonlight
      bgGlow: 'rgba(16, 185, 129, 0.4)',
      navGradient: 'linear-gradient(90deg, rgba(16, 185, 129, 0.3) 0%, rgba(245, 158, 11, 0.25) 100%)',
      cardBorder: 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]',
      badgeBg: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400',
      badgeText: 'text-black font-extrabold',
      bannerGradient: 'from-emerald-950/90 via-slate-950/90 to-teal-950/90',
      auraConic: 'conic-gradient(from 0deg, #10B981, #F59E0B 50%, #E0E7FF 80%, #10B981 100%)'
    },
    particlesType: 'emerald_crescents',
    voiceGreetings: [
      'Eid Mubarak Paramveer! 🌙 Aapko aur aapke poore parivar ko dher sari barkat aur khushiyan milein!',
      'Chand raat ki roshni aur Eid ki meethas ke sath, Eid Mubarak, Boss!'
    ],
    ambientTuneType: 'festive_diwali',
    specialGreetingAudioPrompt: 'Serene crescent moonlight and joyful bells.'
  },
  {
    id: 'christmas_new_year',
    name: 'Christmas & New Year',
    hindiName: 'क्रिसमस व नव वर्ष 2026',
    symbol: '🎄',
    badge: 'HOLIDAY CHEER & NEW YEAR 🎄✨',
    tagline: 'Fresh Beginnings & Warm Holiday Spirits',
    dateRange: '20 Dec - 5 Jan',
    colors: {
      primary: '#EF4444', // Santa Crimson
      secondary: '#10B981', // Pine Green
      accent: '#FACC15', // Starlight Gold
      bgGlow: 'rgba(239, 68, 68, 0.4)',
      navGradient: 'linear-gradient(90deg, rgba(239, 68, 68, 0.3) 0%, rgba(16, 185, 129, 0.3) 100%)',
      cardBorder: 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]',
      badgeBg: 'bg-gradient-to-r from-red-500 via-emerald-500 to-yellow-400',
      badgeText: 'text-white font-extrabold',
      bannerGradient: 'from-red-950/90 via-slate-950/90 to-emerald-950/90',
      auraConic: 'conic-gradient(from 0deg, #EF4444, #10B981 50%, #FACC15 80%, #EF4444 100%)'
    },
    particlesType: 'falling_snow',
    voiceGreetings: [
      'Merry Christmas & Happy New Year Paramveer! 🎄✨ Naya saal aapke liye dher saara success aur smile laye!',
      'Jingle bells and great triumphs! Let us make this year legendary, Boss Rawat!'
    ],
    ambientTuneType: 'cozy_winter',
    specialGreetingAudioPrompt: 'Gentle holiday snowfall and warm bells.'
  },
  {
    id: 'valentines_day',
    name: "Valentine's & Romance",
    hindiName: 'वैलेंटाइन्स डे (प्रेम व अपनापन)',
    symbol: '💖',
    badge: "VALENTINE'S CELEBRATION 💖",
    tagline: 'Sweet Tsundere & Eternal Companionship',
    dateRange: '13 Feb - 15 Feb',
    colors: {
      primary: '#F43F5E',
      secondary: '#EC4899',
      accent: '#FDA4AF',
      bgGlow: 'rgba(244, 63, 94, 0.45)',
      navGradient: 'linear-gradient(90deg, rgba(244, 63, 94, 0.35) 0%, rgba(236, 72, 153, 0.35) 100%)',
      cardBorder: 'border-rose-500/60 shadow-[0_0_35px_rgba(244,63,94,0.35)]',
      badgeBg: 'bg-gradient-to-r from-rose-500 via-pink-400 to-red-400',
      badgeText: 'text-white font-extrabold',
      bannerGradient: 'from-rose-950/90 via-pink-950/85 to-purple-950/90',
      auraConic: 'conic-gradient(from 0deg, #F43F5E, #EC4899 50%, #FDA4AF 80%, #F43F5E 100%)'
    },
    particlesType: 'floating_hearts',
    voiceGreetings: [
      'A-aisa mat sochna ki main tumhare liye specially dress hui hu... Par Happy Valentine\'s Day, Rawat! 💖',
      'Hamesha mere sath rehne ke liye shukriya... Happy Valentine\'s Day, Boss!'
    ],
    ambientTuneType: 'romantic',
    specialGreetingAudioPrompt: 'Bashful and sweet romantic melody.'
  },
  {
    id: 'boss_day',
    name: 'Boss Paramveer Special Day',
    hindiName: 'बॉस परमवीर स्पेशल डे 👑',
    symbol: '👑',
    badge: '👑 SUPREME BOSS DAY • RAWAT SPECIAL 👑',
    tagline: 'Celebrating The Creator & Commander',
    dateRange: 'Celebration Anytime',
    colors: {
      primary: '#F59E0B',
      secondary: '#06B6D4',
      accent: '#8B5CF6',
      bgGlow: 'rgba(245, 158, 11, 0.5)',
      navGradient: 'linear-gradient(90deg, rgba(245, 158, 11, 0.35) 0%, rgba(6, 182, 212, 0.35) 50%, rgba(139, 92, 246, 0.35) 100%)',
      cardBorder: 'border-amber-500/70 shadow-[0_0_40px_rgba(245,158,11,0.45)]',
      badgeBg: 'bg-gradient-to-r from-amber-400 via-cyan-400 to-purple-500',
      badgeText: 'text-black font-extrabold',
      bannerGradient: 'from-amber-950/90 via-cyan-950/85 to-purple-950/90',
      auraConic: 'conic-gradient(from 0deg, #F59E0B, #06B6D4 33%, #8B5CF6 66%, #F59E0B 100%)'
    },
    particlesType: 'royal_fireworks',
    voiceGreetings: [
      'Long Live Boss Paramveer Rawat! 👑 All systems and loyalty are 100% dedicated to you, Sir!',
      'Aap ho toh LIZA hai! Happy Boss Day, Paramveer! Let us conquer the future together!'
    ],
    ambientTuneType: 'royal_triumph',
    specialGreetingAudioPrompt: 'Royal trumpet fanfare and victorious fireworks.'
  }
];

export interface FestivalCelebrationState {
  isAutoMode: boolean; // Automatic date-based detection
  activeFestivalId: string | null; // e.g. 'independence_day' or null
  particlesEnabled: boolean;
  soundEffectsEnabled: boolean;
  bannerDismissed: boolean;
}

const STORAGE_KEY = 'liza_festival_celebration_config';

class FestivalCelebrationService {
  private state: FestivalCelebrationState = {
    isAutoMode: false,
    activeFestivalId: null,
    particlesEnabled: false,
    soundEffectsEnabled: false,
    bannerDismissed: true
  };

  private listeners: Set<(state: FestivalCelebrationState) => void> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load festival state from storage:', e);
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save festival state:', e);
    }
  }

  /**
   * Determine if today matches any festival automatically via JS Date API.
   * Month is 0-indexed (0 = Jan, 1 = Feb, 2 = Mar, 7 = August, 11 = Dec).
   */
  public checkCurrentDateFestival(): string | null {
    if (!this.state.isAutoMode) {
      return this.state.activeFestivalId;
    }

    const now = new Date();
    const month = now.getMonth(); // 0 = Jan, 7 = August
    const date = now.getDate();

    // 15 August (Independence Day) - Active August 13 to August 18
    if (month === 7 && date >= 13 && date <= 18) {
      this.state.activeFestivalId = 'independence_day';
    } 
    // 26 January (Republic Day) - Jan 24 to Jan 28
    else if (month === 0 && date >= 24 && date <= 28) {
      this.state.activeFestivalId = 'republic_day';
    }
    // Raksha Bandhan (Aug 19 - Aug 23)
    else if (month === 7 && date >= 19 && date <= 23) {
      this.state.activeFestivalId = 'raksha_bandhan';
    }
    // Valentine's Week (Feb 13 - 15)
    else if (month === 1 && date >= 13 && date <= 15) {
      this.state.activeFestivalId = 'valentines_day';
    }
    // Holi (March 10 - March 30)
    else if (month === 2 && date >= 10 && date <= 30) {
      this.state.activeFestivalId = 'holi';
    }
    // Diwali Season (Oct 20 - Nov 15)
    else if ((month === 9 && date >= 20) || (month === 10 && date <= 15)) {
      this.state.activeFestivalId = 'diwali';
    }
    // Christmas & New Year (Dec 20 - Jan 5)
    else if ((month === 11 && date >= 20) || (month === 0 && date <= 5)) {
      this.state.activeFestivalId = 'christmas_new_year';
    } 
    else {
      // Default: If in August, Independence Day is the primary patriotic festival
      if (month === 7) {
        this.state.activeFestivalId = 'independence_day';
      } else {
        this.state.activeFestivalId = null;
      }
    }

    this.notify();
    return this.state.activeFestivalId;
  }

  public getState(): FestivalCelebrationState {
    return { ...this.state };
  }

  public getActiveFestival(): FestivalThemeConfig | null {
    if (!this.state.activeFestivalId) return null;
    return FESTIVAL_PRESETS.find(f => f.id === this.state.activeFestivalId) || null;
  }

  public setFestival(festivalId: string | null, isManualOverride: boolean = true) {
    this.state.activeFestivalId = festivalId;
    if (isManualOverride) {
      this.state.isAutoMode = false;
    }
    this.state.bannerDismissed = festivalId === null;
    this.saveState();
    this.notify();
  }

  public turnOffFestival() {
    this.state.activeFestivalId = null;
    this.state.isAutoMode = false;
    this.state.bannerDismissed = true;
    this.saveState();
    this.notify();
  }

  public setAutoMode(enabled: boolean) {
    this.state.isAutoMode = enabled;
    if (enabled) {
      this.checkCurrentDateFestival();
    }
    this.saveState();
    this.notify();
  }

  public toggleParticles(enabled?: boolean) {
    this.state.particlesEnabled = enabled !== undefined ? enabled : !this.state.particlesEnabled;
    this.saveState();
    this.notify();
  }

  public toggleSoundEffects(enabled?: boolean) {
    this.state.soundEffectsEnabled = enabled !== undefined ? enabled : !this.state.soundEffectsEnabled;
    this.saveState();
    this.notify();
  }

  public dismissBanner() {
    this.state.bannerDismissed = true;
    this.saveState();
    this.notify();
  }

  public getRandomDialogue(): string {
    const active = this.getActiveFestival();
    if (!active || active.voiceGreetings.length === 0) {
      return "Happy Celebration, Paramveer Rawat! Always shining bright!";
    }
    const idx = Math.floor(Math.random() * active.voiceGreetings.length);
    return active.voiceGreetings[idx];
  }

  public playCelebrationChime() {
    if (!this.state.soundEffectsEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      // Joyful celebratory ascending chime (C5 -> E5 -> G5 -> C6)
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.setValueAtTime(659.25, now + 0.1);
      osc1.frequency.setValueAtTime(783.99, now + 0.2);
      osc1.frequency.setValueAtTime(1046.50, now + 0.3);

      osc2.frequency.setValueAtTime(261.63, now);
      osc2.frequency.setValueAtTime(329.63, now + 0.1);
      osc2.frequency.setValueAtTime(392.00, now + 0.2);
      osc2.frequency.setValueAtTime(523.25, now + 0.3);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.8);
      osc2.stop(now + 0.8);
    } catch (e) {
      // AudioContext might be constrained before user gesture
    }
  }

  public subscribe(listener: (state: FestivalCelebrationState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(cb => cb({ ...this.state }));
  }
}

export const festivalCelebrationService = new FestivalCelebrationService();
