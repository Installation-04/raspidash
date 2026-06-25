import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { CheckCircle, XCircle, Clock, Activity } from 'lucide-react';

interface Monitor { name: string; status: number; uptime: number; ping: number | null; }

export function UptimeKumaWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<{ monitors: Monitor[]; up: number; down: number } | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!widget.integrationId) return;
    api.uptimekuma.summary(widget.integrationId).then(setData).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-accent-red text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const total = data.monitors.length;
  const upPct = total ? Math.round((data.up / total) * 100) : 0;

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl bg-surface-card/50 p-3 text-center">
          <div className="text-2xl font-bold text-accent-green">{data.up}</div>
          <div className="text-tx-muted text-xs mt-1 flex items-center justify-center gap-1"><CheckCircle size={11} /> Online</div>
        </div>
        <div className="flex-1 rounded-xl bg-surface-card/50 p-3 text-center">
          <div className="text-2xl font-bold text-accent-red">{data.down}</div>
          <div className="text-tx-muted text-xs mt-1 flex items-center justify-center gap-1"><XCircle size={11} /> Down</div>
        </div>
        <div className="flex-1 rounded-xl bg-surface-card/50 p-3 text-center">
          <div className="text-2xl font-bold text-accent">{upPct}%</div>
          <div className="text-tx-muted text-xs mt-1 flex items-center justify-center gap-1"><Activity size={11} /> Overall</div>
        </div>
      </div>
      <div className="flex-1 overflow-auto space-y-1">
        {data.monitors.map((m, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface-card/40 transition-colors">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.status === 1 ? 'bg-accent-green' : 'bg-accent-red'}`} />
            <span className="flex-1 text-sm text-tx truncate">{m.name}</span>
            {m.ping != null && (
              <span className="text-xs text-tx-muted flex items-center gap-0.5">
                <Clock size={10} /> {m.ping}ms
              </span>
            )}
            <span className="text-xs text-tx-muted">{m.uptime.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
