import { loadConfig } from '../store.js';

export async function jellyfinFetch(integrationId: string, path: string) {
  const config = loadConfig();
  const integration = config.integrations.find((i) => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');

  const base = integration.url.replace(/\/$/, '');
  const res = await fetch(`${base}${path}`, {
    headers: {
      'X-Emby-Token': integration.apiKey || '',
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Jellyfin API error: ${res.status}`);
  return res.json();
}
