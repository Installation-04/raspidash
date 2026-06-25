import { Router } from 'express';
import { loadConfig } from '../store.js';

export const qbittorrentRouter = Router();

async function qbtFetch(id: string, path: string, opts?: RequestInit) {
  const config = loadConfig();
  const integration = config.integrations.find(i => i.id === id);
  if (!integration) throw new Error('Integration not found');
  const base = integration.url.replace(/\/$/, '');
  const res = await fetch(`${base}${path}`, opts);
  if (!res.ok) throw new Error(`qBittorrent error ${res.status}`);
  return res.json();
}

qbittorrentRouter.get('/:id/summary', async (req, res) => {
  try {
    const config = loadConfig();
    const integration = config.integrations.find(i => i.id === req.params.id);
    if (!integration) return res.status(404).json({ error: 'Not found' });
    const base = integration.url.replace(/\/$/, '');

    // Login first
    const loginRes = await fetch(`${base}/api/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(integration.username ?? '')}&password=${encodeURIComponent((integration as any).password ?? '')}`,
    });
    const cookie = loginRes.headers.get('set-cookie') ?? '';

    const [torrents, transferInfo] = await Promise.all([
      fetch(`${base}/api/v2/torrents/info`, { headers: { Cookie: cookie } }).then(r => r.json()),
      fetch(`${base}/api/v2/transfer/info`, { headers: { Cookie: cookie } }).then(r => r.json()),
    ]);

    const list = Array.isArray(torrents) ? torrents : [];
    res.json({
      torrents: list.slice(0, 10),
      downloading: list.filter((t: any) => t.state === 'downloading').length,
      seeding: list.filter((t: any) => t.state === 'seeding').length,
      total: list.length,
      dlSpeed: transferInfo?.dl_info_speed ?? 0,
      ulSpeed: transferInfo?.up_info_speed ?? 0,
      totalSize: list.reduce((acc: number, t: any) => acc + (t.size ?? 0), 0),
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
