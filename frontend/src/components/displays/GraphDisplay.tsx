import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export interface HistoryPoint { t: number; value: number }

interface Props {
  history: HistoryPoint[];
  label?: string;
  unit?: string;
  max?: number;
  color?: string;
}

// Module-level rolling history cache — survives component remount within page session
const cache = new Map<string, HistoryPoint[]>();

export function pushHistory(key: string, value: number, maxPoints = 30): HistoryPoint[] {
  const prev = cache.get(key) ?? [];
  const next = [...prev, { t: Date.now(), value }].slice(-maxPoints);
  cache.set(key, next);
  return next;
}

export function getHistory(key: string): HistoryPoint[] {
  return cache.get(key) ?? [];
}

function fmt(v: number, unit?: string) {
  if (unit === 'bytes') {
    if (v >= 1e12) return (v / 1e12).toFixed(1) + 'T';
    if (v >= 1e9)  return (v / 1e9).toFixed(1) + 'G';
    if (v >= 1e6)  return (v / 1e6).toFixed(0) + 'M';
    return v + 'B';
  }
  if (unit === 'pct') return v.toFixed(0) + '%';
  return v.toFixed(1);
}

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function GraphDisplay({ history, label, unit, max = 100, color }: Props) {
  const fillColor  = color || 'rgb(var(--color-accent))';
  const strokeClr  = color || 'rgb(var(--color-accent))';

  if (history.length < 2) {
    return (
      <div className="flex items-center justify-center h-full text-tx-muted text-xs">
        Collecting data…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-1">
      {label && <div className="text-xs text-tx-muted">{label}</div>}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={fillColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={fillColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="rgb(var(--color-bg-border))" />
            <XAxis dataKey="t" tickFormatter={fmtTime} tick={{ fontSize: 9, fill: 'rgb(var(--color-text-muted))' }}
              interval="preserveStartEnd" axisLine={false} tickLine={false} />
            <YAxis domain={[0, max]} tickFormatter={(v) => fmt(v, unit)}
              tick={{ fontSize: 9, fill: 'rgb(var(--color-text-muted))' }} axisLine={false} tickLine={false} width={36} />
            <Tooltip
              contentStyle={{ background: 'rgb(var(--color-bg-card))', border: '1px solid rgb(var(--color-bg-border))', borderRadius: 8, fontSize: 11 }}
              labelFormatter={fmtTime}
              formatter={(v: any) => [fmt(Number(v), unit), label ?? '']}
            />
            <Area type="monotone" dataKey="value" stroke={strokeClr} strokeWidth={2}
              fill={`url(#grad-${label})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
