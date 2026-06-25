import { Router } from 'express';
import { arrFetch } from '../services/arr.js';

export const sonarrRouter = Router();

sonarrRouter.get('/:id/summary', async (req, res) => {
  try {
    const [series, queue, calendar] = await Promise.all([
      arrFetch(req.params.id, '/series'),
      arrFetch(req.params.id, '/queue'),
      arrFetch(req.params.id, '/calendar'),
    ]);
    res.json({
      totalSeries: Array.isArray(series) ? series.length : 0,
      monitored: Array.isArray(series) ? series.filter((s: any) => s.monitored).length : 0,
      queue: Array.isArray(queue?.records) ? queue.records.slice(0, 10) : [],
      queueTotal: queue?.totalRecords ?? 0,
      upcoming: Array.isArray(calendar) ? calendar.slice(0, 5) : [],
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
