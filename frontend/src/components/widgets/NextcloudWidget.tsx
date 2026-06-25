import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { Cloud, Users, HardDrive, Cpu } from 'lucide-react';

function fmtBytes(b: number) {
  if (!b) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (b >= 1024 && i < units.length - 1) { b /= 1024; i++; }
  return `${b.toFixed(1)} ${units[i]}`;
}

export function NextcloudWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!widget.integrationId) return;
    api.nextcloud.summary(widget.integrationId).then(setData).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-accent-red text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const nc = data.nextcloud ?? {};
  const sys = nc.system ?? {};
  const storage = nc.storage ?? {};
  const users = data.activeUsers ?? {};
  const freeBytes = parseInt(sys.freespace ?? 0);
  const cpuLoad = Array.isArray(sys.cpuload) ? (sys.cpuload[0] ?? 0).toFixed(2) : '–';

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-surface-card/50 p-2.5 flex items-center gap-2">
          <Cloud size={14} className="text-accent-blue" />
          <div>
            <div className="text-lg font-bold text-tx">{fmtBytes(freeBytes)}</div>
            <div className="text-tx-muted text-xs">Free space</div>
          </div>
        </div>
        <div className="rounded-xl bg-surface-card/50 p-2.5 flex items-center gap-2">
          <Users size={14} className="text-accent-green" />
          <div>
            <div className="text-lg font-bold text-tx">{users.last5minutes ?? storage.num_users ?? '–'}</div>
            <div className="text-tx-muted text-xs">Active users</div>
          </div>
        </div>
        <div className="rounded-xl bg-surface-card/50 p-2.5 flex items-center gap-2">
          <HardDrive size={14} className="text-accent-yellow" />
          <div>
            <div className="text-lg font-bold text-tx">{storage.num_files ?? '–'}</div>
            <div className="text-tx-muted text-xs">Files</div>
          </div>
        </div>
        <div className="rounded-xl bg-surface-card/50 p-2.5 flex items-center gap-2">
          <Cpu size={14} className="text-accent-red" />
          <div>
            <div className="text-lg font-bold text-tx">{cpuLoad}</div>
            <div className="text-tx-muted text-xs">CPU load</div>
          </div>
        </div>
      </div>
      {sys.version && <div className="text-xs text-tx-muted">Nextcloud {sys.version}</div>}
    </div>
  );
}
