import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Integration } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { ServiceStatRow } from '../ServiceStatRow';

export function JellyfinWidget({ integration }: { integration: Integration }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.jellyfin.summary(integration.id).then(setData).catch((e) => setErr(e.message));
  }, [integration.id]);

  if (err) return <div className="text-red-400 text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const sessions: any[] = data.sessions ?? [];
  const libraries: any[] = data.libraries ?? [];

  return (
    <>
      <div className="flex-1 overflow-auto">
        {sessions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            No active streams
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 3).map((s: any, i: number) => (
              <div key={i} className="text-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  <span className="font-medium text-tx truncate">{s.NowPlayingItem?.Name ?? '—'}</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)' }}>{s.UserName} · {s.Client}</div>
                {s.PlayState?.PositionTicks != null && s.NowPlayingItem?.RunTimeTicks && (
                  <div className="mt-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{
                      width: `${Math.round((s.PlayState.PositionTicks / s.NowPlayingItem.RunTimeTicks) * 100)}%`,
                      background: '#9B59B6',
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <ServiceStatRow stats={[
        { value: sessions.length, label: 'Streams' },
        ...libraries.slice(0, 3).map((l: any) => ({ value: l.count ?? '–', label: l.type })),
      ]} />
    </>
  );
}
