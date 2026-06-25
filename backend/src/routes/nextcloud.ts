import { Router } from 'express';
import { ncFetch } from '../services/nextcloud.js';

export const ncRouter = Router();

ncRouter.get('/:id/summary', async (req, res) => {
  try {
    const data = await ncFetch(req.params.id, '/ocs/v2.php/apps/serverinfo/api/v1/info?format=json');
    res.json(data?.ocs?.data ?? data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
