import { Router } from 'express';
import { uniFetch } from '../services/unifi.js';

export const uniRouter = Router();

uniRouter.get('/:id/summary', async (req, res) => {
  try {
    const site = (req.query.site as string) || 'default';
    const [clients, devices] = await Promise.all([
      uniFetch(req.params.id, `/proxy/network/api/s/${site}/stat/sta`).catch(() => ({ data: [] })),
      uniFetch(req.params.id, `/proxy/network/api/s/${site}/stat/device`).catch(() => ({ data: [] })),
    ]);
    const c = Array.isArray(clients?.data) ? clients.data : [];
    const d = Array.isArray(devices?.data) ? devices.data : [];
    res.json({
      clients: c.length,
      wired: c.filter((x: any) => x.is_wired).length,
      wireless: c.filter((x: any) => !x.is_wired).length,
      devices: d.length,
      devicesOnline: d.filter((x: any) => x.state === 1).length,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
