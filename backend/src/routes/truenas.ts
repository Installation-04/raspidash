import { Router } from 'express';
import { truenasFetch } from '../services/truenas.js';

export const truenasRouter = Router();

truenasRouter.get('/:integrationId/system/info', async (req, res) => {
  try {
    const data = await truenasFetch(req.params.integrationId, '/system/info');
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

truenasRouter.get('/:integrationId/pool', async (req, res) => {
  try {
    const data = await truenasFetch(req.params.integrationId, '/pool');
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

truenasRouter.get('/:integrationId/disk', async (req, res) => {
  try {
    const data = await truenasFetch(req.params.integrationId, '/disk');
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

truenasRouter.get('/:integrationId/alert/list', async (req, res) => {
  try {
    const data = await truenasFetch(req.params.integrationId, '/alert/list');
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

truenasRouter.get('/:integrationId/summary', async (req, res) => {
  try {
    const [info, pools, alerts] = await Promise.all([
      truenasFetch(req.params.integrationId, '/system/info'),
      truenasFetch(req.params.integrationId, '/pool'),
      truenasFetch(req.params.integrationId, '/alert/list').catch(() => []),
    ]);
    res.json({ info, pools, alerts });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
