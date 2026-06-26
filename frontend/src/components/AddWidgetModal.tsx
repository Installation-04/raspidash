import { useState } from 'react';
import { X } from 'lucide-react';
import { WidgetType, DisplayType, Integration } from '../types';
import { api } from '../api';

interface Props {
  integrations: Integration[];
  onAdd: (widget: any) => void;
  onClose: () => void;
}

type CatalogEntry = {
  type: WidgetType;
  label: string;
  desc: string;
  needsIntegration?: Integration['type'];
  defaultSize: { w: number; h: number };
  supportsDisplayType?: boolean;
};

const WIDGET_CATALOG: CatalogEntry[] = [
  { type: 'clock',                  label: 'Clock',                        desc: 'Live date and time',                                                      defaultSize: { w: 3, h: 2 } },
  { type: 'weather',                label: 'Weather',                      desc: 'Current conditions + 5-day forecast (Open-Meteo, no API key needed)',       defaultSize: { w: 3, h: 4 } },
  { type: 'notes',                  label: 'Notes',                        desc: 'Sticky note — write anything, auto-saved',                                  defaultSize: { w: 3, h: 3 } },
  { type: 'welcome',                label: 'Welcome',                      desc: 'Getting started card',                                                     defaultSize: { w: 4, h: 3 } },
  { type: 'system-stats',           label: 'System — Stats',               desc: 'CPU, RAM, disk, temp and uptime of the host running Raspidash',            defaultSize: { w: 4, h: 5 } },
  { type: 'system-network',         label: 'System — Network',             desc: 'All network interfaces and IP addresses of the host',                      defaultSize: { w: 4, h: 4 } },
  { type: 'proxmox-summary',        label: 'Proxmox — Node Summary',       desc: 'CPU & RAM per node',           needsIntegration: 'proxmox',               defaultSize: { w: 4, h: 4 }, supportsDisplayType: true },
  { type: 'proxmox-vms',            label: 'Proxmox — VM/CT List',         desc: 'All VMs and containers',       needsIntegration: 'proxmox',               defaultSize: { w: 6, h: 5 } },
  { type: 'truenas-summary',        label: 'TrueNAS — Pool Summary',       desc: 'Storage pool usage',           needsIntegration: 'truenas',               defaultSize: { w: 4, h: 4 }, supportsDisplayType: true },
  { type: 'truenas-alerts',         label: 'TrueNAS — Alerts',             desc: 'Active system alerts',         needsIntegration: 'truenas',               defaultSize: { w: 4, h: 3 } },
  { type: 'pihole-summary',         label: 'Pi-hole — Stats',              desc: 'Query counts, block rate',     needsIntegration: 'pihole',                defaultSize: { w: 4, h: 5 }, supportsDisplayType: true },
  { type: 'homeassistant-summary',  label: 'Home Assistant — Overview',    desc: 'Entity counts and alerts',     needsIntegration: 'homeassistant',         defaultSize: { w: 3, h: 4 } },
  { type: 'homeassistant-entities', label: 'Home Assistant — Entities',    desc: 'Live entity state table',      needsIntegration: 'homeassistant',         defaultSize: { w: 4, h: 5 } },
  { type: 'portainer-containers',   label: 'Portainer — Containers',       desc: 'Docker container list',        needsIntegration: 'portainer',             defaultSize: { w: 4, h: 5 } },
  { type: 'jellyfin-summary',       label: 'Jellyfin — Media Server',      desc: 'Library counts and streams',   needsIntegration: 'jellyfin',              defaultSize: { w: 4, h: 5 } },
  { type: 'uptimekuma-summary',     label: 'Uptime Kuma — Monitors',       desc: 'Service uptime status page',   needsIntegration: 'uptimekuma',            defaultSize: { w: 4, h: 5 } },
  { type: 'adguard-summary',        label: 'AdGuard Home — Stats',         desc: 'DNS query block stats',        needsIntegration: 'adguard',               defaultSize: { w: 4, h: 4 }, supportsDisplayType: true },
  { type: 'sonarr-summary',         label: 'Sonarr — TV Series',           desc: 'Series list and download queue', needsIntegration: 'sonarr',              defaultSize: { w: 4, h: 5 } },
  { type: 'radarr-summary',         label: 'Radarr — Movies',              desc: 'Movie library and queue',      needsIntegration: 'radarr',                defaultSize: { w: 4, h: 5 } },
  { type: 'speedtest-summary',      label: 'Speedtest Tracker',            desc: 'Internet speed history',       needsIntegration: 'speedtest',             defaultSize: { w: 4, h: 3 }, supportsDisplayType: true },
  { type: 'nextcloud-summary',      label: 'Nextcloud — Server Info',      desc: 'Storage, users, CPU load',     needsIntegration: 'nextcloud',             defaultSize: { w: 4, h: 4 } },
  { type: 'gitea-summary',          label: 'Gitea — Repos',                desc: 'Repository list and notifications', needsIntegration: 'gitea',            defaultSize: { w: 4, h: 5 } },
  { type: 'unifi-summary',          label: 'UniFi — Network',              desc: 'Client and device counts',     needsIntegration: 'unifi',                 defaultSize: { w: 4, h: 4 } },
  { type: 'nginxpm-summary',        label: 'Nginx Proxy Manager',          desc: 'Proxy hosts and SSL status',   needsIntegration: 'nginxpm',               defaultSize: { w: 4, h: 5 } },
  { type: 'plex-summary',           label: 'Plex — Media Server',          desc: 'Libraries and active streams', needsIntegration: 'plex',                  defaultSize: { w: 4, h: 5 } },
  { type: 'grafana-summary',        label: 'Grafana — Dashboards',         desc: 'Alerts and datasource status',   needsIntegration: 'grafana',               defaultSize: { w: 4, h: 4 } },
  { type: 'overseerr-summary',      label: 'Overseerr — Requests',         desc: 'Pending and recent requests',    needsIntegration: 'overseerr',             defaultSize: { w: 4, h: 5 } },
  { type: 'qbittorrent-summary',    label: 'qBittorrent — Torrents',       desc: 'Active downloads and stats',     needsIntegration: 'qbittorrent',           defaultSize: { w: 4, h: 5 } },
  { type: 'sabnzbd-summary',        label: 'SABnzbd — Downloads',          desc: 'Queue and speed',                needsIntegration: 'sabnzbd',               defaultSize: { w: 4, h: 4 } },
  { type: 'immich-summary',         label: 'Immich — Photos',              desc: 'Asset counts and stats',         needsIntegration: 'immich',                defaultSize: { w: 4, h: 4 } },
  { type: 'synology-summary',       label: 'Synology DSM — Overview',      desc: 'CPU, RAM and storage',           needsIntegration: 'synology',              defaultSize: { w: 4, h: 4 } },
  { type: 'prowlarr-summary',       label: 'Prowlarr — Indexers',          desc: 'Indexer health and stats',       needsIntegration: 'prowlarr',              defaultSize: { w: 4, h: 4 } },
  { type: 'lidarr-summary',         label: 'Lidarr — Music',               desc: 'Artist library and queue',       needsIntegration: 'lidarr',                defaultSize: { w: 4, h: 5 } },
  { type: 'bazarr-summary',         label: 'Bazarr — Subtitles',           desc: 'Missing and downloaded subs',    needsIntegration: 'bazarr',                defaultSize: { w: 4, h: 4 } },
  { type: 'cockpit-summary',        label: 'Cockpit — System',             desc: 'CPU, memory and services',       needsIntegration: 'cockpit',               defaultSize: { w: 4, h: 4 } },
  { type: 'snmp-summary',           label: 'SNMP — Device Info',           desc: 'System info, uptime, CPU/mem via SNMP', needsIntegration: 'snmp',            defaultSize: { w: 4, h: 4 } },
];

const DISPLAY_TYPES: { value: DisplayType; label: string; desc: string }[] = [
  { value: 'default', label: 'Default',  desc: 'Standard cards and bars' },
  { value: 'gauge',   label: 'Gauge',    desc: 'Radial arc gauges' },
  { value: 'graph',   label: 'Graph',    desc: 'Rolling time-series chart' },
  { value: 'stat',    label: 'Stat',     desc: 'Big number cards' },
];

export function AddWidgetModal({ integrations, onAdd, onClose }: Props) {
  const [selected, setSelected] = useState<CatalogEntry | null>(null);
  const [integrationId, setIntegrationId] = useState('');
  const [title, setTitle] = useState('');
  const [displayType, setDisplayType] = useState<DisplayType>('default');
  const [saving, setSaving] = useState(false);

  const availableIntegrations = selected?.needsIntegration
    ? integrations.filter((i) => i.type === selected.needsIntegration)
    : [];

  const handleAdd = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const widget = await api.addWidget({
        type: selected.type,
        title: title || selected.label,
        integrationId: integrationId || undefined,
        displayType: selected.supportsDisplayType ? displayType : undefined,
        x: 0, y: 9999,
        w: selected.defaultSize.w,
        h: selected.defaultSize.h,
      });
      onAdd(widget);
      onClose();
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-surface-border shrink-0">
          <h2 className="font-semibold text-tx">Add Widget</h2>
          <button onClick={onClose} className="text-tx-muted hover:text-tx"><X size={18} /></button>
        </div>

        <div className="overflow-auto flex-1 p-4 flex flex-col gap-3">
          {/* Widget catalog */}
          <div className="grid grid-cols-1 gap-2">
            {WIDGET_CATALOG.map((w) => {
              const disabled = !!w.needsIntegration && integrations.filter((i) => i.type === w.needsIntegration).length === 0;
              return (
                <button key={w.type} disabled={disabled}
                  onClick={() => { setSelected(w); setIntegrationId(''); setTitle(''); setDisplayType('default'); }}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    selected?.type === w.type
                      ? 'border-accent bg-accent/10'
                      : disabled
                      ? 'border-surface-border bg-surface/30 opacity-40 cursor-not-allowed'
                      : 'border-surface-border hover:border-accent/50 bg-surface/30'
                  }`}>
                  <div className="font-medium text-sm text-tx">{w.label}</div>
                  <div className="text-xs text-tx-muted mt-0.5 flex items-center gap-2">
                    {w.desc}
                    {w.supportsDisplayType && <span className="px-1.5 py-0.5 rounded bg-surface-border text-tx-muted">gauge / graph / stat</span>}
                    {disabled && <span className="text-accent-yellow">(no {w.needsIntegration} configured)</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Per-widget options */}
          {selected && (
            <div className="flex flex-col gap-3 border-t border-surface-border pt-4">
              <div>
                <label className="text-xs text-tx-muted mb-1 block">Widget title</label>
                <input className="input" placeholder={selected.label} value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              {selected.needsIntegration && availableIntegrations.length > 0 && (
                <div>
                  <label className="text-xs text-tx-muted mb-1 block">Integration</label>
                  <select className="input" value={integrationId} onChange={(e) => setIntegrationId(e.target.value)}>
                    <option value="">Select…</option>
                    {availableIntegrations.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
              )}

              {selected.supportsDisplayType && (
                <div>
                  <label className="text-xs text-tx-muted mb-1.5 block">Display type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {DISPLAY_TYPES.map((dt) => (
                      <button key={dt.value} onClick={() => setDisplayType(dt.value)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          displayType === dt.value ? 'border-accent bg-accent/10' : 'border-surface-border hover:border-accent/40 bg-surface/30'
                        }`}>
                        <div className="text-base mb-1">
                          {dt.value === 'default' ? '▦' : dt.value === 'gauge' ? '◑' : dt.value === 'graph' ? '📈' : '🔢'}
                        </div>
                        <div className="text-xs font-medium text-tx">{dt.label}</div>
                        <div className="text-[10px] text-tx-muted mt-0.5 leading-tight">{dt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-surface-border shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-tx-muted hover:text-tx">Cancel</button>
          <button
            disabled={!selected || (!!selected.needsIntegration && !integrationId) || saving}
            onClick={handleAdd}
            className="px-4 py-2 text-sm bg-accent text-white rounded-lg disabled:opacity-50 hover:opacity-80 transition-opacity">
            {saving ? 'Adding…' : 'Add Widget'}
          </button>
        </div>
      </div>
    </div>
  );
}
