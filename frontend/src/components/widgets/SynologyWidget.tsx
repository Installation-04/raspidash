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

function fmtUptime(secs: number) {
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  if (d > 0) return `${d}d ${h}h`;
  return `${h}h`;
}

export function SynologyWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!widget.integrationId) return;
    api.synology.summary(widget.integrationId).then(setData).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-red-400 text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const cpuPct = Math.round((data.cpu ?? 0) * 100);
  const memPct = data.totalMem ? Math.round((data.usedMem / data.totalMem) * 100) : 0;

  return (
    <>
      <div className="flex-1 flex flex-col gap-3 justify-center">
        {[
          { label: 'CPU', pct: cpuPct, color: '#B5B5B6' },
          { label: 'Memory', pct: memPct, color: '#B5B5B6' },
        ].map(({ label, pct, color }) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span>{label}</span><span>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
      <ServiceStatRow stats={[
        { value: `${cpuPct}%`, label: 'CPU' },
        { value: `${memPct}%`, label: 'Memory' },
        { value: data.totalMem != null ? fmtBytes(data.totalMem) : '–', label: 'RAM Total' },
        { value: data.uptime != null ? fmtUptime(data.uptime) : '–', label: 'Uptime' },
      ]} />
    </>
  );
}
