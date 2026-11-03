/**
 * LIZA Continuous App Context Engine 📱
 * Tracks foreground application state, active task chains, and provides context-aware command flow
 * with strict user privacy protection (no continuous screen recording or sensitive data storage).
 */

export type SupportedApp = 
  | 'LIZA'
  | 'WhatsApp'
  | 'YouTube'
  | 'Chrome'
  | 'Gmail'
  | 'Settings'
  | 'Gallery'
  | 'Camera'
  | 'Spotify'
  | 'Maps'
  | 'Unknown';

export type TaskState = 
  | 'IDLE'
  | 'APP_OPEN'
  | 'SEARCHING'
  | 'SEARCH_RESULTS_OPEN'
  | 'ITEM_SELECTED'
  | 'MESSAGE_DRAFTING'
  | 'CONFIRMATION_PENDING'
  | 'COMPLETED';

export interface AppContextState {
  currentApp: SupportedApp;
  packageName: string;
  currentTask: string | null;
  taskState: TaskState;
  taskData: Record<string, any>;
  lastUpdated: number;
  isContextMemoryActive: boolean;
}

export interface AppContextListener {
  (context: AppContextState): void;
}

class AppContextManager {
  private currentApp: SupportedApp = 'LIZA';
  private packageName: string = 'com.liza.ai';
  private currentTask: string | null = null;
  private taskState: TaskState = 'IDLE';
  private taskData: Record<string, any> = {};
  private lastUpdated: number = Date.now();
  private isContextMemoryActive: boolean = true;
  private contextTimeoutId: any = null;

  private listeners: Set<AppContextListener> = new Set();

  constructor() {
    this.initFromStorage();
    this.setupNativeBridgeListener();
  }

  private initFromStorage() {
    if (typeof localStorage !== 'undefined') {
      const savedMemoryPref = localStorage.getItem('liza_app_context_memory_enabled');
      if (savedMemoryPref !== null) {
        this.isContextMemoryActive = savedMemoryPref === 'true';
      }
    }
  }

  private setupNativeBridgeListener() {
    if (typeof window === 'undefined') return;

    // Listen to native Android foreground changes
    const originalHandler = window.onLizaForegroundAppChanged;
    window.onLizaForegroundAppChanged = (pkgName: string, appName: string) => {
      if (originalHandler) {
        try { originalHandler(pkgName, appName); } catch (e) {}
      }
      this.updateForegroundApp(pkgName, appName);
    };
  }

  public subscribe(listener: AppContextListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => {
      try { fn(state); } catch (e) {}
    });
  }

  public getState(): AppContextState {
    return {
      currentApp: this.currentApp,
      packageName: this.packageName,
      currentTask: this.currentTask,
      taskState: this.taskState,
      taskData: this.taskData,
      lastUpdated: this.lastUpdated,
      isContextMemoryActive: this.isContextMemoryActive,
    };
  }

  public setContextMemoryActive(active: boolean) {
    this.isContextMemoryActive = active;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('liza_app_context_memory_enabled', String(active));
    }
    if (!active) {
      this.clearTask();
    }
    this.notify();
  }

  public updateForegroundApp(pkgName: string, appName: string) {
    const appMap: Record<string, SupportedApp> = {
      'com.google.android.youtube': 'YouTube',
      'com.whatsapp': 'WhatsApp',
      'com.android.chrome': 'Chrome',
      'com.google.android.gm': 'Gmail',
      'com.android.settings': 'Settings',
      'com.google.android.apps.photos': 'Gallery',
      'com.android.gallery3d': 'Gallery',
      'com.google.android.GoogleCamera': 'Camera',
      'com.spotify.music': 'Spotify',
      'com.google.android.apps.maps': 'Maps',
      'com.liza.ai': 'LIZA',
    };

    const detected = appMap[pkgName] || (appName as SupportedApp) || 'Unknown';
    
    // If user explicitly switched to a different app, update context
    if (this.packageName !== pkgName) {
      this.currentApp = detected;
      this.packageName = pkgName;
      this.lastUpdated = Date.now();
      
      // If task belongs to an old app, clear task state
      if (this.taskData.targetApp && this.taskData.targetApp !== detected) {
        this.clearTask();
      }
      this.notify();
    }
  }

  public setAppManually(app: SupportedApp, pkg?: string) {
    const pkgMap: Record<SupportedApp, string> = {
      'LIZA': 'com.liza.ai',
      'YouTube': 'com.google.android.youtube',
      'WhatsApp': 'com.whatsapp',
      'Chrome': 'com.android.chrome',
      'Gmail': 'com.google.android.gm',
      'Settings': 'com.android.settings',
      'Gallery': 'com.google.android.apps.photos',
      'Camera': 'com.google.android.GoogleCamera',
      'Spotify': 'com.spotify.music',
      'Maps': 'com.google.android.apps.maps',
      'Unknown': 'com.unknown.app',
    };

    this.currentApp = app;
    this.packageName = pkg || pkgMap[app] || 'com.unknown.app';
    this.lastUpdated = Date.now();
    this.notify();
  }

  public startTask(taskDescription: string, initialState: TaskState = 'APP_OPEN', data: Record<string, any> = {}) {
    if (!this.isContextMemoryActive) return;

    this.currentTask = taskDescription;
    this.taskState = initialState;
    this.taskData = {
      ...data,
      targetApp: this.currentApp,
      startedAt: Date.now(),
    };
    this.lastUpdated = Date.now();

    // Auto-expire task context after 5 minutes of inactivity
    if (this.contextTimeoutId) clearTimeout(this.contextTimeoutId);
    this.contextTimeoutId = setTimeout(() => {
      this.clearTask();
    }, 5 * 60 * 1000);

    this.notify();
  }

  public updateTaskState(newState: TaskState, additionalData: Record<string, any> = {}) {
    if (!this.isContextMemoryActive) return;

    this.taskState = newState;
    this.taskData = { ...this.taskData, ...additionalData };
    this.lastUpdated = Date.now();

    if (newState === 'COMPLETED') {
      // Clear after brief delay
      setTimeout(() => this.clearTask(), 2000);
    } else {
      this.notify();
    }
  }

  public clearTask() {
    this.currentTask = null;
    this.taskState = 'IDLE';
    this.taskData = {};
    this.lastUpdated = Date.now();
    if (this.contextTimeoutId) {
      clearTimeout(this.contextTimeoutId);
      this.contextTimeoutId = null;
    }
    this.notify();
  }

  /**
   * Generates real-time continuous prompt context for Gemini / LIZA decision engine
   */
  public getPromptContextSnippet(): string {
    if (!this.isContextMemoryActive) {
      return `CURRENT FOREGROUND APP: ${this.currentApp}`;
    }

    return `
[CONTINUOUS APP CONTEXT]:
- Active Foreground App: ${this.currentApp} (${this.packageName})
- Current Chained Task: ${this.currentTask || 'None (Idle)'}
- Task Automation State: ${this.taskState}
- Context Memory Active: ${this.isContextMemoryActive ? 'YES' : 'NO'}
${this.taskData.searchQuery ? `- Last Search Query: "${this.taskData.searchQuery}"` : ''}
${this.taskData.selectedItem ? `- Selected Item/Video: "${this.taskData.selectedItem}"` : ''}
*RULE: If user issues a follow-up command (e.g. "Ab Minecraft search karo", "Pehla result kholo", "Back karo"), resolve it using this active app context without asking redundant questions.*
    `.trim();
  }

  /**
   * Evaluates if user command is a contextual follow-up within current app
   */
  public evaluateContextualCommand(userQuery: string): {
    isContextual: boolean;
    suggestedAction?: string;
    resolvedQuery?: string;
  } {
    const q = (userQuery || '').toLowerCase().trim();

    // 1. YouTube Contextual Follow-ups
    if (this.currentApp === 'YouTube') {
      if (q.startsWith('ab ') || q.includes('search karo') || q.includes('search ') || q.includes('dhoondo')) {
        const cleaned = q.replace(/^(ab |aur |phir )/i, '').replace(/(search karo|dhoondo|search kar do)/i, '').trim();
        return {
          isContextual: true,
          suggestedAction: 'youtube_search',
          resolvedQuery: cleaned || q
        };
      }
      if (q.includes('pehla result') || q.includes('first video') || q.includes('pehla video') || q.includes('top result')) {
        return {
          isContextual: true,
          suggestedAction: 'youtube_open_first_result',
        };
      }
    }

    // 2. Global Back / Home
    if (q === 'back karo' || q === 'piche jao' || q === 'go back' || q === 'back') {
      return {
        isContextual: true,
        suggestedAction: 'global_back'
      };
    }

    if (q === 'cancel' || q === 'ruk jao' || q === 'stop') {
      this.clearTask();
      return {
        isContextual: true,
        suggestedAction: 'cancel_task'
      };
    }

    return { isContextual: false };
  }
}

export const appContextService = new AppContextManager();
