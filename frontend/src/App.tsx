import { useState, useEffect } from 'react';
import { Settings, Plus, LayoutGrid, Lock } from 'lucide-react';
import { useConfig } from './hooks/useConfig';
import { Dashboard } from './components/Dashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { AddWidgetModal } from './components/AddWidgetModal';
import { WidgetConfig } from './types';
import { applyTheme, getTheme } from './themes';

export default function App() {
  const { config, setConfig, loading } = useConfig();
  const [editing, setEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);

  useEffect(() => {
    if (!loading) {
      const theme = getTheme(config.themeId || 'dark');
      applyTheme(theme.vars, config.customColors || {});

      const root = document.documentElement;
      const radMap: Record<string, string> = { none: '0px', sm: '8px', md: '12px', lg: '16px', xl: '24px' };
      root.style.setProperty('--widget-radius', radMap[config.widgetBorderRadius ?? 'sm'] ?? '8px');
      const gapMap: Record<string, string> = { tight: '6px', normal: '10px', relaxed: '18px' };
      root.style.setProperty('--widget-gap', gapMap[config.widgetGap ?? 'normal'] ?? '10px');
      const blurMap: Record<string, string> = { off: '0px', low: '4px', medium: '12px', high: '28px' };
      const alphaMap: Record<string, string> = { off: '0.95', low: '0.88', medium: '0.82', high: '0.55' };
      root.style.setProperty('--glass-blur', blurMap[config.glassmorphismIntensity ?? 'medium']);
      root.style.setProperty('--glass-alpha', alphaMap[config.glassmorphismIntensity ?? 'medium']);
      root.style.setProperty('--animation-duration', (config.animationsEnabled ?? true) ? '0.25s' : '0s');
      const fontMap: Record<string, string> = {
        system: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        mono: '"JetBrains Mono", "Fira Code", monospace',
        inter: '"Inter", sans-serif',
        sans: '"DM Sans", "Nunito", sans-serif',
      };
      root.style.setProperty('--font-family', fontMap[config.fontFamily ?? 'inter'] ?? '');
      root.classList.toggle('compact', config.compactMode ?? false);
      root.setAttribute('data-bg', config.backgroundStyle ?? 'none');

      // Pi display
      const scale = config.uiScale ?? 1;
      document.body.style.zoom = scale === 1 ? '' : String(scale);
      root.classList.toggle('touch-mode', config.touchMode ?? false);
      root.classList.toggle('hide-scrollbars', config.hideScrollbars ?? false);
      root.classList.toggle('high-contrast', config.highContrast ?? false);
      root.classList.toggle('cursor-hidden', config.cursorHidden ?? false);
      if (config.overscanCompensation) {
        document.body.style.margin = '8px';
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.margin = '';
        document.body.style.overflow = '';
      }
    }
  }, [loading, config.themeId, config.customColors, config.widgetBorderRadius, config.widgetGap,
      config.glassmorphismIntensity, config.animationsEnabled, config.fontFamily, config.compactMode,
      config.backgroundStyle, config.uiScale, config.touchMode, config.hideScrollbars,
      config.highContrast, config.cursorHidden, config.overscanCompensation]);

  const gapPx = { tight: 6, normal: 10, relaxed: 18 }[config.widgetGap ?? 'normal'] ?? 10;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-bounce">🍓</div>
          <div className="text-sm text-tx-muted tracking-wide">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ position: 'relative' }}>

      {/* ── Background image ──────────────────────────────────────────────── */}
      {config.backgroundImage && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          overflow: 'hidden',
        }}>
          <img
            src={config.backgroundImage}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: `rgb(var(--color-bg) / ${config.backgroundOverlayOpacity ?? 0.72})`,
          }} />
        </div>
      )}

      {/* ── Topbar ───────────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 20,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0 16px',
          height: 44,
          background: 'rgba(var(--color-bg-card), 0) ',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: 'rgb(var(--color-bg-card) / 0.6)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, userSelect: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>🍓</span>
          <span style={{
            fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em',
            background: `linear-gradient(135deg, rgb(var(--color-text)), rgb(var(--color-accent)))`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {config.dashboardTitle || 'Raspidash'}
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {editing && (
            <button
              onClick={() => setShowAddWidget(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', fontSize: 12, fontWeight: 600,
                borderRadius: 6, color: 'white', cursor: 'pointer', border: 'none',
                background: `linear-gradient(135deg, rgb(var(--color-accent)), rgb(var(--color-accent) / 0.75))`,
                boxShadow: `0 0 14px rgb(var(--color-accent) / 0.35)`,
              }}
            >
              <Plus size={13} /> Add Widget
            </button>
          )}

          <button
            onClick={() => setEditing((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', fontSize: 12, fontWeight: 600,
              borderRadius: 6, cursor: 'pointer', border: 'none',
              ...(editing ? {
                background: 'rgba(74,222,128,0.12)',
                color: 'rgb(74,222,128)',
                outline: '1px solid rgba(74,222,128,0.25)',
              } : {
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.55)',
                outline: '1px solid rgba(255,255,255,0.1)',
              }),
            }}
          >
            {editing ? <><LayoutGrid size={13} /> Editing</> : <><Lock size={13} /> Edit Layout</>}
          </button>

          <button
            onClick={() => setShowSettings(true)}
            style={{
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.45)',
              outline: '1px solid rgba(255,255,255,0.1)',
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
            }}
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      {/* ── Dashboard ─────────────────────────────────────────────────────── */}
      <main className="flex-1 dashboard-bg" style={{ padding: gapPx, position: 'relative', zIndex: 1 }}>
        <Dashboard
          widgets={config.widgets}
          integrations={config.integrations}
          editing={editing}
          gap={gapPx}
          gridCols={config.gridCols ?? 12}
          rowHeight={config.rowHeight ?? 80}
          onWidgetsChange={(widgets: WidgetConfig[]) => setConfig({ ...config, widgets })}
        />
      </main>

      {showSettings && (
        <SettingsPanel
          config={config}
          onClose={() => setShowSettings(false)}
          onConfigChange={setConfig}
        />
      )}

      {showAddWidget && (
        <AddWidgetModal
          integrations={config.integrations}
          onAdd={(widget) => setConfig({ ...config, widgets: [...config.widgets, widget] })}
          onClose={() => setShowAddWidget(false)}
        />
      )}
    </div>
  );
}
