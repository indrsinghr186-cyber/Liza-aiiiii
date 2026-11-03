// Service 1: Dynamic Island & Floating Bubble Overlay for Mobile Multitasking

export interface DynamicIslandNotification {
  id: string;
  type: 'call' | 'timer' | 'music' | 'voice_memo' | 'routine' | 'alert';
  title: string;
  subtitle: string;
  iconType: string;
  durationSec?: number;
  timestamp: number;
}

const STORAGE_KEY = 'liza_dynamic_island_v1';

class DynamicIslandService {
  private isFloatingBubbleEnabled: boolean = false;
  private isExpanded: boolean = false;
  private activeNotification: DynamicIslandNotification | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.isFloatingBubbleEnabled = parsed.enabled ?? false;
        } catch {}
      }
    }
  }

  public getStatus() {
    return {
      isEnabled: this.isFloatingBubbleEnabled,
      isExpanded: this.isExpanded,
      activeNotification: this.activeNotification
    };
  }

  public toggleFloatingBubble(enabled: boolean) {
    this.isFloatingBubbleEnabled = enabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: this.isFloatingBubbleEnabled }));
    }
    this.notify();
  }

  public setExpanded(expanded: boolean) {
    this.isExpanded = expanded;
    this.notify();
  }

  public triggerNotification(notif: Omit<DynamicIslandNotification, 'id' | 'timestamp'>) {
    const fullNotif: DynamicIslandNotification = {
      ...notif,
      id: `island_${Date.now()}`,
      timestamp: Date.now()
    };
    this.activeNotification = fullNotif;
    this.isExpanded = true;
    this.notify();

    // Auto-collapse after 5 seconds if not persistent
    if (notif.type !== 'timer' && notif.type !== 'voice_memo') {
      setTimeout(() => {
        if (this.activeNotification?.id === fullNotif.id) {
          this.isExpanded = false;
          this.notify();
        }
      }, 5000);
    }
  }

  public clearNotification() {
    this.activeNotification = null;
    this.isExpanded = false;
    this.notify();
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }
}

export const dynamicIslandService = new DynamicIslandService();
