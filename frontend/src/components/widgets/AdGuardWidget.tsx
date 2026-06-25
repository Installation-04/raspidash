import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig, DisplayType } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { Shield, ShieldOff } from 'lucide-react';
import { GaugeDisplay } from '../displays/GaugeDisplay';
import { StatDisplay } from '../displays/StatDisplay';
import { GraphDisplay, pushHistory, getHistory } from '../displays/GraphDisplay';

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

export function AdGuardWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  const displayType: DisplayType = widget.displayType ?? 'default';
  const key = `adguard-${widget.integrationId}-blocked`;

  useEffect(() => {
    if (!widget.integrationId) return;
    api.adguard.summary(widget.integrationId).then((d) => {
      setData(d);
      pushHistory(key, d.stats?.num_blocked_filtering ?? 0);
    }).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-accent-red text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const total = data.stats?.num_dns_queries ?? 0;
  const blocked = data.stats?.num_blocked_filtering ?? 0;
  const pct = total ? Math.round((blocked / total) * 100) : 0;
  const enabled = data.status?.protection_enabled;

  if (displayType === 'gauge') return <GaugeDisplay value={pct} max={100} label="Blocked %" unit="%" />;
  if (displayType === 'stat') return <StatDisplay stats={[
    { label: 'Queries', value: fmt(total), color: 'blue' },
    { label: 'Blocked', value: fmt(blocked), color: 'red' },
    { label: 'Block %', value: `${pct}%`, color: 'yellow' },
    { label: 'Clients', value: String(data.stats?.num_replaced_parental ?? 0), color: 'green' },
  ]} />;
  if (displayType === 'graph') return <GraphDisplay history={getHistory(key)} label="Blocked" color="red" />;

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {enabled
          ? <><Shield size={16} className="text-accent-green" /><span className="text-sm text-accent-green font-medium">Protection On</span></>
          : <><ShieldOff size={16} className="text-accent-red" /><span className="text-sm text-accent-red font-medium">Protection Off</span></>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total Queries', value: fmt(total), color: 'var(--color-blue)' },
          { label: 'Blocked', value: fmt(blocked), color: 'var(--color-red)' },
          { label: 'Block Rate', value: `${pct}%`, color: 'var(--color-yellow)' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-surface-card/50 p-2.5 text-center">
            <div className="text-xl font-bold" style={{ color: `rgb(${s.color})` }}>{s.value}</div>
            <div className="text-tx-muted text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col justify-end">
        <div className="flex justify-between text-xs text-tx-muted mb-1">
          <span>Block rate</span><span>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-surface-border overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `rgb(var(--color-red))` }} />
        </div>
      </div>
    </div>
  );
}
