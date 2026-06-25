import { WidgetConfig, Integration } from '../types';
import { ClockWidget } from './widgets/ClockWidget';
import { WelcomeWidget } from './widgets/WelcomeWidget';
import { ProxmoxSummaryWidget } from './widgets/ProxmoxSummaryWidget';
import { ProxmoxVMsWidget } from './widgets/ProxmoxVMsWidget';
import { TrueNASSummaryWidget } from './widgets/TrueNASSummaryWidget';
import { TrueNASAlertsWidget } from './widgets/TrueNASAlertsWidget';
import { PiholeSummaryWidget } from './widgets/PiholeSummaryWidget';
import { HomeAssistantWidget, HomeAssistantEntitiesWidget } from './widgets/HomeAssistantWidget';
import { PortainerWidget } from './widgets/PortainerWidget';
import { JellyfinWidget } from './widgets/JellyfinWidget';
import { UptimeKumaWidget } from './widgets/UptimeKumaWidget';
import { AdGuardWidget } from './widgets/AdGuardWidget';
import { SonarrWidget } from './widgets/SonarrWidget';
import { RadarrWidget } from './widgets/RadarrWidget';
import { SpeedtestWidget } from './widgets/SpeedtestWidget';
import { NextcloudWidget } from './widgets/NextcloudWidget';
import { GiteaWidget } from './widgets/GiteaWidget';
import { UnifiWidget } from './widgets/UnifiWidget';
import { NginxPMWidget } from './widgets/NginxPMWidget';
import { PlexWidget } from './widgets/PlexWidget';
import { GrafanaWidget } from './widgets/GrafanaWidget';
import { OverseerrWidget } from './widgets/OverseerrWidget';
import { QBittorrentWidget } from './widgets/QBittorrentWidget';
import { SABnzbdWidget } from './widgets/SABnzbdWidget';
import { ImmichWidget } from './widgets/ImmichWidget';
import { SynologyWidget } from './widgets/SynologyWidget';
import { ProwlarrWidget } from './widgets/ProwlarrWidget';
import { LidarrWidget } from './widgets/LidarrWidget';
import { BazarrWidget } from './widgets/BazarrWidget';
import { CockpitWidget } from './widgets/CockpitWidget';
import { SNMPWidget } from './widgets/SNMPWidget';
import { SystemStatsWidget, SystemNetworkWidget } from './widgets/SystemWidget';

interface Props {
  widget: WidgetConfig;
  integrations: Integration[];
}

export function WidgetRenderer({ widget, integrations }: Props) {
  const integration = integrations.find((i) => i.id === widget.integrationId);
  const dt = widget.displayType;

  switch (widget.type) {
    case 'clock':                  return <ClockWidget />;
    case 'welcome':                return <WelcomeWidget />;
    case 'proxmox-summary':        return integration ? <ProxmoxSummaryWidget integration={integration} displayType={dt} /> : <Missing type={widget.type} />;
    case 'proxmox-vms':            return integration ? <ProxmoxVMsWidget integration={integration} /> : <Missing type={widget.type} />;
    case 'truenas-summary':        return integration ? <TrueNASSummaryWidget integration={integration} displayType={dt} /> : <Missing type={widget.type} />;
    case 'truenas-alerts':         return integration ? <TrueNASAlertsWidget integration={integration} /> : <Missing type={widget.type} />;
    case 'pihole-summary':         return integration ? <PiholeSummaryWidget integration={integration} displayType={dt} /> : <Missing type={widget.type} />;
    case 'homeassistant-summary':  return integration ? <HomeAssistantWidget integration={integration} /> : <Missing type={widget.type} />;
    case 'homeassistant-entities': return integration ? <HomeAssistantEntitiesWidget integration={integration} /> : <Missing type={widget.type} />;
    case 'portainer-containers':   return integration ? <PortainerWidget integration={integration} /> : <Missing type={widget.type} />;
    case 'jellyfin-summary':
    case 'jellyfin-sessions':      return integration ? <JellyfinWidget integration={integration} /> : <Missing type={widget.type} />;
    case 'uptimekuma-summary':     return <UptimeKumaWidget widget={widget} />;
    case 'adguard-summary':        return <AdGuardWidget widget={widget} />;
    case 'sonarr-summary':         return <SonarrWidget widget={widget} />;
    case 'radarr-summary':         return <RadarrWidget widget={widget} />;
    case 'speedtest-summary':      return <SpeedtestWidget widget={widget} />;
    case 'nextcloud-summary':      return <NextcloudWidget widget={widget} />;
    case 'gitea-summary':          return <GiteaWidget widget={widget} />;
    case 'unifi-summary':          return <UnifiWidget widget={widget} />;
    case 'nginxpm-summary':        return <NginxPMWidget widget={widget} />;
    case 'plex-summary':           return <PlexWidget widget={widget} />;
    case 'grafana-summary':        return <GrafanaWidget widget={widget} />;
    case 'overseerr-summary':      return <OverseerrWidget widget={widget} />;
    case 'qbittorrent-summary':    return <QBittorrentWidget widget={widget} />;
    case 'sabnzbd-summary':        return <SABnzbdWidget widget={widget} />;
    case 'immich-summary':         return <ImmichWidget widget={widget} />;
    case 'synology-summary':       return <SynologyWidget widget={widget} />;
    case 'prowlarr-summary':       return <ProwlarrWidget widget={widget} />;
    case 'lidarr-summary':         return <LidarrWidget widget={widget} />;
    case 'bazarr-summary':         return <BazarrWidget widget={widget} />;
    case 'cockpit-summary':        return <CockpitWidget widget={widget} />;
    case 'snmp-summary':           return <SNMPWidget widget={widget} />;
    case 'system-stats':           return <SystemStatsWidget />;
    case 'system-network':         return <SystemNetworkWidget />;
    default:                       return <Missing type={widget.type} />;
  }
}

function Missing({ type }: { type: string }) {
  return <div className="flex items-center justify-center h-full text-tx-muted text-sm">Unknown widget: {type}</div>;
}
