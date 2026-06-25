import { loadConfig } from '../store.js';

export async function arrFetch(integrationId: string, path: string) {
  const config = loadConfig();
  const integration = config.integrations.find(i => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');
  const base = integration.url.replace(/\/$/, '');
  const res = await fetch(`${base}/api/v3${path}`, {
    headers: { 'X-Api-Key': integration.apiKey || '' },
  });
  if (!res.ok) throw new Error(`*arr API error: ${res.status}`);
  return res.json();
}
