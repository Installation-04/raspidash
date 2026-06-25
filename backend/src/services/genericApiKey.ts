import { loadConfig } from '../store.js';

export function makeApiKeyFetcher(bearerPrefix = 'Bearer') {
  return async function fetch_(integrationId: string, path: string) {
    const config = loadConfig();
    const integration = config.integrations.find(i => i.id === integrationId);
    if (!integration) throw new Error('Integration not found');
    const base = integration.url.replace(/\/$/, '');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (integration.apiKey) headers['Authorization'] = `${bearerPrefix} ${integration.apiKey}`;
    const res = await fetch(`${base}${path}`, { headers });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  };
}

export function makeUserPassFetcher() {
  return async function fetch_(integrationId: string, path: string, opts?: RequestInit) {
    const config = loadConfig();
    const integration = config.integrations.find(i => i.id === integrationId);
    if (!integration) throw new Error('Integration not found');
    const base = integration.url.replace(/\/$/, '');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (integration.username && integration.password) {
      headers['Authorization'] = 'Basic ' + Buffer.from(`${integration.username}:${integration.password}`).toString('base64');
    }
    const res = await fetch(`${base}${path}`, { headers, ...opts });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  };
}
