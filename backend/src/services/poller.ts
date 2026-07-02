import { loadConfig, Integration } from '../store.js';
import { proxmoxFetch } from './proxmox.js';
import { truenasFetch } from './truenas.js';
import { piholeFetch } from './pihole.js';
import { haFetch } from './homeassistant.js';
import { portainerFetch } from './portainer.js';
import { jellyfinFetch } from './jellyfin.js';
import { ukSummary } from './uptimekuma.js';
import { agFetch } from './adguard.js';
import { arrFetch } from './arr.js';
import { speedtestFetch } from './speedtest.js';
import { ncFetch } from './nextcloud.js';
import { giteaFetch } from './gitea.js';
import { uniFetch } from './unifi.js';
import { npmFetch } from './nginxpm.js';
import { plexFetch } from './plex.js';
import { broadcast } from '../index.js';

let timer: ReturnType<typeof setTimeout> | null = null;

// Hard cap per integration so one hung service can't stall the poll cycle
const INTEGRATION_TIMEOUT_MS = 20_000;

export function startPolling() {
  scheduleNext();
}

function scheduleNext() {
  const config = loadConfig();
  const interval = (config.refreshInterval || 30) * 1000;
  timer = setTimeout(async () => {
    await poll();
    scheduleNext();
  }, interval);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timed out after ${ms / 1000}s`)), ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

async function poll() {
  const config = loadConfig();
  await Promise.allSettled(
    config.integrations.map((integration) =>
      withTimeout(pollIntegration(integration), INTEGRATION_TIMEOUT_MS).catch((e: any) => {
        broadcast({ type: 'error', integrationId: integration.id, error: e.message });
      })
    )
  );
}

async function pollIntegration(integration: Integration) {
  if (integration.type === 'proxmox') {
    const nodesData = await proxmoxFetch(integration.id, '/nodes');
    broadcast({ type: 'proxmox', integrationId: integration.id, data: nodesData });
  } else if (integration.type === 'truenas') {
    const [pools, info] = await Promise.all([
      truenasFetch(integration.id, '/pool'),
      truenasFetch(integration.id, '/system/info'),
    ]);
    broadcast({ type: 'truenas', integrationId: integration.id, data: { pools, info } });
  } else if (integration.type === 'pihole') {
    const data = await piholeFetch(integration.id, 'summary');
    broadcast({ type: 'pihole', integrationId: integration.id, data });
  } else if (integration.type === 'homeassistant') {
    const data = await haFetch(integration.id, '/states');
    broadcast({ type: 'homeassistant', integrationId: integration.id, data });
  } else if (integration.type === 'portainer') {
    const data = await portainerFetch(integration.id, '/endpoints');
    broadcast({ type: 'portainer', integrationId: integration.id, data });
  } else if (integration.type === 'jellyfin') {
    const data = await jellyfinFetch(integration.id, '/Sessions');
    broadcast({ type: 'jellyfin', integrationId: integration.id, data });
  } else if (integration.type === 'uptimekuma') {
    const data = await ukSummary(integration.id);
    broadcast({ type: 'uptimekuma', integrationId: integration.id, data });
  } else if (integration.type === 'adguard') {
    const [stats, status] = await Promise.all([agFetch(integration.id, '/control/stats'), agFetch(integration.id, '/control/status')]);
    broadcast({ type: 'adguard', integrationId: integration.id, data: { stats, status } });
  } else if (integration.type === 'sonarr') {
    const data = await arrFetch(integration.id, '/series');
    broadcast({ type: 'sonarr', integrationId: integration.id, data });
  } else if (integration.type === 'radarr') {
    const data = await arrFetch(integration.id, '/movie');
    broadcast({ type: 'radarr', integrationId: integration.id, data });
  } else if (integration.type === 'speedtest') {
    const data = await speedtestFetch(integration.id, '/api/speedtest/latest');
    broadcast({ type: 'speedtest', integrationId: integration.id, data });
  } else if (integration.type === 'nextcloud') {
    const data = await ncFetch(integration.id, '/ocs/v2.php/apps/serverinfo/api/v1/info?format=json');
    broadcast({ type: 'nextcloud', integrationId: integration.id, data });
  } else if (integration.type === 'gitea') {
    const data = await giteaFetch(integration.id, '/repos/search?limit=10&sort=newest');
    broadcast({ type: 'gitea', integrationId: integration.id, data });
  } else if (integration.type === 'unifi') {
    const data = await uniFetch(integration.id, '/proxy/network/api/s/default/stat/sta').catch(() => ({ data: [] }));
    broadcast({ type: 'unifi', integrationId: integration.id, data });
  } else if (integration.type === 'nginxpm') {
    const data = await npmFetch(integration.id, '/nginx/proxy-hosts');
    broadcast({ type: 'nginxpm', integrationId: integration.id, data });
  } else if (integration.type === 'plex') {
    const data = await plexFetch(integration.id, '/status/sessions');
    broadcast({ type: 'plex', integrationId: integration.id, data });
  }
}
