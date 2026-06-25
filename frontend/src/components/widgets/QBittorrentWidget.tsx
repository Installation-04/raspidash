import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { ServiceStatRow } from '../ServiceStatRow';

function fmtBytes(b: number) {
  if (b > 1e9) return (b / 1e9).toFixed(1) + ' GB';
  if (b > 1e6) return (b / 1e6).toFixed(1) + ' MB';
  return (b / 1e3).toFixed(0) + ' KB';
}

function fmtSpeed(b: number) {
  if (b > 1e6) return (b / 1e6).toFixed(1) + ' MB/s';
  if (b > 1e3) return (b / 1e3).toFixed(0) + ' KB/s';
  return b + ' B/s';
}

export function QBittorrentWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!widget.integrationId) return;
    api.qbittorrent.summary(widget.integrationId).then(setData).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-red-400 text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const torrents: any[] = data.torrents ?? [];

  return (
    <>
      <div className="flex-1 overflow-auto">
        {torrents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            No active torrents
          </div>
        ) : (
          <div className="space-y-2">
            {torrents.slice(0, 4).map((t: any, i: number) => (
              <div key={i} className="text-xs">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: t.state === 'downloading' ? '#60a5fa' : t.state === 'seeding' ? '#4ade80' : 'rgba(255,255,255,0.3)' }} />
                  <span className="font-medium truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>{t.name}</span>
                </div>
                {t.progress != null && (
                  <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${t.progress * 100}%`, background: '#2F67BA' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <ServiceStatRow stats={[
        { value: data.downloading ?? 0, label: 'Down', color: '#60a5fa' },
        { value: data.seeding ?? 0, label: 'Seed', color: '#4ade80' },
        { value: data.dlSpeed != null ? fmtSpeed(data.dlSpeed) : '–', label: 'DL Speed' },
        { value: data.totalSize != null ? fmtBytes(data.totalSize) : '–', label: 'Size' },
      ]} />
    </>
  );
}
