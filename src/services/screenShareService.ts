/**
 * LIZA Screen Sharing & Screen Analysis Engine
 * 
 * Supports:
 * 1. Standard Web Browsers (navigator.mediaDevices.getDisplayMedia)
 * 2. Mobile Web / WebViews with graceful fallback
 * 3. Native Android MediaProjection API via LizaAndroidBridge
 * 
 * State Machine:
 * IDLE -> REQUESTING_PERMISSION -> SHARING -> ANALYZING -> SHARING -> STOPPED -> IDLE
 *                                     |
 *                                   ERROR -> RECOVER -> IDLE
 */

export type PlatformType = 'Browser' | 'WebView' | 'Native Android';
export type ScreenShareState = 'IDLE' | 'REQUESTING_PERMISSION' | 'SHARING' | 'ANALYZING' | 'STOPPED' | 'ERROR';
export type PermissionState = 'PROMPT' | 'GRANTED' | 'DENIED' | 'UNSUPPORTED';
export type TrackState = 'NONE' | 'ACTIVE' | 'ENDED';
export type AnalysisState = 'READY' | 'PROCESSING' | 'ERROR';

export type ElementType = 'button' | 'input_field' | 'link' | 'toggle' | 'tab' | 'menu_item' | 'card' | 'search_bar' | 'icon';
export type ElementLocation = 'top_nav' | 'header' | 'center_main' | 'form_container' | 'bottom_bar' | 'floating_action' | 'sidebar' | 'footer';

export interface InteractiveElement {
  id: string;
  type: ElementType;
  label: string;
  location: ElementLocation;
  bounds?: { x: number; y: number; width: number; height: number };
  isPrimaryAction?: boolean;
  suggestedActionDescription: string;
}

export interface ScreenInteractionAnalysis {
  detectedApp: string;
  screenHeadline: string;
  interactiveElements: InteractiveElement[];
  suggestedNextAction: {
    actionTitle: string;
    actionType: 'click' | 'type' | 'confirm' | 'scroll' | 'select' | 'navigate';
    targetElementLabel: string;
    locationHint: string;
    voicePromptForParamveer: string;
    alternateAction?: string;
  };
  summaryForVision: string;
}

export interface ScreenShareStatus {
  platform: PlatformType;
  isSupported: boolean;
  state: ScreenShareState;
  permission: PermissionState;
  trackState: TrackState;
  analysisState: AnalysisState;
  statusLabel: string;
  errorMessage: string | null;
  lastCaptureTime: number | null;
  debugLabel: string;
  lastAnalysis?: ScreenInteractionAnalysis | null;
}

export type ScreenShareStatusListener = (status: ScreenShareStatus) => void;

class ScreenShareServiceManager {
  private platform: PlatformType = 'Browser';
  private state: ScreenShareState = 'IDLE';
  private permission: PermissionState = 'PROMPT';
  private trackState: TrackState = 'NONE';
  private analysisState: AnalysisState = 'READY';
  private errorMessage: string | null = null;
  private lastCaptureTime: number | null = null;
  private lastAnalysis: ScreenInteractionAnalysis | null = null;

  private stream: MediaStream | null = null;
  private statusListeners: Set<ScreenShareStatusListener> = new Set();
  private pendingAndroidFrameResolver: ((frame: string | null) => void) | null = null;

  constructor() {
    this.detectEnvironment();
    this.setupAndroidCallbacks();
  }

  /**
   * Identifies execution environment (Browser vs WebView vs Native Android)
   */
  public detectEnvironment(): PlatformType {
    if (typeof window === 'undefined') {
      this.platform = 'Browser';
      return 'Browser';
    }

    if (
      window.LizaAndroidBridge &&
      (window.LizaAndroidBridge.startScreenCapture ||
        window.LizaAndroidBridge.executeDeviceAction ||
        window.LizaAndroidBridge.isAndroidNative?.())
    ) {
      this.platform = 'Native Android';
      return 'Native Android';
    }

    const ua = navigator.userAgent || '';
    if (/Android/i.test(ua) && (/wv\b/i.test(ua) || /Version\/[\d\.]+/i.test(ua))) {
      this.platform = 'WebView';
      return 'WebView';
    }

    this.platform = 'Browser';
    return 'Browser';
  }

  /**
   * Checks if screen capture is supported in current platform context
   */
  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;

    this.detectEnvironment();

    if (this.platform === 'Native Android') {
      if (window.LizaAndroidBridge?.isScreenCaptureSupported) {
        return window.LizaAndroidBridge.isScreenCaptureSupported();
      }
      return true;
    }

    // Web / WebView context check
    const mediaDevices = navigator.mediaDevices as any;
    const hasGetDisplayMedia = Boolean(
      mediaDevices && (mediaDevices.getDisplayMedia || (navigator as any).getDisplayMedia)
    );

    return hasGetDisplayMedia;
  }

  /**
   * Returns complete real-time screen sharing status
   */
  public getStatus(): ScreenShareStatus {
    const supported = this.isSupported();
    let statusLabel = 'Screen Sharing Off';
    let debugLabel = 'SCREEN: IDLE';

    switch (this.state) {
      case 'IDLE':
        statusLabel = supported ? 'Screen Sharing Ready' : 'Screen Sharing Unsupported';
        debugLabel = 'SCREEN: IDLE';
        break;
      case 'REQUESTING_PERMISSION':
        statusLabel = '⏳ Requesting Screen Permission...';
        debugLabel = 'SCREEN: REQUESTING';
        break;
      case 'SHARING':
        statusLabel = '🔴 Screen Sharing Active';
        debugLabel = 'SCREEN: ACTIVE';
        break;
      case 'ANALYZING':
        statusLabel = '🔍 Liza Analyzing Screen...';
        debugLabel = 'SCREEN: ANALYZING';
        break;
      case 'STOPPED':
        statusLabel = 'Screen Sharing Stopped';
        debugLabel = 'SCREEN: STOPPED';
        break;
      case 'ERROR':
        statusLabel = this.errorMessage || 'Screen Sharing Error';
        debugLabel = 'SCREEN: ERROR';
        break;
    }

    return {
      platform: this.platform,
      isSupported: supported,
      state: this.state,
      permission: this.permission,
      trackState: this.trackState,
      analysisState: this.analysisState,
      statusLabel,
      errorMessage: this.errorMessage,
      lastCaptureTime: this.lastCaptureTime,
      debugLabel,
      lastAnalysis: this.lastAnalysis,
    };
  }

  public subscribeStatus(listener: ScreenShareStatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.getStatus());
    return () => this.statusListeners.delete(listener);
  }

  private notifyStatus() {
    const status = this.getStatus();
    this.statusListeners.forEach((listener) => {
      try { listener(status); } catch (e) {}
    });
  }

  /**
   * Starts screen capture session cleanly.
   */
  public async startScreenShare(): Promise<{ status: 'success' | 'error'; message: string }> {
    if (this.state === 'SHARING') {
      return { status: 'success', message: 'Screen sharing is already active.' };
    }

    this.detectEnvironment();

    if (!this.isSupported()) {
      this.state = 'ERROR';
      this.permission = 'UNSUPPORTED';
      this.errorMessage = 'Is device/browser context par screen sharing supported nahi hai. Image upload try karein.';
      this.notifyStatus();
      return {
        status: 'error',
        message: 'Screen capture is not supported in this browser or device context. Please upload a screenshot or image instead.',
      };
    }

    this.state = 'REQUESTING_PERMISSION';
    this.errorMessage = null;
    this.notifyStatus();

    // 1. Native Android MediaProjection Flow
    if (this.platform === 'Native Android' && window.LizaAndroidBridge?.startScreenCapture) {
      try {
        const started = window.LizaAndroidBridge.startScreenCapture();
        if (started) {
          this.state = 'SHARING';
          this.permission = 'GRANTED';
          this.trackState = 'ACTIVE';
          this.errorMessage = null;
          this.notifyStatus();
          return { status: 'success', message: 'Native Android screen sharing started.' };
        } else {
          this.state = 'ERROR';
          this.permission = 'DENIED';
          this.errorMessage = 'Screen capture permission denied or cancelled on Android device.';
          this.notifyStatus();
          return { status: 'error', message: 'Android screen capture permission was denied.' };
        }
      } catch (err: any) {
        console.error('[ScreenShareService] Android screen capture error:', err);
        this.state = 'ERROR';
        this.permission = 'DENIED';
        this.errorMessage = err?.message || 'Android MediaProjection failed.';
        this.notifyStatus();
        return { status: 'error', message: this.errorMessage || 'Android screen capture failed.' };
      }
    }

    // 2. Web / WebView getDisplayMedia Flow
    try {
      const mediaDevices = navigator.mediaDevices as any;
      const getDisplayMedia = (
        mediaDevices.getDisplayMedia
          ? mediaDevices.getDisplayMedia.bind(mediaDevices)
          : (navigator as any).getDisplayMedia.bind(navigator)
      );

      // Request display stream (audio optional)
      const displayStream: MediaStream = await getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { max: 15 },
        },
        audio: false,
      });

      this.stream = displayStream;
      const videoTrack = displayStream.getVideoTracks()[0];

      if (videoTrack) {
        this.trackState = 'ACTIVE';
        videoTrack.addEventListener('ended', () => {
          console.log('[ScreenShareService] Video track ended from browser/system bar.');
          this.handleTrackEnded();
        });
      }

      this.state = 'SHARING';
      this.permission = 'GRANTED';
      this.errorMessage = null;
      this.notifyStatus();

      return { status: 'success', message: 'Screen sharing active! Liza can now analyze your screen.' };

    } catch (err: any) {
      console.warn('[ScreenShareService] getDisplayMedia error:', err);

      const isDenied =
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        err?.name === 'AbortError';

      this.state = 'ERROR';
      this.permission = isDenied ? 'DENIED' : 'UNSUPPORTED';
      this.errorMessage = isDenied
        ? 'Screen sharing permission denied or cancelled.'
        : err?.message || 'Screen capture failed in this browser context.';

      this.notifyStatus();

      return {
        status: 'error',
        message: this.errorMessage || 'Screen sharing permission was denied.',
      };
    }
  }

  /**
   * Captures a single optimized video frame for analyzeScreen()
   */
  public async captureFrame(): Promise<{ status: 'success' | 'error'; base64Data?: string; message: string }> {
    if ((this.state as ScreenShareState) !== 'SHARING') {
      const startRes = await this.startScreenShare();
      if (startRes.status === 'error' || (this.state as ScreenShareState) !== 'SHARING') {
        return {
          status: 'error',
          message: startRes.message || 'Screen capture is not active or supported. Please upload an image instead.',
        };
      }
    }

    this.state = 'ANALYZING';
    this.analysisState = 'PROCESSING';
    this.notifyStatus();

    try {
      let base64JPEG = '';

      // 1. Native Android Frame Capture
      if (this.platform === 'Native Android' && window.LizaAndroidBridge?.captureScreenFrame) {
        base64JPEG = window.LizaAndroidBridge.captureScreenFrame() || '';
        if (!base64JPEG) {
          // Fallback to waiting for JS bridge frame callback
          base64JPEG = await this.awaitAndroidFrameCallback(3000) || '';
        }
      }

      // 2. Web MediaStream Frame Capture
      if (!base64JPEG && this.stream) {
        const track = this.stream.getVideoTracks()[0];

        if (track && track.readyState === 'live') {
          // Try ImageCapture API if available
          if ('ImageCapture' in window) {
            try {
              const imageCapture = new (window as any).ImageCapture(track);
              const bitmap = await imageCapture.grabFrame();
              base64JPEG = this.bitmapToBase64Jpeg(bitmap);
            } catch (e) {
              console.warn('[ScreenShareService] ImageCapture grabFrame failed, falling back to canvas:', e);
            }
          }

          // Fallback: Video element + Canvas
          if (!base64JPEG) {
            base64JPEG = await this.captureFrameFromVideoElement(this.stream);
          }
        }
      }

      if (base64JPEG) {
        this.lastCaptureTime = Date.now();
        this.state = 'SHARING';
        this.analysisState = 'READY';
        this.notifyStatus();

        return {
          status: 'success',
          base64Data: base64JPEG,
          message: 'Screen frame captured successfully.',
        };
      }

      this.state = 'SHARING';
      this.analysisState = 'ERROR';
      this.notifyStatus();
      return {
        status: 'error',
        message: 'Could not capture frame from current screen stream.',
      };

    } catch (err: any) {
      console.error('[ScreenShareService] Frame capture failed:', err);
      this.state = 'SHARING';
      this.analysisState = 'ERROR';
      this.notifyStatus();
      return {
        status: 'error',
        message: err?.message || 'Frame capture exception occurred.',
      };
    }
  }

  /**
   * Stops screen capture session and releases all tracks/resources.
   */
  public stopScreenShare() {
    console.log('[ScreenShareService] Stopping screen capture session...');

    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      this.stream = null;
    }

    if (this.platform === 'Native Android' && window.LizaAndroidBridge?.stopScreenCapture) {
      try {
        window.LizaAndroidBridge.stopScreenCapture();
      } catch (e) {}
    }

    this.state = 'STOPPED';
    this.trackState = 'NONE';
    this.analysisState = 'READY';
    this.errorMessage = null;
    this.notifyStatus();

    setTimeout(() => {
      if (this.state === 'STOPPED') {
        this.state = 'IDLE';
        this.notifyStatus();
      }
    }, 500);
  }

  private handleTrackEnded() {
    this.stream = null;
    this.trackState = 'ENDED';
    this.state = 'STOPPED';
    this.notifyStatus();

    setTimeout(() => {
      this.state = 'IDLE';
      this.notifyStatus();
    }, 500);
  }

  private bitmapToBase64Jpeg(bitmap: ImageBitmap): string {
    const canvas = document.createElement('canvas');
    // Constrain resolution to max 1280x720 while maintaining aspect ratio
    const maxW = 1280;
    const maxH = 720;
    let w = bitmap.width;
    let h = bitmap.height;

    if (w > maxW || h > maxH) {
      const ratio = Math.min(maxW / w, maxH / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(bitmap, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      return dataUrl.split(',')[1] || '';
    }
    return '';
  }

  private captureFrameFromVideoElement(stream: MediaStream): Promise<string> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;

      const timeout = setTimeout(() => {
        cleanup();
        resolve('');
      }, 2000);

      const cleanup = () => {
        clearTimeout(timeout);
        video.pause();
        video.srcObject = null;
      };

      video.onloadedmetadata = () => {
        video.play().then(() => {
          setTimeout(() => {
            try {
              const canvas = document.createElement('canvas');
              const maxW = 1280;
              const maxH = 720;
              let w = video.videoWidth || 1280;
              let h = video.videoHeight || 720;

              if (w > maxW || h > maxH) {
                const ratio = Math.min(maxW / w, maxH / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);
              }

              canvas.width = w;
              canvas.height = h;

              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(video, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
                cleanup();
                resolve(dataUrl.split(',')[1] || '');
                return;
              }
            } catch (e) {}
            cleanup();
            resolve('');
          }, 150);
        }).catch(() => {
          cleanup();
          resolve('');
        });
      };
    });
  }

  private setupAndroidCallbacks() {
    if (typeof window === 'undefined') return;

    window.onLizaScreenCaptureStarted = () => {
      this.state = 'SHARING';
      this.permission = 'GRANTED';
      this.trackState = 'ACTIVE';
      this.notifyStatus();
    };

    window.onLizaScreenCaptureStopped = () => {
      this.handleTrackEnded();
    };

    window.onLizaScreenCaptureError = (errMessage?: string) => {
      this.state = 'ERROR';
      this.permission = 'DENIED';
      this.errorMessage = errMessage || 'Android screen capture error.';
      this.notifyStatus();
    };

    window.onLizaScreenFrameCaptured = (base64Frame: string) => {
      if (this.pendingAndroidFrameResolver) {
        this.pendingAndroidFrameResolver(base64Frame);
        this.pendingAndroidFrameResolver = null;
      }
    };
  }

  private awaitAndroidFrameCallback(timeoutMs: number): Promise<string | null> {
    return new Promise((resolve) => {
      this.pendingAndroidFrameResolver = resolve;
      setTimeout(() => {
        if (this.pendingAndroidFrameResolver === resolve) {
          this.pendingAndroidFrameResolver = null;
          resolve(null);
        }
      }, timeoutMs);
    });
  }
  /**
   * Intelligently scans screen elements (buttons, inputs, toggles, links)
   * and formulates the single most logical next action for Paramveer Rawat as a voice prompt.
   */
  public detectInteractiveElements(focusHint?: string, currentAppContext?: string): ScreenInteractionAnalysis {
    const elements: InteractiveElement[] = [];
    const appName = currentAppContext || (this.platform === 'Native Android' ? 'Mobile App Screen' : 'Web Viewport');

    // 1. Live DOM Element Inspection (when in browser / webview context)
    if (typeof document !== 'undefined') {
      try {
        // Collect visible input fields
        const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea, select'));
        inputs.slice(0, 5).forEach((el, idx) => {
          const inputEl = el as HTMLInputElement;
          const rect = inputEl.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const label = inputEl.placeholder || inputEl.name || inputEl.getAttribute('aria-label') || inputEl.id || `Input field #${idx + 1}`;
            const isFilled = Boolean(inputEl.value && inputEl.value.trim());
            const loc: ElementLocation = rect.top < 150 ? 'top_nav' : rect.top > window.innerHeight - 150 ? 'bottom_bar' : 'form_container';
            elements.push({
              id: `input_${idx}`,
              type: inputEl.type === 'search' ? 'search_bar' : 'input_field',
              label: label.trim(),
              location: loc,
              bounds: { x: Math.round(rect.left), y: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) },
              isPrimaryAction: !isFilled,
              suggestedActionDescription: isFilled ? `Value "${inputEl.value}" entered; ready to submit or modify.` : `Enter text or query into "${label}".`
            });
          }
        });

        // Collect visible clickable buttons
        const buttons = Array.from(document.querySelectorAll('button:not([disabled]), a[href], [role="button"]'));
        buttons.slice(0, 8).forEach((btn, idx) => {
          const btnEl = btn as HTMLElement;
          const rect = btnEl.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const rawText = btnEl.innerText || btnEl.getAttribute('title') || btnEl.getAttribute('aria-label') || '';
            const cleanText = rawText.replace(/\s+/g, ' ').trim() || `Action Button #${idx + 1}`;
            const loc: ElementLocation = rect.top < 100 ? 'header' : rect.top > window.innerHeight - 120 ? 'bottom_bar' : 'center_main';
            const isPrimary = /submit|confirm|pay|send|save|login|search|continue|next|apply|done/i.test(cleanText);
            elements.push({
              id: `btn_${idx}`,
              type: btn.tagName.toLowerCase() === 'a' ? 'link' : 'button',
              label: cleanText.length > 30 ? cleanText.substring(0, 30) + '...' : cleanText,
              location: loc,
              bounds: { x: Math.round(rect.left), y: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) },
              isPrimaryAction: isPrimary,
              suggestedActionDescription: `Tap "${cleanText}" to proceed.`
            });
          }
        });
      } catch (domErr) {
        console.debug('DOM scan fallback:', domErr);
      }
    }

    // 2. Heuristic fallback elements if screen is remote/native or no DOM elements found
    if (elements.length === 0) {
      const hint = (focusHint || '').toLowerCase();
      if (hint.includes('login') || hint.includes('sign in')) {
        elements.push(
          { id: 'el_1', type: 'input_field', label: 'Email / Username field', location: 'form_container', isPrimaryAction: true, suggestedActionDescription: 'Fill your username/email' },
          { id: 'el_2', type: 'input_field', label: 'Password field', location: 'form_container', isPrimaryAction: false, suggestedActionDescription: 'Enter your account password' },
          { id: 'el_3', type: 'button', label: 'Sign In / Submit button', location: 'form_container', isPrimaryAction: true, suggestedActionDescription: 'Click to authenticate' }
        );
      } else if (hint.includes('payment') || hint.includes('checkout') || hint.includes('cart')) {
        elements.push(
          { id: 'el_pay_1', type: 'button', label: 'Proceed to Payment / Pay Now', location: 'bottom_bar', isPrimaryAction: true, suggestedActionDescription: 'Execute payment transaction' },
          { id: 'el_pay_2', type: 'input_field', label: 'Promo Code / UPI ID input', location: 'center_main', isPrimaryAction: false, suggestedActionDescription: 'Enter promo voucher or UPI handle' }
        );
      } else {
        elements.push(
          { id: 'el_gen_1', type: 'search_bar', label: 'Search Bar', location: 'top_nav', isPrimaryAction: false, suggestedActionDescription: 'Type query to find items or contacts' },
          { id: 'el_gen_2', type: 'button', label: 'Primary Action Button', location: 'bottom_bar', isPrimaryAction: true, suggestedActionDescription: 'Tap to confirm the current screen step' },
          { id: 'el_gen_3', type: 'button', label: 'Back / Cancel Navigation', location: 'header', isPrimaryAction: false, suggestedActionDescription: 'Return to previous screen' }
        );
      }
    }

    // 3. Formulate the single most logical next action for Paramveer Rawat
    const primaryInput = elements.find(e => e.type === 'input_field' && e.isPrimaryAction);
    const primaryBtn = elements.find(e => e.type === 'button' && e.isPrimaryAction) || elements.find(e => e.type === 'button');
    const searchBar = elements.find(e => e.type === 'search_bar');

    let actionTitle = 'Tap Primary Action';
    let actionType: 'click' | 'type' | 'confirm' | 'scroll' | 'select' | 'navigate' = 'click';
    let targetElementLabel = primaryBtn?.label || 'Action Button';
    let locationHint = primaryBtn?.location || 'center_main';
    let voicePromptForParamveer = '';

    if (primaryInput) {
      actionTitle = `Enter text into ${primaryInput.label}`;
      actionType = 'type';
      targetElementLabel = primaryInput.label;
      locationHint = primaryInput.location;
      voicePromptForParamveer = `Paramveer, screen par "${primaryInput.label}" field visible hai. Kya aap isme details type karna chahte hain ya main fill karne me help karu?`;
    } else if (primaryBtn) {
      actionTitle = `Click "${primaryBtn.label}"`;
      actionType = 'click';
      targetElementLabel = primaryBtn.label;
      locationHint = primaryBtn.location;
      voicePromptForParamveer = `Paramveer, screen par "${primaryBtn.label}" button visible hai. Sabse logical next step is button ko tap karke aage badhna hai. Kya main click kar du?`;
    } else if (searchBar) {
      actionTitle = `Search via "${searchBar.label}"`;
      actionType = 'type';
      targetElementLabel = searchBar.label;
      locationHint = searchBar.location;
      voicePromptForParamveer = `Paramveer, top par search bar visible hai. Aap kya search karna chahte hain?`;
    } else {
      voicePromptForParamveer = `Paramveer, screen content analyze ho gaya hai. Main aapko step-by-step guide karne ke liye ready hu.`;
    }

    const analysis: ScreenInteractionAnalysis = {
      detectedApp: appName,
      screenHeadline: `${appName} with ${elements.length} interactive elements detected`,
      interactiveElements: elements,
      suggestedNextAction: {
        actionTitle,
        actionType,
        targetElementLabel,
        locationHint,
        voicePromptForParamveer,
        alternateAction: elements.length > 1 ? `Alternative: Tap "${elements[1].label}"` : undefined
      },
      summaryForVision: `Screen contains ${elements.length} interactive elements (${elements.map(e => `${e.type}: "${e.label}" [${e.location}]`).join(', ')}). Recommended next action for Paramveer Rawat: ${voicePromptForParamveer}`
    };

    this.lastAnalysis = analysis;
    this.notifyStatus();
    return analysis;
  }
}

export const screenShareService = new ScreenShareServiceManager();
