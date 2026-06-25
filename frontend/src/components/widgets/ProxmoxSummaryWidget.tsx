import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Integration, DisplayType } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { GaugeDisplay } from '../displays/GaugeDisplay';
import { GraphDisplay, pushHistory, getHistory } from '../displays/GraphDisplay';
import { StatDisplay } from '../displays/StatDisplay';
import { ServiceStatRow } from '../ServiceStatRow';

interface Props { integration: Integration; displayType?: DisplayType; }

function fmtUptime(s: number) {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600);
  return d > 0 ? `${d}d ${h}h` : `${h}h`;
}

export function ProxmoxSummaryWidget({ integration, displayType = 'default' }: Props) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  const cpuKey = `proxmox-${integration.id}-cpu`;

  useEffect(() => {
    api.proxmox.summary(integration.id).then((d) => {
      setData(d);
      if (d?.nodes?.[0]) pushHistory(cpuKey, Math.round(d.nodes[0].cpu * 100));
    }).catch((e) => setErr(e.message));
  }, [integration.id]);

  if (err) return <div className="text-red-400 text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const node = data.nodes?.[0];
  if (!node) return <div className="text-tx-muted text-sm">No nodes found</div>;

  const cpu = Math.round(node.cpu * 100);
  const mem = Math.round((node.mem / node.maxmem) * 100);
  const vmCount = node.vms?.length ?? 0;
  const running = node.vms?.filter((v: any) => v.status === 'running').length ?? 0;

  if (displayType === 'gauge') return <GaugeDisplay value={cpu} max={100} label="CPU" unit="%" />;
  if (displayType === 'graph') return <GraphDisplay history={getHistory(cpuKey)} label="CPU %" color="blue" />;
  if (displayType === 'stat') return <StatDisplay stats={[
    { label: 'CPU', value: `${cpu}%`, color: 'blue' },
    { label: 'RAM', value: `${mem}%`, color: 'green' },
    { label: 'VMs', value: `${running}/${vmCount}`, color: 'yellow' },
    { label: 'Uptime', value: fmtUptime(node.uptime), color: 'accent' },
  ]} />;

  return (
    <>
      <div className="flex-1 flex flex-col justify-center gap-2.5">
        {[
          { label: 'CPU', pct: cpu, color: cpu > 85 ? 'rgb(var(--color-red))' : cpu > 65 ? 'rgb(var(--color-yellow))' : 'rgb(var(--color-blue))' },
          { label: 'Memory', pct: mem, color: mem > 85 ? 'rgb(var(--color-red))' : mem > 65 ? 'rgb(var(--color-yellow))' : 'rgb(var(--color-green))' },
        ].map((b) => (
          <div key={b.label}>
            <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span>{b.label}</span><span>{b.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${b.pct}%`, background: b.color }} />
            </div>
          </div>
        ))}
      </div>
      <ServiceStatRow stats={[
        { value: `${running}/${vmCount}`, label: 'VMs' },
        { value: `${cpu}%`, label: 'CPU' },
        { value: `${mem}%`, label: 'MEM' },
        { value: fmtUptime(node.uptime), label: 'Uptime' },
      ]} />
    </>
  );
}
