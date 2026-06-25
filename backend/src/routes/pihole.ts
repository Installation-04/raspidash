import { Router } from 'express';
import { piholeFetch } from '../services/pihole.js';

export const piholeRouter = Router();

piholeRouter.get('/:integrationId/summary', async (req, res) => {
  try {
    const data = await piholeFetch(req.params.integrationId, 'summary');
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

piholeRouter.get('/:integrationId/top', async (req, res) => {
  try {
    const [topDomains, topAds] = await Promise.all([
      piholeFetch(req.params.integrationId, 'topItems&topdomains=10'),
      piholeFetch(req.params.integrationId, 'topItems&topad=10'),
    ]);
    res.json({ topDomains, topAds });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
