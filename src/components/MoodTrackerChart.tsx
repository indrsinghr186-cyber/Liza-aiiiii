import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie
} from 'recharts';
import { Activity, Smile, Sparkles } from 'lucide-react';
import { LizaMood, LIZA_MOOD_CONFIGS } from '../services/moodExpressionEngine';

export interface MoodData {
  mood: string;
  count: number;
  label: string;
  color: string;
}

interface MoodTrackerChartProps {
  moodCounts: Record<string, number>;
  currentExpression: string;
  onSelectExpression: (mood: string) => void;
  playClickSound?: () => void;
}

export const MoodTrackerChart: React.FC<MoodTrackerChartProps> = ({
  moodCounts,
  currentExpression,
  onSelectExpression,
  playClickSound,
}) => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  const supportedMoods: LizaMood[] = [
    'CALM', 'HAPPY', 'TSUNDERE', 'EXCITED', 'SAD', 'CARING',
    'CONFUSED', 'THINKING', 'SURPRISED', 'SHY', 'NERVOUS',
    'ANGRY', 'SERIOUS', 'SLEEPY', 'MOCK_JEALOUS', 'PROTECTIVE', 'CONFIDENT', 'ANNOYED'
  ];

  // Format data for recharts
  const chartData: MoodData[] = supportedMoods.map((moodKey) => {
    const cfg = LIZA_MOOD_CONFIGS[moodKey];
    // Map case insensitive or legacy keys (e.g. 'happy' -> 'HAPPY')
    const count = (moodCounts[moodKey] || 0) + (moodCounts[moodKey.toLowerCase()] || 0);
    return {
      mood: moodKey,
      count,
      label: cfg.label.split(' ')[0], // short label
      color: cfg.color,
    };
  });

  const totalEmotions = Object.values(moodCounts).reduce<number>((a, b) => a + Number(b), 0);
  const activeConfig = LIZA_MOOD_CONFIGS[currentExpression.toUpperCase() as LizaMood] || LIZA_MOOD_CONFIGS.CALM;

  return (
    <div className="flex flex-col gap-3 text-white">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 gap-2 bg-white/[0.03] p-3 rounded-xl border border-white/5 font-mono-spec">
        <div>
          <span className="text-[9px] uppercase opacity-40 block tracking-wider">Active LIZA Mood</span>
          <span 
            className="text-xs font-bold flex items-center gap-1.5 mt-0.5"
            style={{ color: activeConfig.color }}
          >
            <span 
              className="w-2 h-2 rounded-full animate-pulse" 
              style={{ backgroundColor: activeConfig.color }} 
            />
            {activeConfig.label}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[9px] uppercase opacity-40 block tracking-wider">Mood Shifts Logged</span>
          <span className="text-xs font-bold text-white mt-0.5 block">{totalEmotions}</span>
        </div>
      </div>

      {/* Chart Header & Toggle */}
      <div className="flex items-center justify-between font-mono-spec text-[10px]">
        <div className="flex items-center gap-1.5 text-white/70 uppercase tracking-widest font-bold">
          <Activity size={12} className="text-[#d946ef]" />
          <span>Unified Emotion State</span>
        </div>
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => {
              playClickSound?.();
              setChartType('bar');
            }}
            className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold cursor-pointer transition-all ${
              chartType === 'bar' ? 'bg-[#d946ef] text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            BAR
          </button>
          <button
            onClick={() => {
              playClickSound?.();
              setChartType('pie');
            }}
            className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold cursor-pointer transition-all ${
              chartType === 'pie' ? 'bg-[#d946ef] text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            PIE
          </button>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-44 bg-black/30 rounded-xl border border-white/5 p-2 pt-3 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis 
                dataKey="label" 
                stroke="#666" 
                fontSize={8} 
                tickLine={false}
                axisLine={false} 
              />
              <YAxis 
                stroke="#666" 
                fontSize={8} 
                allowDecimals={false}
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f0f0f', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#fff',
                  fontFamily: 'Space Mono'
                }} 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    opacity={entry.mood.toLowerCase() === currentExpression.toLowerCase() ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData.filter(d => d.count > 0).length > 0 ? chartData.filter(d => d.count > 0) : chartData}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                paddingAngle={4}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`pie-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f0f0f', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#fff',
                  fontFamily: 'Space Mono'
                }} 
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Interactive Expression Selector */}
      <div>
        <span className="font-mono-spec text-[9px] uppercase opacity-40 block tracking-wider mb-1.5 flex items-center justify-between">
          <span>Supported Mood Expressions (13)</span>
          <span className="text-purple-300">Voice + Visual Sync</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {supportedMoods.map((m) => {
            const isSelected = m.toLowerCase() === currentExpression.toLowerCase();
            const cfg = LIZA_MOOD_CONFIGS[m];
            const count = (moodCounts[m] || 0) + (moodCounts[m.toLowerCase()] || 0);
            return (
              <button
                key={m}
                onClick={() => {
                  playClickSound?.();
                  onSelectExpression(m);
                }}
                className={`px-2 py-1 rounded-md text-[10px] font-mono-spec uppercase transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-white/20 text-white font-bold'
                    : 'border-white/5 bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/10'
                }`}
                style={{
                  borderColor: isSelected ? cfg.color : undefined,
                  color: isSelected ? cfg.color : undefined,
                  boxShadow: isSelected ? `0 0 10px ${cfg.color}40` : undefined,
                }}
              >
                {m} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
