/**
 * LIZA Wake Word Engine & Background Voice Activation Service
 * 
 * Provides a unified, single-instance, self-recovering wake word pipeline ("Hey Liza").
 * Fully supports Web Speech API, Web Audio PCM RMS frame detection, and native Android Foreground Service.
 * 
 * States:
 * WAKE_DISABLED -> WAKE_INITIALIZING -> MIC_REQUESTING -> MIC_READY -> LISTENING_FOR_WAKE -> WAKE_DETECTED -> ACTIVATING_LIZA -> LIZA_LISTENING
 *                                                                |
 *                                                           WAKE_ERROR
 */

export type WakeWordState =
  | 'WAKE_DISABLED'       // Wake word disabled by user settings
  | 'WAKE_INITIALIZING'   // Setting up engine & audio context
  | 'MIC_REQUESTING'      // Asking for microphone permission
  | 'MIC_READY'           // Microphone permission granted & audio pipeline initialized
  | 'LISTENING_FOR_WAKE'  // Actively listening for "Hey Liza"
  | 'WAKE_DETECTED'       // Wake phrase detected!
  | 'ACTIVATING_LIZA'     // Initializing AI Live voice session
  | 'LIZA_LISTENING'      // LIZA active voice session running
  | 'RETURNING_TO_WAKE'   // Transitioning back to wake listener after speech completes
  | 'WAKE_ERROR';         // Permission denied or audio stream error

export type WakeSensitivity = 'low' | 'medium' | 'high';

export interface BackgroundVoiceStatus {
  isEnabled: boolean;          // Background Voice setting
  inAppEnabled: boolean;       // In-App Wake Word setting
  isActive: boolean;           // Currently listening for wake word
  isPaused: boolean;           // Temporarily paused during active AI session
  state: WakeWordState;        // Real state machine state
  permissionState: 'granted' | 'denied' | 'prompt' | 'unsupported';
  statusLabel: string;
  errorMessage: string | null;
  lastWakeWordTime: number | null;
  wakeWordPhrase: string;
  sensitivity: WakeSensitivity;
  debugStateLabel: string;     // Explicit debug state tag
  audioDetected: boolean;      // True if real audio signal detected via AudioContext
  micRmsLevel: number;         // 0.0 - 1.0 mic input volume
  consecutiveFailures: number; // Recovery attempt count
}

export interface WakeWordDiagnosticsResult {
  microphonePermission: boolean;
  audioRecordReady: boolean;
  audioDetected: boolean;
  micRmsLevel: number;
  wakeEngineSupported: boolean;
  wakeListenerActive: boolean;
  sensitivity: WakeSensitivity;
  detectedTranscript: string;
  wakeConfidence: number;
  wakeDetected: boolean;
  activationCallbackTriggered: boolean;
  error?: string | null;
}

export type WakeWordCallback = (trailingCommand?: string) => void;
export type StatusListener = (status: BackgroundVoiceStatus) => void;
export type DiagnosticListener = (diag: Partial<WakeWordDiagnosticsResult>) => void;

class BackgroundVoiceServiceManager {
  private isEnabled: boolean = false;
  private inAppEnabled: boolean = false;
  private state: WakeWordState = 'WAKE_DISABLED';
  private permissionState: 'granted' | 'denied' | 'prompt' | 'unsupported' = 'prompt';
  private errorMessage: string | null = null;
  private lastWakeWordTime: number | null = null;
  private wakeWordPhrase: string = 'Hey Liza';
  private personaMode: 'normal' | 'hiyori' = 'normal';
  private sensitivity: WakeSensitivity = 'medium';

  // Audio Pipeline & Web Speech
  private webRecognizer: any = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private audioMeterAnimFrame: number | null = null;
  private micRmsLevel: number = 0;
  private isAudioDetected: boolean = false;

  private webNotification: Notification | null = null;
  private restartTimeout: any = null;
  private consecutiveFailures: number = 0;
  private readonly maxRecoveryAttempts: number = 3;
  private isInitializing: boolean = false;
  private isLizaSpeaking: boolean = false;
  private lastSpeechEndTime: number = 0;

  private wakeWordCallbacks: Set<WakeWordCallback> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private diagnosticListeners: Set<DiagnosticListener> = new Set();

  constructor() {
    this.isEnabled = false;
    this.inAppEnabled = false;
    this.state = 'WAKE_DISABLED';

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('liza_bg_voice_enabled', 'false');
        localStorage.setItem('liza_wake_word_enabled', 'false');
      }
    } catch (_) {}
  }

  /**
   * Get current comprehensive status for UI components
   */
  public getStatus(): BackgroundVoiceStatus {
    let statusLabel = 'Wake word disabled';
    let debugStateLabel = 'WAKE_DISABLED';

    switch (this.state) {
      case 'WAKE_DISABLED':
        statusLabel = 'Wake word disabled';
        debugStateLabel = 'WAKE_DISABLED';
        break;
      case 'WAKE_INITIALIZING':
        statusLabel = 'Initializing wake pipeline...';
        debugStateLabel = 'WAKE_INITIALIZING';
        break;
      case 'MIC_REQUESTING':
        statusLabel = 'Requesting microphone permission...';
        debugStateLabel = 'MIC_REQUESTING';
        break;
      case 'MIC_READY':
        statusLabel = 'Microphone ready';
        debugStateLabel = 'MIC_READY';
        break;
      case 'LISTENING_FOR_WAKE':
        statusLabel = `🎙 Listening for "${this.wakeWordPhrase}"`;
        debugStateLabel = 'LISTENING_FOR_WAKE';
        break;
      case 'WAKE_DETECTED':
        statusLabel = '✨ "Hey Liza" Detected!';
        debugStateLabel = 'WAKE_DETECTED';
        break;
      case 'ACTIVATING_LIZA':
        statusLabel = 'Activating LIZA Voice Session...';
        debugStateLabel = 'ACTIVATING_LIZA';
        break;
      case 'LIZA_LISTENING':
        statusLabel = '🎙 LIZA Voice Session Active';
        debugStateLabel = 'LIZA_LISTENING';
        break;
      case 'RETURNING_TO_WAKE':
        statusLabel = '🔄 Returning to Wake Word Mode...';
        debugStateLabel = 'RETURNING_TO_WAKE';
        break;
      case 'WAKE_ERROR':
        statusLabel = this.errorMessage || '⚠️ Wake word listener stopped. Tap to restart.';
        debugStateLabel = 'WAKE_ERROR';
        break;
    }

    return {
      isEnabled: this.isEnabled,
      inAppEnabled: this.inAppEnabled,
      isActive: this.state === 'LISTENING_FOR_WAKE',
      isPaused: this.state === 'LIZA_LISTENING' || this.state === 'RETURNING_TO_WAKE',
      state: this.state,
      permissionState: this.permissionState,
      statusLabel,
      errorMessage: this.errorMessage,
      lastWakeWordTime: this.lastWakeWordTime,
      wakeWordPhrase: this.wakeWordPhrase,
      sensitivity: this.sensitivity,
      debugStateLabel,
      audioDetected: this.isAudioDetected,
      micRmsLevel: this.micRmsLevel,
      consecutiveFailures: this.consecutiveFailures,
    };
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.getStatus());
    return () => this.statusListeners.delete(listener);
  }

  public subscribeDiagnostics(listener: DiagnosticListener): () => void {
    this.diagnosticListeners.add(listener);
    return () => this.diagnosticListeners.delete(listener);
  }

  public onWakeWord(callback: WakeWordCallback): () => void {
    this.wakeWordCallbacks.add(callback);
    return () => this.wakeWordCallbacks.delete(callback);
  }

  private notifyStatusChange() {
    const status = this.getStatus();
    this.statusListeners.forEach((listener) => {
      try { listener(status); } catch (e) {}
    });
  }

  private notifyDiagnostics(diag: Partial<WakeWordDiagnosticsResult>) {
    this.diagnosticListeners.forEach((listener) => {
      try { listener(diag); } catch (e) {}
    });
  }

  /**
   * Sensitivity management (Low, Medium, High)
   */
  public getSensitivity(): WakeSensitivity {
    return this.sensitivity;
  }

  public setSensitivity(level: WakeSensitivity) {
    this.sensitivity = level;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('liza_wake_sensitivity', level);
    }
    console.log(`[WakeWordEngine] Sensitivity set to: ${level}`);
    this.notifyStatusChange();
  }

  /**
   * Set custom wake word phrase
   */
  public setWakeWord(phrase: string) {
    this.wakeWordPhrase = phrase.trim() || (this.personaMode === 'hiyori' ? 'Hey Hiyori' : 'Hey Liza');
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('liza_wake_word', this.wakeWordPhrase);
    }
    console.log(`[WakeWordEngine] Wake word set to: "${this.wakeWordPhrase}"`);
    this.notifyStatusChange();
  }

  /**
   * Switch active persona mode ('normal' | 'hiyori') for wake word recognition
   */
  public setPersonaMode(mode: 'normal' | 'hiyori') {
    this.personaMode = mode;
    if (mode === 'hiyori') {
      this.wakeWordPhrase = 'Hey Hiyori';
    } else {
      try {
        this.wakeWordPhrase = (typeof localStorage !== 'undefined' && localStorage.getItem('liza_wake_word')) || 'Hey Liza';
      } catch {
        this.wakeWordPhrase = 'Hey Liza';
      }
    }
    console.log(`[WakeWordEngine] Active persona mode set to: ${mode} (Wake: "${this.wakeWordPhrase}")`);
    this.notifyStatusChange();
  }

  public getPersonaMode(): 'normal' | 'hiyori' {
    return this.personaMode;
  }

  /**
   * Echo / Self-Trigger Protection: Notifies engine when LIZA speaks or stops speaking
   */
  public setLizaSpeaking(speaking: boolean) {
    this.isLizaSpeaking = speaking;
    if (!speaking) {
      this.lastSpeechEndTime = Date.now();
    }
  }

  /**
   * Toggles in-app wake word mode
   */
  public setInAppWakeWordEnabled(enabled: boolean) {
    this.inAppEnabled = enabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('liza_wake_word_enabled', String(enabled));
    }
    console.log(`[WakeWordEngine] In-app wake word enabled: ${enabled}`);
    if (!enabled && !this.isEnabled) {
      this.stopService();
    } else if (enabled && this.state !== 'LIZA_LISTENING' && this.state !== 'ACTIVATING_LIZA') {
      this.consecutiveFailures = 0;
      this.initService();
    }
    this.notifyStatusChange();
  }

  /**
   * Enables or disables Background Voice Mode
   */
  public async setEnabled(enabled: boolean): Promise<boolean> {
    if (!enabled) {
      this.isEnabled = false;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('liza_bg_voice_enabled', 'false');
      }
      if (!this.inAppEnabled) {
        this.stopService();
      }
      this.notifyStatusChange();
      return true;
    }

    this.state = 'MIC_REQUESTING';
    this.notifyStatusChange();

    const hasMicPermission = await this.requestMicrophonePermission();
    if (!hasMicPermission) {
      this.isEnabled = false;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('liza_bg_voice_enabled', 'false');
      }
      this.state = 'WAKE_ERROR';
      this.errorMessage = 'Microphone permission required for Hey Liza.';
      this.notifyStatusChange();
      return false;
    }

    this.isEnabled = true;
    this.consecutiveFailures = 0;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('liza_bg_voice_enabled', 'true');
    }
    return await this.initService();
  }

  public setWakeState(newState: WakeWordState) {
    this.state = newState;
    this.notifyStatusChange();
  }

  public notifyLizaSessionActive() {
    this.state = 'LIZA_LISTENING';
    this.notifyStatusChange();
  }

  public notifyLizaSessionEnded() {
    this.finishSessionAndRearm();
  }

  /**
   * Requests runtime microphone permission cleanly
   */
  public async requestMicrophonePermission(): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        stream.getTracks().forEach((t) => t.stop());
        this.permissionState = 'granted';
        this.errorMessage = null;
        return true;
      }
    } catch (err: any) {
      console.warn('[WakeWordEngine] Microphone permission denied:', err);
      this.permissionState = 'denied';
      this.state = 'WAKE_ERROR';
      this.errorMessage = 'Microphone permission required for Hey Liza. Open settings to grant.';
      this.notifyStatusChange();
      return false;
    }
    this.permissionState = 'unsupported';
    this.state = 'WAKE_ERROR';
    this.errorMessage = 'Speech/Microphone is not supported in this browser environment.';
    this.notifyStatusChange();
    return false;
  }

  /**
   * Initializes exactly ONE wake word audio pipeline
   */
  public async initService(): Promise<boolean> {
    if (!this.isEnabled && !this.inAppEnabled) {
      this.state = 'WAKE_DISABLED';
      this.notifyStatusChange();
      return false;
    }

    if (this.state === 'LIZA_LISTENING' || this.state === 'ACTIVATING_LIZA') {
      console.log('[WakeWordEngine] Init bypassed: AI session active.');
      return false;
    }

    if (this.isInitializing) {
      return false;
    }

    this.isInitializing = true;
    this.state = 'WAKE_INITIALIZING';
    this.errorMessage = null;
    this.notifyStatusChange();

    // 1. Release any existing listeners/audio resources
    this.cleanupWebRecognizer();
    this.cleanupAudioMeter();

    // 2. Check Native Android Bridge
    if (typeof window !== 'undefined' && window.LizaAndroidBridge) {
      try {
        if (window.LizaAndroidBridge.startBackgroundVoiceService) {
          const success = window.LizaAndroidBridge.startBackgroundVoiceService();
          if (success) {
            this.state = 'LISTENING_FOR_WAKE';
            this.isInitializing = false;
            this.permissionState = 'granted';
            this.consecutiveFailures = 0;
            window.onLizaWakeWordDetected = (cmd?: string) => this.triggerWakeWord(cmd);
            this.notifyStatusChange();
            console.log('[WakeWordEngine] Connected to Native Android Foreground Service.');
            return true;
          }
        }
      } catch (err) {
        console.warn('[WakeWordEngine] Native Android service start failed:', err);
      }
    }

    // 3. Web Speech Recognition Engine
    let recognizer: any = null;
    try {
      if ((window as any).webkitSpeechRecognition) {
        recognizer = new (window as any).webkitSpeechRecognition();
      }
    } catch (e) {
      console.warn('[WakeWordEngine] webkitSpeechRecognition constructor failed:', e);
    }

    if (!recognizer && (window as any).SpeechRecognition) {
      try {
        recognizer = new (window as any).SpeechRecognition();
      } catch (e) {
        console.warn('[WakeWordEngine] SpeechRecognition constructor failed:', e);
      }
    }

    if (!recognizer) {
      this.errorMessage = 'Speech Recognition is not supported in this browser.';
      this.permissionState = 'unsupported';
      this.state = 'WAKE_ERROR';
      this.isInitializing = false;
      this.notifyStatusChange();
      return false;
    }

    try {
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.maxAlternatives = 3;
      recognizer.lang = 'en-IN'; // Robust for Hindi, Hinglish & English accents

      recognizer.onstart = () => {
        this.state = 'LISTENING_FOR_WAKE';
        this.isInitializing = false;
        this.consecutiveFailures = 0;
        this.permissionState = 'granted';
        this.errorMessage = null;
        console.log(`[WakeWordEngine] 🟢 State: LISTENING_FOR_WAKE (Sensitivity: ${this.sensitivity})`);
        
        if (this.isEnabled) {
          this.showWebForegroundNotification();
        }
        this.notifyStatusChange();
      };

      recognizer.onresult = (event: any) => {
        // Echo / Self-trigger prevention: Ignore during LIZA speech or active session
        if (this.state === 'LIZA_LISTENING' || this.state === 'ACTIVATING_LIZA' || this.isLizaSpeaking) {
          return;
        }

        // Echo protection cooldown: 500ms after LIZA speech ends
        if (Date.now() - this.lastSpeechEndTime < 500) {
          return;
        }

        let fullCumulativeTranscript = '';
        const currentInterimTokens: string[] = [];

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          const bestTranscript = result[0]?.transcript || '';
          if (bestTranscript) {
            fullCumulativeTranscript += ' ' + bestTranscript;
          }
          for (let j = 0; j < result.length; ++j) {
            const tr = result[j].transcript;
            if (tr) currentInterimTokens.push(tr);
          }
        }

        fullCumulativeTranscript = fullCumulativeTranscript.trim();

        // Check full cumulative string first
        if (fullCumulativeTranscript) {
          const match = this.detectWakeWord(fullCumulativeTranscript);
          if (match.matched) {
            this.notifyDiagnostics({
              detectedTranscript: fullCumulativeTranscript,
              wakeConfidence: match.confidence,
              wakeDetected: true,
            });
            console.log(`[WakeWordEngine] 🎯 Wake phrase detected: "${fullCumulativeTranscript}" (conf: ${match.confidence})`);
            this.triggerWakeWord(match.remainingCommand);
            return;
          }
        }

        // Check individual tokens & alternatives
        for (const token of currentInterimTokens) {
          const match = this.detectWakeWord(token);
          if (match.matched) {
            this.notifyDiagnostics({
              detectedTranscript: token,
              wakeConfidence: match.confidence,
              wakeDetected: true,
            });
            console.log(`[WakeWordEngine] 🎯 Wake token detected: "${token}" (conf: ${match.confidence})`);
            this.triggerWakeWord(match.remainingCommand);
            return;
          }
        }

        if (fullCumulativeTranscript) {
          this.notifyDiagnostics({
            detectedTranscript: fullCumulativeTranscript,
            wakeConfidence: 0.2,
            wakeDetected: false,
          });
        }
      };

      recognizer.onerror = (event: any) => {
        const error = event?.error;
        console.warn('[WakeWordEngine] Recognition error:', error);

        if (error === 'not-allowed' || error === 'service-not-allowed') {
          this.permissionState = 'denied';
          this.state = 'WAKE_ERROR';
          this.errorMessage = 'Microphone permission required for Hey Liza.';
          this.isInitializing = false;
          this.notifyStatusChange();
          return;
        }

        if (error === 'no-speech' || error === 'aborted') {
          return;
        }

        this.consecutiveFailures++;
        if (this.consecutiveFailures >= this.maxRecoveryAttempts) {
          this.state = 'WAKE_ERROR';
          this.errorMessage = 'Wake word listener stopped. Tap to restart.';
          this.isInitializing = false;
          this.notifyStatusChange();
          return;
        }

        this.scheduleRestart(600);
      };

      recognizer.onend = () => {
        this.isInitializing = false;

        if (this.state === 'LIZA_LISTENING' || this.state === 'ACTIVATING_LIZA') {
          return;
        }

        if ((this.isEnabled || this.inAppEnabled) && this.permissionState !== 'denied') {
          this.scheduleRestart(400);
        } else {
          this.state = 'WAKE_DISABLED';
          this.notifyStatusChange();
        }
      };

      this.webRecognizer = recognizer;
      recognizer.start();

      // Start continuous AudioContext RMS meter for diagnostics & signal check
      this.initAudioMeter();

      return true;

    } catch (e: any) {
      console.error('[WakeWordEngine] Exception starting SpeechRecognition:', e);
      this.isInitializing = false;
      this.consecutiveFailures++;
      if (this.consecutiveFailures >= this.maxRecoveryAttempts) {
        this.state = 'WAKE_ERROR';
        this.errorMessage = 'Wake word listener stopped. Tap to restart.';
      } else {
        this.scheduleRestart(1000);
      }
      this.notifyStatusChange();
      return false;
    }
  }

  /**
   * Continuous audio volume/signal meter
   */
  private async initAudioMeter() {
    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
      if (this.audioContext) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      let ctx: AudioContext | null = null;
      try {
        ctx = new AudioCtx();
      } catch (e) {
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      this.audioContext = ctx;
      this.mediaStream = stream;
      this.analyser = analyser;

      const buffer = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!this.analyser) return;
        this.analyser.getByteTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          const val = (buffer[i] - 128) / 128;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / buffer.length);
        this.micRmsLevel = rms;
        this.isAudioDetected = rms > 0.015;

        this.notifyDiagnostics({
          audioDetected: this.isAudioDetected,
          micRmsLevel: rms,
        });

        this.audioMeterAnimFrame = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      // Audio meter is optional telemetry, ignore if audio device already busy
    }
  }

  private cleanupAudioMeter() {
    if (this.audioMeterAnimFrame) {
      cancelAnimationFrame(this.audioMeterAnimFrame);
      this.audioMeterAnimFrame = null;
    }
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
    this.analyser = null;
    this.isAudioDetected = false;
    this.micRmsLevel = 0;
  }

  /**
   * Multi-lingual, multi-accent Wake Word Detection Engine
   */
  public detectWakeWord(transcript: string): { matched: boolean; confidence: number; remainingCommand?: string } {
    if (!transcript) return { matched: false, confidence: 0 };
    const raw = transcript.toLowerCase().trim();
    
    // Normalize punctuation, hyphens, and whitespace
    const clean = raw
      .replace(/[\,\.\!\?\:\;\-\_\/\\]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const customTarget = (this.wakeWordPhrase || (this.personaMode === 'hiyori' ? 'Hey Hiyori' : 'Hey Liza')).toLowerCase().trim();

    // 1. Direct custom wake phrase match
    if (customTarget && clean.includes(customTarget)) {
      const idx = clean.indexOf(customTarget);
      const remaining = clean.substring(idx + customTarget.length).trim();
      return { matched: true, confidence: 0.98, remainingCommand: remaining };
    }

    // 2. Persona-specific wake phrases
    if (this.personaMode === 'hiyori') {
      const hiyoriWakePhrases = [
        'hey hiyori', 'heyhiyori', 'hey hyori', 'heyhyori', 'hey hiori',
        'hi hiyori', 'hihiyori', 'hi hyori', 'hihyori', 'hi hiori',
        'hello hiyori', 'hellohiyori', 'hello hyori',
        'ok hiyori', 'okay hiyori', 'ok hyori', 'okay hyori',
        'aey hiyori', 'ay hiyori', 'ae hiyori', 'aye hiyori', 'oye hiyori',
        'suno hiyori', 'suno hyori', 'bolo hiyori', 'bolo hyori', 'kaho hiyori',
        'namaste hiyori', 'namaste hyori',
        'hiyori', 'hyori', 'hiori',
        'hey rawat', 'hi rawat', 'hello rawat', 'suno rawat',
        // Devanagari script phrases
        'हियोरी', 'हे हियोरी', 'नमस्ते हियोरी', 'सुनो हियोरी', 'बोलो हियोरी', 'ह्योरी'
      ];

      for (const phrase of hiyoriWakePhrases) {
        if (clean.includes(phrase)) {
          const idx = clean.indexOf(phrase);
          const remaining = clean.substring(idx + phrase.length).trim();
          return { matched: true, confidence: 0.96, remainingCommand: remaining };
        }
      }

      const hiyoriPrefixRegex = /\b(hey|he|hay|hi|hie|aey|ay|ae|aye|oye|oi|ok|okay|hello|suno|namaste|namashkar|arre|are|bolo|kaho|batao|kya)\s*(hiyori|hyori|hiyory|hiori)\b/i;
      const hMatch = clean.match(hiyoriPrefixRegex);
      if (hMatch && hMatch.index !== undefined) {
        const idx = hMatch.index;
        const remaining = clean.substring(idx + hMatch[0].length).trim();
        return { matched: true, confidence: 0.92, remainingCommand: remaining };
      }

      if (this.sensitivity === 'medium' || this.sensitivity === 'high') {
        const hSingleWordRegex = /^(hiyori|hyori|hiori)\b[\s\,]*(.*)$/i;
        const swMatch = clean.match(hSingleWordRegex);
        if (swMatch) {
          return { matched: true, confidence: 0.85, remainingCommand: swMatch[2]?.trim() || '' };
        }
      }

      if (this.sensitivity === 'high') {
        const words = clean.split(' ');
        for (let i = 0; i < words.length; i++) {
          const w = words[i];
          if (['hiyori', 'hyori', 'hiori'].includes(w)) {
            const remaining = words.slice(i + 1).join(' ').trim();
            return { matched: true, confidence: 0.78, remainingCommand: remaining };
          }
        }
      }
    }

    // 3. Multi-word wake phrases for Normal Mode (High precision, match across all sensitivity levels)
    const exactWakePhrases = [
      'hey liza', 'heyliza', 'hey leesa', 'heyleesa', 'hey leza', 'hey leeza', 'heyleeza',
      'hey lisa', 'heylisa', 'hey eliza', 'heyeliza', 'hey aliza', 'heyaliza', 'hey lizaa',
      'hi liza', 'hiliza', 'hi leeza', 'hi lisa', 'hi leesa', 'hi eliza', 'hi aliza',
      'hello liza', 'helloliza', 'hello leeza', 'hello lisa', 'hello eliza',
      'ok liza', 'okay liza', 'ok leeza', 'okay leeza', 'ok lisa', 'okay lisa',
      'aey liza', 'ay liza', 'ae liza', 'aye liza', 'aye leeza', 'aey leeza', 'oye liza',
      'suno liza', 'suno leeza', 'suno leesa', 'suno lisa', 'bolo liza', 'bolo leeza', 'kaho liza',
      'namaste liza', 'namaste leeza', 'namaste lisa', 'namashkar liza',
      'hay liza', 'hayliza', 'he liza', 'hie liza', 'hailiza', 'hey laiza', 'hey lysa', 'hey lizer',
      'hey rawat', 'hi rawat', 'hello rawat', 'suno rawat', 'namaste rawat',
      'rawat ai', 'liza ai', 'leeza ai', 'lisa ai',
      // Devanagari script phrases
      'हे लीज़ा', 'हे लीजा', 'हे लिज़ा', 'नमस्ते लीज़ा', 'नमस्ते लीजा', 'सुनो लीज़ा', 'सुनो लीजा', 'बोलो लीज़ा', 'लीज़ा', 'लीजा'
    ];

    for (const phrase of exactWakePhrases) {
      if (clean.includes(phrase)) {
        const idx = clean.indexOf(phrase);
        const remaining = clean.substring(idx + phrase.length).trim();
        return { matched: true, confidence: 0.95, remainingCommand: remaining };
      }
    }

    // 3. Phonetic Prefix + Name Regex Matching
    const prefixRegex = /\b(hey|he|hay|hi|hie|aey|ay|ae|aye|oye|oi|ok|okay|hello|suno|namaste|namashkar|arre|are|bolo|kaho|batao|kya)\s*(liza|lisa|eliza|aliza|lizer|leeza|leza|leesa|leezaa|lizaa|laiza|lysa)\b/i;
    const match = clean.match(prefixRegex);
    if (match && match.index !== undefined) {
      const idx = match.index;
      const remaining = clean.substring(idx + match[0].length).trim();
      return { matched: true, confidence: 0.90, remainingCommand: remaining };
    }

    // 4. In Medium & High sensitivity: support single-word leading call ("Liza, what is...", "Liza", "HeyLiza")
    if (this.sensitivity === 'medium' || this.sensitivity === 'high') {
      const singleWordRegex = /^(liza|leeza|lisa|eliza|aliza|leesa|laiza|lizaa)\b[\s\,]*(.*)$/i;
      const swMatch = clean.match(singleWordRegex);
      if (swMatch) {
        return { matched: true, confidence: 0.82, remainingCommand: swMatch[2]?.trim() || '' };
      }
    }

    // 5. In High sensitivity: fuzzy match within sentence
    if (this.sensitivity === 'high') {
      const words = clean.split(' ');
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (['liza', 'leeza', 'lisa', 'eliza', 'aliza', 'leesa', 'lyza', 'laiza'].includes(w)) {
          const remaining = words.slice(i + 1).join(' ').trim();
          return { matched: true, confidence: 0.75, remainingCommand: remaining };
        }
      }
    }

    return { matched: false, confidence: 0 };
  }

  /**
   * Triggers wake word handoff with debounce protection
   */
  public triggerWakeWord(trailingCommand?: string) {
    const now = Date.now();
    // 1.8s Debounce: Prevents rapid re-triggering
    if (now - (this.lastWakeWordTime || 0) < 1800) {
      return;
    }

    if (this.state === 'ACTIVATING_LIZA' || this.state === 'LIZA_LISTENING') {
      return;
    }

    this.lastWakeWordTime = now;
    this.state = 'WAKE_DETECTED';
    console.log(`[WakeWordEngine] 🔥 WAKE WORD TRIGGERED! Command: "${trailingCommand || ''}"`);

    // Clean up recognition instance so microphone is released for AI live session
    this.cleanupWebRecognizer();
    this.cleanupAudioMeter();
    this.notifyStatusChange();

    this.notifyDiagnostics({
      wakeDetected: true,
      activationCallbackTriggered: true,
    });

    // Notify subscribers
    this.wakeWordCallbacks.forEach((cb) => {
      try { cb(trailingCommand); } catch (e) {}
    });
  }

  /**
   * Prepares microphone & engine for active AI session
   */
  public startSessionHandoff() {
    this.state = 'LIZA_LISTENING';
    this.cleanupWebRecognizer();
    this.cleanupAudioMeter();
    this.notifyStatusChange();
  }

  /**
   * Restores wake word detection after AI conversation completes
   */
  public finishSessionAndRearm() {
    if (!this.isEnabled && !this.inAppEnabled) {
      this.state = 'WAKE_DISABLED';
      this.cleanupWebRecognizer();
      this.cleanupAudioMeter();
      this.notifyStatusChange();
      return;
    }

    console.log('[WakeWordEngine] AI session finished. Re-arming wake word detector...');
    this.state = 'RETURNING_TO_WAKE';
    this.notifyStatusChange();

    // 450ms audio release cooldown
    setTimeout(() => {
      if (this.state === 'RETURNING_TO_WAKE') {
        if (this.isEnabled || this.inAppEnabled) {
          this.consecutiveFailures = 0;
          this.initService();
        } else {
          this.state = 'WAKE_DISABLED';
          this.notifyStatusChange();
        }
      }
    }, 450);
  }

  /**
   * Run full diagnostics suite (used by Owner Diagnostics screen)
   */
  public async runDiagnostics(): Promise<WakeWordDiagnosticsResult> {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    let micGranted = false;
    let audioRecordReady = false;
    let audioDetected = false;
    let rms = 0;

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micGranted = true;
        audioRecordReady = true;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          let ctx: AudioContext | null = null;
          try {
            ctx = new AudioCtx();
          } catch (e) {
            ctx = null;
          }
          if (ctx) {
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const buffer = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteTimeDomainData(buffer);
            let sum = 0;
            for (let i = 0; i < buffer.length; i++) {
              const val = (buffer[i] - 128) / 128;
              sum += val * val;
            }
            rms = Math.sqrt(sum / buffer.length);
            audioDetected = rms > 0.005;
            ctx.close();
          }
        }
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch (e: any) {
      micGranted = false;
      audioRecordReady = false;
    }

    return {
      microphonePermission: micGranted,
      audioRecordReady,
      audioDetected,
      micRmsLevel: rms,
      wakeEngineSupported: Boolean(SpeechRecognition || window.LizaAndroidBridge),
      wakeListenerActive: this.state === 'LISTENING_FOR_WAKE',
      sensitivity: this.sensitivity,
      detectedTranscript: '',
      wakeConfidence: 0,
      wakeDetected: false,
      activationCallbackTriggered: false,
    };
  }

  /**
   * Schedule a safe restart
   */
  private scheduleRestart(delayMs: number = 400) {
    if (this.restartTimeout) clearTimeout(this.restartTimeout);

    if (this.state === 'LIZA_LISTENING' || this.state === 'ACTIVATING_LIZA' || this.permissionState === 'denied') {
      return;
    }

    this.restartTimeout = setTimeout(() => {
      this.restartTimeout = null;
      if (this.state === 'LIZA_LISTENING' || this.state === 'ACTIVATING_LIZA') return;

      if (this.consecutiveFailures >= this.maxRecoveryAttempts) {
        console.warn(`[WakeWordEngine] Max recovery attempts reached (${this.maxRecoveryAttempts}).`);
        this.state = 'WAKE_ERROR';
        this.errorMessage = 'Wake word listener stopped. Tap to restart.';
        this.notifyStatusChange();
        return;
      }

      this.initService();
    }, delayMs);
  }

  private setupAutoRecoveryListeners() {
    if (typeof window === 'undefined') return;

    const handleRecovery = () => {
      if ((this.isEnabled || this.inAppEnabled) && this.state !== 'LIZA_LISTENING' && this.permissionState !== 'denied') {
        this.consecutiveFailures = 0;
        this.initService();
      }
    };

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) handleRecovery();
    });

    window.addEventListener('focus', handleRecovery);
    window.addEventListener('online', handleRecovery);
  }

  public recoverAudioPipeline() {
    this.consecutiveFailures = 0;
    this.cleanupWebRecognizer();
    this.cleanupAudioMeter();
    this.state = 'WAKE_INITIALIZING';
    this.notifyStatusChange();
    setTimeout(() => this.initService(), 200);
  }

  public pauseService() {
    this.cleanupWebRecognizer();
    this.cleanupAudioMeter();
    if (window.LizaAndroidBridge?.pauseBackgroundVoiceService) {
      try { window.LizaAndroidBridge.pauseBackgroundVoiceService(); } catch (e) {}
    }
    this.notifyStatusChange();
  }

  public resumeService() {
    if (this.state === 'LIZA_LISTENING') {
      this.finishSessionAndRearm();
    } else {
      this.consecutiveFailures = 0;
      this.initService();
    }
  }

  public stopService() {
    this.state = 'WAKE_DISABLED';
    this.consecutiveFailures = 0;
    this.cleanupWebRecognizer();
    this.cleanupAudioMeter();

    if (window.LizaAndroidBridge?.stopBackgroundVoiceService) {
      try { window.LizaAndroidBridge.stopBackgroundVoiceService(); } catch (e) {}
    }

    if (this.webNotification) {
      try { this.webNotification.close(); } catch (e) {}
      this.webNotification = null;
    }

    delete window.onLizaWakeWordDetected;
    this.notifyStatusChange();
  }

  private cleanupWebRecognizer() {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    if (this.webRecognizer) {
      try {
        this.webRecognizer.onstart = null;
        this.webRecognizer.onresult = null;
        this.webRecognizer.onerror = null;
        this.webRecognizer.onend = null;
        if (typeof this.webRecognizer.abort === 'function') {
          this.webRecognizer.abort();
        } else {
          this.webRecognizer.stop();
        }
      } catch (e) {}
      this.webRecognizer = null;
    }
  }

  private async showWebForegroundNotification() {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    // Do not attempt desktop notifications inside iframes as browsers disallow Notification constructor
    try {
      if (window.self !== window.top) return;
    } catch {
      return;
    }

    try {
      if (typeof Notification !== 'function') return;

      if (Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (permErr) {
          // Ignored if permissions policy blocks request in iframe
        }
      }

      if (Notification.permission === 'granted') {
        if (this.webNotification) {
          try { this.webNotification.close(); } catch (e) {}
          this.webNotification = null;
        }

        try {
          this.webNotification = new Notification('LIZA AI Voice', {
            body: `LIZA is listening for "${this.wakeWordPhrase}"`,
            icon: '/public/favicon.ico',
            tag: 'liza_bg_voice',
            silent: true,
            requireInteraction: true,
          });

          this.webNotification.onclick = () => {
            if (typeof window !== 'undefined') {
              window.focus();
            }
          };
        } catch (ctorErr) {
          // Caught if Notification constructor is illegal on Android or restricted iframe
          console.warn('[WakeWordEngine] Notification constructor not allowed or illegal in this context:', ctorErr);
          this.webNotification = null;
        }
      }
    } catch (e) {
      console.warn('[WakeWordEngine] Web notification failed:', e);
    }
  }
}

export const backgroundVoiceService = new BackgroundVoiceServiceManager();
