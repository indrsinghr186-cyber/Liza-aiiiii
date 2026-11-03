import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, X, Clock, Sparkles, ShieldCheck, Sun, Moon, Lock, KeyRound, Check, 
  Palette, Brain, FileText, History, BatteryCharging, Trash2, Plus, Volume2, Globe, Search,
  Smartphone, ExternalLink, ShieldAlert, MessageSquare, Tv, Layers, ArrowLeft, Home,
  Mic, Sliders, Users, Radio, Play, Pause, Target, Zap, Heart, PowerOff, Ban,
  HardDriveDownload, WifiOff, Cpu, RefreshCw, CheckCircle2, AlertCircle, Database, CheckCircle,
  Flag, RotateCw, Shirt, Crown
} from 'lucide-react';
import { AdminPanel } from './AdminPanel';
import { accessibilityService, AccessibilityServiceStatus, SUPPORTED_APP_ALLOWLIST } from '../services/accessibilityService';
import { LizaMemory, getTimeRemainingText } from '../services/memoryService';
import { voiceTuningService, DialectProfile, DIALECT_DESCRIPTIONS } from '../services/voiceTuningService';
import { smartContactsService, Contact } from '../services/contactsService';
import { dynamicIslandService } from '../services/dynamicIslandService';
import { offlinePersonalityCacheService, OfflineCacheReport, OFFLINE_PERSONALITY_FALLBACKS } from '../services/offlinePersonalityCacheService';
import { backgroundVoiceService } from '../services/backgroundVoiceService';
import { WakeWordDiagnosticsModal } from './WakeWordDiagnosticsModal';


export interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  glow: string;
  bgGlow: string;
  border: string;
  button: string;
}

export type MemoryItem = LizaMemory;

export interface NoteItem {
  id: string;
  content: string;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  user: string;
  liza: string;
  timestamp: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
  
  // Wake Word & Hands-Free
  wakeWord: string;
  onUpdateWakeWord: (word: string) => void;
  isWakeWordEnabled: boolean;
  onToggleWakeWord: (enabled: boolean) => void;
  
  // Themes & Appearance
  currentThemeKey: string;
  onSelectTheme: (key: string) => void;
  themes: Record<string, ThemeConfig>;
  background: string;
  onSelectBackground: (bg: string) => void;
  appearanceMode: string;
  onSelectAppearanceMode: (mode: string) => void;
  glowIntensity: string;
  onSelectGlowIntensity: (glow: string) => void;
  
  // Appearance & Avatar Visual FX Options
  showRotatingAura?: boolean;
  onToggleRotatingAura?: (enabled: boolean) => void;
  showCosplayBadge?: boolean;
  onToggleCosplayBadge?: (enabled: boolean) => void;
  showMoodScreenTint?: boolean;
  onToggleMoodScreenTint?: (enabled: boolean) => void;
  onTurnOffAllVisuals?: () => void;
  isFestivalThemeActive?: boolean;
  onOpenFestivalModal?: () => void;
  onToggleFestivalTheme?: (enabled: boolean) => void;

  // Dynamic Island & BPM Monitor
  showBpmIndicator?: boolean;
  onToggleBpm?: (enabled?: boolean) => void;
  
  // Time-Based Theme
  isTimeBasedTheme: boolean;
  onToggleTimeBasedTheme: (enabled: boolean) => void;

  // Memories
  memories: MemoryItem[];
  onDeleteMemory: (id: string) => void;
  onClearAllMemories: () => void;
  isSessionMemoryEnabled?: boolean;
  onToggleSessionMemoryEnabled?: (enabled: boolean) => void;
  onClearSessionMemories?: () => void;
  onRefreshMemories?: () => void;

  // Notes
  notes: NoteItem[];
  onAddNote: (content: string) => void;
  onDeleteNote: (id: string) => void;
  onClearAllNotes: () => void;

  // History Log
  isHistoryEnabled?: boolean;
  onToggleHistoryEnabled?: (enabled: boolean) => void;
  historyLog?: HistoryItem[];
  onDeleteHistoryItem?: (id: string) => void;
  onClearHistory?: () => void;

  // Performance & Saver Mode
  performanceMode: string;
  onSelectPerformanceMode: (mode: string) => void;
  
  // Owner Authentication State & Config
  isOwnerLoggedIn: boolean;
  ownerToken: string | null;
  onLoginOwner: (token: string) => void;
  onLogoutOwner: () => void;
  systemPrompt: string;
  onUpdateSystemPrompt: (prompt: string) => void;
  voiceName: string;
  onUpdateVoiceName: (voice: string) => void;
  model: string;
  onUpdateModel: (model: string) => void;

  // Diagnostics & Status
  isActive: boolean;
  micLevel: number;
  retryCount: number;
  playClickSound?: () => void;

  // Background Voice Activation
  isBackgroundVoiceEnabled: boolean;
  onToggleBackgroundVoice: (enabled: boolean) => void;
  backgroundVoiceStatusText?: string;
  backgroundVoiceError?: string | null;

  // Boss Mode (Paramveer Rawat) & Security PIN
  isBossMode?: boolean;
  onToggleBossMode?: (enabled: boolean) => void;
  bossPin?: string;
  onUpdateBossPin?: (newPin: string) => void;
  bossPassphrase?: string;
  onUpdateBossPassphrase?: (newPhrase: string) => void;

  // Auto GPS Location
  userLocation?: {
    latitude: number | null;
    longitude: number | null;
    locationName: string;
    status: 'idle' | 'detecting' | 'active' | 'denied' | 'error';
    errorMessage?: string;
  };
  onRefreshUserLocation?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'appearance',
  wakeWord,
  onUpdateWakeWord,
  isWakeWordEnabled,
  onToggleWakeWord,
  currentThemeKey,
  onSelectTheme,
  themes,
  background,
  onSelectBackground,
  appearanceMode,
  onSelectAppearanceMode,
  glowIntensity,
  onSelectGlowIntensity,
  showRotatingAura = false,
  onToggleRotatingAura,
  showCosplayBadge = false,
  onToggleCosplayBadge,
  showMoodScreenTint = false,
  onToggleMoodScreenTint,
  onTurnOffAllVisuals,
  isFestivalThemeActive = false,
  onOpenFestivalModal,
  onToggleFestivalTheme,
  showBpmIndicator = true,
  onToggleBpm,
  isTimeBasedTheme,
  onToggleTimeBasedTheme,
  memories,
  onDeleteMemory,
  onClearAllMemories,
  isSessionMemoryEnabled = true,
  onToggleSessionMemoryEnabled,
  onClearSessionMemories,
  onRefreshMemories,
  notes,
  onAddNote,
  onDeleteNote,
  onClearAllNotes,
  isHistoryEnabled = true,
  onToggleHistoryEnabled,
  historyLog = [],
  onDeleteHistoryItem,
  onClearHistory,
  performanceMode,
  onSelectPerformanceMode,
  isOwnerLoggedIn,
  ownerToken,
  onLoginOwner,
  onLogoutOwner,
  systemPrompt,
  onUpdateSystemPrompt,
  voiceName,
  onUpdateVoiceName,
  model,
  onUpdateModel,
  isActive,
  micLevel,
  retryCount,
  playClickSound,
  isBackgroundVoiceEnabled,
  onToggleBackgroundVoice,
  backgroundVoiceStatusText,
  backgroundVoiceError,
  userLocation,
  onRefreshUserLocation,
  isBossMode = false,
  onToggleBossMode,
  bossPin = '007',
  onUpdateBossPin,
  bossPassphrase = 'code 007',
  onUpdateBossPassphrase,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<
    'appearance' | 'voice' | 'contacts' | 'device' | 'memory' | 'notes' | 'history' | 'battery' | 'offline' | 'general' | 'admin'
  >((defaultTab as any) || 'appearance');

  // Boss Security PIN & Passphrase state
  const [showSecurityConfig, setShowSecurityConfig] = useState(false);
  const [pinDraft, setPinDraft] = useState(bossPin);
  const [passphraseDraft, setPassphraseDraft] = useState(bossPassphrase);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  useEffect(() => {
    setPinDraft(bossPin);
  }, [bossPin]);

  useEffect(() => {
    setPassphraseDraft(bossPassphrase);
  }, [bossPassphrase]);

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound?.();
    const cleanPin = pinDraft.trim() || '007';
    const cleanPhrase = passphraseDraft.trim() || 'code 007';
    onUpdateBossPin?.(cleanPin);
    onUpdateBossPassphrase?.(cleanPhrase);
    setSecurityNotice('✅ Secret PIN & Voice Passphrase updated successfully!');
    setTimeout(() => setSecurityNotice(null), 3500);
  };

  // Offline Personality Cache State & Telemetry
  const [cacheReport, setCacheReport] = useState<OfflineCacheReport>(() =>
    offlinePersonalityCacheService.getCacheReport()
  );
  const [isRefreshingCache, setIsRefreshingCache] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [offlineSimKey, setOfflineSimKey] = useState<string>('greeting');
  const [customOfflinePrompt, setCustomOfflinePrompt] = useState<string>('');
  const [offlineSimResponse, setOfflineSimResponse] = useState<{ reply: string; mood: string } | null>(null);
  const [showWakeDiagModal, setShowWakeDiagModal] = useState(false);

  useEffect(() => {
    return offlinePersonalityCacheService.subscribe((report) => {
      setCacheReport(report);
    });
  }, []);

  const handleRefreshCache = () => {
    playClickSound?.();
    setIsRefreshingCache(true);
    setTimeout(() => {
      const updated = offlinePersonalityCacheService.refreshAndPrecacheAll();
      setCacheReport(updated);
      setIsRefreshingCache(false);
    }, 600);
  };

  const handleRunOfflineSim = (key: string) => {
    playClickSound?.();
    setOfflineSimKey(key);
    const fallback = OFFLINE_PERSONALITY_FALLBACKS[key] || OFFLINE_PERSONALITY_FALLBACKS.default;
    setOfflineSimResponse(fallback);
  };

  const handleCustomOfflineSim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customOfflinePrompt.trim()) return;
    playClickSound?.();
    const query = customOfflinePrompt.toLowerCase();
    let matchedKey = 'default';
    if (query.includes('namaste') || query.includes('hello') || query.includes('hi') || query.includes('kese ho')) {
      matchedKey = 'greeting';
    } else if (query.includes('status') || query.includes('system') || query.includes('chal rahi')) {
      matchedKey = 'status';
    } else if (query.includes('love') || query.includes('pyaar') || query.includes('pasand') || query.includes('crush')) {
      matchedKey = 'love';
    } else if (query.includes('sad') || query.includes('tension') || query.includes('pareshan') || query.includes('help')) {
      matchedKey = 'comfort';
    } else if (query.includes('torch') || query.includes('light') || query.includes('flashlight')) {
      matchedKey = 'flashlight';
    } else if (query.includes('battery') || query.includes('percentage')) {
      matchedKey = 'battery';
    }
    setOfflineSimKey(matchedKey);
    setOfflineSimResponse(OFFLINE_PERSONALITY_FALLBACKS[matchedKey] || OFFLINE_PERSONALITY_FALLBACKS.default);
  };

  // Voice Tuning State
  const [voiceConfig, setVoiceConfig] = useState(voiceTuningService.getConfig());
  useEffect(() => {
    return voiceTuningService.subscribe((cfg) => setVoiceConfig(cfg));
  }, []);

  // Contacts State
  const [contactsList, setContactsList] = useState<Contact[]>(smartContactsService.getAllContacts());
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('');

  // Dynamic Island State
  const [islandState, setIslandState] = useState(() => dynamicIslandService.getStatus());
  useEffect(() => {
    return dynamicIslandService.subscribe(() => {
      setIslandState(dynamicIslandService.getStatus());
    });
  }, []);


  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab as any);
    }
  }, [defaultTab, isOpen]);

  const [accessibilityStatus, setAccessibilityStatus] = useState<AccessibilityServiceStatus>(
    accessibilityService.getStatus()
  );

  useEffect(() => {
    const unsubscribe = accessibilityService.subscribeStatus((status) => {
      setAccessibilityStatus(status);
    });
    return () => unsubscribe();
  }, []);

  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [newNoteInput, setNewNoteInput] = useState('');
  const [searchMemoryQuery, setSearchMemoryQuery] = useState('');

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        onLoginOwner(data.token);
        setPasswordInput('');
        setActiveTab('admin');
      } else {
        setLoginError(data.error || 'Invalid owner password');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login connection failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const filteredMemories = memories.filter(
    (m) =>
      m.key.toLowerCase().includes(searchMemoryQuery.toLowerCase()) ||
      m.value.toLowerCase().includes(searchMemoryQuery.toLowerCase())
  );

  return (
    <motion.div
      key="settings-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0a0a0d] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col font-sans-body text-white my-auto max-h-[92dvh]"
      >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#d946ef]/20 border border-[#d946ef]/40 text-[#d946ef]">
                <Settings size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white font-mono-spec">LIZA Settings</h3>
                <p className="font-mono-spec text-[10px] text-white/50">Personalization & Controls</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Top Live Offline Personality Cache Pill Indicator */}
              <div
                className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono-spec text-[10px]"
                title="Liza Core Offline Personality Cache Status"
              >
                <HardDriveDownload size={12} className="text-emerald-400" />
                <span className="font-bold">Offline Cache: {cacheReport.overallReadinessPercentage}%</span>
                <span className="text-white/40">({offlinePersonalityCacheService.formatBytes(cacheReport.totalSizeBytes)})</span>
              </div>

              <button
                onClick={() => {
                  playClickSound?.();
                  onClose();
                }}
                className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Tab Navigation Strip (Mobile-First Scrollable) */}
          <div className="px-3 py-2 bg-black/60 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono-spec text-[10px]">
            <button
              onClick={() => { playClickSound?.(); setActiveTab('appearance'); }}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'appearance' ? 'bg-[#d946ef] text-black shadow-[0_0_12px_rgba(217,70,239,0.4)]' : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <Palette size={12} /> Appearance
            </button>

            <button
              onClick={() => { playClickSound?.(); setActiveTab('voice'); }}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'voice' ? 'bg-[#d946ef] text-black shadow-[0_0_12px_rgba(217,70,239,0.4)]' : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <Mic size={12} /> Voice & Dialect
            </button>

            <button
              onClick={() => { playClickSound?.(); setActiveTab('contacts'); }}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'contacts' ? 'bg-[#d946ef] text-black shadow-[0_0_12px_rgba(217,70,239,0.4)]' : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <Users size={12} /> Contacts ({contactsList.length})
            </button>

            <button
              onClick={() => { playClickSound?.(); setActiveTab('device'); }}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'device' ? 'bg-[#d946ef] text-black shadow-[0_0_12px_rgba(217,70,239,0.4)]' : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <Smartphone size={12} /> Device Control
            </button>

            <button
              onClick={() => { playClickSound?.(); setActiveTab('memory'); }}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'memory' ? 'bg-[#d946ef] text-black shadow-[0_0_12px_rgba(217,70,239,0.4)]' : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <Brain size={12} /> Memory ({memories.length})
            </button>

            <button
              onClick={() => { playClickSound?.(); setActiveTab('notes'); }}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'notes' ? 'bg-[#d946ef] text-black shadow-[0_0_12px_rgba(217,70,239,0.4)]' : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <FileText size={12} /> Notes ({notes.length})
            </button>

            <button
              onClick={() => { playClickSound?.(); setActiveTab('history'); }}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'history' ? 'bg-[#d946ef] text-black shadow-[0_0_12px_rgba(217,70,239,0.4)]' : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <History size={12} /> History ({historyLog.length})
            </button>

            <button
              onClick={() => { playClickSound?.(); setActiveTab('offline'); }}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'offline' ? 'bg-[#d946ef] text-black shadow-[0_0_12px_rgba(217,70,239,0.4)]' : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <HardDriveDownload size={12} /> Offline Cache ({cacheReport.overallReadinessPercentage}%)
            </button>

            <button
              onClick={() => { playClickSound?.(); setActiveTab('battery'); }}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'battery' ? 'bg-[#d946ef] text-black shadow-[0_0_12px_rgba(217,70,239,0.4)]' : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <BatteryCharging size={12} /> Saver
            </button>

            <button
              onClick={() => { playClickSound?.(); setActiveTab('general'); }}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'general' ? 'bg-[#d946ef] text-black shadow-[0_0_12px_rgba(217,70,239,0.4)]' : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <Sparkles size={12} /> Wake & Diag
            </button>

            <button
              onClick={() => { playClickSound?.(); setActiveTab('admin'); }}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'admin' ? 'bg-[#d946ef] text-black shadow-[0_0_12px_rgba(217,70,239,0.4)]' : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <Lock size={12} /> Owner
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1 max-h-[72dvh]">
            
            {/* 👑 MASTER PERSONA MODE: BOSS MODE (PARAMVEER RAWAT) SWITCH */}
            <div 
              id="settings-boss-mode-card"
              className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                isBossMode
                  ? 'bg-gradient-to-r from-purple-950/70 via-amber-950/40 to-purple-950/70 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                  : 'bg-black/50 border-cyan-500/40 shadow-[0_0_18px_rgba(6,182,212,0.15)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-spec font-bold uppercase flex items-center gap-1.5 border ${
                      isBossMode
                        ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 animate-pulse'
                        : 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                    }`}>
                      {isBossMode ? <Crown size={12} className="text-amber-400 fill-amber-400" /> : <ShieldAlert size={12} className="text-cyan-400" />}
                      {isBossMode ? '👑 BOSS MODE : ON' : '👤 NORMAL USER / GUEST MODE'}
                    </span>
                    <span className="text-[10px] font-mono-spec text-white/50">
                      {isBossMode ? 'Paramveer Rawat (Rawat)' : 'Strict Loyalty & Imposter Shield'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5 pt-0.5">
                    {isBossMode ? (
                      <span className="text-amber-200">Speaking with Boss (Paramveer Rawat) 💖</span>
                    ) : (
                      <span className="text-cyan-200">Speaking with Normal User / Guest 🛡️</span>
                    )}
                  </h3>

                  <p className="text-[11px] text-white/70 leading-relaxed">
                    {isBossMode ? (
                      <>
                        <strong className="text-amber-300">Active Behavior:</strong> Liza recognizes you as her one and only Boss, Creator & Soulmate <strong className="text-white">Paramveer Rawat</strong>. Deeply sweet, loving, cute anime companion tone and <em className="text-pink-300">pyaari pyaari baatein</em> are enabled!
                      </>
                    ) : (
                      <>
                        <strong className="text-cyan-300">Active Behavior:</strong> Liza treats the speaker as a normal guest. If anyone says <em className="text-red-300">"Main tumhara boss hoon"</em>, Liza will fiercely reject them: <strong className="text-white">"Mere boss sirf Paramveer Rawat hain, unke siva koi nahi! 😤"</strong>
                      </>
                    )}
                  </p>
                </div>

                {/* Master Toggle Switch */}
                <button
                  id="settings-boss-mode-toggle-btn"
                  type="button"
                  onClick={() => {
                    playClickSound?.();
                    onToggleBossMode?.(!isBossMode);
                  }}
                  className={`w-14 h-8 rounded-full transition-all relative p-1 cursor-pointer border shrink-0 ${
                    isBossMode 
                      ? 'bg-gradient-to-r from-amber-500 to-[#d946ef] border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                      : 'bg-white/10 border-white/20'
                  }`}
                  title={isBossMode ? 'Switch to Normal User / Guest Mode' : 'Activate Boss Mode (Paramveer Rawat)'}
                >
                  <motion.div
                    animate={{ x: isBossMode ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-[10px]"
                  >
                    {isBossMode ? '👑' : '👤'}
                  </motion.div>
                </button>
              </div>

              {/* Status Note Footer & Bio-Security Keypad Trigger */}
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono-spec flex-wrap gap-2">
                <span className="text-white/50 flex items-center gap-1.5">
                  <Lock size={11} className="text-amber-400" />
                  <span>PIN: <strong className="text-amber-300 font-bold">{bossPin || '007'}</strong></span>
                  <span className="mx-1 text-white/20">•</span>
                  <span>Voice: <strong className="text-pink-300 font-bold font-mono-spec">"{bossPassphrase || 'code 007'}"</strong></span>
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound?.();
                      setShowSecurityConfig(!showSecurityConfig);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound size={11} className="text-amber-400" />
                    <span>{showSecurityConfig ? 'Close Passcode Config' : 'Change PIN & Passphrase'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound?.();
                      onToggleBossMode?.(!isBossMode);
                    }}
                    className={`underline font-bold transition-colors cursor-pointer ${
                      isBossMode ? 'text-amber-400 hover:text-amber-300' : 'text-cyan-400 hover:text-cyan-300'
                    }`}
                  >
                    {isBossMode ? 'Switch to Guest' : 'Unlock Boss'}
                  </button>
                </div>
              </div>

              {/* Collapsible Bio-Security PIN & Passphrase Config Sub-Panel */}
              <AnimatePresence>
                {showSecurityConfig && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-white/10 bg-black/40 p-3 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-200 font-mono-spec flex items-center gap-1.5">
                        <Lock size={12} className="text-amber-400" />
                        🔐 Custom Boss Bio-Security Settings
                      </span>
                      <span className="text-[9px] font-mono-spec text-white/40">Only Paramveer Rawat</span>
                    </div>

                    <form onSubmit={handleSaveSecurity} className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* PIN Code Field */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono-spec text-white/70 block">
                            Secret Numeric PIN (e.g. 007, 7777):
                          </label>
                          <input
                            type="text"
                            maxLength={8}
                            value={pinDraft}
                            onChange={(e) => setPinDraft(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="Enter 3-8 digit PIN"
                            className="w-full px-3 py-1.5 text-xs font-mono-spec rounded-lg bg-black/60 border border-white/20 focus:border-amber-400 text-amber-300 outline-none"
                          />
                        </div>

                        {/* Voice Passphrase Field */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono-spec text-white/70 block">
                            Secret Voice Passphrase (Spoken):
                          </label>
                          <input
                            type="text"
                            value={passphraseDraft}
                            onChange={(e) => setPassphraseDraft(e.target.value)}
                            placeholder="e.g. code 007, boss rawat"
                            className="w-full px-3 py-1.5 text-xs font-mono-spec rounded-lg bg-black/60 border border-white/20 focus:border-pink-400 text-pink-300 outline-none"
                          />
                        </div>
                      </div>

                      {securityNotice && (
                        <div className="text-[10px] font-mono-spec text-emerald-300 font-bold flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/30 p-1.5 rounded-lg">
                          <Check size={12} className="text-emerald-400" />
                          <span>{securityNotice}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <p className="text-[9px] text-white/50">
                          Kisi aur ke paas ye code nahi hoga, isse Boss Mode safe rahega.
                        </p>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-gradient-to-r from-amber-500 to-[#d946ef] text-black font-bold text-xs rounded-lg shadow-sm hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1"
                        >
                          <Check size={12} />
                          <span>Save Passcode</span>
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* 🎙️ PRO VOICE & DIALECT TUNING TAB */}
            {activeTab === 'voice' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs font-mono-spec text-white uppercase flex items-center gap-1.5">
                      <Sliders size={14} className="text-[#d946ef]" />
                      Voice Tuning & Dialect Engine
                    </h4>
                    <p className="text-[11px] text-white/50">Speed, pitch, cadence and regional language accent</p>
                  </div>
                </div>

                {/* Dialect Selector */}
                <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-2.5">
                  <span className="text-[11px] font-mono-spec font-bold text-white uppercase flex items-center gap-1.5">
                    <Globe size={13} className="text-cyan-400" />
                    Speaking Dialect & Accent
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(Object.keys(DIALECT_DESCRIPTIONS) as DialectProfile[]).map((dialect) => {
                      const isSelected = voiceConfig.dialect === dialect;
                      return (
                        <button
                          key={dialect}
                          type="button"
                          onClick={() => {
                            playClickSound?.();
                            voiceTuningService.setDialect(dialect);
                          }}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-950/40 border-[#d946ef] text-white shadow-[0_0_12px_rgba(217,70,239,0.3)]'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono-spec text-xs font-bold text-white">{DIALECT_DESCRIPTIONS[dialect].label}</span>
                            {isSelected && <Check size={14} className="text-[#d946ef]" />}
                          </div>
                          <span className="text-[10px] text-white/50">{DIALECT_DESCRIPTIONS[dialect].desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Speed & Pitch Sliders */}
                <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono-spec mb-1">
                      <span className="text-white/80">Speaking Rate (Speed):</span>
                      <span className="text-[#d946ef] font-bold">{voiceConfig.speed.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.5"
                      step="0.05"
                      value={voiceConfig.speed}
                      onChange={(e) => voiceTuningService.setSpeed(parseFloat(e.target.value))}
                      className="w-full accent-[#d946ef] cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-mono-spec text-white/40">
                      <span>0.7x (Slow)</span>
                      <span>1.0x (Normal)</span>
                      <span>1.5x (Fast)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-mono-spec mb-1">
                      <span className="text-white/80">Voice Pitch Tuning:</span>
                      <span className="text-[#d946ef] font-bold">{voiceConfig.pitch.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.4"
                      step="0.05"
                      value={voiceConfig.pitch}
                      onChange={(e) => voiceTuningService.setPitch(parseFloat(e.target.value))}
                      className="w-full accent-[#d946ef] cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-mono-spec text-white/40">
                      <span>0.7x (Deep)</span>
                      <span>1.0x (Natural)</span>
                      <span>1.4x (High/Sweet)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 📇 SMART CONTACTS TAB */}
            {activeTab === 'contacts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs font-mono-spec text-white uppercase flex items-center gap-1.5">
                      <Users size={14} className="text-blue-400" />
                      Smart Contacts & Relationships
                    </h4>
                    <p className="text-[11px] text-white/50">Voice aliasing (e.g. "Papa ko message bhejo")</p>
                  </div>
                </div>

                {/* Add Contact Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newContactName.trim()) {
                      smartContactsService.addContact({
                        name: newContactName.trim(),
                        phoneNumber: newContactPhone.trim() || undefined,
                        relationship: newContactRel.trim() || undefined,
                      });
                      setContactsList(smartContactsService.getAllContacts());
                      setNewContactName('');
                      setNewContactPhone('');
                      setNewContactRel('');
                    }
                  }}
                  className="p-3 bg-black/40 border border-white/10 rounded-2xl space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Contact Name (e.g. Rahul)"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="bg-black/60 border border-white/15 focus:border-[#d946ef] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/30 font-mono-spec outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Phone / WhatsApp"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="bg-black/60 border border-white/15 focus:border-[#d946ef] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/30 font-mono-spec outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Relation (e.g. brother, boss)"
                      value={newContactRel}
                      onChange={(e) => setNewContactRel(e.target.value)}
                      className="bg-black/60 border border-white/15 focus:border-[#d946ef] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/30 font-mono-spec outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono-spec text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-md"
                  >
                    <Plus size={14} /> Add Smart Contact
                  </button>
                </form>

                {/* Contacts List */}
                <div className="space-y-2 max-h-[35dvh] overflow-y-auto">
                  {contactsList.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-mono-spec text-xs font-bold text-white">{c.name}</span>
                        {c.relationship && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-mono-spec bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {c.relationship}
                          </span>
                        )}
                        {c.phoneNumber && (
                          <span className="block text-[10px] font-mono-spec text-white/40">{c.phoneNumber}</span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          playClickSound?.();
                          smartContactsService.deleteContact(c.id);
                          setContactsList(smartContactsService.getAllContacts());
                        }}
                        className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 1. APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                {/* Master Clean Minimal Mode Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-black to-blue-950/40 border border-white/15 flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-white/10 text-white shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono-spec text-xs font-bold text-white block">
                        Clean Minimal Mode (Sab FX & Themes OFF)
                      </span>
                      <span className="text-[10px] text-white/50 block truncate">
                        Dynamic Island, Rotating Aura, Mood Tint aur Festival effects ko ek tap me band karein
                      </span>
                    </div>
                  </div>
                  {onTurnOffAllVisuals && (
                    <button
                      onClick={() => {
                        playClickSound?.();
                        onTurnOffAllVisuals();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono-spec font-bold border border-white/20 hover:border-white/40 cursor-pointer shrink-0 transition-all active:scale-95 shadow"
                    >
                      Turn OFF All ⚪
                    </button>
                  )}
                </div>

                {/* Feature: Master Theme Power Switch (ON / OFF) & Status */}
                <div className={`p-3.5 rounded-2xl border space-y-2.5 transition-all ${
                  currentThemeKey === 'off'
                    ? 'bg-black/60 border-white/20 shadow-none'
                    : 'bg-black/50 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        currentThemeKey === 'off' ? 'bg-white/10 text-white/60' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {currentThemeKey === 'off' ? <PowerOff size={15} /> : <Palette size={15} />}
                      </div>
                      <div>
                        <span className="font-mono-spec text-xs font-bold text-white block flex items-center gap-1.5">
                          Theme Power & Color Effects
                          {currentThemeKey === 'off' ? (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-white/10 text-white/60 border border-white/20 uppercase">
                              Theme OFF
                            </span>
                          ) : (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                              Theme Active
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-white/50 block">
                          {currentThemeKey === 'off' 
                            ? 'Color glow & theme tints disabled. Clean neutral display active.' 
                            : 'Neon cyberpunk accents, interactive color glow, and avatar ambience.'}
                        </span>
                      </div>
                    </div>

                    {/* Master Theme Power Toggle */}
                    <button
                      onClick={() => {
                        playClickSound?.();
                        if (currentThemeKey === 'off') {
                          onSelectTheme('purple');
                        } else {
                          if (isTimeBasedTheme) {
                            onToggleTimeBasedTheme(false);
                          }
                          onSelectTheme('off');
                        }
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer border ${
                        currentThemeKey !== 'off' ? 'bg-purple-600 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10 border-white/20'
                      }`}
                      title={currentThemeKey !== 'off' ? 'Click to Turn Theme OFF' : 'Click to Turn Theme ON'}
                    >
                      <motion.div
                        animate={{ x: currentThemeKey !== 'off' ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-4 h-4 rounded-full bg-white shadow-md"
                      />
                    </button>
                  </div>

                  {/* Quick Action Button & Status Bar */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] font-mono-spec">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/30"
                        style={{ backgroundColor: themes[currentThemeKey]?.primary || '#94A3B8' }}
                      />
                      <span className="text-white/80">
                        {currentThemeKey === 'off' ? (
                          <span className="text-white/60">Monochrome Clean Neutral (Theme OFF)</span>
                        ) : (
                          <span>Active: <strong style={{ color: themes[currentThemeKey]?.primary }}>{themes[currentThemeKey]?.name}</strong></span>
                        )}
                      </span>
                    </div>

                    {currentThemeKey === 'off' ? (
                      <button
                        onClick={() => {
                          playClickSound?.();
                          onSelectTheme('purple');
                        }}
                        className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[10px] font-bold cursor-pointer transition-all"
                      >
                        Turn Theme ON
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          playClickSound?.();
                          if (isTimeBasedTheme) {
                            onToggleTimeBasedTheme(false);
                          }
                          onSelectTheme('off');
                        }}
                        className="px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-300 border border-white/10 hover:border-red-500/30 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                      >
                        <PowerOff size={10} />
                        Turn Theme OFF
                      </button>
                    )}
                  </div>
                </div>

                {/* Time-Based Dynamic Theme Control & Status Indicator */}
                <div className="p-3.5 bg-black/50 border border-white/10 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#d946ef]/20 text-[#d946ef]">
                        <Clock size={15} />
                      </div>
                      <div>
                        <span className="font-mono-spec text-xs font-bold text-white block">
                          Time-Based Dynamic Theme
                        </span>
                        <span className="text-[10px] text-white/50 block">
                          Auto-switches color palette according to local time
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => {
                        playClickSound?.();
                        onToggleTimeBasedTheme(!isTimeBasedTheme);
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer border ${
                        isTimeBasedTheme ? 'bg-[#d946ef] border-[#d946ef]' : 'bg-white/10 border-white/20'
                      }`}
                      title={isTimeBasedTheme ? 'Disable Auto Time Theme' : 'Enable Auto Time Theme'}
                    >
                      <motion.div
                        animate={{ x: isTimeBasedTheme ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-4 h-4 rounded-full bg-white shadow-md"
                      />
                    </button>
                  </div>

                  {/* Status Badge & Current Theme Display */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 font-mono-spec text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-white/30 shadow-sm"
                        style={{ backgroundColor: themes[currentThemeKey]?.primary || '#A855F7' }}
                      />
                      <span className="text-white font-semibold">
                        Currently: <span style={{ color: themes[currentThemeKey]?.primary || '#A855F7' }}>{themes[currentThemeKey]?.name || 'Neon Purple'}</span>
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                        isTimeBasedTheme
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {isTimeBasedTheme ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Auto Active
                        </>
                      ) : (
                        'Manual Override'
                      )}
                    </span>
                  </div>

                  {/* Schedule Legend or Override Hint */}
                  {isTimeBasedTheme ? (
                    <div className="text-[10px] text-white/40 font-mono-spec leading-relaxed px-1">
                      Schedule: Morning (Emerald) • Afternoon (Blue) • Evening (Pink) • Night (Purple)
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[10px] text-amber-200/80 font-mono-spec px-1">
                      <span>{currentThemeKey === 'off' ? 'Theme is currently turned OFF.' : 'Theme is manually locked.'}</span>
                      <button
                        onClick={() => {
                          playClickSound?.();
                          onToggleTimeBasedTheme(true);
                        }}
                        className="text-[#d946ef] hover:underline font-bold cursor-pointer"
                      >
                        Reset to Auto Sync
                      </button>
                    </div>
                  )}
                </div>

                {/* Feature #7: Dynamic Island Floating Multitask Bar Settings */}
                <div className="p-3.5 bg-black/50 border border-purple-500/30 rounded-2xl space-y-2.5 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                        <Sparkles size={15} />
                      </div>
                      <div>
                        <span className="font-mono-spec text-xs font-bold text-white block">
                          Dynamic Island Floating Multitasking Bar
                        </span>
                        <span className="text-[10px] text-white/50 block">
                          Interactive top capsule for audio waveform, quick mic, themes & wardrobe
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => {
                        playClickSound?.();
                        dynamicIslandService.toggleFloatingBubble(!islandState.isEnabled);
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer border ${
                        islandState.isEnabled ? 'bg-purple-600 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10 border-white/20'
                      }`}
                      title={islandState.isEnabled ? 'Turn OFF Dynamic Island' : 'Turn ON Dynamic Island'}
                    >
                      <motion.div
                        animate={{ x: islandState.isEnabled ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-4 h-4 rounded-full bg-white shadow-md"
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] font-mono-spec">
                    <span className="text-purple-200/80">Voice Command: "Dynamic Island On/Off karo"</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${islandState.isEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/40'}`}>
                      {islandState.isEnabled ? 'STATUS: ACTIVE' : 'STATUS: DISABLED'}
                    </span>
                  </div>
                </div>

                {/* Festival & Celebration Theme Toggle Card */}
                <div className="p-3.5 bg-black/50 border border-orange-500/30 rounded-2xl space-y-2.5 shadow-[0_0_15px_rgba(255,153,51,0.15)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                        <Flag size={15} />
                      </div>
                      <div>
                        <span className="font-mono-spec text-xs font-bold text-white block">
                          Festival & Celebration Themes (15 Aug / Diwali / Special)
                        </span>
                        <span className="text-[10px] text-white/50 block">
                          Tiranga festival banners, special greetings, and seasonal event themes
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => {
                        playClickSound?.();
                        onToggleFestivalTheme?.(!isFestivalThemeActive);
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer border ${
                        isFestivalThemeActive ? 'bg-orange-600 border-orange-500 shadow-[0_0_10px_rgba(255,153,51,0.5)]' : 'bg-white/10 border-white/20'
                      }`}
                      title={isFestivalThemeActive ? 'Turn OFF Festival Theme' : 'Turn ON Festival Theme'}
                    >
                      <motion.div
                        animate={{ x: isFestivalThemeActive ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-4 h-4 rounded-full bg-white shadow-md"
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-orange-950/30 border border-orange-500/20 text-[11px] font-mono-spec">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${isFestivalThemeActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/40'}`}>
                        {isFestivalThemeActive ? 'FESTIVAL: ACTIVE' : 'FESTIVAL: OFF'}
                      </span>
                      <span className="text-orange-200/80 text-[10px]">Voice: &quot;Festival theme band karo&quot;</span>
                    </div>
                    {onOpenFestivalModal && (
                      <button
                        onClick={() => {
                          playClickSound?.();
                          onOpenFestivalModal();
                        }}
                        className="text-xs text-orange-300 hover:text-orange-200 underline font-bold cursor-pointer"
                      >
                        Festival Settings ⚙️
                      </button>
                    )}
                  </div>
                </div>

                {/* Avatar Background Rotating Aura / Spinning Ring Toggle */}
                <div className="p-3.5 bg-black/50 border border-purple-500/30 rounded-2xl space-y-2.5 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                        <RotateCw size={15} className={showRotatingAura ? 'animate-spin' : ''} />
                      </div>
                      <div>
                        <span className="font-mono-spec text-xs font-bold text-white block">
                          Avatar Background Rotating Aura Halo (घूमने वाली थीम)
                        </span>
                        <span className="text-[10px] text-white/50 block">
                          Liza ke photo ke peeche ghoomti hui spinning holographic aura ring
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => {
                        playClickSound?.();
                        onToggleRotatingAura?.(!showRotatingAura);
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer border ${
                        showRotatingAura ? 'bg-purple-600 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10 border-white/20'
                      }`}
                      title={showRotatingAura ? 'Turn OFF Rotating Aura' : 'Turn ON Rotating Aura'}
                    >
                      <motion.div
                        animate={{ x: showRotatingAura ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-4 h-4 rounded-full bg-white shadow-md"
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] font-mono-spec">
                    <span className="text-purple-200/80">Voice Command: &quot;Rotating aura off karo&quot;</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${showRotatingAura ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/40'}`}>
                      {showRotatingAura ? 'ROTATING AURA: ON' : 'ROTATING AURA: OFF'}
                    </span>
                  </div>
                </div>

                {/* Avatar Cosplay Badge / Outfit Logo Toggle */}
                <div className="p-3.5 bg-black/50 border border-pink-500/30 rounded-2xl space-y-2.5 shadow-[0_0_15px_rgba(244,114,182,0.15)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
                        <Shirt size={15} />
                      </div>
                      <div>
                        <span className="font-mono-spec text-xs font-bold text-white block">
                          Avatar Cosplay 👗 Badge / Logo Overlay
                        </span>
                        <span className="text-[10px] text-white/50 block">
                          Liza ki image ke upar dikhne wala &quot;COSPLAY 👗&quot; outfit switcher button
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => {
                        playClickSound?.();
                        onToggleCosplayBadge?.(!showCosplayBadge);
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer border ${
                        showCosplayBadge ? 'bg-pink-600 border-pink-500 shadow-[0_0_10px_rgba(244,114,182,0.5)]' : 'bg-white/10 border-white/20'
                      }`}
                      title={showCosplayBadge ? 'Turn OFF Cosplay Badge' : 'Turn ON Cosplay Badge'}
                    >
                      <motion.div
                        animate={{ x: showCosplayBadge ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-4 h-4 rounded-full bg-white shadow-md"
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-pink-950/30 border border-pink-500/20 text-[11px] font-mono-spec">
                    <span className="text-pink-200/80">Voice Command: &quot;Cosplay logo off karo&quot;</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${showCosplayBadge ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/40'}`}>
                      {showCosplayBadge ? 'COSPLAY BADGE: VISIBLE' : 'COSPLAY BADGE: HIDDEN'}
                    </span>
                  </div>
                </div>

                {/* Dynamic Mood Screen Tint Atmosphere Toggle */}
                <div className="p-3.5 bg-black/50 border border-indigo-500/30 rounded-2xl space-y-2.5 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <Palette size={15} />
                      </div>
                      <div>
                        <span className="font-mono-spec text-xs font-bold text-white block">
                          Dynamic Mood Screen Tint Atmosphere (मूड स्क्रीन इफेक्ट)
                        </span>
                        <span className="text-[10px] text-white/50 block">
                          Liza ke emotion ke hisab se full-screen colored atmospheric glow aur vignette
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => {
                        playClickSound?.();
                        onToggleMoodScreenTint?.(!showMoodScreenTint);
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer border ${
                        showMoodScreenTint ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/10 border-white/20'
                      }`}
                      title={showMoodScreenTint ? 'Turn OFF Mood Tint' : 'Turn ON Mood Tint'}
                    >
                      <motion.div
                        animate={{ x: showMoodScreenTint ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-4 h-4 rounded-full bg-white shadow-md"
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] font-mono-spec">
                    <span className="text-indigo-200/80">Voice Command: &quot;Mood tint off karo&quot;</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${showMoodScreenTint ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/40'}`}>
                      {showMoodScreenTint ? 'MOOD TINT: ON' : 'MOOD TINT: OFF'}
                    </span>
                  </div>
                </div>

                {/* Theme Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-mono-spec text-[11px] font-bold uppercase tracking-wider text-white/80 block">
                      UI Theme Palette & Modes
                    </label>
                    <span className="text-[10px] font-mono-spec text-white/40">
                      Select palette or click OFF to disable
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(themes).map(([key, t]) => {
                      const themeObj = t as ThemeConfig;
                      const isSelected = currentThemeKey === key;
                      const isOff = key === 'off';
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            playClickSound?.();
                            if (isTimeBasedTheme) {
                              onToggleTimeBasedTheme(false);
                            }
                            onSelectTheme(key);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? isOff
                                ? 'bg-white/10 border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                                : 'bg-white/10 border-[#d946ef] shadow-[0_0_15px_rgba(217,70,239,0.3)]'
                              : 'bg-black/40 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[8px]"
                              style={{ backgroundColor: themeObj.primary }}
                            >
                              {isOff && <PowerOff size={9} className="text-black" />}
                            </span>
                            <div>
                              <span className="text-xs font-semibold font-mono-spec text-white block">
                                {themeObj.name}
                              </span>
                              <span className="text-[9px] text-white/40 block font-mono-spec">
                                {isOff ? 'No glow • Minimal slate' : isSelected ? 'Active Theme' : 'Click to apply'}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase font-mono-spec ${
                              isOff ? 'bg-white/20 text-white' : 'bg-[#d946ef]/20 text-[#d946ef]'
                            }`}>
                              SELECTED
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Day / Night / AMOLED Mode */}
                <div className="pt-3 border-t border-white/10">
                  <label className="font-mono-spec text-[11px] font-bold uppercase tracking-wider text-white/80 block mb-2">
                    Display Color Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2 font-mono-spec text-xs">
                    {[
                      { id: 'dark_amoled', label: 'AMOLED Black', icon: Moon },
                      { id: 'normal_dark', label: 'Normal Dark', icon: Moon },
                      { id: 'light', label: 'Light Mode', icon: Sun },
                    ].map((m) => {
                      const IconComp = m.icon;
                      return (
                        <button
                          key={m.id}
                          onClick={() => { playClickSound?.(); onSelectAppearanceMode(m.id); }}
                          className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                            appearanceMode === m.id ? 'bg-[#d946ef]/20 border-[#d946ef] text-white font-bold' : 'bg-black/30 border-white/10 text-white/60 hover:text-white'
                          }`}
                        >
                          <IconComp size={14} className="text-[#d946ef]" />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Glow Intensity */}
                <div className="pt-3 border-t border-white/10">
                  <label className="font-mono-spec text-[11px] font-bold uppercase tracking-wider text-white/80 block mb-2">
                    Avatar Glow Intensity
                  </label>
                  <div className="grid grid-cols-3 gap-2 font-mono-spec text-xs">
                    {['low', 'medium', 'high'].map((g) => (
                      <button
                        key={g}
                        onClick={() => { playClickSound?.(); onSelectGlowIntensity(g); }}
                        className={`p-2.5 rounded-xl border text-center uppercase font-bold transition-all cursor-pointer ${
                          glowIntensity === g ? 'bg-[#d946ef] text-black border-[#d946ef]' : 'bg-black/30 border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DEVICE CONTROL TAB */}
            {activeTab === 'device' && (
              <div className="space-y-4">
                {/* Auto GPS Location Integration Card */}
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-black/50 to-emerald-950/20 space-y-2.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe size={18} className="text-emerald-400" />
                      <div>
                        <h4 className="font-bold text-xs font-mono-spec text-white uppercase flex items-center gap-1.5">
                          Automatic GPS Location Feature
                        </h4>
                        <p className="text-[11px] text-white/60">
                          Auto-uses current GPS location for searching info, weather, & local queries.
                        </p>
                      </div>
                    </div>
                    {onRefreshUserLocation && (
                      <button
                        onClick={() => { playClickSound?.(); onRefreshUserLocation(); }}
                        className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono-spec font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Refresh Location
                      </button>
                    )}
                  </div>

                  {userLocation && (
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono-spec flex items-center justify-between">
                      <span className="text-white/60">Detected Place:</span>
                      <span className="font-bold text-emerald-300">
                        {userLocation.status === 'detecting' ? 'Locating...' : (userLocation.locationName || 'Delhi, India (Fallback)')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl border border-white/10 bg-black/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone size={18} className="text-[#d946ef]" />
                      <div>
                        <h4 className="font-bold text-xs font-mono-spec text-white uppercase">Device Control & App Automation</h4>
                        <p className="text-[11px] text-white/50">Allow LIZA to perform user-directed app commands & global back/home actions.</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono-spec font-bold uppercase border ${
                      accessibilityStatus.isEnabled 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}>
                      {accessibilityStatus.isEnabled ? 'Status: ON' : 'Status: OFF'}
                    </span>
                  </div>

                  {!accessibilityStatus.isEnabled && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ShieldAlert size={14} className="text-amber-400" />
                        Accessibility Permission Required
                      </div>
                      <p className="text-[11px] text-amber-200/80 leading-relaxed">
                        Device control on karne ke liye Android Accessibility permission enable karni padegi. Security reason se LIZA is permission ko automatically enable nahi kar sakti.
                      </p>
                      <button
                        onClick={() => {
                          playClickSound?.();
                          const res = accessibilityService.openAccessibilitySettings();
                          alert(res.message);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs uppercase flex items-center gap-1.5 hover:bg-amber-400 cursor-pointer transition-all shadow-md"
                      >
                        <ExternalLink size={12} /> Enable Device Control (Open Settings)
                      </button>
                    </div>
                  )}

                  {accessibilityStatus.isEnabled && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold">
                          <ShieldCheck size={14} className="text-emerald-400" />
                          LIZA Device Control Active
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40 text-emerald-300 font-mono-spec">
                          GLOBAL_ACTION_RECENTS Ready
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-200/80">
                        LizaAccessibilityService is running safely. Voice commands like "WhatsApp par message bhejo", "YouTube kholo", "Back karo", and "Home jao" are ready.
                      </p>
                      <div className="pt-1 flex items-center gap-2 text-[10px] text-emerald-300 font-mono-spec">
                        <span>Current Foreground: <strong className="text-white">{accessibilityStatus.foregroundApp.appName}</strong></span>
                        <span>•</span>
                        <span>State: <strong className="text-white">{accessibilityStatus.state}</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating Quick Global Actions & Recent Apps Trigger */}
                <div className="p-4 rounded-2xl border border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-black/60 relative overflow-hidden space-y-3 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs font-mono-spec text-cyan-300 uppercase flex items-center gap-1.5">
                        <Layers size={14} className="text-cyan-400 animate-pulse" /> Global System Navigation Controls
                      </h4>
                      <p className="text-[11px] text-white/60">Tap quick buttons below to trigger native AccessibilityService actions instantly.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {/* Floating Recent Apps Quick Icon Button */}
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        playClickSound?.();
                        const res = await accessibilityService.performGlobalAction('recents');
                        if (!accessibilityStatus.isEnabled) {
                          alert(res.message);
                        }
                      }}
                      className="relative p-3 rounded-xl bg-gradient-to-b from-purple-500/30 to-purple-900/40 border border-purple-400/50 hover:border-purple-300 text-purple-100 flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all group"
                    >
                      <div className="p-2 rounded-full bg-purple-500/30 group-hover:bg-purple-400/40 transition-colors shadow-inner">
                        <Layers size={20} className="text-purple-300 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="font-bold text-[11px] font-mono-spec text-white uppercase tracking-wider">
                        Recent Apps
                      </span>
                      <span className="text-[9px] text-purple-300/70 font-mono-spec">
                        RECENTS Action
                      </span>
                      {/* Floating Badge Indicator */}
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-purple-500 text-white font-mono-spec text-[8px] font-bold shadow-md animate-bounce">
                        Quick
                      </span>
                    </motion.button>

                    {/* Back Button */}
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        playClickSound?.();
                        const res = await accessibilityService.performGlobalAction('back');
                        if (!accessibilityStatus.isEnabled) {
                          alert(res.message);
                        }
                      }}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all group"
                    >
                      <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                        <ArrowLeft size={18} className="text-cyan-300" />
                      </div>
                      <span className="font-bold text-[11px] font-mono-spec text-white uppercase">
                        Back
                      </span>
                      <span className="text-[9px] text-white/50 font-mono-spec">
                        GLOBAL_BACK
                      </span>
                    </motion.button>

                    {/* Home Button */}
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        playClickSound?.();
                        const res = await accessibilityService.performGlobalAction('home');
                        if (!accessibilityStatus.isEnabled) {
                          alert(res.message);
                        }
                      }}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all group"
                    >
                      <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                        <Home size={18} className="text-emerald-300" />
                      </div>
                      <span className="font-bold text-[11px] font-mono-spec text-white uppercase">
                        Home
                      </span>
                      <span className="text-[9px] text-white/50 font-mono-spec">
                        GLOBAL_HOME
                      </span>
                    </motion.button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-white/10 bg-black/40 space-y-3">
                  <h4 className="font-bold text-xs font-mono-spec text-white uppercase flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-[#d946ef]" /> Supported Automation Commands & Allowlist
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <div className="font-bold text-cyan-300 flex items-center gap-1"><MessageSquare size={12}/> WhatsApp Automation</div>
                      <p className="text-white/60 text-[10px]">"Rahul ko WhatsApp par message bhejo ki main 10 min me aa raha hu." (Requires Voice Confirmation)</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <div className="font-bold text-red-400 flex items-center gap-1"><Tv size={12}/> YouTube Control</div>
                      <p className="text-white/60 text-[10px]">"YouTube kholo aur Free Fire update search karo."</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <div className="font-bold text-purple-300 flex items-center gap-1"><Smartphone size={12}/> Global Navigation</div>
                      <p className="text-white/60 text-[10px]">"Back karo", "Home screen jao", "Recent apps kholo"</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <div className="font-bold text-amber-300 flex items-center gap-1"><ShieldCheck size={12}/> Safe App Allowlist</div>
                      <p className="text-white/60 text-[10px]">YouTube, WhatsApp, Instagram, Gmail, Chrome, Spotify, Maps, Settings</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* 2. MEMORY TAB */}
            {activeTab === 'memory' && (
              <div className="space-y-4">
                {/* 24-Hour Memory Privacy Controls */}
                <div className="p-3.5 bg-black/60 border border-purple-500/30 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                        <Brain size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs font-mono-spec text-white uppercase">24-Hour Rolling Memory</h4>
                        <p className="text-[10px] text-white/50">Auto-saves conversation context for 24 hours, surviving app restarts.</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playClickSound?.();
                        if (onToggleSessionMemoryEnabled) {
                          onToggleSessionMemoryEnabled(!isSessionMemoryEnabled);
                        }
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer border ${
                        isSessionMemoryEnabled ? 'bg-purple-500 border-purple-400' : 'bg-white/10 border-white/20'
                      }`}
                      title={isSessionMemoryEnabled ? 'Disable 24-Hour Memory' : 'Enable 24-Hour Memory'}
                    >
                      <motion.div
                        animate={{ x: isSessionMemoryEnabled ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-4 h-4 rounded-full bg-white shadow-md"
                      />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10 font-mono-spec text-[10px]">
                    <span className="text-white/60 flex items-center gap-1.5">
                      Status: <strong className={isSessionMemoryEnabled ? 'text-purple-300' : 'text-amber-400'}>{isSessionMemoryEnabled ? 'ACTIVE (ON)' : 'PAUSED (OFF)'}</strong>
                      <span className="text-white/20">|</span>
                      <button
                        onClick={() => {
                          playClickSound?.();
                          setActiveTab('offline');
                        }}
                        className="text-emerald-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <HardDriveDownload size={10} /> Local Cache Ready ({cacheReport.overallReadinessPercentage}%) →
                      </button>
                    </span>

                    <div className="flex items-center gap-2">
                      {onClearSessionMemories && (
                        <button
                          onClick={() => { playClickSound?.(); onClearSessionMemories(); }}
                          className="px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 font-bold uppercase transition-colors"
                        >
                          Clear 24h Memories
                        </button>
                      )}
                      {memories.length > 0 && (
                        <button
                          onClick={() => { playClickSound?.(); onClearAllMemories(); }}
                          className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold uppercase transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={11} /> Clear All
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Memory Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchMemoryQuery}
                    onChange={(e) => setSearchMemoryQuery(e.target.value)}
                    placeholder="Search active memories..."
                    className="w-full bg-black/60 border border-white/15 focus:border-[#d946ef] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-white/30 font-mono-spec outline-none"
                  />
                  <Search size={14} className="absolute left-3 top-2.5 text-white/40" />
                </div>

                {/* Memory Items List */}
                {filteredMemories.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                    <Brain size={24} className="mx-auto text-white/20 mb-2" />
                    <p className="text-xs text-white/40 font-mono-spec">No active memories stored.</p>
                    <p className="text-[10px] text-white/30 mt-1">Say "Liza, remember that I am setting up YouTube" to save conversational context!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[42dvh] overflow-y-auto pr-1">
                    {filteredMemories.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#d946ef] font-mono-spec">{m.key}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono-spec font-bold uppercase border ${
                              m.memoryType === 'long_term' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            }`}>
                              {m.memoryType === 'long_term' ? 'Permanent' : getTimeRemainingText(m)}
                            </span>
                            <button
                              onClick={() => { playClickSound?.(); onDeleteMemory(m.id); }}
                              className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/10 transition-all cursor-pointer"
                              title="Delete Memory"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-white font-medium">{m.value}</p>
                        {m.detail && <p className="text-[10px] text-white/50">{m.detail}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs font-mono-spec text-white uppercase">Voice Notes</h4>
                    <p className="text-[11px] text-white/50">Say "Liza, note kar lo..." or add below.</p>
                  </div>
                  {notes.length > 0 && (
                    <button
                      onClick={() => { playClickSound?.(); onClearAllNotes(); }}
                      className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-[10px] font-mono-spec font-bold uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} /> Delete All
                    </button>
                  )}
                </div>

                {/* Add Note Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newNoteInput.trim()) {
                      onAddNote(newNoteInput.trim());
                      setNewNoteInput('');
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    placeholder="Type or dictate a quick note..."
                    className="flex-1 bg-black/60 border border-white/15 focus:border-[#d946ef] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 font-mono-spec outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-[#d946ef] text-black font-bold font-mono-spec text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Add
                  </button>
                </form>

                {/* Notes List */}
                {notes.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                    <FileText size={24} className="mx-auto text-white/20 mb-2" />
                    <p className="text-xs text-white/40 font-mono-spec">No notes recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notes.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl flex items-start justify-between gap-3"
                      >
                        <div className="flex-1">
                          <p className="text-xs text-white font-medium">{n.content}</p>
                          <span className="text-[9px] font-mono-spec text-white/40 block mt-1">
                            {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <button
                          onClick={() => { playClickSound?.(); onDeleteNote(n.id); }}
                          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/10 transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. CHAT HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs font-mono-spec text-white uppercase">Conversation History</h4>
                    <p className="text-[11px] text-white/50">Stored conversational dialogue turns and transcripts.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {onToggleHistoryEnabled && (
                      <button
                        onClick={() => {
                          playClickSound?.();
                          onToggleHistoryEnabled(!isHistoryEnabled);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-mono-spec font-bold uppercase border cursor-pointer transition-colors ${
                          isHistoryEnabled
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-red-500/20 text-red-300 border-red-500/40'
                        }`}
                      >
                        {isHistoryEnabled ? 'History: ON' : 'History: OFF'}
                      </button>
                    )}
                    {historyLog.length > 0 && onClearHistory && (
                      <button
                        onClick={() => { playClickSound?.(); onClearHistory(); }}
                        className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-[10px] font-mono-spec font-bold uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={12} /> Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* History List */}
                {historyLog.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                    <History size={24} className="mx-auto text-white/20 mb-2" />
                    <p className="text-xs text-white/40 font-mono-spec">No conversation history saved.</p>
                    <p className="text-[10px] text-white/30 mt-1">Chat transcripts will appear here automatically when enabled.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[44dvh] overflow-y-auto pr-1">
                    {historyLog.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono-spec text-white/40">{item.timestamp}</span>
                          {onDeleteHistoryItem && (
                            <button
                              onClick={() => { playClickSound?.(); onDeleteHistoryItem(item.id); }}
                              className="p-1 rounded text-white/40 hover:text-red-400 hover:bg-white/10 transition-all cursor-pointer"
                              title="Delete turn"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        {item.user && (
                          <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs">
                            <span className="text-[9px] font-mono-spec font-bold text-cyan-300 uppercase block mb-0.5">You</span>
                            <p className="text-white/90 font-sans leading-relaxed">{item.user}</p>
                          </div>
                        )}
                        {item.liza && (
                          <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs">
                            <span className="text-[9px] font-mono-spec font-bold text-[#d946ef] uppercase block mb-0.5">Liza</span>
                            <p className="text-gray-200 font-sans leading-relaxed">{item.liza}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. BATTERY & PERFORMANCE MODE TAB */}
            {activeTab === 'battery' && (
              <div className="space-y-4 font-mono-spec">
                <div>
                  <h4 className="font-bold text-xs text-white uppercase">Performance & Power Saver</h4>
                  <p className="text-[11px] text-white/50">Optimize animation workload and background rendering.</p>
                </div>

                <div className="space-y-2">
                  {[
                    { id: 'normal', title: 'Normal Mode', desc: 'Full high-framerate waveform & particle animations.' },
                    { id: 'battery_saver', title: 'Battery Saver', desc: 'Reduces particle counts and slows canvas refresh rate.' },
                    { id: 'data_saver', title: 'Data Saver', desc: 'Minimizes background network updates & preloads.' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { playClickSound?.(); onSelectPerformanceMode(p.id); }}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        performanceMode === p.id ? 'bg-[#d946ef]/20 border-[#d946ef] text-white shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'bg-black/30 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block text-white">{p.title}</span>
                        <span className="text-[10px] text-white/50 block mt-0.5">{p.desc}</span>
                      </div>
                      {performanceMode === p.id && <Check size={16} className="text-[#d946ef]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 6. OFFLINE CACHE & PERSONALITY AVAILABILITY TAB */}
            {activeTab === 'offline' && (
              <div className="space-y-4 font-mono-spec">
                {/* Header Title & Refresh Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase flex items-center gap-1.5">
                      <HardDriveDownload size={14} className="text-emerald-400" />
                      Offline Personality Cache
                    </h4>
                    <p className="text-[11px] text-white/50">
                      Local availability of Liza's core personality, memory vault, and fallback intelligence without internet.
                    </p>
                  </div>

                  <button
                    onClick={handleRefreshCache}
                    disabled={isRefreshingCache}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={isRefreshingCache ? 'animate-spin' : ''} />
                    {isRefreshingCache ? 'Syncing...' : 'Precache & Verify'}
                  </button>
                </div>

                {/* Main Hero Gauge Card */}
                <div className="p-4 bg-gradient-to-br from-emerald-950/40 via-black/60 to-purple-950/30 border border-emerald-500/30 rounded-2xl shadow-xl space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex flex-col items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                          <span className="text-sm font-black tracking-tight">{cacheReport.overallReadinessPercentage}%</span>
                          <span className="text-[8px] uppercase tracking-wider text-emerald-300/70 font-bold">Ready</span>
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Zero-Internet Core Status</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            100% Fully Cached
                          </span>
                        </div>
                        <p className="text-[10px] text-white/60 leading-relaxed mt-0.5">
                          Liza's core character guidelines, emotional matrix, Hinglish voice parameters, and memory vault are stored locally in device storage.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* High-level telemetry chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-center">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[9px] text-white/40 uppercase block">Total Local Data</span>
                      <span className="text-xs font-bold text-emerald-300">
                        {offlinePersonalityCacheService.formatBytes(cacheReport.totalSizeBytes)}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[9px] text-white/40 uppercase block">Subsystems</span>
                      <span className="text-xs font-bold text-white">
                        {cacheReport.cachedModules} / {cacheReport.totalModules} Ready
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[9px] text-white/40 uppercase block">Network State</span>
                      <span className={`text-xs font-bold flex items-center justify-center gap-1 ${
                        cacheReport.networkStatus === 'online' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cacheReport.networkStatus === 'online' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {cacheReport.networkStatus === 'online' ? 'Online' : 'Offline Mode'}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[9px] text-white/40 uppercase block">Local Recall</span>
                      <span className="text-xs font-bold text-[#d946ef]">
                        {memories.length} Memories
                      </span>
                    </div>
                  </div>
                </div>

                {/* Itemized Subsystems List */}
                <div className="space-y-2">
                  <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider flex items-center justify-between px-1">
                    <span>Cached Subsystem Modules ({cacheReport.modules.length})</span>
                    <span>Status / Footprint</span>
                  </div>

                  <div className="space-y-2 max-h-[34dvh] overflow-y-auto pr-1">
                    {cacheReport.modules.map((mod) => (
                      <div
                        key={mod.id}
                        onClick={() => {
                          playClickSound?.();
                          setSelectedModuleId(selectedModuleId === mod.id ? null : mod.id);
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          selectedModuleId === mod.id 
                            ? 'bg-white/[0.07] border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                            : 'bg-black/40 border-white/10 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                              {mod.category === 'persona' && <Sparkles size={14} />}
                              {mod.category === 'emotional' && <Heart size={14} />}
                              {mod.category === 'voice' && <Volume2 size={14} />}
                              {mod.category === 'memory' && <Brain size={14} />}
                              {mod.category === 'fallback_intents' && <Zap size={14} />}
                              {mod.category === 'contacts' && <Users size={14} />}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">{mod.name}</span>
                              <span className="text-[10px] text-white/50 line-clamp-1">{mod.description}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 size={10} /> 100%
                            </span>
                            <span className="text-[9px] text-white/40 block mt-0.5">
                              {offlinePersonalityCacheService.formatBytes(mod.sizeBytes)}
                            </span>
                          </div>
                        </div>

                        {/* Expandable Module Details */}
                        {selectedModuleId === mod.id && (
                          <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-2 text-[10px]">
                            <p className="text-white/70 leading-relaxed">{mod.description}</p>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {mod.offlineCapabilities.map((cap, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-[9px]"
                                >
                                  ✓ {cap}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Offline Personality Engine Simulator Sandbox */}
                <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                        <Zap size={13} className="text-amber-400" />
                        Test Offline Personality Responses
                      </span>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        Simulate Liza's instant conversational replies when disconnected from the internet.
                      </p>
                    </div>
                  </div>

                  {/* Preset test query chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: 'greeting', label: '👋 Greeting (Namaste)' },
                      { key: 'status', label: '⚡ Core Status' },
                      { key: 'love', label: '💖 Tsundere Banter' },
                      { key: 'comfort', label: '🌸 Comfort & Caring' },
                      { key: 'flashlight', label: '🔦 Flashlight Action' },
                      { key: 'battery', label: '🔋 Battery Telemetry' },
                    ].map((btn) => (
                      <button
                        key={btn.key}
                        type="button"
                        onClick={() => handleRunOfflineSim(btn.key)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${
                          offlineSimKey === btn.key
                            ? 'bg-[#d946ef] text-black border-[#d946ef]'
                            : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Test Query Form */}
                  <form onSubmit={handleCustomOfflineSim} className="flex gap-2">
                    <input
                      type="text"
                      value={customOfflinePrompt}
                      onChange={(e) => setCustomOfflinePrompt(e.target.value)}
                      placeholder="Type a query e.g. 'Status check' or 'Flashlight'..."
                      className="flex-1 bg-black/60 border border-white/15 focus:border-emerald-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/30 font-mono-spec outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] uppercase rounded-xl transition-colors cursor-pointer"
                    >
                      Test
                    </button>
                  </form>

                  {/* Simulation Response Bubble */}
                  {offlineSimResponse && (
                    <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="text-[#d946ef] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Sparkles size={11} /> Liza (Offline Engine)
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold uppercase">
                          Mood: {offlineSimResponse.mood}
                        </span>
                      </div>
                      <p className="text-xs text-white/90 font-sans leading-relaxed">
                        "{offlineSimResponse.reply}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7. GENERAL & WAKE WORD TAB */}
            {activeTab === 'general' && (
              <div className="space-y-5">
                {/* Voice Selection */}
                <div className="space-y-3 p-3.5 bg-black/40 border border-white/10 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-mono-spec text-[11px] font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                        <Volume2 size={13} className="text-[#d946ef]" />
                        VOICE
                      </label>
                      <p className="text-[11px] text-white/50 leading-normal mt-0.5">
                        Natural voice model for real-time speech synthesis.
                      </p>
                    </div>
                    <span className="text-[9px] font-mono-spec text-[#d946ef] bg-[#d946ef]/10 px-2 py-0.5 rounded-full border border-[#d946ef]/30">
                      Default: Lyra
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {[
                      { id: 'Lyra', label: 'Lyra (Default – Sweet Female)', desc: 'Original ultra-realistic sweet anime female voice' },
                      { id: 'Kore', label: 'Kore (Soft & Warm)', desc: 'Gentle and calm female tone' },
                      { id: 'Zephyr', label: 'Zephyr (Bright & Friendly Female)', desc: 'Upbeat and cheerful female voice' },
                      { id: 'Aoede', label: 'Aoede (Expressive Anime)', desc: 'Melodic and emotional anime voice' },
                      { id: 'Puck', label: 'Puck (Playful & Energetic)', desc: 'Youthful and witty tone' },
                      { id: 'Charon', label: 'Charon (Calm & Deep)', desc: 'Grounded deep male voice' },
                      { id: 'Fenrir', label: 'Fenrir (Deep & Resonant)', desc: 'Strong resonant voice' },
                    ].map((v) => {
                      const isSelected = (voiceName || 'Lyra') === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            playClickSound?.();
                            onUpdateVoiceName(v.id);
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#d946ef]/15 border-[#d946ef] text-white shadow-[0_0_12px_rgba(217,70,239,0.25)]'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-[#d946ef] ring-4 ring-[#d946ef]/20' : 'bg-white/30'}`} />
                            <div>
                              <div className="text-xs font-mono-spec font-medium text-white">{v.label}</div>
                              <div className="text-[10px] text-white/40">{v.desc}</div>
                            </div>
                          </div>
                          {isSelected && <Check size={15} className="text-[#d946ef] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Diagnostics */}
                <div className="space-y-2 pt-3 border-t border-white/10 font-mono-spec text-[10px]">
                  <div className="text-white/40 uppercase font-bold tracking-widest flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-[#d946ef]" /> System Diagnostics
                  </div>
                  <div className="bg-black/40 rounded-xl p-3 border border-white/5 space-y-1.5 text-white/70">
                    <div className="flex justify-between">
                      <span>Live Session Status:</span>
                      <span className={isActive ? 'text-emerald-400 font-bold' : 'text-gray-400'}>
                        {isActive ? 'ACTIVE_ONLINE' : 'STANDBY'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Microphone Gain:</span>
                      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#d946ef] transition-all" style={{ width: `${Math.min(100, micLevel * 500)}%` }} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Offline Personality Cache:</span>
                      <button
                        onClick={() => {
                          playClickSound?.();
                          setActiveTab('offline');
                        }}
                        className="text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <HardDriveDownload size={10} />
                        {cacheReport.overallReadinessPercentage}% Cached ({offlinePersonalityCacheService.formatBytes(cacheReport.totalSizeBytes)}) →
                      </button>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto-Reconnect Attempts:</span>
                      <span>{retryCount} / 5</span>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <button
                        onClick={() => {
                          playClickSound?.();
                          setShowWakeDiagModal(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-[10px] font-mono-spec font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Sparkles size={12} className="text-[#d946ef]" />
                        <span>Open Wake Word Diagnostics & Test Screen</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnostics Modal */}
            <WakeWordDiagnosticsModal
              isOpen={showWakeDiagModal}
              onClose={() => setShowWakeDiagModal(false)}
              playClickSound={playClickSound}
            />

            {/* 7. OWNER TAB */}
            {activeTab === 'admin' && (
              <div className="space-y-4">
                {isOwnerLoggedIn ? (
                  <AdminPanel
                    token={ownerToken}
                    onLogout={() => {
                      onLogoutOwner();
                      setActiveTab('appearance');
                    }}
                    systemPrompt={systemPrompt}
                    onUpdateSystemPrompt={onUpdateSystemPrompt}
                    voiceName={voiceName}
                    onUpdateVoiceName={onUpdateVoiceName}
                    model={model}
                    onUpdateModel={onUpdateModel}
                    memories={memories}
                    onRefreshMemories={onRefreshMemories}
                    onDeleteMemory={onDeleteMemory}
                    playClickSound={playClickSound}
                  />
                ) : (
                  <form onSubmit={handleOwnerLogin} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock size={16} className="text-[#d946ef]" />
                      <h4 className="font-bold text-xs font-mono-spec uppercase text-white">Owner Mode Authorization</h4>
                    </div>
                    <p className="text-[11px] text-white/50 leading-normal">
                      Only authenticated owner Paramveer Rawat can edit LIZA's core system prompts, AI models, and internal voice presets.
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="Enter Owner Password"
                          className="w-full bg-black/60 border border-white/15 focus:border-[#d946ef] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-white/30 font-mono-spec outline-none"
                        />
                        <KeyRound size={14} className="absolute left-3 top-2.5 text-white/40" />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoggingIn || !passwordInput}
                        className="px-4 py-2 rounded-xl bg-[#d946ef] text-black font-bold font-mono-spec text-xs uppercase hover:bg-[#f0abfc] transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isLoggingIn ? 'Verifying...' : 'Login'}
                      </button>
                    </div>
                    {loginError && <p className="text-[11px] text-red-400 font-mono-spec">{loginError}</p>}
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/10 bg-white/[0.02] text-center font-mono-spec text-[10px] text-white/40">
            LIZA NEXT-GEN SYSTEM ENGINE v3.5 // PARAMVEER RAWAT
          </div>
        </motion.div>
    </motion.div>
  );
};
