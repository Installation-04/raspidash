import { loadConfig } from '../store.js';

export async function truenasFetch(integrationId: string, path: string) {
  const config = loadConfig();
  const integration = config.integrations.find((i) => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');

  const baseUrl = integration.url.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/api/v2.0${path}`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (integration.apiKey) {
    headers['Authorization'] = `Bearer ${integration.apiKey}`;
  } else if (integration.username && integration.password) {
    headers['Authorization'] =
      'Basic ' + Buffer.from(`${integration.username}:${integration.password}`).toString('base64');
  }

  const res = await fetch(apiUrl, { headers });
  if (!res.ok) throw new Error(`TrueNAS API error: ${res.status} ${res.statusText}`);
  return res.json();
}
