import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Integration, DisplayType } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { GaugeDisplay } from '../displays/GaugeDisplay';
import { GraphDisplay, pushHistory, getHistory } from '../displays/GraphDisplay';
import { StatDisplay } from '../displays/StatDisplay';
import { ServiceStatRow } from '../ServiceStatRow';

interface Props { integration: Integration; displayType?: DisplayType; }

function fmtBytes(b: number) {
  const u = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let i = 0;
  while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
  return `${b.toFixed(1)} ${u[i]}`;
}

export function TrueNASSummaryWidget({ integration, displayType = 'default' }: Props) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  const key = `truenas-${integration.id}-used`;

  useEffect(() => {
    api.truenas.summary(integration.id).then((d) => {
      setData(d);
      const p = d?.pools?.[0];
      if (p) pushHistory(key, Math.round((p.allocated / p.size) * 100));
    }).catch((e) => setErr(e.message));
  }, [integration.id]);

  if (err) return <div className="text-red-400 text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const pools = data.pools ?? [];
  const totalSize = pools.reduce((s: number, p: any) => s + (p.size ?? 0), 0);
  const totalUsed = pools.reduce((s: number, p: any) => s + (p.allocated ?? 0), 0);
  const usedPct = totalSize ? Math.round((totalUsed / totalSize) * 100) : 0;
  const healthy = pools.filter((p: any) => p.healthy).length;

  if (displayType === 'gauge') return <GaugeDisplay value={usedPct} max={100} label="Used" unit="%" />;
  if (displayType === 'graph') return <GraphDisplay history={getHistory(key)} label="Used %" color="blue" />;
  if (displayType === 'stat') return <StatDisplay stats={[
    { label: 'Used', value: `${usedPct}%`, color: 'blue' },
    { label: 'Free', value: fmtBytes(totalSize - totalUsed), color: 'green' },
    { label: 'Pools', value: `${healthy}/${pools.length}`, color: 'yellow' },
  ]} />;

  return (
    <>
      <div className="flex-1 flex flex-col justify-center gap-2.5">
        <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span>Storage used</span><span>{usedPct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${usedPct}%`, background: usedPct > 85 ? 'rgb(var(--color-red))' : usedPct > 65 ? 'rgb(var(--color-yellow))' : 'rgb(var(--color-blue))' }} />
        </div>
        <div className="flex gap-2 flex-wrap mt-1">
          {pools.slice(0, 3).map((p: any) => (
            <span key={p.name} className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: p.healthy ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)', color: p.healthy ? '#4ade80' : '#f87171' }}>
              {p.name}
            </span>
          ))}
        </div>
      </div>
      <ServiceStatRow stats={[
        { value: fmtBytes(totalUsed), label: 'Used' },
        { value: fmtBytes(totalSize - totalUsed), label: 'Free' },
        { value: `${healthy}/${pools.length}`, label: 'Pools' },
      ]} />
    </>
  );
}
