import { Router } from 'express';
import { npmFetch } from '../services/nginxpm.js';

export const npmRouter = Router();

npmRouter.get('/:id/summary', async (req, res) => {
  try {
    const [hosts, streams, redirs] = await Promise.all([
      npmFetch(req.params.id, '/nginx/proxy-hosts'),
      npmFetch(req.params.id, '/nginx/streams').catch(() => []),
      npmFetch(req.params.id, '/nginx/redirection-hosts').catch(() => []),
    ]);
    const h = Array.isArray(hosts) ? hosts : [];
    res.json({
      proxyHosts: h,
      totalHosts: h.length,
      enabledHosts: h.filter((x: any) => x.enabled).length,
      sslHosts: h.filter((x: any) => x.ssl?.enabled || x.certificate_id > 0).length,
      streams: Array.isArray(streams) ? streams.length : 0,
      redirects: Array.isArray(redirs) ? redirs.length : 0,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
