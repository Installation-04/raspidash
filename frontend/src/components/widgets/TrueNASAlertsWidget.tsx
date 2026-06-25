import { useState, useEffect } from 'react';
import { api } from '../../api';
import { Integration } from '../../types';
import { Skeleton } from '../Skeleton';
import { AlertTriangle, Info, AlertOctagon, CheckCircle } from 'lucide-react';

interface Props { integration: Integration }

export function TrueNASAlertsWidget({ integration }: Props) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const d = await api.truenas.summary(integration.id);
      setAlerts(Array.isArray(d.alerts) ? d.alerts.filter((a: any) => !a.dismissed) : []);
      setError('');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const t = setInterval(load, 60_000); return () => clearInterval(t); }, [integration.id]);

  if (loading) return <Skeleton lines={3} />;
  if (error)   return <div className="text-xs text-center p-2" style={{ color: 'rgb(var(--color-red))' }}>{error}</div>;

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <CheckCircle size={28} style={{ color: 'rgb(var(--color-green))' }} />
        <div className="text-sm font-medium" style={{ color: 'rgb(var(--color-green))' }}>All clear</div>
        <div className="text-xs" style={{ color: 'rgb(var(--color-text-muted))' }}>No active alerts</div>
      </div>
    );
  }

  const LEVEL: Record<string, { icon: React.ReactNode; color: string }> = {
    WARNING:  { icon: <AlertTriangle size={13} />,  color: 'rgb(var(--color-yellow))' },
    CRITICAL: { icon: <AlertOctagon size={13} />,   color: 'rgb(var(--color-red))' },
    INFO:     { icon: <Info size={13} />,            color: 'rgb(var(--color-blue))' },
  };

  return (
    <div className="flex flex-col gap-2 overflow-auto h-full">
      {alerts.map((alert, i) => {
        const lvl = LEVEL[alert.level] ?? LEVEL.INFO;
        return (
          <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl text-xs"
            style={{ background: `${lvl.color.replace(')', ' / 0.08)')}`, border: `1px solid ${lvl.color.replace(')', ' / 0.2)')}` }}>
            <span className="shrink-0 mt-0.5" style={{ color: lvl.color }}>{lvl.icon}</span>
            <span style={{ color: 'rgb(var(--color-text))' }}>{alert.formatted || alert.text || JSON.stringify(alert)}</span>
          </div>
        );
      })}
    </div>
  );
}
