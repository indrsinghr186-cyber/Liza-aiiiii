/**
 * LIZA AI — Desktop Autonomous Conversation & Context Engine 💻
 * 
 * Manages conversational context across multi-step voice commands:
 * - Understands natural language without fixed formats (Hindi, English, Hinglish).
 * - Resolves pronouns ("usko", "unko", "iska", "wahan", "isme") based on active task context.
 * - Tracks active desktop application, active chat, and pending confirmation drafts.
 * - Handles emergency stop ("LIZA STOP", "ruk jao", "stop").
 */

export interface DesktopContextState {
  activeApp: string;             // e.g. "WhatsApp", "Chrome", "YouTube", "Notepad", "Explorer"
  lastMentionedContact: string;  // e.g. "Rahul", "Mummy", "Priya"
  activeChat: string | null;     // Contact whose conversation is currently open
  lastDraft: {
    recipient: string;
    message: string;
    platform: string;
    confirmed: boolean;
  } | null;
  lastAction: {
    tool: string;
    status: 'success' | 'failed' | 'pending';
    summary: string;
    timestamp: number;
  } | null;
  isEmergencyStopped: boolean;
}

class DesktopContextService {
  private state: DesktopContextState = {
    activeApp: 'Windows Desktop',
    lastMentionedContact: 'Rahul Sharma (Best Friend)',
    activeChat: null,
    lastDraft: null,
    lastAction: null,
    isEmergencyStopped: false,
  };

  private listeners: Set<(state: DesktopContextState) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        const savedContact = localStorage.getItem('liza_last_contact');
        if (savedContact) {
          this.state.lastMentionedContact = savedContact;
        }
      } catch {}
    }
  }

  public subscribe(listener: (state: DesktopContextState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach(fn => {
      try { fn(s); } catch {}
    });
  }

  public getState(): DesktopContextState {
    return { ...this.state };
  }

  public setActiveApp(app: string) {
    this.state.activeApp = app;
    this.state.isEmergencyStopped = false;
    this.notify();
  }

  public getContextState(): DesktopContextState {
    return this.getState();
  }

  public setMentionedContact(contact: string) {
    if (!contact || contact.toLowerCase() === 'usko' || contact.toLowerCase() === 'unko') {
      return;
    }
    this.state.lastMentionedContact = contact;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('liza_last_contact', contact);
      } catch {}
    }
    this.notify();
  }

  public setLastMentionedContact(contact: string) {
    this.setMentionedContact(contact);
  }

  public setActiveChat(contact: string) {
    this.state.activeChat = contact;
    this.setMentionedContact(contact);
  }

  public setPendingDraft(recipient: string, message: string, platform: string = 'whatsapp') {
    this.state.lastDraft = {
      recipient,
      message,
      platform,
      confirmed: false,
    };
    this.setMentionedContact(recipient);
    this.notify();
  }

  public setLastDraft(recipient: string, message: string, platform: string = 'whatsapp') {
    this.setPendingDraft(recipient, message, platform);
  }

  public clearPendingDraft() {
    this.state.lastDraft = null;
    this.notify();
  }

  public recordAction(tool: string, statusOrTarget: 'success' | 'failed' | 'pending' | string, summaryOrMeta?: string | any) {
    let status: 'success' | 'failed' | 'pending' = 'success';
    let summary = '';

    if (statusOrTarget === 'success' || statusOrTarget === 'failed' || statusOrTarget === 'pending') {
      status = statusOrTarget;
      summary = typeof summaryOrMeta === 'string' ? summaryOrMeta : JSON.stringify(summaryOrMeta || '');
    } else {
      summary = `${statusOrTarget} ${typeof summaryOrMeta === 'string' ? summaryOrMeta : JSON.stringify(summaryOrMeta || '')}`;
    }

    this.state.lastAction = {
      tool,
      status,
      summary,
      timestamp: Date.now(),
    };
    this.notify();
  }

  public triggerEmergencyStop(): boolean {
    this.state.isEmergencyStopped = true;
    this.state.lastDraft = null;
    this.notify();
    return true;
  }

  public resetEmergencyStop() {
    this.state.isEmergencyStopped = false;
    this.notify();
  }

  /**
   * Resolves recipient name from pronouns such as "usko", "unhe", "usse", "last contact", "unko".
   */
  public resolveRecipientPronoun(rawRecipient?: string): string {
    const r = (rawRecipient || '').trim().toLowerCase();
    const pronouns = ['usko', 'usse', 'unhe', 'unko', 'isko', 'ise', 'last contact', 'pichle contact', 'same', 'him', 'her', 'them'];

    if (!r || pronouns.includes(r)) {
      return this.state.activeChat || this.state.lastMentionedContact || 'Rahul';
    }
    return rawRecipient!;
  }

  /**
   * Builds high-priority prompt directive injecting continuous conversation context into Gemini Live.
   */
  public getContextPromptDirective(): string {
    return `
[CONTINUOUS WINDOWS 11 DESKTOP & CONVERSATION CONTEXT]:
- Currently Active Desktop Application: "${this.state.activeApp}"
- Current Active / Open Chat: "${this.state.activeChat || 'None'}"
- Last Mentioned Person / Recipient: "${this.state.lastMentionedContact}"
${this.state.lastDraft ? `- Pending Message Draft Awaiting User Confirmation: To: "${this.state.lastDraft.recipient}", Text: "${this.state.lastDraft.message}"` : ''}
${this.state.lastAction ? `- Last Completed Action: [${this.state.lastAction.tool}] -> ${this.state.lastAction.summary}` : ''}
- PRONOUN RESOLUTION DIRECTIVE:
  * "Usko message bhejo...", "Usko bolo...", "Usko WhatsApp karo..." -> Resolve "usko" to "${this.state.activeChat || this.state.lastMentionedContact}" automatically!
  * "Iska last message padho..." -> Read visible messages from "${this.state.activeChat || this.state.lastMentionedContact}".
  * "Wahan ye likho..." -> Type text into active application "${this.state.activeApp}".
  * "Ab YouTube kholo..." -> Open YouTube, keep continuous context.
  * "LIZA STOP" -> Emergency stop requested. Cancel current action and stop speaking.
    `.trim();
  }
}

export const desktopContextService = new DesktopContextService();
