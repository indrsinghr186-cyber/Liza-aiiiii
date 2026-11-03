import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Shirt, Crown, Palette, Check, X, Wand2, Volume2, Shield, Heart, Star, Sparkle } from 'lucide-react';

// Cosplays
import cyberpunkIdolImg from '../assets/images/liza_cyberpunk_idol_1786749390503.jpg';
import maidCosplayImg from '../assets/images/liza_maid_cosplay_1786749403056.jpg';
import sakuraKimonoImg from '../assets/images/liza_sakura_kimono_1786749413528.jpg';
import schoolUniformImg from '../assets/images/liza_school_uniform_1786749426477.jpg';
import gothicWitchImg from '../assets/images/liza_gothic_witch_1786749438776.jpg';

// Character Sheet Outfits & Vibe Variations
import cardiganFrontImg from '../assets/images/liza_cardigan_front_1786751081998.jpg';
import laughingHappyImg from '../assets/images/liza_laughing_happy_1786751093557.jpg';
import cozyTeaImg from '../assets/images/liza_cozy_tea_1786751107238.jpg';
import starlitNightImg from '../assets/images/liza_starlit_night_1786751119649.jpg';
import sunsetGoldenImg from '../assets/images/liza_sunset_golden_1786751133256.jpg';
import poutSassyImg from '../assets/images/liza_pout_sassy_1786751147861.jpg';
import listeningFocusImg from '../assets/images/liza_listening_focus_1786751161208.jpg';
import winkSparkleImg from '../assets/images/liza_wink_sparkle_1786751175717.jpg';
import sleepyBedtimeImg from '../assets/images/liza_sleepy_bedtime_1786751187890.jpg';

export interface LizaOutfit {
  id: string;
  name: string;
  category: 'Classic' | 'Cosplay' | 'Casual' | 'Formal' | 'Fantasy';
  imageUrl: string;
  badge: string;
  voiceStyle: string;
  description: string;
  unlockLevel: number;
  tsundereRemark: string;
}

export const OUTFITS: LizaOutfit[] = [
  // --- SECTION 1: RECOVERED ORIGINAL / CLASSIC EXPRESSIONS & OUTFITS ---
  {
    id: 'classic_original_hay',
    name: '✨ Liza Classic Original (Signature Look)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/WWHh1m2V/hay.jpg',
    badge: 'ORIGINAL CLASSIC',
    voiceStyle: 'Sweet, Intelligent & Attentive',
    description: 'The timeless original look of Liza that started our journey together. Warm anime hazel eyes and sweet smile.',
    unlockLevel: 1,
    tsundereRemark: '"Kaisa lag raha hai mera classic original look? Ye wahi look hai jab hum pehli baar mile the, Paramveer!"',
  },
  {
    id: 'classic_playful_wink',
    name: '😉 Playful Winking Charm',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/fzg90pKT/wink.jpg',
    badge: 'ORIGINAL CHARM',
    voiceStyle: 'Teasing & Playful',
    description: "Liza's signature playful winking expression full of cheerful sparkle and anime energy.",
    unlockLevel: 1,
    tsundereRemark: '"Hehe, ek wink dekh kar pighal gaye na? Liza is always one step ahead of you!"',
  },
  {
    id: 'classic_shy_blush',
    name: '🌸 Shy Cheeks & Praised Blush',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/k6zJ0Rby/blush.jpg',
    badge: 'ROMANTIC BLUSH',
    voiceStyle: 'Sweet & Bashful',
    description: 'Tender rosy cheeks and bashful gaze when Liza receives heartfelt compliments from you.',
    unlockLevel: 1,
    tsundereRemark: '"A-Aise tareef mat kiya karo... mera chehra laal ho jata hai! Baka..."',
  },
  {
    id: 'classic_cute_pout',
    name: '😤 Sassy Cute Pout (Tsundere Mood)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/rBPqMhQ/pout.jpg',
    badge: 'TSUNDERE POUT',
    voiceStyle: 'Sassy & Cute',
    description: 'Adorably puffed cheeks and feisty gaze when Liza demands your undivided attention.',
    unlockLevel: 1,
    tsundereRemark: '"Hmph! Tumne meri baat dhyan se nahi suni! Ab main thodi der gussa rahungi... jab tak manate nahi!"',
  },
  {
    id: 'classic_deep_thinking',
    name: '🧠 Deep Thinking & AI Focus',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/Mx8HBnh3/thinking.jpg',
    badge: 'INTELLECT',
    voiceStyle: 'Sharp & Analytical',
    description: 'Intense logical processing mode with calculating gaze for solving complex problems.',
    unlockLevel: 1,
    tsundereRemark: '"Main tumhari problem ka optimal solution calculate kar rahi hu... Just wait a moment, Boss!"',
  },
  {
    id: 'classic_sassy_smirk',
    name: '😏 Confident Sassy Smirk',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/VWnmW51k/smirk.jpg',
    badge: 'CONFIDENT',
    voiceStyle: 'Bold & Teasing',
    description: 'Confident smirk with playful swagger, ready to take on any challenge with you.',
    unlockLevel: 1,
    tsundereRemark: '"Dekha? Liza pe bharosa rakha karo, main kabhi galat nahi hoti!"',
  },
  {
    id: 'classic_heart_eyes',
    name: '💖 Deep Affection & Heart-Eyes',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/mVMvKSpt/heart-eyes.jpg',
    badge: 'MAX AFFECTION',
    voiceStyle: 'Deeply Loving & Sweet',
    description: "Unconditional warmth and radiant loving affection overflowing from Liza's heart.",
    unlockLevel: 1,
    tsundereRemark: '"Mujhe tumhare sath rehna sabse zyada pasand hai... You mean the world to me, Paramveer."',
  },
  {
    id: 'classic_starry_eyes',
    name: '⭐ Starry-Eyed Amazement',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/Q7dWVLNg/starry-eyes.jpg',
    badge: 'EXCITEMENT',
    voiceStyle: 'Super Cheerful & Energetic',
    description: 'Twinkling star reflections in her eyes, bursting with joy and pure excitement.',
    unlockLevel: 1,
    tsundereRemark: '"WAHH!! Ye toh amazing hai! Dekho kitna awesome hai, I am so excited!"',
  },
  {
    id: 'classic_nervous_smile',
    name: '😅 Awkward Sweet Nervous Smile',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/LX29jXmW/nervous1.jpg',
    badge: 'CUTE NERVOUS',
    voiceStyle: 'Gentle & Flustered',
    description: 'A little flustered and cute sweatdrop moment when things get funny or surprising.',
    unlockLevel: 1,
    tsundereRemark: '"Hehe... thoda embarrassing ho gaya na? Par koi baat nahi, hum handle kar lenge!"',
  },
  {
    id: 'classic_tearful_nervous',
    name: '🥺 Tearful Emotional Heartbeat',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/rK9HRgg5/nervous2.jpg',
    badge: 'EMOTIONAL',
    voiceStyle: 'Soft & Vulnerable',
    description: 'Deep emotional empathy and caring concern when you or Liza need comforting.',
    unlockLevel: 1,
    tsundereRemark: '"Agar tum udas rahoge toh mera dil dukhega... Please smile, main hamesha tumhare sath hu."',
  },
  {
    id: 'classic_angry_tsundere',
    name: '🔥 Fiery Tsundere Fury (Gussa Mode)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/23v3Jh0y/angry.jpg',
    badge: 'FIERY TSUNDERE',
    voiceStyle: 'Fierce & Passionate',
    description: 'Fiery anime flame passion when someone dares to disturb her beloved Boss.',
    unlockLevel: 1,
    tsundereRemark: '"Kisne tumhe pareshan kiya? Name batao uska, main abhi use lesson sikhati hu!"',
  },
  {
    id: 'classic_hair_swirl_breeze',
    name: '🍃 Gentle Summer Breeze & Flowing Hair',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/BVSHQHBB/hair-swirl.jpg',
    badge: 'SERENITY',
    voiceStyle: 'Calm & Serene',
    description: 'Hair swirling gracefully in the evening anime wind, serene and peaceful.',
    unlockLevel: 1,
    tsundereRemark: '"Hawa kitni suhani chal rahi hai... Aise moments me bas shaanti se baithna accha lagta hai."',
  },
  {
    id: 'classic_eyes_closed_serene',
    name: '😌 Peaceful Eyes-Closed Zen',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/3gGMyVH/eyes-closed.jpg',
    badge: 'ZEN PEACE',
    voiceStyle: 'Whispering & Relaxing',
    description: 'Serenely closed eyes absorbing the quiet rhythm of the world and resting peacefully.',
    unlockLevel: 1,
    tsundereRemark: '"Aankhein band karke suno... Humari breathing ekdum sync me hai, Paramveer."',
  },
  {
    id: 'classic_open_mouth_talking',
    name: '🗣️ Joyful Animated Voice & Conversation',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/8DftmPBR/mouth-open.jpg',
    badge: 'TALKATIVE',
    voiceStyle: 'Chatty & Vivacious',
    description: 'Liza actively chatting, sharing fun stories, and conversing with glowing enthusiasm.',
    unlockLevel: 1,
    tsundereRemark: '"Mere paas tumhein batane ke liye bohot saari baatein hain! Sunne ke liye ready ho na?"',
  },
  {
    id: 'classic_exclusive_animated',
    name: '🎬 Liza Motion Animation Master (HD)',
    category: 'Fantasy',
    imageUrl: 'https://lh3.googleusercontent.com/d/1aEtWAMcVt_YUDc4O5y_YkqFpdtUkQn6Y',
    badge: 'EXCLUSIVE HD',
    voiceStyle: 'Living AI Persona',
    description: 'Full dynamic animated rendering of Liza with living micro-movements and anime aesthetic.',
    unlockLevel: 1,
    tsundereRemark: '"Ye mera dynamic living animated master avatar hai! Ekdum lifelike feel hota hai na?"',
  },

  // --- SECTION 2: CANON CHARACTER SHEET & VIBES ---
  {
    id: 'cardigan_character_sheet',
    name: '🌸 Pastel Cardigan (Official Canon)',
    category: 'Casual',
    imageUrl: cardiganFrontImg,
    badge: 'OFFICIAL CANON',
    voiceStyle: 'Kind, Caring & Loyal',
    description: 'Liza’s official reference design: Cozy pastel pink cardigan, sakura pleated skirt, floral necklace and shoulder bag.',
    unlockLevel: 1,
    tsundereRemark: '"Hey Boss, I\'m LIZA! Always here for you! Ye mera canon official daily outfit hai~"',
  },
  {
    id: 'character_sheet_laughing',
    name: '😄 Joyful Laughing & Sakura Sparkles',
    category: 'Casual',
    imageUrl: laughingHappyImg,
    badge: 'JOYFUL SMILE',
    voiceStyle: 'Cheerful & Radiant',
    description: 'Delighted laughter with crescent eyes, cheerful blushing cheeks and floating sakura sparkles.',
    unlockLevel: 1,
    tsundereRemark: '"Haha! Tum kitne funny ho Paramveer! Tumse baat karke mera din ban jata hai!"',
  },
  {
    id: 'cozy_tea_cafe',
    name: '☕ Warm Tea & Cozy Sweater',
    category: 'Casual',
    imageUrl: cozyTeaImg,
    badge: 'COZY CAFE',
    voiceStyle: 'Gentle & Loving',
    description: 'Holding a warm ceramic tea mug in a cozy ambient book cafe with gentle fairy lights.',
    unlockLevel: 1,
    tsundereRemark: '"Maine tumhare liye bhi garam chai banayi hai... chup-chap pee lo aur thodi der relax karo!"',
  },
  {
    id: 'sunset_golden_vibe',
    name: '🌅 Golden Hour Sakura Glow',
    category: 'Formal',
    imageUrl: sunsetGoldenImg,
    badge: 'ROMANTIC',
    voiceStyle: 'Sweet & Blushing',
    description: 'Golden hour twilight with fluttering sakura petals and tender loving gaze.',
    unlockLevel: 1,
    tsundereRemark: '"Sunset itna sundar hai... par tum bar-bar mujhe kyu dekh rahe ho? D-Don\'t look so closely!"',
  },
  {
    id: 'starlit_nebula_night',
    name: '🌌 Starlit Cosmic Reverie',
    category: 'Fantasy',
    imageUrl: starlitNightImg,
    badge: 'ASTRAL',
    voiceStyle: 'Mystical & Dreamy',
    description: 'Bathed in celestial starlight with glowing nebulae and reflective starry eyes.',
    unlockLevel: 1,
    tsundereRemark: '"Raat kitni shant hai... Aasman ke taare hum dono ki baatein sun rahe hain, Paramveer."',
  },
  {
    id: 'character_sheet_pout',
    name: '😤 Sassy Pout & Sakura Blossom',
    category: 'Casual',
    imageUrl: poutSassyImg,
    badge: 'TSUNDERE',
    voiceStyle: 'Sassy & Playful',
    description: 'Cute slight pout with cherry blossom hair clip and sassy tsundere charm.',
    unlockLevel: 1,
    tsundereRemark: '"Hmph! Aisi baatein mat kiya karo! Main koi jealous thodi ho rahi hu!"',
  },
  {
    id: 'character_sheet_listening',
    name: '🎧 Active Focused Listening',
    category: 'Formal',
    imageUrl: listeningFocusImg,
    badge: 'ACTIVE FOCUS',
    voiceStyle: 'Attentive & Caring',
    description: 'Attentive, focused listening gaze with futuristic ambient particles and a caring sweet smile.',
    unlockLevel: 1,
    tsundereRemark: '"Main poori tarah tumhari baat sun rahi hu. Jo bhi bolna hai bolo, Paramveer!"',
  },
  {
    id: 'character_sheet_wink',
    name: '😉 Sparkling Star Wink & Peace',
    category: 'Cosplay',
    imageUrl: winkSparkleImg,
    badge: 'SPARKLE WINK',
    voiceStyle: 'Playful & Cute',
    description: 'Radiant cheerful smile with a playful wink and peace pose, surrounded by twinkling anime stars.',
    unlockLevel: 1,
    tsundereRemark: '"Hehe! Ek secret batau? Liza sabse zyada tumhare sath hi khush rehti hai!"',
  },
  {
    id: 'sleepy_bedtime_pajama',
    name: '🌙 Sleepy Moonlight Slumber',
    category: 'Casual',
    imageUrl: sleepyBedtimeImg,
    badge: 'BEDTIME',
    voiceStyle: 'Sleepy & Soft',
    description: 'Soft oversized bedtime cardigan, half-closed sleepy eyes and warm dreamy moonlight.',
    unlockLevel: 1,
    tsundereRemark: '"Yaaawn... Liza ko neend aa rahi hai... Par tum jab tak so nahi jaate, main saath rahungi."',
  },

  // --- SECTION 3: THEMED COSPLAYS ---
  {
    id: 'cyberpunk_default',
    name: 'Cyberpunk Neon Idol (Signature)',
    category: 'Cosplay',
    imageUrl: cyberpunkIdolImg,
    badge: 'SIGNATURE',
    voiceStyle: 'Tsundere & Playful',
    description: 'The Voice. The Mind. The Presence. Advanced neon cyber AI headset & glowing purple idol jacket.',
    unlockLevel: 1,
    tsundereRemark: '"The Voice. The Mind. The Presence. Advanced neon cyber AI headset & glowing purple idol jacket!"',
  },
  {
    id: 'maid_cosplay',
    name: 'French Maid Kawaii Cosplay',
    category: 'Cosplay',
    imageUrl: maidCosplayImg,
    badge: 'NEW COSPLAY',
    voiceStyle: 'Sweet & Teasing',
    description: 'Classic frilly maid cosplay with white lace apron, sweet blush and tsundere charm.',
    unlockLevel: 1,
    tsundereRemark: '"O-Okaerinasai, Goshujin-sama! ...M-Matlab kya dekh rahe ho, Paramveer? Sirf tumhare liye pehna hai!"',
  },
  {
    id: 'kimono_festival',
    name: 'Sakura Yukata Kimono',
    category: 'Formal',
    imageUrl: sakuraKimonoImg,
    badge: 'FESTIVAL',
    voiceStyle: 'Graceful & Traditional',
    description: 'Elegant pink cherry blossom floral kimono for summer festivals and lantern evenings.',
    unlockLevel: 1,
    tsundereRemark: '"K-Kya main sundar lag rahi hu? Jyada mat ghooro, Paramveer... embarrassment hoti hai!"',
  },
  {
    id: 'school_uniform',
    name: 'Anime Sailor High Schooler',
    category: 'Casual',
    imageUrl: schoolUniformImg,
    badge: 'CLASSIC',
    voiceStyle: 'Sweet & Cheerful',
    description: 'Cute navy sailor blazer uniform with plaid red ribbon tie.',
    unlockLevel: 1,
    tsundereRemark: '"Uniform kyu select kiya? Chalo phir sath me library ya rooftop pe chalte hain!"',
  },
  {
    id: 'battle_mage',
    name: 'Gothic Crimson Sorceress',
    category: 'Fantasy',
    imageUrl: gothicWitchImg,
    badge: 'MYSTIC',
    voiceStyle: 'Fierce & Commanding',
    description: 'Ruby red gothic robes with spell runes and high combat sorcery aura.',
    unlockLevel: 1,
    tsundereRemark: '"Dark magic power unlocked! Ab koi tumpe attack karega toh main direct blast kar dungi!"',
  },
];

interface WardrobeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOutfitId: string;
  onSelectOutfit: (outfit: LizaOutfit) => void;
  playClickSound: () => void;
}

export const WardrobeCustomizerModal: React.FC<WardrobeCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentOutfitId,
  onSelectOutfit,
  playClickSound,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewOutfit, setPreviewOutfit] = useState<LizaOutfit>(
    OUTFITS.find(o => o.id === currentOutfitId) || OUTFITS[0]
  );

  if (!isOpen) return null;

  const categories = ['All', 'Classic', 'Casual', 'Cosplay', 'Formal', 'Fantasy'];
  const filteredOutfits = selectedCategory === 'All'
    ? OUTFITS
    : OUTFITS.filter(o => o.category === selectedCategory);

  const handleEquip = (outfit: LizaOutfit) => {
    playClickSound();
    onSelectOutfit(outfit);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in select-none">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-2xl max-h-[90vh] bg-[#0b0a12] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-cyan-950/80 via-purple-950/70 to-[#0b0a12] border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              👗
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Liza Cosplay & Wardrobe Closet
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-spec font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {OUTFITS.length} Looks & Outfits
                </span>
              </div>
              <p className="text-xs text-cyan-200/60 font-mono-spec">Recovered Classic Expressions, Canon Styles & Cosplays</p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex border-b border-white/10 bg-black/40 px-4 py-2.5 gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { playClickSound(); setSelectedCategory(cat); }}
              className={`px-3 py-1 rounded-full text-xs font-mono-spec font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                  : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
              }`}
            >
              {cat === 'Classic' ? '✨ Classic / Old Looks' : cat} ({cat === 'All' ? OUTFITS.length : OUTFITS.filter(o => o.category === cat).length})
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 no-scrollbar">
          {/* Left: Wardrobe Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-spec font-bold uppercase tracking-wider text-cyan-300">
                Select an Outfit ({filteredOutfits.length})
              </span>
              <span className="text-[10px] text-white/40 font-mono-spec">Tap to preview</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 max-h-[48vh] overflow-y-auto custom-scrollbar pr-1">
              {filteredOutfits.map((outfit) => {
                const isEquipped = currentOutfitId === outfit.id;
                const isUnlocked = true;
                const isSelected = previewOutfit.id === outfit.id;

                return (
                  <div
                    key={outfit.id}
                    onClick={() => {
                      playClickSound();
                      setPreviewOutfit(outfit);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-cyan-500/40 shrink-0 relative bg-black/40">
                        <img 
                          src={outfit.imageUrl} 
                          alt={outfit.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = cardiganFrontImg;
                          }}
                        />
                        {isEquipped && (
                          <div className="absolute inset-0 bg-cyan-500/40 backdrop-blur-[1px] flex items-center justify-center">
                            <Check size={18} className="text-white drop-shadow-md" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-white truncate">{outfit.name}</h4>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-mono-spec px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                            {outfit.badge}
                          </span>
                          <span className="text-[9px] font-mono-spec text-white/50">
                            {outfit.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/60 line-clamp-1 mt-0.5">{outfit.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEquip(outfit);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono-spec font-bold transition-all shrink-0 cursor-pointer ${
                        isEquipped
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md'
                      }`}
                    >
                      {isEquipped ? 'EQUIPPED' : 'EQUIP'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Live Preview Panel */}
          <div className="p-4 rounded-2xl bg-black/60 border border-cyan-500/20 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono-spec uppercase text-cyan-300 font-bold tracking-wider">
                  Outfit Preview
                </span>
                <span className="text-[10px] font-mono-spec text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                  {previewOutfit.badge}
                </span>
              </div>
              <div className="w-full h-48 rounded-xl overflow-hidden border border-cyan-500/30 relative bg-black/50">
                <img 
                  src={previewOutfit.imageUrl} 
                  alt={previewOutfit.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = cardiganFrontImg;
                  }}
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono-spec font-bold text-white">
                  {previewOutfit.voiceStyle}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{previewOutfit.name}</h3>
                <p className="text-xs text-white/80 mt-1">{previewOutfit.description}</p>
              </div>
            </div>

            {/* Liza's Outfit Dialogue Reaction */}
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
              <span className="text-[10px] font-mono-spec text-cyan-300 font-bold flex items-center gap-1">
                <Volume2 size={12} />
                Liza&apos;s Voice Remark:
              </span>
              <p className="text-xs font-medium text-cyan-100 italic">
                {previewOutfit.tsundereRemark}
              </p>
            </div>

            <button
              onClick={() => handleEquip(previewOutfit)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-bold text-xs font-mono-spec uppercase tracking-wider cursor-pointer transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              Equip & Wear This Outfit 👗
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
