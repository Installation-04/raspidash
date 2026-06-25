import {
  Server, HardDrive, Shield, Home, Container, Film, Activity, Tv, Clapperboard,
  Gauge, Cloud, GitBranch, Wifi, Lock, PlayCircle, Clock, Sparkles,
  BarChart2, Eye, Download, Radio, MonitorCheck, Cpu, Globe, Music, Subtitles, Terminal, Network,
} from 'lucide-react';
import type { ReactNode } from 'react';

export interface ServiceMeta {
  icon: ReactNode;
  color: string;
  label: string;
}

export const SERVICES_META: Record<string, ServiceMeta> = {
  // Original integrations
  proxmox:       { icon: <Server size={16} />,       color: '#E57000', label: 'Proxmox VE' },
  truenas:       { icon: <HardDrive size={16} />,    color: '#0095D5', label: 'TrueNAS' },
  pihole:        { icon: <Shield size={16} />,       color: '#D42328', label: 'Pi-hole' },
  homeassistant: { icon: <Home size={16} />,         color: '#41BDF5', label: 'Home Assistant' },
  portainer:     { icon: <Container size={16} />,    color: '#13BEF9', label: 'Portainer' },
  jellyfin:      { icon: <Film size={16} />,         color: '#9B59B6', label: 'Jellyfin' },
  uptimekuma:    { icon: <Activity size={16} />,     color: '#5CDD8B', label: 'Uptime Kuma' },
  adguard:       { icon: <Shield size={16} />,       color: '#67B346', label: 'AdGuard Home' },
  sonarr:        { icon: <Tv size={16} />,           color: '#3498DB', label: 'Sonarr' },
  radarr:        { icon: <Clapperboard size={16} />, color: '#F39C12', label: 'Radarr' },
  speedtest:     { icon: <Gauge size={16} />,        color: '#00B4D8', label: 'Speedtest Tracker' },
  nextcloud:     { icon: <Cloud size={16} />,        color: '#0082C9', label: 'Nextcloud' },
  gitea:         { icon: <GitBranch size={16} />,    color: '#609926', label: 'Gitea' },
  unifi:         { icon: <Wifi size={16} />,         color: '#0059C6', label: 'UniFi' },
  nginxpm:       { icon: <Lock size={16} />,         color: '#F15833', label: 'Nginx Proxy Manager' },
  plex:          { icon: <PlayCircle size={16} />,   color: '#E5A00D', label: 'Plex' },
  // New integrations
  grafana:       { icon: <BarChart2 size={16} />,    color: '#F46800', label: 'Grafana' },
  overseerr:     { icon: <Eye size={16} />,          color: '#E0AE5B', label: 'Overseerr' },
  qbittorrent:   { icon: <Download size={16} />,     color: '#2F67BA', label: 'qBittorrent' },
  sabnzbd:       { icon: <Radio size={16} />,        color: '#F5A623', label: 'SABnzbd' },
  immich:        { icon: <MonitorCheck size={16} />, color: '#4776E6', label: 'Immich' },
  synology:      { icon: <Cpu size={16} />,          color: '#B5B5B6', label: 'Synology DSM' },
  prowlarr:      { icon: <Globe size={16} />,        color: '#FF7F7F', label: 'Prowlarr' },
  lidarr:        { icon: <Music size={16} />,        color: '#27A468', label: 'Lidarr' },
  bazarr:        { icon: <Subtitles size={16} />,    color: '#1A9CE0', label: 'Bazarr' },
  cockpit:       { icon: <Terminal size={16} />,     color: '#0066CC', label: 'Cockpit' },
  snmp:          { icon: <Network size={16} />,      color: '#00AA88', label: 'SNMP Device' },
  // Widget-only types
  clock:         { icon: <Clock size={16} />,        color: '#a78bfa', label: 'Clock' },
  welcome:       { icon: <Sparkles size={16} />,     color: '#f472b6', label: 'Welcome' },
};

export function getServiceMeta(type: string | undefined): ServiceMeta | null {
  if (!type) return null;
  return SERVICES_META[type] ?? null;
}
