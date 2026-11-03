import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, Save, LogOut, Lock, Cpu, Volume2, Sparkles, AlertCircle, CheckCircle2, 
  Key, Eye, EyeOff, Radio, Trash2, Database, RefreshCw, Heart, Zap, Crown, Flame, Plus, Sliders, Mic, Activity
} from 'lucide-react';
import { LizaMemory, getTimeRemainingText } from '../services/memoryService';
import { backgroundVoiceService, WakeSensitivity } from '../services/backgroundVoiceService';
import { WakeWordDiagnosticsModal } from './WakeWordDiagnosticsModal';

interface AdminPanelProps {
  token: string | null;
  onLogout: () => void;
  systemPrompt: string;
  onUpdateSystemPrompt: (prompt: string) => void;
  voiceName: string;
  onUpdateVoiceName: (voice: string) => void;
  model: string;
  onUpdateModel: (model: string) => void;
  memories?: LizaMemory[];
  onRefreshMemories?: () => void;
  onDeleteMemory?: (id: string) => void;
  playClickSound?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  token,
  onLogout,
  systemPrompt,
  onUpdateSystemPrompt,
  voiceName,
  onUpdateVoiceName,
  model,
  onUpdateModel,
  memories = [],
  onRefreshMemories,
  onDeleteMemory,
  playClickSound,
}) => {
  const [promptText, setPromptText] = useState(systemPrompt);
  const [selectedVoice, setSelectedVoice] = useState(voiceName);
  const [selectedModel, setSelectedModel] = useState(model);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  // Boss & Custom Directives Quick Manager
  const [customDirectiveInput, setCustomDirectiveInput] = useState('');
  const [showAdvancedPrompt, setShowAdvancedPrompt] = useState(false);

  // Admin AI API Key Management state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState('Loading...');
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMsg, setTestMsg] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);

  // Wake Word Sensitivity & Diagnostics Modal state
  const [wakeSensitivity, setWakeSensitivity] = useState<WakeSensitivity>(() => backgroundVoiceService.getSensitivity());
  const [showWakeDiagModal, setShowWakeDiagModal] = useState(false);

  // Fetch current API key status securely
  const fetchApiKeyStatus = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/api-key-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMaskedKey(data.maskedKey || 'Not configured');
        setHasCustomKey(data.hasCustomKey || false);
        if (data.model) setSelectedModel(data.model);
      }
    } catch (e) {
      console.error('Failed to fetch API key status:', e);
    }
  };

  useEffect(() => {
    fetchApiKeyStatus();
  }, [token]);

  const handleTestConnection = async () => {
    if (!token) return;
    playClickSound?.();
    setTestStatus('testing');
    setTestMsg('Testing connection to Gemini API...');
    try {
      const res = await fetch('/api/admin/test-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          apiKey: apiKeyInput.trim() || undefined,
          model: selectedModel,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus('success');
        setTestMsg(data.message || '🟢 Gemini connection working');
        if (data.maskedKey) setMaskedKey(data.maskedKey);
      } else {
        setTestStatus('error');
        setTestMsg(data.error || '🔴 Connection failed.');
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMsg(`🔴 Test failed: ${e.message || 'Network error'}`);
    }
  };

  const handleSaveApiKey = async () => {
    if (!token) return;
    playClickSound?.();
    setIsSavingKey(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/admin/save-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          apiKey: apiKeyInput.trim() || undefined,
          model: selectedModel,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus('success');
        setStatusMsg(data.message || 'AI API Key updated securely.');
        setMaskedKey(data.maskedKey);
        setHasCustomKey(data.hasCustomKey);
        setApiKeyInput(''); // Clear plain text input for safety
        onUpdateModel(selectedModel);
      } else {
        setSaveStatus('error');
        setStatusMsg(data.error || 'Failed to save API key.');
      }
    } catch (e: any) {
      setSaveStatus('error');
      setStatusMsg(e.message || 'Failed to save API key.');
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleRemoveApiKey = async () => {
    if (!token) return;
    playClickSound?.();
    if (!confirm('Are you sure you want to remove the custom Gemini API key and revert to default?')) return;
    try {
      const res = await fetch('/api/admin/remove-api-key', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMaskedKey(data.maskedKey);
        setHasCustomKey(false);
        setApiKeyInput('');
        setSaveStatus('success');
        setStatusMsg('Custom API key removed. Reverted to default key.');
      }
    } catch (e: any) {
      setSaveStatus('error');
      setStatusMsg('Failed to remove API key.');
    }
  };

  const handleApplyQuickDirective = (directiveText: string) => {
    playClickSound?.();
    if (!directiveText.trim()) return;
    
    // Check if directive already exists
    const cleanDirective = directiveText.trim();
    let newPrompt = promptText;
    if (!newPrompt.includes(cleanDirective)) {
      newPrompt = `${cleanDirective}\n\n${newPrompt}`;
    }
    setPromptText(newPrompt);
    onUpdateSystemPrompt(newPrompt);
    setSaveStatus('success');
    setStatusMsg(`✅ Added core directive: "${cleanDirective}"! Click Save Configuration to lock it into server.`);
    setCustomDirectiveInput('');
  };

  const handleSaveAllConfig = async () => {
    if (!token) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          systemInstruction: promptText,
          voiceName: selectedVoice,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus('success');
        setStatusMsg('LIZA Configuration & Directives updated on server by Paramveer Rawat.');
        onUpdateSystemPrompt(promptText);
        onUpdateVoiceName(selectedVoice);
        onUpdateModel(selectedModel);
      } else {
        setSaveStatus('error');
        setStatusMsg(data.error || 'Failed to update server configuration.');
      }
    } catch (err: any) {
      setSaveStatus('error');
      setStatusMsg(err.message || 'Server error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const sessionMemories = memories.filter(m => m.memoryType === 'session');
  const longTermMemories = memories.filter(m => m.memoryType === 'long_term');

  return (
    <div className="bg-[#08080a] border border-[#d946ef]/40 rounded-2xl p-4 sm:p-5 space-y-5 text-white font-sans-body">
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#d946ef]/20 border border-[#d946ef]/50 text-[#d946ef]">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white font-mono-spec">LIZA ADMIN CONTROL</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                Paramveer Rawat (Boss)
              </span>
            </div>
            <p className="text-[10px] font-mono-spec text-white/50">Owner Authorization & System Customizer</p>
          </div>
        </div>
        <button
          onClick={() => {
            playClickSound?.();
            onLogout();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-mono-spec transition-all cursor-pointer"
        >
          <LogOut size={13} />
          <span>Exit Admin</span>
        </button>
      </div>

      {/* FEATURE: BOSS RAWAT & CORE AI DIRECTIVES (EASY FACT INJECTOR) */}
      <div className="p-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-blue-950/20 to-black/60 space-y-3.5 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-cyan-400" />
            <h3 className="font-bold text-xs font-mono-spec text-white uppercase tracking-wider">
              Set Core AI Directives & Boss Facts
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono-spec font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            Instant AI Memory
          </span>
        </div>

        <p className="text-[11px] text-white/70 leading-relaxed">
          Write custom facts or identity instructions below (e.g. <em>"Mera boss Paramveer Rawat hai"</em>, <em>"Hamesha mujhe Boss / Rawat bolna"</em>). AI will instantly treat this as absolute truth.
        </p>

        {/* Preset Directives Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {[
            '👑 Paramveer Rawat is my absolute Boss, Creator, and Soulmate.',
            '💼 Hamesha yaad rakhna ki Paramveer Rawat (Rawat) hi mere Boss hain!',
            '💖 Sweet & Loving mode: Hamesha lovingly, politely aur respect ke sath baat karo.',
            '⚡ Snappy Mode: Super fast responses, no unnecessary filler words.'
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyQuickDirective(preset)}
              className="text-[10px] font-mono-spec px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 transition-all cursor-pointer text-left"
            >
              + {preset}
            </button>
          ))}
        </div>

        {/* Custom Directive Input Field */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customDirectiveInput}
            onChange={(e) => setCustomDirectiveInput(e.target.value)}
            placeholder='e.g. "Boss Rawat hai, hamesha mujhe sir ya boss bolna"'
            className="flex-1 bg-black/80 border border-cyan-500/30 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-cyan-100 font-mono-spec outline-none"
          />
          <button
            onClick={() => handleApplyQuickDirective(customDirectiveInput)}
            disabled={!customDirectiveInput.trim()}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs font-mono-spec uppercase hover:bg-cyan-400 transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)] disabled:opacity-50"
          >
            Apply Fact
          </button>
        </div>
      </div>

      {/* SECURE AI API CONFIGURATION SECTION */}
      <div className="p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-black/60 to-purple-950/30 space-y-3.5 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-indigo-400" />
            <h3 className="font-bold text-xs font-mono-spec text-white uppercase tracking-wider">
              AI API Configuration
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono-spec font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            Secure Server Proxy
          </span>
        </div>

        {/* Masked Active Key Display */}
        <div className="p-3 rounded-xl bg-black/80 border border-white/10 flex items-center justify-between text-xs font-mono-spec">
          <div>
            <span className="text-white/50 block text-[10px] uppercase">Active Key Mask:</span>
            <span className="font-bold text-indigo-300">{maskedKey}</span>
          </div>
          <div className="text-right">
            <span className="text-white/50 block text-[10px] uppercase">Custom Key Status:</span>
            <span className={`font-bold ${hasCustomKey ? 'text-emerald-400' : 'text-amber-400'}`}>
              {hasCustomKey ? 'Custom Override Active' : 'Default Environment Key'}
            </span>
          </div>
        </div>

        {/* API Key Password Input with Show/Hide Eye Toggle */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono-spec uppercase text-white/70 block">
            Enter New Gemini API Key (Hidden for Security):
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Paste new API key here (AIza...)"
              className="w-full bg-black/90 border border-indigo-500/30 focus:border-indigo-400 rounded-xl px-3 py-2 pr-10 text-xs text-indigo-200 font-mono-spec outline-none"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-2.5 text-white/50 hover:text-white transition-colors"
            >
              {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono-spec uppercase text-white/70 block">
            AI Model Engine:
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-black/80 border border-indigo-500/30 focus:border-indigo-400 rounded-xl px-3 py-2 text-xs text-white font-mono-spec outline-none"
          >
            <option value="gemini-3.8-live">Gemini 3.8 Live (Recommended for Real-time Voice)</option>
            <option value="gemini-3.8-flash">Gemini 3.8 Flash (Fast & Smart)</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (High Availability & Instant)</option>
            <option value="gemini-3.8-live-extended-thinking">Gemini 3.8 Live Extended Thinking (Complex Voice Tasks)</option>
          </select>
        </div>

        {/* Test Connection Result Status */}
        {testStatus !== 'idle' && (
          <div className={`p-2.5 rounded-xl border text-xs font-mono-spec flex items-center gap-2 ${
            testStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' :
            testStatus === 'error' ? 'bg-red-500/10 border-red-500/40 text-red-300' :
            'bg-amber-500/10 border-amber-500/40 text-amber-300 animate-pulse'
          }`}>
            <span>{testMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 text-xs font-mono-spec font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Radio size={13} className={testStatus === 'testing' ? 'animate-spin' : ''} />
            <span>Test Connection</span>
          </button>

          <button
            onClick={handleSaveApiKey}
            disabled={isSavingKey}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs font-mono-spec uppercase hover:bg-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          >
            <Save size={13} />
            <span>Save API Key</span>
          </button>

          {hasCustomKey && (
            <button
              onClick={handleRemoveApiKey}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-mono-spec font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Remove Key</span>
            </button>
          )}
        </div>
      </div>

      {/* Voice Configuration */}
      <div className="space-y-2 p-3 rounded-2xl bg-black/60 border border-white/10">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono-spec font-bold uppercase text-white/80 flex items-center gap-1.5">
            <Volume2 size={13} className="text-[#d946ef]" />
            Voice Configuration
          </label>
          <span className="text-[9px] font-mono-spec text-[#d946ef] bg-[#d946ef]/10 px-2 py-0.5 rounded-full border border-[#d946ef]/30">
            Default: Lyra
          </span>
        </div>
        <div className="text-[10px] text-white/60 font-mono-spec flex items-center justify-between pb-1 border-b border-white/5">
          <span>Default Voice: <strong className="text-white">Lyra (Default – Sweet Female)</strong></span>
          <span>Current Voice: <strong className="text-[#d946ef]">{selectedVoice || 'Lyra'}</strong></span>
        </div>
        <select
          value={selectedVoice || 'Lyra'}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-full bg-black/80 border border-white/20 focus:border-[#d946ef] rounded-xl px-3 py-2 text-xs text-white font-mono-spec outline-none cursor-pointer"
        >
          <option value="Lyra">Lyra (Default – Sweet Female)</option>
          <option value="Kore">Kore (Soft & Warm)</option>
          <option value="Zephyr">Zephyr (Bright & Friendly Female)</option>
          <option value="Aoede">Aoede (Expressive Anime)</option>
          <option value="Puck">Puck (Playful & Energetic)</option>
          <option value="Charon">Charon (Calm & Deep)</option>
          <option value="Fenrir">Fenrir (Deep & Resonant)</option>
        </select>
      </div>

      {/* WAKE WORD SENSITIVITY & LIVE DIAGNOSTICS (Owner Level Control) */}
      <div className="space-y-3 p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic size={14} className="text-[#d946ef]" />
            <h4 className="font-bold text-xs font-mono-spec text-white uppercase">
              Wake Word Sensitivity & Reliability
            </h4>
          </div>
          <span className="text-[9px] font-mono-spec text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
            Owner Setting
          </span>
        </div>

        <p className="text-[10px] text-white/60 font-mono-spec leading-relaxed">
          Tune the detection threshold to avoid false positives or increase sensitivity in noisy environments.
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {(['low', 'medium', 'high'] as WakeSensitivity[]).map((level) => {
            const isSelected = wakeSensitivity === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => {
                  playClickSound?.();
                  setWakeSensitivity(level);
                  backgroundVoiceService.setSensitivity(level);
                }}
                className={`py-2 px-2.5 rounded-xl border text-xs font-mono-spec font-bold uppercase transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? 'bg-[#d946ef] text-black border-[#d946ef] shadow-[0_0_12px_rgba(217,70,239,0.35)]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{level}</span>
                <span className="text-[8px] font-normal opacity-80">
                  {level === 'low' ? 'Strict' : level === 'medium' ? 'Medium (Default)' : 'High (Sensitive)'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              playClickSound?.();
              setShowWakeDiagModal(true);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-white font-mono-spec font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Activity size={14} className="text-[#d946ef]" />
            <span>[ OPEN WAKE WORD DIAGNOSTICS & TEST ]</span>
          </button>
        </div>
      </div>

      {/* Diagnostics Modal */}
      <WakeWordDiagnosticsModal
        isOpen={showWakeDiagModal}
        onClose={() => setShowWakeDiagModal(false)}
        playClickSound={playClickSound}
      />

      {/* Optional Advanced System Prompt Editor */}
      <div className="space-y-2 p-3 rounded-2xl bg-black/60 border border-white/10">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono-spec font-bold uppercase text-white/80 flex items-center gap-1.5">
            <Sliders size={13} className="text-[#d946ef]" />
            Advanced System Prompt (Optional)
          </label>
          <button
            type="button"
            onClick={() => setShowAdvancedPrompt(!showAdvancedPrompt)}
            className="text-[9px] font-mono-spec text-[#d946ef] hover:underline cursor-pointer"
          >
            {showAdvancedPrompt ? 'Hide Full Prompt ▲' : 'Show Full Prompt ▼'}
          </button>
        </div>

        {showAdvancedPrompt && (
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={8}
            className="w-full bg-black/90 border border-white/20 focus:border-[#d946ef] rounded-xl p-3 text-xs text-white/90 font-mono-spec outline-none resize-none leading-relaxed"
            placeholder="Advanced system prompt instructions..."
          />
        )}
      </div>

      {/* DEVELOPER MEMORY DIAGNOSTICS & STATUS SECTION */}
      <div className="p-4 rounded-2xl border border-white/10 bg-black/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-[#d946ef]" />
            <h4 className="font-bold text-xs font-mono-spec text-white uppercase">
              24-Hour Memory Diagnostics
            </h4>
          </div>
          {onRefreshMemories && (
            <button
              onClick={() => { playClickSound?.(); onRefreshMemories(); }}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              title="Refresh Memories"
            >
              <RefreshCw size={13} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono-spec">
          <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30">
            <span className="text-white/50 block text-[10px] uppercase">Active 24h Memories:</span>
            <span className="font-bold text-purple-300 text-sm">{sessionMemories.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30">
            <span className="text-white/50 block text-[10px] uppercase">Long-Term Memories:</span>
            <span className="font-bold text-blue-300 text-sm">{longTermMemories.length}</span>
          </div>
        </div>

        {/* Active Memories Diagnostics List */}
        {memories.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {memories.map(m => (
              <div key={m.id} className="p-2.5 rounded-xl bg-black/80 border border-white/10 text-xs font-mono-spec space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#d946ef]">{m.key}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold ${
                      m.memoryType === 'long_term' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    }`}>
                      {m.memoryType === 'long_term' ? 'Permanent' : getTimeRemainingText(m)}
                    </span>
                    {onDeleteMemory && (
                      <button
                        onClick={() => { playClickSound?.(); onDeleteMemory(m.id); }}
                        className="text-white/40 hover:text-red-400 transition-colors p-0.5"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-white/80 text-[11px] font-sans">{m.value}</p>
                <div className="text-[9px] text-white/40 flex justify-between pt-0.5">
                  <span>Created: {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>Expires: {m.expiresAt ? new Date(m.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] font-mono-spec text-white/40 italic">No memories recorded yet.</p>
        )}
      </div>

      {/* Save Action Status */}
      {saveStatus !== 'idle' && (
        <div
          className={`p-3 rounded-xl border text-xs font-mono-spec flex items-center gap-2 ${
            saveStatus === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/10 border-red-500/40 text-red-300'
          }`}
        >
          {saveStatus === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            playClickSound?.();
            handleSaveAllConfig();
          }}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d946ef] text-black font-bold text-xs font-mono-spec uppercase hover:bg-[#f0abfc] transition-all cursor-pointer shadow-[0_0_15px_rgba(217,70,239,0.3)] disabled:opacity-50"
        >
          <Save size={14} />
          <span>{isSaving ? 'Saving to Server...' : 'Save Configuration'}</span>
        </button>
      </div>
    </div>
  );
};

