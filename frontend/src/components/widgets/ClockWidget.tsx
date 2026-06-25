import { useState, useEffect } from 'react';

export function ClockWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  const s = now.getSeconds().toString().padStart(2, '0');
  const date = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const year = now.getFullYear();
  const secPct = (now.getSeconds() / 59) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
      {/* Time */}
      <div className="flex items-end gap-1">
        <span
          className="font-mono font-bold leading-none tabular-nums"
          style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            color: `rgb(var(--color-blue))`,
            textShadow: `0 0 40px rgb(var(--color-blue) / 0.4)`,
          }}
        >
          {h}:{m}
        </span>
        <span
          className="font-mono font-bold leading-none tabular-nums mb-0.5 pulse-dot"
          style={{ fontSize: 'clamp(1rem, 3vw, 1.75rem)', color: `rgb(var(--color-accent))` }}
        >
          {s}
        </span>
      </div>

      {/* Progress bar — fills across the minute */}
      <div className="w-full max-w-[160px] h-0.5 rounded-full overflow-hidden"
        style={{ background: `rgb(var(--color-bg-border))` }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${secPct}%`,
            background: `linear-gradient(90deg, rgb(var(--color-blue)), rgb(var(--color-accent)))`,
            boxShadow: `0 0 6px rgb(var(--color-blue) / 0.6)`,
          }}
        />
      </div>

      {/* Date */}
      <div className="text-center">
        <div className="text-sm font-medium text-tx">{date}</div>
        <div className="text-xs text-tx-muted">{year}</div>
      </div>
    </div>
  );
}
