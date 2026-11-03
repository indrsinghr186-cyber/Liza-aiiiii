// Service 2: Pocket & Flip Motion Gestures (Shake to Listen, Flip to Mute, Pocket Shield)

export interface MotionGesturesConfig {
  shakeToListen: boolean;
  flipToMute: boolean;
  pocketLock: boolean;
  sensitivity: 'low' | 'medium' | 'high';
}

const GESTURE_STORAGE_KEY = 'liza_motion_gestures_v1';

class MotionGesturesService {
  private config: MotionGesturesConfig = {
    shakeToListen: false,
    flipToMute: true,
    pocketLock: false,
    sensitivity: 'medium'
  };

  private isListeningGestures: boolean = false;
  private lastX: number = 0;
  private lastY: number = 0;
  private lastZ: number = 0;
  private lastShakeTime: number = 0;
  private listeners: {
    onShake?: () => void;
    onFlipFaceDown?: () => void;
    onFlipFaceUp?: () => void;
  } = {};

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(GESTURE_STORAGE_KEY);
      if (saved) {
        try {
          this.config = { ...this.config, ...JSON.parse(saved) };
        } catch {}
      }
    }
  }

  public getConfig(): MotionGesturesConfig {
    return { ...this.config };
  }

  public updateConfig(newCfg: Partial<MotionGesturesConfig>) {
    this.config = { ...this.config, ...newCfg };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(GESTURE_STORAGE_KEY, JSON.stringify(this.config));
    }
  }

  public startListening(callbacks: {
    onShake?: () => void;
    onFlipFaceDown?: () => void;
    onFlipFaceUp?: () => void;
  }) {
    this.listeners = callbacks;
    if (this.isListeningGestures || typeof window === 'undefined') return;

    // 1. Device Motion (Shake Detection)
    if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', this.handleMotion);
    }

    // 2. Device Orientation (Flip Face-down Detection)
    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', this.handleOrientation);
    }

    this.isListeningGestures = true;
  }

  public stopListening() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('devicemotion', this.handleMotion);
    window.removeEventListener('deviceorientation', this.handleOrientation);
    this.isListeningGestures = false;
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    if (!this.config.shakeToListen) return;
    const acc = event.accelerationIncludingGravity;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    const deltaX = Math.abs(acc.x - this.lastX);
    const deltaY = Math.abs(acc.y - this.lastY);
    const deltaZ = Math.abs(acc.z - this.lastZ);

    const threshold = this.config.sensitivity === 'high' ? 14 : this.config.sensitivity === 'low' ? 24 : 18;

    if (deltaX + deltaY + deltaZ > threshold) {
      const now = Date.now();
      if (now - this.lastShakeTime > 1500) {
        this.lastShakeTime = now;
        this.listeners.onShake?.();
      }
    }

    this.lastX = acc.x;
    this.lastY = acc.y;
    this.lastZ = acc.z;
  };

  private handleOrientation = (event: DeviceOrientationEvent) => {
    if (!this.config.flipToMute) return;
    const beta = event.beta; // X-axis [-180, 180]
    const gamma = event.gamma; // Y-axis [-90, 90]

    // Phone face-down check: beta is around 180 or -180
    if (beta !== null && (Math.abs(beta) > 160 || (Math.abs(gamma || 0) > 80 && Math.abs(beta) > 130))) {
      this.listeners.onFlipFaceDown?.();
    } else if (beta !== null && Math.abs(beta) < 45) {
      this.listeners.onFlipFaceUp?.();
    }
  };
}

export const motionGesturesService = new MotionGesturesService();
