import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { ServiceStatRow } from '../ServiceStatRow';

function fmtBytes(b: number) {
  if (b > 1e12) return (b / 1e12).toFixed(1) + ' TB';
  if (b > 1e9) return (b / 1e9).toFixed(1) + ' GB';
  return (b / 1e6).toFixed(0) + ' MB';
}

export function ImmichWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!widget.integrationId) return;
    api.immich.summary(widget.integrationId).then(setData).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-red-400 text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  return (
    <>
      <div className="flex-1 flex flex-col gap-3 justify-center">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Photos', value: (data.photos ?? 0).toLocaleString() },
            { label: 'Videos', value: (data.videos ?? 0).toLocaleString() },
            { label: 'Albums', value: (data.albums ?? 0).toLocaleString() },
            { label: 'Users', value: (data.users ?? 0).toLocaleString() },
          ].map((item) => (
            <div key={item.label} className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-base font-bold" style={{ color: '#4776E6' }}>{item.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      <ServiceStatRow stats={[
        { value: (data.photos ?? 0).toLocaleString(), label: 'Photos' },
        { value: (data.videos ?? 0).toLocaleString(), label: 'Videos' },
        { value: data.usage != null ? fmtBytes(data.usage) : '–', label: 'Storage' },
        { value: data.users ?? 0, label: 'Users' },
      ]} />
    </>
  );
}
