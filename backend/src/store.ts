import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = process.env.DATA_PATH || join(__dirname, '../../data/config.json');

export interface Integration {
  id: string;
  type: string;
  name: string;
  url: string;
  username?: string;
  password?: string;
  apiKey?: string;
  insecure?: boolean;
  options?: Record<string, string>;
}

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  integrationId?: string;
  options?: Record<string, unknown>;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AppConfig {
  integrations: Integration[];
  widgets: WidgetConfig[];
  theme: 'dark' | 'light';
  refreshInterval: number;
}

const DEFAULT_CONFIG: AppConfig = {
  integrations: [],
  widgets: [
    { id: 'default-clock', type: 'clock', title: 'Clock', x: 0, y: 0, w: 3, h: 2 },
    { id: 'default-welcome', type: 'welcome', title: 'Welcome', x: 3, y: 0, w: 4, h: 3 },
  ],
  theme: 'dark',
  refreshInterval: 30,
};

export function loadConfig(): AppConfig {
  try {
    if (existsSync(DATA_PATH)) {
      return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
    }
  } catch {
    console.warn('Could not load config, using defaults');
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(config: AppConfig): void {
  mkdirSync(dirname(DATA_PATH), { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify(config, null, 2));
}
