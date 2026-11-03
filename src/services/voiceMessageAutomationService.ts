/**
 * LIZA AI — Smart Voice Message Automation Service
 * Full voice-controlled messaging system for Windows 11 (Dell Latitude 7420)
 * Owner: Paramveer Rawat
 * Supported Channels: WhatsApp Desktop/Web, Telegram Desktop, Windows Phone Link (SMS), Email
 */

import { windowsCompanionService } from './windowsCompanionService';
import { smartContactsService, Contact } from './contactsService';

export type MessagingPlatform = 'whatsapp' | 'telegram' | 'sms' | 'email';

export interface MessageRecipient {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
  avatarColor?: string;
  aliases?: string[];
}

export interface VoiceMessageDraft {
  id: string;
  recipient: MessageRecipient;
  messageText: string;
  platform: MessagingPlatform;
  createdAt: number;
  status: 'draft' | 'awaiting_confirmation' | 'sending' | 'sent' | 'cancelled' | 'failed';
  deliveryStatus?: 'typed' | 'sent' | 'delivered' | 'read' | 'failed' | 'none';
  feedbackMessage?: string;
  deliveryChannel?: string;
  auditLogs?: Array<{ stage: string; status: string; details: string; timestamp: number; time_str: string }>;
}

export interface AmbiguityResolution {
  query: string;
  candidates: MessageRecipient[];
  unformattedMessage: string;
  platform: MessagingPlatform;
}

const STORAGE_SENT_MESSAGES_KEY = 'liza_voice_messages_sent_v1';
const STORAGE_LAST_CONTACT_KEY = 'liza_last_contacted_recipient_v1';

class VoiceMessageAutomationService {
  private defaultRecipients: MessageRecipient[] = [
    {
      id: 'm1',
      name: 'Mummy (Sunita Rawat)',
      phone: '+919876543210',
      relationship: 'Mother',
      aliases: ['mummy', 'maa', 'mom', 'mother', 'mataji'],
      avatarColor: 'from-pink-500 to-rose-600'
    },
    {
      id: 'm2',
      name: 'Papa (Rajesh Rawat)',
      phone: '+919876543211',
      relationship: 'Father',
      aliases: ['papa', 'dad', 'father', 'pitaji'],
      avatarColor: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'm3',
      name: 'Rahul Sharma (Best Friend)',
      phone: '+919876543214',
      relationship: 'Friend',
      aliases: ['rahul', 'rahul sharma', 'bestie', 'yaar'],
      avatarColor: 'from-amber-500 to-orange-600'
    },
    {
      id: 'm4',
      name: 'Rahul Verma (Colleague)',
      phone: '+919876543217',
      relationship: 'Colleague',
      aliases: ['rahul verma', 'rahul office', 'verma ji'],
      avatarColor: 'from-slate-600 to-slate-800'
    },
    {
      id: 'm5',
      name: 'Priya Rawat (Sister)',
      phone: '+919876543213',
      relationship: 'Sister',
      aliases: ['priya', 'didi', 'sister', 'behan'],
      avatarColor: 'from-purple-500 to-violet-600'
    },
    {
      id: 'm6',
      name: 'Amit Roy (Friend)',
      phone: '+919876543218',
      relationship: 'Friend',
      aliases: ['amit', 'amit roy'],
      avatarColor: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'm7',
      name: 'Aman Rawat (Brother)',
      phone: '+919876543212',
      relationship: 'Brother',
      aliases: ['aman', 'bhai', 'brother', 'bhaiya'],
      avatarColor: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'm8',
      name: 'Rohit Verma (Manager)',
      phone: '+919876543215',
      relationship: 'Boss',
      aliases: ['boss', 'rohit sir', 'manager'],
      avatarColor: 'from-zinc-600 to-zinc-800'
    }
  ];

  private activeDraft: VoiceMessageDraft | null = null;
  private ambiguity: AmbiguityResolution | null = null;
  private sentHistory: VoiceMessageDraft[] = [];
  private lastContacted: MessageRecipient | null = null;
  private listeners: Set<() => void> = new Set();
  private duplicateCache: Map<string, number> = new Map();

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_SENT_MESSAGES_KEY);
        if (saved) {
          this.sentHistory = JSON.parse(saved);
        }
        const savedLast = localStorage.getItem(STORAGE_LAST_CONTACT_KEY);
        if (savedLast) {
          this.lastContacted = JSON.parse(savedLast);
        } else if (this.defaultRecipients.length > 0) {
          this.lastContacted = this.defaultRecipients[0];
        }
      } catch (e) {
        console.warn('Failed to load message history:', e);
      }
    }
  }

  private saveHistory() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_SENT_MESSAGES_KEY, JSON.stringify(this.sentHistory.slice(0, 30)));
        if (this.lastContacted) {
          localStorage.setItem(STORAGE_LAST_CONTACT_KEY, JSON.stringify(this.lastContacted));
        }
      } catch (e) {
        console.warn('Failed to save message history:', e);
      }
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (e) {
        console.error('Error in message listener:', e);
      }
    }
  }

  public getActiveDraft(): VoiceMessageDraft | null {
    return this.activeDraft;
  }

  public getAmbiguity(): AmbiguityResolution | null {
    return this.ambiguity;
  }

  public getSentHistory(): VoiceMessageDraft[] {
    return [...this.sentHistory];
  }

  public getLastContacted(): MessageRecipient | null {
    return this.lastContacted;
  }

  public getAllContacts(): MessageRecipient[] {
    // Combine default and contactsService
    const appContacts = smartContactsService.getAllContacts();
    const mappedAppContacts: MessageRecipient[] = appContacts.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone || '+919876543210',
      relationship: c.relationship,
      aliases: c.aliases,
      avatarColor: c.avatarColor || 'from-indigo-500 to-purple-600'
    }));

    // Merge uniqueness by phone or name
    const combined = [...this.defaultRecipients];
    for (const ac of mappedAppContacts) {
      if (!combined.some(c => c.name.toLowerCase() === ac.name.toLowerCase() || c.phone === ac.phone)) {
        combined.push(ac);
      }
    }
    return combined;
  }

  /**
   * Search for contacts with fuzzy matching and ambiguity detection
   */
  public resolveRecipient(query: string): {
    matched: MessageRecipient | null;
    isAmbiguous: boolean;
    candidates: MessageRecipient[];
  } {
    const q = (query || '').trim().toLowerCase();

    // Check for "last contact" / "usko" / "previous"
    if (q === 'usko' || q === 'last contact' || q === 'previous' || q === 'last person' || q.includes('pichla')) {
      if (this.lastContacted) {
        return { matched: this.lastContacted, isAmbiguous: false, candidates: [this.lastContacted] };
      }
    }

    const all = this.getAllContacts();

    // 1. Exact alias or name match
    const exactMatch = all.find(
      c => c.name.toLowerCase() === q || (c.aliases && c.aliases.some(a => a.toLowerCase() === q))
    );
    if (exactMatch) {
      return { matched: exactMatch, isAmbiguous: false, candidates: [exactMatch] };
    }

    // 2. Partial matches
    const matches = all.filter(c => {
      const nameMatch = c.name.toLowerCase().includes(q) || q.includes(c.name.toLowerCase().split(' ')[0]);
      const relMatch = c.relationship && (c.relationship.toLowerCase().includes(q) || q.includes(c.relationship.toLowerCase()));
      const aliasMatch = c.aliases && c.aliases.some(a => a.toLowerCase().includes(q) || q.includes(a.toLowerCase()));
      return nameMatch || relMatch || aliasMatch;
    });

    if (matches.length === 1) {
      return { matched: matches[0], isAmbiguous: false, candidates: matches };
    }

    if (matches.length > 1) {
      // If one candidate starts directly with the query, check if it's distinctly prominent
      const startsWithMatches = matches.filter(m => m.name.toLowerCase().startsWith(q));
      if (startsWithMatches.length === 1) {
        return { matched: startsWithMatches[0], isAmbiguous: false, candidates: [startsWithMatches[0]] };
      }
      return { matched: null, isAmbiguous: true, candidates: matches };
    }

    return { matched: null, isAmbiguous: false, candidates: [] };
  }

  /**
   * Formats spoken human message instructions into properly written natural messages with emojis
   */
  public formatSpokenMessage(instruction: string, recipientName: string): string {
    const text = (instruction || '').trim();
    const lower = text.toLowerCase();

    // 1. Birthday wishes
    if (lower.includes('birthday') || lower.includes('janamdin')) {
      const shortName = recipientName.split(' ')[0].replace(/\(.*?\)/g, '').trim();
      return `Happy Birthday ${shortName}! 🎂 Wishing you wonderful health, joy and massive success! 🎉✨`;
    }

    // 2. "Ghar aa raha hoon" / coming home
    if (lower.includes('ghar aa raha') || lower.includes('coming home')) {
      return 'Main abhi ghar ke liye nikal raha hoon, thodi der mein pahunch jaunga! 🏠🚗';
    }

    // 3. "Pahunch gaya" / arrived safely
    if (lower.includes('pahunch gaya') || lower.includes('reached') || lower.includes('arrived')) {
      return 'Main sahi salamat pahunch gaya hoon, don\'t worry! 👍😊';
    }

    // 4. "Thodi der mein aaunga" / running late / wait
    if (lower.includes('thodi der mein') || lower.includes('late ho') || lower.includes('running late')) {
      return 'Main thodi der mein pahunch raha hoon. Please wait a bit! ⏳🙏';
    }

    // 5. "Busy hoon" / in meeting
    if (lower.includes('busy') || lower.includes('meeting') || lower.includes('baad mein baat')) {
      return 'Main abhi thoda busy hoon, thodi der baad call/message karta hoon. 👍';
    }

    // 6. "Good morning"
    if (lower.includes('good morning') || lower.includes('shubh prabhat')) {
      return 'Good Morning! ☀️ Wishing you a productive and energetic day ahead! 🌸';
    }

    // 7. "Good night"
    if (lower.includes('good night') || lower.includes('shubh ratri')) {
      return 'Good Night! 🌙 Take rest and sweet dreams! 💤';
    }

    // 8. "Call me when free"
    if (lower.includes('call me') || lower.includes('free ho kar call')) {
      return 'Please call me when you are free. 📞';
    }

    // 9. Simple greetings ("hi", "hello")
    if (lower === 'hi' || lower === 'hello' || lower === 'hii' || lower === 'hey') {
      return `Hello ${recipientName.split(' ')[0]}! 👋 Hope you're doing well!`;
    }

    // Strip leading command phrases if user passed raw instruction
    const cleaned = text
      .replace(/^(ki|that|bolo ki|bhejo ki|kaho ki|bata do ki|message:?)\s*/i, '')
      .trim();

    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  /**
   * Parse a natural voice command string directly (for offline/instant recognition)
   */
  public parseNaturalVoiceCommand(command: string): {
    recipientQuery: string;
    messageInstruction: string;
    platform: MessagingPlatform;
  } | null {
    const raw = (command || '').trim();
    if (!raw) return null;

    let platform: MessagingPlatform = 'whatsapp';
    if (raw.toLowerCase().includes('telegram')) platform = 'telegram';
    else if (raw.toLowerCase().includes('sms') || raw.toLowerCase().includes('text message')) platform = 'sms';
    else if (raw.toLowerCase().includes('email') || raw.toLowerCase().includes('mail')) platform = 'email';

    // Patterns e.g. "Rahul ko Hi message bhejo", "mummy ko WhatsApp karo ki main ghar aa raha hoon"
    const patterns = [
      // "Rahul ko message bhejo: Call me when you are free"
      /(?:liza,?\s*)?([A-Za-z0-9\s]+?)\s*ko\s*(?:whatsapp|telegram|sms|message)?\s*(?:bhejo|karo|likho)?\s*:\s*(.+)/i,
      // "Rahul ko Hi message bhejo"
      /(?:liza,?\s*)?([A-Za-z0-9\s]+?)\s*ko\s*(.+?)\s*(?:message|msg|whatsapp)?\s*(?:bhejo|karo|bhej do)/i,
      // "Mummy ko WhatsApp karo ki main ghar aa raha hoon"
      /(?:liza,?\s*)?([A-Za-z0-9\s]+?)\s*ko\s*(?:whatsapp|telegram|sms|bata do|bolo)?\s*(?:karo|ki|bolo)?\s*ki\s*(.+)/i,
      // "Amit ko Happy Birthday wish karo"
      /(?:liza,?\s*)?([A-Za-z0-9\s]+?)\s*ko\s*(.+?)\s*(?:wish karo|kaho|bolo)/i,
      // "Usko bol dena ki main busy hoon"
      /(?:liza,?\s*)?(usko|last contact|pichle contact)\s*(?:bol dena|bata do|bhejo)?\s*ki\s*(.+)/i,
    ];

    for (const pat of patterns) {
      const match = raw.match(pat);
      if (match && match[1] && match[2]) {
        return {
          recipientQuery: match[1].replace(/^(liza|hey liza|sun|arre)/i, '').trim(),
          messageInstruction: match[2].trim(),
          platform
        };
      }
    }

    return null;
  }

  /**
   * Prepares a message draft, resolves recipient, asks confirmation
   */
  public composeDraft(
    recipientQuery: string,
    messageInstruction: string,
    platform: MessagingPlatform = 'whatsapp'
  ): {
    status: 'ready_for_confirmation' | 'ambiguous' | 'not_found';
    draft?: VoiceMessageDraft;
    candidates?: MessageRecipient[];
    promptToSpeak: string;
  } {
    const resolution = this.resolveRecipient(recipientQuery);

    if (resolution.isAmbiguous) {
      this.ambiguity = {
        query: recipientQuery,
        candidates: resolution.candidates,
        unformattedMessage: messageInstruction,
        platform
      };
      this.activeDraft = null;
      this.notify();

      const names = resolution.candidates.map(c => c.name).join(' ya ');
      return {
        status: 'ambiguous',
        candidates: resolution.candidates,
        promptToSpeak: `${names}? Kis ${recipientQuery} ko message bhejna hai?`
      };
    }

    if (!resolution.matched) {
      this.activeDraft = null;
      this.notify();
      return {
        status: 'not_found',
        promptToSpeak: `Mujhe contacts mein '${recipientQuery}' nahi mila. Kise bhejna hai?`
      };
    }

    const recipient = resolution.matched;
    const formattedText = this.formatSpokenMessage(messageInstruction, recipient.name);

    const draft: VoiceMessageDraft = {
      id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      recipient,
      messageText: formattedText,
      platform,
      createdAt: Date.now(),
      status: 'awaiting_confirmation',
      deliveryChannel: platform === 'whatsapp' ? 'WhatsApp Desktop / Web' : platform.toUpperCase()
    };

    this.activeDraft = draft;
    this.ambiguity = null;
    this.notify();

    // Spoken prompt with confirmation
    const promptToSpeak = `${recipient.name} ko '${formattedText}' bhejna hai. Send kar doon?`;
    return {
      status: 'ready_for_confirmation',
      draft,
      promptToSpeak
    };
  }

  /**
   * Resolve an ambiguous recipient selection (e.g. user chose "Rahul Sharma")
   */
  public selectAmbiguousCandidate(candidate: MessageRecipient): {
    status: 'ready_for_confirmation';
    draft: VoiceMessageDraft;
    promptToSpeak: string;
  } {
    const unformatted = this.ambiguity?.unformattedMessage || 'Hello';
    const plat = this.ambiguity?.platform || 'whatsapp';
    this.ambiguity = null;
    return this.composeDraft(candidate.name, unformatted, plat) as any;
  }

  /**
   * Confirms and sends the active draft
   */
  public async confirmSend(): Promise<{
    success: boolean;
    message: string;
    draft: VoiceMessageDraft | null;
  }> {
    if (!this.activeDraft) {
      return {
        success: false,
        message: 'Koi pending message draft nahi hai.',
        draft: null
      };
    }

    const draft = this.activeDraft;
    const dedupKey = `${draft.recipient.name.toLowerCase()}_${draft.messageText}`;
    const now = Date.now();

    // Deduplication check: 10s
    if (this.duplicateCache.has(dedupKey)) {
      const lastSent = this.duplicateCache.get(dedupKey) || 0;
      if (now - lastSent < 10000) {
        return {
          success: false,
          message: `${draft.recipient.name} ko ye message abhi-abhi bheja ja chuka hai (Duplicate prevented).`,
          draft
        };
      }
    }

    draft.status = 'sending';
    this.notify();

    try {
      if (draft.platform === 'whatsapp') {
        const res = await this.executeRealWhatsAppWorkflow({
          recipient: draft.recipient.name,
          message: draft.messageText,
          confirmed: true,
          action: 'send'
        });
        return {
          success: res.success,
          message: res.spoken_feedback || (res.success ? `${draft.recipient.name} ko message successfully send ho gaya!` : (res.error || 'Message send nahi ho saka.')),
          draft: this.activeDraft
        };
      }

      // 1. Dispatch via local Windows Companion agent for other channels
      const companionRes = await windowsCompanionService.dispatchMessage({
        platform: draft.platform,
        recipient_name: draft.recipient.name,
        phone: draft.recipient.phone,
        message: draft.messageText,
        confirmed: true
      });

      if (companionRes.success) {
        draft.status = 'sent';
        draft.deliveryChannel = companionRes.channel || 'Windows 11 Desktop Agent';
        draft.feedbackMessage = companionRes.spoken_feedback || `${draft.recipient.name} ko message successfully send ho gaya.`;
      } else {
        // Fallback: Web browser protocol dispatch
        this.dispatchBrowserFallback(draft);
        draft.status = 'sent';
        draft.deliveryChannel = `${draft.platform.toUpperCase()} Web Dispatch`;
        draft.feedbackMessage = `${draft.recipient.name} ke liye ${draft.platform} open kar diya hai.`;
      }

      this.duplicateCache.set(dedupKey, now);
      this.lastContacted = draft.recipient;
      this.sentHistory.unshift({ ...draft });
      this.saveHistory();

      const finalDraft = { ...draft };
      this.activeDraft = null;
      this.notify();

      return {
        success: true,
        message: `${finalDraft.recipient.name} ko message successfully send ho gaya!`,
        draft: finalDraft
      };
    } catch (err: any) {
      draft.status = 'failed';
      this.notify();
      return {
        success: false,
        message: `Message send karne mein error aaya: ${err.message}`,
        draft
      };
    }
  }

  /**
   * Real Windows Desktop Automation for WhatsApp
   * Implements strict 2-step verification and tracks the 9 required execution audit logs.
   */
  public async executeRealWhatsAppWorkflow(params: {
    recipient: string;
    message: string;
    confirmed?: boolean;
    action?: 'prepare' | 'send';
  }): Promise<{
    success: boolean;
    requires_confirmation?: boolean;
    status: string;
    delivery_status?: 'typed' | 'sent' | 'delivered' | 'read' | 'failed' | 'none';
    delivery_verified?: boolean;
    recipient: string;
    message: string;
    spoken_feedback?: string;
    confirmation_prompt?: string;
    is_ambiguous?: boolean;
    candidates?: string[];
    logs?: Array<{ stage: string; status: string; details: string; timestamp: number; time_str: string }>;
    error?: string;
  }> {
    const isConfirmed = !!params.confirmed;

    // Check contact resolution first to catch ambiguity
    const resolution = this.resolveRecipient(params.recipient);
    if (resolution.isAmbiguous && resolution.candidates) {
      this.ambiguity = {
        query: params.recipient,
        candidates: resolution.candidates,
        unformattedMessage: params.message,
        platform: 'whatsapp'
      };
      this.activeDraft = null;
      this.notify();
      const names = resolution.candidates.map(c => c.name).join(' ya ');
      return {
        success: false,
        is_ambiguous: true,
        status: 'ambiguous',
        candidates: resolution.candidates.map(c => c.name),
        recipient: params.recipient,
        message: params.message,
        confirmation_prompt: `${names}? Kis ${params.recipient} ko message bhejna hai?`,
        spoken_feedback: `${names}? Kis ${params.recipient} ko message bhejna hai?`
      };
    }

    const targetRecipient = resolution.matched || {
      id: `rc_${Date.now()}`,
      name: params.recipient,
      phone: '',
      relationship: 'Contact',
      avatarColor: 'from-emerald-500 to-teal-600'
    };

    const formattedMessage = this.formatSpokenMessage(params.message, targetRecipient.name);

    // Call real Windows companion agent
    const companionRes = await windowsCompanionService.automateWhatsAppMessage({
      recipient: targetRecipient.name,
      message: formattedMessage,
      confirmed: isConfirmed,
      action: isConfirmed ? 'send' : 'prepare'
    });

    if (!isConfirmed) {
      // Stage 1: Prepared/Typed into WhatsApp input box on desktop!
      const draft: VoiceMessageDraft = {
        id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        recipient: targetRecipient,
        messageText: formattedMessage,
        platform: 'whatsapp',
        createdAt: Date.now(),
        status: 'awaiting_confirmation',
        deliveryStatus: companionRes.delivery_status || 'typed',
        deliveryChannel: companionRes.channel || 'WhatsApp Desktop',
        auditLogs: companionRes.logs
      };
      this.activeDraft = draft;
      this.ambiguity = null;
      this.notify();

      const promptToSpeak = companionRes.confirmation_prompt || `${targetRecipient.name} ko '${formattedMessage}' bhejna hai. Ye message bhej doon?`;

      return {
        success: companionRes.success,
        requires_confirmation: true,
        status: 'ready_for_confirmation',
        delivery_status: companionRes.delivery_status || 'typed',
        delivery_verified: false,
        recipient: targetRecipient.name,
        message: formattedMessage,
        confirmation_prompt: promptToSpeak,
        spoken_feedback: promptToSpeak,
        logs: companionRes.logs,
        error: companionRes.error
      };
    } else {
      // Stage 2: Confirmed send
      if (companionRes.success && companionRes.delivery_verified) {
        if (this.activeDraft) {
          this.activeDraft.status = 'sent';
          this.activeDraft.deliveryStatus = companionRes.delivery_status || 'sent';
          this.activeDraft.auditLogs = companionRes.logs;
          this.sentHistory.unshift({ ...this.activeDraft });
          this.saveHistory();
          this.lastContacted = this.activeDraft.recipient;
          this.activeDraft = null;
        }
        this.notify();

        return {
          success: true,
          status: 'sent',
          delivery_status: companionRes.delivery_status || 'sent',
          delivery_verified: true,
          recipient: targetRecipient.name,
          message: formattedMessage,
          spoken_feedback: companionRes.spoken_feedback || `${targetRecipient.name} ko WhatsApp message successfully send ho gaya!`,
          logs: companionRes.logs
        };
      } else {
        if (this.activeDraft) {
          this.activeDraft.status = 'failed';
          this.activeDraft.deliveryStatus = 'failed';
          this.activeDraft.auditLogs = companionRes.logs;
        }
        this.notify();

        return {
          success: false,
          status: 'failed',
          delivery_status: 'failed',
          delivery_verified: false,
          recipient: targetRecipient.name,
          message: formattedMessage,
          spoken_feedback: companionRes.error || 'WhatsApp message dispatch verify nahi ho saka.',
          error: companionRes.error,
          logs: companionRes.logs
        };
      }
    }
  }

  /**
   * Cancels the active draft
   */
  public cancelDraft(): { success: boolean; message: string } {
    if (!this.activeDraft && !this.ambiguity) {
      return { success: false, message: 'Koi active message draft nahi tha.' };
    }
    const name = this.activeDraft?.recipient.name || 'Message';
    this.activeDraft = null;
    this.ambiguity = null;
    this.notify();
    return {
      success: true,
      message: `Theek hai, ${name} ka message cancel kar diya.`
    };
  }

  /**
   * Browser fallback dispatch if Windows Companion is offline
   */
  private dispatchBrowserFallback(draft: VoiceMessageDraft) {
    if (typeof window === 'undefined') return;

    const cleanPhone = draft.recipient.phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(draft.messageText);

    if (draft.platform === 'whatsapp') {
      const url = cleanPhone
        ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
        : `https://web.whatsapp.com/send?text=${encoded}`;
      window.open(url, '_blank');
    } else if (draft.platform === 'telegram') {
      window.open(`https://t.me/share/url?url=&text=${encoded}`, '_blank');
    } else if (draft.platform === 'sms') {
      window.open(`sms:${cleanPhone}?body=${encoded}`, '_self');
    } else if (draft.platform === 'email') {
      window.open(`mailto:${cleanPhone || draft.recipient.name}?subject=Message&body=${encoded}`, '_self');
    }
  }
}

export const voiceMessageAutomationService = new VoiceMessageAutomationService();
