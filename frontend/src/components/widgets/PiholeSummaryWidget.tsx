import { useState, useEffect } from 'react';
import { api } from '../../api';
import { Integration, DisplayType } from '../../types';
import { GaugeDisplay } from '../displays/GaugeDisplay';
import { GraphDisplay, pushHistory, getHistory } from '../displays/GraphDisplay';
import { StatDisplay } from '../displays/StatDisplay';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield } from 'lucide-react';

interface Props {
  integration: Integration;
  displayType?: DisplayType;
}

export function PiholeSummaryWidget({ integration, displayType = 'default' }: Props) {
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState(() => getHistory(`pihole-${integration.id}`));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const d = await api.pihole.summary(integration.id);
      setData(d);
      setError('');
      const queries = Number(d.dns_queries_today) || 0;
      const blocked = Number(d.ads_blocked_today) || 0;
      const pct = queries > 0 ? (blocked / queries) * 100 : 0;
      const h = pushHistory(`pihole-${integration.id}`, pct);
      setHistory([...h]);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const t = setInterval(load, 30_000); return () => clearInterval(t); }, [integration.id]);

  if (loading) return <Loader />;
  if (error)   return <Err msg={error} />;
  if (!data)   return null;

  const blocked = Number(data.ads_blocked_today) || 0;
  const queries = Number(data.dns_queries_today) || 0;
  const pct     = queries > 0 ? (blocked / queries) * 100 : 0;
  const allowed = queries - blocked;
  const statusOk = data.status === 'enabled';

  /* ── GAUGE ── */
  if (displayType === 'gauge') {
    return (
      <div className="flex flex-col gap-2 h-full">
        <Header name={integration.name} ok={statusOk} />
        <div className="flex-1">
          <GaugeDisplay value={pct} max={100} label="Blocked %" unit="pct"
            color="rgb(var(--color-red))" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Chip label="Queries" value={queries.toLocaleString()} />
          <Chip label="Blocked" value={blocked.toLocaleString()} color="text-accent-red" />
        </div>
      </div>
    );
  }

  /* ── GRAPH ── */
  if (displayType === 'graph') {
    return (
      <div className="flex flex-col gap-2 h-full">
        <Header name={integration.name} ok={statusOk} />
        <div className="flex-1 min-h-0">
          <GraphDisplay history={history} label="Block %" unit="pct" max={100}
            color="rgb(var(--color-red))" />
        </div>
      </div>
    );
  }

  /* ── STAT ── */
  if (displayType === 'stat') {
    return (
      <div className="flex flex-col gap-2 h-full">
        <Header name={integration.name} ok={statusOk} />
        <StatDisplay stats={[
          { label: 'Queries Today', value: queries.toLocaleString() },
          { label: 'Blocked',       value: blocked.toLocaleString(), color: 'text-accent-red' },
          { label: 'Block Rate',    value: `${pct.toFixed(1)}%`,     color: 'text-accent-yellow' },
          { label: 'Clients',       value: data.clients_ever_seen ?? '—' },
        ]} />
      </div>
    );
  }

  /* ── DEFAULT (donut chart) ── */
  const pieData = [{ name: 'Blocked', value: blocked }, { name: 'Allowed', value: allowed }];
  return (
    <div className="flex flex-col gap-3 h-full">
      <Header name={integration.name} ok={statusOk} />
      <div className="grid grid-cols-3 gap-2">
        <Chip label="Queries" value={queries.toLocaleString()} />
        <Chip label="Blocked" value={blocked.toLocaleString()} color="text-accent-red" />
        <Chip label="%" value={`${pct.toFixed(1)}%`} color="text-accent-yellow" />
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" paddingAngle={2} dataKey="value">
              <Cell fill="rgb(var(--color-red))" />
              <Cell fill="rgb(var(--color-blue))" />
            </Pie>
            <Tooltip
              contentStyle={{ background: 'rgb(var(--color-bg-card))', border: '1px solid rgb(var(--color-bg-border))', borderRadius: 8, fontSize: 12 }}
              formatter={(v: any) => [Number(v).toLocaleString(), '']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-tx-muted"><span className="w-2 h-2 rounded-full bg-accent-red shrink-0" />Blocked: {blocked.toLocaleString()}</div>
        <div className="flex items-center gap-1.5 text-tx-muted"><span className="w-2 h-2 rounded-full bg-accent-blue shrink-0" />Allowed: {allowed.toLocaleString()}</div>
      </div>
    </div>
  );
}

function Header({ name, ok }: { name: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs text-tx-muted">
      <Shield size={14} className="text-accent-blue" />
      <span>{name}</span>
      <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${ok ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-red/20 text-accent-red'}`}>
        {ok ? 'enabled' : 'disabled'}
      </span>
    </div>
  );
}

function Chip({ label, value, color = 'text-tx' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-surface/50 rounded-lg p-2 text-center">
      <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
      <div className="text-xs text-tx-muted">{label}</div>
    </div>
  );
}

function Loader() { return <div className="flex items-center justify-center h-full text-tx-muted text-sm">Loading…</div>; }
function Err({ msg }: { msg: string }) { return <div className="flex items-center justify-center h-full text-accent-red text-sm p-4 text-center">{msg}</div>; }
