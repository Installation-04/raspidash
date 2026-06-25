import { loadConfig } from '../store.js';

export async function speedtestFetch(integrationId: string, path: string) {
  const config = loadConfig();
  const integration = config.integrations.find(i => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');
  const base = integration.url.replace(/\/$/, '');
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (integration.apiKey) headers['Authorization'] = `Bearer ${integration.apiKey}`;
  const res = await fetch(`${base}${path}`, { headers });
  if (!res.ok) throw new Error(`Speedtest Tracker error: ${res.status}`);
  return res.json();
}
