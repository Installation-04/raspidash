import { loadConfig } from '../store.js';

export async function ukFetch(integrationId: string, path: string) {
  const config = loadConfig();
  const integration = config.integrations.find(i => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');
  const base = integration.url.replace(/\/$/, '');
  const headers: Record<string, string> = {};
  if (integration.apiKey) headers['Authorization'] = `Bearer ${integration.apiKey}`;
  const res = await fetch(`${base}${path}`, { headers });
  if (!res.ok) throw new Error(`Uptime Kuma API error: ${res.status}`);
  return res.json();
}

export async function ukSummary(integrationId: string) {
  // Public status page heartbeat — works without auth
  const config = loadConfig();
  const integration = config.integrations.find(i => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');
  const base = integration.url.replace(/\/$/, '');
  const slug = (integration as any).options?.slug || 'default';
  const res = await fetch(`${base}/api/status-page/heartbeat/${slug}`);
  if (!res.ok) throw new Error(`Uptime Kuma error: ${res.status}`);
  return res.json();
}
