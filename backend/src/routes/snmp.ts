import { Router } from 'express';
import { snmpSummary } from '../services/snmp.js';

export const snmpRouter = Router();

snmpRouter.get('/:id/summary', async (req, res) => {
  try {
    const data = await snmpSummary(req.params.id);
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
