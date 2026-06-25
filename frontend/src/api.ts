const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function del(path: string) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  getConfig: () => get<any>('/settings'),
  saveLayout: (widgets: any[]) => put('/settings/layout', { widgets }),
  addIntegration: (data: any) => post('/settings/integrations', data),
  updateIntegration: (id: string, data: any) => put(`/settings/integrations/${id}`, data),
  deleteIntegration: (id: string) => del(`/settings/integrations/${id}`),
  addWidget: (data: any) => post('/settings/widgets', data),
  deleteWidget: (id: string) => del(`/settings/widgets/${id}`),
  saveTheme: (themeId: string) => put('/settings/theme', { themeId }),
  saveColors: (customColors: Record<string, string>) => put('/settings/colors', { customColors }),
  saveRefresh: (refreshInterval: number) => put('/settings/refresh', { refreshInterval }),
  saveGeneral: (fields: Record<string, unknown>) => put('/settings/general', fields),

  proxmox: {
    summary: (id: string) => get<any>(`/proxmox/${id}/summary`),
  },
  truenas: {
    summary: (id: string) => get<any>(`/truenas/${id}/summary`),
  },
  pihole: {
    summary: (id: string) => get<any>(`/pihole/${id}/summary`),
  },
  ha: {
    summary: (id: string) => get<any>(`/ha/${id}/summary`),
    entities: (id: string, domain?: string) =>
      get<any[]>(`/ha/${id}/entities${domain ? `?domain=${domain}` : ''}`),
  },
  portainer: {
    summary: (id: string) => get<any[]>(`/portainer/${id}/summary`),
  },
  jellyfin: {
    summary: (id: string) => get<any>(`/jellyfin/${id}/summary`),
  },
  uptimekuma: {
    summary: (id: string) => get<any>(`/uptimekuma/${id}/summary`),
  },
  adguard: {
    summary: (id: string) => get<any>(`/adguard/${id}/summary`),
  },
  sonarr: {
    summary: (id: string) => get<any>(`/sonarr/${id}/summary`),
  },
  radarr: {
    summary: (id: string) => get<any>(`/radarr/${id}/summary`),
  },
  speedtest: {
    latest: (id: string) => get<any>(`/speedtest/${id}/latest`),
    history: (id: string) => get<any>(`/speedtest/${id}/history`),
  },
  nextcloud: {
    summary: (id: string) => get<any>(`/nextcloud/${id}/summary`),
  },
  gitea: {
    summary: (id: string) => get<any>(`/gitea/${id}/summary`),
  },
  unifi: {
    summary: (id: string) => get<any>(`/unifi/${id}/summary`),
  },
  nginxpm: {
    summary: (id: string) => get<any>(`/nginxpm/${id}/summary`),
  },
  plex: {
    summary: (id: string) => get<any>(`/plex/${id}/summary`),
  },
  grafana: {
    summary: (id: string) => get<any>(`/grafana/${id}/summary`),
  },
  overseerr: {
    summary: (id: string) => get<any>(`/overseerr/${id}/summary`),
  },
  qbittorrent: {
    summary: (id: string) => get<any>(`/qbittorrent/${id}/summary`),
  },
  sabnzbd: {
    summary: (id: string) => get<any>(`/sabnzbd/${id}/summary`),
  },
  immich: {
    summary: (id: string) => get<any>(`/immich/${id}/summary`),
  },
  synology: {
    summary: (id: string) => get<any>(`/synology/${id}/summary`),
  },
  prowlarr: {
    summary: (id: string) => get<any>(`/prowlarr/${id}/summary`),
  },
  lidarr: {
    summary: (id: string) => get<any>(`/lidarr/${id}/summary`),
  },
  bazarr: {
    summary: (id: string) => get<any>(`/bazarr/${id}/summary`),
  },
  cockpit: {
    summary: (id: string) => get<any>(`/cockpit/${id}/summary`),
  },
  snmp: {
    summary: (id: string) => get<any>(`/snmp/${id}/summary`),
  },
};
