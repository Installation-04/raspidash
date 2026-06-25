import { Router } from 'express';
import { makeApiKeyFetcher } from '../services/genericApiKey.js';

export const overseerrRouter = Router();

async function oFetch(id: string, path: string) {
  const { loadConfig } = await import('../store.js');
  const config = loadConfig();
  const integration = config.integrations.find(i => i.id === id);
  if (!integration) throw new Error('Integration not found');
  const base = integration.url.replace(/\/$/, '');
  const res = await fetch(`${base}${path}`, {
    headers: { 'X-Api-Key': integration.apiKey ?? '' },
  });
  if (!res.ok) throw new Error(`Overseerr API error ${res.status}`);
  return res.json();
}

overseerrRouter.get('/:id/summary', async (req, res) => {
  try {
    const [stats, requests] = await Promise.all([
      oFetch(req.params.id, '/api/v1/request/count'),
      oFetch(req.params.id, '/api/v1/request?take=10&sort=added'),
    ]);
    res.json({
      pending: stats?.pending ?? 0,
      approved: stats?.approved ?? 0,
      available: stats?.available ?? 0,
      total: stats?.total ?? 0,
      recentRequests: requests?.results ?? [],
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
