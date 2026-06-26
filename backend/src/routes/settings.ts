import { Router } from 'express';
import { loadConfig, saveConfig } from '../store.js';
import { randomUUID } from 'crypto';

export const settingsRouter = Router();

settingsRouter.get('/', (_req, res) => {
  const config = loadConfig();
  // strip passwords from integrations for GET
  const safe = {
    ...config,
    integrations: config.integrations.map(({ password: _p, apiKey: _k, ...rest }) => rest),
  };
  res.json(safe);
});

settingsRouter.get('/full', (_req, res) => {
  res.json(loadConfig());
});

settingsRouter.put('/theme', (req, res) => {
  const config = loadConfig();
  (config as any).themeId = req.body.themeId ?? req.body.theme ?? 'dark';
  saveConfig(config);
  res.json({ ok: true });
});

settingsRouter.put('/colors', (req, res) => {
  const config = loadConfig();
  (config as any).customColors = req.body.customColors ?? {};
  saveConfig(config);
  res.json({ ok: true });
});

settingsRouter.put('/refresh', (req, res) => {
  const config = loadConfig();
  config.refreshInterval = req.body.refreshInterval;
  saveConfig(config);
  res.json({ ok: true });
});

settingsRouter.put('/general', (req, res) => {
  const config = loadConfig();
  const allowed = [
    'dashboardTitle', 'temperatureUnit', 'dateFormat', 'timeFormat',
    'language', 'timezone', 'widgetBorderRadius', 'widgetGap',
    'showWidgetTitles', 'showLastUpdated', 'animationsEnabled',
    'glassmorphismIntensity', 'compactMode', 'startupWidget',
    'backgroundStyle', 'fontFamily',
    'screenPreset', 'gridCols', 'rowHeight', 'uiScale', 'touchMode',
    'overscanCompensation', 'hideScrollbars', 'highContrast', 'cursorHidden',
    'backgroundImage', 'backgroundOverlayOpacity',
  ];
  for (const key of allowed) {
    if (req.body[key] !== undefined) (config as any)[key] = req.body[key];
  }
  saveConfig(config);
  res.json({ ok: true });
});

settingsRouter.put('/layout', (req, res) => {
  const config = loadConfig();
  config.widgets = req.body.widgets;
  saveConfig(config);
  res.json({ ok: true });
});

// Integrations CRUD
settingsRouter.post('/integrations', (req, res) => {
  const config = loadConfig();
  const integration = { id: randomUUID(), ...req.body };
  config.integrations.push(integration);
  saveConfig(config);
  res.json(integration);
});

settingsRouter.put('/integrations/:id', (req, res) => {
  const config = loadConfig();
  const idx = config.integrations.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  config.integrations[idx] = { ...config.integrations[idx], ...req.body };
  saveConfig(config);
  res.json(config.integrations[idx]);
});

settingsRouter.delete('/integrations/:id', (req, res) => {
  const config = loadConfig();
  config.integrations = config.integrations.filter((i) => i.id !== req.params.id);
  saveConfig(config);
  res.json({ ok: true });
});

// Widgets CRUD
settingsRouter.post('/widgets', (req, res) => {
  const config = loadConfig();
  const widget = { id: randomUUID(), ...req.body };
  config.widgets.push(widget);
  saveConfig(config);
  res.json(widget);
});

settingsRouter.put('/widgets/:id', (req, res) => {
  const config = loadConfig();
  const idx = config.widgets.findIndex((w) => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  config.widgets[idx] = { ...config.widgets[idx], ...req.body };
  saveConfig(config);
  res.json(config.widgets[idx]);
});

settingsRouter.delete('/widgets/:id', (req, res) => {
  const config = loadConfig();
  config.widgets = config.widgets.filter((w) => w.id !== req.params.id);
  saveConfig(config);
  res.json({ ok: true });
});

// Backup — full config as downloadable JSON (includes credentials)
settingsRouter.get('/backup', (_req, res) => {
  const config = loadConfig();
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="raspidash-backup-${timestamp}.json"`);
  res.json(config);
});

// Restore — replace entire config from uploaded JSON
settingsRouter.post('/restore', (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || !Array.isArray(body.integrations) || !Array.isArray(body.widgets)) {
    return res.status(400).json({ error: 'Invalid backup file — missing integrations or widgets arrays' });
  }
  saveConfig(body);
  res.json({ ok: true, integrations: body.integrations.length, widgets: body.widgets.length });
});
