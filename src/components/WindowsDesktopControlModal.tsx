import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Monitor,
  Laptop,
  Power,
  Volume2,
  VolumeX,
  BatteryCharging,
  Battery,
  Cpu,
  MousePointer,
  Keyboard,
  Layers,
  FolderOpen,
  Camera,
  RefreshCw,
  Terminal,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  X,
  Search,
  FileText,
  Activity,
  MessageSquare,
  Send,
  CheckCircle,
  Sparkles,
  Phone,
  User
} from 'lucide-react';
import { windowsCompanionService, CompanionStatus, SystemTelemetry } from '../services/windowsCompanionService';
import { SystemHealthDashboard } from './SystemHealthDashboard';
import { 
  voiceMessageAutomationService, 
  VoiceMessageDraft, 
  MessageRecipient, 
  MessagingPlatform 
} from '../services/voiceMessageAutomationService';

interface WindowsDesktopControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeScreenWithLiza?: (base64: string) => void;
}

export const WindowsDesktopControlModal: React.FC<WindowsDesktopControlModalProps> = ({
  isOpen,
  onClose,
  onAnalyzeScreenWithLiza
}) => {
  const [status, setStatus] = useState<CompanionStatus>(windowsCompanionService.getStatus());
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(windowsCompanionService.getTelemetry());
  const [activeTab, setActiveTab] = useState<'hud' | 'health' | 'messages' | 'mouse' | 'apps' | 'files' | 'setup'>('hud');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [screenPreview, setScreenPreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [typeTextInput, setTypeTextInput] = useState<string>('');
  const [fileSearchQuery, setFileSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [customVoiceCmd, setCustomVoiceCmd] = useState<string>('');
  const [contactsList, setContactsList] = useState<MessageRecipient[]>(() => voiceMessageAutomationService.getAllContacts());
  const [sentHistory, setSentHistory] = useState<VoiceMessageDraft[]>(() => voiceMessageAutomationService.getSentHistory());
  const [selectedPlatform, setSelectedPlatform] = useState<MessagingPlatform>('whatsapp');

  useEffect(() => {
    const unsubComp = windowsCompanionService.subscribe((s, t) => {
      setStatus(s);
      setTelemetry(t);
    });
    const unsubMsg = voiceMessageAutomationService.subscribe(() => {
      setSentHistory(voiceMessageAutomationService.getSentHistory());
      setContactsList(voiceMessageAutomationService.getAllContacts());
    });
    return () => {
      unsubComp();
      unsubMsg();
    };
  }, []);

  const handleSimulateVoiceCommand = (cmd: string) => {
    const parsed = voiceMessageAutomationService.parseNaturalVoiceCommand(cmd);
    if (parsed) {
      const res = voiceMessageAutomationService.composeDraft(parsed.recipientQuery, parsed.messageInstruction, parsed.platform);
      triggerFeedback(`LIZA: "${res.promptToSpeak}"`);
    } else {
      triggerFeedback(`Command parsed: "${cmd}"`);
    }
  };

  const triggerFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleRefresh = async () => {
    await windowsCompanionService.checkHealth();
    triggerFeedback('Refreshed connection & telemetry');
  };

  // Mouse Controls
  const handleMouseMove = async (dx: number, dy: number) => {
    const res = await windowsCompanionService.mouseControl({ action: 'move', dx, dy });
    if (res.success) triggerFeedback(`Mouse moved (${dx > 0 ? '+' : ''}${dx}, ${dy > 0 ? '+' : ''}${dy})`);
    else triggerFeedback(res.message || 'Mouse move failed');
  };

  const handleMouseClick = async (type: 'click' | 'double_click' | 'right_click') => {
    const res = await windowsCompanionService.mouseControl({ action: type });
    if (res.success) triggerFeedback(`Mouse ${type.replace('_', ' ')} executed`);
    else triggerFeedback(res.message || 'Mouse click failed');
  };

  const handleMouseScroll = async (amount: number) => {
    const res = await windowsCompanionService.mouseControl({ action: 'scroll', scroll_amount: amount });
    if (res.success) triggerFeedback(`Scrolled ${amount > 0 ? 'Up' : 'Down'}`);
    else triggerFeedback(res.message || 'Scroll failed');
  };

  // Keyboard Controls
  const handleHotkey = async (combo: string) => {
    const res = await windowsCompanionService.keyboardControl({ action: 'hotkey', hotkey: combo });
    if (res.success) triggerFeedback(`Pressed ${combo.toUpperCase()}`);
    else triggerFeedback(res.message || 'Hotkey failed');
  };

  const handleTypeText = async () => {
    if (!typeTextInput.trim()) return;
    const res = await windowsCompanionService.keyboardControl({ action: 'type', text: typeTextInput });
    if (res.success) {
      triggerFeedback(`Typed: "${typeTextInput}"`);
      setTypeTextInput('');
    } else {
      triggerFeedback(res.message || 'Typing failed');
    }
  };

  // App Launchers
  const handleLaunchApp = async (appName: string, url?: string) => {
    const res = await windowsCompanionService.launchApp(appName, url);
    if (res.success) triggerFeedback(`Launched ${appName}`);
    else triggerFeedback(res.message || `Failed to launch ${appName}`);
  };

  const handleCloseApp = async (appName: string) => {
    const res = await windowsCompanionService.closeApp(appName);
    if (res.success) triggerFeedback(`Closed ${appName}`);
    else triggerFeedback(res.message || `Failed to close ${appName}`);
  };

  // System Controls
  const handleVolume = async (action: 'volume_up' | 'volume_down' | 'mute') => {
    const res = await windowsCompanionService.systemControl({ action });
    if (res.success) {
      await windowsCompanionService.fetchTelemetry();
      triggerFeedback(action === 'mute' ? 'Toggled Mute' : `Volume: ${res.volume}%`);
    } else {
      triggerFeedback(res.message || 'Volume adjust failed');
    }
  };

  const handleLock = async () => {
    const res = await windowsCompanionService.systemControl({ action: 'lock' });
    if (res.success) triggerFeedback('Windows 11 Workstation Locked');
  };

  // Screen Vision
  const handleCaptureScreen = async () => {
    setIsCapturing(true);
    triggerFeedback('Capturing Dell Latitude 7420 desktop display...');
    const res = await windowsCompanionService.captureScreen();
    setIsCapturing(false);
    if (res.success && res.base64) {
      setScreenPreview(res.base64);
      triggerFeedback(`Captured display: "${res.active_window || 'Desktop'}"`);
      if (onAnalyzeScreenWithLiza) {
        onAnalyzeScreenWithLiza(res.base64);
      }
    } else {
      triggerFeedback(res.message || 'Screen capture failed');
    }
  };

  // File Operations
  const handleSearchFiles = async () => {
    const res = await windowsCompanionService.fileControl({
      action: 'search',
      query: fileSearchQuery,
      directory: 'downloads'
    });
    if (res.success && res.files) {
      setSearchResults(res.files);
      triggerFeedback(`Found ${res.files.length} matching files`);
    } else {
      triggerFeedback(res.message || 'Search failed');
    }
  };

  const handleFindPdfs = async () => {
    setFileSearchQuery('');
    const res = await windowsCompanionService.fileControl({
      action: 'list',
      extension: 'pdf',
      directory: 'downloads'
    });
    if (res.success && res.files) {
      setSearchResults(res.files);
      triggerFeedback(`Found ${res.files.length} PDF documents in Downloads`);
    } else {
      triggerFeedback(res.message || 'PDF lookup failed');
    }
  };

  if (!isOpen) return null;

  const isConnected = status === 'connected';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          id="windows-companion-modal"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-7xl max-h-[92vh] bg-slate-950 border border-indigo-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-indigo-500/20 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold tracking-wide text-white">
                    LIZA WINDOWS 11 DESKTOP COMPANION
                  </h2>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider ${
                      isConnected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {isConnected ? 'Connected • 127.0.0.1:8765' : 'Offline • Run Companion'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span>Target: Dell Latitude 7420</span>
                  <span aria-hidden="true">·</span>
                  <span>Owner: Paramveer Rawat</span>
                  <span aria-hidden="true">·</span>
                  <span>Voice: Gemini Lyra</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                title="Refresh Telemetry"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Feedback Banner */}
          {actionFeedback && (
            <div className="px-6 py-2 bg-indigo-500/10 border-b border-indigo-500/30 text-xs font-mono text-indigo-300 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* Nav Tabs */}
          <div className="px-6 py-2 border-b border-slate-800/80 bg-slate-900/30 flex items-center gap-1 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('hud')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'hud'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cockpit (Health & Window Controls)</span>
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'health'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>System Health</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'messages'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Voice Messaging</span>
            </button>
            <button
              onClick={() => setActiveTab('mouse')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'mouse'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mouse & Keyboard
            </button>
            <button
              onClick={() => setActiveTab('apps')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'apps'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Application Manager
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'files'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              File Explorer
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'setup'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Setup & Build Guide
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {!isConnected && activeTab !== 'setup' && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-300">Windows Companion Agent is not running locally</p>
                  <p className="text-amber-200/80">
                    To enable actual mouse clicks, typing, window switching, and real battery percentage on your Dell
                    Latitude 7420, run <code>windows_companion\run_companion.bat</code> or build the standalone executable.
                  </p>
                  <button
                    onClick={() => setActiveTab('setup')}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 cursor-pointer"
                  >
                    View Setup Instructions & Build Script →
                  </button>
                </div>
              </div>
            )}

            {/* TAB 1: COCKPIT TWO-COLUMN GRID (HEALTH CHARTS LEFT, ACTIVE WINDOW CONTROLS RIGHT) */}
            {activeTab === 'hud' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column (col-span-6): System Health Charts */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        System Health & Telemetry Charts
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400/90 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800/40">
                      Dell 7420 · Intel i7 · Iris Xe
                    </span>
                  </div>

                  {/* Compact System Health Dashboard with real-time charts */}
                  <SystemHealthDashboard compact={true} />
                </div>

                {/* Right Column (col-span-6): Active Window Controls */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        Active Window Controls
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400/90 bg-purple-950/60 px-2.5 py-0.5 rounded border border-purple-800/40">
                      Windows 11 UI Automation
                    </span>
                  </div>

                  {/* 1. Active Window State & Action Bar */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        FOREGROUND WINDOW:
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Auto-detected</span>
                    </div>
                    <div
                      className="text-sm font-semibold text-white truncate font-mono bg-slate-950 px-3 py-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between"
                      title={telemetry?.active_window || 'Desktop / Active Window'}
                    >
                      <span className="truncate">{telemetry?.active_window || 'Google Chrome'}</span>
                      <span className="text-[10px] text-cyan-400 font-mono px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-800/50 shrink-0 ml-2">Active</span>
                    </div>

                    {/* Window Management Action Toolbar */}
                    <div className="grid grid-cols-5 gap-2 pt-1">
                      <button
                        onClick={() => windowsCompanionService.windowControl('switch')}
                        className="px-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-center flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer"
                        title="Switch to next active window"
                      >
                        <span className="font-semibold text-white">Alt+Tab</span>
                        <span className="text-[9px] text-slate-400">Switch</span>
                      </button>
                      <button
                        onClick={() => windowsCompanionService.windowControl('minimize')}
                        className="px-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-center flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer"
                        title="Minimize current window"
                      >
                        <span className="font-semibold text-white">Minimize</span>
                        <span className="text-[9px] text-slate-400">Win+Down</span>
                      </button>
                      <button
                        onClick={() => windowsCompanionService.windowControl('maximize')}
                        className="px-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-center flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer"
                        title="Maximize current window"
                      >
                        <span className="font-semibold text-white">Maximize</span>
                        <span className="text-[9px] text-slate-400">Win+Up</span>
                      </button>
                      <button
                        onClick={() => handleHotkey('win+d')}
                        className="px-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-center flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer"
                        title="Show Desktop toggle"
                      >
                        <span className="font-semibold text-white">Desktop</span>
                        <span className="text-[9px] text-slate-400">Win+D</span>
                      </button>
                      <button
                        onClick={() => windowsCompanionService.windowControl('close')}
                        className="px-2 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 text-xs font-mono text-center flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer"
                        title="Close current window"
                      >
                        <span className="font-semibold text-red-200">Close</span>
                        <span className="text-[9px] text-red-400/80">Alt+F4</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Direct Typing to Active Window & Hotkeys */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <Keyboard className="w-4 h-4 text-cyan-400" />
                        Type Directly to Active Window
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Live Input Injection</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={typeTextInput}
                        onChange={(e) => setTypeTextInput(e.target.value)}
                        placeholder="Type message or commands to send to active window..."
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleTypeText();
                        }}
                      />
                      <button
                        onClick={handleTypeText}
                        className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Type</span>
                      </button>
                    </div>

                    {/* System Hotkeys Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                      {[
                        { label: 'Copy', hotkey: 'ctrl+c', kbd: 'Ctrl+C' },
                        { label: 'Paste', hotkey: 'ctrl+v', kbd: 'Ctrl+V' },
                        { label: 'Select All', hotkey: 'ctrl+a', kbd: 'Ctrl+A' },
                        { label: 'Enter Key', hotkey: 'enter', kbd: '↵ Enter' },
                        { label: 'Explorer', hotkey: 'win+e', kbd: 'Win+E' },
                        { label: 'Task Mgr', hotkey: 'ctrl+shift+esc', kbd: 'Ctrl+Shift+Esc' },
                      ].map((hk) => (
                        <button
                          key={hk.hotkey}
                          onClick={() => handleHotkey(hk.hotkey)}
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white transition-colors text-center cursor-pointer"
                          title={`Trigger ${hk.kbd}`}
                        >
                          <div className="font-semibold text-[10px] text-cyan-400">{hk.label}</div>
                          <div className="text-[9px] text-slate-500">{hk.kbd}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Screen Vision Capture & Analysis */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-semibold text-white">Gemini Optical Screen Vision</h4>
                      </div>
                      <button
                        onClick={handleCaptureScreen}
                        disabled={isCapturing}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isCapturing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                        <span>{isCapturing ? 'Capturing...' : 'Capture & Analyze'}</span>
                      </button>
                    </div>

                    {screenPreview ? (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono text-slate-400">ACTIVE SCREEN PREVIEW:</div>
                        <img
                          src={`data:image/jpeg;base64,${screenPreview}`}
                          alt="Screen Preview"
                          className="w-full max-h-44 object-contain rounded-lg border border-slate-800 bg-black"
                        />
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        Takes an instant screen capture from your active desktop and passes it to Liza to read error dialogs or explain UI elements.
                      </p>
                    )}
                  </div>

                  {/* 4. Mouse Clicks & Volume/Lock Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Mouse Actions */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <MousePointer className="w-3.5 h-3.5 text-indigo-400" />
                          Mouse Pointer
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">Actions</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => handleMouseClick('click')}
                          className="px-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold font-mono transition-colors text-center cursor-pointer"
                        >
                          Left Click
                        </button>
                        <button
                          onClick={() => handleMouseClick('double_click')}
                          className="px-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono transition-colors text-center cursor-pointer"
                        >
                          Double
                        </button>
                        <button
                          onClick={() => handleMouseClick('right_click')}
                          className="px-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono transition-colors text-center cursor-pointer"
                        >
                          Right
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handleMouseScroll(300)}
                          className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 cursor-pointer"
                        >
                          Scroll Up ↑
                        </button>
                        <button
                          onClick={() => handleMouseScroll(-300)}
                          className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 cursor-pointer"
                        >
                          Scroll Down ↓
                        </button>
                      </div>
                    </div>

                    {/* System Volume & Power Quick Bar */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                          Volume & Power
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          {telemetry?.volume !== undefined ? `${telemetry.volume}%` : '60%'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleVolume('volume_down')}
                          className="flex-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 text-center cursor-pointer"
                        >
                          -10 Vol
                        </button>
                        <button
                          onClick={() => handleVolume('volume_up')}
                          className="flex-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 text-center cursor-pointer"
                        >
                          +10 Vol
                        </button>
                        <button
                          onClick={() => handleVolume('mute')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                          title="Mute Audio"
                        >
                          <VolumeX className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={handleLock}
                        className="w-full px-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>Lock Workstation (Win+L)</span>
                      </button>
                    </div>
                  </div>

                  {/* 5. Quick Application Launchpad */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Launch & Focus Application:</span>
                      <button
                        onClick={() => setActiveTab('apps')}
                        className="text-[10px] text-cyan-400 hover:underline font-mono cursor-pointer"
                      >
                        All Applications →
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { name: 'WhatsApp', key: 'whatsapp' },
                        { name: 'Chrome', key: 'chrome' },
                        { name: 'YouTube', key: 'youtube', url: 'https://www.youtube.com' },
                        { name: 'Notepad', key: 'notepad' },
                        { name: 'Calculator', key: 'calc' },
                        { name: 'Explorer', key: 'explorer' },
                        { name: 'Settings', key: 'settings' },
                        { name: 'Task Mgr', key: 'taskmgr' },
                      ].map((app) => (
                        <button
                          key={app.key}
                          onClick={() => handleLaunchApp(app.key, app.url)}
                          className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white transition-colors text-center truncate cursor-pointer"
                        >
                          {app.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SYSTEM HEALTH (RECHARTS REAL-TIME HARDWARE MONITOR) */}
            {activeTab === 'health' && (
              <SystemHealthDashboard />
            )}

            {/* TAB: VOICE MESSAGING AUTOMATION */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white font-mono-spec">LIZA SMART VOICE MESSAGE AUTOMATION</h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                          WINDOWS 11 NATIVE
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Voice-controlled messaging with contact disambiguation, safety preview, and WhatsApp/Telegram/SMS dispatch.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400">Target Channel:</span>
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value as MessagingPlatform)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="whatsapp">WhatsApp Desktop / Web</option>
                      <option value="telegram">Telegram Desktop</option>
                      <option value="sms">Windows Phone Link (SMS)</option>
                      <option value="email">Windows Mail / Outlook</option>
                    </select>
                  </div>
                </div>

                {/* Natural Voice Command Simulator */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Natural Voice Command Presets (Hindi / English / Hinglish)</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Tap any chip to simulate voice input</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { cmd: 'Liza, Rahul ko Hi message bhejo.', desc: 'Quick greeting' },
                      { cmd: 'Liza, mummy ko WhatsApp karo ki main ghar aa raha hoon.', desc: 'Coming home status' },
                      { cmd: 'Liza, Amit ko Happy Birthday wish karo.', desc: 'Birthday with emojis' },
                      { cmd: 'Liza, Priya ko bolo main thodi der mein aaunga.', desc: 'Delay / ETA notice' },
                      { cmd: 'Liza, Rahul ko message bhejo: Call me when you are free.', desc: 'Direct message text' },
                      { cmd: 'Usko bol dena ki main busy hoon.', desc: 'Last contact resolution' },
                      { cmd: 'Rahul ko good morning bhej do.', desc: 'Morning wish' },
                      { cmd: 'Mummy ko bata do ki main pahunch gaya.', desc: 'Arrival confirmation' },
                      { cmd: 'Last contact ko hello bhejo.', desc: 'Target previous recipient' }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSimulateVoiceCommand(item.cmd)}
                        className="p-2.5 rounded-xl bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 transition-all text-left group cursor-pointer"
                      >
                        <div className="text-xs font-medium text-white group-hover:text-emerald-300 transition-colors">
                          "{item.cmd}"
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          {item.desc}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Custom Voice Command Input */}
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={customVoiceCmd}
                      onChange={(e) => setCustomVoiceCmd(e.target.value)}
                      placeholder='Type any voice instruction e.g. "Rahul ko bolo main 10 min mein aata hoon"'
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customVoiceCmd.trim()) {
                          handleSimulateVoiceCommand(customVoiceCmd);
                          setCustomVoiceCmd('');
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (customVoiceCmd.trim()) {
                          handleSimulateVoiceCommand(customVoiceCmd);
                          setCustomVoiceCmd('');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Simulate Command</span>
                    </button>
                  </div>
                </div>

                {/* Contacts Directory & Disambiguation Testing */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contacts List */}
                  <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <User className="w-4 h-4 text-cyan-400" />
                        <span>Windows & LIZA Contacts Directory ({contactsList.length})</span>
                      </div>
                      <button
                        onClick={() => handleSimulateVoiceCommand('Liza, Rahul ko Hi message bhejo')}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-mono underline cursor-pointer"
                        title="Simulates ambiguous match between Rahul Sharma & Rahul Verma"
                      >
                        Test Ambiguity ("Rahul")
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {contactsList.map((c) => (
                        <div
                          key={c.id}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${c.avatarColor || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-xs font-bold text-white font-mono`}>
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-medium text-white flex items-center gap-1.5">
                                {c.name}
                                {c.relationship && (
                                  <span className="text-[10px] text-emerald-400 font-mono">
                                    · {c.relationship}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5" /> {c.phone}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              voiceMessageAutomationService.composeDraft(c.name, 'Hello! Hope you are doing well.', selectedPlatform);
                              triggerFeedback(`Composed draft for ${c.name}`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-2.5 h-2.5" />
                            <span>Quick Message</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safety & Verification Flow Info */}
                  <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Safety, Disambiguation & Verification Protocol</span>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-300">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          1
                        </div>
                        <div>
                          <strong className="text-white">Strict Recipient Verification:</strong> LIZA never guesses a recipient. If two contacts have the same name (e.g. Rahul Sharma & Rahul Verma), LIZA explicitly asks which one before composing.
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          2
                        </div>
                        <div>
                          <strong className="text-white">Human-In-The-Loop Confirmation:</strong> A message is NEVER dispatched silently. LIZA shows a preview card on screen and speaks: <em>"[Contact] ko '[Message]' bhejna hai. Send kar doon?"</em>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          3
                        </div>
                        <div>
                          <strong className="text-white">Deduplication Protection:</strong> Rapid duplicate commands to the same recipient with the same message body are intercepted within a 10-second safety window.
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          4
                        </div>
                        <div>
                          <strong className="text-white">Verified Windows 11 Dispatch:</strong> Dispatched via local companion agent through WhatsApp Desktop/Web URI protocols with delivery status confirmation.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sent Messages Audit Log */}
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Dispatched Messages Audit Log ({sentHistory.length})</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Stored locally for security</span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 divide-y divide-slate-850 max-h-56 overflow-y-auto">
                    {sentHistory.length > 0 ? (
                      sentHistory.map((item, idx) => (
                        <div key={idx} className="p-3 flex items-start justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{item.recipient.name}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 uppercase">
                                {item.platform}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(item.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-slate-300 font-sans italic">"{item.messageText}"</p>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono shrink-0">
                            <CheckCircle className="w-3 h-3" />
                            <span>Verified</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No messages sent yet. Use the voice command presets above to test messaging automation!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MOUSE & KEYBOARD */}
            {activeTab === 'mouse' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mouse Pad */}
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <MousePointer className="w-4 h-4 text-indigo-400" />
                    <span>Precision Mouse Control</span>
                  </div>

                  {/* D-Pad */}
                  <div className="flex flex-col items-center justify-center gap-2 py-3">
                    <button
                      onClick={() => handleMouseMove(0, -60)}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 font-mono text-xs"
                    >
                      ▲ UP (60px)
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleMouseMove(-60, 0)}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 font-mono text-xs"
                      >
                        ◀ LEFT
                      </button>
                      <button
                        onClick={() => handleMouseClick('click')}
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold"
                      >
                        CLICK
                      </button>
                      <button
                        onClick={() => handleMouseMove(60, 0)}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 font-mono text-xs"
                      >
                        RIGHT ▶
                      </button>
                    </div>
                    <button
                      onClick={() => handleMouseMove(0, 60)}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 font-mono text-xs"
                    >
                      ▼ DOWN (60px)
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleMouseClick('double_click')}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-center"
                    >
                      Double Click
                    </button>
                    <button
                      onClick={() => handleMouseClick('right_click')}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-center"
                    >
                      Right Click
                    </button>
                    <button
                      onClick={() => handleMouseScroll(-300)}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-center"
                    >
                      Scroll Down
                    </button>
                  </div>
                </div>

                {/* Keyboard Controls */}
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Keyboard className="w-4 h-4 text-cyan-400" />
                    <span>Keyboard & System Hotkeys</span>
                  </div>

                  {/* Quick Hotkeys */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => handleHotkey('win+d')}
                      className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-mono text-left flex items-center justify-between"
                    >
                      <span>Show Desktop</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-[10px]">Win+D</kbd>
                    </button>
                    <button
                      onClick={() => handleHotkey('alt+tab')}
                      className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-mono text-left flex items-center justify-between"
                    >
                      <span>Switch Window</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-[10px]">Alt+Tab</kbd>
                    </button>
                    <button
                      onClick={() => handleHotkey('ctrl+c')}
                      className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-mono text-left flex items-center justify-between"
                    >
                      <span>Copy</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-[10px]">Ctrl+C</kbd>
                    </button>
                    <button
                      onClick={() => handleHotkey('ctrl+v')}
                      className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-mono text-left flex items-center justify-between"
                    >
                      <span>Paste</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-[10px]">Ctrl+V</kbd>
                    </button>
                    <button
                      onClick={() => handleHotkey('ctrl+shift+esc')}
                      className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-mono text-left flex items-center justify-between"
                    >
                      <span>Task Manager</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-[10px]">Ctrl+Shift+Esc</kbd>
                    </button>
                    <button
                      onClick={() => handleHotkey('win+e')}
                      className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-mono text-left flex items-center justify-between"
                    >
                      <span>File Explorer</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-[10px]">Win+E</kbd>
                    </button>
                  </div>

                  {/* Type Text Input */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="text-xs font-mono text-slate-400">Type Text to Active Window:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={typeTextInput}
                        onChange={(e) => setTypeTextInput(e.target.value)}
                        placeholder="Type message or commands..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleTypeText();
                        }}
                      />
                      <button
                        onClick={handleTypeText}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs"
                      >
                        Type
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: APPLICATION MANAGER */}
            {activeTab === 'apps' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Windows 11 Launchpad</h3>
                  <span className="text-xs font-mono text-slate-400">Safe Verified Executables</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[
                    { name: 'Google Chrome', key: 'chrome', icon: '🌐' },
                    { name: 'YouTube', key: 'youtube', icon: '▶️', url: 'https://www.youtube.com' },
                    { name: 'Notepad', key: 'notepad', icon: '📝' },
                    { name: 'Calculator', key: 'calc', icon: '🧮' },
                    { name: 'File Explorer', key: 'explorer', icon: '📁' },
                    { name: 'Windows Settings', key: 'settings', icon: '⚙️' },
                    { name: 'Task Manager', key: 'taskmgr', icon: '📊' },
                    { name: 'Command Terminal', key: 'cmd', icon: '💻' }
                  ].map((app) => (
                    <div
                      key={app.key}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{app.icon}</span>
                        <span className="text-xs font-medium text-white">{app.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLaunchApp(app.key, app.url)}
                          className="flex-1 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono text-center"
                        >
                          Launch
                        </button>
                        {app.key !== 'youtube' && (
                          <button
                            onClick={() => handleCloseApp(app.key)}
                            className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-mono text-center"
                            title="Close Process"
                          >
                            Kill
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: FILE EXPLORER */}
            {activeTab === 'files' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <input
                      type="text"
                      value={fileSearchQuery}
                      onChange={(e) => setFileSearchQuery(e.target.value)}
                      placeholder="Search files in Downloads..."
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchFiles();
                      }}
                    />
                    <button
                      onClick={handleSearchFiles}
                      className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" /> Search
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFindPdfs}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" /> Find PDFs
                    </button>
                    <button
                      onClick={() => handleLaunchApp('explorer')}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5"
                    >
                      <FolderOpen className="w-3.5 h-3.5" /> Open Downloads
                    </button>
                  </div>
                </div>

                {/* File Results List */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 divide-y divide-slate-800/80 max-h-64 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((f, i) => (
                      <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-800/40 text-xs">
                        <div className="flex items-center gap-2.5 truncate max-w-md">
                          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                          <div className="truncate">
                            <div className="font-medium text-white truncate">{f.name}</div>
                            <div className="text-[10px] text-slate-500 truncate">{f.path}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono text-slate-400 tabular-nums">{f.size_kb} KB</span>
                          <button
                            onClick={() => windowsCompanionService.fileControl({ action: 'open', path: f.path })}
                            className="px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px]"
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No files loaded. Tap "Find PDFs" or enter a search query above.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: SETUP & BUILD GUIDE */}
            {activeTab === 'setup' && (
              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>How to Run LIZA Companion on Dell Latitude 7420</span>
                  </div>

                  <p>
                    LIZA Companion connects this web dashboard to your Windows 11 hardware via a secure authenticated
                    localhost bridge (<code>127.0.0.1:8765</code>).
                  </p>

                  <div className="space-y-2 pt-2">
                    <div className="font-semibold text-white">Option 1: Quick Run with Python (Recommended)</div>
                    <pre className="p-2.5 rounded bg-black/70 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                      cd windows_companion{'\n'}
                      run_companion.bat
                    </pre>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="font-semibold text-white">Option 2: Build Standalone Executable (LIZACompanion.exe)</div>
                    <pre className="p-2.5 rounded bg-black/70 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                      cd windows_companion{'\n'}
                      build_companion.bat
                    </pre>
                    <p className="text-[11px] text-slate-400">
                      PyInstaller will compile everything into <code>windows_companion\dist\LIZACompanion\LIZACompanion.exe</code>.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Host: 127.0.0.1:8765</span>
                    <span>Token: liza-paramveer-dell-7420</span>
                    <span>Failsafe: PyAutoGUI corner escape enabled</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
