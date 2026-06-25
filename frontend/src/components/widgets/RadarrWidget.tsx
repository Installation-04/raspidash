import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { ServiceStatRow } from '../ServiceStatRow';

export function RadarrWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!widget.integrationId) return;
    api.radarr.summary(widget.integrationId).then(setData).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-red-400 text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const dlPct = data.totalMovies ? Math.round((data.downloaded / data.totalMovies) * 100) : 0;

  return (
    <>
      <div className="flex-1 flex flex-col justify-center gap-2">
        <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span>Downloaded</span><span>{dlPct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-700 bg-green-400"
            style={{ width: `${dlPct}%` }} />
        </div>
        {data.queue?.length > 0 && (
          <div className="mt-2 space-y-1">
            {data.queue.slice(0, 3).map((q: any, i: number) => (
              <div key={i} className="text-xs text-tx truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
                ↓ {q.movie?.title ?? q.title}
              </div>
            ))}
          </div>
        )}
      </div>
      <ServiceStatRow stats={[
        { value: data.totalMovies, label: 'Movies' },
        { value: data.downloaded, label: 'Downloaded', color: '#4ade80' },
        { value: data.missing, label: 'Missing', color: data.missing > 0 ? '#f87171' : undefined },
        { value: data.queueTotal, label: 'Queue' },
      ]} />
    </>
  );
}
