import { Router } from 'express';
import { loadConfig } from '../store.js';
import { proxmoxFetch } from '../services/proxmox.js';

export const proxmoxRouter = Router();

proxmoxRouter.get('/:integrationId/nodes', async (req, res) => {
  try {
    const data = await proxmoxFetch(req.params.integrationId, '/nodes');
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

proxmoxRouter.get('/:integrationId/nodes/:node/status', async (req, res) => {
  try {
    const data = await proxmoxFetch(
      req.params.integrationId,
      `/nodes/${req.params.node}/status`
    );
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

proxmoxRouter.get('/:integrationId/nodes/:node/vms', async (req, res) => {
  try {
    const [qemu, lxc] = await Promise.all([
      proxmoxFetch(req.params.integrationId, `/nodes/${req.params.node}/qemu`),
      proxmoxFetch(req.params.integrationId, `/nodes/${req.params.node}/lxc`),
    ]);
    const vms = [
      ...((qemu.data || []) as any[]).map((v: any) => ({ ...v, type: 'qemu' })),
      ...((lxc.data || []) as any[]).map((v: any) => ({ ...v, type: 'lxc' })),
    ];
    res.json({ data: vms });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

proxmoxRouter.get('/:integrationId/summary', async (req, res) => {
  try {
    const config = loadConfig();
    const integration = config.integrations.find((i) => i.id === req.params.integrationId);
    if (!integration) return res.status(404).json({ error: 'Integration not found' });

    const nodesData = await proxmoxFetch(req.params.integrationId, '/nodes');
    const nodes = nodesData.data || [];

    const details = await Promise.all(
      nodes.map(async (node: any) => {
        const [status, vms] = await Promise.all([
          proxmoxFetch(req.params.integrationId, `/nodes/${node.node}/status`).catch(() => ({ data: {} })),
          Promise.all([
            proxmoxFetch(req.params.integrationId, `/nodes/${node.node}/qemu`).catch(() => ({ data: [] })),
            proxmoxFetch(req.params.integrationId, `/nodes/${node.node}/lxc`).catch(() => ({ data: [] })),
          ]),
        ]);
        return {
          node: node.node,
          status: node.status,
          cpu: status.data?.cpu ?? node.cpu,
          maxcpu: status.data?.maxcpu ?? node.maxcpu,
          mem: status.data?.memory?.used ?? node.mem,
          maxmem: status.data?.memory?.total ?? node.maxmem,
          uptime: node.uptime,
          vms: [
            ...((vms[0].data || []) as any[]).map((v: any) => ({ ...v, type: 'qemu' })),
            ...((vms[1].data || []) as any[]).map((v: any) => ({ ...v, type: 'lxc' })),
          ],
        };
      })
    );

    res.json({ name: integration.name, nodes: details });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
