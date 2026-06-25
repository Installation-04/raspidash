import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Integration } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { ServiceStatRow } from '../ServiceStatRow';

export function PortainerWidget({ integration }: { integration: Integration }) {
  const [data, setData] = useState<any[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.portainer.summary(integration.id).then(setData).catch((e) => setErr(e.message));
  }, [integration.id]);

  if (err) return <div className="text-red-400 text-sm">{err}</div>;
  if (!data.length && !err) return <SkeletonCard />;

  const allContainers = data.flatMap((ep: any) => ep.containers ?? []);
  const running = allContainers.filter((c: any) => c.State === 'running').length;
  const stopped = allContainers.filter((c: any) => c.State !== 'running').length;

  return (
    <>
      <div className="flex-1 overflow-auto">
        {data.slice(0, 3).map((ep: any) => {
          const epRunning = (ep.containers ?? []).filter((c: any) => c.State === 'running').length;
          const epTotal = (ep.containers ?? []).length;
          return (
            <div key={ep.Id ?? ep.name} className="mb-2">
              <div className="text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {ep.Name ?? ep.name}
              </div>
              <div className="space-y-1">
                {(ep.containers ?? []).slice(0, 4).map((c: any) => (
                  <div key={c.Id} className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: c.State === 'running' ? '#4ade80' : '#f87171' }} />
                    <span className="flex-1 truncate text-tx">{c.Names?.[0]?.replace('/', '') ?? c.Name}</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>{c.State}</span>
                  </div>
                ))}
                {epTotal > 4 && (
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    +{epTotal - 4} more · {epRunning}/{epTotal} running
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <ServiceStatRow stats={[
        { value: running, label: 'Running', color: '#4ade80' },
        { value: stopped, label: 'Stopped', color: stopped > 0 ? '#f87171' : undefined },
        { value: allContainers.length, label: 'Total' },
      ]} />
    </>
  );
}
