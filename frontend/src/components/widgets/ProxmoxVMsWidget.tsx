import { useState, useEffect } from 'react';
import { api } from '../../api';
import { Integration, ProxmoxNode } from '../../types';
import { Skeleton } from '../Skeleton';

interface Props { integration: Integration }

function fmtUptime(s: number) {
  if (!s) return '—';
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600);
  return d > 0 ? `${d}d ${h}h` : `${h}h ${Math.floor((s % 3600) / 60)}m`;
}

export function ProxmoxVMsWidget({ integration }: Props) {
  const [nodes, setNodes] = useState<ProxmoxNode[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const d = await api.proxmox.summary(integration.id);
      setNodes(d.nodes || []);
      setError('');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const t = setInterval(load, 30_000); return () => clearInterval(t); }, [integration.id]);

  if (loading) return <Skeleton lines={6} height="h-4" />;
  if (error)   return <div className="text-xs p-2 text-center" style={{ color: 'rgb(var(--color-red))' }}>{error}</div>;

  const allVMs = nodes.flatMap(n => n.vms.map(v => ({ ...v, nodeName: n.node })));
  const running = allVMs.filter(v => v.status === 'running').length;

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Summary row */}
      <div className="flex items-center gap-3 mb-2 pb-2 text-xs"
        style={{ borderBottom: '1px solid rgb(var(--color-bg-border) / 0.4)', color: 'rgb(var(--color-text-muted))' }}>
        <span className="font-medium" style={{ color: 'rgb(var(--color-text))' }}>{allVMs.length} machines</span>
        <span style={{ color: 'rgb(var(--color-green))' }}>▲ {running} running</span>
        <span style={{ color: 'rgb(var(--color-text-muted))' }}>■ {allVMs.length - running} stopped</span>
      </div>

      <table className="w-full text-xs">
        <thead className="sticky top-0"
          style={{ background: 'rgb(var(--color-bg-card))' }}>
          <tr style={{ color: 'rgb(var(--color-text-muted))', borderBottom: '1px solid rgb(var(--color-bg-border) / 0.5)' }}>
            <th className="text-left py-1.5 px-2 font-medium">Name</th>
            <th className="text-left py-1.5 px-2 font-medium">Type</th>
            <th className="text-left py-1.5 px-2 font-medium">Node</th>
            <th className="text-left py-1.5 px-2 font-medium">Status</th>
            <th className="text-right py-1.5 px-2 font-medium">Uptime</th>
          </tr>
        </thead>
        <tbody>
          {allVMs.map((vm) => (
            <tr key={`${vm.type}-${vm.vmid}`}
              className="transition-colors"
              style={{ borderBottom: '1px solid rgb(var(--color-bg-border) / 0.3)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgb(var(--color-bg-border) / 0.15)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
              <td className="py-1.5 px-2 font-medium" style={{ color: 'rgb(var(--color-text))' }}>
                {vm.name || `VM ${vm.vmid}`}
              </td>
              <td className="py-1.5 px-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={vm.type === 'qemu'
                    ? { background: 'rgb(var(--color-blue) / 0.15)', color: 'rgb(var(--color-blue))' }
                    : { background: 'rgb(var(--color-yellow) / 0.15)', color: 'rgb(var(--color-yellow))' }}>
                  {vm.type === 'qemu' ? 'VM' : 'CT'}
                </span>
              </td>
              <td className="py-1.5 px-2" style={{ color: 'rgb(var(--color-text-muted))' }}>{vm.nodeName}</td>
              <td className="py-1.5 px-2">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${vm.status === 'running' ? 'pulse-dot' : ''}`}
                    style={{ background: vm.status === 'running' ? 'rgb(var(--color-green))' : 'rgb(var(--color-text-muted))' }} />
                  <span style={{ color: vm.status === 'running' ? 'rgb(var(--color-green))' : 'rgb(var(--color-text-muted))' }}>
                    {vm.status}
                  </span>
                </div>
              </td>
              <td className="py-1.5 px-2 text-right font-mono" style={{ color: 'rgb(var(--color-text-muted))' }}>
                {fmtUptime(vm.uptime)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
