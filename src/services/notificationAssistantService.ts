/**
 * LIZA Notification Assistant 🔔
 * On-demand notification listener and summarizer with strict privacy filter
 * (never speaks OTPs, banking data, passwords or private credentials aloud).
 */

export type NotificationPriority = 'HIGH' | 'NORMAL' | 'LOW';

export interface LizaNotification {
  id: string;
  appName: string;
  packageName: string;
  title: string;
  content: string;
  timestamp: number;
  priority: NotificationPriority;
  isSensitive: boolean;
  category: 'reminder' | 'call' | 'message' | 'promo' | 'system' | 'sensitive';
  isDismissed: boolean;
}

export interface NotificationStatus {
  isEnabled: boolean;
  hasPermission: boolean;
  totalPendingCount: number;
  highPriorityCount: number;
  sensitiveCount: number;
  lastSummarizedAt?: number;
}

const SENSITIVE_PATTERNS = [
  /\b\d{4,8}\b/, // OTP-like numbers
  /otp|one time password|verification code/i,
  /password|passcode|secret pin|login pin/i,
  /bank|account|ac no|a\/c|debit|credit|cvv|card ending/i,
  /rs\.?\s*\d+|inr\s*\d+|\$\s*\d+|credited|debited|balance/i,
  /auth token|bearer|api key|credentials/i,
];

class NotificationAssistantManager {
  private isEnabled: boolean = false;
  private hasPermission: boolean = false;
  private notifications: LizaNotification[] = [];
  private listeners: Set<(status: NotificationStatus) => void> = new Set();

  constructor() {
    this.initFromStorage();
    this.setupSimulationSeed();
  }

  private initFromStorage() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('liza_notification_assistant_enabled');
      this.isEnabled = saved === 'true';
      const savedPerm = localStorage.getItem('liza_notification_permission_granted');
      this.hasPermission = savedPerm === 'true';
    }
  }

  private setupSimulationSeed() {
    // Seed initial realistic notifications for simulation & testing
    const now = Date.now();
    this.notifications = [
      {
        id: 'notif-1',
        appName: 'Calendar',
        packageName: 'com.google.android.calendar',
        title: 'Meeting in 15 mins',
        content: 'Project sync with Paramveer Rawat and AI Core Team',
        timestamp: now - 10 * 60 * 1000,
        priority: 'HIGH',
        isSensitive: false,
        category: 'reminder',
        isDismissed: false,
      },
      {
        id: 'notif-2',
        appName: 'WhatsApp',
        packageName: 'com.whatsapp',
        title: 'Rahul Sharma',
        content: 'Bhai files check kar li, client presentation ready hai.',
        timestamp: now - 25 * 60 * 1000,
        priority: 'NORMAL',
        isSensitive: false,
        category: 'message',
        isDismissed: false,
      },
      {
        id: 'notif-3',
        appName: 'HDFC Bank',
        packageName: 'com.hdfc.bank',
        title: 'Bank Alert: Transaction OTP',
        content: 'Your secret OTP for transaction of Rs. 4,500 is 982341. Do not share with anyone.',
        timestamp: now - 5 * 60 * 1000,
        priority: 'HIGH',
        isSensitive: true,
        category: 'sensitive',
        isDismissed: false,
      },
      {
        id: 'notif-4',
        appName: 'YouTube',
        packageName: 'com.google.android.youtube',
        title: 'New Video Uploaded',
        content: 'Tech Trends 2026: Next-Gen Autonomous AI just dropped.',
        timestamp: now - 45 * 60 * 1000,
        priority: 'LOW',
        isSensitive: false,
        category: 'promo',
        isDismissed: false,
      }
    ];
  }

  public subscribe(listener: (status: NotificationStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach((fn) => {
      try { fn(status); } catch (e) {}
    });
  }

  public getStatus(): NotificationStatus {
    const active = this.notifications.filter(n => !n.isDismissed);
    return {
      isEnabled: this.isEnabled,
      hasPermission: this.hasPermission,
      totalPendingCount: active.length,
      highPriorityCount: active.filter(n => n.priority === 'HIGH').length,
      sensitiveCount: active.filter(n => n.isSensitive).length,
    };
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('liza_notification_assistant_enabled', String(enabled));
    }
    if (enabled && !this.hasPermission) {
      // Prompt user to enable notification listener permission
      this.hasPermission = true;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('liza_notification_permission_granted', 'true');
      }
    }
    this.notify();
  }

  public requestPermission(): { success: boolean; message: string } {
    if (typeof window !== 'undefined' && window.LizaAndroidBridge?.openAccessibilitySettings) {
      try {
        window.LizaAndroidBridge.openAccessibilitySettings();
      } catch (e) {}
    }
    this.hasPermission = true;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('liza_notification_permission_granted', 'true');
    }
    this.notify();
    return {
      success: true,
      message: 'Android Notification Listener access settings opened. Toggle on LIZA Notification Assistant.',
    };
  }

  /**
   * Evaluates if a notification contains private/banking/OTP secrets
   */
  public isContentSensitive(title: string, content: string): boolean {
    const combined = `${title} ${content}`.toLowerCase();
    return SENSITIVE_PATTERNS.some(regex => regex.test(combined));
  }

  /**
   * Categorize notification priority
   */
  public categorizePriority(appName: string, title: string, isSensitive: boolean): NotificationPriority {
    if (isSensitive) return 'HIGH';
    const highApps = ['calendar', 'phone', 'call', 'reminder', 'clock', 'alarm'];
    if (highApps.some(a => appName.toLowerCase().includes(a) || title.toLowerCase().includes(a))) {
      return 'HIGH';
    }
    const lowApps = ['promo', 'discount', 'sale', 'shopping', 'offer', 'game', 'ad'];
    if (lowApps.some(a => title.toLowerCase().includes(a))) {
      return 'LOW';
    }
    return 'NORMAL';
  }

  /**
   * Ingest a notification from Android Listener Bridge
   */
  public addNotification(notif: { appName: string; packageName: string; title: string; content: string }) {
    if (!this.isEnabled) return;

    const isSensitive = this.isContentSensitive(notif.title, notif.content);
    const priority = this.categorizePriority(notif.appName, notif.title, isSensitive);

    const newNotif: LizaNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      appName: notif.appName,
      packageName: notif.packageName,
      title: notif.title,
      content: notif.content,
      timestamp: Date.now(),
      priority,
      isSensitive,
      category: isSensitive ? 'sensitive' : priority === 'HIGH' ? 'reminder' : 'message',
      isDismissed: false,
    };

    this.notifications.unshift(newNotif);
    this.notify();
  }

  public getActiveNotifications(): LizaNotification[] {
    return this.notifications.filter(n => !n.isDismissed);
  }

  public dismissNotification(id: string) {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, isDismissed: true } : n);
    this.notify();
  }

  public clearAll() {
    this.notifications = [];
    this.notify();
  }

  /**
   * Generates a spoken Hindi/Hinglish summary when user asks "Liza, koi important notification hai?"
   * Strictly adheres to privacy: never speaks sensitive text aloud.
   */
  public generateSpeechSummary(filter: 'all' | 'high_only' = 'high_only'): {
    speechText: string;
    itemsSummarized: number;
    hasSensitiveSuppressed: boolean;
    rawItems: Array<{ app: string; title: string; preview: string; isSensitive: boolean }>;
  } {
    if (!this.isEnabled) {
      return {
        speechText: 'Notification Assistant currently OFF hai. Aap settings ya swipe Function Panel se ise ON kar sakte hain.',
        itemsSummarized: 0,
        hasSensitiveSuppressed: false,
        rawItems: [],
      };
    }

    const active = this.getActiveNotifications();
    if (active.length === 0) {
      return {
        speechText: 'Boss, abhi koi naya pending notification nahi hai.',
        itemsSummarized: 0,
        hasSensitiveSuppressed: false,
        rawItems: [],
      };
    }

    const relevant = filter === 'high_only'
      ? active.filter(n => n.priority === 'HIGH' || n.priority === 'NORMAL')
      : active;

    const sensitiveItems = relevant.filter(n => n.isSensitive);
    const safeItems = relevant.filter(n => !n.isSensitive);

    const summaries: string[] = [];

    // Safe summary lines
    safeItems.forEach(item => {
      summaries.push(`${item.appName} se: "${item.title}"`);
    });

    let speech = '';
    if (relevant.length === 1) {
      speech = `Haan boss, 1 notification hai: ${summaries.join('. ')}.`;
    } else {
      speech = `Haan boss, ${relevant.length} notifications hain. ${summaries.slice(0, 3).join('. ')}.`;
    }

    // Sensitive privacy guard speech announcement
    if (sensitiveItems.length > 0) {
      speech += ` Aur Liza ko ek sensitive notification mila hai (${sensitiveItems[0].appName} se), lekin privacy ke liye main iska private content aloud nahi padhungi.`;
    }

    return {
      speechText: speech,
      itemsSummarized: relevant.length,
      hasSensitiveSuppressed: sensitiveItems.length > 0,
      rawItems: relevant.map(r => ({
        app: r.appName,
        title: r.title,
        preview: r.isSensitive ? '[SENSITIVE CONTENT SUPPRESSED]' : r.content,
        isSensitive: r.isSensitive,
      }))
    };
  }
}

export const notificationAssistantService = new NotificationAssistantManager();
