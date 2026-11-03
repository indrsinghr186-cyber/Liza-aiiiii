import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Clock, Sun, CloudSun, Calendar, Plus, Trash2, Volume2, X, Check, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

export interface LizaAlarm {
  id: string;
  time: string; // "07:30"
  label: string;
  enabled: boolean;
  days: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  tone: 'Anime Tsundere' | 'Gentle Morning Sunshine' | 'High Energy Waifu' | 'Cyberpunk Drill';
  wakeDialogue: string;
  includeWeather: boolean;
  includeMotivation: boolean;
}

interface AlarmRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarms: LizaAlarm[];
  onAddAlarm: (alarm: Omit<LizaAlarm, 'id'>) => void;
  onToggleAlarm: (id: string) => void;
  onDeleteAlarm: (id: string) => void;
  onTestAlarm: (alarm: LizaAlarm) => void;
  playClickSound: () => void;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const AlarmRoutineModal: React.FC<AlarmRoutineModalProps> = ({
  isOpen,
  onClose,
  alarms,
  onAddAlarm,
  onToggleAlarm,
  onDeleteAlarm,
  onTestAlarm,
  playClickSound,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [time, setTime] = useState('07:30');
  const [label, setLabel] = useState('Morning Wake-Up');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [tone, setTone] = useState<LizaAlarm['tone']>('Anime Tsundere');
  const [includeWeather, setIncludeWeather] = useState(true);
  const [includeMotivation, setIncludeMotivation] = useState(true);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    playClickSound();
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    let dialogue = "Utho bhi Paramveer! Kitna sote ho! Late ho jaoge!";
    if (tone === 'Gentle Morning Sunshine') {
      dialogue = "Good morning Paramveer! A new beautiful day has started. Let's make it wonderful together!";
    } else if (tone === 'High Energy Waifu') {
      dialogue = "YAAAY! Wake up wake up wake up! Liza is super excited to conquer today with you!";
    } else if (tone === 'Cyberpunk Drill') {
      dialogue = "Alert: System boot initiated! Time to wake up and get into mission mode!";
    }

    onAddAlarm({
      time,
      label,
      enabled: true,
      days: selectedDays.length > 0 ? selectedDays : ['Everyday'],
      tone,
      wakeDialogue: dialogue,
      includeWeather,
      includeMotivation,
    });
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in select-none">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-xl max-h-[90vh] bg-[#0d0d16] border border-amber-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-950/80 via-orange-950/70 to-[#0d0d16] border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              ⏰
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>Liza AI Alarm & Morning Routine</span>
              </h2>
              <p className="text-xs text-amber-200/60 font-mono-spec">Anime Voice Wake-Up with Weather & Motivation</p>
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

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
          {/* Active Alarms List */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono-spec font-bold uppercase tracking-wider text-amber-300">
              Your Scheduled Routines ({alarms.length})
            </span>
            <button
              onClick={() => {
                playClickSound();
                setShowAddForm(prev => !prev);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-mono-spec font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus size={14} />
              <span>{showAddForm ? 'Cancel' : 'Add Alarm'}</span>
            </button>
          </div>

          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreate}
              className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3.5"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono-spec text-white/70 block mb-1">Alarm Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono-spec text-sm focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono-spec text-white/70 block mb-1">Routine Label</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Gym, Work, Wakeup"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Day Selector */}
              <div>
                <label className="text-[11px] font-mono-spec text-white/70 block mb-1.5">Repeat Days</label>
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS_OF_WEEK.map((d) => {
                    const isSelected = selectedDays.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => toggleDay(d)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono-spec font-bold transition-all ${
                          isSelected ? 'bg-amber-500 text-black shadow-md' : 'bg-white/5 text-white/50 border border-white/10'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Voice Tone Selector */}
              <div>
                <label className="text-[11px] font-mono-spec text-white/70 block mb-1">Liza Voice Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono-spec focus:border-amber-500 outline-none"
                >
                  <option value="Anime Tsundere">Anime Tsundere (&quot;Baka, utho bhi!&quot;)</option>
                  <option value="Gentle Morning Sunshine">Gentle Morning Sunshine (Soft & Loving)</option>
                  <option value="High Energy Waifu">High Energy Waifu (Enthusiastic)</option>
                  <option value="Cyberpunk Drill">Cyberpunk Drill (Futuristic AI)</option>
                </select>
              </div>

              {/* Extras Toggle */}
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeWeather}
                    onChange={(e) => setIncludeWeather(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Include Weather Report</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMotivation}
                    onChange={(e) => setIncludeMotivation(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Morning Motivation Quote</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono-spec uppercase tracking-wider cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              >
                Save Alarm & Activate
              </button>
            </motion.form>
          )}

          {/* Alarm Cards */}
          <div className="space-y-2.5">
            {alarms.length === 0 ? (
              <div className="p-8 text-center text-white/40 font-mono-spec text-xs">
                No alarms scheduled yet. Click &quot;Add Alarm&quot; to wake up with Liza!
              </div>
            ) : (
              alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    alarm.enabled
                      ? 'bg-amber-950/20 border-amber-500/40 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'bg-white/5 border-white/10 text-white/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-mono-spec font-bold text-amber-300">
                      {alarm.time}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{alarm.label}</h4>
                        <span className="text-[10px] font-mono-spec px-2 py-0.5 rounded bg-white/10 text-amber-200">
                          {alarm.tone}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono-spec text-white/50">
                        {alarm.days.join(', ')} • {alarm.includeWeather ? '🌤 Weather' : ''} {alarm.includeMotivation ? '✨ Motivation' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playClickSound();
                        onTestAlarm(alarm);
                      }}
                      title="Preview Liza's Morning Voice"
                      className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 cursor-pointer"
                    >
                      <Volume2 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        onToggleAlarm(alarm.id);
                      }}
                      className="p-1 cursor-pointer"
                    >
                      {alarm.enabled ? (
                        <ToggleRight size={28} className="text-amber-400" />
                      ) : (
                        <ToggleLeft size={28} className="text-white/30" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        onDeleteAlarm(alarm.id);
                      }}
                      className="p-2 text-red-400/60 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/60 border-t border-white/10 flex justify-between items-center text-xs font-mono-spec text-white/50">
          <span>Real-time Background Alarm Checker: <strong className="text-amber-300">ACTIVE</strong></span>
          <span>Sync: <strong className="text-emerald-400">Browser Audio Engine</strong></span>
        </div>
      </motion.div>
    </div>
  );
};
