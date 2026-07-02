import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { settingsRouter } from './routes/settings.js';
import { proxmoxRouter } from './routes/proxmox.js';
import { truenasRouter } from './routes/truenas.js';
import { piholeRouter } from './routes/pihole.js';
import { haRouter } from './routes/homeassistant.js';
import { portainerRouter } from './routes/portainer.js';
import { jellyfinRouter } from './routes/jellyfin.js';
import { ukRouter } from './routes/uptimekuma.js';
import { agRouter } from './routes/adguard.js';
import { sonarrRouter } from './routes/sonarr.js';
import { radarrRouter } from './routes/radarr.js';
import { speedtestRouter } from './routes/speedtest.js';
import { ncRouter } from './routes/nextcloud.js';
import { giteaRouter } from './routes/gitea.js';
import { uniRouter } from './routes/unifi.js';
import { npmRouter } from './routes/nginxpm.js';
import { plexRouter } from './routes/plex.js';
import { grafanaRouter } from './routes/grafana.js';
import { overseerrRouter } from './routes/overseerr.js';
import { qbittorrentRouter } from './routes/qbittorrent.js';
import { sabnzbdRouter } from './routes/sabnzbd.js';
import { immichRouter } from './routes/immich.js';
import { synologyRouter } from './routes/synology.js';
import { prowlarrRouter } from './routes/prowlarr.js';
import { lidarrRouter } from './routes/lidarr.js';
import { bazarrRouter } from './routes/bazarr.js';
import { cockpitRouter } from './routes/cockpit.js';
import { snmpRouter } from './routes/snmp.js';
import { systemRouter } from './routes/system.js';
import { weatherRouter } from './routes/weather.js';
import { startPolling } from './services/poller.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const allowedOrigin = process.env.CORS_ORIGIN;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : {}));
app.use(express.json({ limit: '10mb' }));

app.use('/api/settings', settingsRouter);
app.use('/api/proxmox', proxmoxRouter);
app.use('/api/truenas', truenasRouter);
app.use('/api/pihole', piholeRouter);
app.use('/api/ha', haRouter);
app.use('/api/portainer', portainerRouter);
app.use('/api/jellyfin', jellyfinRouter);
app.use('/api/uptimekuma', ukRouter);
app.use('/api/adguard', agRouter);
app.use('/api/sonarr', sonarrRouter);
app.use('/api/radarr', radarrRouter);
app.use('/api/speedtest', speedtestRouter);
app.use('/api/nextcloud', ncRouter);
app.use('/api/gitea', giteaRouter);
app.use('/api/unifi', uniRouter);
app.use('/api/nginxpm', npmRouter);
app.use('/api/plex', plexRouter);
app.use('/api/grafana', grafanaRouter);
app.use('/api/overseerr', overseerrRouter);
app.use('/api/qbittorrent', qbittorrentRouter);
app.use('/api/sabnzbd', sabnzbdRouter);
app.use('/api/immich', immichRouter);
app.use('/api/synology', synologyRouter);
app.use('/api/prowlarr', prowlarrRouter);
app.use('/api/lidarr', lidarrRouter);
app.use('/api/bazarr', bazarrRouter);
app.use('/api/cockpit', cockpitRouter);
app.use('/api/snmp', snmpRouter);
app.use('/api/system', systemRouter);
app.use('/api/weather', weatherRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'connected' }));
});

export function broadcast(data: unknown) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(msg);
  });
}

const PORT = process.env.PORT || 7532;
server.listen(PORT, () => {
  console.log(`Raspidash backend running on port ${PORT}`);
  startPolling();
});
