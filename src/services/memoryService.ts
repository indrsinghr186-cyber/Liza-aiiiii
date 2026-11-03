// LIZA 24-Hour & Long-Term Memory Service

export interface LizaMemory {
  id: string;
  key: string;                  // Short topic or title (e.g., "YouTube Channel Setup")
  value: string;                // Detailed context content
  memoryType: 'session' | 'long_term'; // 'session' = 24-hour rolling, 'long_term' = permanent
  createdAt: number;            // Timestamp in epoch ms
  expiresAt: number | null;     // createdAt + 24*60*60*1000 for session; null for long_term
  importance: number;           // Priority 1-5 (default 3)
  detail?: string;              // Optional detail or origin
}

const STORAGE_KEY = 'liza_memories_v2_rolling';
export const SESSION_MEMORY_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours in ms (86,400,000 ms)
export const MAX_SESSION_MEMORIES = 30;

/**
 * Checks if a memory item is expired.
 */
export function isMemoryExpired(memory: LizaMemory, now = Date.now()): boolean {
  if (memory.memoryType === 'long_term' || memory.expiresAt === null) {
    return false;
  }
  return now >= memory.expiresAt;
}

/**
 * Filters out any expired memories from a list.
 */
export function filterActiveMemories(memories: LizaMemory[], now = Date.now()): LizaMemory[] {
  return memories.filter(m => !isMemoryExpired(m, now));
}

/**
 * Formats time remaining for a session memory into human-readable text.
 */
export function getTimeRemainingText(memory: LizaMemory, now = Date.now()): string {
  if (memory.memoryType === 'long_term' || memory.expiresAt === null) {
    return 'Permanent';
  }
  const diffMs = memory.expiresAt - now;
  if (diffMs <= 0) {
    return 'Expired';
  }
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `Expires in ${hours}h ${minutes}m`;
  }
  return `Expires in ${minutes}m`;
}

/**
 * Enforces memory limits and cleans up expired session memories.
 * Never deletes long-term memories automatically.
 */
export function cleanAndDeduplicateMemories(memories: LizaMemory[], maxSessionCount = MAX_SESSION_MEMORIES): LizaMemory[] {
  const now = Date.now();
  // 1. Remove expired memories
  const active = filterActiveMemories(memories, now);

  // 2. Separate long term vs session
  const longTerm = active.filter(m => m.memoryType === 'long_term');
  let session = active.filter(m => m.memoryType === 'session');

  // 3. Deduplicate session memories by key (keep newest)
  const sessionMap = new Map<string, LizaMemory>();
  for (const m of session) {
    const normKey = m.key.trim().toLowerCase();
    const existing = sessionMap.get(normKey);
    if (!existing || m.createdAt > existing.createdAt) {
      sessionMap.set(normKey, m);
    }
  }
  session = Array.from(sessionMap.values());

  // 4. Enforce session memory cap
  if (session.length > maxSessionCount) {
    // Sort by importance ascending, then createdAt ascending (oldest/least important first)
    session.sort((a, b) => {
      if (a.importance !== b.importance) {
        return a.importance - b.importance;
      }
      return a.createdAt - b.createdAt;
    });
    // Remove lowest rank
    session = session.slice(session.length - maxSessionCount);
  }

  // Re-sort session memories chronologically (newest first for display)
  session.sort((a, b) => b.createdAt - a.createdAt);
  longTerm.sort((a, b) => b.createdAt - a.createdAt);

  return [...longTerm, ...session];
}

/**
 * Loads memories from localStorage, pruning expired ones automatically.
 */
export function loadMemoriesFromStorage(): LizaMemory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: LizaMemory[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = cleanAndDeduplicateMemories(parsed);
        // Persist cleaned list
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        return cleaned;
      }
    }
  } catch (e) {
    console.error('Failed to load memories from localStorage:', e);
  }
  return [];
}

/**
 * Saves memories to localStorage.
 */
export function saveMemoriesToStorage(memories: LizaMemory[]): void {
  try {
    const cleaned = cleanAndDeduplicateMemories(memories);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  } catch (e) {
    console.error('Failed to save memories to localStorage:', e);
  }
}

/**
 * Helper to add a new memory item (session or long term).
 */
export function createMemoryItem(
  key: string,
  value: string,
  memoryType: 'session' | 'long_term' = 'session',
  importance = 3,
  detail = ''
): LizaMemory {
  const now = Date.now();
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mem_${now}_${Math.random().toString(36).substr(2, 6)}`,
    key: key.trim(),
    value: value.trim(),
    memoryType,
    createdAt: now,
    expiresAt: memoryType === 'session' ? now + SESSION_MEMORY_TTL_MS : null,
    importance: Math.min(5, Math.max(1, importance)),
    detail: detail || '',
  };
}

/**
 * Utility to format memory context string for system prompt injection.
 */
export function formatMemoriesForAIContext(memories: LizaMemory[]): string {
  const active = filterActiveMemories(memories);
  if (active.length === 0) return '';

  const sessionMems = active.filter(m => m.memoryType === 'session');
  const longTermMems = active.filter(m => m.memoryType === 'long_term');

  let output = '';

  if (sessionMems.length > 0) {
    output += `\n[24-HOUR RECENT CONTEXT & TASKS (EXPIRES AUTOMATICALLY)]:\n`;
    output += sessionMems.map(m => `- ${m.key}: ${m.value}`).join('\n') + '\n';
  }

  if (longTermMems.length > 0) {
    output += `\n[PERMANENT LONG-TERM MEMORIES & USER PREFERENCES]:\n`;
    output += longTermMems.map(m => `- ${m.key}: ${m.value}`).join('\n') + '\n';
  }

  return output;
}

/**
 * Unified Memory Service facade providing local storage & API synchronization.
 */
export const memoryService = {
  loadLocalMemories: loadMemoriesFromStorage,
  saveLocalMemories: saveMemoriesToStorage,
  getActiveMemories: async (): Promise<LizaMemory[]> => {
    try {
      const res = await fetch('/api/memories');
      const data = await res.json();
      if (data.success && Array.isArray(data.memories)) {
        saveMemoriesToStorage(data.memories);
        return data.memories;
      }
    } catch (e) {
      console.warn('Backend memories API fallback to local storage:', e);
    }
    return loadMemoriesFromStorage();
  },
  storeMemory: async (params: {
    key: string;
    value: string;
    detail?: string;
    memoryType?: 'session' | 'long_term';
    importance?: number;
  }): Promise<LizaMemory> => {
    const newItem = createMemoryItem(
      params.key,
      params.value,
      params.memoryType || 'session',
      params.importance || 3,
      params.detail || ''
    );

    const current = loadMemoriesFromStorage();
    const updated = [newItem, ...current.filter(m => m.key.toLowerCase() !== params.key.toLowerCase())];
    saveMemoriesToStorage(updated);

    try {
      await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
    } catch (e) {
      console.warn('Failed to sync memory to backend:', e);
    }

    return newItem;
  },
  deleteMemory: async (idOrKey: string): Promise<void> => {
    const current = loadMemoriesFromStorage();
    const filtered = current.filter(m => m.id !== idOrKey && m.key.toLowerCase() !== idOrKey.toLowerCase());
    saveMemoriesToStorage(filtered);

    try {
      await fetch(`/api/memories/${idOrKey}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete memory from backend:', e);
    }
  },
  clearSessionMemories: async (): Promise<void> => {
    const current = loadMemoriesFromStorage();
    const longTermOnly = current.filter(m => m.memoryType === 'long_term');
    saveMemoriesToStorage(longTermOnly);

    try {
      await fetch('/api/memories/session', { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to clear session memories on backend:', e);
    }
  },
  clearAllMemories: async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEY);
    try {
      await fetch('/api/memories/all', { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to clear all memories on backend:', e);
    }
  },
  pruneExpiredMemories: (): void => {
    loadMemoriesFromStorage();
  },
};
