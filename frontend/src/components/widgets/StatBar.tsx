interface StatBarProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color?: string;
}

function fmtBytes(b: number) {
  if (b >= 1e12) return (b / 1e12).toFixed(1) + ' TB';
  if (b >= 1e9)  return (b / 1e9).toFixed(1) + ' GB';
  if (b >= 1e6)  return (b / 1e6).toFixed(1) + ' MB';
  return b + ' B';
}

export function StatBar({ label, value, max, unit, color }: StatBarProps) {
  const pct     = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const display = unit === 'bytes'
    ? `${fmtBytes(value)} / ${fmtBytes(max)}`
    : `${pct.toFixed(0)}%`;

  const barColor = pct > 85
    ? 'rgb(var(--color-red))'
    : pct > 65
    ? 'rgb(var(--color-yellow))'
    : color || 'rgb(var(--color-blue))';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs" style={{ color: 'rgb(var(--color-text-muted))' }}>
        <span>{label}</span>
        <span className="font-mono">{display}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-bg-border) / 0.6)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${barColor}, ${barColor.replace(')', ' / 0.7)')})`,
            boxShadow: `0 0 8px ${barColor.replace(')', ' / 0.5)')}`,
          }}
        />
      </div>
    </div>
  );
}
