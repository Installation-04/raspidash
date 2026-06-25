export interface StatItem {
  value: string | number;
  label: string;
  color?: string;
}

export function ServiceStatRow({ stats }: { stats: StatItem[] }) {
  if (!stats.length) return null;
  return (
    <div style={{
      display: 'flex',
      marginTop: 'auto',
      marginLeft: '-14px',
      marginRight: '-14px',
      marginBottom: '-14px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          flex: 1,
          padding: '8px 10px 10px',
          textAlign: 'center',
          borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}>
          <div style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            lineHeight: 1,
            color: s.color ?? 'rgb(var(--color-text))',
          }}>
            {s.value}
          </div>
          <div style={{
            fontSize: '9px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginTop: '4px',
            color: 'rgba(255,255,255,0.35)',
          }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
