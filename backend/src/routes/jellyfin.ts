import { Router } from 'express';
import { jellyfinFetch } from '../services/jellyfin.js';

export const jellyfinRouter = Router();

jellyfinRouter.get('/:integrationId/summary', async (req, res) => {
  try {
    const [info, sessions, counts] = await Promise.all([
      jellyfinFetch(req.params.integrationId, '/System/Info'),
      jellyfinFetch(req.params.integrationId, '/Sessions'),
      jellyfinFetch(req.params.integrationId, '/Items/Counts'),
    ]);
    res.json({ info, sessions, counts });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

jellyfinRouter.get('/:integrationId/sessions', async (req, res) => {
  try {
    const data = await jellyfinFetch(req.params.integrationId, '/Sessions');
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
