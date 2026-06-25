import { Router } from 'express';
import { giteaFetch } from '../services/gitea.js';

export const giteaRouter = Router();

giteaRouter.get('/:id/summary', async (req, res) => {
  try {
    const [user, repos, notifications] = await Promise.all([
      giteaFetch(req.params.id, '/user'),
      giteaFetch(req.params.id, '/repos/search?limit=10&sort=newest'),
      giteaFetch(req.params.id, '/notifications?all=false').catch(() => []),
    ]);
    res.json({
      user,
      repos: (repos as any)?.data ?? repos,
      unread: Array.isArray(notifications) ? notifications.length : 0,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
