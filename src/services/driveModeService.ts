// Service 7: Drive & Commute Mode (Hands-Free Big-Button & Caller Announcer)

export interface DriveModeState {
  isActive: boolean;
  speedKmh: number;
  autoReplyText: string;
  autoAnnounceCalls: boolean;
  highContrastMode: boolean;
  lastSimulatedCall?: {
    callerName: string;
    callerNumber: string;
    timestamp: number;
  };
}

const STORAGE_KEY = 'liza_drive_mode_v1';

class DriveModeService {
  private state: DriveModeState = {
    isActive: false,
    speedKmh: 0,
    autoReplyText: "I am driving right now. I will call you back once I park safely. - Sent via RAWAT AI",
    autoAnnounceCalls: true,
    highContrastMode: true
  };

  private listeners: Set<() => void> = new Set();
  private watchId: number | null = null;

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          this.state = { ...this.state, ...JSON.parse(saved) };
        } catch {}
      }
    }
  }

  public getState(): DriveModeState {
    return { ...this.state };
  }

  public toggleDriveMode(active?: boolean): boolean {
    this.state.isActive = active !== undefined ? active : !this.state.isActive;
    
    if (this.state.isActive) {
      this.startGpsSpeedometer();
    } else {
      this.stopGpsSpeedometer();
    }

    this.save();
    this.notify();
    return this.state.isActive;
  }

  public updateConfig(patch: Partial<DriveModeState>) {
    this.state = { ...this.state, ...patch };
    this.save();
    this.notify();
  }

  private startGpsSpeedometer() {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        this.watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const speed = pos.coords.speed; // meters/second
            if (speed !== null && !isNaN(speed)) {
              this.state.speedKmh = Math.round(speed * 3.6);
            } else {
              this.state.speedKmh = 42; // Simulation fallback
            }
            this.notify();
          },
          () => {
            this.state.speedKmh = 35; // Simulated commute speed
            this.notify();
          },
          { enableHighAccuracy: true }
        );
      } catch {
        this.state.speedKmh = 30;
      }
    }
  }

  private stopGpsSpeedometer() {
    if (this.watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.state.speedKmh = 0;
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private save() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    }
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }
}

export const driveModeService = new DriveModeService();
