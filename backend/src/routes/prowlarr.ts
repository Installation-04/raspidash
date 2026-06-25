import { Router } from 'express';
import { arrFetch } from '../services/arr.js';

export const prowlarrRouter = Router();

prowlarrRouter.get('/:id/summary', async (req, res) => {
  try {
    const [indexers, stats] = await Promise.all([
      arrFetch(req.params.id, '/indexer'),
      arrFetch(req.params.id, '/indexerstats').catch(() => ({})),
    ]);
    res.json({
      indexers: Array.isArray(indexers) ? indexers : [],
      grabbedToday: (stats as any)?.userAgentStats?.[0]?.numberOfGrabs ?? 0,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
