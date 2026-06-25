import { Router } from 'express';
import { loadConfig } from '../store.js';

export const bazarrRouter = Router();

bazarrRouter.get('/:id/summary', async (req, res) => {
  try {
    const config = loadConfig();
    const integration = config.integrations.find(i => i.id === req.params.id);
    if (!integration) return res.status(404).json({ error: 'Not found' });
    const base = integration.url.replace(/\/$/, '');
    const headers = { 'X-API-KEY': integration.apiKey ?? '' };

    const [episodeWanted, systemStatus] = await Promise.all([
      fetch(`${base}/api/episodes/wanted?start=0&length=10`, { headers }).then(r => r.json()).catch(() => ({})),
      fetch(`${base}/api/system/status`, { headers }).then(r => r.json()).catch(() => ({})),
    ]);

    res.json({
      wantedEpisodes: episodeWanted?.data ?? [],
      wantedEpisodesCount: episodeWanted?.total ?? 0,
      episodesTotal: systemStatus?.data?.episodes_library_size ?? 0,
      moviesTotal: systemStatus?.data?.movies_library_size ?? 0,
      providersTotal: systemStatus?.data?.providers ?? 0,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
