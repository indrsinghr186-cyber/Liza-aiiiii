import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, UtensilsCrossed, Clock, Flame, Sparkles, ChefHat, CheckCircle2 } from 'lucide-react';

interface RecipeChefModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

const RECIPES = [
  {
    id: '1',
    name: 'Desi Masala Butter Maggi 🍜',
    time: '8 Mins',
    difficulty: 'Easy',
    ingredients: ['Maggi 1 pack', 'Butter 1 tbsp', 'Chopped Onion', 'Tomato', 'Green Chilli', 'Pinch of Garam Masala'],
    steps: [
      'Melt butter in a pan and sauté chopped onions and green chilli for 1 min.',
      'Add chopped tomato and a pinch of garam masala and sauté till soft.',
      'Add 1.5 cups of water and Maggi tastemaker; bring to a bubbling boil.',
      'Break Maggi noodles and cook for 2 mins until the gravy turns rich and saucy!',
      'Garnish with extra butter and fresh coriander. Liza says: Itadakimasu! 😋'
    ]
  },
  {
    id: '2',
    name: 'Cardamom Ginger Kadak Chai ☕',
    time: '6 Mins',
    difficulty: 'Easy',
    ingredients: ['Milk 1 cup', 'Water 1/2 cup', 'Tea Leaves 1.5 tsp', 'Crushed Ginger', 'Crushed Cardamom 2 pods', 'Sugar 1.5 tsp'],
    steps: [
      'Boil water with crushed ginger and freshly pounded cardamom for 2 mins to extract flavors.',
      'Add tea leaves and let it brew until deep golden.',
      'Pour in fresh milk and sugar; bring to 3 rolling boils on medium flame.',
      'Strain hot into a kullad or cup. Enjoy with biscuits while chatting with Liza!'
    ]
  },
  {
    id: '3',
    name: 'Quick Paneer Bhurji Wrap 🌯',
    time: '12 Mins',
    difficulty: 'Medium',
    ingredients: ['Paneer 150g crumbled', 'Onion & Tomato', 'Capsicum', 'Turmeric', 'Jeera', 'Roti/Tortilla', 'Green Chutney'],
    steps: [
      'Heat oil with jeera, sauté onions, capsicum, and tomatoes with turmeric and salt.',
      'Add crumbled fresh paneer and mix gently for 3 mins (do not overcook).',
      'Spread green chutney on warm roti, place hot paneer filling, roll tightly and toast lightly in butter!'
    ]
  },
  {
    id: '4',
    name: 'Japanese Tamago Egg Toast 🍞',
    time: '7 Mins',
    difficulty: 'Easy',
    ingredients: ['Bread 2 slices', 'Eggs 2', 'Mayo 1 tbsp', 'Black Pepper', 'Butter 1 tsp'],
    steps: [
      'Hard boil or soft scramble eggs with 1 tbsp Japanese mayo, pinch of salt and black pepper.',
      'Toast thick bread slices with butter until golden crispy.',
      'Layer creamy egg filling between bread slices and slice diagonally. Enjoy!'
    ]
  }
];

export const RecipeChefModal: React.FC<RecipeChefModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [selectedRecipe, setSelectedRecipe] = useState(RECIPES[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-orange-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="text-orange-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA Kitchen Chef & Recipe Guide</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-300">
          {/* Recipe Chips Carousel */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {RECIPES.map(r => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedRecipe(r);
                  if (playClickSound) playClickSound();
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono-spec shrink-0 transition-all ${
                  selectedRecipe.id === r.id 
                    ? 'bg-orange-500/25 border-orange-400 text-orange-200 font-bold shadow-md shadow-orange-500/20' 
                    : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          {/* Active Recipe Details */}
          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-orange-500/20 space-y-4">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedRecipe.name}</h3>
                <div className="flex items-center gap-3 text-[11px] text-orange-300 font-mono-spec mt-1">
                  <span className="flex items-center gap-1"><Clock size={12}/> {selectedRecipe.time}</span>
                  <span className="flex items-center gap-1"><Flame size={12}/> {selectedRecipe.difficulty}</span>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono-spec font-bold text-neutral-400 uppercase tracking-wider block">
                Required Ingredients:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedRecipe.ingredients.map((ing, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-black/50 border border-white/10 text-xs text-neutral-200">
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Step by step directions */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono-spec font-bold text-neutral-400 uppercase tracking-wider block">
                Cooking Directions:
              </span>
              <div className="space-y-2">
                {selectedRecipe.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                    <span className="w-5 h-5 rounded-full bg-orange-600/30 text-orange-300 font-mono-spec font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
