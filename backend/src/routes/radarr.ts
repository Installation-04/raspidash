import { Router } from 'express';
import { arrFetch } from '../services/arr.js';

export const radarrRouter = Router();

radarrRouter.get('/:id/summary', async (req, res) => {
  try {
    const [movies, queue] = await Promise.all([
      arrFetch(req.params.id, '/movie'),
      arrFetch(req.params.id, '/queue'),
    ]);
    const list = Array.isArray(movies) ? movies : [];
    res.json({
      totalMovies: list.length,
      monitored: list.filter((m: any) => m.monitored).length,
      downloaded: list.filter((m: any) => m.hasFile).length,
      missing: list.filter((m: any) => m.monitored && !m.hasFile).length,
      queue: Array.isArray(queue?.records) ? queue.records.slice(0, 10) : [],
      queueTotal: queue?.totalRecords ?? 0,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
