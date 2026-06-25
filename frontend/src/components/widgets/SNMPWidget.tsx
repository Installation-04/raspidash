import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { ServiceStatRow } from '../ServiceStatRow';

function fmtUptime(secs: number) {
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function fmtMem(kb: number) {
  if (kb > 1024 * 1024) return (kb / 1024 / 1024).toFixed(1) + ' GB';
  return (kb / 1024).toFixed(0) + ' MB';
}

export function SNMPWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!widget.integrationId) return;
    api.snmp.summary(widget.integrationId).then(setData).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-red-400 text-sm p-2">{err}</div>;
  if (!data) return <SkeletonCard />;

  const rows = [
    data.sysName     && { label: 'Name',     value: data.sysName },
    data.sysLocation && { label: 'Location', value: data.sysLocation },
    data.sysContact  && { label: 'Contact',  value: data.sysContact },
    data.sysDescr    && { label: 'System',   value: data.sysDescr.slice(0, 60) },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <div className="flex-1 overflow-auto space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: 'rgba(255,255,255,0.35)' }}>{row.label}</span>
            <span className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{row.value}</span>
          </div>
        ))}

        {data.cpuLoad != null && (
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span>CPU</span><span>{data.cpuLoad}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${data.cpuLoad}%`, background: '#00AA88' }} />
            </div>
          </div>
        )}
      </div>

      <ServiceStatRow stats={[
        { value: data.sysUpTime != null ? fmtUptime(data.sysUpTime) : '–', label: 'Uptime' },
        { value: data.ifNumber ?? '–', label: 'Interfaces' },
        ...(data.cpuLoad != null ? [{ value: `${data.cpuLoad}%`, label: 'CPU' }] : []),
        ...(data.memTotal != null ? [{ value: fmtMem(data.memTotal), label: 'Memory' }] : []),
      ]} />
    </>
  );
}
