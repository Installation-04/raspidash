import { Router } from 'express';
import { agFetch } from '../services/adguard.js';

export const agRouter = Router();

agRouter.get('/:id/summary', async (req, res) => {
  try {
    const [stats, status] = await Promise.all([
      agFetch(req.params.id, '/control/stats'),
      agFetch(req.params.id, '/control/status'),
    ]);
    res.json({ stats, status });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
