import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { Wifi, Cable, Monitor, CheckCircle } from 'lucide-react';

export function UnifiWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!widget.integrationId) return;
    api.unifi.summary(widget.integrationId).then(setData).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-accent-red text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const wiredPct = data.clients ? Math.round((data.wired / data.clients) * 100) : 0;
  const wirelessPct = data.clients ? Math.round((data.wireless / data.clients) * 100) : 0;

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Clients', value: data.clients, icon: <Monitor size={14} />, color: 'var(--color-blue)' },
          { label: 'Wireless', value: data.wireless, icon: <Wifi size={14} />, color: 'var(--color-accent)' },
          { label: 'Wired', value: data.wired, icon: <Cable size={14} />, color: 'var(--color-green)' },
          { label: 'Devices', value: `${data.devicesOnline}/${data.devices}`, icon: <CheckCircle size={14} />, color: 'var(--color-yellow)' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-surface-card/50 p-2.5 flex items-center gap-2">
            <span style={{ color: `rgb(${s.color})` }}>{s.icon}</span>
            <div>
              <div className="text-lg font-bold text-tx">{s.value}</div>
              <div className="text-tx-muted text-xs">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-tx-muted mb-1"><span>Wireless</span><span>{wirelessPct}%</span></div>
          <div className="h-1.5 rounded-full bg-surface-border overflow-hidden">
            <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${wirelessPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-tx-muted mb-1"><span>Wired</span><span>{wiredPct}%</span></div>
          <div className="h-1.5 rounded-full bg-surface-border overflow-hidden">
            <div className="h-full rounded-full bg-accent-green transition-all duration-700" style={{ width: `${wiredPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
