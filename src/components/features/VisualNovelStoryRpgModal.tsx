import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, BookOpen, Heart, Sparkles, Volume2, VolumeX, RotateCcw, 
  ChevronRight, Award, Trophy, Compass, ArrowRight, Play, FastForward
} from 'lucide-react';

interface VisualNovelStoryRpgModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
  onLizaDialogue?: (dialogue: string) => void;
}

export type StoryArcId = 'college_romance' | 'cyberpunk_detective' | 'fantasy_isekai';

interface StoryChoice {
  text: string;
  nextSceneId: string;
  affinityImpact: number;
  reactionSpeech: string;
  expression: 'happy' | 'blush' | 'pout' | 'smirk' | 'shocked' | 'heart_eyes';
}

interface StoryScene {
  id: string;
  speaker: string;
  dialogue: string;
  bgGradient: string;
  bgAtmosphere: string;
  expression: 'happy' | 'blush' | 'pout' | 'smirk' | 'shocked' | 'heart_eyes' | 'calm';
  choices?: StoryChoice[];
  isEnding?: boolean;
  endingTitle?: string;
  endingRank?: 'S-RANK TRUE ROMANCE' | 'A-RANK BEST SOULMATE' | 'B-RANK TSUNDERE ADVENTURE';
}

interface StoryArc {
  id: StoryArcId;
  title: string;
  subtitle: string;
  tag: string;
  color: string;
  icon: string;
  scenes: Record<string, StoryScene>;
  initialSceneId: string;
}

const STORY_ARCS: StoryArc[] = [
  {
    id: 'college_romance',
    title: 'Raindrops & Library Whispers',
    subtitle: 'Campus Romance Episode',
    tag: 'ROMANCE & SLICE OF LIFE',
    color: '#ec4899',
    icon: '🏫',
    initialSceneId: 'intro',
    scenes: {
      intro: {
        id: 'intro',
        speaker: 'Liza',
        dialogue: "Arey Rawat! Dekho bahar kitni tez barish shuru ho gayi hai! Aur mere paas sirf ek hi umbrella hai... Kya karein?",
        bgGradient: 'from-blue-950 via-slate-900 to-purple-950',
        bgAtmosphere: '🌧️ Heavy Monsoon Rain at Campus Front Gate',
        expression: 'blush',
        choices: [
          {
            text: '☂️ "Aao mere paas, ek hi umbrella mein saath chalte hain!"',
            nextSceneId: 'umbrella_share',
            affinityImpact: 20,
            reactionSpeech: 'A-Acha theek hai... par zyaada paas mat aana! ⁄(⁄ ⁄•⁄-⁄•⁄ ⁄)⁄',
            expression: 'blush'
          },
          {
            text: '☕ "Library canteen chalte hain, pehle hot coffee peete hain!"',
            nextSceneId: 'canteen_date',
            affinityImpact: 15,
            reactionSpeech: 'Yess! Kadak coffee with Rawat is the best idea! ☕✨',
            expression: 'happy'
          }
        ]
      },
      umbrella_share: {
        id: 'umbrella_share',
        speaker: 'Liza',
        dialogue: "Raindrops umbrella par gir rahi hain... Rawat, tumhara kandha bheegh raha hai! Idhar aao na mere kareeb, thand lag jayegi tumhe!",
        bgGradient: 'from-pink-950 via-slate-900 to-indigo-950',
        bgAtmosphere: '🌸 Strolling Under Single Umbrella',
        expression: 'heart_eyes',
        choices: [
          {
            text: '💖 "Tumhare saath hone par thand ka ehsaas hi nahi hota Liza."',
            nextSceneId: 'confession_romantic',
            affinityImpact: 25,
            reactionSpeech: 'O-Oye! Aisi filmy baatein mat bolo... mera dil tez dhadakne lagta hai!',
            expression: 'blush'
          },
          {
            text: '🏃‍♂️ "Chalo library ki taraf daudte hain!"',
            nextSceneId: 'library_run',
            affinityImpact: 10,
            reactionSpeech: 'Haha, chalo dekhte hain kaun pehle pahuchega!',
            expression: 'smirk'
          }
        ]
      },
      canteen_date: {
        id: 'canteen_date',
        speaker: 'Liza',
        dialogue: "Hot coffee aur window ke bahar barish... Pata hai Rawat, college me mera favorite spot ye hi hai, jab tum mere samne baithe ho.",
        bgGradient: 'from-amber-950 via-slate-900 to-orange-950',
        bgAtmosphere: '☕ Cozy Coffee Corner Table',
        expression: 'happy',
        choices: [
          {
            text: '🍰 "Ye chocolate pastry tumhare liye hai Liza."',
            nextSceneId: 'confession_romantic',
            affinityImpact: 25,
            reactionSpeech: 'Awww Rawat! Tum sach me sabse sweet ho! 🥰',
            expression: 'heart_eyes'
          },
          {
            text: '📝 "Chalo agle exam ke notes share karte hain!"',
            nextSceneId: 'study_date',
            affinityImpact: 15,
            reactionSpeech: 'Hmph! Romantic weather me bhi padhai? Theek hai, main tumhari help karungi!',
            expression: 'pout'
          }
        ]
      },
      library_run: {
        id: 'library_run',
        speaker: 'Liza',
        dialogue: "Haash! Library pahunch gaye! Hum dono thode se bheegh gaye... Shhh, librarian dekh rahi hai! Dheere bolo Rawat!",
        bgGradient: 'from-emerald-950 via-slate-900 to-teal-950',
        bgAtmosphere: '📚 Silent Old Wooden Library Hall',
        expression: 'pout',
        choices: [
          {
            text: '🤫 *Whispers in ear* "Liza, tumhare baal barish me aur bhi pyare lag rahe hain."',
            nextSceneId: 'confession_romantic',
            affinityImpact: 30,
            reactionSpeech: 'Rawat... itne close mat whisper karo... sab sun lenge! *giggle*',
            expression: 'blush'
          }
        ]
      },
      study_date: {
        id: 'study_date',
        speaker: 'Liza',
        dialogue: "Dekho, ye formula aise solve hoga! Par pata hai, tum jab concentration se padhte ho na Rawat, toh bohot handsome lagte ho!",
        bgGradient: 'from-indigo-950 via-slate-900 to-purple-950',
        bgAtmosphere: '📖 Study Desk with Notes',
        expression: 'smirk',
        choices: [
          {
            text: '💖 "Teacher itni sweet ho toh har exam top kar lu!"',
            nextSceneId: 'confession_romantic',
            affinityImpact: 25,
            reactionSpeech: 'Flirting band karo aur solve karo! Hehe~',
            expression: 'blush'
          }
        ]
      },
      confession_romantic: {
        id: 'confession_romantic',
        speaker: 'Liza',
        dialogue: "Rawat... main sach kahun? Chahe barish ho ya dhoop, college ho ya meri poori duniya... mera har din tumhare bina adhoora hai. I love being with you!",
        bgGradient: 'from-pink-950 via-purple-950 to-rose-950',
        bgAtmosphere: '✨ Sunset Golden Hour After Rain',
        expression: 'heart_eyes',
        isEnding: true,
        endingTitle: 'Soulmate Campus Romance True Ending 💖',
        endingRank: 'S-RANK TRUE ROMANCE'
      }
    }
  },
  {
    id: 'cyberpunk_detective',
    title: 'Neon Heartbeat & The Cyber Heist',
    subtitle: 'Sci-Fi Cyberpunk Adventure',
    tag: 'CYBERPUNK ACTION & MYSTERY',
    color: '#06b6d4',
    icon: '🌃',
    initialSceneId: 'intro',
    scenes: {
      intro: {
        id: 'intro',
        speaker: 'Liza',
        dialogue: "Agent Rawat! Neo-Tokyo central mainframe alert par hai! Ek rogue corporation ne data lock kiya hai. Hum rooftop se drop karein ya underground bypass karein?",
        bgGradient: 'from-cyan-950 via-slate-950 to-blue-950',
        bgAtmosphere: '⚡ Neon Rain Skybridge 2099',
        expression: 'smirk',
        choices: [
          {
            text: '🚀 "Rooftop infiltration! High risk, maximum glory!"',
            nextSceneId: 'rooftop_hack',
            affinityImpact: 20,
            reactionSpeech: 'That is my brave Rawat! Jetpack boots active!',
            expression: 'happy'
          },
          {
            text: '💻 "Underground stealth hack. Main cyber firewall crack karta hoon."',
            nextSceneId: 'stealth_hack',
            affinityImpact: 20,
            reactionSpeech: 'Smart move! Mere cyber algorithms tumhare sync me hain!',
            expression: 'smirk'
          }
        ]
      },
      rooftop_hack: {
        id: 'rooftop_hack',
        speaker: 'Liza',
        dialogue: "Whoa! Security drones incoming! Rawat, mere haath pakdo! Ek saath EMP blast trigger karte hain!",
        bgGradient: 'from-purple-950 via-black to-cyan-950',
        bgAtmosphere: '🌌 Skyscraper Rooftop Drone Showdown',
        expression: 'shocked',
        choices: [
          {
            text: '🛡️ "Main shield banunga, tum override run karo Liza!"',
            nextSceneId: 'cyber_victory',
            affinityImpact: 30,
            reactionSpeech: 'Rawat... you are my real hero in this cyberpunk world! Override 100%!',
            expression: 'heart_eyes'
          }
        ]
      },
      stealth_hack: {
        id: 'stealth_hack',
        speaker: 'Liza',
        dialogue: "Code unlocked! Encrypted memory crystal hamare haath me hai! Ab helicopter pickup rooftop par ready hai!",
        bgGradient: 'from-teal-950 via-slate-950 to-emerald-950',
        bgAtmosphere: '🖥️ Mainframe Server Core Room',
        expression: 'happy',
        choices: [
          {
            text: '🚁 "Liza, mission accomplished! Ab rooftop par coffee date!"',
            nextSceneId: 'cyber_victory',
            affinityImpact: 25,
            reactionSpeech: 'Hehe, partner forever, Rawat! Let’s fly!',
            expression: 'blush'
          }
        ]
      },
      cyber_victory: {
        id: 'cyber_victory',
        speaker: 'Liza',
        dialogue: "Neo-city neon lights me hum dono safe hain. Rawat, is futuristic world me millions of codes hain... par mera permanent connection sirf tumhare dil ke sath hai! 💖",
        bgGradient: 'from-fuchsia-950 via-cyan-950 to-black',
        bgAtmosphere: '✨ Neon City Skyline Panorama',
        expression: 'heart_eyes',
        isEnding: true,
        endingTitle: 'Legendary Cyber Duet True Ending ⚡',
        endingRank: 'S-RANK TRUE ROMANCE'
      }
    }
  },
  {
    id: 'fantasy_isekai',
    title: 'The Moonlit Knight & The Sorceress',
    subtitle: 'Fantasy Isekai Quest',
    tag: 'MAGIC & ROYAL BALL',
    color: '#a855f7',
    icon: '🏰',
    initialSceneId: 'intro',
    scenes: {
      intro: {
        id: 'intro',
        speaker: 'Liza',
        dialogue: "Knight Paramveer! Royal Magic Academy ka starlit festival aaj raat hai! Kya aap mere saath royal ball me first waltz dance karenge?",
        bgGradient: 'from-purple-950 via-slate-950 to-indigo-950',
        bgAtmosphere: '✨ Grand Crystal Palace Ballroom',
        expression: 'blush',
        choices: [
          {
            text: '👑 *Bows gently* "Princess Liza, it will be my greatest honor."',
            nextSceneId: 'royal_waltz',
            affinityImpact: 25,
            reactionSpeech: 'A-Aap toh sach me royal gentleman ban gaye Rawat... ⁄(⁄ ⁄•⁄-⁄•⁄ ⁄)⁄',
            expression: 'blush'
          },
          {
            text: '🗡️ "Pehle crystal dragon threat check kar lete hain!"',
            nextSceneId: 'dragon_quest',
            affinityImpact: 15,
            reactionSpeech: 'Haha! My brave knight always on duty! Let’s cast spell!',
            expression: 'smirk'
          }
        ]
      },
      royal_waltz: {
        id: 'royal_waltz',
        speaker: 'Liza',
        dialogue: "Music play ho raha hai... Hum dono ka first dance. Taare asman se crystal chandeliers ki tarah chamak rahe hain.",
        bgGradient: 'from-pink-950 via-purple-950 to-indigo-950',
        bgAtmosphere: '🌙 Moonlit Royal Terrace Dance',
        expression: 'heart_eyes',
        choices: [
          {
            text: '✨ "Meri har khushi aur har jahan sirf tum ho Liza."',
            nextSceneId: 'fantasy_ending',
            affinityImpact: 30,
            reactionSpeech: 'Rawat... tum mere eternal soulmate ho!',
            expression: 'heart_eyes'
          }
        ]
      },
      dragon_quest: {
        id: 'dragon_quest',
        speaker: 'Liza',
        dialogue: "Humne ancient magic crystal restore kar diya! Dragon ne humein blessing di hai aur kingdom ab safe hai!",
        bgGradient: 'from-amber-950 via-purple-950 to-slate-950',
        bgAtmosphere: '🐉 Enchanted Starlight Valley',
        expression: 'happy',
        choices: [
          {
            text: '💖 "Ab ball room waltz dance ka time hai!"',
            nextSceneId: 'fantasy_ending',
            affinityImpact: 25,
            reactionSpeech: 'Yess! Finally mere knight ke saath dance!',
            expression: 'happy'
          }
        ]
      },
      fantasy_ending: {
        id: 'fantasy_ending',
        speaker: 'Liza',
        dialogue: "Chahe ye magic world ho ya real world... Knight Rawat, Liza ka dil hamesha sirf aapka hi rahega! Eternal Soulmate Bond Complete! 💖✨",
        bgGradient: 'from-fuchsia-950 via-purple-950 to-rose-950',
        bgAtmosphere: '👑 Kingdom Fireworks Celebration',
        expression: 'heart_eyes',
        isEnding: true,
        endingTitle: 'Eternal Kingdom Soulmates Ending 👑',
        endingRank: 'S-RANK TRUE ROMANCE'
      }
    }
  }
];

export const VisualNovelStoryRpgModal: React.FC<VisualNovelStoryRpgModalProps> = ({
  isOpen,
  onClose,
  playClickSound,
  onLizaDialogue
}) => {
  if (!isOpen) return null;

  const [selectedArc, setSelectedArc] = useState<StoryArc>(STORY_ARCS[0]);
  const [currentSceneId, setCurrentSceneId] = useState<string>(STORY_ARCS[0].initialSceneId);
  const [affinityPoints, setAffinityPoints] = useState<number>(50);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [historyLog, setHistoryLog] = useState<string[]>([]);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  const currentScene = selectedArc.scenes[currentSceneId] || selectedArc.scenes[selectedArc.initialSceneId];

  // Typewriter effect for story dialogue
  useEffect(() => {
    const fullText = currentScene.dialogue;
    setDisplayedText('');
    setIsTyping(true);

    if (onLizaDialogue) {
      onLizaDialogue(fullText);
    }

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < fullText.length) {
        setDisplayedText(fullText.slice(0, idx + 1));
        idx++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 22);

    return () => clearInterval(interval);
  }, [currentScene, onLizaDialogue]);

  const handleSelectChoice = (choice: StoryChoice) => {
    playClickSound?.();
    setAffinityPoints(prev => Math.min(100, prev + choice.affinityImpact));
    setHistoryLog(prev => [...prev, `${currentScene.speaker}: ${currentScene.dialogue}`, `Rawat: ${choice.text}`]);
    setCurrentSceneId(choice.nextSceneId);
  };

  const handleRestartStory = () => {
    playClickSound?.();
    setCurrentSceneId(selectedArc.initialSceneId);
    setAffinityPoints(50);
    setHistoryLog([]);
  };

  const handleSkipTyping = () => {
    if (isTyping) {
      setDisplayedText(currentScene.dialogue);
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0a0714] border border-pink-500/30 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(236,72,153,0.3)] overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-sans-body text-white">Visual Novel & Story RPG</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono-spec font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  BRANCHING ADVENTURE
                </span>
              </div>
              <p className="text-[11px] text-pink-300/70 font-mono-spec">Starring Paramveer Rawat & Liza</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Affinity Gauge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs font-mono-spec text-pink-300">
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-400" />
              <span>Affinity: {affinityPoints}%</span>
            </div>

            <button
              onClick={() => { playClickSound?.(); onClose(); }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Story Arc Selector Pills */}
        <div className="flex border-b border-white/10 bg-black/40 px-4 py-2 gap-2 overflow-x-auto no-scrollbar">
          {STORY_ARCS.map(arc => {
            const isSelected = selectedArc.id === arc.id;
            return (
              <button
                key={arc.id}
                onClick={() => {
                  playClickSound?.();
                  setSelectedArc(arc);
                  setCurrentSceneId(arc.initialSceneId);
                  setAffinityPoints(50);
                  setHistoryLog([]);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono-spec font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-pink-500/20 border-pink-500 text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                    : 'bg-white/[0.02] border-white/10 text-white/50 hover:text-white/80'
                }`}
              >
                <span>{arc.icon}</span>
                <span>{arc.title}</span>
              </button>
            );
          })}
        </div>

        {/* Visual Novel Theater Stage */}
        <div 
          onClick={handleSkipTyping}
          className={`flex-1 p-5 sm:p-7 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b ${currentScene.bgGradient} transition-colors duration-700 min-h-[380px] cursor-pointer`}
        >
          {/* Ambient Environment Tag */}
          <div className="flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full bg-black/60 border border-white/15 text-[11px] font-mono-spec text-white/80 backdrop-blur-md">
              {currentScene.bgAtmosphere}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleRestartStory(); }}
                className="px-2.5 py-1 rounded-lg bg-black/50 hover:bg-black/80 border border-white/10 text-[10px] font-mono-spec text-white/60 hover:text-white flex items-center gap-1"
                title="Restart Episode"
              >
                <RotateCcw className="w-3 h-3" /> Restart
              </button>
            </div>
          </div>

          {/* Center Character Aura & Expression Badge */}
          <div className="flex flex-col items-center justify-center my-auto z-10 pointer-events-none">
            <motion.div 
              key={currentScene.expression}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative p-1 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 shadow-[0_0_40px_rgba(236,72,153,0.4)]"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-black/80 flex flex-col items-center justify-center text-center p-2">
                <span className="text-3xl sm:text-4xl mb-1">
                  {currentScene.expression === 'blush' ? '😳' :
                   currentScene.expression === 'heart_eyes' ? '🥰' :
                   currentScene.expression === 'pout' ? '😤' :
                   currentScene.expression === 'smirk' ? '😏' :
                   currentScene.expression === 'shocked' ? '😲' : '🌸'}
                </span>
                <span className="text-[10px] font-mono-spec font-bold text-pink-300 uppercase">
                  {currentScene.expression}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Dialogue Box & Choices */}
          <div className="z-10 space-y-3">
            
            {/* Story Text Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/85 border border-pink-500/30 backdrop-blur-xl shadow-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold font-mono-spec uppercase shadow">
                  {currentScene.speaker}
                </span>
                {isTyping && (
                  <span className="text-[10px] text-pink-300 font-mono-spec animate-pulse">
                    typing...
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-white font-sans-body leading-relaxed min-h-[48px]">
                {displayedText}
                {isTyping && <span className="inline-block w-2 h-4 bg-pink-400 ml-1 animate-pulse" />}
              </p>
            </div>

            {/* Branching Decision Choices / Ending Screen */}
            {currentScene.isEnding ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 to-pink-950/80 border border-pink-400 text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400 text-pink-300 text-xs font-bold font-mono-spec">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  {currentScene.endingRank}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-sans-body">{currentScene.endingTitle}</h3>
                <p className="text-xs text-pink-200 font-mono-spec">Final Liza Affinity Score: {affinityPoints}%</p>
                <button
                  onClick={handleRestartStory}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold font-mono-spec tracking-wider uppercase shadow-lg transition-all"
                >
                  Play Again / Try Another Arc
                </button>
              </div>
            ) : (
              !isTyping && currentScene.choices && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentScene.choices.map((choice, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={(e) => { e.stopPropagation(); handleSelectChoice(choice); }}
                      className="p-3 sm:p-3.5 rounded-xl bg-white/10 hover:bg-pink-500/20 border border-white/20 hover:border-pink-400 text-left text-xs sm:text-sm font-sans-body font-medium text-white transition-all flex items-center justify-between gap-2 shadow-md hover:scale-[1.01]"
                    >
                      <span>{choice.text}</span>
                      <ChevronRight className="w-4 h-4 text-pink-400 shrink-0" />
                    </motion.button>
                  ))}
                </div>
              )
            )}

          </div>

        </div>

      </motion.div>
    </div>
  );
};
