import { ReactNode } from 'react';
import { X, GripHorizontal } from 'lucide-react';

export type ServiceStatus = 'online' | 'offline' | 'loading' | undefined;

interface Props {
  title: string;
  serviceIcon?: ReactNode;
  serviceColor?: string;
  serviceSubtitle?: string;
  status?: ServiceStatus;
  ping?: number;
  children: ReactNode;
  onDelete?: () => void;
  editing?: boolean;
}

export function WidgetShell({
  title, serviceIcon, serviceColor, serviceSubtitle,
  status, ping, children, onDelete, editing,
}: Props) {
  const iconBg = serviceColor
    ? `${serviceColor}26`
    : 'rgba(255,255,255,0.07)';

  return (
    <div className="widget-card flex flex-col h-full animate-fade-in" style={{ overflow: 'hidden' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="drag-handle flex items-center gap-2.5 px-3.5 py-2.5"
        style={{ cursor: editing ? 'grab' : 'default' }}
      >
        {/* Service icon */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-lg"
          style={{
            width: 34,
            height: 34,
            background: iconBg,
            color: serviceColor ?? 'rgb(var(--color-accent))',
          }}
        >
          {serviceIcon ?? <span className="text-xs font-bold opacity-60">{title.slice(0, 2).toUpperCase()}</span>}
        </div>

        {/* Title + subtitle */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-tx truncate leading-snug">{title}</div>
          {serviceSubtitle && (
            <div className="text-[10px] truncate leading-snug mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {serviceSubtitle}
            </div>
          )}
        </div>

        {/* Right: ping + status + edit controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {ping != null && (
            <span className="font-mono" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.22)' }}>
              {ping}ms
            </span>
          )}

          {status === 'online' && (
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.07em',
              padding: '2px 6px', borderRadius: 4,
              background: 'rgba(74,222,128,0.15)', color: '#4ade80',
              textTransform: 'uppercase',
            }}>
              Online
            </span>
          )}
          {status === 'offline' && (
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.07em',
              padding: '2px 6px', borderRadius: 4,
              background: 'rgba(248,113,113,0.15)', color: '#f87171',
              textTransform: 'uppercase',
            }}>
              Offline
            </span>
          )}
          {status === 'loading' && (
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.07em',
              padding: '2px 6px', borderRadius: 4,
              background: 'rgba(156,163,175,0.12)', color: 'rgba(156,163,175,0.7)',
              textTransform: 'uppercase',
            }}>
              •••
            </span>
          )}

          {editing && (
            <>
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="w-5 h-5 flex items-center justify-center rounded transition-colors"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)'; }}
                >
                  <X size={11} />
                </button>
              )}
              <GripHorizontal size={12} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
            </>
          )}
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 14px' }} />

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col" style={{ padding: '12px 14px 14px' }}>
        {children}
      </div>
    </div>
  );
}
