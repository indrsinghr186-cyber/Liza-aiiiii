import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Cpu,
  Zap,
  Activity,
  Layers,
  Thermometer,
  RotateCcw,
  Pause,
  Play,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Gauge,
  Sparkles
} from 'lucide-react';
import {
  windowsCompanionService,
  SystemHealthDataPoint,
  SystemTelemetry,
  CompanionStatus
} from '../services/windowsCompanionService';

type MetricFilter = 'all' | 'cpu' | 'gpu' | 'ram';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomHealthTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-950/95 border border-slate-700/80 rounded-lg p-3 shadow-xl backdrop-blur-md text-xs font-mono space-y-2 min-w-[200px]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-slate-400">
        <span className="text-[10px] tracking-wider text-slate-500 uppercase">Timestamp</span>
        <span className="text-slate-200">{label}</span>
      </div>

      <div className="space-y-1.5">
        {payload.map((item: any, idx: number) => {
          const color =
            item.dataKey === 'cpu'
              ? 'text-cyan-400'
              : item.dataKey === 'gpu'
              ? 'text-purple-400'
              : 'text-emerald-400';
          const labelName =
            item.dataKey === 'cpu'
              ? 'Intel i7 CPU'
              : item.dataKey === 'gpu'
              ? 'Iris Xe GPU'
              : 'LPDDR4x RAM';

          return (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-300">{labelName}:</span>
              </div>
              <span className={`font-semibold tabular-nums ${color}`}>{item.value}%</span>
            </div>
          );
        })}
      </div>

      {payload[0]?.payload && (
        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Pkg Temp: <span className="text-amber-400">{payload[0].payload.temp}°C</span></span>
          <span>Clock: <span className="text-cyan-300">{payload[0].payload.cpuFreq} GHz</span></span>
        </div>
      )}
    </div>
  );
};

export const SystemHealthDashboard: React.FC = () => {
  const [history, setHistory] = useState<SystemHealthDataPoint[]>([]);
  const [current, setCurrent] = useState<SystemHealthDataPoint | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [filter, setFilter] = useState<MetricFilter>('all');
  const [companionStatus, setCompanionStatus] = useState<CompanionStatus>(
    windowsCompanionService.getStatus()
  );
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(
    windowsCompanionService.getTelemetry()
  );

  useEffect(() => {
    // Initial data load
    setHistory(windowsCompanionService.getHealthHistory());

    const unsubHealth = windowsCompanionService.subscribeHealth((newHistory, latestPoint) => {
      if (!isPaused) {
        setHistory([...newHistory]);
        setCurrent(latestPoint);
      }
    });

    const unsubStatus = windowsCompanionService.subscribe((s, t) => {
      setCompanionStatus(s);
      setTelemetry(t);
    });

    return () => {
      unsubHealth();
      unsubStatus();
    };
  }, [isPaused]);

  // Fallback latest point if not set yet
  const latest = useMemo(() => {
    if (current) return current;
    if (history.length > 0) return history[history.length - 1];
    return {
      timestamp: Date.now(),
      timeStr: '00:00:00',
      cpu: 28,
      gpu: 18,
      ram: 62,
      temp: 52.4,
      cpuFreq: 3.24
    };
  }, [current, history]);

  // Derived calculations for Dell Latitude 7420 specs
  const memUsedGB = useMemo(() => {
    if (telemetry?.memory_used_gb) return telemetry.memory_used_gb;
    return Math.round((latest.ram / 100) * 16.0 * 10) / 10;
  }, [telemetry, latest.ram]);

  const memTotalGB = telemetry?.memory_total_gb ?? 16.0;

  const thermalState = useMemo(() => {
    if (latest.temp >= 80) return { label: 'Thermal Throttling', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
    if (latest.temp >= 68) return { label: 'Elevated Load', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { label: 'Nominal (Cool)', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  }, [latest.temp]);

  const handleClearHistory = () => {
    windowsCompanionService.clearHealthHistory();
    setHistory(windowsCompanionService.getHealthHistory());
  };

  return (
    <div className="space-y-6">
      {/* Real-time Hardware Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. CPU Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-200">Intel® Core™ i7-1185G7</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400/90">4C / 8T</span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-cyan-400">
                {latest.cpu}
              </span>
              <span className="text-sm font-mono text-cyan-400/70">%</span>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-medium text-slate-300 tabular-nums">
                {latest.cpuFreq} GHz
              </div>
              <div className="text-[10px] text-slate-500">Max 4.80 GHz Turbo</div>
            </div>
          </div>

          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-400 h-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, latest.cpu))}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Dell Latitude 7420</span>
            <span className="text-cyan-300/80">vPro® Enabled</span>
          </div>
        </div>

        {/* 2. GPU Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-slate-200">Intel® Iris® Xe Graphics</span>
            </div>
            <span className="text-[10px] font-mono text-purple-400/90">96 EUs</span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-purple-400">
                {latest.gpu}
              </span>
              <span className="text-sm font-mono text-purple-400/70">%</span>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-medium text-slate-300 tabular-nums">
                DirectX 12.1
              </div>
              <div className="text-[10px] text-slate-500">1.35 GHz Clock</div>
            </div>
          </div>

          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-purple-400 h-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, latest.gpu))}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Dynamic VRAM</span>
            <span className="text-purple-300/80">Shared Memory</span>
          </div>
        </div>

        {/* 3. RAM Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">System Memory</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400/90">LPDDR4x-4267</span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-emerald-400">
                {latest.ram}
              </span>
              <span className="text-sm font-mono text-emerald-400/70">%</span>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-medium text-slate-300 tabular-nums">
                {memUsedGB} / {memTotalGB} GB
              </div>
              <div className="text-[10px] text-slate-500">Dual-Channel</div>
            </div>
          </div>

          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, latest.ram))}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Bandwidth 68.2 GB/s</span>
            <span className="text-emerald-300/80">Active</span>
          </div>
        </div>

        {/* 4. Thermal & Power Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-slate-200">Package Thermals</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400/90">TDP 28W</span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-amber-400">
                {latest.temp}
              </span>
              <span className="text-sm font-mono text-amber-400/70">°C</span>
            </div>
            <div className="text-right">
              <div className={`text-xs font-mono font-medium ${thermalState.color}`}>
                {thermalState.label}
              </div>
              <div className="text-[10px] text-slate-500">Dell Power Manager</div>
            </div>
          </div>

          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ease-out ${
                latest.temp >= 80 ? 'bg-rose-500' : latest.temp >= 68 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, (latest.temp / 100) * 100))}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Fan Profile: Balanced</span>
            <span className={thermalState.color}>OK</span>
          </div>
        </div>
      </div>

      {/* Real-time Recharts Area Visualization */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
        {/* Chart Header & Interactive Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-semibold text-slate-100">
                Real-Time Hardware Load Monitor
              </h4>
              <span className="text-xs text-slate-500">· 30-Second Sliding Window</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live synchronous telemetry stream from Dell Latitude 7420 (Owner: Paramveer Rawat)
            </p>
          </div>

          {/* Metric Selector & Stream Controls */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
            {/* Metric Filter Buttons */}
            <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filter === 'all'
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('cpu')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filter === 'cpu'
                    ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                    : 'text-slate-400 hover:text-cyan-400'
                }`}
              >
                CPU
              </button>
              <button
                onClick={() => setFilter('gpu')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filter === 'gpu'
                    ? 'bg-purple-500/20 text-purple-300 font-medium'
                    : 'text-slate-400 hover:text-purple-400'
                }`}
              >
                GPU
              </button>
              <button
                onClick={() => setFilter('ram')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filter === 'ram'
                    ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                    : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                RAM
              </button>
            </div>

            {/* Play/Pause Toggle */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? 'Resume live stream' : 'Pause live stream'}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono inline-flex items-center gap-1.5 transition-colors ${
                isPaused
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Pause</span>
                </>
              )}
            </button>

            {/* Clear History */}
            <button
              onClick={handleClearHistory}
              title="Reset sample history"
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          {(filter === 'all' || filter === 'cpu') && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-slate-300">CPU Usage</span>
              <span className="text-cyan-400 font-semibold tabular-nums">({latest.cpu}%)</span>
            </div>
          )}
          {(filter === 'all' || filter === 'gpu') && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span className="text-slate-300">Intel Iris Xe GPU</span>
              <span className="text-purple-400 font-semibold tabular-nums">({latest.gpu}%)</span>
            </div>
          )}
          {(filter === 'all' || filter === 'ram') && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">System RAM</span>
              <span className="text-emerald-400 font-semibold tabular-nums">({latest.ram}%)</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-2 text-slate-500 text-[11px]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>1 Hz Sampling</span>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={history}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c084fc" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#334155" strokeDasharray="3 3" opacity={0.3} />

              <XAxis
                dataKey="timeStr"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
                tickLine={false}
                interval="preserveStartEnd"
              />

              <YAxis
                stroke="#64748b"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
              />

              <Tooltip content={<CustomHealthTooltip />} />

              {(filter === 'all' || filter === 'ram') && (
                <Area
                  type="monotone"
                  dataKey="ram"
                  stroke="#34d399"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#ramGradient)"
                  isAnimationActive={false}
                />
              )}

              {(filter === 'all' || filter === 'gpu') && (
                <Area
                  type="monotone"
                  dataKey="gpu"
                  stroke="#c084fc"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gpuGradient)"
                  isAnimationActive={false}
                />
              )}

              {(filter === 'all' || filter === 'cpu') && (
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cpuGradient)"
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dell Latitude 7420 Hardware Architecture Spec Sheet */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-slate-100">
              Dell Latitude 7420 Architecture & Diagnostic Profile
            </h4>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            Owner: Paramveer Rawat
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="text-slate-400 font-medium">Compute Subsystem</div>
            <div className="text-slate-200 font-mono text-[11px] leading-relaxed">
              • 11th Gen Intel® Core™ i7-1185G7<br />
              • 4 Cores, 8 Threads @ 3.00 GHz<br />
              • Intel Smart Cache: 12 MB<br />
              • Max Turbo Frequency: 4.80 GHz
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="text-slate-400 font-medium">Graphics & Vision Engine</div>
            <div className="text-slate-200 font-mono text-[11px] leading-relaxed">
              • Intel® Iris® Xe Graphics (96 EU)<br />
              • Max Dynamic Freq: 1.35 GHz<br />
              • DirectX 12.1 / Vulkan 1.3<br />
              • Quick Sync Video & AI Deep Learning Boost
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="text-slate-400 font-medium">Memory & Power Architecture</div>
            <div className="text-slate-200 font-mono text-[11px] leading-relaxed">
              • 16 GB LPDDR4x-4267 MHz (Dual-Channel)<br />
              • Dell ExpressCharge™ 4-Cell 63Wh<br />
              • Thermal Profile: Dell Optimizer<br />
              • Security: Intel vPro® Hardware Shield
            </div>
          </div>
        </div>

        {/* Live Status Summary Footer */}
        <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Telemetry Status: {companionStatus === 'connected' ? 'Live Localhost Agent (Port 8765)' : 'Dell Latitude 7420 Active Engine'}</span>
          </div>
          <div className="text-slate-500 text-[11px]">
            Platform: Windows 11 Pro 64-bit · Assistant: LIZA AI
          </div>
        </div>
      </div>
    </div>
  );
};
