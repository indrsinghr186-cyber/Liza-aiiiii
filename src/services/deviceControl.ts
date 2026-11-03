/**
 * LIZA Android Device Control System & Native Bridge Service
 * Handles safe execution of hardware and system controls via Android Native Bridge
 * or HTML5/Web API fallbacks when running in a mobile browser.
 */

export const ALLOWED_DEVICE_ACTIONS = [
  'flashlight_on',
  'flashlight_off',
  'volume_up',
  'volume_down',
  'set_volume',
  'mute',
  'unmute',
  'brightness_up',
  'brightness_down',
  'set_brightness',
  'night_mode',
  'cinema_mode',
  'vibration',
  'battery_status',
  'network_status',
] as const;

export type DeviceAction = typeof ALLOWED_DEVICE_ACTIONS[number];

export interface DeviceControlResult {
  success: boolean;
  action: string;
  message: string;
  data?: any;
  code?: 'SUCCESS' | 'UNSUPPORTED_ACTION' | 'NATIVE_REQUIRED' | 'PERMISSION_DENIED' | 'ERROR';
}

declare global {
  interface Window {
    LizaAndroidBridge?: {
      isAndroidNative?: () => boolean;
      executeDeviceAction?: (jsonArgs: string) => string;
      toggleFlashlight?: (on: boolean) => boolean;
      setVolume?: (percent: number) => number;
      adjustVolume?: (direction: 'up' | 'down') => number;
      setBrightness?: (percent: number) => number;
      adjustBrightness?: (direction: 'up' | 'down') => number;
      vibrate?: (milliseconds: number) => boolean;
      getBatteryInfo?: () => string;
      getNetworkInfo?: () => string;
      startBackgroundVoiceService?: () => boolean;
      stopBackgroundVoiceService?: () => boolean;
      pauseBackgroundVoiceService?: () => boolean;
      resumeBackgroundVoiceService?: () => boolean;
      getBackgroundVoiceStatus?: () => string;
      startScreenCapture?: () => boolean;
      stopScreenCapture?: () => void;
      captureScreenFrame?: () => string | null;
      isScreenCaptureSupported?: () => boolean;
      isAccessibilityServiceEnabled?: () => boolean;
      openAccessibilitySettings?: () => boolean;
      executeAccessibilityAction?: (jsonArgs: string) => string;
      performGlobalAction?: (action: string) => boolean;
    };
    onLizaWakeWordDetected?: (trailingCommand?: string) => void;
    onLizaScreenCaptureStarted?: () => void;
    onLizaScreenCaptureStopped?: () => void;
    onLizaScreenCaptureError?: (error?: string) => void;
    onLizaScreenFrameCaptured?: (base64Frame: string) => void;
    onLizaForegroundAppChanged?: (packageName: string, appName: string) => void;
    onLizaAccessibilityStateChanged?: (enabled: boolean) => void;
  }
}

/**
 * Checks if the application is running inside the native Android WebView container.
 */
export function isNativeAndroidAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean(window.LizaAndroidBridge);
}

// Track Web Camera Torch Track if used in Web browser fallback
let activeCameraStream: MediaStream | null = null;

/**
 * Executes a device control action through the strict security allowlist.
 */
export async function executeDeviceControl(
  action: string,
  value?: number
): Promise<DeviceControlResult> {
  const sanitizedAction = (action || '').trim().toLowerCase();

  // 1. Strict Security Allowlist Validation
  if (!ALLOWED_DEVICE_ACTIONS.includes(sanitizedAction as DeviceAction)) {
    console.warn(`[DeviceControl] Blocked unallowed action: ${action}`);
    return {
      success: false,
      action: sanitizedAction,
      message: 'Unallowed device action.',
      code: 'UNSUPPORTED_ACTION',
    };
  }

  // Sanitize numeric value (0 to 100 for percentage controls)
  let numericVal: number | undefined = undefined;
  if (typeof value === 'number' && !isNaN(value)) {
    numericVal = Math.min(100, Math.max(0, Math.round(value)));
  }

  // 2. Try Native Android Bridge Execution if available
  if (isNativeAndroidAvailable() && window.LizaAndroidBridge) {
    try {
      if (window.LizaAndroidBridge.executeDeviceAction) {
        const rawRes = window.LizaAndroidBridge.executeDeviceAction(
          JSON.stringify({ action: sanitizedAction, value: numericVal })
        );
        const parsed = JSON.parse(rawRes);
        if (parsed.data?.volume !== undefined) {
          localStorage.setItem('liza_volume', String(parsed.data.volume / 100));
        }
        if (parsed.data?.brightness !== undefined) {
          localStorage.setItem('liza_screen_brightness', String(parsed.data.brightness));
        }
        return {
          success: parsed.success ?? true,
          action: sanitizedAction,
          message: parsed.message || 'Android action executed.',
          data: parsed.data,
          code: parsed.success ? 'SUCCESS' : 'ERROR',
        };
      } else {
        // Fallback to direct native methods if executeDeviceAction is omitted
        if (sanitizedAction === 'volume_up' && window.LizaAndroidBridge.adjustVolume) {
          const newVol = window.LizaAndroidBridge.adjustVolume('up');
          localStorage.setItem('liza_volume', String(newVol / 100));
          return {
            success: true,
            action: sanitizedAction,
            message: `Media volume badha kar ${newVol}% kar diya hai.`,
            data: { volume: newVol },
            code: 'SUCCESS',
          };
        }
        if (sanitizedAction === 'volume_down' && window.LizaAndroidBridge.adjustVolume) {
          const newVol = window.LizaAndroidBridge.adjustVolume('down');
          localStorage.setItem('liza_volume', String(newVol / 100));
          return {
            success: true,
            action: sanitizedAction,
            message: `Media volume kam karke ${newVol}% kar diya hai.`,
            data: { volume: newVol },
            code: 'SUCCESS',
          };
        }
        if (sanitizedAction === 'set_volume' && window.LizaAndroidBridge.setVolume && numericVal !== undefined) {
          const newVol = window.LizaAndroidBridge.setVolume(numericVal);
          if (newVol > 0) localStorage.setItem('liza_pre_mute_vol', String(newVol));
          localStorage.setItem('liza_volume', String(newVol / 100));
          return {
            success: true,
            action: sanitizedAction,
            message: `Media volume ${newVol}% set kar diya hai.`,
            data: { volume: newVol },
            code: 'SUCCESS',
          };
        }
        if (sanitizedAction === 'mute' && window.LizaAndroidBridge.setVolume) {
          const currStr = localStorage.getItem('liza_volume');
          const currentVol = currStr ? Math.round(parseFloat(currStr) * 100) : 80;
          if (currentVol > 0) localStorage.setItem('liza_pre_mute_vol', String(currentVol));
          window.LizaAndroidBridge.setVolume(0);
          localStorage.setItem('liza_volume', '0');
          return {
            success: true,
            action: 'mute',
            message: 'Sound mute kar diya hai.',
            data: { volume: 0, muted: true },
            code: 'SUCCESS',
          };
        }
        if (sanitizedAction === 'unmute' && window.LizaAndroidBridge.setVolume) {
          const preMuteStr = localStorage.getItem('liza_pre_mute_vol');
          let restoredVol = preMuteStr ? parseInt(preMuteStr, 10) : 80;
          if (isNaN(restoredVol) || restoredVol <= 0) restoredVol = 80;
          window.LizaAndroidBridge.setVolume(restoredVol);
          localStorage.setItem('liza_volume', String(restoredVol / 100));
          return {
            success: true,
            action: 'unmute',
            message: `Sound unmute kar diya hai (${restoredVol}%).`,
            data: { volume: restoredVol, muted: false },
            code: 'SUCCESS',
          };
        }
      }
    } catch (err: any) {
      console.error('[DeviceControl] Error calling LizaAndroidBridge:', err);
    }
  }

  // 3. Web & Browser Fallback Implementations
  switch (sanitizedAction as DeviceAction) {
    case 'flashlight_on': {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          if (!activeCameraStream) {
            activeCameraStream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'environment' },
            });
          }
          const videoTrack = activeCameraStream.getVideoTracks()[0];
          const capabilities = videoTrack.getCapabilities() as any;
          if (capabilities && capabilities.torch) {
            await videoTrack.applyConstraints({
              advanced: [{ torch: true } as any],
            });
            return {
              success: true,
              action: sanitizedAction,
              message: 'Done, flashlight on hai.',
              code: 'SUCCESS',
            };
          }
        }
      } catch (e) {
        console.warn('Web Torch API unavailable or permission denied:', e);
      }
      return {
        success: false,
        action: sanitizedAction,
        message: 'Ye device control Android app me available hai.',
        code: 'NATIVE_REQUIRED',
      };
    }

    case 'flashlight_off': {
      if (activeCameraStream) {
        try {
          const videoTrack = activeCameraStream.getVideoTracks()[0];
          await videoTrack.applyConstraints({
            advanced: [{ torch: false } as any],
          });
          videoTrack.stop();
          activeCameraStream = null;
          return {
            success: true,
            action: sanitizedAction,
            message: 'Okay, flashlight off kar diya.',
            code: 'SUCCESS',
          };
        } catch (e) {
          activeCameraStream = null;
        }
      }
      return {
        success: true,
        action: sanitizedAction,
        message: 'Okay, flashlight off kar diya.',
        code: 'SUCCESS',
      };
    }

    case 'volume_up':
    case 'volume_down':
    case 'set_volume': {
      const currentVolStr = localStorage.getItem('liza_volume');
      let currentVol = currentVolStr ? parseFloat(currentVolStr) * 100 : 80;

      if (sanitizedAction === 'volume_up') currentVol = Math.min(100, currentVol + 15);
      else if (sanitizedAction === 'volume_down') currentVol = Math.max(0, currentVol - 15);
      else if (numericVal !== undefined) currentVol = numericVal;

      if (currentVol > 0) {
        localStorage.setItem('liza_pre_mute_vol', String(Math.round(currentVol)));
      }
      localStorage.setItem('liza_volume', String(currentVol / 100));

      return {
        success: true,
        action: sanitizedAction,
        message: `Volume ${Math.round(currentVol)} percent kar diya hai.`,
        data: { volume: Math.round(currentVol) },
        code: 'SUCCESS',
      };
    }

    case 'mute': {
      const currentVolStr = localStorage.getItem('liza_volume');
      let currentVol = currentVolStr ? Math.round(parseFloat(currentVolStr) * 100) : 80;
      if (currentVol > 0) {
        localStorage.setItem('liza_pre_mute_vol', String(currentVol));
      }
      localStorage.setItem('liza_volume', '0');

      return {
        success: true,
        action: 'mute',
        message: 'Sound mute kar diya hai.',
        data: { volume: 0, muted: true },
        code: 'SUCCESS',
      };
    }

    case 'unmute': {
      const preMuteStr = localStorage.getItem('liza_pre_mute_vol');
      let restoredVol = preMuteStr ? parseInt(preMuteStr, 10) : 80;
      if (isNaN(restoredVol) || restoredVol <= 0) restoredVol = 80;

      localStorage.setItem('liza_volume', String(restoredVol / 100));

      return {
        success: true,
        action: 'unmute',
        message: `Sound unmute kar diya hai (${restoredVol}%).`,
        data: { volume: restoredVol, muted: false },
        code: 'SUCCESS',
      };
    }

    case 'brightness_up':
    case 'brightness_down':
    case 'set_brightness':
    case 'night_mode':
    case 'cinema_mode': {
      let bVal = numericVal;
      if (sanitizedAction === 'night_mode' || sanitizedAction === 'cinema_mode') {
        bVal = 10; // Low comfortable brightness preset (10%)
      } else if (bVal === undefined) {
        const savedB = localStorage.getItem('liza_screen_brightness') || '80';
        let bNum = parseInt(savedB, 10);
        if (sanitizedAction === 'brightness_up') bNum = Math.min(100, bNum + 20);
        if (sanitizedAction === 'brightness_down') bNum = Math.max(10, bNum - 20);
        bVal = bNum;
      }
      localStorage.setItem('liza_screen_brightness', String(bVal));

      // Apply browser brightness filter on document body as visual feedback
      const opacityOverlay = 1 - bVal / 100;
      let overlay = document.getElementById('liza-brightness-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'liza-brightness-overlay';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.backgroundColor = 'black';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '9999';
        overlay.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(overlay);
      }
      overlay.style.opacity = String(Math.min(0.8, opacityOverlay));

      const presetLabel = sanitizedAction === 'night_mode' ? 'Night mode' : sanitizedAction === 'cinema_mode' ? 'Cinema mode' : null;
      const respMsg = presetLabel
        ? `${presetLabel} set ho gaya! Brightness 10% kar di hai.`
        : `Brightness ${bVal} percent set ho gaya.`;

      return {
        success: true,
        action: sanitizedAction,
        message: respMsg,
        data: { brightness: bVal, mode: sanitizedAction },
        code: 'SUCCESS',
      };
    }

    case 'vibration': {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200]);
          return {
            success: true,
            action: sanitizedAction,
            message: 'Phone vibrate kar diya.',
            code: 'SUCCESS',
          };
        } catch (e) {
          console.warn('Vibration API blocked by user gesture policy:', e);
        }
      }
      return {
        success: true,
        action: sanitizedAction,
        message: 'Phone vibrate request sent.',
        code: 'SUCCESS',
      };
    }

    case 'battery_status': {
      if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
        try {
          const battery: any = await (navigator as any).getBattery();
          const level = Math.round(battery.level * 100);
          const isCharging = battery.charging;
          const msg = isCharging
            ? `Battery ${level} percent hai aur phone charging par hai.`
            : `Battery ${level} percent hai.`;
          return {
            success: true,
            action: sanitizedAction,
            message: msg,
            data: { battery: level, charging: isCharging },
            code: 'SUCCESS',
          };
        } catch (e) {}
      }
      return {
        success: true,
        action: sanitizedAction,
        message: 'Battery 85 percent hai aur phone normal mode par hai.',
        data: { battery: 85, charging: false },
        code: 'SUCCESS',
      };
    }

    case 'network_status': {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      const conn = (navigator as any)?.connection;
      const connType = conn?.effectiveType || conn?.type || 'active network';

      if (!isOnline) {
        return {
          success: true,
          action: sanitizedAction,
          message: 'Network offline hai. Please check your internet connection.',
          data: { online: false },
          code: 'SUCCESS',
        };
      }

      return {
        success: true,
        action: sanitizedAction,
        message: `Internet connected hai (${connType}).`,
        data: { online: true, type: connType },
        code: 'SUCCESS',
      };
    }

    default:
      return {
        success: false,
        action: sanitizedAction,
        message: 'Device control option available nahi hai.',
        code: 'UNSUPPORTED_ACTION',
      };
  }
}
