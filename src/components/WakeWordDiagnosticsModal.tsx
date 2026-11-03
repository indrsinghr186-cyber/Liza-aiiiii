import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Mic, Activity, CheckCircle2, AlertTriangle, XCircle, 
  Play, Square, Sparkles, RefreshCw, Sliders, Volume2, HelpCircle, X
} from 'lucide-react';
import { 
  backgroundVoiceService, 
  BackgroundVoiceStatus, 
  WakeSensitivity,
  WakeWordDiagnosticsResult
} from '../services/backgroundVoiceService';

interface WakeWordDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
  onSimulateWakeWord?: (trailingCommand?: string) => void;
}

export const WakeWordDiagnosticsModal: React.FC<WakeWordDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  playClickSound,
  onSimulateWakeWord,
}) => {
  const [status, setStatus] = useState<BackgroundVoiceStatus>(() => backgroundVoiceService.getStatus());
  const [sensitivity, setSensitivity] = useState<WakeSensitivity>(() => backgroundVoiceService.getSensitivity());
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState<WakeWordDiagnosticsResult>({
    microphonePermission: false,
    audioRecordReady: false,
    audioDetected: false,
    micRmsLevel: 0,
    wakeEngineSupported: false,
    wakeListenerActive: false,
    sensitivity: backgroundVoiceService.getSensitivity(),
    detectedTranscript: '',
    wakeConfidence: 0,
    wakeDetected: false,
    activationCallbackTriggered: false,
  });

  const [testLogs, setTestLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'success' | 'warn' }>>([]);

  const addLog = (text: string, type: 'info' | 'success' | 'warn' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setTestLogs((prev) => [{ time, text, type }, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    const unsubscribeStatus = backgroundVoiceService.subscribeStatus((newStatus) => {
      setStatus(newStatus);
      setSensitivity(newStatus.sensitivity);
    });

    const unsubscribeDiag = backgroundVoiceService.subscribeDiagnostics((partialDiag) => {
      setDiagnosticsData((prev) => ({
        ...prev,
        ...partialDiag,
      }));

      if (partialDiag.detectedTranscript) {
        addLog(`Speech input: "${partialDiag.detectedTranscript}" (Confidence: ${Math.round((partialDiag.wakeConfidence || 0) * 100)}%)`, partialDiag.wakeDetected ? 'success' : 'info');
      }
      if (partialDiag.wakeDetected) {
        addLog('🎯 Wake phrase MATCHED! Activation callback dispatched.', 'success');
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeDiag();
    };
  }, []);

  // Initial full hardware diagnosis run when modal opens
  useEffect(() => {
    if (isOpen) {
      runFullHardwareCheck();
    }
  }, [isOpen]);

  const runFullHardwareCheck = async () => {
    addLog('Running hardware & audio stream verification...');
    const res = await backgroundVoiceService.runDiagnostics();
    setDiagnosticsData((prev) => ({ ...prev, ...res }));
    if (res.microphonePermission) {
      addLog('Microphone permission: GRANTED ✓', 'success');
    } else {
      addLog('Microphone permission: DENIED or NOT FOUND ❌', 'warn');
    }
    if (res.wakeEngineSupported) {
      addLog('Wake Engine (SpeechRecognition / Android Bridge): READY ✓', 'success');
    }
  };

  const handleStartTest = async () => {
    playClickSound?.();
    setIsRunningTest(true);
    addLog('Starting Live Wake Word Diagnostics Test...');
    await backgroundVoiceService.initService();
    addLog('Listening for test phrases: "Hey Liza", "Suno Liza", "Hey Liza, open YouTube"...');
  };

  const handleStopTest = () => {
    playClickSound?.();
    setIsRunningTest(false);
    addLog('Test mode paused.');
  };

  const handleSensitivityChange = (newSens: WakeSensitivity) => {
    playClickSound?.();
    setSensitivity(newSens);
    backgroundVoiceService.setSensitivity(newSens);
    addLog(`Wake Word Sensitivity updated to: ${newSens.toUpperCase()}`, 'info');
  };

  const handleManualTestPhrase = (phrase: string) => {
    playClickSound?.();
    addLog(`Simulating phrase input: "${phrase}"...`);
    const match = backgroundVoiceService.detectWakeWord(phrase);
    if (match.matched) {
      addLog(`✓ Matched phrase "${phrase}" (Confidence: ${Math.round(match.confidence * 100)}%)`, 'success');
      setDiagnosticsData((prev) => ({
        ...prev,
        detectedTranscript: phrase,
        wakeConfidence: match.confidence,
        wakeDetected: true,
        activationCallbackTriggered: true,
      }));
      onSimulateWakeWord?.(match.remainingCommand);
    } else {
      addLog(`❌ Phrase "${phrase}" did not match current sensitivity threshold`, 'warn');
    }
  };

  const handleRecover = () => {
    playClickSound?.();
    addLog('Force restarting Wake Word pipeline...');
    backgroundVoiceService.recoverAudioPipeline();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-2xl bg-[#0d0914] border border-[#d946ef]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-950/40 to-black">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#d946ef]/20 border border-[#d946ef]/40 text-[#d946ef]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm font-mono-spec text-white uppercase flex items-center gap-2">
                Wake Word Diagnostics & Test Mode
              </h3>
              <p className="text-[11px] text-white/50 font-mono-spec">
                Real-time audio verification & "Hey Liza" engine validator
              </p>
            </div>
          </div>
          <button
            onClick={() => { playClickSound?.(); onClose(); }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 font-mono-spec">
          {/* 1. STATUS GRID (Requirement 15) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Microphone */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] text-white/40 uppercase">Microphone</span>
              <div className="flex items-center gap-1.5 mt-2">
                {diagnosticsData.microphonePermission ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">GRANTED ✓</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-red-400" />
                    <span className="text-xs font-bold text-red-400">DENIED ✗</span>
                  </>
                )}
              </div>
            </div>

            {/* AudioRecord / Stream */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] text-white/40 uppercase">AudioRecord / Stream</span>
              <div className="flex items-center gap-1.5 mt-2">
                {diagnosticsData.audioRecordReady ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">READY ✓</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} className="text-amber-400" />
                    <span className="text-xs font-bold text-amber-400">WAITING</span>
                  </>
                )}
              </div>
            </div>

            {/* Wake Engine */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] text-white/40 uppercase">Wake Engine</span>
              <div className="flex items-center gap-1.5 mt-2">
                {diagnosticsData.wakeEngineSupported ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">SUPPORTED ✓</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-red-400" />
                    <span className="text-xs font-bold text-red-400">UNSUPPORTED ✗</span>
                  </>
                )}
              </div>
            </div>

            {/* Wake Listener State */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] text-white/40 uppercase">Wake Listener</span>
              <div className="flex items-center gap-1.5 mt-2">
                {status.state === 'LISTENING_FOR_WAKE' ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-emerald-400">LISTENING ✓</span>
                  </>
                ) : status.state === 'LIZA_LISTENING' ? (
                  <>
                    <Activity size={16} className="text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-400">IN SESSION</span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                    <span className="text-xs font-bold text-gray-400">{status.state}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 2. SENSITIVITY CONTROLLER (Requirement 8) */}
          <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
                <Sliders size={14} className="text-[#d946ef]" />
                Wake Word Sensitivity
              </div>
              <span className="text-[10px] text-purple-300">Default: Medium</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {(['low', 'medium', 'high'] as WakeSensitivity[]).map((level) => {
                const isSelected = sensitivity === level;
                return (
                  <button
                    key={level}
                    onClick={() => handleSensitivityChange(level)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-[#d946ef] text-black border-[#d946ef] shadow-[0_0_12px_rgba(217,70,239,0.4)]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{level}</span>
                    <span className="text-[9px] font-normal opacity-80">
                      {level === 'low' ? 'Strict Match' : level === 'medium' ? 'Balanced (Recommended)' : 'Fuzzy & Sensitive'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. INTERACTIVE TEST PANEL */}
          <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <Activity size={14} className="text-emerald-400" />
                  Live Audio & Speech Validation
                </h4>
                <p className="text-[10px] text-white/50">Speak "Hey Liza" to verify instant detection and telemetry</p>
              </div>

              <div className="flex items-center gap-2">
                {!isRunningTest ? (
                  <button
                    onClick={handleStartTest}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
                  >
                    <Play size={13} /> [ START TEST ]
                  </button>
                ) : (
                  <button
                    onClick={handleStopTest}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold uppercase flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
                  >
                    <Square size={13} /> [ STOP TEST ]
                  </button>
                )}

                <button
                  onClick={handleRecover}
                  title="Force restart engine"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* Audio RMS VU Meter */}
            <div className="p-3 bg-black/60 border border-white/5 rounded-xl space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-white/60">Audio detected:</span>
                <span className={status.audioDetected ? 'text-emerald-400 font-bold' : 'text-gray-400'}>
                  {status.audioDetected ? 'YES (Microphone Active)' : 'NO (Silence)'}
                </span>
              </div>
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-[#d946ef] transition-all duration-75"
                  style={{ width: `${Math.min(100, (status.micRmsLevel || 0) * 400)}%` }}
                />
              </div>
            </div>

            {/* Test Results Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-white/40 text-[10px] uppercase">Wake confidence:</div>
                <div className="text-white font-bold text-xs">
                  {diagnosticsData.wakeConfidence > 0 ? `${Math.round(diagnosticsData.wakeConfidence * 100)}%` : '0% (Awaiting)'}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-white/40 text-[10px] uppercase">Wake detected:</div>
                <div className={`font-bold text-xs ${diagnosticsData.wakeDetected ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {diagnosticsData.wakeDetected ? 'YES ✓' : 'NO'}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-white/40 text-[10px] uppercase">Activation callback:</div>
                <div className={`font-bold text-xs ${diagnosticsData.activationCallbackTriggered ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {diagnosticsData.activationCallbackTriggered ? 'YES ✓' : 'NO'}
                </div>
              </div>
            </div>

            {/* Last Recognized Transcript Preview */}
            <div className="p-3 bg-black/60 border border-white/10 rounded-xl space-y-1">
              <span className="text-[10px] text-white/40 uppercase">Live Recognized Transcript:</span>
              <div className="text-xs text-purple-200 font-mono italic min-h-[20px]">
                {diagnosticsData.detectedTranscript ? `"${diagnosticsData.detectedTranscript}"` : 'Listening for speech input...'}
              </div>
            </div>
          </div>

          {/* 4. TEST PHRASES CHECKLIST (Requirement 16) */}
          <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#d946ef]" />
                Standard Test Phrases (Tap to simulate / test)
              </span>
              <span className="text-[10px] text-white/40">Primary: HEY LIZA</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                'Hey Liza',
                'Hey Liza, open YouTube.',
                'Hey Liza, how are you?',
                'Hey Liza, WhatsApp kholo.',
                'Liza',
                'Hey Liza!',
              ].map((phrase) => (
                <button
                  key={phrase}
                  onClick={() => handleManualTestPhrase(phrase)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-[#d946ef]/20 border border-white/10 hover:border-[#d946ef]/40 text-left text-[11px] text-white/80 hover:text-white transition-all cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate">{phrase}</span>
                  <Play size={10} className="text-[#d946ef] shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* 5. LIVE DIAGNOSTIC LOGS */}
          <div className="p-3 bg-black/60 border border-white/10 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-white/40 uppercase">
              <span>Diagnostic Event Stream</span>
              <span>{testLogs.length} events</span>
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1 text-[10px] pr-1">
              {testLogs.map((log, i) => (
                <div
                  key={i}
                  className={`p-1 rounded flex items-start gap-2 ${
                    log.type === 'success' ? 'text-emerald-300 bg-emerald-950/20' : log.type === 'warn' ? 'text-amber-300 bg-amber-950/20' : 'text-white/60'
                  }`}
                >
                  <span className="text-white/30 shrink-0">{log.time}</span>
                  <span className="break-all">{log.text}</span>
                </div>
              ))}
              {testLogs.length === 0 && (
                <div className="text-white/30 italic py-2 text-center">Ready. Tap [ START TEST ] or speak "Hey Liza".</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <span className="text-[10px] text-white/40">LIZA WAKE WORD PIPELINE DIAGNOSTICS v3.5</span>
          <button
            onClick={() => { playClickSound?.(); onClose(); }}
            className="px-4 py-2 rounded-xl bg-[#d946ef] hover:bg-[#f0abfc] text-black font-bold font-mono-spec text-xs uppercase transition-all cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>
      </motion.div>
    </div>
  );
};
