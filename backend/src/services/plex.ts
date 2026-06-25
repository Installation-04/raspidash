import { loadConfig } from '../store.js';

export async function plexFetch(integrationId: string, path: string) {
  const config = loadConfig();
  const integration = config.integrations.find(i => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');
  const base = integration.url.replace(/\/$/, '');
  const token = integration.apiKey || '';
  const res = await fetch(`${base}${path}?X-Plex-Token=${token}`, {
    headers: { Accept: 'application/json', 'X-Plex-Token': token },
  });
  if (!res.ok) throw new Error(`Plex error: ${res.status}`);
  return res.json();
}
