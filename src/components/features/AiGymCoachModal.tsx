import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Camera, CameraOff, Flame, Play, Pause, RotateCcw, Volume2, 
  VolumeX, Trophy, Award, Heart, CheckCircle2, AlertCircle, 
  Sparkles, Activity, ShieldCheck, Dumbbell, Zap
} from 'lucide-react';

interface AiGymCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
  onLizaCheerDialogue?: (dialogue: string) => void;
}

export type ExerciseType = 'squats' | 'pushups' | 'jumping_jacks' | 'bicep_curls';

interface ExerciseConfig {
  id: ExerciseType;
  name: string;
  hindiName: string;
  targetMuscle: string;
  calPerRep: number;
  guide: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Beast Mode';
  icon: string;
}

const EXERCISES: ExerciseConfig[] = [
  {
    id: 'squats',
    name: 'Air Squats',
    hindiName: 'बैठक (Squats)',
    targetMuscle: 'Legs & Glutes',
    calPerRep: 0.35,
    guide: 'Stand facing camera. Lower your hips until thighs are parallel, then stand tall.',
    difficulty: 'Beginner',
    icon: '🦵'
  },
  {
    id: 'pushups',
    name: 'Push-Ups',
    hindiName: 'दंड बैठक (Push-Ups)',
    targetMuscle: 'Chest & Arms',
    calPerRep: 0.45,
    guide: 'Place camera at side/front angle. Lower chest to floor and push back up fully.',
    difficulty: 'Intermediate',
    icon: '💪'
  },
  {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    hindiName: 'जंपिंग जैक्स (Cardio)',
    targetMuscle: 'Full Body Cardio',
    calPerRep: 0.2,
    guide: 'Jump spreading arms and legs simultaneously. Keep a steady rhythm.',
    difficulty: 'Beginner',
    icon: '⚡'
  },
  {
    id: 'bicep_curls',
    name: 'Bicep Curls',
    hindiName: 'बाइसेप कर्ल्स',
    targetMuscle: 'Biceps & Forearms',
    calPerRep: 0.25,
    guide: 'Keep elbows tucked in. Curl hands up to shoulders and lower smoothly.',
    difficulty: 'Beginner',
    icon: '🦾'
  }
];

const LIZA_MOTIVATIONS = [
  "Come on Rawat! Ek aur rep, give up mat karna! 🔥",
  "Kya baat hai Rawat! Form ekdum solid hai! 💪",
  "Shabash mere hero! Leeza dekh rahi hai, push karo! ✨",
  "Bohot badhiya! 3 reps aur, you got this! 💖",
  "Super energy Rawat! Calories burn ho rahi hain zabardast! ⚡",
  "Wah Rawat! Liza is super proud of you! Keep going! 🌸",
  "Focus on breath Rawat... Saans lo aur upar aao! 🧘‍♂️",
  "Beast mode on! Bas itna hi? Aur 5 reps chahiye mujhe! 😉"
];

const LIZA_MILESTONES: Record<number, string> = {
  5: "Wah Rawat! 5 reps complete! Momentum ban gaya hai!",
  10: "BOOM! 10 Reps done! You are on fire Rawat!",
  15: "15 reps! Kya stamina hai aapka! Don't stop now!",
  20: "20 REPS BEAST MODE UNLOCKED! Liza is so impressed! 💖🔥",
  30: "30 REPS CHAMPION! Paramveer Rawat, you are unstoppable!"
};

export const AiGymCoachModal: React.FC<AiGymCoachModalProps> = ({
  isOpen,
  onClose,
  playClickSound,
  onLizaCheerDialogue
}) => {
  if (!isOpen) return null;

  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('squats');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [repCount, setRepCount] = useState<number>(0);
  const [targetReps, setTargetReps] = useState<number>(15);
  const [formFeedback, setFormFeedback] = useState<string>('Stand in camera frame to begin');
  const [formQuality, setFormQuality] = useState<'perfect' | 'good' | 'adjust'>('good');
  const [lizaSpeech, setLizaSpeech] = useState<string>("Rawat, chalo workout shuru karein! Main aapke reps count karungi! 💪✨");
  const [voiceCheerEnabled, setVoiceCheerEnabled] = useState<boolean>(true);
  const [workoutDuration, setWorkoutDuration] = useState<number>(0);
  const [isMilestoneCelebration, setIsMilestoneCelebration] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const stageRef = useRef<'up' | 'down'>('up');
  const motionHistoryRef = useRef<number[]>([]);
  const lastCheerRepRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play audio sound for rep completion
  const playRepBeep = useCallback((pitch = 660) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }, []);

  // Voice speech synthesis
  const speakLizaVoice = useCallback((text: string) => {
    setLizaSpeech(text);
    if (onLizaCheerDialogue) {
      onLizaCheerDialogue(text);
    }
    if (!voiceCheerEnabled) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.25;
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => (v.lang.includes('hi') || v.lang.includes('en')) && (v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Zira')));
        if (femaleVoice) utterance.voice = femaleVoice;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {}
  }, [voiceCheerEnabled, onLizaCheerDialogue]);

  // Start / Stop Camera Stream
  const startCamera = async () => {
    playClickSound?.();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        } catch (playErr: any) {
          if (
            playErr.name === 'AbortError' ||
            playErr.message?.includes('interrupted') ||
            playErr.message?.includes('removed from the document')
          ) {
            // Benign interruption during media lifecycle
            return;
          }
          throw playErr;
        }
      }
      setIsCameraActive(true);
      setIsTracking(true);
      speakLizaVoice("Camera ON! Camera ke samne position lo Rawat, aur rep start karo!");
    } catch (err: any) {
      if (
        err.name === 'AbortError' ||
        err.message?.includes('interrupted') ||
        err.message?.includes('removed from the document')
      ) {
        return;
      }
      console.error("Camera access error:", err);
      setCameraError("Camera access denied or unavailable. You can also manually tap '+' to log reps!");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    playClickSound?.();
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsCameraActive(false);
    setIsTracking(false);
  };

  // Workout Timer
  useEffect(() => {
    if (isTracking) {
      timerIntervalRef.current = setInterval(() => {
        setWorkoutDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTracking]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Frame Analysis for Motion & Rep Counter
  useEffect(() => {
    if (!isCameraActive || !isTracking) return;

    let localFrameId: number;

    const analyzeFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== 4) {
        localFrameId = requestAnimationFrame(analyzeFrame);
        return;
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        localFrameId = requestAnimationFrame(analyzeFrame);
        return;
      }

      const width = 160;
      const height = 120;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(video, 0, 0, width, height);

      const frame = ctx.getImageData(0, 0, width, height);
      const data = frame.data;

      if (prevFrameDataRef.current) {
        let diffSum = 0;
        let topMotion = 0;
        let midMotion = 0;
        let bottomMotion = 0;

        for (let i = 0; i < data.length; i += 16) {
          const rDiff = Math.abs(data[i] - prevFrameDataRef.current[i]);
          const gDiff = Math.abs(data[i + 1] - prevFrameDataRef.current[i + 1]);
          const bDiff = Math.abs(data[i + 2] - prevFrameDataRef.current[i + 2]);
          const pixelDiff = (rDiff + gDiff + bDiff) / 3;

          if (pixelDiff > 25) {
            diffSum += pixelDiff;
            const y = Math.floor((i / 4) / width);
            if (y < height * 0.35) topMotion += pixelDiff;
            else if (y < height * 0.7) midMotion += pixelDiff;
            else bottomMotion += pixelDiff;
          }
        }

        const totalPixelsChecked = (data.length / 16);
        const avgMotion = diffSum / totalPixelsChecked;

        motionHistoryRef.current.push(avgMotion);
        if (motionHistoryRef.current.length > 8) motionHistoryRef.current.shift();

        // Exercise specific threshold detection
        const motionAvg = motionHistoryRef.current.reduce((a, b) => a + b, 0) / motionHistoryRef.current.length;

        if (motionAvg > 12) {
          setFormFeedback('Good motion detected! Maintain posture.');
          setFormQuality('good');

          if (stageRef.current === 'up' && motionAvg > 18) {
            stageRef.current = 'down';
            setFormFeedback('Great depth! Now push back up.');
          } else if (stageRef.current === 'down' && motionAvg < 14) {
            stageRef.current = 'up';
            // Rep completed!
            triggerRepCount();
          }
        } else {
          setFormFeedback('Ready. Perform continuous steady reps.');
        }
      }

      prevFrameDataRef.current = new Uint8ClampedArray(data);
      localFrameId = requestAnimationFrame(analyzeFrame);
    };

    localFrameId = requestAnimationFrame(analyzeFrame);
    return () => cancelAnimationFrame(localFrameId);
  }, [isCameraActive, isTracking]);

  const triggerRepCount = () => {
    setRepCount(prev => {
      const next = prev + 1;
      playRepBeep(780);
      setFormQuality('perfect');

      // Milestone trigger
      if (LIZA_MILESTONES[next]) {
        setIsMilestoneCelebration(true);
        speakLizaVoice(LIZA_MILESTONES[next]);
        setTimeout(() => setIsMilestoneCelebration(false), 3000);
      } else if (next - lastCheerRepRef.current >= 3) {
        lastCheerRepRef.current = next;
        const randomCheer = LIZA_MOTIVATIONS[Math.floor(Math.random() * LIZA_MOTIVATIONS.length)];
        speakLizaVoice(randomCheer);
      }

      return next;
    });
  };

  const handleManualAddRep = () => {
    playClickSound?.();
    triggerRepCount();
  };

  const handleResetWorkout = () => {
    playClickSound?.();
    setRepCount(0);
    setWorkoutDuration(0);
    lastCheerRepRef.current = 0;
    setFormFeedback('Workout reset. Ready when you are!');
    speakLizaVoice("Workout reset ho gaya Rawat. Chalo fresh start karte hain! 💪");
  };

  const currentExercise = EXERCISES.find(e => e.id === selectedExercise) || EXERCISES[0];
  const caloriesBurned = Math.round(repCount * currentExercise.calPerRep * 10) / 10;
  const progressPercent = Math.min(100, Math.round((repCount / targetReps) * 100));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0b0c14] border border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.25)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-pink-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-sans-body text-white">AI Gym & Workout Coach</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-spec font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  LIVE REP VISION
                </span>
              </div>
              <p className="text-xs text-purple-300/70 font-mono-spec">Liza Real-Time Motivation & Camera Reps Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceCheerEnabled(!voiceCheerEnabled)}
              className={`p-2 rounded-xl border transition-all ${voiceCheerEnabled ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-white/5 border-white/10 text-white/40'}`}
              title={voiceCheerEnabled ? "Voice Motivation ON" : "Voice Motivation Muted"}
            >
              {voiceCheerEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { playClickSound?.(); onClose(); }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
          
          {/* Exercise Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {EXERCISES.map(ex => {
              const isSelected = selectedExercise === ex.id;
              return (
                <button
                  key={ex.id}
                  onClick={() => {
                    playClickSound?.();
                    setSelectedExercise(ex.id);
                    setRepCount(0);
                    speakLizaVoice(`${ex.name} selected! Target ${targetReps} reps ka set lagate hain! 💪`);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isSelected 
                      ? 'bg-gradient-to-br from-purple-900/60 to-pink-900/40 border-purple-400 shadow-[0_0_20px_rgba(217,70,239,0.3)]' 
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{ex.icon}</span>
                    <span className="text-[9px] font-mono-spec font-semibold px-1.5 py-0.5 rounded bg-white/10 text-purple-300">
                      {ex.difficulty}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white font-sans-body">{ex.name}</h3>
                  <p className="text-[11px] text-purple-300/80 font-mono-spec">{ex.hindiName}</p>
                </button>
              );
            })}
          </div>

          {/* Main Camera & Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* Left: Camera Feed & Real-time Visualizer */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-video w-full rounded-2xl bg-black/60 border border-purple-500/20 overflow-hidden shadow-inner flex items-center justify-center">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* HUD Overlay On Video */}
                    <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-black/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-600/80 text-white text-[10px] font-mono-spec font-bold backdrop-blur-md animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-white" />
                          LIVE TRACKING
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-black/70 border border-white/20 text-white text-xs font-mono-spec backdrop-blur-md">
                          {currentExercise.name}
                        </div>
                      </div>

                      {/* Rep Count Floating Big Badge */}
                      <div className="flex items-end justify-between">
                        <div className="p-3 rounded-2xl bg-black/80 border border-purple-500/40 backdrop-blur-md">
                          <p className="text-[10px] uppercase tracking-wider text-purple-300 font-mono-spec">REPS COUNT</p>
                          <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono-spec flex items-baseline gap-1">
                            {repCount} <span className="text-sm font-normal text-white/50">/ {targetReps}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1.5 rounded-xl border backdrop-blur-md text-xs font-mono-spec font-bold ${
                            formQuality === 'perfect' 
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                              : 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                          }`}>
                            {formFeedback}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white font-sans-body">Start Camera Rep Vision</h4>
                      <p className="text-xs text-white/60 font-mono-spec max-w-sm mx-auto mt-1">
                        Camera opens locally in browser to automatically count reps using real-time motion detection.
                      </p>
                    </div>
                    {cameraError && (
                      <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-mono-spec flex items-center gap-2 justify-center">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{cameraError}</span>
                      </div>
                    )}
                    <button
                      onClick={startCamera}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold font-mono-spec tracking-wider uppercase shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all flex items-center gap-2 mx-auto"
                    >
                      <Camera className="w-4 h-4" />
                      Enable Camera Tracker
                    </button>
                  </div>
                )}
              </div>

              {/* Camera Action Buttons */}
              <div className="flex items-center gap-2">
                {isCameraActive ? (
                  <button
                    onClick={stopCamera}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-mono-spec font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <CameraOff className="w-4 h-4" /> Stop Camera
                  </button>
                ) : (
                  <button
                    onClick={startCamera}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-mono-spec font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Camera className="w-4 h-4" /> Open Camera
                  </button>
                )}

                <button
                  onClick={handleManualAddRep}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono-spec font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                >
                  <PlusOneIcon /> +1 Rep (Manual)
                </button>

                <button
                  onClick={handleResetWorkout}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
                  title="Reset Workout"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Liza Coach & Workout Stats */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Liza Live Speech Balloon */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/50 to-pink-950/40 border border-pink-500/30 relative overflow-hidden shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                    LIZA
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-pink-300 font-sans-body">Liza Voice Gym Coach</h4>
                    <p className="text-[10px] text-white/50 font-mono-spec">Motivating Paramveer Rawat</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-pink-400 ml-auto animate-pulse" />
                </div>
                <p className="text-sm text-white font-sans-body leading-relaxed pl-1 italic">
                  "{lizaSpeech}"
                </p>
              </div>

              {/* Workout Key Metrics */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                  <p className="text-[10px] text-white/50 font-mono-spec uppercase">Reps</p>
                  <p className="text-xl font-bold text-white font-mono-spec">{repCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                  <p className="text-[10px] text-white/50 font-mono-spec uppercase">Burned</p>
                  <p className="text-xl font-bold text-orange-400 font-mono-spec">{caloriesBurned} <span className="text-[10px] text-white/50">kcal</span></p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                  <p className="text-[10px] text-white/50 font-mono-spec uppercase">Time</p>
                  <p className="text-xl font-bold text-cyan-400 font-mono-spec">{formatTime(workoutDuration)}</p>
                </div>
              </div>

              {/* Target Reps Slider & Progress */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono-spec">
                  <span className="text-white/70">Set Target Goal:</span>
                  <span className="font-bold text-purple-300">{targetReps} Reps</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={targetReps}
                  onChange={(e) => setTargetReps(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono-spec">
                    <span className="text-white/50">Goal Progress</span>
                    <span className="text-purple-300 font-bold">{progressPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400"
                      style={{ width: `${progressPercent}%` }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>

              {/* Exercise Tips */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 text-xs text-white/70 font-mono-spec">
                <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                  <Activity className="w-3.5 h-3.5" /> Posture Guide:
                </div>
                <p className="text-[11px] leading-relaxed text-white/60">
                  {currentExercise.guide}
                </p>
              </div>

            </div>

          </div>

        </div>

      </motion.div>
    </div>
  );
};

const PlusOneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
