import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Mic, MicOff, Phone, X, ChevronUp, ChevronDown, 
  Volume2, VolumeX, Smartphone, MessageSquare, Flashlight, FileText,
  Palette, Music, BellRing, Heart, Power, Eye, Radio, Copy, Share2, Check
} from 'lucide-react';
import { dynamicIslandService, DynamicIslandNotification } from '../services/dynamicIslandService';

interface DynamicIslandProps {
  onTapMic?: () => void;
  onOpenApp?: () => void;
  onOpenTheme?: () => void;
  onOpenWardrobe?: () => void;
  onOpenMusic?: () => void;
  onToggleIsland?: () => void;
  isLizaActive?: boolean;
  lizaMood?: string;
  onQuickShare?: () => void;
  onQuickCopy?: () => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  onTapMic,
  onOpenApp,
  onOpenTheme,
  onOpenWardrobe,
  onOpenMusic,
  onToggleIsland,
  isLizaActive = false,
  lizaMood = 'CALM',
  onQuickShare,
  onQuickCopy,
}) => {
  const [status, setStatus] = useState(dynamicIslandService.getStatus());
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedState, setCopiedState] = useState(false);

  useEffect(() => {
    const unsub = dynamicIslandService.subscribe(() => {
      const current = dynamicIslandService.getStatus();
      setStatus(current);
      if (current.isExpanded) {
        setIsExpanded(true);
      }
    });
    return unsub;
  }, []);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickCopy) {
      onQuickCopy();
    } else {
      try {
        await navigator.clipboard.writeText(`Liza AI Assistant — Status: Online | Mood: ${lizaMood} | URL: ${window.location.href}`);
        if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
        dynamicIslandService.triggerNotification({
          type: 'alert',
          title: 'Clipboard Copied',
          subtitle: 'Liza status copied to clipboard',
          iconType: 'sparkles'
        });
      } catch (err) {}
    }
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickShare) {
      onQuickShare();
    } else {
      try {
        if (navigator.share) {
          await navigator.share({
            title: 'Liza AI Assistant',
            text: `Meet Liza — Smart AI Voice & Hardware Companion!`,
            url: window.location.href
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          dynamicIslandService.triggerNotification({
            type: 'alert',
            title: 'Link Copied',
            subtitle: 'Share link copied to clipboard',
            iconType: 'sparkles'
          });
        }
      } catch (err) {}
    }
  };

  if (!status.isEnabled) return null;

  const notif = status.activeNotification;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[200] max-w-[94vw] sm:max-w-md w-full flex justify-center pointer-events-none">
      <motion.div
        layout
        initial={{ scale: 0.9, opacity: 0, y: -10 }}
        animate={{ 
          scale: 1, 
          opacity: 1, 
          y: 0,
          width: isExpanded ? '100%' : notif ? '330px' : isLizaActive ? '270px' : '230px',
          height: isExpanded ? 'auto' : '42px'
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        className="pointer-events-auto bg-black/95 border border-purple-500/50 rounded-full sm:rounded-3xl shadow-[0_4px_30px_rgba(168,85,247,0.45)] backdrop-blur-2xl text-white overflow-hidden p-2 flex flex-col justify-center cursor-pointer transition-all select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Collapsed Pill View */}
        {!isExpanded && (
          <div className="flex items-center justify-between px-2 w-full gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-2.5 h-2.5 rounded-full ${isLizaActive ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-[#d946ef]/80'} shrink-0`} />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-mono-spec font-black tracking-wider text-purple-300 truncate">
                  {notif ? notif.title : 'LIZA AI ISLAND'}
                </span>
                {notif ? (
                  <span className="text-[9px] text-purple-200/70 font-sans truncate">
                    {notif.subtitle}
                  </span>
                ) : (
                  <span className="text-[8px] font-mono-spec text-white/50 truncate flex items-center gap-1">
                    Mood: {lizaMood}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isLizaActive ? (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40">
                  <div className="w-1 h-3 bg-purple-400 rounded-full animate-bounce" />
                  <div className="w-1 h-4 bg-pink-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-1 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="text-[9px] font-mono-spec text-purple-200 font-bold ml-0.5">LIVE</span>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTapMic?.();
                  }}
                  className="px-2 py-0.5 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center gap-1 text-[10px] font-mono-spec font-bold cursor-pointer"
                  title="Start Voice Assistant"
                >
                  <Mic size={11} />
                  <span>TALK</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Expanded Dynamic Card View */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-2 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    LIZA Dynamic Island
                    <span className="text-[8px] font-mono-spec bg-purple-900/80 text-purple-200 px-1.5 py-0.2 rounded border border-purple-500/30 uppercase">
                      {lizaMood}
                    </span>
                  </h4>
                  <p className="text-[10px] text-white/60">Multitask Copilot & Universal Controller</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onToggleIsland?.();
                    dynamicIslandService.toggleFloatingBubble(false);
                  }}
                  className="px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-200 text-[9px] font-mono-spec flex items-center gap-1 cursor-pointer"
                  title="Turn Dynamic Island OFF"
                >
                  <Power size={10} />
                  <span>Turn OFF</span>
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 cursor-pointer"
                  title="Collapse Island"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Notification alert details if present */}
            {notif && (
              <div className="bg-purple-950/70 border border-purple-500/40 rounded-xl p-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1 rounded-lg bg-purple-500/30 text-purple-200">
                    <BellRing size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-purple-100 truncate">{notif.title}</p>
                    <p className="text-[10px] text-purple-300/80 truncate">{notif.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => dynamicIslandService.clearNotification()}
                  className="text-[9px] font-mono-spec text-purple-300 hover:text-white underline cursor-pointer shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Quick Web Hardware Native Tools (Clipboard 📋 & System Share 📤) */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                title="Copy current status/transcription to system clipboard"
              >
                {copiedState ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-indigo-300" />}
                <span className="text-[10px] font-mono-spec font-semibold text-white">
                  {copiedState ? 'Copied to Clipboard!' : 'Clipboard Copy'}
                </span>
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                title="Open Native System Share Sheet (WhatsApp, Telegram, etc.)"
              >
                <Share2 size={13} className="text-emerald-300" />
                <span className="text-[10px] font-mono-spec font-semibold text-white">
                  Native Share Sheet
                </span>
              </button>
            </div>

            {/* Quick Mobile Action Bar */}
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <button
                onClick={() => {
                  onTapMic?.();
                  setIsExpanded(false);
                }}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  isLizaActive 
                    ? 'bg-red-950/70 border-red-500/60 text-red-200' 
                    : 'bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200'
                }`}
              >
                {isLizaActive ? <MicOff size={14} className="text-red-400" /> : <Mic size={14} className="text-purple-300" />}
                <span className="text-[9px] font-mono-spec font-bold">{isLizaActive ? 'Stop Mic' : 'Start Mic'}</span>
              </button>

              <button
                onClick={() => {
                  onOpenApp?.();
                  setIsExpanded(false);
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 flex flex-col items-center gap-1 cursor-pointer"
              >
                <Smartphone size={14} className="text-cyan-300" />
                <span className="text-[9px] font-mono-spec">Functions</span>
              </button>

              <button
                onClick={() => {
                  onOpenWardrobe?.();
                  setIsExpanded(false);
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 flex flex-col items-center gap-1 cursor-pointer"
              >
                <Sparkles size={14} className="text-pink-300" />
                <span className="text-[9px] font-mono-spec">Wardrobe</span>
              </button>

              <button
                onClick={() => {
                  onOpenTheme?.();
                  setIsExpanded(false);
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 flex flex-col items-center gap-1 cursor-pointer"
              >
                <Palette size={14} className="text-amber-300" />
                <span className="text-[9px] font-mono-spec">Themes</span>
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

