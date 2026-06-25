import { Router } from 'express';
import { makeApiKeyFetcher } from '../services/genericApiKey.js';

export const grafanaRouter = Router();
const gFetch = makeApiKeyFetcher('Bearer');

grafanaRouter.get('/:id/summary', async (req, res) => {
  try {
    const [dashboards, datasources, alerts] = await Promise.all([
      gFetch(req.params.id, '/api/search?type=dash-db&limit=1').catch(() => []),
      gFetch(req.params.id, '/api/datasources').catch(() => []),
      gFetch(req.params.id, '/api/alerts?limit=100').catch(() => []),
    ]);
    res.json({
      dashboards: Array.isArray(dashboards) ? dashboards.length : 0,
      datasources: Array.isArray(datasources) ? datasources.length : 0,
      alerts: Array.isArray(alerts) ? alerts : [],
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
