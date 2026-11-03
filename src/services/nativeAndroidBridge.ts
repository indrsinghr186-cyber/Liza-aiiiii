// Native Android Bridge for RAWAT AI (Liza) APK
// Connects Web React to Android Accessibility Services, System Overlays & Hardware

export interface AndroidPermissionStatus {
  accessibility: boolean;
  overlay: boolean;
  microphone: boolean;
  camera: boolean;
  location: boolean;
}

class NativeAndroidBridge {
  private isNativeApp: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isNativeApp = !!((window as any).Capacitor?.isNativePlatform?.() || (window as any).AndroidBridge);
    }
  }

  public isRunningInApk(): boolean {
    return this.isNativeApp;
  }

  /**
   * Checks current status of all critical Android permissions
   */
  public async getPermissionStatus(): Promise<AndroidPermissionStatus> {
    if (this.isNativeApp && (window as any).Capacitor?.Plugins?.RawatNativeBridge) {
      try {
        const bridge = (window as any).Capacitor.Plugins.RawatNativeBridge;
        const acc = await bridge.checkAccessibilityPermission();
        const ovr = await bridge.checkOverlayPermission();
        return {
          accessibility: !!acc.isGranted,
          overlay: !!ovr.isGranted,
          microphone: true,
          camera: true,
          location: true
        };
      } catch (e) {
        console.warn('Native bridge check error:', e);
      }
    }

    // Default Web / Simulation state
    return {
      accessibility: false,
      overlay: false,
      microphone: true,
      camera: true,
      location: true
    };
  }

  /**
   * Opens Android Accessibility Settings page to enable RAWAT AI service
   */
  public openAccessibilitySettings() {
    if (this.isNativeApp && (window as any).Capacitor?.Plugins?.RawatNativeBridge) {
      (window as any).Capacitor.Plugins.RawatNativeBridge.openAccessibilitySettings();
    } else {
      console.log('[NativeBridge] Opening simulated Accessibility Settings');
    }
  }

  /**
   * Requests Display over other apps (System Alert Window) permission
   */
  public requestOverlayPermission() {
    if (this.isNativeApp && (window as any).Capacitor?.Plugins?.RawatNativeBridge) {
      (window as any).Capacitor.Plugins.RawatNativeBridge.requestOverlayPermission();
    } else {
      console.log('[NativeBridge] Opening simulated Overlay Settings');
    }
  }

  /**
   * Uses Accessibility Service to read active screen tree
   */
  public async readScreenContent(): Promise<string> {
    if (this.isNativeApp && (window as any).Capacitor?.Plugins?.RawatNativeBridge) {
      try {
        const res = await (window as any).Capacitor.Plugins.RawatNativeBridge.readCurrentScreen();
        return res.screenText || 'No screen text captured';
      } catch (e: any) {
        return `Accessibility Error: ${e.message || e}`;
      }
    }

    return "• [Button/Clickable] WhatsApp Chat - +919876543210\n• [Button/Clickable] YouTube Search\n• [Text] Paramveer Rawat AI Assistant";
  }

  /**
   * Simulates automated tap on target screen coordinates
   */
  public async performAutoClick(x: number, y: number): Promise<boolean> {
    if (this.isNativeApp && (window as any).Capacitor?.Plugins?.RawatNativeBridge) {
      try {
        const res = await (window as any).Capacitor.Plugins.RawatNativeBridge.performAutoClick({ x, y });
        return !!res.success;
      } catch {
        return false;
      }
    }
    return true;
  }

  /**
   * Triggers Android Navigation System Actions (Back, Home, Recents, Notifications)
   */
  public async triggerSystemAction(action: 'back' | 'home' | 'recents' | 'notifications' | 'lock_screen'): Promise<boolean> {
    if (this.isNativeApp && (window as any).Capacitor?.Plugins?.RawatNativeBridge) {
      try {
        const res = await (window as any).Capacitor.Plugins.RawatNativeBridge.triggerSystemAction({ action });
        return !!res.success;
      } catch {
        return false;
      }
    }
    return true;
  }
}

export const nativeAndroidBridge = new NativeAndroidBridge();
