import { loadConfig } from '../store.js';

export async function agFetch(integrationId: string, path: string) {
  const config = loadConfig();
  const integration = config.integrations.find(i => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');
  const base = integration.url.replace(/\/$/, '');
  const auth = Buffer.from(`${integration.username}:${integration.password}`).toString('base64');
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`AdGuard Home error: ${res.status}`);
  return res.json();
}
