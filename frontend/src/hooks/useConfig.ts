import { useState, useEffect } from 'react';
import { AppConfig } from '../types';
import { api } from '../api';

const DEFAULT_CONFIG: AppConfig = {
  integrations: [],
  widgets: [
    { id: 'default-clock', type: 'clock', title: 'Clock', x: 0, y: 0, w: 3, h: 2 },
    { id: 'default-welcome', type: 'welcome', title: 'Welcome', x: 3, y: 0, w: 5, h: 3 },
  ],
  themeId: 'dark',
  customColors: {},
  refreshInterval: 30,
};

export function useConfig() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    try {
      const data = await api.getConfig();
      setConfig(data);
    } catch {
      // backend not yet available (dev mode without backend)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  return { config, setConfig, loading, reload };
}
