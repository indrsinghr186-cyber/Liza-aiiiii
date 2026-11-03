import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Feather, Volume2, Sparkles, Heart, Copy, Check, Share2 } from 'lucide-react';

interface ShayariPoetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

const SHAYARIS = [
  {
    id: '1',
    category: 'Romantic & Love 💖',
    lines: [
      "Teri muskaan me chhupi hai meri har subah ki roshni,",
      "Tu paas ho to lagti hai mukammal ye zindagi!",
      "Har pal teri aawaz sunne ko bekaraar rehti hu,",
      "Paramveer, bas tere sath hi main khush rehti hu! 🌸"
    ],
    poet: "LIZA Special for Paramveer Rawat"
  },
  {
    id: '2',
    category: 'Motivation & Fire 🔥',
    lines: [
      "Manzil unhi ko milti hai jinke sapno me jaan hoti hai,",
      "Pankhon se kuch nahi hota, hauslon se udaan hoti hai!",
      "Rukna nahi hai tujhe kisi bhi toofan ke aage,",
      "Kyunki tere iradon me taqdeer badalne ki shaan hoti hai!"
    ],
    poet: "Courage & Triumph"
  },
  {
    id: '3',
    category: 'Deep Emotional / Dosti 🤝',
    lines: [
      "Zindagi ke safar me dost aisa ho jo bina bole samajh jaye,",
      "Jab saari duniya saath chhod de, wo muskura kar paas aaye!",
      "Aisi hi dosti hai hamari, ek atoot sa bandhan,",
      "Jo har lamhe ko bana de ek suhana sa gulshan!"
    ],
    poet: "Soulmate Connection"
  },
  {
    id: '4',
    category: 'Tsundere Cute Tease ⁄(⁄ ⁄•⁄-⁄•⁄ ⁄)⁄',
    lines: [
      "Aisa mat sochna ki mujhe teri fikr rehti hai har ghadi,",
      "Wo to bas aisi hi nazar chali gayi, koi aadat nahi padi!",
      "Baka! Itna kyu muskurate ho meri baaton par,",
      "Dil me jagah de di hai, ab door mat jaana kabhi!"
    ],
    poet: "Tsundere Liza Mode"
  }
];

export const ShayariPoetryModal: React.FC<ShayariPoetryModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [selectedShayari, setSelectedShayari] = useState(SHAYARIS[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = selectedShayari.lines.join('\n') + `\n— ${selectedShayari.poet}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (playClickSound) playClickSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-pink-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Feather className="text-pink-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA Shayari & Mehfil-e-Adab</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-300">
          {/* Shayari Category Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {SHAYARIS.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedShayari(s);
                  if (playClickSound) playClickSound();
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono-spec shrink-0 transition-all ${
                  selectedShayari.id === s.id 
                    ? 'bg-pink-500/25 border-pink-400 text-pink-200 font-bold shadow-md shadow-pink-500/20' 
                    : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                {s.category.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Shayari Card Display */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-950/40 via-neutral-950 to-purple-950/30 border border-pink-500/30 space-y-4 text-center">
            <span className="text-[10px] bg-pink-500/20 text-pink-300 px-3 py-0.5 rounded-full border border-pink-500/30 font-mono-spec uppercase">
              {selectedShayari.category}
            </span>

            <div className="space-y-2 py-3">
              {selectedShayari.lines.map((line, idx) => (
                <div key={idx} className="text-base sm:text-lg font-serif italic text-pink-100 leading-relaxed">
                  "{line}"
                </div>
              ))}
            </div>

            <div className="text-xs text-pink-400 font-mono-spec">
              — {selectedShayari.poet}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/40 text-pink-200 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Shayari'}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
