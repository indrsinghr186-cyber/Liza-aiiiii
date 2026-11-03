/**
 * LIZA AI — Windows 11 Desktop Companion Client Service
 * Communicates with local companion agent on http://127.0.0.1:8765
 * Designed for Dell Latitude 7420 (Paramveer Rawat)
 */

export interface SystemTelemetry {
  device: string;
  owner: string;
  os: string;
  battery: {
    percent: number;
    power_plugged: boolean;
    secsleft: number;
  };
  cpu_percent: number;
  memory_percent: number;
  memory_used_gb?: number;
  memory_total_gb?: number;
  cpu_freq_ghz?: number;
  package_temp_c?: number;
  gpu_percent?: number;
  active_window: string;
  volume: number;
}

export interface SystemHealthDataPoint {
  timestamp: number;
  timeStr: string;
  cpu: number;
  gpu: number;
  ram: number;
  temp: number;
  cpuFreq: number;
}

export type CompanionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

class WindowsCompanionService {
  private baseUrl: string = 'http://127.0.0.1:8765';
  private token: string = 'liza-paramveer-dell-7420';
  private status: CompanionStatus = 'disconnected';
  private telemetry: SystemTelemetry | null = null;
  private listeners: Set<(status: CompanionStatus, telemetry: SystemTelemetry | null) => void> = new Set();
  private healthListeners: Set<(history: SystemHealthDataPoint[], current: SystemHealthDataPoint) => void> = new Set();
  private pollInterval: any = null;
  private healthInterval: any = null;
  private healthHistory: SystemHealthDataPoint[] = [];
  private readonly MAX_HISTORY_POINTS = 30;

  constructor() {
    this.seedInitialHistory();
    this.startHeartbeat();
    this.startHealthPolling();
  }

  private seedInitialHistory() {
    const now = Date.now();
    for (let i = this.MAX_HISTORY_POINTS - 1; i >= 0; i--) {
      const time = new Date(now - i * 1000);
      const timeStr = time.toTimeString().split(' ')[0];
      const baseCpu = 24 + Math.sin(i * 0.4) * 8 + (Math.random() * 4 - 2);
      const baseGpu = 16 + Math.cos(i * 0.3) * 6 + (Math.random() * 3 - 1.5);
      const baseRam = 62 + (Math.random() * 2 - 1);
      const baseTemp = 51 + (Math.sin(i * 0.2) * 3);
      const baseFreq = 3.1 + Math.sin(i * 0.5) * 0.4;
      this.healthHistory.push({
        timestamp: time.getTime(),
        timeStr,
        cpu: Math.max(5, Math.min(100, Math.round(baseCpu))),
        gpu: Math.max(2, Math.min(100, Math.round(baseGpu))),
        ram: Math.max(10, Math.min(100, Math.round(baseRam))),
        temp: Math.round(baseTemp * 10) / 10,
        cpuFreq: Math.round(baseFreq * 100) / 100,
      });
    }
  }

  public subscribe(listener: (status: CompanionStatus, telemetry: SystemTelemetry | null) => void) {
    this.listeners.add(listener);
    listener(this.status, this.telemetry);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeHealth(listener: (history: SystemHealthDataPoint[], current: SystemHealthDataPoint) => void) {
    this.healthListeners.add(listener);
    if (this.healthHistory.length > 0) {
      listener(this.healthHistory, this.healthHistory[this.healthHistory.length - 1]);
    }
    return () => {
      this.healthListeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.status, this.telemetry);
    }
  }

  private notifyHealth(current: SystemHealthDataPoint) {
    for (const listener of this.healthListeners) {
      listener(this.healthHistory, current);
    }
  }

  public getStatus(): CompanionStatus {
    return this.status;
  }

  public getTelemetry(): SystemTelemetry | null {
    return this.telemetry;
  }

  public getHealthHistory(): SystemHealthDataPoint[] {
    return [...this.healthHistory];
  }

  public clearHealthHistory(): void {
    this.healthHistory = [];
    this.seedInitialHistory();
    if (this.healthHistory.length > 0) {
      this.notifyHealth(this.healthHistory[this.healthHistory.length - 1]);
    }
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        this.status = 'connected';
        await this.fetchTelemetry();
        return true;
      }
    } catch {
      this.status = 'disconnected';
    }
    this.notify();
    return false;
  }

  public async fetchTelemetry(): Promise<SystemTelemetry | null> {
    try {
      const res = await fetch(`${this.baseUrl}/status`, {
        headers: {
          'X-LIZA-TOKEN': this.token
        },
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        this.telemetry = data;
        this.status = 'connected';
        this.recordHealthPointFromTelemetry(data);
        this.notify();
        return data;
      }
    } catch {
      // Non-blocking
    }
    return null;
  }

  private recordHealthPointFromTelemetry(data: SystemTelemetry) {
    const now = new Date();
    const point: SystemHealthDataPoint = {
      timestamp: now.getTime(),
      timeStr: now.toTimeString().split(' ')[0],
      cpu: Math.round(data.cpu_percent),
      gpu: Math.round(data.gpu_percent ?? Math.min(100, data.cpu_percent * 0.75 + 6)),
      ram: Math.round(data.memory_percent),
      temp: data.package_temp_c ?? 52.0,
      cpuFreq: data.cpu_freq_ghz ?? 3.0,
    };
    this.pushHealthPoint(point);
  }

  private pushHealthPoint(point: SystemHealthDataPoint) {
    this.healthHistory.push(point);
    if (this.healthHistory.length > this.MAX_HISTORY_POINTS) {
      this.healthHistory.shift();
    }
    this.notifyHealth(point);
  }

  private startHealthPolling() {
    if (this.healthInterval) clearInterval(this.healthInterval);
    this.healthInterval = setInterval(() => {
      if (this.status === 'connected' && this.telemetry) {
        // Connected mode: fetch fresh telemetry or record
        this.fetchTelemetry();
      } else {
        // Dell Latitude 7420 simulated telemetry tick for smooth real-time visualization
        const last = this.healthHistory[this.healthHistory.length - 1];
        const now = new Date();
        const deltaCpu = (Math.random() - 0.5) * 6;
        const newCpu = Math.max(12, Math.min(88, Math.round((last ? last.cpu : 25) + deltaCpu)));
        
        const deltaGpu = (Math.random() - 0.5) * 5;
        const newGpu = Math.max(5, Math.min(75, Math.round((last ? last.gpu : 18) + deltaGpu)));

        const deltaRam = (Math.random() - 0.5) * 0.5;
        const newRam = Math.max(55, Math.min(78, Math.round((last ? last.ram : 62) + deltaRam)));

        const newTemp = Math.round((50 + (newCpu * 0.16) + (Math.random() * 2 - 1)) * 10) / 10;
        const newFreq = Math.round((2.6 + (newCpu / 100) * 1.8 + (Math.random() * 0.2 - 0.1)) * 100) / 100;

        const point: SystemHealthDataPoint = {
          timestamp: now.getTime(),
          timeStr: now.toTimeString().split(' ')[0],
          cpu: newCpu,
          gpu: newGpu,
          ram: newRam,
          temp: Math.max(38, Math.min(85, newTemp)),
          cpuFreq: Math.max(1.8, Math.min(4.8, newFreq)),
        };
        this.pushHealthPoint(point);
      }
    }, 1000);
  }

  private startHeartbeat() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.checkHealth();
    this.pollInterval = setInterval(() => {
      this.checkHealth();
    }, 4000);
  }

  // --- Remote Execution APIs ---

  public async mouseControl(params: {
    action: 'move' | 'click' | 'double_click' | 'right_click' | 'middle_click' | 'scroll' | 'drag';
    dx?: number;
    dy?: number;
    x?: number;
    y?: number;
    button?: string;
    scroll_amount?: number;
  }): Promise<{ success: boolean; message?: string; [key: string]: any }> {
    try {
      const res = await fetch(`${this.baseUrl}/mouse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LIZA-TOKEN': this.token
        },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: `Companion connection failed: ${err.message}` };
    }
  }

  public async keyboardControl(params: {
    action: 'type' | 'hotkey' | 'press';
    text?: string;
    hotkey?: string;
    key?: string;
  }): Promise<{ success: boolean; message?: string; [key: string]: any }> {
    try {
      const res = await fetch(`${this.baseUrl}/keyboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LIZA-TOKEN': this.token
        },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: `Keyboard command failed: ${err.message}` };
    }
  }

  public async windowControl(action: 'close' | 'minimize' | 'maximize' | 'restore' | 'switch'): Promise<{ success: boolean; message?: string; [key: string]: any }> {
    try {
      const res = await fetch(`${this.baseUrl}/window`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LIZA-TOKEN': this.token
        },
        body: JSON.stringify({ action })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: `Window action failed: ${err.message}` };
    }
  }

  public async launchApp(appName: string, url?: string): Promise<{ success: boolean; message?: string; [key: string]: any }> {
    try {
      const res = await fetch(`${this.baseUrl}/apps/launch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LIZA-TOKEN': this.token
        },
        body: JSON.stringify({ app_name: appName, url })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: `Launch app failed: ${err.message}` };
    }
  }

  public async closeApp(appName: string): Promise<{ success: boolean; message?: string; [key: string]: any }> {
    try {
      const res = await fetch(`${this.baseUrl}/apps/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LIZA-TOKEN': this.token
        },
        body: JSON.stringify({ app_name: appName })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: `Close app failed: ${err.message}` };
    }
  }

  public async systemControl(params: {
    action: 'volume_up' | 'volume_down' | 'set_volume' | 'mute' | 'unmute' | 'set_brightness' | 'lock' | 'sleep';
    value?: number;
    confirmed?: boolean;
  }): Promise<{ success: boolean; message?: string; [key: string]: any }> {
    try {
      const res = await fetch(`${this.baseUrl}/system/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LIZA-TOKEN': this.token
        },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: `System control failed: ${err.message}` };
    }
  }

  public async captureScreen(): Promise<{ success: boolean; base64?: string; format?: string; active_window?: string; message?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/screen/capture`, {
        method: 'POST',
        headers: {
          'X-LIZA-TOKEN': this.token
        }
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: `Screen capture failed: ${err.message}` };
    }
  }

  public async fileControl(params: {
    action: 'list' | 'search' | 'open' | 'create_folder' | 'delete';
    directory?: string;
    query?: string;
    extension?: string;
    path?: string;
    confirmed?: boolean;
  }): Promise<{ success: boolean; files?: any[]; message?: string; [key: string]: any }> {
    try {
      const res = await fetch(`${this.baseUrl}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LIZA-TOKEN': this.token
        },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: `File operation failed: ${err.message}` };
    }
  }

  public async searchContacts(query: string = ""): Promise<{
    contacts?: any[];
    matches?: any[];
    contact?: any;
    is_ambiguous?: boolean;
    prompt?: string;
    message?: string;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/messages/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LIZA-TOKEN': this.token
        },
        body: JSON.stringify({ query })
      });
      return await res.json();
    } catch (err: any) {
      return { message: `Companion offline: ${err.message}` };
    }
  }

  public async dispatchMessage(params: {
    platform: 'whatsapp' | 'telegram' | 'sms' | 'email';
    recipient_name: string;
    phone?: string;
    message: string;
    confirmed: boolean;
  }): Promise<{
    success: boolean;
    status?: string;
    channel?: string;
    recipient?: string;
    message?: string;
    spoken_feedback?: string;
    requires_confirmation?: boolean;
    confirmation_prompt?: string;
    error?: string;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/messages/dispatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LIZA-TOKEN': this.token
        },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: `Companion service unreachable: ${err.message}` };
    }
  }

  public async automateWhatsAppMessage(params: {
    recipient: string;
    message: string;
    confirmed?: boolean;
    action?: 'prepare' | 'send';
  }): Promise<{
    success: boolean;
    requires_confirmation?: boolean;
    status?: string;
    delivery_status?: 'typed' | 'sent' | 'delivered' | 'read' | 'failed' | 'none';
    delivery_verified?: boolean;
    recipient?: string;
    message?: string;
    channel?: string;
    spoken_feedback?: string;
    spoken_prompt?: string;
    confirmation_prompt?: string;
    is_ambiguous?: boolean;
    candidates?: string[];
    prompt?: string;
    error_code?: string;
    error?: string;
    logs?: Array<{ stage: string; status: string; details: string; timestamp: number; time_str: string }>;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/whatsapp/automate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LIZA-TOKEN': this.token
        },
        body: JSON.stringify({
          recipient: params.recipient,
          message: params.message,
          confirmed: !!params.confirmed,
          action: params.action || (params.confirmed ? 'send' : 'prepare')
        }),
        signal: AbortSignal.timeout(12000)
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        error_code: 'COMPANION_UNREACHABLE',
        error: `Windows Companion Agent is not reachable at ${this.baseUrl}: ${err.message}. Please ensure the companion agent is running on Dell Latitude 7420.`,
        delivery_verified: false
      };
    }
  }

  public async fetchWhatsAppLogs(): Promise<Array<{ stage: string; status: string; details: string; timestamp: number; time_str: string }>> {
    try {
      const res = await fetch(`${this.baseUrl}/whatsapp/logs`, {
        headers: {
          'X-LIZA-TOKEN': this.token
        },
        signal: AbortSignal.timeout(3000)
      });
      const data = await res.json();
      return data.logs || [];
    } catch {
      return [];
    }
  }

  public async listTools(): Promise<{ tools: any[] }> {
    try {
      const res = await fetch(`${this.baseUrl}/tools/registry`);
      return await res.json();
    } catch {
      return { tools: [] };
    }
  }
}

export const windowsCompanionService = new WindowsCompanionService();


