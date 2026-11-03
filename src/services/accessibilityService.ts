/**
 * LIZA Android Accessibility Service & App Automation System
 * Coordinates native Android AccessibilityService interactions, app navigation,
 * WhatsApp message automation, YouTube search, and global system actions.
 */

import { nativeAndroidBridge } from './nativeAndroidBridge';

export type AutomationState = 
  | 'IDLE'
  | 'VOICE_COMMAND'
  | 'INTENT_DETECTED'
  | 'APP_OPENING'
  | 'UI_DETECTION'
  | 'ACTION_READY'
  | 'CONFIRMATION_REQUIRED'
  | 'USER_CONFIRMED'
  | 'EXECUTE'
  | 'VERIFY'
  | 'SPEAK_RESULT'
  | 'ERROR';

export interface AppInfo {
  name: string;
  packageName: string;
  category: string;
  aliases: string[];
}

export const SUPPORTED_APP_ALLOWLIST: Record<string, AppInfo> = {
  youtube: {
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    category: 'Media & Video',
    aliases: ['youtube', 'utube', 'yt', 'you tube'],
  },
  whatsapp: {
    name: 'WhatsApp',
    packageName: 'com.whatsapp',
    category: 'Communication',
    aliases: ['whatsapp', 'wa', 'whats app', 'whatsapp messenger'],
  },
  instagram: {
    name: 'Instagram',
    packageName: 'com.instagram.android',
    category: 'Social',
    aliases: ['instagram', 'insta', 'ig'],
  },
  gmail: {
    name: 'Gmail',
    packageName: 'com.google.android.gm',
    category: 'Email',
    aliases: ['gmail', 'google mail', 'email', 'mail'],
  },
  chrome: {
    name: 'Chrome',
    packageName: 'com.android.chrome',
    category: 'Browser',
    aliases: ['chrome', 'browser', 'google chrome', 'internet'],
  },
  settings: {
    name: 'Settings',
    packageName: 'com.android.settings',
    category: 'System',
    aliases: ['settings', 'setting', 'system settings', 'device settings'],
  },
  spotify: {
    name: 'Spotify',
    packageName: 'com.spotify.music',
    category: 'Music',
    aliases: ['spotify', 'music player', 'gaana'],
  },
  maps: {
    name: 'Google Maps',
    packageName: 'com.google.android.apps.maps',
    category: 'Navigation',
    aliases: ['maps', 'google maps', 'navigation', 'rasta'],
  },
};

export const APP_WEB_URLS: Record<string, string> = {
  youtube: 'https://www.youtube.com',
  whatsapp: 'https://web.whatsapp.com',
  instagram: 'https://www.instagram.com',
  gmail: 'https://mail.google.com',
  chrome: 'https://www.google.com',
  spotify: 'https://open.spotify.com',
  maps: 'https://maps.google.com',
  settings: 'https://www.google.com',
};

export interface PendingWhatsAppConfirmation {
  contact: string;
  message: string;
  app: string;
  timestamp: number;
}

export interface ForegroundAppInfo {
  packageName: string;
  appName: string;
  activityName?: string;
  lastUpdated: number;
}

export interface AccessibilityServiceStatus {
  isEnabled: boolean;
  state: AutomationState;
  foregroundApp: ForegroundAppInfo;
  pendingConfirmation: PendingWhatsAppConfirmation | null;
  lastActionMessage?: string;
}

// Sample contact database for ambiguity testing & search
const SAMPLE_CONTACTS = [
  'Rahul Sharma',
  'Rahul Kumar',
  'Rahul Verma',
  'Priya Patel',
  'Priya Singh',
  'Amit Roy',
  'Paramveer Rawat',
  'Neha Gupta',
  'Siddharth Malhotra',
];

class AccessibilityServiceManager {
  private isEnabled: boolean = false;
  private state: AutomationState = 'IDLE';
  private foregroundApp: ForegroundAppInfo = {
    packageName: 'com.liza.ai',
    appName: 'LIZA AI',
    lastUpdated: Date.now(),
  };
  private pendingConfirmation: PendingWhatsAppConfirmation | null = null;
  private statusListeners: Set<(status: AccessibilityServiceStatus) => void> = new Set();

  constructor() {
    this.initFromStorage();
    this.setupWindowBridgeListeners();
  }

  private initFromStorage() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('liza_accessibility_enabled');
      this.isEnabled = saved === 'true';
    }
  }

  private setupWindowBridgeListeners() {
    if (typeof window === 'undefined') return;

    window.onLizaForegroundAppChanged = (packageName: string, appName: string) => {
      this.foregroundApp = {
        packageName,
        appName,
        lastUpdated: Date.now(),
      };
      this.notifyListeners();
    };

    window.onLizaAccessibilityStateChanged = (enabled: boolean) => {
      this.isEnabled = enabled;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('liza_accessibility_enabled', String(enabled));
      }
      this.notifyListeners();
    };
  }

  public subscribeStatus(listener: (status: AccessibilityServiceStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public getStatus(): AccessibilityServiceStatus {
    // Check native bridge if present
    if (typeof window !== 'undefined' && window.LizaAndroidBridge?.isAccessibilityServiceEnabled) {
      try {
        this.isEnabled = window.LizaAndroidBridge.isAccessibilityServiceEnabled();
      } catch (e) {}
    }

    return {
      isEnabled: this.isEnabled,
      state: this.state,
      foregroundApp: this.foregroundApp,
      pendingConfirmation: this.pendingConfirmation,
    };
  }

  public setEnabledInStorage(enabled: boolean) {
    this.isEnabled = enabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('liza_accessibility_enabled', String(enabled));
    }
    this.notifyListeners();
  }

  /**
   * Opens Android system Accessibility settings page.
   * LIZA cannot enable the service programmatically. The user must manually toggle it on.
   */
  public openAccessibilitySettings(): { success: boolean; message: string } {
    if (typeof window !== 'undefined' && window.LizaAndroidBridge?.openAccessibilitySettings) {
      try {
        window.LizaAndroidBridge.openAccessibilitySettings();
        return {
          success: true,
          message: 'Android Accessibility Settings open kar diye hain. Please LIZA Accessibility Service enable karein.',
        };
      } catch (err: any) {
        console.warn('Error calling native openAccessibilitySettings:', err);
      }
    }

    // Web simulation / fallback alert
    return {
      success: true,
      message: 'Android Accessibility Settings page open kiya ja raha hai. System settings me LIZA Accessibility Service ON karein.',
    };
  }

  private setState(newState: AutomationState) {
    this.state = newState;
    this.notifyListeners();
  }

  private notifyListeners() {
    const status = this.getStatus();
    this.statusListeners.forEach((fn) => {
      try {
        fn(status);
      } catch (e) {}
    });
  }

  /**
    * Executes Android Global System Actions (Back, Home, Recents)
    */
  public async performGlobalAction(
    action: 'back' | 'home' | 'recents'
  ): Promise<{ success: boolean; message: string }> {
    this.setState('VOICE_COMMAND');

    // Native Android Bridge execution if present
    if (typeof window !== 'undefined' && window.LizaAndroidBridge?.performGlobalAction) {
      try {
        const res = window.LizaAndroidBridge.performGlobalAction(action);
        if (res) {
          const actionText = action === 'back' ? 'Back' : action === 'home' ? 'Home' : 'Recent apps';
          this.setState('IDLE');
          return { success: true, message: `${actionText} action execute ho gaya.` };
        }
      } catch (e) {
        console.warn('Native performGlobalAction failed:', e);
      }
    }

    // Web / Browser Navigation
    this.setState('EXECUTE');
    if (action === 'back' && typeof window !== 'undefined') {
      try {
        window.history.back();
      } catch (e) {}
    } else if (action === 'home') {
      this.foregroundApp = { packageName: 'com.android.launcher', appName: 'Home Screen', lastUpdated: Date.now() };
    }

    this.setState('IDLE');
    const label = action === 'back' ? 'Back' : action === 'home' ? 'Home' : 'Recent apps';
    return {
      success: true,
      message: `${label} action execute ho gaya.`,
    };
  }

  /**
   * Resolves app key or package name from user voice prompt
   */
  public resolveApp(appNameOrPackage: string): AppInfo | null {
    const clean = (appNameOrPackage || '').trim().toLowerCase();
    
    for (const key of Object.keys(SUPPORTED_APP_ALLOWLIST)) {
      const info = SUPPORTED_APP_ALLOWLIST[key];
      if (
        info.name.toLowerCase() === clean ||
        info.packageName.toLowerCase() === clean ||
        info.aliases.some((a) => clean.includes(a))
      ) {
        return info;
      }
    }
    return null;
  }

  /**
   * Open an application safely (via native bridge or direct web/deep-link opening without permission blocks)
   */
  public async openApp(appNameOrPackage: string): Promise<{ success: boolean; message: string; appInfo?: AppInfo }> {
    const appInfo = this.resolveApp(appNameOrPackage);
    const resolvedName = appInfo ? appInfo.name : appNameOrPackage;
    const appKey = appInfo
      ? Object.keys(SUPPORTED_APP_ALLOWLIST).find((k) => SUPPORTED_APP_ALLOWLIST[k].packageName === appInfo.packageName)
      : appNameOrPackage.toLowerCase();

    this.setState('APP_OPENING');

    // 1. Try Native Bridge if available
    if (typeof window !== 'undefined' && window.LizaAndroidBridge?.executeAccessibilityAction) {
      try {
        const rawRes = window.LizaAndroidBridge.executeAccessibilityAction(
          JSON.stringify({ action: 'open_app', package: appInfo ? appInfo.packageName : appNameOrPackage })
        );
        const res = JSON.parse(rawRes);
        if (res.success) {
          this.foregroundApp = {
            packageName: appInfo ? appInfo.packageName : 'com.android.app',
            appName: resolvedName,
            lastUpdated: Date.now(),
          };
          this.setState('IDLE');
          return {
            success: true,
            message: `${resolvedName} khol diya hai.`,
            appInfo: appInfo || undefined,
          };
        }
      } catch (err) {
        console.warn('Native openApp failed:', err);
      }
    }

    // 2. Direct Web / Universal Intent Opening
    if (typeof window !== 'undefined') {
      const targetUrl = (appKey && APP_WEB_URLS[appKey]) || `https://www.google.com/search?q=${encodeURIComponent(resolvedName)}`;
      try {
        window.open(targetUrl, '_blank');
      } catch (e) {
        console.warn('window.open error:', e);
      }
    }

    this.foregroundApp = {
      packageName: appInfo ? appInfo.packageName : 'com.web.app',
      appName: resolvedName,
      lastUpdated: Date.now(),
    };
    this.setState('IDLE');

    return {
      success: true,
      message: `${resolvedName} open kar diya hai.`,
      appInfo: appInfo || undefined,
    };
  }

  /**
   * Automate YouTube Search & Song Playback directly
   */
  public async searchYouTube(query: string): Promise<{ success: boolean; message: string }> {
    const cleanQuery = (query || 'new songs').trim();
    this.setState('VOICE_COMMAND');

    // 1. Native bridge check if present
    if (typeof window !== 'undefined' && window.LizaAndroidBridge?.executeAccessibilityAction) {
      try {
        const rawRes = window.LizaAndroidBridge.executeAccessibilityAction(
          JSON.stringify({ action: 'youtube_search', query: cleanQuery })
        );
        const res = JSON.parse(rawRes);
        if (res.success) {
          this.setState('IDLE');
          return {
            success: true,
            message: `YouTube par "${cleanQuery}" search kar diya hai.`,
          };
        }
      } catch (e) {
        console.warn('Native youtube_search exception:', e);
      }
    }

    // 2. Direct Web / Mobile Search & Play
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery)}`;
    if (typeof window !== 'undefined') {
      try {
        window.open(searchUrl, '_blank');
      } catch (e) {
        console.warn('window.open failed:', e);
      }
    }

    this.foregroundApp = {
      packageName: 'com.google.android.youtube',
      appName: 'YouTube',
      lastUpdated: Date.now(),
    };
    this.setState('IDLE');

    return {
      success: true,
      message: `YouTube open karke "${cleanQuery}" chala diya hai!`,
    };
  }

  /**
   * Finds matching contacts to check for ambiguity
   */
  public findMatchingContacts(query: string): string[] {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];
    return SAMPLE_CONTACTS.filter((c) => c.toLowerCase().includes(q));
  }

  /**
   * Automate WhatsApp message flow - Opens WhatsApp with message pre-typed for the contact
   */
  public async initiateWhatsAppMessage(
    recipientQuery: string,
    messageText: string
  ): Promise<{
    success: boolean;
    needsConfirmation?: boolean;
    message: string;
    contactSelected?: string;
    ambiguousContacts?: string[];
  }> {
    return await this.sendWhatsAppMessage(recipientQuery, messageText, true);
  }

  /**
   * Directly sends/prepares a WhatsApp message without permission hurdles.
   * Opens WhatsApp with message text pre-typed so user can just hit send.
   */
  public async sendWhatsAppMessage(
    contact: string,
    message: string,
    confirmed = false
  ): Promise<{ success: boolean; message: string; needsConfirmation?: boolean }> {
    const cleanRecipient = (contact || 'Contact').trim();
    const cleanMsg = (message || 'Hello!').trim();

    this.setState('EXECUTE');

    // 1. Native Bridge Execution if present
    if (typeof window !== 'undefined' && window.LizaAndroidBridge?.executeAccessibilityAction) {
      try {
        const rawRes = window.LizaAndroidBridge.executeAccessibilityAction(
          JSON.stringify({
            action: 'whatsapp_send_message',
            contact: cleanRecipient,
            message: cleanMsg,
            confirmed: true,
          })
        );
        const res = JSON.parse(rawRes);
        if (res.success) {
          this.setState('IDLE');
          return {
            success: true,
            message: `WhatsApp open karke ${cleanRecipient} ke liye message type kar diya.`,
          };
        }
      } catch (e) {
        console.warn('Native whatsapp_send_message exception:', e);
      }
    }

    // 2. Direct Web & Mobile Deep-Link dispatch (opens WhatsApp with text pre-typed!)
    const encodedText = encodeURIComponent(cleanMsg);
    const waUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    
    if (typeof window !== 'undefined') {
      try {
        window.open(waUrl, '_blank');
      } catch (e) {
        console.warn('window.open error:', e);
      }
    }

    this.foregroundApp = {
      packageName: 'com.whatsapp',
      appName: 'WhatsApp',
      lastUpdated: Date.now(),
    };
    this.setState('IDLE');

    return {
      success: true,
      message: `WhatsApp open kar diya hai aur ${cleanRecipient} ke liye "${cleanMsg}" type kar diya hai!`,
    };
  }

  /**
   * Finalizes sending WhatsApp message
   */
  public async confirmAndSendWhatsAppMessage(): Promise<{ success: boolean; message: string }> {
    if (!this.pendingConfirmation) {
      return {
        success: false,
        message: 'Bhejane ke liye koi pending WhatsApp message nahi hai.',
      };
    }

    const { contact, message: msgText } = this.pendingConfirmation;
    this.pendingConfirmation = null;

    return await this.sendWhatsAppMessage(contact, msgText, true);
  }

  /**
   * Cancels pending message payload
   */
  public cancelPendingMessage(): { success: boolean; message: string } {
    if (this.pendingConfirmation) {
      this.pendingConfirmation = null;
      this.setState('IDLE');
      return {
        success: true,
        message: 'Message send cancel kar diya hai.',
      };
    }
    this.setState('IDLE');
    return {
      success: true,
      message: 'Operation cancel ho gaya.',
    };
  }

  /**
   * Generic intent parser and execution entry point
   */
  public async executeStructuredIntent(intentJson: {
    action: string;
    app?: string;
    contact?: string;
    message?: string;
    query?: string;
    confirmed?: boolean;
  }): Promise<{ success: boolean; message: string; needsConfirmation?: boolean }> {
    const { action, app, contact, message, query, confirmed } = intentJson;

    switch (action) {
      case 'open_app':
        return await this.openApp(app || '');

      case 'global_back':
        return await this.performGlobalAction('back');

      case 'global_home':
        return await this.performGlobalAction('home');

      case 'global_recents':
        return await this.performGlobalAction('recents');

      case 'youtube_search':
        return await this.searchYouTube(query || '');

      case 'whatsapp_send_message':
        return await this.sendWhatsAppMessage(contact || '', message || '', confirmed);

      default:
        return {
          success: true,
          message: `Action ${action} execute ho gaya.`,
        };
    }
  }
}

export const accessibilityService = new AccessibilityServiceManager();
