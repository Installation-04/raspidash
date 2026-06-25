import { Router } from 'express';
import { loadConfig } from '../store.js';

export const sabnzbdRouter = Router();

sabnzbdRouter.get('/:id/summary', async (req, res) => {
  try {
    const config = loadConfig();
    const integration = config.integrations.find(i => i.id === req.params.id);
    if (!integration) return res.status(404).json({ error: 'Not found' });
    const base = integration.url.replace(/\/$/, '');
    const key = integration.apiKey ?? '';
    const r = await fetch(`${base}/api?output=json&apikey=${key}&mode=queue`);
    if (!r.ok) throw new Error(`SABnzbd error ${r.status}`);
    const data = await r.json();
    const queue = data?.queue ?? {};
    res.json({
      queueSize: queue.noofslots ?? 0,
      speed: queue.speed ?? '0 B/s',
      sizeLeft: queue.sizeleft ?? '–',
      status: queue.status ?? 'Unknown',
      queue: (queue.slots ?? []).slice(0, 10),
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
