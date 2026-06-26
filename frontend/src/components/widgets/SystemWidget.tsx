import { useEffect, useState } from 'react';
import { api } from '../../api';
import { SkeletonCard } from '../Skeleton';
import { ServiceStatRow } from '../ServiceStatRow';

/* ─── helpers ─────────────────────────────────────────────── */

function fmtUptime(secs: number) {
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function fmtBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(1) + ' GB';
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(0) + ' MB';
  return (bytes / 1024).toFixed(0) + ' KB';
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-bg-border) / 0.3)' }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(pct, 100)}%`, background: color }}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-2 text-xs py-0.5">
      <span style={{ color: 'rgb(var(--color-text-muted))' }}>{label}</span>
      <span className="font-mono truncate" style={{ color: 'rgb(var(--color-text))' }}>{value}</span>
    </div>
  );
}

/* ─── System Stats Widget ─────────────────────────────────── */

export function SystemStatsWidget() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  const load = () =>
    api.system.summary().then(setData).catch((e) => setErr(e.message));

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  if (err) return <div className="text-red-400 text-sm p-2">{err}</div>;
  if (!data) return <SkeletonCard />;

  const ramPct = Math.round((data.usedMem / data.totalMem) * 100);
  const diskPct = data.disk
    ? Math.round((data.disk.used / data.disk.total) * 100)
    : null;

  const cpuColor = data.cpuUsage > 80 ? '#f87171' : data.cpuUsage > 50 ? '#fbbf24' : '#00AA88';
  const ramColor = ramPct > 80 ? '#f87171' : ramPct > 60 ? '#fbbf24' : '#3b82f6';
  const diskColor = diskPct != null && diskPct > 85 ? '#f87171' : '#a855f7';

  return (
    <>
      <div className="flex-1 overflow-auto space-y-3">
        {/* Host info */}
        <Row label="Hostname" value={data.hostname} />
        <Row label="Platform" value={`${data.platform} / ${data.arch}`} />
        <Row label="CPU" value={`${data.cpuModel.split('@')[0].trim()} (${data.cpuCores}c)`} />
        {data.temp != null && <Row label="Temp" value={`${data.temp}°C`} />}
        <Row label="Uptime" value={fmtUptime(data.uptimeSecs)} />
        <Row label="Load avg" value={data.loadAvg.map((v: number) => v.toFixed(2)).join(' / ')} />

        {/* CPU */}
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: 'rgb(var(--color-text-muted))' }}>
            <span>CPU</span><span>{data.cpuUsage}%</span>
          </div>
          <Bar pct={data.cpuUsage} color={cpuColor} />
        </div>

        {/* RAM */}
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: 'rgb(var(--color-text-muted))' }}>
            <span>RAM</span>
            <span>{fmtBytes(data.usedMem)} / {fmtBytes(data.totalMem)} ({ramPct}%)</span>
          </div>
          <Bar pct={ramPct} color={ramColor} />
        </div>

        {/* Disk */}
        {data.disk && (
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: 'rgb(var(--color-text-muted))' }}>
              <span>Disk (/)</span>
              <span>{fmtBytes(data.disk.used)} / {fmtBytes(data.disk.total)} ({diskPct}%)</span>
            </div>
            <Bar pct={diskPct!} color={diskColor} />
          </div>
        )}
      </div>

      <ServiceStatRow stats={[
        { value: `${data.cpuUsage}%`,     label: 'CPU' },
        { value: `${ramPct}%`,            label: 'RAM' },
        ...(diskPct != null ? [{ value: `${diskPct}%`, label: 'Disk' }] : []),
        ...(data.temp != null ? [{ value: `${data.temp}°C`, label: 'Temp' }] : []),
      ]} />
    </>
  );
}

/* ─── System Network Widget ───────────────────────────────── */

interface NetIface {
  name: string;
  family: string;
  address: string;
  mac: string;
}

export function SystemNetworkWidget() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.system.summary().then(setData).catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="text-red-400 text-sm p-2">{err}</div>;
  if (!data) return <SkeletonCard />;

  const ifaces: NetIface[] = data.interfaces ?? [];

  // Group by interface name
  const grouped = ifaces.reduce<Record<string, NetIface[]>>((acc, iface) => {
    (acc[iface.name] = acc[iface.name] ?? []).push(iface);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-auto space-y-3">
      {Object.entries(grouped).map(([name, addrs]) => (
        <div key={name}>
          <div
            className="text-[10px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: 'rgb(var(--color-text-muted))' }}
          >
            {name}
          </div>
          {addrs.map((a) => (
            <div key={a.family + a.address} className="flex justify-between text-xs py-0.5">
              <span style={{ color: 'rgb(var(--color-text-muted))' }}>{a.family}</span>
              <span className="font-mono" style={{ color: 'rgb(var(--color-text))' }}>{a.address}</span>
            </div>
          ))}
          <div className="flex justify-between text-xs py-0.5">
            <span style={{ color: 'rgb(var(--color-text-muted))' }}>MAC</span>
            <span className="font-mono text-[10px]" style={{ color: 'rgb(var(--color-text-muted))' }}>
              {addrs[0]?.mac}
            </span>
          </div>
        </div>
      ))}
      {ifaces.length === 0 && (
        <div className="text-xs text-center" style={{ color: 'rgb(var(--color-text-muted))' }}>
          No external interfaces found
        </div>
      )}
    </div>
  );
}
