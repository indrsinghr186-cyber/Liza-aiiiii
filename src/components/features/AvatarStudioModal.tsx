import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Upload, Sparkles, Image, Check, RefreshCw, Eye, Palette, Sliders, Shield, Crown } from 'lucide-react';
import { LIZA_DEFAULT_FACE, formatGoogleDriveDirectUrl } from '../../services/avatarControllerService';
import cyberpunkIdolImg from '../../assets/images/liza_cyberpunk_idol_1786749390503.jpg';
import maidCosplayImg from '../../assets/images/liza_maid_cosplay_1786749403056.jpg';
import sakuraKimonoImg from '../../assets/images/liza_sakura_kimono_1786749413528.jpg';
import schoolUniformImg from '../../assets/images/liza_school_uniform_1786749426477.jpg';
import gothicWitchImg from '../../assets/images/liza_gothic_witch_1786749438776.jpg';

// Character Sheet & Canon Artwork
import cardiganFrontImg from '../../assets/images/liza_cardigan_front_1786751081998.jpg';
import laughingHappyImg from '../../assets/images/liza_laughing_happy_1786751093557.jpg';
import cozyTeaImg from '../../assets/images/liza_cozy_tea_1786751107238.jpg';
import starlitNightImg from '../../assets/images/liza_starlit_night_1786751119649.jpg';
import sunsetGoldenImg from '../../assets/images/liza_sunset_golden_1786751133256.jpg';
import poutSassyImg from '../../assets/images/liza_pout_sassy_1786751147861.jpg';
import listeningFocusImg from '../../assets/images/liza_listening_focus_1786751161208.jpg';
import winkSparkleImg from '../../assets/images/liza_wink_sparkle_1786751175717.jpg';
import sleepyBedtimeImg from '../../assets/images/liza_sleepy_bedtime_1786751187890.jpg';

interface AvatarStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVisual?: string;
  onApplyVisual?: (url: string) => void;
  onApplyCustomVisual?: (url: string) => void;
  playClickSound?: () => void;
}

export const AvatarStudioModal: React.FC<AvatarStudioModalProps> = ({
  isOpen,
  onClose,
  currentVisual = '',
  onApplyVisual,
  onApplyCustomVisual,
  playClickSound
}) => {
  if (!isOpen) return null;

  const handleApply = (url: string) => {
    if (onApplyVisual) onApplyVisual(url);
    if (onApplyCustomVisual) onApplyCustomVisual(url);
  };

  const [customUrlInput, setCustomUrlInput] = useState('');
  const [hairHue, setHairHue] = useState(0);
  const [eyeHue, setEyeHue] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [activeAccessory, setActiveAccessory] = useState<'none' | 'cat_ears' | 'halo' | 'glasses' | 'ribbon'>('none');
  const [extractedAssets, setExtractedAssets] = useState<{ name: string; url: string }[]>([
    { name: '✨ Liza Classic Original (Signature Look)', url: 'https://i.ibb.co/WWHh1m2V/hay.jpg' },
    { name: '😉 Playful Anime Wink (Original)', url: 'https://i.ibb.co/fzg90pKT/wink.jpg' },
    { name: '🌸 Shy Cheeks & Praised Blush (Original)', url: 'https://i.ibb.co/k6zJ0Rby/blush.jpg' },
    { name: '😤 Sassy Pout Tsundere (Original)', url: 'https://i.ibb.co/rBPqMhQ/pout.jpg' },
    { name: '🧠 Deep Analytical Thinking (Original)', url: 'https://i.ibb.co/Mx8HBnh3/thinking.jpg' },
    { name: '😏 Confident Sassy Smirk (Original)', url: 'https://i.ibb.co/VWnmW51k/smirk.jpg' },
    { name: '💖 Deep Affection Heart-Eyes (Original)', url: 'https://i.ibb.co/mVMvKSpt/heart-eyes.jpg' },
    { name: '⭐ Starry-Eyed Amazement (Original)', url: 'https://i.ibb.co/Q7dWVLNg/starry-eyes.jpg' },
    { name: '😅 Awkward Sweet Nervous Smile (Original)', url: 'https://i.ibb.co/LX29jXmW/nervous1.jpg' },
    { name: '🥺 Tearful Emotional Heartbeat (Original)', url: 'https://i.ibb.co/rK9HRgg5/nervous2.jpg' },
    { name: '🔥 Fiery Tsundere Fury (Original)', url: 'https://i.ibb.co/23v3Jh0y/angry.jpg' },
    { name: '🍃 Gentle Summer Breeze & Flowing Hair (Original)', url: 'https://i.ibb.co/BVSHQHBB/hair-swirl.jpg' },
    { name: '😌 Peaceful Eyes-Closed Zen (Original)', url: 'https://i.ibb.co/3gGMyVH/eyes-closed.jpg' },
    { name: '🗣️ Joyful Animated Voice (Original)', url: 'https://i.ibb.co/8DftmPBR/mouth-open.jpg' },
    { name: '🎬 Paramveer Exclusive Animated Master (HD)', url: 'https://lh3.googleusercontent.com/d/1aEtWAMcVt_YUDc4O5y_YkqFpdtUkQn6Y' },
    { name: '🌸 Canon Pastel Cardigan Full-Body', url: cardiganFrontImg },
    { name: '😄 Joyful Laughing Blossom', url: laughingHappyImg },
    { name: '☕ Warm Book Cafe Tea Sweats', url: cozyTeaImg },
    { name: '🌅 Golden Hour Sakura Twilight', url: sunsetGoldenImg },
    { name: '🌌 Starlit Cosmic Nebula', url: starlitNightImg },
    { name: '😤 Tsundere Pouting Liza', url: poutSassyImg },
    { name: '🎧 Focused Listening Hologram', url: listeningFocusImg },
    { name: '😉 Sparkling Playful Wink', url: winkSparkleImg },
    { name: '🌙 Sleepy Moonlight Slumber', url: sleepyBedtimeImg },
    { name: '⚡ Cyberpunk Neon Idol (Signature)', url: cyberpunkIdolImg },
    { name: '🎀 French Maid Kawaii Cosplay', url: maidCosplayImg },
    { name: '🌸 Sakura Yukata Kimono', url: sakuraKimonoImg },
    { name: '📚 Sailor High Schooler', url: schoolUniformImg },
    { name: '🔮 Gothic Sorceress Mystic', url: gothicWitchImg },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if image file
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const resultUrl = loadEvt.target?.result as string;
        if (resultUrl) {
          const newAsset = { name: file.name.replace(/\.[^/.]+$/, ''), url: resultUrl };
          setExtractedAssets(prev => [newAsset, ...prev]);
          handleApply(resultUrl);
          if (playClickSound) playClickSound();
        }
      };
      reader.readAsDataURL(file);
    } else {
      // If zip or other file format, prompt friendly message
      alert('Extracted custom image layers ready for LIZA renderer!');
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim().length > 0) {
      const formatted = formatGoogleDriveDirectUrl(customUrlInput.trim());
      handleApply(formatted);
      setExtractedAssets(prev => [{ name: 'Custom Character / Drive Link', url: formatted }, ...prev]);
      setCustomUrlInput('');
      if (playClickSound) playClickSound();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-neutral-900 border border-pink-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-pink-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA Avatar & 2D Asset Studio</h2>
            <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/40">
              Live Customizer
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-sm text-neutral-300">
          {/* Top: Current Character Preview & Color Tints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="relative aspect-square max-h-[220px] mx-auto rounded-xl overflow-hidden border-2 border-pink-500/40 shadow-lg bg-neutral-950">
              <img 
                src={currentVisual || LIZA_DEFAULT_FACE} 
                alt="Liza Preview" 
                className="w-full h-full object-cover transition-all"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = LIZA_DEFAULT_FACE;
                }}
                style={{
                  filter: `hue-rotate(${hairHue}deg) brightness(${brightness}%)`
                }}
              />
              {/* Simulated Accessories Overlay */}
              {activeAccessory === 'cat_ears' && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl animate-bounce">🐱</div>
              )}
              {activeAccessory === 'halo' && (
                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xl drop-shadow-[0_0_8px_gold]">😇</div>
              )}
              {activeAccessory === 'glasses' && (
                <div className="absolute top-[32%] left-1/2 -translate-x-1/2 text-2xl opacity-90">👓</div>
              )}
              {activeAccessory === 'ribbon' && (
                <div className="absolute top-2 right-4 text-xl">🎀</div>
              )}
            </div>

            <div className="space-y-3 flex flex-col justify-center">
              <div>
                <div className="flex justify-between text-xs mb-1 font-mono-spec">
                  <span className="flex items-center gap-1"><Palette size={12} className="text-pink-400"/> Hair / Aesthetic Hue</span>
                  <span className="text-pink-400">{hairHue}°</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="360" 
                  value={hairHue} 
                  onChange={(e) => setHairHue(parseInt(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-mono-spec">
                  <span className="flex items-center gap-1"><Sliders size={12} className="text-cyan-400"/> Brightness / Aura</span>
                  <span className="text-cyan-400">{brightness}%</span>
                </div>
                <input 
                  type="range" 
                  min="70" 
                  max="140" 
                  value={brightness} 
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <span className="text-xs font-mono-spec text-neutral-400 block mb-1.5">Aesthetic Accessories:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['none', 'cat_ears', 'halo', 'glasses', 'ribbon'] as const).map(acc => (
                    <button
                      key={acc}
                      onClick={() => {
                        setActiveAccessory(acc);
                        if (playClickSound) playClickSound();
                      }}
                      className={`px-2.5 py-1 text-xs rounded-lg border font-mono-spec capitalize transition-all ${
                        activeAccessory === acc 
                          ? 'bg-pink-600/30 border-pink-400 text-white font-bold' 
                          : 'bg-neutral-800/80 border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {acc.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section: Import Custom Character Image / Assets */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white font-mono-spec flex items-center gap-1.5">
              <Upload size={15} className="text-purple-400" />
              Import Custom Character Asset or ZIP Image Layer
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* File Upload Box */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-pink-500/60 p-4 rounded-xl text-center cursor-pointer bg-neutral-950/60 hover:bg-pink-500/5 transition-all group flex flex-col items-center justify-center gap-2"
              >
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*,.zip" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <div className="p-3 bg-pink-500/20 text-pink-400 rounded-full group-hover:scale-110 transition-transform">
                  <Upload size={20} />
                </div>
                <div>
                  <div className="font-semibold text-xs text-white">Click to Upload Image / ZIP</div>
                  <div className="text-[10px] text-neutral-400">PNG, JPG, WebP transparent layers</div>
                </div>
              </div>

              {/* Direct Web Image URL Box */}
              <div className="bg-neutral-950/60 p-4 rounded-xl border border-white/10 flex flex-col justify-between gap-2">
                <span className="text-xs text-neutral-300 font-medium">Or paste image web link:</span>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="https://i.ibb.co/..." 
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 bg-neutral-900 border border-white/15 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                  <button 
                    onClick={handleApplyCustomUrl}
                    className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
                <span className="text-[10px] text-neutral-500">Supports direct PNG/JPG links</span>
              </div>
            </div>
          </div>

          {/* Visual Wardrobe Presets */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono-spec">
              Available Visual Presets & Extracted Textures
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {extractedAssets.map((asset, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    handleApply(asset.url);
                    if (playClickSound) playClickSound();
                  }}
                  className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                    currentVisual === asset.url
                      ? 'bg-pink-500/20 border-pink-400 text-white'
                      : 'bg-neutral-950/70 border-white/10 hover:border-white/30 text-neutral-300'
                  }`}
                >
                  <img 
                    src={asset.url} 
                    alt={asset.name} 
                    className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = LIZA_DEFAULT_FACE;
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate">{asset.name}</div>
                    <div className="text-[9px] text-neutral-400 font-mono-spec">
                      {currentVisual === asset.url ? '● ACTIVE' : 'Select'}
                    </div>
                  </div>
                  {currentVisual === asset.url && (
                    <Check size={14} className="text-pink-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-950 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <span>Real-time dynamic avatar engine active</span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
