import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { ServiceStatRow } from '../ServiceStatRow';

export function BazarrWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!widget.integrationId) return;
    api.bazarr.summary(widget.integrationId).then(setData).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-red-400 text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const wanted: any[] = data.wantedEpisodes ?? [];

  return (
    <>
      <div className="flex-1 overflow-auto">
        {wanted.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            All subtitles up to date
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Missing subtitles</div>
            {wanted.slice(0, 5).map((ep: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#fbbf24' }} />
                <span className="flex-1 truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {ep.seriesTitle ?? ep.title}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>{ep.missing_subtitles?.[0]?.language ?? '?'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <ServiceStatRow stats={[
        { value: data.episodesTotal ?? 0, label: 'Episodes' },
        { value: data.moviesTotal ?? 0, label: 'Movies' },
        { value: data.wantedEpisodesCount ?? wanted.length, label: 'Missing', color: (data.wantedEpisodesCount ?? wanted.length) > 0 ? '#fbbf24' : undefined },
        { value: data.providersTotal ?? 0, label: 'Providers' },
      ]} />
    </>
  );
}
