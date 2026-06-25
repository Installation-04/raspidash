import { Router } from 'express';
import { loadConfig } from '../store.js';

export const synologyRouter = Router();

synologyRouter.get('/:id/summary', async (req, res) => {
  try {
    const config = loadConfig();
    const integration = config.integrations.find(i => i.id === req.params.id);
    if (!integration) return res.status(404).json({ error: 'Not found' });
    const base = integration.url.replace(/\/$/, '');

    // Login to get session token
    const loginRes = await fetch(
      `${base}/webapi/auth.cgi?api=SYNO.API.Auth&version=3&method=login&account=${encodeURIComponent(integration.username ?? '')}&passwd=${encodeURIComponent((integration as any).password ?? '')}&session=DashboardSession&format=cookie`,
    );
    const loginData = await loginRes.json();
    const sid = loginData?.data?.sid;
    if (!sid) throw new Error('Synology login failed');

    const [utilization, info] = await Promise.all([
      fetch(`${base}/webapi/entry.cgi?api=SYNO.Core.System.Utilization&version=1&method=get&_sid=${sid}`).then(r => r.json()),
      fetch(`${base}/webapi/entry.cgi?api=SYNO.DSM.Info&version=2&method=getinfo&_sid=${sid}`).then(r => r.json()),
    ]);

    const cpu = utilization?.data?.cpu?.user_load ?? 0;
    const mem = utilization?.data?.memory ?? {};

    res.json({
      cpu: cpu / 100,
      usedMem: (mem.real_usage ?? 0) * 1024 * 1024,
      totalMem: (mem.avail_real ?? 0) * 1024 * 1024,
      uptime: info?.data?.uptime ?? 0,
      hostname: info?.data?.hostname ?? '',
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
