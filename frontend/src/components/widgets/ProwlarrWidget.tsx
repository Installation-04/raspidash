import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { ServiceStatRow } from '../ServiceStatRow';

export function ProwlarrWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!widget.integrationId) return;
    api.prowlarr.summary(widget.integrationId).then(setData).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-red-400 text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const indexers: any[] = data.indexers ?? [];
  const healthy = indexers.filter((i: any) => !i.supportsRss || i.enableRss).length;

  return (
    <>
      <div className="flex-1 overflow-auto">
        {indexers.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            No indexers
          </div>
        ) : (
          <div className="space-y-1.5">
            {indexers.slice(0, 6).map((idx: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: idx.enableRss ? '#4ade80' : '#f87171' }} />
                <span className="flex-1 truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{idx.name}</span>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>{idx.protocol}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <ServiceStatRow stats={[
        { value: indexers.length, label: 'Indexers' },
        { value: healthy, label: 'Enabled', color: '#4ade80' },
        { value: indexers.length - healthy, label: 'Disabled', color: indexers.length - healthy > 0 ? '#f87171' : undefined },
        { value: data.grabbedToday ?? 0, label: 'Grabs Today' },
      ]} />
    </>
  );
}
