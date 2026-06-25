import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { ArrowDown, ArrowUp, Timer, Wifi } from 'lucide-react';
import { GraphDisplay, pushHistory, getHistory } from '../displays/GraphDisplay';

export function SpeedtestWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  const dlKey = `speedtest-${widget.integrationId}-dl`;
  const ulKey = `speedtest-${widget.integrationId}-ul`;

  useEffect(() => {
    if (!widget.integrationId) return;
    api.speedtest.latest(widget.integrationId).then((d) => {
      setData(d);
      const result = d?.data?.attributes ?? d;
      if (result?.download) pushHistory(dlKey, parseFloat(result.download));
      if (result?.upload) pushHistory(ulKey, parseFloat(result.upload));
    }).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-accent-red text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const r = data?.data?.attributes ?? data;
  const dl = r?.download ? parseFloat(r.download).toFixed(1) : '–';
  const ul = r?.upload ? parseFloat(r.upload).toFixed(1) : '–';
  const ping = r?.ping ? parseFloat(r.ping).toFixed(0) : '–';

  if (widget.displayType === 'graph') {
    return (
      <div className="h-full flex flex-col gap-2">
        <GraphDisplay history={getHistory(dlKey)} label="Download Mbps" color="blue" />
        <GraphDisplay history={getHistory(ulKey)} label="Upload Mbps" color="green" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-surface-card/50 p-3 text-center">
          <ArrowDown size={16} className="mx-auto mb-1 text-accent-blue" />
          <div className="text-2xl font-bold text-accent-blue">{dl}</div>
          <div className="text-tx-muted text-xs mt-0.5">Mbps ↓</div>
        </div>
        <div className="rounded-xl bg-surface-card/50 p-3 text-center">
          <ArrowUp size={16} className="mx-auto mb-1 text-accent-green" />
          <div className="text-2xl font-bold text-accent-green">{ul}</div>
          <div className="text-tx-muted text-xs mt-0.5">Mbps ↑</div>
        </div>
        <div className="rounded-xl bg-surface-card/50 p-3 text-center">
          <Timer size={16} className="mx-auto mb-1 text-accent-yellow" />
          <div className="text-2xl font-bold text-accent-yellow">{ping}</div>
          <div className="text-tx-muted text-xs mt-0.5">ms ping</div>
        </div>
      </div>
      {r?.server_name && (
        <div className="flex items-center gap-1.5 text-xs text-tx-muted">
          <Wifi size={12} /> {r.server_name}
        </div>
      )}
    </div>
  );
}
