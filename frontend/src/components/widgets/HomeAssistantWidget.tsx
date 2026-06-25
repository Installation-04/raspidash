import { useState, useEffect } from 'react';
import { api } from '../../api';
import { Integration } from '../../types';
import { Home, Lightbulb, Thermometer, Wind, Lock, Tv } from 'lucide-react';

interface Props { integration: Integration }

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  light:         <Lightbulb size={13} />,
  climate:       <Thermometer size={13} />,
  fan:           <Wind size={13} />,
  lock:          <Lock size={13} />,
  media_player:  <Tv size={13} />,
};

const STATE_COLOR: Record<string, string> = {
  on:      'text-accent-yellow',
  off:     'text-gray-500',
  home:    'text-accent-green',
  away:    'text-gray-500',
  heat:    'text-accent-red',
  cool:    'text-accent-blue',
  locked:  'text-accent-green',
  unlocked:'text-accent-red',
  playing: 'text-accent-blue',
  paused:  'text-gray-400',
  idle:    'text-gray-500',
};

export function HomeAssistantWidget({ integration }: Props) {
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const d = await api.ha.summary(integration.id);
      setSummary(d);
      setError('');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const t = setInterval(load, 30_000); return () => clearInterval(t); }, [integration.id]);

  if (loading) return <Loader />;
  if (error) return <Err msg={error} />;
  if (!summary) return null;

  const topDomains = Object.entries(summary.domains as Record<string, number>)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-3 h-full overflow-auto">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Home size={14} className="text-accent-blue" />
        <span>{summary.locationName || integration.name}</span>
        <span className="ml-auto text-gray-600">v{summary.version}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{summary.totalEntities}</div>
          <div className="text-xs text-gray-500">Total Entities</div>
        </div>
        <div className="bg-surface/50 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold ${summary.alerts > 0 ? 'text-accent-red' : 'text-accent-green'}`}>
            {summary.alerts}
          </div>
          <div className="text-xs text-gray-500">Active Alerts</div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Domains</div>
        {topDomains.map(([domain, count]) => (
          <div key={domain} className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 w-4">{DOMAIN_ICONS[domain] || <span className="w-3 h-3 rounded-full bg-surface-border block" />}</span>
            <span className="text-gray-300 flex-1 capitalize">{domain.replace(/_/g, ' ')}</span>
            <span className="text-gray-500 text-xs">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeAssistantEntitiesWidget({ integration }: Props) {
  const [entities, setEntities] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const domain = (integration as any).options?.domain as string | undefined;

  const load = async () => {
    try {
      const d = await api.ha.entities(integration.id, domain);
      setEntities(d);
      setError('');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const t = setInterval(load, 15_000); return () => clearInterval(t); }, [integration.id]);

  if (loading) return <Loader />;
  if (error) return <Err msg={error} />;

  return (
    <div className="flex flex-col h-full overflow-auto">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-surface-card">
          <tr className="text-gray-500 border-b border-surface-border">
            <th className="text-left py-1.5 px-2">Entity</th>
            <th className="text-right py-1.5 px-2">State</th>
          </tr>
        </thead>
        <tbody>
          {entities.map((e) => (
            <tr key={e.entity_id} className="border-b border-surface-border/40 hover:bg-surface/50">
              <td className="py-1.5 px-2 text-gray-300 truncate max-w-[150px]">
                {e.attributes?.friendly_name || e.entity_id}
              </td>
              <td className={`py-1.5 px-2 text-right font-medium ${STATE_COLOR[e.state] || 'text-gray-300'}`}>
                {e.state}{e.attributes?.unit_of_measurement ? ` ${e.attributes.unit_of_measurement}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Loader() { return <div className="flex items-center justify-center h-full text-gray-500 text-sm">Loading…</div>; }
function Err({ msg }: { msg: string }) { return <div className="flex items-center justify-center h-full text-accent-red text-sm p-4 text-center">{msg}</div>; }
