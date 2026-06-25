import { Router } from 'express';
import { plexFetch } from '../services/plex.js';

export const plexRouter = Router();

plexRouter.get('/:id/summary', async (req, res) => {
  try {
    const [identity, sessions, libraries] = await Promise.all([
      plexFetch(req.params.id, '/identity'),
      plexFetch(req.params.id, '/status/sessions'),
      plexFetch(req.params.id, '/library/sections'),
    ]);
    const sess = sessions?.MediaContainer?.Metadata ?? [];
    const libs = libraries?.MediaContainer?.Directory ?? [];
    res.json({
      serverName: identity?.MediaContainer?.friendlyName,
      version: identity?.MediaContainer?.version,
      sessions: sess.map((s: any) => ({
        user: s.User?.title,
        title: s.title,
        grandparentTitle: s.grandparentTitle,
        type: s.type,
        state: s.Player?.state,
        device: s.Player?.device,
        progress: s.viewOffset && s.duration ? Math.round((s.viewOffset / s.duration) * 100) : 0,
      })),
      libraries: libs.map((l: any) => ({ title: l.title, type: l.type, count: l.count })),
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
