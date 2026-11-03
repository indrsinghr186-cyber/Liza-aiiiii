import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, Smartphone, ShieldCheck, Layers, Terminal, Download, 
  Copy, Check, AlertCircle, Play, Sparkles, Sliders, CheckCircle2, 
  Settings, Key, Radio, Cpu, RefreshCw
} from 'lucide-react';
import { nativeAndroidBridge, AndroidPermissionStatus } from '../services/nativeAndroidBridge';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
  onVoiceTrigger?: (msg: string) => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  isOpen,
  onClose,
  playClickSound,
  onVoiceTrigger
}) => {
  if (!isOpen) return null;

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [permStatus, setPermStatus] = useState<AndroidPermissionStatus>({
    accessibility: false,
    overlay: false,
    microphone: true,
    camera: true,
    location: true
  });
  const [screenReadResult, setScreenReadResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'permissions' | 'build_apk' | 'features'>('permissions');

  useEffect(() => {
    nativeAndroidBridge.getPermissionStatus().then(status => setPermStatus(status));
  }, []);

  const handleCopy = (text: string, id: string) => {
    playClickSound?.();
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleTestScreenRead = async () => {
    playClickSound?.();
    const text = await nativeAndroidBridge.readScreenContent();
    setScreenReadResult(text);
    onVoiceTrigger?.('Accessibility Screen Read successfully executed. Analyzing on-screen buttons and text.');
  };

  const handleTestSystemAction = async (action: 'back' | 'home' | 'recents' | 'notifications') => {
    playClickSound?.();
    await nativeAndroidBridge.triggerSystemAction(action);
    onVoiceTrigger?.(`Android System Action triggered: ${action.toUpperCase()}`);
  };

  const buildCliCommands = `npm run build\nnpx cap sync android\ncd android && ./gradlew assembleDebug`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[180] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-2xl bg-slate-900/95 border border-emerald-500/40 rounded-2xl shadow-2xl shadow-emerald-500/10 flex flex-col max-h-[90vh] overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Native Android APK Hub
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  APK READY
                </span>
              </h2>
              <p className="text-xs text-slate-400">Accessibility Service, Overlays & Standalone Android Build</p>
            </div>
          </div>
          <button
            onClick={() => { playClickSound?.(); onClose(); }}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 py-2.5 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2">
          {[
            { id: 'permissions', label: '🛡️ Android Permissions' },
            { id: 'build_apk', label: '📦 1-Click APK Build Guide' },
            { id: 'features', label: '⚡ Deep Android Features' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { playClickSound?.(); setActiveTab(tab.id as any); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* TAB 1: PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-slate-300 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-200 block text-xs">Accessibility Service Integration</span>
                  <span className="text-[11px] text-slate-400">Allows Liza to read on-screen elements & perform auto-taps for Paramveer Rawat</span>
                </div>
                <button
                  onClick={() => {
                    playClickSound?.();
                    nativeAndroidBridge.openAccessibilitySettings();
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg whitespace-nowrap"
                >
                  Configure
                </button>
              </div>

              {/* Permission List */}
              <div className="space-y-2">
                {[
                  {
                    name: 'Accessibility Service (Screen Reader & Auto Click)',
                    key: 'BIND_ACCESSIBILITY_SERVICE',
                    desc: 'Reads WhatsApp, YouTube, Instagram screen text & auto-clicks',
                    active: permStatus.accessibility
                  },
                  {
                    name: 'System Alert Window (Floating Island)',
                    key: 'SYSTEM_ALERT_WINDOW',
                    desc: 'Floats on top of all apps 24x7 like Dynamic Island',
                    active: permStatus.overlay
                  },
                  {
                    name: 'Always-On Audio & Microphone',
                    key: 'RECORD_AUDIO + FOREGROUND_SERVICE',
                    desc: 'Listens to "Hey Liza" hotword in background',
                    active: permStatus.microphone
                  },
                  {
                    name: 'High Precision Location & GPS',
                    key: 'ACCESS_FINE_LOCATION',
                    desc: 'Emergency SOS live beacon & driving speedometer',
                    active: permStatus.location
                  }
                ].map(perm => (
                  <div key={perm.key} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${perm.active ? 'text-emerald-400' : 'text-amber-400'}`} />
                        <span className="font-bold text-slate-100">{perm.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{perm.desc}</span>
                      <code className="text-[9px] text-slate-500 font-mono">{perm.key}</code>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
                      perm.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {perm.active ? 'ACTIVE' : 'CONFIGURED'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick Test Actions */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block text-xs">Accessibility Bridge Live Test:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={handleTestScreenRead}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-[11px] font-bold text-center"
                  >
                    📖 Read Screen
                  </button>
                  <button
                    onClick={() => handleTestSystemAction('back')}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold text-center"
                  >
                    ⬅️ Back Action
                  </button>
                  <button
                    onClick={() => handleTestSystemAction('home')}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold text-center"
                  >
                    🏠 Home Action
                  </button>
                  <button
                    onClick={() => handleTestSystemAction('notifications')}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold text-center"
                  >
                    🔔 Open Shade
                  </button>
                </div>

                {screenReadResult && (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-300/90 whitespace-pre-wrap max-h-28 overflow-y-auto">
                    {screenReadResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BUILD APK */}
          {activeTab === 'build_apk' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-100 block text-xs">Build Native APK in 3 Steps:</span>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>Project already contains all Capacitor & Android native manifests.</li>
                  <li>Run the 1-line build script below in terminal.</li>
                  <li>APK will be generated at <code>android/app/build/outputs/apk/debug/app-debug.apk</code></li>
                </ol>
              </div>

              {/* Copyable Terminal Command */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 relative group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Terminal Build Command
                  </span>
                  <button
                    onClick={() => handleCopy(buildCliCommands, 'build')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] flex items-center gap-1 font-bold"
                  >
                    {copiedCmd === 'build' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedCmd === 'build' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-black text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  {buildCliCommands}
                </pre>
              </div>

              {/* Package ID & Architecture */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Package ID</span>
                  <strong className="text-emerald-300 font-mono">com.rawat.ai.assistant</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Target Architecture</span>
                  <strong className="text-slate-200">arm64-v8a / armeabi-v7a / x86</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DEEP ANDROID FEATURES */}
          {activeTab === 'features' && (
            <div className="space-y-2.5">
              {[
                {
                  title: 'Auto WhatsApp & Social Messaging',
                  desc: 'Accessibility Service clicks chat, types message, and hits send without manual touch.'
                },
                {
                  title: 'Free Fire / BGMI In-Game Audio Radar',
                  desc: 'Listens for footsteps, gunshots, and zone warnings through screen accessibility events.'
                },
                {
                  title: 'System Hardware Direct Control',
                  desc: 'Toggle camera torch, adjust ringtone volume, manage Bluetooth and battery saving directly.'
                },
                {
                  title: 'Always-On Lockscreen Floating Orb',
                  desc: 'Wake up Liza instantly even when other full-screen apps or games are running.'
                }
              ].map((feat, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-bold text-slate-100 block text-xs">{feat.title}</span>
                  <p className="text-[11px] text-slate-400">{feat.desc}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
};
