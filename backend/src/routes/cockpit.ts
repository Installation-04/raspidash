import { Router } from 'express';
import { loadConfig } from '../store.js';

export const cockpitRouter = Router();

// Cockpit doesn't have a REST API by default — we proxy basic system info
// via the Cockpit login API + channel protocol. As a fallback we return
// what we can derive from a simple authenticated ping.
cockpitRouter.get('/:id/summary', async (req, res) => {
  try {
    const config = loadConfig();
    const integration = config.integrations.find(i => i.id === req.params.id);
    if (!integration) return res.status(404).json({ error: 'Not found' });

    // Cockpit uses session-based auth; just confirm it's reachable
    const base = integration.url.replace(/\/$/, '');
    const loginRes = await fetch(`${base}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ superuser: 'try', login: integration.username ?? '', password: (integration as any).password ?? '' }),
    });

    if (!loginRes.ok) throw new Error(`Cockpit login failed: ${loginRes.status}`);

    // Return basic placeholder — Cockpit needs WebSocket channels for live metrics
    res.json({
      reachable: true,
      hostname: new URL(base).hostname,
      cpu: 0,
      usedMem: 0,
      totalMem: 0,
      uptime: 0,
      loadAvg: '–',
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
