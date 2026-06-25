import { loadConfig } from '../store.js';

const tokenCache = new Map<string, { token: string; expires: number }>();

async function getToken(integrationId: string, base: string, username: string, password: string) {
  const cached = tokenCache.get(integrationId);
  if (cached && cached.expires > Date.now()) return cached.token;

  const res = await fetch(`${base}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const json = await res.json() as any;
  const token = json.jwt;
  tokenCache.set(integrationId, { token, expires: Date.now() + 3_600_000 });
  return token;
}

export async function portainerFetch(integrationId: string, path: string) {
  const config = loadConfig();
  const integration = config.integrations.find((i) => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');

  const base = integration.url.replace(/\/$/, '');

  const authHeader = integration.apiKey
    ? `Bearer ${integration.apiKey}`
    : `Bearer ${await getToken(integrationId, base, integration.username!, integration.password!)}`;

  const res = await fetch(`${base}/api${path}`, {
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Portainer API error: ${res.status}`);
  return res.json();
}
