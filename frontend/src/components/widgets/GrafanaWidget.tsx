import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { ServiceStatRow } from '../ServiceStatRow';

export function GrafanaWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!widget.integrationId) return;
    api.grafana.summary(widget.integrationId).then(setData).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-red-400 text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const alerts: any[] = data.alerts ?? [];
  const firing = alerts.filter((a: any) => a.state === 'alerting').length;

  return (
    <>
      <div className="flex-1 overflow-auto">
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            No alerts
          </div>
        ) : (
          <div className="space-y-1.5">
            {alerts.slice(0, 5).map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: a.state === 'alerting' ? '#f87171' : a.state === 'pending' ? '#fbbf24' : '#4ade80' }} />
                <span className="flex-1 truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{a.name}</span>
                <span style={{ color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}>{a.state}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <ServiceStatRow stats={[
        { value: data.dashboards ?? 0, label: 'Dashboards' },
        { value: data.datasources ?? 0, label: 'Sources' },
        { value: firing, label: 'Firing', color: firing > 0 ? '#f87171' : undefined },
        { value: alerts.length, label: 'Total alerts' },
      ]} />
    </>
  );
}
