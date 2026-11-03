/**
 * Client-side Gemini Live & Streaming API bridge.
 * Communicates with the server-side Gemini service via WebSockets and Server-Sent Events,
 * ensuring no API keys or direct Google GenAI SDK imports are present in the browser.
 */

export interface LiveServerMessage {
  serverContent?: {
    modelTurn?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
    interrupted?: boolean;
    turnComplete?: boolean;
    goAway?: boolean;
    interactionStatus?: string;
  };
  toolCall?: {
    functionCalls: Array<{
      id: string;
      name: string;
      args: Record<string, any>;
    }>;
  };
}

export enum Type {
  TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED",
  STRING = "STRING",
  NUMBER = "NUMBER",
  INTEGER = "INTEGER",
  BOOLEAN = "BOOLEAN",
  ARRAY = "ARRAY",
  OBJECT = "OBJECT",
  NULL = "NULL",
}

export enum Modality {
  MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED",
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
}

export interface LiveClientCallbacks {
  onopen?: () => void;
  onmessage: (message: LiveServerMessage) => Promise<void> | void;
  onerror?: (error: any) => void;
  onclose?: (event?: any) => void;
}

export interface LiveConnectParams {
  model?: string;
  callbacks: LiveClientCallbacks;
  config?: any;
  initialCommand?: string;
}

export class GeminiLiveSession {
  private ws: WebSocket | null = null;
  private isClosed = false;
  private messageQueue: string[] = [];

  constructor(private params: LiveConnectParams) {}

  public connect(): Promise<GeminiLiveSession> {
    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/api/live-ws`;

        const ws = new WebSocket(wsUrl);
        this.ws = ws;

        let isEstablished = false;

        ws.onopen = () => {
          // Send session initialization payload to the server
          ws.send(JSON.stringify({
            type: 'start',
            model: this.params.model,
            config: this.params.config,
            initialCommand: this.params.initialCommand,
          }));

          // Flush any pending queue
          while (this.messageQueue.length > 0) {
            const queued = this.messageQueue.shift();
            if (queued && ws.readyState === WebSocket.OPEN) {
              ws.send(queued);
            }
          }
        };

        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'open') {
              isEstablished = true;
              this.params.callbacks.onopen?.();
              resolve(this);
            } else if (data.type === 'message') {
              await this.params.callbacks.onmessage(data.message);
            } else if (data.type === 'close') {
              this.params.callbacks.onclose?.(data.event);
            } else if (data.type === 'error') {
              const err = new Error(data.error?.message || 'Server error occurred in Gemini Live session');
              if (!isEstablished) {
                reject(err);
              }
              this.params.callbacks.onerror?.(err);
            }
          } catch (parseErr) {
            console.error('Error parsing live server message:', parseErr);
          }
        };

        ws.onerror = (e) => {
          const err = new Error('WebSocket connection to Gemini Live failed');
          if (!isEstablished) {
            reject(err);
          }
          this.params.callbacks.onerror?.(e);
        };

        ws.onclose = (e) => {
          if (!this.isClosed) {
            this.params.callbacks.onclose?.(e);
          }
        };
      } catch (initErr) {
        reject(initErr);
      }
    });
  }

  public sendRealtimeInput(input: {
    audio?: { data: string; mimeType: string };
    video?: { data: string; mimeType: string };
    text?: string;
  }) {
    const payload = JSON.stringify({ type: 'realtimeInput', input });
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(payload);
    } else if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      this.messageQueue.push(payload);
    }
  }

  public sendToolResponse(response: {
    functionResponses: Array<{
      name: string;
      id: string;
      response: any;
    }>;
  }) {
    const payload = JSON.stringify({ type: 'toolResponse', response });
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(payload);
    } else if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      this.messageQueue.push(payload);
    }
  }

  public close() {
    this.isClosed = true;
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'close' }));
      }
      this.ws.close();
      this.ws = null;
    }
    this.messageQueue = [];
  }
}

/**
 * Connect to Gemini Live on the server via WebSocket.
 */
export async function connectGeminiLive(params: LiveConnectParams): Promise<GeminiLiveSession> {
  const session = new GeminiLiveSession(params);
  return await session.connect();
}

/**
 * Helper to stream chat responses from the server-side Gemini endpoint.
 */
export async function* streamChatFromServer(
  message: string,
  systemInstruction?: string
): AsyncGenerator<string> {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, systemInstruction }),
  });

  if (!response.ok || !response.body) {
    const errText = await response.text();
    throw new Error(`Chat stream failed: ${errText || response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';

    for (const part of parts) {
      const line = part.trim();
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim();
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.text) yield parsed.text;
        }
      }
    }
  }
}
