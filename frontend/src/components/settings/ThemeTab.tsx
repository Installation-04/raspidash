import { THEMES } from '../../themes';

interface Props { themeId: string; onChange: (id: string) => void }

export function ThemeTab({ themeId, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-muted))' }}>
        Theme
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {THEMES.map((theme) => {
          const bg     = `rgb(${theme.vars['--color-bg']})`;
          const card   = `rgb(${theme.vars['--color-bg-card']})`;
          const border = `rgb(${theme.vars['--color-bg-border']})`;
          const accent = `rgb(${theme.vars['--color-accent']})`;
          const blue   = `rgb(${theme.vars['--color-blue']})`;
          const green  = `rgb(${theme.vars['--color-green']})`;
          const red    = `rgb(${theme.vars['--color-red']})`;
          const text   = `rgb(${theme.vars['--color-text']})`;
          const active = themeId === theme.id;

          return (
            <button
              key={theme.id}
              onClick={() => onChange(theme.id)}
              className="relative rounded-xl p-3 text-left transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: bg,
                border: `2px solid ${active ? accent : border}`,
                boxShadow: active ? `0 0 20px ${accent}40` : '0 2px 8px rgb(0 0 0 / 0.3)',
              }}
            >
              {/* Swatch row */}
              <div className="flex gap-1 mb-2.5">
                {[accent, blue, green, red].map((c, i) => (
                  <div key={i} className="w-3.5 h-3.5 rounded-full" style={{ background: c }} />
                ))}
              </div>

              {/* Mini card */}
              <div className="rounded-lg p-2 mb-2.5" style={{ background: card, border: `1px solid ${border}` }}>
                <div className="flex items-center gap-1 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: green }} />
                  <div className="text-[8px] font-bold" style={{ color: text }}>node-01</div>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: border }}>
                  <div className="h-full rounded-full w-3/5" style={{
                    background: `linear-gradient(90deg, ${accent}, ${blue})`,
                  }} />
                </div>
              </div>

              <div className="text-xs font-semibold" style={{ color: text }}>{theme.name}</div>

              {/* Check mark */}
              {active && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: accent, boxShadow: `0 0 8px ${accent}80` }}>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
