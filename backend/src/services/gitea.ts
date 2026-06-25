import { loadConfig } from '../store.js';

export async function giteaFetch(integrationId: string, path: string) {
  const config = loadConfig();
  const integration = config.integrations.find(i => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');
  const base = integration.url.replace(/\/$/, '');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (integration.apiKey) headers['Authorization'] = `token ${integration.apiKey}`;
  const res = await fetch(`${base}/api/v1${path}`, { headers });
  if (!res.ok) throw new Error(`Gitea error: ${res.status}`);
  return res.json();
}
