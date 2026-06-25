import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { ServiceStatRow } from '../ServiceStatRow';

export function SABnzbdWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!widget.integrationId) return;
    api.sabnzbd.summary(widget.integrationId).then(setData).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-red-400 text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const queue: any[] = data.queue ?? [];

  return (
    <>
      <div className="flex-1 overflow-auto">
        {queue.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Queue empty
          </div>
        ) : (
          <div className="space-y-2">
            {queue.slice(0, 4).map((item: any, i: number) => (
              <div key={i} className="text-xs">
                <div className="truncate mb-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.filename}</div>
                <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full" style={{ width: `${item.percentage ?? 0}%`, background: '#F5A623' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ServiceStatRow stats={[
        { value: data.queueSize ?? 0, label: 'In Queue' },
        { value: data.speed ?? '0 B/s', label: 'Speed' },
        { value: data.sizeLeft ?? '–', label: 'Remaining' },
        { value: data.status ?? '–', label: 'Status' },
      ]} />
    </>
  );
}
