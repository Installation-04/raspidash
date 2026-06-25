import { loadConfig } from '../store.js';

export async function piholeFetch(integrationId: string, endpoint: string) {
  const config = loadConfig();
  const integration = config.integrations.find((i) => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');

  const base = integration.url.replace(/\/$/, '');
  const token = integration.apiKey || '';
  const url = `${base}/admin/api.php?${endpoint}&auth=${token}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pi-hole API error: ${res.status}`);
  return res.json();
}
