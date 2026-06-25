import { Router } from 'express';
import { portainerFetch } from '../services/portainer.js';

export const portainerRouter = Router();

portainerRouter.get('/:integrationId/endpoints', async (req, res) => {
  try {
    const data = await portainerFetch(req.params.integrationId, '/endpoints');
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

portainerRouter.get('/:integrationId/summary', async (req, res) => {
  try {
    const endpoints = await portainerFetch(req.params.integrationId, '/endpoints') as any[];
    const results = await Promise.all(
      endpoints.map(async (ep: any) => {
        try {
          const containers = await portainerFetch(
            req.params.integrationId,
            `/endpoints/${ep.Id}/docker/containers/json?all=true`
          ) as any[];
          return {
            id: ep.Id,
            name: ep.Name,
            status: ep.Status,
            url: ep.URL,
            containers: {
              total: containers.length,
              running: containers.filter((c: any) => c.State === 'running').length,
              stopped: containers.filter((c: any) => c.State === 'exited').length,
              list: containers.slice(0, 20).map((c: any) => ({
                id: c.Id.slice(0, 12),
                name: (c.Names?.[0] || '').replace(/^\//, ''),
                image: c.Image,
                state: c.State,
                status: c.Status,
              })),
            },
          };
        } catch {
          return { id: ep.Id, name: ep.Name, status: ep.Status, containers: null };
        }
      })
    );
    res.json(results);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
