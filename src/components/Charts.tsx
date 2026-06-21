import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  TooltipProps
} from 'recharts';

// Custom Premium Tooltip Component
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card bg-white/95 dark:bg-zinc-950/95 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800 shadow-xl font-sans text-xs">
        <p className="font-bold text-slate-400 dark:text-zinc-550 mb-1 capitalize">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}: <span className="font-bold">{item.value} kg CO₂</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Colors matching our design system
const COLORS = {
  emerald: '#10b981',
  oceanBlue: '#0ea5e9',
  skyBlue: '#38bdf8',
  indigo: '#6366f1',
  rose: '#f43f5e',
  amber: '#f59e0b',
  slate: '#64748b'
};

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface CommonChartProps {
  data: ChartData[];
  dataKey?: string;
  color?: string;
}

// 1. LINE CHART
export const EcoLineChart: React.FC<CommonChartProps> = ({ data, dataKey = 'value', color = COLORS.emerald }) => {
  return (
    <div role="img" aria-label="Line chart showing sustainability performance metrics" className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 1 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. AREA CHART
export const EcoAreaChart: React.FC<CommonChartProps> = ({ data, dataKey = 'value', color = COLORS.oceanBlue }) => {
  return (
    <div role="img" aria-label="Area chart showing cumulative carbon offsets" className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="areaColor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#areaColor)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. BAR CHART
export const EcoBarChart: React.FC<CommonChartProps> = ({ data, dataKey = 'value', color = COLORS.emerald }) => {
  return (
    <div role="img" aria-label="Bar chart comparing weekly footprint metrics" className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={36} animationDuration={1200} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 4. PIE CHART
export const EcoPieChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
  const pieColors = [COLORS.emerald, COLORS.oceanBlue, COLORS.amber, COLORS.indigo, COLORS.rose];
 
  return (
    <div role="img" aria-label="Pie chart displaying carbon category distributions" className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            animationDuration={1200}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconSize={10}
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// 5. PROGRESS CHART
export const EcoProgressChart: React.FC<{ value: number; max: number; label?: string }> = ({
  value,
  max,
  label = 'Footprint limit'
}) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const data = [
    { name: 'Consumed', value: value, fill: percentage > 85 ? COLORS.rose : COLORS.emerald },
    { name: 'Remaining', value: Math.max(0, max - value), fill: '#e2e8f0' } // grey background fill
  ];
 
  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="flex flex-col items-center justify-center h-full w-full font-sans relative"
    >
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={70}
            startAngle={180}
            endAngle={0}
            dataKey="value"
            stroke="none"
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-[52%] flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{percentage}%</span>
        <span className="text-[10px] text-slate-400 dark:text-zinc-550 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
};

// 6. PREDICTION CHART
export const EcoPredictionChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div role="img" aria-label="Line chart comparing historical actual footprint against AI predicted values" className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif' }} />
          {/* Actual values */}
          <Line
            type="monotone"
            name="Actual Footprint"
            dataKey="actual"
            stroke={COLORS.oceanBlue}
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          {/* Predicted values */}
          <Line
            type="monotone"
            name="AI Trend Prediction"
            dataKey="predicted"
            stroke={COLORS.indigo}
            strokeDasharray="5 5"
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
