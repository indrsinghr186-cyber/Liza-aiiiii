import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, X, Check, MessageSquare, AlertCircle, Phone, 
  UserCheck, ShieldCheck, Sparkles, Volume2, Edit3,
  CheckCheck, Clock, Terminal, ChevronDown, ChevronUp, Activity
} from 'lucide-react';
import { 
  voiceMessageAutomationService, 
  VoiceMessageDraft, 
  AmbiguityResolution, 
  MessageRecipient 
} from '../services/voiceMessageAutomationService';

interface VoiceMessageConfirmationCardProps {
  onSpeak?: (text: string) => void;
  playClickSound?: () => void;
}

export const VoiceMessageConfirmationCard: React.FC<VoiceMessageConfirmationCardProps> = ({
  onSpeak,
  playClickSound
}) => {
  const [draft, setDraft] = useState<VoiceMessageDraft | null>(voiceMessageAutomationService.getActiveDraft());
  const [ambiguity, setAmbiguity] = useState<AmbiguityResolution | null>(voiceMessageAutomationService.getAmbiguity());
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [lastSentSuccess, setLastSentSuccess] = useState<{
    recipient: string;
    channel: string;
    time: number;
  } | null>(null);

  useEffect(() => {
    const unsub = voiceMessageAutomationService.subscribe(() => {
      const active = voiceMessageAutomationService.getActiveDraft();
      const amb = voiceMessageAutomationService.getAmbiguity();
      setDraft(active);
      setAmbiguity(amb);
      if (active) {
        setEditedText(active.messageText);
      }
    });
    return unsub;
  }, []);

  // Handle Send Confirmation
  const handleConfirmSend = async () => {
    playClickSound?.();
    if (!draft) return;
    if (isEditing && editedText.trim()) {
      draft.messageText = editedText.trim();
    }
    setIsSending(true);
    const res = await voiceMessageAutomationService.confirmSend();
    setIsSending(false);
    setIsEditing(false);

    if (res.success && res.draft) {
      setLastSentSuccess({
        recipient: res.draft.recipient.name,
        channel: res.draft.deliveryChannel || 'WhatsApp',
        time: Date.now()
      });
      setTimeout(() => {
        setLastSentSuccess(null);
      }, 4500);
    }
  };

  // Handle Cancellation
  const handleCancel = () => {
    playClickSound?.();
    voiceMessageAutomationService.cancelDraft();
    setIsEditing(false);
  };

  // Ambiguity Selection
  const handleSelectCandidate = (candidate: MessageRecipient) => {
    playClickSound?.();
    voiceMessageAutomationService.selectAmbiguousCandidate(candidate);
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'whatsapp':
        return { label: 'WhatsApp Desktop', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'telegram':
        return { label: 'Telegram Desktop', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'sms':
        return { label: 'Phone Link (SMS)', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'email':
        return { label: 'Windows Mail', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      default:
        return { label: 'Messaging', bg: 'bg-white/10 text-white/80 border-white/20' };
    }
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none">
      <AnimatePresence mode="wait">
        {/* Ambiguity Resolution Prompt */}
        {ambiguity && (
          <motion.div
            key="ambiguity-modal"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="pointer-events-auto bg-slate-950/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl shadow-2xl p-5 text-white"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h4 className="font-mono-spec font-bold text-xs uppercase text-amber-400 tracking-wider">
                    Recipient Disambiguation
                  </h4>
                  <p className="text-xs text-white/80">Multiple contacts match '{ambiguity.query}'. Which one?</p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 mt-3">
              {ambiguity.candidates.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => handleSelectCandidate(candidate)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${candidate.avatarColor || 'from-amber-500 to-orange-600'} flex items-center justify-center text-xs font-bold text-white font-mono`}>
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                        {candidate.name}
                      </div>
                      <div className="text-[10px] text-white/50 font-mono">
                        {candidate.relationship ? `${candidate.relationship} · ` : ''}{candidate.phone}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10">
                    Select
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Active Draft Confirmation Card */}
        {draft && !ambiguity && (
          <motion.div
            key="draft-confirmation"
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="pointer-events-auto bg-slate-950/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl p-5 text-white overflow-hidden relative"
          >
            {/* Top glow streak */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-mono-spec font-bold text-xs uppercase text-cyan-300 tracking-wider">
                      Voice Message Confirmation
                    </h4>
                    <span className={`px-2 py-0.2 rounded-full text-[9px] font-mono border ${getPlatformBadge(draft.platform).bg}`}>
                      {getPlatformBadge(draft.platform).label}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 font-mono-spec">Say "Haan" to send or "Nahi" to cancel</p>
                </div>
              </div>

              <button
                onClick={handleCancel}
                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
                title="Cancel draft"
              >
                <X size={16} />
              </button>
            </div>

            {/* Recipient Details */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${draft.recipient.avatarColor || 'from-emerald-500 to-teal-600'} flex items-center justify-center text-sm font-bold text-white font-mono shadow-md`}>
                  {draft.recipient.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {draft.recipient.name}
                    {draft.recipient.relationship && (
                      <span className="text-[10px] text-cyan-400 font-mono">
                        · {draft.recipient.relationship}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-white/50 font-mono flex items-center gap-1">
                    <Phone size={10} />
                    {draft.recipient.phone}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                <ShieldCheck size={12} />
                <span>Verified</span>
              </div>
            </div>

            {/* Composed Message Preview */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/40">
                  Composed Message Text:
                </span>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 size={11} />
                  <span>{isEditing ? 'Done' : 'Edit'}</span>
                </button>
              </div>

              {isEditing ? (
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-500/40 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans resize-none h-20"
                  autoFocus
                />
              ) : (
                <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3 text-xs text-white leading-relaxed font-sans shadow-inner">
                  "{draft.messageText}"
                </div>
              )}
            </div>

            {/* Spoken cue status */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 mb-3 text-[11px] text-cyan-200 font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>LIZA: "{draft.recipient.name} ko ye message bhejna hai. Send kar doon?"</span>
              </div>
              <Volume2 size={13} className="text-cyan-400" />
            </div>

            {/* Real Windows Execution & Delivery Status Indicator */}
            <div className="mb-3 p-2 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="text-white/40 uppercase text-[9px] tracking-wider">Windows Status:</span>
                {draft.deliveryStatus === 'sent' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Check size={12} className="text-emerald-400" />
                    Message Sent (Verified)
                  </span>
                ) : draft.deliveryStatus === 'delivered' ? (
                  <span className="flex items-center gap-1 text-teal-400 font-bold">
                    <CheckCheck size={12} className="text-teal-400" />
                    Delivered (Double Check)
                  </span>
                ) : draft.deliveryStatus === 'read' ? (
                  <span className="flex items-center gap-1 text-cyan-400 font-bold">
                    <CheckCheck size={12} className="text-cyan-400" />
                    Read (Blue Check)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-300 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Typed into WhatsApp chat box
                  </span>
                )}
              </div>

              {draft.auditLogs && draft.auditLogs.length > 0 && (
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer transition-colors"
                >
                  <Terminal size={11} />
                  <span>Audit Logs ({draft.auditLogs.length})</span>
                  {showLogs ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
              )}
            </div>

            {/* Expandable 9-Stage Execution Audit Trail */}
            {showLogs && draft.auditLogs && draft.auditLogs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 max-h-40 overflow-y-auto space-y-1 p-2 rounded-xl bg-black/60 border border-cyan-500/20 font-mono text-[10px]"
              >
                <div className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1 mb-1">
                  <Activity size={10} />
                  <span>Execution Audit Trail (9-Stage Real Windows Automation):</span>
                </div>
                {draft.auditLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-white/80 py-0.5 border-b border-white/5 last:border-0">
                    <span className="text-cyan-400/70 font-mono text-[9px] shrink-0">[{log.time_str}]</span>
                    <span className={`shrink-0 font-bold px-1 rounded text-[9px] ${
                      log.status === 'success' ? 'bg-emerald-500/20 text-emerald-300' :
                      log.status === 'failed' ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {log.stage}
                    </span>
                    <span className="text-white/60 text-[9px] truncate">{log.details}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCancel}
                disabled={isSending}
                className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-white/70 hover:text-rose-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <X size={14} />
                <span>Nahi / Cancel</span>
              </button>

              <button
                onClick={handleConfirmSend}
                disabled={isSending}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={14} />
                    <span>Haan / Send Message</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Sent Success Feedback Banner */}
        {lastSentSuccess && !draft && !ambiguity && (
          <motion.div
            key="sent-success"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="pointer-events-auto bg-emerald-950/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl shadow-2xl p-4 text-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Check size={20} className="stroke-[3]" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-2">
                  MESSAGE SUCCESSFULLY SENT!
                  <Sparkles size={13} className="text-emerald-400" />
                </div>
                <div className="text-xs text-white/80">
                  {lastSentSuccess.recipient} ko {lastSentSuccess.channel} ke through message bhej diya gaya hai.
                </div>
              </div>
              <button
                onClick={() => setLastSentSuccess(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
