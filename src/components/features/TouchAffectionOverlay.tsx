import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Hand, Zap, Flame, Smile, Eye, HelpCircle } from 'lucide-react';
import { getComboTier } from './HeartComboVisualizer';
import { affectionAudioEngine } from '../../services/affectionAudioEngine';

interface TouchAffectionOverlayProps {
  onTriggerReaction: (type: 'headpat' | 'poke_cheek' | 'hug' | 'hold_hand', comboCount?: number) => void;
  className?: string;
}

export const TouchAffectionOverlay: React.FC<TouchAffectionOverlayProps> = ({
  onTriggerReaction,
  className = ''
}) => {
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number; text?: string; combo?: number; iconType?: 'heart' | 'sakura' | 'sparkle' }[]>([]);
  const [touchCombo, setTouchCombo] = useState<number>(0);
  const [showTouchGuide, setShowTouchGuide] = useState<boolean>(false);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [pinchStretch, setPinchStretch] = useState<{ active: boolean; x: number; y: number }>({ active: false, x: 0, y: 0 });

  const touchComboTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTouchTimeRef = useRef<number>(0);
  const isDraggingHeadRef = useRef<boolean>(false);
  const headStrokeCountRef = useRef<number>(0);

  const registerTouchCombo = (): number => {
    const now = Date.now();
    const isCombo = (now - lastTouchTimeRef.current < 2000) && touchCombo > 0;
    lastTouchTimeRef.current = now;
    const newCombo = isCombo ? touchCombo + 1 : 1;
    setTouchCombo(newCombo);

    if (touchComboTimerRef.current) clearTimeout(touchComboTimerRef.current);
    touchComboTimerRef.current = setTimeout(() => {
      setTouchCombo(0);
    }, 2000);

    return newCombo;
  };

  const spawnParticles = (x: number, y: number, baseText: string, iconType: 'heart' | 'sakura' | 'sparkle' = 'heart') => {
    const currentCombo = registerTouchCombo();
    const tier = getComboTier(currentCombo);
    const text = currentCombo > 1 ? `${baseText} • x${currentCombo} (${tier.multiplier}x)` : baseText;

    const newHeart = { 
      id: Date.now() + Math.random(), 
      x, 
      y, 
      text, 
      combo: currentCombo,
      iconType 
    };
    setFloatingHearts(prev => [...prev.slice(-12), newHeart]);

    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1400);

    return currentCombo;
  };

  const handleHeadpat = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    affectionAudioEngine.playHeadpatPurr();
    setActiveZone('headpat');
    setTimeout(() => setActiveZone(null), 400);

    const combo = spawnParticles(x, y, '💆‍♀️ Purr~ (Baal mat bigado!)', 'sakura');
    onTriggerReaction('headpat', combo);
  };

  // Drag stroke on head support
  const handleHeadStrokeMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingHeadRef.current) return;
    headStrokeCountRef.current += 1;
    if (headStrokeCountRef.current % 8 === 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      affectionAudioEngine.playHeadpatPurr();
      spawnParticles(x, y, '🌸 Soothing Stroke~', 'sakura');
    }
  };

  const handlePokeCheek = (e: React.MouseEvent<HTMLDivElement>, side: 'left' | 'right') => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    affectionAudioEngine.playCheekPinchSqueeze();
    setActiveZone(`cheek_${side}`);
    setTimeout(() => setActiveZone(null), 450);

    const combo = spawnParticles(x, y, '😳 Hmph! Gaal kyu kheecha?!', 'sparkle');
    onTriggerReaction('poke_cheek', combo);
  };

  const handleHug = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    affectionAudioEngine.playHeartbeatPulse();
    setActiveZone('hug');
    setTimeout(() => setActiveZone(null), 600);

    const combo = spawnParticles(x, y, '🤗 Warm Embrace (Liza loves this)', 'heart');
    onTriggerReaction('hug', combo);
  };

  const handleHoldHands = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    affectionAudioEngine.playHandHoldAura();
    setActiveZone('hand');
    setTimeout(() => setActiveZone(null), 500);

    const combo = spawnParticles(x, y, '🤝 Hand in Hand (Hamesha saath)', 'heart');
    onTriggerReaction('hold_hand', combo);
  };

  return (
    <div className={`absolute inset-0 z-30 pointer-events-auto select-none overflow-hidden ${className}`}>
      {/* Visual Guide Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowTouchGuide(prev => !prev);
        }}
        className="absolute top-3 right-3 z-40 p-1.5 rounded-full bg-black/60 hover:bg-pink-950/80 border border-pink-500/40 text-pink-300 backdrop-blur-md transition-all hover:scale-110 shadow-lg cursor-pointer"
        title={showTouchGuide ? 'Hide Touch Zones Guide' : 'Show Interactive Touch Zones Guide'}
      >
        <HelpCircle size={13} className={showTouchGuide ? 'text-pink-400 animate-spin' : 'text-pink-300'} />
      </button>

      {/* Touch Zone Radar Overlay Guide (when enabled) */}
      <AnimatePresence>
        {showTouchGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3"
          >
            <div className="bg-black/80 backdrop-blur-md border border-pink-500/40 rounded-xl p-2 text-center shadow-2xl">
              <p className="text-[10px] font-bold text-pink-300 font-mono-spec">
                💆‍♂️ Interactive Touch Physics Active
              </p>
              <p className="text-[9px] text-white/60">
                Tap or stroke Head, Cheek, Chest or Hands to interact with Liza
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Headpat Hotspot (Top 30% of character head with stroke support) */}
      <div
        onClick={handleHeadpat}
        onMouseDown={() => { isDraggingHeadRef.current = true; headStrokeCountRef.current = 0; }}
        onMouseUp={() => { isDraggingHeadRef.current = false; }}
        onMouseMove={handleHeadStrokeMove}
        className={`absolute top-0 left-[18%] right-[18%] h-[30%] rounded-t-full cursor-pointer transition-all group ${
          showTouchGuide ? 'border-2 border-dashed border-pink-400/70 bg-pink-500/10' : 'hover:bg-pink-500/15 active:bg-pink-500/30'
        } ${activeZone === 'headpat' ? 'scale-95 bg-pink-500/30 ring-4 ring-pink-400/50' : ''}`}
        title="Pat Liza's Head (Tap or stroke for Purr audio!)"
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-mono-spec font-bold text-pink-300 pointer-events-none whitespace-nowrap shadow-lg flex items-center gap-1 border border-pink-500/30">
          <span>💆‍♀️</span>
          <span>Headpat (Purr Sound)</span>
        </div>
      </div>

      {/* 2. Left Cheek Poke Hotspot */}
      <div
        onClick={(e) => handlePokeCheek(e, 'left')}
        className={`absolute top-[32%] left-[10%] w-[28%] h-[18%] rounded-full cursor-pointer transition-all group ${
          showTouchGuide ? 'border-2 border-dashed border-rose-400/70 bg-rose-500/10' : 'hover:bg-rose-500/20 active:bg-rose-500/35'
        } ${activeZone === 'cheek_left' ? 'scale-90 bg-rose-500/40 ring-4 ring-rose-400/60' : ''}`}
        title="Pinch / Poke Liza's Left Cheek"
      >
        <div className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[8px] font-mono-spec font-bold text-rose-300 pointer-events-none whitespace-nowrap shadow-lg flex items-center gap-1 border border-rose-500/30">
          <span>😳</span>
          <span>Pinch Cheek</span>
        </div>
      </div>

      {/* 3. Right Cheek Poke Hotspot */}
      <div
        onClick={(e) => handlePokeCheek(e, 'right')}
        className={`absolute top-[32%] right-[10%] w-[28%] h-[18%] rounded-full cursor-pointer transition-all group ${
          showTouchGuide ? 'border-2 border-dashed border-rose-400/70 bg-rose-500/10' : 'hover:bg-rose-500/20 active:bg-rose-500/35'
        } ${activeZone === 'cheek_right' ? 'scale-90 bg-rose-500/40 ring-4 ring-rose-400/60' : ''}`}
        title="Pinch / Poke Liza's Right Cheek"
      >
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[8px] font-mono-spec font-bold text-rose-300 pointer-events-none whitespace-nowrap shadow-lg flex items-center gap-1 border border-rose-500/30">
          <span>Pinch Cheek</span>
          <span>😳</span>
        </div>
      </div>

      {/* 4. Hug & Heartbeat Hotspot (Chest & Body Area) */}
      <div
        onClick={handleHug}
        className={`absolute top-[52%] left-[22%] right-[22%] h-[28%] rounded-3xl cursor-pointer transition-all group ${
          showTouchGuide ? 'border-2 border-dashed border-purple-400/70 bg-purple-500/10' : 'hover:bg-purple-500/20 active:bg-purple-500/35'
        } ${activeZone === 'hug' ? 'scale-95 bg-purple-500/40 ring-4 ring-purple-400/60' : ''}`}
        title="Give Liza a Warm Hug (Heartbeat Pulse)"
      >
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-mono-spec font-bold text-purple-300 pointer-events-none whitespace-nowrap shadow-lg flex items-center gap-1 border border-purple-500/30">
          <span>🤗</span>
          <span>Warm Hug (Heartbeat)</span>
        </div>
      </div>

      {/* 5. Hand Hold Hotspot (Bottom corner pill) */}
      <div
        onClick={handleHoldHands}
        className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/70 border border-pink-500/40 hover:border-pink-300 backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95 transition-all text-[10px] font-mono-spec font-bold text-pink-300 flex items-center gap-1.5 shadow-xl ${
          activeZone === 'hand' ? 'bg-pink-500 text-white ring-4 ring-pink-400/60' : ''
        }`}
        title="Hold Liza's Hand"
      >
        <Hand size={13} className="text-pink-400" />
        <span>Hold Hand</span>
      </div>

      {/* Floating Touch Effect Particles */}
      <AnimatePresence>
        {floatingHearts.map(h => {
          const combo = h.combo || 1;
          const tier = getComboTier(combo);
          return (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, scale: 0.6, x: h.x - 20, y: h.y }}
              animate={{ 
                opacity: 0, 
                scale: combo >= 5 ? 1.6 : 1.3, 
                y: h.y - 85, 
                x: h.x + (Math.random() * 40 - 20) 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute pointer-events-none z-50 flex items-center gap-1.5"
            >
              {h.iconType === 'sakura' ? (
                <span className="text-lg animate-spin" style={{ animationDuration: '3s' }}>🌸</span>
              ) : h.iconType === 'sparkle' ? (
                <Sparkles size={combo >= 10 ? 24 : 18} className="text-amber-300 fill-amber-300 animate-pulse" />
              ) : (
                <Heart 
                  size={combo >= 10 ? 24 : combo >= 5 ? 20 : 18} 
                  className="fill-current drop-shadow-[0_0_12px_currentColor]" 
                  style={{ color: tier.color }}
                />
              )}
              {h.text && (
                <span 
                  className="text-[10px] font-bold font-mono-spec text-white px-2.5 py-1 rounded-full border backdrop-blur-md shadow-xl whitespace-nowrap flex items-center gap-1"
                  style={{
                    backgroundColor: `${tier.color}dd`,
                    borderColor: '#ffffff70',
                    boxShadow: `0 0 15px ${tier.glowColor}`,
                  }}
                >
                  {combo >= 3 && <Flame size={11} className="fill-current text-white animate-pulse" />}
                  {h.text}
                </span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

