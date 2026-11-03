import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, Smartphone, Zap, MessageSquare, Flashlight, FileText, 
  Send, Mic, Square, Play, Trash2, Battery, RefreshCw, CheckCircle, BellRing,
  Car, AlertTriangle, Scan, Share2, PhoneCall, Volume2, ShieldAlert,
  Navigation, Eye, Pill, FileCode
} from 'lucide-react';
import { motionGesturesService } from '../services/motionGesturesService';
import { whatsAppQuickDispatcher, QuickMessageDraft } from '../services/whatsAppQuickDispatcher';
import { offlineSmartActionsService } from '../services/offlineSmartActionsService';
import { voiceMemoNotesService, VoiceMemoNote } from '../services/voiceMemoNotesService';
import { dynamicIslandService } from '../services/dynamicIslandService';
import { driveModeService, DriveModeState } from '../services/driveModeService';
import { emergencySosService, SosBeaconState } from '../services/emergencySosService';

export type MobileFeatureTab = 
  | 'island' 
  | 'gestures' 
  | 'whatsapp' 
  | 'offline' 
  | 'voice_memo'
  | 'drive_mode'
  | 'emergency_sos';

interface MobileFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: MobileFeatureTab;
  onVoiceTrigger?: (prompt: string) => void;
  playClickSound?: () => void;
}

export const MobileFeaturesModal: React.FC<MobileFeaturesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'island',
  onVoiceTrigger,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<MobileFeatureTab>(initialTab);

  // Tab 1: Dynamic Island
  const [islandEnabled, setIslandEnabled] = useState(dynamicIslandService.getStatus().isEnabled);

  // Tab 2: Gestures
  const [gestureCfg, setGestureCfg] = useState(motionGesturesService.getConfig());

  // Tab 3: WhatsApp
  const [waPhone, setWaPhone] = useState('');
  const [waMsg, setWaMsg] = useState('');

  // Tab 4: Offline Smart Actions
  const [isFlashlight, setIsFlashlight] = useState(offlineSmartActionsService.isFlashlightActive());
  const [batteryInfo, setBatteryInfo] = useState<{ level: number; charging: boolean } | null>(null);

  // Tab 5: Voice Memo & Notes
  const [isRecordingMemo, setIsRecordingMemo] = useState(voiceMemoNotesService.isCurrentlyRecording());
  const [memoTranscript, setMemoTranscript] = useState('');
  const [notes, setNotes] = useState<VoiceMemoNote[]>(voiceMemoNotesService.getNotes());

  // Tab 6: Drive Mode
  const [driveState, setDriveState] = useState<DriveModeState>(driveModeService.getState());

  // Tab 7: Emergency SOS
  const [sosState, setSosState] = useState<SosBeaconState>(emergencySosService.getState());
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    offlineSmartActionsService.getBatteryInfo().then(info => setBatteryInfo(info));
    const unsubDrive = driveModeService.subscribe(() => setDriveState(driveModeService.getState()));
    const unsubSos = emergencySosService.subscribe(() => setSosState(emergencySosService.getState()));
    return () => {
      unsubDrive();
      unsubSos();
    };
  }, []);

  const handleToggleFlashlight = async () => {
    playClickSound?.();
    const active = await offlineSmartActionsService.toggleFlashlight();
    setIsFlashlight(active);
    offlineSmartActionsService.triggerHapticVibrate(80);
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waMsg.trim()) return;
    playClickSound?.();
    whatsAppQuickDispatcher.dispatchWhatsApp(waPhone, waMsg);
  };

  const handleStartMemo = () => {
    playClickSound?.();
    voiceMemoNotesService.startRecording((chunk) => {
      setMemoTranscript(chunk);
    });
    setIsRecordingMemo(true);
  };

  const handleStopMemo = () => {
    playClickSound?.();
    const saved = voiceMemoNotesService.stopRecording();
    setIsRecordingMemo(false);
    setMemoTranscript('');
    setNotes(voiceMemoNotesService.getNotes());
    onVoiceTrigger?.(`Voice memo recorded. Title: ${saved.title}. Summary: ${saved.summary}`);
  };

  const handleToggleDriveMode = () => {
    playClickSound?.();
    const active = driveModeService.toggleDriveMode();
    if (active) {
      onVoiceTrigger?.('Drive Mode Activated for Paramveer Rawat. High-contrast large controls enabled and caller announcing is ON.');
    }
  };

  const handleTriggerSos = async () => {
    playClickSound?.();
    setGpsLoading(true);
    await emergencySosService.fetchLiveGpsCoordinates();
    emergencySosService.triggerSosBroadcast();
    setGpsLoading(false);
    onVoiceTrigger?.('EMERGENCY SOS BEACON BROADCASTED! Live GPS coordinates sent to trusted contacts.');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[170] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-3xl bg-slate-900/95 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/10 flex flex-col max-h-[92vh] overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 text-purple-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Mobile 10-Feature Supercharger Suite
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                  ULTRA MOBILE
                </span>
              </h2>
              <p className="text-xs text-slate-400">10 Ultra-Fast Smartphone Tools for Paramveer Rawat</p>
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
        <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'island', label: '🏝️ Dynamic Island', icon: BellRing },
            { id: 'gestures', label: '⚡ Gestures', icon: Zap },
            { id: 'whatsapp', label: '💬 Voice WhatsApp', icon: MessageSquare },
            { id: 'offline', label: '📴 Offline Actions', icon: Flashlight },
            { id: 'voice_memo', label: '🎙️ Voice Memo', icon: FileText },
            { id: 'drive_mode', label: '🚗 Drive Mode', icon: Car },
            { id: 'emergency_sos', label: '🚨 1-Tap SOS', icon: AlertTriangle },
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { playClickSound?.(); setActiveTab(tab.id as MobileFeatureTab); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: DYNAMIC ISLAND */}
          {activeTab === 'island' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-purple-200">Floating Dynamic Island Bubble</h3>
                  <p className="text-xs text-slate-400">Keep RAWAT AI always accessible while multitasking on mobile</p>
                </div>
                <button
                  onClick={() => {
                    playClickSound?.();
                    const next = !islandEnabled;
                    dynamicIslandService.toggleFloatingBubble(next);
                    setIslandEnabled(next);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    islandEnabled ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {islandEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
                <span className="font-bold text-slate-100 block">Features:</span>
                <p>• Sleek top pill showing live AI audio waveforms.</p>
                <p>• Quick launcher for voice mic, WhatsApp, memo, and flashlight.</p>
              </div>
            </div>
          )}

          {/* TAB 2: GESTURES */}
          {activeTab === 'gestures' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-100 block">📳 Double Shake to Listen</span>
                  <span className="text-[11px] text-slate-400">Phone ko 2 baar shake karte hi mic active hoga</span>
                </div>
                <button
                  onClick={() => {
                    playClickSound?.();
                    const updated = { shakeToListen: !gestureCfg.shakeToListen };
                    motionGesturesService.updateConfig(updated);
                    setGestureCfg(motionGesturesService.getConfig());
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    gestureCfg.shakeToListen ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {gestureCfg.shakeToListen ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-100 block">🔄 Flip to Mute (Face Down)</span>
                  <span className="text-[11px] text-slate-400">Phone ko table par ulta rakhne par Liza silent ho jayegi</span>
                </div>
                <button
                  onClick={() => {
                    playClickSound?.();
                    const updated = { flipToMute: !gestureCfg.flipToMute };
                    motionGesturesService.updateConfig(updated);
                    setGestureCfg(motionGesturesService.getConfig());
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    gestureCfg.flipToMute ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {gestureCfg.flipToMute ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WHATSAPP DISPATCHER */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-emerald-300">Voice-to-WhatsApp One-Shot Dispatcher</h3>
                <p className="text-xs text-slate-400">Send WhatsApp messages hands-free with direct deep-linking</p>
              </div>

              <form onSubmit={handleSendWhatsApp} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <input
                  type="text"
                  placeholder="Phone Number (e.g. 919876543210) or Contact Name"
                  value={waPhone}
                  onChange={e => setWaPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs"
                />
                <textarea
                  rows={2}
                  placeholder="Message (e.g. Bhai main 10 minute me pahuch raha hu)..."
                  value={waMsg}
                  onChange={e => setWaMsg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Open & Send via WhatsApp
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: OFFLINE QUICK ACTIONS */}
          {activeTab === 'offline' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-amber-300">Zero-Data & Hardware Controls</h3>
                <p className="text-xs text-slate-400">Hardware controls working directly on smartphone sensors</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleToggleFlashlight}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    isFlashlight
                      ? 'bg-amber-950/60 border-amber-400 text-amber-200'
                      : 'bg-slate-800/50 border-slate-700 text-slate-300'
                  }`}
                >
                  <Flashlight className="w-6 h-6" />
                  <span className="text-xs font-bold">Torch / Flashlight</span>
                  <span className="text-[10px]">{isFlashlight ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  onClick={() => {
                    playClickSound?.();
                    offlineSmartActionsService.triggerHapticVibrate([100, 50, 100]);
                  }}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex flex-col items-center gap-2 text-slate-300 hover:border-slate-500"
                >
                  <Zap className="w-6 h-6 text-purple-400" />
                  <span className="text-xs font-bold">Haptic Feedback Pulse</span>
                  <span className="text-[10px] text-slate-400">Test Vibration</span>
                </button>
              </div>

              {batteryInfo && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Battery className="w-4 h-4 text-emerald-400" />
                    <span>Battery Status: <strong>{batteryInfo.level}%</strong></span>
                  </div>
                  <span className="text-slate-400">{batteryInfo.charging ? '⚡ Charging' : 'On Battery'}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: VOICE MEMO & NOTES */}
          {activeTab === 'voice_memo' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-purple-300">Voice Memo & Meeting AI Taker</h3>
                  <p className="text-xs text-slate-400">Records live speech and structures into actionable bullets</p>
                </div>
                {isRecordingMemo ? (
                  <button
                    onClick={handleStopMemo}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5" /> Stop & Save
                  </button>
                ) : (
                  <button
                    onClick={handleStartMemo}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <Mic className="w-3.5 h-3.5" /> Record Memo
                  </button>
                )}
              </div>

              {isRecordingMemo && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-200">
                  <span className="font-bold flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> Listening to speech...
                  </span>
                  <p className="italic text-slate-300">{memoTranscript || 'Speak your thoughts or meeting points...'}</p>
                </div>
              )}

              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {notes.map(note => (
                  <div key={note.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100">{note.title}</span>
                      <span className="text-[10px] text-slate-500">{note.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{note.summary}</p>
                    <ul className="list-disc list-inside text-[10px] text-purple-300/90 space-y-0.5">
                      {note.bulletPoints.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: DRIVE & COMMUTE MODE */}
          {activeTab === 'drive_mode' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-amber-300">🚗 Drive & Commute Mode</h3>
                  <p className="text-xs text-slate-400">Hands-free big-button driving dashboard with caller announcer</p>
                </div>
                <button
                  onClick={handleToggleDriveMode}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${
                    driveState.isActive ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {driveState.isActive ? 'ACTIVE' : 'OFF'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">GPS Speedometer</span>
                  <span className="text-3xl font-mono font-bold text-amber-400">{driveState.speedKmh}</span>
                  <span className="text-xs text-slate-400 ml-1">KM/H</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-center">
                  <span className="text-[11px] text-slate-400">Caller Announcer</span>
                  <span className="text-xs font-bold text-emerald-400">Enabled (Voice)</span>
                  <span className="text-[10px] text-slate-500 mt-1">Reads incoming caller name aloud</span>
                </div>
              </div>

              {/* Big Driving Touch Targets */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    playClickSound?.();
                    onVoiceTrigger?.('Paramveer, navigating to Home using fastest traffic route.');
                  }}
                  className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex flex-col items-center gap-1 font-bold text-xs"
                >
                  <Navigation className="w-6 h-6" /> Navigate Home
                </button>
                <button
                  onClick={() => {
                    playClickSound?.();
                    const text = encodeURIComponent(driveState.autoReplyText);
                    if (typeof window !== 'undefined') window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                  }}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex flex-col items-center gap-1 font-bold text-xs"
                >
                  <MessageSquare className="w-6 h-6 text-cyan-300" /> Send "I am Driving"
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: EMERGENCY SOS */}
          {activeTab === 'emergency_sos' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-rose-200">🚨 1-Tap Emergency SOS & Live GPS Beacon</h3>
                  <p className="text-xs text-slate-300">Broadcasts instant safety alerts with live location to family & police</p>
                </div>
                <button
                  onClick={handleTriggerSos}
                  disabled={gpsLoading}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/40 flex items-center gap-2 animate-bounce"
                >
                  <ShieldAlert className="w-4 h-4" /> {gpsLoading ? 'LOCATING...' : 'TRIGGER SOS'}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-200 block">Emergency Contacts:</span>
                {sosState.emergencyContacts.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between border-b border-slate-800 pb-1.5 last:border-0">
                    <div>
                      <span className="font-semibold text-slate-200">{contact.name}</span>
                      <span className="text-[10px] text-slate-400 ml-2">({contact.relationship})</span>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-[11px] font-mono flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" /> {contact.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
};
