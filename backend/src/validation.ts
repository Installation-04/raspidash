import { AppConfig, Integration, WidgetConfig } from './store.js';

// Keys accepted by PUT /settings/general and preserved on restore
export const GENERAL_SETTING_KEYS = [
  'dashboardTitle', 'temperatureUnit', 'dateFormat', 'timeFormat',
  'language', 'timezone', 'widgetBorderRadius', 'widgetGap',
  'showWidgetTitles', 'showLastUpdated', 'animationsEnabled',
  'glassmorphismIntensity', 'compactMode', 'startupWidget',
  'backgroundStyle', 'fontFamily',
  'screenPreset', 'gridCols', 'rowHeight', 'uiScale', 'touchMode',
  'overscanCompensation', 'hideScrollbars', 'highContrast', 'cursorHidden',
  'backgroundImage', 'backgroundOverlayOpacity',
] as const;

const RESTORE_KEYS = new Set<string>([
  'integrations', 'widgets', 'theme', 'themeId', 'customColors', 'refreshInterval',
  ...GENERAL_SETTING_KEYS,
]);

export function validateRefreshInterval(value: unknown): number | null {
  const interval = Number(value);
  if (!Number.isFinite(interval) || interval < 5 || interval > 3600) return null;
  return interval;
}

function isValidIntegration(item: unknown): item is Integration {
  if (!item || typeof item !== 'object') return false;
  const i = item as Record<string, unknown>;
  return typeof i.id === 'string' && typeof i.type === 'string'
    && typeof i.name === 'string' && typeof i.url === 'string';
}

function isValidWidget(item: unknown): item is WidgetConfig {
  if (!item || typeof item !== 'object') return false;
  const w = item as Record<string, unknown>;
  return typeof w.id === 'string' && typeof w.type === 'string'
    && typeof w.x === 'number' && typeof w.y === 'number'
    && typeof w.w === 'number' && typeof w.h === 'number';
}

/**
 * Validates a restore payload and returns a config containing only known
 * keys with structurally valid integrations/widgets, or null if invalid.
 */
export function sanitizeRestorePayload(body: unknown): AppConfig | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const raw = body as Record<string, unknown>;
  if (!Array.isArray(raw.integrations) || !Array.isArray(raw.widgets)) return null;
  if (!raw.integrations.every(isValidIntegration) || !raw.widgets.every(isValidWidget)) return null;

  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (RESTORE_KEYS.has(key)) clean[key] = value;
  }
  if (validateRefreshInterval(clean.refreshInterval) === null) {
    clean.refreshInterval = 30;
  }
  return clean as unknown as AppConfig;
}
