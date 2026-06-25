import { AppConfig } from '../../types';
import { api } from '../../api';

interface Props {
  config: AppConfig;
  onChange: (config: AppConfig) => void;
}

type SelectOption = { value: string; label: string };

// ── Screen presets ─────────────────────────────────────────────────────────
interface ScreenPreset {
  id: string;
  name: string;
  maker: string;
  resolution: string;
  icon: string;
  gridCols: number;
  rowHeight: number;
  uiScale: number;
  widgetGap: AppConfig['widgetGap'];
  widgetBorderRadius: AppConfig['widgetBorderRadius'];
  compactMode: boolean;
  touchMode: boolean;
  glassmorphismIntensity: AppConfig['glassmorphismIntensity'];
  animationsEnabled: boolean;
}

const SCREEN_PRESETS: ScreenPreset[] = [
  {
    id: 'pi7official',
    name: 'Pi 7" Official',
    maker: 'Raspberry Pi Foundation',
    resolution: '800 × 480',
    icon: '🖥️',
    gridCols: 8,
    rowHeight: 58,
    uiScale: 1,
    widgetGap: 'tight',
    widgetBorderRadius: 'md',
    compactMode: true,
    touchMode: true,
    glassmorphismIntensity: 'low',
    animationsEnabled: false,
  },
  {
    id: 'geekpi10rack',
    name: 'GeeekPi 10.1" Rack',
    maker: 'GeeekPi / Waveshare',
    resolution: '1280 × 800',
    icon: '🖥️',
    gridCols: 12,
    rowHeight: 72,
    uiScale: 1,
    widgetGap: 'normal',
    widgetBorderRadius: 'lg',
    compactMode: false,
    touchMode: false,
    glassmorphismIntensity: 'medium',
    animationsEnabled: true,
  },
  {
    id: 'waveshare7',
    name: 'Waveshare 7" IPS',
    maker: 'Waveshare',
    resolution: '1024 × 600',
    icon: '🖥️',
    gridCols: 10,
    rowHeight: 64,
    uiScale: 0.95,
    widgetGap: 'tight',
    widgetBorderRadius: 'md',
    compactMode: true,
    touchMode: true,
    glassmorphismIntensity: 'low',
    animationsEnabled: false,
  },
  {
    id: 'waveshare10',
    name: 'Waveshare 10.1" IPS',
    maker: 'Waveshare',
    resolution: '1280 × 800',
    icon: '🖥️',
    gridCols: 12,
    rowHeight: 72,
    uiScale: 1,
    widgetGap: 'normal',
    widgetBorderRadius: 'lg',
    compactMode: false,
    touchMode: true,
    glassmorphismIntensity: 'medium',
    animationsEnabled: true,
  },
  {
    id: 'hyperpixel4',
    name: 'HyperPixel 4.0"',
    maker: 'Pimoroni',
    resolution: '800 × 480',
    icon: '📱',
    gridCols: 6,
    rowHeight: 55,
    uiScale: 0.9,
    widgetGap: 'tight',
    widgetBorderRadius: 'sm',
    compactMode: true,
    touchMode: true,
    glassmorphismIntensity: 'off',
    animationsEnabled: false,
  },
  {
    id: 'hyperpixel4sq',
    name: 'HyperPixel 4.0" Square',
    maker: 'Pimoroni',
    resolution: '720 × 720',
    icon: '📱',
    gridCols: 6,
    rowHeight: 60,
    uiScale: 0.9,
    widgetGap: 'tight',
    widgetBorderRadius: 'md',
    compactMode: true,
    touchMode: true,
    glassmorphismIntensity: 'off',
    animationsEnabled: false,
  },
  {
    id: 'geekpi7',
    name: 'GeeekPi 7" IPS',
    maker: 'GeeekPi',
    resolution: '1024 × 600',
    icon: '🖥️',
    gridCols: 10,
    rowHeight: 62,
    uiScale: 1,
    widgetGap: 'tight',
    widgetBorderRadius: 'md',
    compactMode: true,
    touchMode: true,
    glassmorphismIntensity: 'low',
    animationsEnabled: false,
  },
  {
    id: 'hdmi1080',
    name: 'HDMI 1080p',
    maker: 'Standard monitor',
    resolution: '1920 × 1080',
    icon: '🖥️',
    gridCols: 16,
    rowHeight: 90,
    uiScale: 1,
    widgetGap: 'relaxed',
    widgetBorderRadius: 'xl',
    compactMode: false,
    touchMode: false,
    glassmorphismIntensity: 'high',
    animationsEnabled: true,
  },
  {
    id: 'hdmi4k',
    name: 'HDMI 4K',
    maker: 'Standard monitor',
    resolution: '3840 × 2160',
    icon: '🖥️',
    gridCols: 20,
    rowHeight: 100,
    uiScale: 1.25,
    widgetGap: 'relaxed',
    widgetBorderRadius: 'xl',
    compactMode: false,
    touchMode: false,
    glassmorphismIntensity: 'high',
    animationsEnabled: true,
  },
];

// ── Helper sub-components ──────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--color-accent))' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 px-3 rounded-xl transition-colors"
      style={{ background: 'rgb(var(--color-bg) / 0.4)', border: '1px solid rgb(var(--color-bg-border) / 0.4)' }}>
      <div className="min-w-0">
        <div className="text-sm text-tx font-medium">{label}</div>
        {hint && <div className="text-xs mt-0.5" style={{ color: 'rgb(var(--color-text-muted))' }}>{hint}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        background: value ? 'rgb(var(--color-accent))' : 'rgb(var(--color-bg-border))',
        height: '22px',
        minWidth: '40px',
        borderRadius: '999px',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}>
      <span style={{
        position: 'absolute', top: '3px', left: '3px',
        width: '16px', height: '16px', borderRadius: '999px',
        background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        transition: 'transform 0.2s',
        transform: value ? 'translateX(18px)' : 'translateX(0)',
      }} />
    </button>
  );
}

function Select({ value, options, onChange }: { value: string; options: SelectOption[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input text-sm py-1" style={{ minWidth: '120px' }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function ChipGroup({ value, options, onChange }: { value: string; options: SelectOption[]; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 flex-wrap justify-end">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
          style={{
            background: value === o.value ? 'rgb(var(--color-accent))' : 'rgb(var(--color-bg-border) / 0.6)',
            color: value === o.value ? 'white' : 'rgb(var(--color-text-muted))',
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function GeneralTab({ config, onChange }: Props) {
  function save(patch: Partial<AppConfig>) {
    const next = { ...config, ...patch };
    onChange(next);
    api.saveGeneral(patch as Record<string, unknown>).catch(() => {});
    applyLive(patch);
  }

  function applyPreset(preset: ScreenPreset) {
    const patch: Partial<AppConfig> = {
      screenPreset: preset.id,
      gridCols: preset.gridCols,
      rowHeight: preset.rowHeight,
      uiScale: preset.uiScale,
      widgetGap: preset.widgetGap,
      widgetBorderRadius: preset.widgetBorderRadius,
      compactMode: preset.compactMode,
      touchMode: preset.touchMode,
      glassmorphismIntensity: preset.glassmorphismIntensity,
      animationsEnabled: preset.animationsEnabled,
    };
    save(patch);
  }

  function applyLive(patch: Partial<AppConfig>) {
    const root = document.documentElement;
    if (patch.widgetBorderRadius !== undefined) {
      const map: Record<string, string> = { none: '0px', sm: '8px', md: '12px', lg: '16px', xl: '24px' };
      root.style.setProperty('--widget-radius', map[patch.widgetBorderRadius] ?? '16px');
    }
    if (patch.widgetGap !== undefined) {
      const map: Record<string, string> = { tight: '8px', normal: '14px', relaxed: '22px' };
      root.style.setProperty('--widget-gap', map[patch.widgetGap] ?? '14px');
    }
    if (patch.animationsEnabled !== undefined) {
      root.style.setProperty('--animation-duration', patch.animationsEnabled ? '0.35s' : '0s');
    }
    if (patch.glassmorphismIntensity !== undefined) {
      const blurMap: Record<string, string> = { off: '0px', low: '6px', medium: '16px', high: '32px' };
      const alphaMap: Record<string, string> = { off: '0.9', low: '0.6', medium: '0.35', high: '0.15' };
      root.style.setProperty('--glass-blur', blurMap[patch.glassmorphismIntensity]);
      root.style.setProperty('--glass-alpha', alphaMap[patch.glassmorphismIntensity]);
    }
    if (patch.backgroundStyle !== undefined) root.setAttribute('data-bg', patch.backgroundStyle);
    if (patch.fontFamily !== undefined) {
      const fontMap: Record<string, string> = {
        system: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        mono: '"JetBrains Mono", "Fira Code", monospace',
        inter: '"Inter", sans-serif',
        sans: '"DM Sans", "Nunito", sans-serif',
      };
      root.style.setProperty('--font-family', fontMap[patch.fontFamily] ?? '');
    }
    if (patch.compactMode !== undefined) root.classList.toggle('compact', patch.compactMode);
    if (patch.uiScale !== undefined) {
      document.body.style.zoom = patch.uiScale === 1 ? '' : String(patch.uiScale);
    }
    if (patch.touchMode !== undefined) root.classList.toggle('touch-mode', patch.touchMode);
    if (patch.hideScrollbars !== undefined) root.classList.toggle('hide-scrollbars', patch.hideScrollbars);
    if (patch.highContrast !== undefined) root.classList.toggle('high-contrast', patch.highContrast);
    if (patch.cursorHidden !== undefined) root.classList.toggle('cursor-hidden', patch.cursorHidden);
    if (patch.overscanCompensation !== undefined) {
      document.body.style.margin = patch.overscanCompensation ? '8px' : '';
      document.body.style.overflow = patch.overscanCompensation ? 'hidden' : '';
    }
  }

  const g = config;
  const activePreset = g.screenPreset ?? null;

  return (
    <div className="flex flex-col gap-6">

      {/* Pi Display Presets */}
      <Section title="Pi Display Presets">
        <div className="text-xs mb-1" style={{ color: 'rgb(var(--color-text-muted))' }}>
          One click to configure the grid, scale, and UI for your screen
        </div>
        <div className="grid grid-cols-1 gap-2">
          {SCREEN_PRESETS.map((preset) => {
            const active = activePreset === preset.id;
            return (
              <button key={preset.id} onClick={() => applyPreset(preset)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: active ? 'rgb(var(--color-accent) / 0.12)' : 'rgb(var(--color-bg) / 0.4)',
                  border: `1px solid ${active ? 'rgb(var(--color-accent) / 0.5)' : 'rgb(var(--color-bg-border) / 0.4)'}`,
                }}>
                {/* Mini screen mockup */}
                <div className="flex-shrink-0 w-10 h-7 rounded flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: 'rgb(var(--color-bg) / 0.8)',
                    border: `1.5px solid ${active ? 'rgb(var(--color-accent))' : 'rgb(var(--color-bg-border))'}`,
                  }}>
                  <div className="absolute inset-1 grid gap-0.5" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' }}>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="rounded-sm"
                        style={{ background: active ? 'rgb(var(--color-accent) / 0.4)' : 'rgb(var(--color-bg-border) / 0.6)' }} />
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-tx">{preset.name}</span>
                    {active && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgb(var(--color-accent) / 0.2)', color: 'rgb(var(--color-accent))' }}>
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5 flex items-center gap-2 flex-wrap"
                    style={{ color: 'rgb(var(--color-text-muted))' }}>
                    <span>{preset.maker}</span>
                    <span>·</span>
                    <span>{preset.resolution}</span>
                    <span>·</span>
                    <span>{preset.gridCols} cols</span>
                    {preset.touchMode && <span className="px-1 py-0.5 rounded text-[10px]"
                      style={{ background: 'rgb(var(--color-blue) / 0.15)', color: 'rgb(var(--color-blue))' }}>touch</span>}
                  </div>
                </div>

                {active && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgb(var(--color-accent))' }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Pi Display Fine-Tuning */}
      <Section title="Display Fine-Tuning">
        <Row label="Grid columns" hint="Number of columns in the widget grid">
          <div className="flex items-center gap-2">
            <input type="range" min={4} max={24} step={1}
              value={g.gridCols ?? 12}
              onChange={(e) => save({ gridCols: Number(e.target.value), screenPreset: 'custom' })}
              className="w-24"
              style={{ accentColor: 'rgb(var(--color-accent))' }}
            />
            <span className="text-sm font-mono text-tx w-6 text-center">{g.gridCols ?? 12}</span>
          </div>
        </Row>
        <Row label="Row height (px)" hint="Height of each grid row unit">
          <div className="flex items-center gap-2">
            <input type="range" min={40} max={140} step={2}
              value={g.rowHeight ?? 80}
              onChange={(e) => save({ rowHeight: Number(e.target.value), screenPreset: 'custom' })}
              className="w-24"
              style={{ accentColor: 'rgb(var(--color-accent))' }}
            />
            <span className="text-sm font-mono text-tx w-8 text-center">{g.rowHeight ?? 80}</span>
          </div>
        </Row>
        <Row label="UI scale" hint="Zoom the entire interface">
          <div className="flex items-center gap-2">
            <input type="range" min={0.5} max={2} step={0.05}
              value={g.uiScale ?? 1}
              onChange={(e) => save({ uiScale: Number(e.target.value), screenPreset: 'custom' })}
              className="w-24"
              style={{ accentColor: 'rgb(var(--color-accent))' }}
            />
            <span className="text-sm font-mono text-tx w-10 text-center">{((g.uiScale ?? 1) * 100).toFixed(0)}%</span>
          </div>
        </Row>
        <Row label="Touch mode" hint="Larger tap targets for touchscreens">
          <Toggle value={g.touchMode ?? false} onChange={(v) => save({ touchMode: v, screenPreset: 'custom' })} />
        </Row>
        <Row label="Overscan compensation" hint="Adds 8px margin for TVs that crop edges">
          <Toggle value={g.overscanCompensation ?? false} onChange={(v) => save({ overscanCompensation: v, screenPreset: 'custom' })} />
        </Row>
        <Row label="Hide scrollbars" hint="Cleaner kiosk look — content still scrollable">
          <Toggle value={g.hideScrollbars ?? false} onChange={(v) => save({ hideScrollbars: v, screenPreset: 'custom' })} />
        </Row>
        <Row label="Hide cursor" hint="For dedicated kiosk displays without a mouse">
          <Toggle value={g.cursorHidden ?? false} onChange={(v) => save({ cursorHidden: v, screenPreset: 'custom' })} />
        </Row>
        <Row label="High contrast borders" hint="Thicker, brighter widget outlines for low-quality panels">
          <Toggle value={g.highContrast ?? false} onChange={(v) => save({ highContrast: v, screenPreset: 'custom' })} />
        </Row>
      </Section>

      {/* Dashboard */}
      <Section title="Dashboard">
        <Row label="Title" hint="Shown in the browser tab and navbar">
          <input className="input text-sm py-1" style={{ minWidth: '150px' }}
            placeholder="Raspidash" value={g.dashboardTitle ?? ''}
            onChange={(e) => save({ dashboardTitle: e.target.value })} />
        </Row>
        <Row label="Background style">
          <ChipGroup value={g.backgroundStyle ?? 'none'}
            options={[{ value: 'dots', label: 'Dots' }, { value: 'grid', label: 'Grid' }, { value: 'none', label: 'None' }]}
            onChange={(v) => save({ backgroundStyle: v as any })} />
        </Row>
        <Row label="Background image" hint="URL of a background image">
          <input className="input text-sm py-1" style={{ minWidth: '180px' }}
            placeholder="https://…/image.jpg"
            value={g.backgroundImage ?? ''}
            onChange={(e) => save({ backgroundImage: e.target.value || undefined })} />
        </Row>
        {g.backgroundImage && (
          <Row label="Image overlay opacity" hint="Higher = more opaque (darker image)">
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={1} step={0.05}
                value={g.backgroundOverlayOpacity ?? 0.72}
                onChange={(e) => save({ backgroundOverlayOpacity: Number(e.target.value) })}
                className="w-24" style={{ accentColor: 'rgb(var(--color-accent))' }} />
              <span className="text-sm font-mono text-tx w-10 text-center">
                {Math.round((g.backgroundOverlayOpacity ?? 0.72) * 100)}%
              </span>
            </div>
          </Row>
        )}
        <Row label="Compact mode" hint="Tighter padding inside widgets">
          <Toggle value={g.compactMode ?? false} onChange={(v) => save({ compactMode: v })} />
        </Row>
      </Section>

      {/* Widgets */}
      <Section title="Widgets">
        <Row label="Corner radius">
          <ChipGroup value={g.widgetBorderRadius ?? 'lg'}
            options={[{ value: 'none', label: 'None' }, { value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }, { value: 'xl', label: 'XL' }]}
            onChange={(v) => save({ widgetBorderRadius: v as any })} />
        </Row>
        <Row label="Widget gap">
          <ChipGroup value={g.widgetGap ?? 'normal'}
            options={[{ value: 'tight', label: 'Tight' }, { value: 'normal', label: 'Normal' }, { value: 'relaxed', label: 'Relaxed' }]}
            onChange={(v) => save({ widgetGap: v as any })} />
        </Row>
        <Row label="Glassmorphism intensity">
          <ChipGroup value={g.glassmorphismIntensity ?? 'medium'}
            options={[{ value: 'off', label: 'Off' }, { value: 'low', label: 'Low' }, { value: 'medium', label: 'Med' }, { value: 'high', label: 'High' }]}
            onChange={(v) => save({ glassmorphismIntensity: v as any })} />
        </Row>
        <Row label="Show widget titles">
          <Toggle value={g.showWidgetTitles ?? true} onChange={(v) => save({ showWidgetTitles: v })} />
        </Row>
        <Row label="Show last updated time">
          <Toggle value={g.showLastUpdated ?? false} onChange={(v) => save({ showLastUpdated: v })} />
        </Row>
        <Row label="Animations" hint="Fade and slide transitions">
          <Toggle value={g.animationsEnabled ?? true} onChange={(v) => save({ animationsEnabled: v })} />
        </Row>
      </Section>

      {/* Typography */}
      <Section title="Typography">
        <Row label="Font family">
          <Select value={g.fontFamily ?? 'inter'}
            options={[
              { value: 'inter', label: 'Inter' },
              { value: 'mono', label: 'JetBrains Mono' },
              { value: 'sans', label: 'DM Sans' },
              { value: 'system', label: 'System default' },
            ]}
            onChange={(v) => save({ fontFamily: v as any })} />
        </Row>
      </Section>

      {/* Date & Time */}
      <Section title="Date & Time">
        <Row label="Refresh interval">
          <div className="flex items-center gap-2">
            <input type="number" min={5} max={3600} className="input text-sm py-1 w-20 text-center"
              value={g.refreshInterval ?? 30}
              onChange={(e) => save({ refreshInterval: Number(e.target.value) })} />
            <span className="text-xs" style={{ color: 'rgb(var(--color-text-muted))' }}>sec</span>
          </div>
        </Row>
        <Row label="Time format">
          <ChipGroup value={g.timeFormat ?? '24h'}
            options={[{ value: '24h', label: '24h' }, { value: '12h', label: '12h' }]}
            onChange={(v) => save({ timeFormat: v as any })} />
        </Row>
        <Row label="Date format">
          <Select value={g.dateFormat ?? 'DD/MM/YYYY'}
            options={[
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
            ]}
            onChange={(v) => save({ dateFormat: v as any })} />
        </Row>
        <Row label="Temperature unit">
          <ChipGroup value={g.temperatureUnit ?? 'celsius'}
            options={[{ value: 'celsius', label: '°C' }, { value: 'fahrenheit', label: '°F' }]}
            onChange={(v) => save({ temperatureUnit: v as any })} />
        </Row>
        <Row label="Timezone">
          <Select value={g.timezone ?? 'local'}
            options={[
              { value: 'local', label: 'Local' }, { value: 'UTC', label: 'UTC' },
              { value: 'America/New_York', label: 'New York' }, { value: 'America/Los_Angeles', label: 'Los Angeles' },
              { value: 'America/Chicago', label: 'Chicago' }, { value: 'Europe/London', label: 'London' },
              { value: 'Europe/Paris', label: 'Paris' }, { value: 'Europe/Berlin', label: 'Berlin' },
              { value: 'Europe/Rome', label: 'Rome' }, { value: 'Asia/Tokyo', label: 'Tokyo' },
              { value: 'Asia/Shanghai', label: 'Shanghai' }, { value: 'Asia/Kolkata', label: 'India' },
              { value: 'Australia/Sydney', label: 'Sydney' },
            ]}
            onChange={(v) => save({ timezone: v })} />
        </Row>
      </Section>

      {/* Backup & Restore */}
      <Section title="Backup & Restore">
        <div className="text-xs mb-3" style={{ color: 'rgb(var(--color-text-muted))' }}>
          Backup saves your full config including integrations and credentials. Keep it safe.
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => api.backup().catch(e => alert('Backup failed: ' + e.message))}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-all"
            style={{ background: 'rgb(var(--color-accent) / 0.15)', border: '1px solid rgb(var(--color-accent) / 0.4)', color: 'rgb(var(--color-accent))' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgb(var(--color-accent) / 0.25)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgb(var(--color-accent) / 0.15)'; }}>
            ⬇ Download Backup
          </button>
          <label
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-all cursor-pointer"
            style={{ background: 'rgb(var(--color-bg-border) / 0.3)', border: '1px solid rgb(var(--color-bg-border))', color: 'rgb(var(--color-text-muted))' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgb(var(--color-text))'; (e.currentTarget as HTMLElement).style.borderColor = 'rgb(var(--color-accent) / 0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgb(var(--color-text-muted))'; (e.currentTarget as HTMLElement).style.borderColor = 'rgb(var(--color-bg-border))'; }}>
            ⬆ Restore Backup
            <input type="file" accept=".json" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const text = await file.text();
                const data = JSON.parse(text);
                if (!confirm(`Restore backup? This will replace ALL current settings, ${data.integrations?.length ?? 0} integrations and ${data.widgets?.length ?? 0} widgets.`)) return;
                await api.restore(data);
                window.location.reload();
              } catch (err: any) {
                alert('Restore failed: ' + err.message);
              }
              e.target.value = '';
            }} />
          </label>
        </div>
      </Section>

      {/* About */}
      <Section title="About">
        <div className="rounded-xl px-3 py-3 flex items-center gap-3"
          style={{ background: 'rgb(var(--color-bg) / 0.4)', border: '1px solid rgb(var(--color-bg-border) / 0.4)' }}>
          <div className="text-2xl">🍓</div>
          <div>
            <div className="text-sm font-semibold text-tx">Raspidash</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgb(var(--color-text-muted))' }}>
              Self-hosted homelab dashboard for Raspberry Pi
            </div>
          </div>
        </div>
      </Section>

    </div>
  );
}
