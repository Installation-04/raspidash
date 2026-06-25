interface Props {
  value: number;
  max: number;
  label?: string;
  unit?: string;
  color?: string;
  size?: number;
}

function fmtVal(v: number, max: number, unit?: string) {
  if (unit === 'bytes') {
    if (v >= 1e12) return (v / 1e12).toFixed(1) + ' TB';
    if (v >= 1e9)  return (v / 1e9).toFixed(1) + ' GB';
    if (v >= 1e6)  return (v / 1e6).toFixed(0) + ' MB';
    return v + ' B';
  }
  if (unit === 'pct') return (Math.min(100, (v / max) * 100) || v).toFixed(0) + '%';
  const pct = max > 0 ? (v / max) * 100 : 0;
  return pct.toFixed(0) + '%';
}

export function GaugeDisplay({ value, max, label, unit, color, size = 140 }: Props) {
  const pct  = max > 0 ? Math.min(1, unit === 'pct' ? value / 100 : value / max) : 0;
  const cx   = size / 2;
  const cy   = size * 0.52;
  const r    = size * 0.37;
  const sw   = size * 0.09;
  const GAP  = 45; // degrees cut from the bottom

  const toRad = (d: number) => (d * Math.PI) / 180;
  const arcStart = 90 + GAP / 2;
  const arcSweep = 360 - GAP;

  const pt = (deg: number) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  });

  const describeArc = (startDeg: number, endDeg: number) => {
    const s = pt(startDeg);
    const e = pt(endDeg);
    const span = ((endDeg - startDeg) + 360) % 360;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${e.x} ${e.y}`;
  };

  const valueEnd  = arcStart + arcSweep * pct;
  const baseColor = color || 'rgb(var(--color-accent))';
  const fillColor = pct > 0.85
    ? 'rgb(var(--color-red))'
    : pct > 0.65
    ? 'rgb(var(--color-yellow))'
    : baseColor;

  return (
    <div className="flex flex-col items-center justify-center gap-1 h-full">
      <svg width={size} height={size * 0.82} viewBox={`0 0 ${size} ${size * 0.82}`} overflow="visible">
        {/* Glow filter */}
        <defs>
          <filter id={`glow-${label}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <path
          d={describeArc(arcStart, arcStart + arcSweep - 0.1)}
          fill="none"
          stroke="rgb(var(--color-bg-border))"
          strokeWidth={sw}
          strokeLinecap="round"
        />

        {/* Value arc */}
        {pct > 0.005 && (
          <path
            d={describeArc(arcStart, valueEnd)}
            fill="none"
            stroke={fillColor}
            strokeWidth={sw}
            strokeLinecap="round"
            filter={`url(#glow-${label})`}
            style={{ transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)' }}
          />
        )}

        {/* Value text */}
        <text x={cx} y={cy + 4} textAnchor="middle" dominantBaseline="middle"
          fill="rgb(var(--color-text))"
          fontSize={size * 0.155}
          fontWeight="700"
          fontFamily="'JetBrains Mono', monospace"
          letterSpacing="-1">
          {fmtVal(value, max, unit)}
        </text>

        {label && (
          <text x={cx} y={cy + size * 0.185} textAnchor="middle"
            fill="rgb(var(--color-text-muted))"
            fontSize={size * 0.085}
            fontFamily="'Inter', sans-serif">
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}
