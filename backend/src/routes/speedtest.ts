import { Router } from 'express';
import { speedtestFetch } from '../services/speedtest.js';

export const speedtestRouter = Router();

speedtestRouter.get('/:id/latest', async (req, res) => {
  try {
    // Speedtest Tracker v2 API
    const data = await speedtestFetch(req.params.id, '/api/speedtest/latest');
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

speedtestRouter.get('/:id/history', async (req, res) => {
  try {
    const data = await speedtestFetch(req.params.id, '/api/speedtest?limit=20');
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
