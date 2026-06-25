import { Router } from 'express';
import { ukSummary } from '../services/uptimekuma.js';

export const ukRouter = Router();

ukRouter.get('/:id/summary', async (req, res) => {
  try { res.json(await ukSummary(req.params.id)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});
