import { Router } from 'express';
import { loadConfig } from '../store.js';

export const immichRouter = Router();

immichRouter.get('/:id/summary', async (req, res) => {
  try {
    const config = loadConfig();
    const integration = config.integrations.find(i => i.id === req.params.id);
    if (!integration) return res.status(404).json({ error: 'Not found' });
    const base = integration.url.replace(/\/$/, '');
    const headers = { 'x-api-key': integration.apiKey ?? '' };

    const [stats, users] = await Promise.all([
      fetch(`${base}/api/server-info/statistics`, { headers }).then(r => r.json()),
      fetch(`${base}/api/user`, { headers }).then(r => r.json()).catch(() => []),
    ]);

    res.json({
      photos: stats?.photos ?? 0,
      videos: stats?.videos ?? 0,
      usage: stats?.usage ?? 0,
      albums: 0,
      users: Array.isArray(users) ? users.length : 0,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
