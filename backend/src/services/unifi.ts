import { loadConfig } from '../store.js';

const sessionCache = new Map<string, { cookie: string; expires: number }>();

async function getSession(integrationId: string, base: string, username: string, password: string) {
  const cached = sessionCache.get(integrationId);
  if (cached && cached.expires > Date.now()) return cached.cookie;

  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(`UniFi login failed: ${res.status}`);
  const cookie = res.headers.get('set-cookie') || '';
  sessionCache.set(integrationId, { cookie, expires: Date.now() + 3_600_000 });
  return cookie;
}

export async function uniFetch(integrationId: string, path: string) {
  const config = loadConfig();
  const integration = config.integrations.find(i => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');
  const base = integration.url.replace(/\/$/, '');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (integration.apiKey) {
    headers['X-API-KEY'] = integration.apiKey;
  } else {
    headers['Cookie'] = await getSession(integrationId, base, integration.username!, integration.password!);
  }

  const res = await fetch(`${base}${path}`, { headers });
  if (!res.ok) throw new Error(`UniFi error: ${res.status}`);
  return res.json();
}
