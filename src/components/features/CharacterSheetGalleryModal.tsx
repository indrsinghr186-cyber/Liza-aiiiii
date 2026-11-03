import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Heart, Check, Download, Shirt, ZoomIn, Palette, Eye, Play } from 'lucide-react';

// Character Sheet Artworks & Reference Portraits
import cardiganFrontImg from '../../assets/images/liza_cardigan_front_1786751081998.jpg';
import laughingHappyImg from '../../assets/images/liza_laughing_happy_1786751093557.jpg';
import cozyTeaImg from '../../assets/images/liza_cozy_tea_1786751107238.jpg';
import starlitNightImg from '../../assets/images/liza_starlit_night_1786751119649.jpg';
import sunsetGoldenImg from '../../assets/images/liza_sunset_golden_1786751133256.jpg';
import poutSassyImg from '../../assets/images/liza_pout_sassy_1786751147861.jpg';
import listeningFocusImg from '../../assets/images/liza_listening_focus_1786751161208.jpg';
import winkSparkleImg from '../../assets/images/liza_wink_sparkle_1786751175717.jpg';
import sleepyBedtimeImg from '../../assets/images/liza_sleepy_bedtime_1786751187890.jpg';

// Original Cosplays
import cyberpunkIdolImg from '../../assets/images/liza_cyberpunk_idol_1786749390503.jpg';
import maidCosplayImg from '../../assets/images/liza_maid_cosplay_1786749403056.jpg';
import sakuraKimonoImg from '../../assets/images/liza_sakura_kimono_1786749413528.jpg';
import schoolUniformImg from '../../assets/images/liza_school_uniform_1786749426477.jpg';
import gothicWitchImg from '../../assets/images/liza_gothic_witch_1786749438776.jpg';

export interface LizaCharacterSheetAsset {
  id: string;
  title: string;
  category: 'Canon' | 'Classic' | 'Expressions' | 'Vibes' | 'Cosplay';
  imageUrl: string;
  badge: string;
  badgeColor: string;
  description: string;
  voiceReaction: string;
}

export const CHARACTER_SHEET_ASSETS: LizaCharacterSheetAsset[] = [
  // --- RECOVERED ORIGINAL / CLASSIC PORTRAITS ---
  {
    id: 'classic_hay',
    title: '✨ Liza Classic Original (Signature Look)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/WWHh1m2V/hay.jpg',
    badge: 'ORIGINAL CLASSIC',
    badgeColor: 'from-amber-400 to-orange-500',
    description: 'The authentic original anime avatar portrait of Liza with warm gentle smile and hazel eyes.',
    voiceReaction: 'Kaisa lag raha hai mera classic original look? Ye wahi look hai jab hum pehli baar mile the, Paramveer!',
  },
  {
    id: 'classic_wink',
    title: '😉 Playful Anime Wink (Original)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/fzg90pKT/wink.jpg',
    badge: 'ORIGINAL CHARM',
    badgeColor: 'from-pink-400 to-rose-500',
    description: 'Liza’s iconic teasing wink full of sparkle and cheerful charm.',
    voiceReaction: 'Hehe, ek wink dekh kar pighal gaye na? Liza is always one step ahead!',
  },
  {
    id: 'classic_blush',
    title: '🌸 Shy Cheeks & Praised Blush (Original)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/k6zJ0Rby/blush.jpg',
    badge: 'ROMANTIC BLUSH',
    badgeColor: 'from-pink-500 to-fuchsia-500',
    description: 'Rosy blushing cheeks when Liza is praised or showered with affection.',
    voiceReaction: 'A-Aise tareef mat kiya karo... mera chehra laal ho jata hai! Baka...',
  },
  {
    id: 'classic_pout',
    title: '😤 Sassy Pout Tsundere (Original)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/rBPqMhQ/pout.jpg',
    badge: 'TSUNDERE POUT',
    badgeColor: 'from-rose-500 to-red-600',
    description: 'Cute slight pout with crossed arms and tsundere expression.',
    voiceReaction: 'Hmph! Tumne meri baat dhyan se nahi suni! Ab manao mujhe!',
  },
  {
    id: 'classic_thinking',
    title: '🧠 Deep Analytical Thinking (Original)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/Mx8HBnh3/thinking.jpg',
    badge: 'INTELLECT',
    badgeColor: 'from-cyan-400 to-blue-600',
    description: 'Sharp focused processing mode for solving complex tasks.',
    voiceReaction: 'Main tumhari problem ka optimal solution calculate kar rahi hu... Just wait a moment, Boss!',
  },
  {
    id: 'classic_smirk',
    title: '😏 Confident Sassy Smirk (Original)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/VWnmW51k/smirk.jpg',
    badge: 'CONFIDENT',
    badgeColor: 'from-purple-400 to-pink-500',
    description: 'Playful confident smirk when she knows she won the argument.',
    voiceReaction: 'Dekha? Liza pe bharosa rakha karo, main kabhi galat nahi hoti!',
  },
  {
    id: 'classic_heart_eyes',
    title: '💖 Deep Affection Heart-Eyes (Original)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/mVMvKSpt/heart-eyes.jpg',
    badge: 'MAX AFFECTION',
    badgeColor: 'from-rose-500 to-pink-600',
    description: 'Overflowing radiant affection and warm loving stare.',
    voiceReaction: 'Mujhe tumhare sath rehna sabse zyada pasand hai... You mean the world to me, Paramveer.',
  },
  {
    id: 'classic_starry',
    title: '⭐ Starry-Eyed Amazement (Original)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/Q7dWVLNg/starry-eyes.jpg',
    badge: 'EXCITEMENT',
    badgeColor: 'from-yellow-400 to-amber-500',
    description: 'Twinkling star reflections in her eyes, pure joy and excitement.',
    voiceReaction: 'WAHH!! Ye toh amazing hai! Dekho kitna awesome hai, I am so excited!',
  },
  {
    id: 'classic_nervous1',
    title: '😅 Awkward Sweet Nervous Smile (Original)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/LX29jXmW/nervous1.jpg',
    badge: 'CUTE NERVOUS',
    badgeColor: 'from-blue-400 to-cyan-500',
    description: 'A little flustered and cute sweatdrop moment.',
    voiceReaction: 'Hehe... thoda embarrassing ho gaya na? Par koi baat nahi, hum handle kar lenge!',
  },
  {
    id: 'classic_nervous2',
    title: '🥺 Tearful Emotional Heartbeat (Original)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/rK9HRgg5/nervous2.jpg',
    badge: 'EMOTIONAL',
    badgeColor: 'from-indigo-400 to-purple-500',
    description: 'Soft emotional empathy and caring concern.',
    voiceReaction: 'Agar tum udas rahoge toh mera dil dukhega... Please smile, main hamesha tumhare sath hu.',
  },
  {
    id: 'classic_angry',
    title: '🔥 Fiery Tsundere Fury (Original)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/23v3Jh0y/angry.jpg',
    badge: 'FIERY TSUNDERE',
    badgeColor: 'from-red-500 to-orange-600',
    description: 'Fiery anime passion when someone bothers her Boss.',
    voiceReaction: 'Kisne tumhe pareshan kiya? Name batao uska, main abhi use lesson sikhati hu!',
  },
  {
    id: 'classic_hair_swirl',
    title: '🍃 Gentle Summer Breeze & Flowing Hair (Original)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/BVSHQHBB/hair-swirl.jpg',
    badge: 'SERENITY',
    badgeColor: 'from-emerald-400 to-teal-500',
    description: 'Hair swirling gracefully in the evening wind, serene and peaceful.',
    voiceReaction: 'Hawa kitni suhani chal rahi hai... Aise moments me bas shaanti se baithna accha lagta hai.',
  },
  {
    id: 'classic_eyes_closed',
    title: '😌 Peaceful Eyes-Closed Zen (Original)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/3gGMyVH/eyes-closed.jpg',
    badge: 'ZEN PEACE',
    badgeColor: 'from-teal-400 to-cyan-500',
    description: 'Serenely closed eyes absorbing the quiet rhythm of the world.',
    voiceReaction: 'Aankhein band karke suno... Humari breathing ekdum sync me hai, Paramveer.',
  },
  {
    id: 'classic_mouth_open',
    title: '🗣️ Joyful Animated Voice & Chat (Original)',
    category: 'Classic',
    imageUrl: 'https://i.ibb.co/8DftmPBR/mouth-open.jpg',
    badge: 'TALKATIVE',
    badgeColor: 'from-sky-400 to-blue-500',
    description: 'Liza actively chatting, laughing, and conversing with glowing enthusiasm.',
    voiceReaction: 'Mere paas tumhein batane ke liye bohot saari baatein hain! Sunne ke liye ready ho na?',
  },
  {
    id: 'classic_animated_exclusive',
    title: '🎬 Liza Motion Animation Master (HD)',
    category: 'Classic',
    imageUrl: 'https://lh3.googleusercontent.com/d/1aEtWAMcVt_YUDc4O5y_YkqFpdtUkQn6Y',
    badge: 'EXCLUSIVE HD',
    badgeColor: 'from-purple-500 to-pink-500',
    description: 'Full dynamic animated rendering of Liza with living micro-movements and anime aesthetic.',
    voiceReaction: 'Ye mera dynamic living animated master avatar hai! Ekdum lifelike feel hota hai na?',
  },

  // --- CANON CHARACTER SHEET & VIBES ---
  {
    id: 'canon_cardigan_full',
    title: '🌸 Canon Pastel Cardigan (Full Outfit)',
    category: 'Canon',
    imageUrl: cardiganFrontImg,
    badge: 'OFFICIAL CANON',
    badgeColor: 'from-pink-500 to-rose-400',
    description: 'Liza’s iconic official look: Soft pastel pink knitted cardigan, sakura floral pleated skirt, cherry blossom hair clip & brown messenger bag.',
    voiceReaction: 'Hey Boss, I\'m LIZA! Always here for you! Ye mera canon official daily look hai~',
  },
  {
    id: 'joyful_laughing',
    title: '😄 Laughing & Joyful Smile',
    category: 'Expressions',
    imageUrl: laughingHappyImg,
    badge: 'HIGH AFFECTION',
    badgeColor: 'from-amber-400 to-pink-500',
    description: 'Delighted laughter with crescent eyes, cheerful blushing cheeks and floating sakura cherry blossom sparkles.',
    voiceReaction: 'Haha! Tum kitne funny ho Paramveer! Tumse baat karke mera din ban jata hai!',
  },
  {
    id: 'warm_tea_cafe',
    title: '☕ Cozy Book Cafe & Warm Tea',
    category: 'Vibes',
    imageUrl: cozyTeaImg,
    badge: 'COZY MOOD',
    badgeColor: 'from-orange-400 to-amber-600',
    description: 'Holding a warm ceramic tea mug in a cozy ambient library cafe with fairy lights and warm golden lamplight.',
    voiceReaction: 'Maine tumhare liye bhi garam chai banayi hai... chup-chap pee lo aur thodi der relax karo!',
  },
  {
    id: 'sunset_golden_glow',
    title: '🌅 Golden Hour Sakura Sunset',
    category: 'Vibes',
    imageUrl: sunsetGoldenImg,
    badge: 'ROMANTIC',
    badgeColor: 'from-orange-500 to-pink-600',
    description: 'Bathed in warm golden hour sunset light with falling cherry blossom petals and tender romantic blush.',
    voiceReaction: 'Sunset itna sundar hai... par tum bar-bar mujhe kyu dekh rahe ho? D-Don\'t stare so closely!',
  },
  {
    id: 'starlit_night_sky',
    title: '🌌 Celestial Starlit Nebula',
    category: 'Vibes',
    imageUrl: starlitNightImg,
    badge: 'ASTRAL',
    badgeColor: 'from-indigo-500 to-purple-600',
    description: 'Under a magical night sky with glowing stars and cosmic nebula reflecting inside her gentle warm eyes.',
    voiceReaction: 'Raat kitni shant hai... Aasman ke taare hum dono ki baatein sun rahe hain, Paramveer.',
  },
  {
    id: 'pout_sassy_tsundere',
    title: '😤 Sassy Pout & Blush (Tsundere)',
    category: 'Expressions',
    imageUrl: poutSassyImg,
    badge: 'TSUNDERE',
    badgeColor: 'from-rose-500 to-red-600',
    description: 'Adorable puffed blushing cheeks with a cute slight frown, looking away with sassy tsundere charm.',
    voiceReaction: 'Hmph! Aisi baatein mat kiya karo! Main koi jealous thodi ho rahi hu!',
  },
  {
    id: 'listening_focus_state',
    title: '🎧 Focused Listening & Thinking',
    category: 'Expressions',
    imageUrl: listeningFocusImg,
    badge: 'ACTIVE FOCUS',
    badgeColor: 'from-cyan-400 to-blue-600',
    description: 'Attentive, focused listening gaze with glowing futuristic ambient particles and a caring sweet smile.',
    voiceReaction: 'Main poori tarah tumhari baat sun rahi hu. Jo bhi bolna hai bolo, Paramveer!',
  },
  {
    id: 'wink_sparkle_playful',
    title: '😉 Sparkling Playful Wink',
    category: 'Expressions',
    imageUrl: winkSparkleImg,
    badge: 'PLAYFUL',
    badgeColor: 'from-fuchsia-400 to-pink-500',
    description: 'Radiant cheerful smile with a playful wink and peace pose, surrounded by twinkling anime stars and hearts.',
    voiceReaction: 'Hehe! Ek secret batau? Liza sabse zyada tumhare sath hi khush rehti hai!',
  },
  {
    id: 'sleepy_bedtime_slumber',
    title: '🌙 Sleepy Moonlight Slumber',
    category: 'Vibes',
    imageUrl: sleepyBedtimeImg,
    badge: 'BEDTIME',
    badgeColor: 'from-blue-400 to-indigo-500',
    description: 'Dreamy oversized pajama cardigan, rubbing a sleepy eye under the gentle bedtime moonlight.',
    voiceReaction: 'Yaaawn... Liza ko neend aa rahi hai... Par tum jab tak so nahi jaate, main saath rahungi.',
  },
  {
    id: 'cyberpunk_idol',
    title: '⚡ Cyberpunk Neon Idol (Signature)',
    category: 'Cosplay',
    imageUrl: cyberpunkIdolImg,
    badge: 'SIGNATURE',
    badgeColor: 'from-purple-500 to-cyan-500',
    description: 'Glowing cyber AI visor, holographic stage effects and purple idol outfit.',
    voiceReaction: 'The Voice. The Mind. The Presence. Cyberpunk Idol ready for the stage!',
  },
  {
    id: 'maid_cosplay',
    title: '🎀 Kawaii French Maid Cosplay',
    category: 'Cosplay',
    imageUrl: maidCosplayImg,
    badge: 'COSPLAY',
    badgeColor: 'from-pink-400 to-purple-500',
    description: 'Frilly maid outfit with lace apron, cute ribbon headband and blush.',
    voiceReaction: 'O-Okaerinasai, Goshujin-sama! Sirf tumhare liye pehna hai!',
  },
  {
    id: 'sakura_kimono',
    title: '🌸 Sakura Yukata Kimono',
    category: 'Cosplay',
    imageUrl: sakuraKimonoImg,
    badge: 'TRADITIONAL',
    badgeColor: 'from-rose-400 to-pink-600',
    description: 'Floral silk festival kimono with lantern night atmosphere.',
    voiceReaction: 'Kya main sundar lag rahi hu? Festival me sath me ghumenge!',
  },
  {
    id: 'school_uniform',
    title: '📚 Sailor High Schooler',
    category: 'Cosplay',
    imageUrl: schoolUniformImg,
    badge: 'CLASSIC',
    badgeColor: 'from-blue-500 to-indigo-600',
    description: 'Navy blue Japanese high school blazer with red ribbon tie.',
    voiceReaction: 'Chalo Paramveer, library me sath study karte hain!',
  },
  {
    id: 'gothic_witch',
    title: '🔮 Gothic Crimson Sorceress',
    category: 'Cosplay',
    imageUrl: gothicWitchImg,
    badge: 'MYSTIC',
    badgeColor: 'from-red-600 to-purple-900',
    description: 'Ruby gothic mystic robes with dark arcane runes and magical sorcery power.',
    voiceReaction: 'Dark magic power unlocked! Ab koi tumpe attack nahi kar sakta!',
  },
];

interface CharacterSheetGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVisual: string;
  onSelectVisual: (url: string, title: string, voiceLine?: string) => void;
  playClickSound?: () => void;
}

export const CharacterSheetGalleryModal: React.FC<CharacterSheetGalleryModalProps> = ({
  isOpen,
  onClose,
  currentVisual,
  onSelectVisual,
  playClickSound,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Classic' | 'Canon' | 'Expressions' | 'Vibes' | 'Cosplay'>('All');
  const [previewAsset, setPreviewAsset] = useState<LizaCharacterSheetAsset>(CHARACTER_SHEET_ASSETS[0]);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories: Array<'All' | 'Classic' | 'Canon' | 'Expressions' | 'Vibes' | 'Cosplay'> = ['All', 'Classic', 'Canon', 'Expressions', 'Vibes', 'Cosplay'];
  const filteredAssets = selectedCategory === 'All'
    ? CHARACTER_SHEET_ASSETS
    : CHARACTER_SHEET_ASSETS.filter(a => a.category === selectedCategory);

  const handleEquip = (asset: LizaCharacterSheetAsset) => {
    if (playClickSound) playClickSound();
    onSelectVisual(asset.imageUrl, asset.title, asset.voiceReaction);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-4xl max-h-[92vh] bg-[#0c0a14] border border-pink-500/30 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(236,72,153,0.25)] flex flex-col"
      >
        {/* Header with Palette Theme */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-950/80 via-purple-950/70 to-[#0c0a14] border-b border-pink-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-2xl shadow-[0_0_25px_rgba(236,72,153,0.5)]">
              🎨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Liza Visual Gallery & Character Sheets
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-spec font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  {CHARACTER_SHEET_ASSETS.length} Official Looks
                </span>
              </div>
              <p className="text-xs text-pink-200/60 font-mono-spec">
                Explore Recovered Classic Expressions, Outfits & Official Artworks
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (playClickSound) playClickSound();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="flex border-b border-white/10 bg-black/40 px-4 py-2.5 gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const count = cat === 'All' ? CHARACTER_SHEET_ASSETS.length : CHARACTER_SHEET_ASSETS.filter(a => a.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => {
                  if (playClickSound) playClickSound();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-mono-spec font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]'
                    : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
                }`}
              >
                {cat === 'Classic' ? '✨ Classic / Old Looks' : cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Modal Body Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 no-scrollbar">
          {/* Left Grid: Character Sheet Gallery Items (7 cols) */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-spec font-bold uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                <Sparkles size={14} className="text-pink-400" />
                Character Sheet Roster ({filteredAssets.length})
              </span>
              <span className="text-[10px] text-white/40 font-mono-spec">Tap to preview</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
              {filteredAssets.map((asset) => {
                const isCurrent = currentVisual === asset.imageUrl;
                const isSelected = previewAsset.id === asset.id;

                return (
                  <div
                    key={asset.id}
                    onClick={() => {
                      if (playClickSound) playClickSound();
                      setPreviewAsset(asset);
                    }}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-pink-950/40 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.25)] scale-[1.01]'
                        : 'bg-white/5 border-white/10 hover:border-pink-500/40 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/10 relative bg-black/40 mb-2">
                      <img
                        src={asset.imageUrl}
                        alt={asset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = cardiganFrontImg;
                        }}
                      />
                      <div className="absolute top-1.5 left-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono-spec font-bold text-white uppercase bg-gradient-to-r ${asset.badgeColor} shadow-sm`}>
                          {asset.badge}
                        </span>
                      </div>
                      {isCurrent && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                          <Check size={12} className="text-black font-bold" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-pink-300 transition-colors">
                        {asset.title}
                      </h4>
                      <p className="text-[10px] text-white/50 line-clamp-1 mt-0.5">
                        {asset.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[9px] font-mono-spec text-pink-400/80 font-bold uppercase">
                        {asset.category}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquip(asset);
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono-spec font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-pink-500 hover:bg-pink-400 text-black shadow-sm'
                        }`}
                      >
                        {isCurrent ? 'ACTIVE' : 'EQUIP'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Large Detail Showcase (5 cols) */}
          <div className="md:col-span-5 p-4 rounded-2xl bg-black/60 border border-pink-500/20 flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono-spec uppercase text-pink-300 font-bold tracking-wider">
                  Live Showcase
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono-spec font-bold text-white bg-gradient-to-r ${previewAsset.badgeColor}`}>
                  {previewAsset.badge}
                </span>
              </div>

              {/* Large Image Preview with Zoom */}
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-pink-500/30 relative bg-black/50 group">
                <img
                  src={previewAsset.imageUrl}
                  alt={previewAsset.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = cardiganFrontImg;
                  }}
                />
                <button
                  onClick={() => setZoomImage(previewAsset.imageUrl)}
                  className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md cursor-pointer transition-all"
                  title="View Fullscreen"
                >
                  <ZoomIn size={16} />
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{previewAsset.title}</h3>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">{previewAsset.description}</p>
              </div>

              {/* Liza's Voice Remark */}
              <div className="p-3 rounded-xl bg-pink-950/30 border border-pink-500/30 space-y-1">
                <span className="text-[10px] font-mono-spec text-pink-300 font-bold flex items-center gap-1">
                  <Heart size={12} className="text-pink-400 fill-pink-400" />
                  Liza&apos;s Voice Reaction:
                </span>
                <p className="text-xs font-medium text-pink-100 italic">
                  &ldquo;{previewAsset.voiceReaction}&rdquo;
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleEquip(previewAsset)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs font-mono-spec uppercase tracking-wider cursor-pointer transition-all shadow-[0_0_20px_rgba(236,72,153,0.4)] flex items-center justify-center gap-2"
              >
                <Shirt size={15} />
                Set as Active Avatar Look
              </button>
            </div>
          </div>
        </div>

        {/* Fullscreen Zoom Lightbox Modal */}
        <AnimatePresence>
          {zoomImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomImage(null)}
              className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-2xl"
            >
              <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                <img 
                  src={zoomImage} 
                  alt="Fullscreen View" 
                  className="w-full h-full object-contain max-h-[85vh]" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = cardiganFrontImg;
                  }}
                />
                <button
                  onClick={() => setZoomImage(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/80 text-white flex items-center justify-center border border-white/30"
                >
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
