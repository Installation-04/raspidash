import { Router } from 'express';
import { haFetch } from '../services/homeassistant.js';

export const haRouter = Router();

haRouter.get('/:integrationId/states', async (req, res) => {
  try {
    const data = await haFetch(req.params.integrationId, '/states');
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

haRouter.get('/:integrationId/summary', async (req, res) => {
  try {
    const [states, config] = await Promise.all([
      haFetch(req.params.integrationId, '/states'),
      haFetch(req.params.integrationId, '/config'),
    ]);
    const entities = Array.isArray(states) ? states : [];
    const summary = {
      locationName: (config as any).location_name,
      version: (config as any).version,
      totalEntities: entities.length,
      domains: {} as Record<string, number>,
      alerts: entities.filter((e: any) =>
        e.entity_id.startsWith('alert.') || (e.entity_id.startsWith('binary_sensor.') && e.state === 'on')
      ).length,
    };
    for (const entity of entities) {
      const domain = entity.entity_id.split('.')[0];
      summary.domains[domain] = (summary.domains[domain] || 0) + 1;
    }
    res.json(summary);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

haRouter.get('/:integrationId/entities', async (req, res) => {
  try {
    const domain = req.query.domain as string | undefined;
    const states = await haFetch(req.params.integrationId, '/states');
    const entities = Array.isArray(states) ? states : [];
    const filtered = domain ? entities.filter((e: any) => e.entity_id.startsWith(`${domain}.`)) : entities;
    res.json(filtered.slice(0, 50));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
