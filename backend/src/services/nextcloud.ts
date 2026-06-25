import { loadConfig } from '../store.js';

export async function ncFetch(integrationId: string, path: string) {
  const config = loadConfig();
  const integration = config.integrations.find(i => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');
  const base = integration.url.replace(/\/$/, '');
  const auth = Buffer.from(`${integration.username}:${integration.password || integration.apiKey}`).toString('base64');
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Basic ${auth}`, 'OCS-APIRequest': 'true', Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Nextcloud error: ${res.status}`);
  return res.json();
}
