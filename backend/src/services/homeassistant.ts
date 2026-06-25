import { loadConfig } from '../store.js';

export async function haFetch(integrationId: string, path: string) {
  const config = loadConfig();
  const integration = config.integrations.find((i) => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');

  const base = integration.url.replace(/\/$/, '');
  const res = await fetch(`${base}/api${path}`, {
    headers: {
      Authorization: `Bearer ${integration.apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Home Assistant API error: ${res.status}`);
  return res.json();
}
