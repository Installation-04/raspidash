import { Router } from 'express';
import { arrFetch } from '../services/arr.js';

export const lidarrRouter = Router();

lidarrRouter.get('/:id/summary', async (req, res) => {
  try {
    const [artists, albums, queue] = await Promise.all([
      arrFetch(req.params.id, '/artist'),
      arrFetch(req.params.id, '/album?includeAllArtistAlbums=false').catch(() => []),
      arrFetch(req.params.id, '/queue').catch(() => ({ records: [], totalRecords: 0 })),
    ]);

    const artistList = Array.isArray(artists) ? artists : [];
    const albumList = Array.isArray(albums) ? albums : [];

    res.json({
      totalArtists: artistList.length,
      totalAlbums: albumList.length,
      missing: albumList.filter((a: any) => a.statistics?.percentOfTracks < 100 && a.monitored).length,
      queue: Array.isArray((queue as any).records) ? (queue as any).records.slice(0, 10) : [],
      queueTotal: (queue as any).totalRecords ?? 0,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
