import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { ServiceStatRow } from '../ServiceStatRow';

export function OverseerrWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!widget.integrationId) return;
    api.overseerr.summary(widget.integrationId).then(setData).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-red-400 text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const requests: any[] = data.recentRequests ?? [];

  return (
    <>
      <div className="flex-1 overflow-auto">
        {requests.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            No recent requests
          </div>
        ) : (
          <div className="space-y-1.5">
            {requests.slice(0, 5).map((r: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: r.status === 2 ? '#4ade80' : r.status === 1 ? '#fbbf24' : '#60a5fa' }} />
                <span className="flex-1 truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {r.media?.title ?? r.media?.originalTitle ?? '—'}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {r.type === 'movie' ? 'Movie' : 'TV'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <ServiceStatRow stats={[
        { value: data.pending ?? 0, label: 'Pending', color: data.pending > 0 ? '#fbbf24' : undefined },
        { value: data.approved ?? 0, label: 'Approved', color: '#4ade80' },
        { value: data.available ?? 0, label: 'Available' },
        { value: data.total ?? 0, label: 'Total' },
      ]} />
    </>
  );
}
