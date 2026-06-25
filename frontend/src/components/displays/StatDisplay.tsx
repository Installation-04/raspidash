interface StatItem {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

interface Props {
  stats: StatItem[];
  cols?: 1 | 2 | 3;
}

export function StatDisplay({ stats, cols = 2 }: Props) {
  const grid = cols === 1 ? 'grid-cols-1' : cols === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className={`grid ${grid} gap-2 h-full content-start`}>
      {stats.map((s, i) => (
        <div
          key={i}
          className="rounded-xl p-3 flex flex-col justify-center transition-colors"
          style={{
            background: 'rgb(var(--color-bg) / 0.5)',
            border: '1px solid rgb(var(--color-bg-border) / 0.5)',
          }}
        >
          <div
            className="text-2xl font-bold font-mono leading-none tabular-nums"
            style={{ color: s.color ? undefined : 'rgb(var(--color-text))', ...(s.color ? {} : {}) }}
          >
            <span style={s.color ? { color: s.color } : { color: 'rgb(var(--color-text))' }}>
              {s.value}
            </span>
          </div>
          <div className="text-xs mt-1" style={{ color: 'rgb(var(--color-text-muted))' }}>
            {s.label}
          </div>
          {s.sub && (
            <div className="text-xs mt-0.5" style={{ color: 'rgb(var(--color-text-muted) / 0.6)' }}>
              {s.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
