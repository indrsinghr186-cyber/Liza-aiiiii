import { voiceMessageAutomationService } from './voiceMessageAutomationService';

export interface QuickMessageDraft {
  id: string;
  recipientName: string;
  recipientPhone?: string;
  messageText: string;
  platform: 'whatsapp' | 'sms' | 'email';
  timestamp: number;
}

class WhatsAppQuickDispatcher {
  public parseVoiceMessageCommand(voiceInput: string): QuickMessageDraft | null {
    const parsed = voiceMessageAutomationService.parseNaturalVoiceCommand(voiceInput);
    if (parsed) {
      const res = voiceMessageAutomationService.composeDraft(
        parsed.recipientQuery,
        parsed.messageInstruction,
        parsed.platform === 'email' ? 'email' : parsed.platform === 'telegram' ? 'whatsapp' : parsed.platform
      );
      if (res.draft) {
        return {
          id: res.draft.id,
          recipientName: res.draft.recipient.name,
          recipientPhone: res.draft.recipient.phone,
          messageText: res.draft.messageText,
          platform: res.draft.platform === 'sms' ? 'sms' : res.draft.platform === 'email' ? 'email' : 'whatsapp',
          timestamp: res.draft.createdAt
        };
      }
    }

    const text = voiceInput.toLowerCase();
    const isWhatsApp = text.includes('whatsapp') || text.includes('wa ');
    const isSms = text.includes('sms') || text.includes('message') || text.includes('sandesh');

    if (!isWhatsApp && !isSms) return null;

    let recipient = 'Contact';
    let messageBody = '';

    const toMatch = voiceInput.match(/(?:send to|message to|bhejo|ko whatsapp|ko sms|ko msg)\s+([A-Za-z0-9\s]+?)\s+(?:that|ki|message|saying)\s+(.*)/i);
    
    if (toMatch && toMatch[1] && toMatch[2]) {
      recipient = toMatch[1].replace(/ko|par|pe/gi, '').trim();
      messageBody = toMatch[2].trim();
    } else {
      messageBody = voiceInput.replace(/(?:whatsapp|sms|message|bhejo|send|ko)/gi, '').trim();
      recipient = 'Direct Contact';
    }

    // Also compose into voiceMessageAutomationService
    voiceMessageAutomationService.composeDraft(recipient, messageBody, isWhatsApp ? 'whatsapp' : 'sms');

    return {
      id: `msg_${Date.now()}`,
      recipientName: recipient || 'Contact',
      messageText: messageBody || 'Hello! Sending this via RAWAT AI.',
      platform: isWhatsApp ? 'whatsapp' : 'sms',
      timestamp: Date.now()
    };
  }

  public dispatchWhatsApp(phone: string, text: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(text);
    const url = cleanPhone 
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;
    
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
    return url;
  }

  public dispatchSms(phone: string, text: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(text);
    const url = `sms:${cleanPhone}?body=${encodedText}`;
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
    return url;
  }
}

export const whatsAppQuickDispatcher = new WhatsAppQuickDispatcher();
