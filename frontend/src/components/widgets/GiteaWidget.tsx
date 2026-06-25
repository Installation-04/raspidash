import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { GitBranch, Bell, Star, GitFork } from 'lucide-react';

export function GiteaWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!widget.integrationId) return;
    api.gitea.summary(widget.integrationId).then(setData).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-accent-red text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  const repos: any[] = Array.isArray(data.repos) ? data.repos : [];

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex-1 rounded-xl bg-surface-card/50 p-2.5 text-center">
          <div className="text-xl font-bold text-accent-blue">{repos.length}</div>
          <div className="text-tx-muted text-xs flex items-center justify-center gap-1 mt-0.5"><GitBranch size={10} /> Repos</div>
        </div>
        <div className="flex-1 rounded-xl bg-surface-card/50 p-2.5 text-center">
          <div className="text-xl font-bold text-accent-yellow">{data.unread ?? 0}</div>
          <div className="text-tx-muted text-xs flex items-center justify-center gap-1 mt-0.5"><Bell size={10} /> Unread</div>
        </div>
        {data.user?.login && (
          <div className="flex-1 rounded-xl bg-surface-card/50 p-2.5 text-center flex flex-col items-center justify-center">
            {data.user.avatar_url
              ? <img src={data.user.avatar_url} alt="" className="w-8 h-8 rounded-full mb-1" />
              : <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold mb-1">{data.user.login[0].toUpperCase()}</div>}
            <div className="text-tx-muted text-xs">{data.user.login}</div>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto space-y-1">
        {repos.slice(0, 6).map((r: any) => (
          <div key={r.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface-card/40 transition-colors">
            <GitBranch size={12} className="text-tx-muted flex-shrink-0" />
            <span className="flex-1 text-sm text-tx truncate">{r.full_name}</span>
            <span className="text-xs text-tx-muted flex items-center gap-0.5"><Star size={10} /> {r.stars_count}</span>
            {r.forks_count > 0 && <span className="text-xs text-tx-muted flex items-center gap-0.5"><GitFork size={10} /> {r.forks_count}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
