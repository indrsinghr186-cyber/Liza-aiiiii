// Service 4: Offline Smart Quick Actions (Zero-Data Mode)

export interface OfflineActionStatus {
  flashlight: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
  isOnline: boolean;
  vibrationSupported: boolean;
}

class OfflineSmartActionsService {
  private flashlightOn: boolean = false;
  private mediaStreamTrack: MediaStreamTrack | null = null;

  public async toggleFlashlight(): Promise<boolean> {
    try {
      if (this.flashlightOn && this.mediaStreamTrack) {
        this.mediaStreamTrack.stop();
        this.mediaStreamTrack = null;
        this.flashlightOn = false;
        return false;
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        const track = stream.getVideoTracks()[0];
        const capabilities = (track.getCapabilities?.() as any) || {};
        if (capabilities.torch) {
          await (track as any).applyConstraints({
            advanced: [{ torch: true }]
          });
          this.mediaStreamTrack = track;
          this.flashlightOn = true;
          return true;
        } else {
          // Screen flash fallback
          this.flashlightOn = !this.flashlightOn;
          return this.flashlightOn;
        }
      }
    } catch {
      this.flashlightOn = !this.flashlightOn;
    }
    return this.flashlightOn;
  }

  public triggerHapticVibrate(pattern: number | number[] = 50) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }

  public async getBatteryInfo(): Promise<{ level: number; charging: boolean } | null> {
    if (typeof navigator !== 'undefined' && 'getBattery' in (navigator as any)) {
      try {
        const batt = await (navigator as any).getBattery();
        return {
          level: Math.round(batt.level * 100),
          charging: batt.charging
        };
      } catch {}
    }
    return null;
  }

  public getNetworkStatus(): boolean {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  }

  public isFlashlightActive(): boolean {
    return this.flashlightOn;
  }
}

export const offlineSmartActionsService = new OfflineSmartActionsService();
