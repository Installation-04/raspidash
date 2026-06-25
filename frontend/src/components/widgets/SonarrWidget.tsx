import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { ServiceStatRow } from '../ServiceStatRow';

export function SonarrWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!widget.integrationId) return;
    api.sonarr.summary(widget.integrationId).then(setData).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-red-400 text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  return (
    <>
      <div className="flex-1 overflow-auto">
        {data.queue?.length > 0 ? (
          <div className="space-y-1.5">
            <div className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Downloading</div>
            {data.queue.slice(0, 4).map((q: any, i: number) => (
              <div key={i}>
                <div className="text-xs text-tx truncate mb-0.5">{q.series?.title ?? q.title}</div>
                {q.size > 0 && (
                  <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${Math.round(((q.size - (q.sizeleft ?? 0)) / q.size) * 100)}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Queue empty
          </div>
        )}
      </div>
      <ServiceStatRow stats={[
        { value: data.totalSeries, label: 'Series' },
        { value: data.monitored, label: 'Monitored' },
        { value: data.queueTotal, label: 'Queue' },
        { value: data.upcoming?.length ?? 0, label: 'Upcoming' },
      ]} />
    </>
  );
}
