export interface Integration {
  id: string;
  type: 'proxmox' | 'truenas' | 'pihole' | 'homeassistant' | 'portainer' | 'jellyfin'
    | 'uptimekuma' | 'adguard' | 'sonarr' | 'radarr' | 'speedtest'
    | 'nextcloud' | 'gitea' | 'unifi' | 'nginxpm' | 'plex'
    | 'grafana' | 'overseerr' | 'qbittorrent' | 'sabnzbd' | 'immich'
    | 'synology' | 'prowlarr' | 'lidarr' | 'bazarr' | 'cockpit'
    | 'snmp';
  name: string;
  url: string;
  username?: string;
  apiKey?: string;
  insecure?: boolean;
  options?: Record<string, string>;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  integrationId?: string;
  displayType?: DisplayType;
  options?: Record<string, unknown>;
  x: number;
  y: number;
  w: number;
  h: number;
}

export type WidgetType =
  | 'proxmox-summary'
  | 'proxmox-vms'
  | 'proxmox-node-stats'
  | 'truenas-summary'
  | 'truenas-pools'
  | 'truenas-alerts'
  | 'pihole-summary'
  | 'homeassistant-summary'
  | 'homeassistant-entities'
  | 'portainer-containers'
  | 'jellyfin-summary'
  | 'jellyfin-sessions'
  | 'uptimekuma-summary'
  | 'adguard-summary'
  | 'sonarr-summary'
  | 'radarr-summary'
  | 'speedtest-summary'
  | 'nextcloud-summary'
  | 'gitea-summary'
  | 'unifi-summary'
  | 'nginxpm-summary'
  | 'plex-summary'
  | 'grafana-summary'
  | 'overseerr-summary'
  | 'qbittorrent-summary'
  | 'sabnzbd-summary'
  | 'immich-summary'
  | 'synology-summary'
  | 'prowlarr-summary'
  | 'lidarr-summary'
  | 'bazarr-summary'
  | 'cockpit-summary'
  | 'snmp-summary'
  | 'system-stats'
  | 'system-network'
  | 'clock'
  | 'welcome';

export type DisplayType = 'default' | 'gauge' | 'graph' | 'stat';

export interface AppConfig {
  integrations: Integration[];
  widgets: WidgetConfig[];
  themeId: string;
  customColors: Record<string, string>;
  refreshInterval: number;
  // General / display settings
  dashboardTitle?: string;
  temperatureUnit?: 'celsius' | 'fahrenheit';
  dateFormat?: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat?: '12h' | '24h';
  language?: string;
  timezone?: string;
  widgetBorderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  widgetGap?: 'tight' | 'normal' | 'relaxed';
  showWidgetTitles?: boolean;
  showLastUpdated?: boolean;
  animationsEnabled?: boolean;
  glassmorphismIntensity?: 'off' | 'low' | 'medium' | 'high';
  compactMode?: boolean;
  startupWidget?: string;
  backgroundStyle?: 'dots' | 'grid' | 'none';
  backgroundImage?: string;
  backgroundOverlayOpacity?: number;
  fontFamily?: 'system' | 'mono' | 'inter' | 'sans';
  // Pi Display settings
  screenPreset?: string;
  gridCols?: number;
  rowHeight?: number;
  uiScale?: number;
  touchMode?: boolean;
  overscanCompensation?: boolean;
  hideScrollbars?: boolean;
  highContrast?: boolean;
  cursorHidden?: boolean;
}

export interface ProxmoxNode {
  node: string;
  status: string;
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  uptime: number;
  vms: ProxmoxVM[];
}

export interface ProxmoxVM {
  vmid: number;
  name: string;
  status: string;
  type: 'qemu' | 'lxc';
  cpu: number;
  mem: number;
  maxmem: number;
  uptime: number;
}

export interface TrueNASPool {
  id: number;
  name: string;
  status: string;
  size: number;
  allocated: number;
  free: number;
  healthy: boolean;
}

export interface TrueNASInfo {
  hostname: string;
  version: string;
  uptime_seconds: number;
  cores: number;
  memory_size: number;
}
