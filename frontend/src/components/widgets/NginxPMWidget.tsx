import { useEffect, useState } from 'react';
import { api } from '../../api';
import { WidgetConfig } from '../../types';
import { SkeletonCard } from '../Skeleton';
import { Globe, Lock, ArrowRightLeft, CheckCircle } from 'lucide-react';

export function NginxPMWidget({ widget }: { widget: WidgetConfig }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!widget.integrationId) return;
    api.nginxpm.summary(widget.integrationId).then(setData).catch((e) => setErr(e.message));
  }, [widget.integrationId]);

  if (err) return <div className="text-accent-red text-sm">{err}</div>;
  if (!data) return <SkeletonCard />;

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Proxy Hosts', value: `${data.enabledHosts}/${data.totalHosts}`, icon: <Globe size={14} />, color: 'var(--color-blue)' },
          { label: 'SSL Enabled', value: data.sslHosts, icon: <Lock size={14} />, color: 'var(--color-green)' },
          { label: 'Streams', value: data.streams, icon: <ArrowRightLeft size={14} />, color: 'var(--color-yellow)' },
          { label: 'Redirects', value: data.redirects, icon: <CheckCircle size={14} />, color: 'var(--color-accent)' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-surface-card/50 p-2.5 flex items-center gap-2">
            <span style={{ color: `rgb(${s.color})` }}>{s.icon}</span>
            <div>
              <div className="text-lg font-bold text-tx">{s.value}</div>
              <div className="text-tx-muted text-xs">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      {data.proxyHosts?.length > 0 && (
        <div className="flex-1 overflow-auto space-y-1">
          <div className="text-xs text-tx-muted mb-1.5 font-medium uppercase tracking-wider">Proxy Hosts</div>
          {data.proxyHosts.slice(0, 6).map((h: any) => (
            <div key={h.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface-card/40 transition-colors">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${h.enabled ? 'bg-accent-green' : 'bg-surface-border'}`} />
              <span className="flex-1 text-sm text-tx truncate">{h.domain_names?.[0] ?? h.forward_host}</span>
              {(h.ssl?.enabled || h.certificate_id > 0) && <Lock size={11} className="text-accent-green flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
