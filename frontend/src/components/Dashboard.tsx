import { useCallback, useEffect, useRef, useState } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import { WidgetConfig, Integration, AppConfig } from '../types';
import { WidgetShell } from './WidgetShell';
import { WidgetRenderer } from './WidgetRenderer';
import { api } from '../api';
import { getServiceMeta } from '../config/servicesMeta';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Map widget type prefix to integration type for meta lookup
function widgetIntegrationKey(type: string, integration?: Integration): string | undefined {
  if (integration) return integration.type;
  // For widgets without integrations, use the widget type prefix
  if (type === 'clock') return 'clock';
  if (type === 'welcome') return 'welcome';
  return undefined;
}

interface Props {
  widgets: WidgetConfig[];
  integrations: Integration[];
  config?: AppConfig;
  editing: boolean;
  gap?: number;
  gridCols?: number;
  rowHeight?: number;
  onWidgetsChange: (widgets: WidgetConfig[]) => void;
}

export function Dashboard({ widgets, integrations, config, editing, gap = 10, gridCols = 12, rowHeight = 80, onWidgetsChange }: Props) {
  const [gridWidth, setGridWidth] = useState(() => window.innerWidth - 32);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const onResize = () => setGridWidth(window.innerWidth - 32);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const layout: Layout[] = widgets.map((w) => ({
    i: w.id, x: w.x, y: w.y, w: w.w, h: w.h, minW: 2, minH: 2,
  }));

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    const updated = widgets.map((w) => {
      const l = newLayout.find((n) => n.i === w.id);
      return l ? { ...w, x: l.x, y: l.y, w: l.w, h: l.h } : w;
    });
    onWidgetsChange(updated);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api.saveLayout(updated).catch(console.error);
    }, 800);
  }, [widgets, onWidgetsChange]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.deleteWidget(id);
      onWidgetsChange(widgets.filter((w) => w.id !== id));
    } catch (e) {
      console.error('Failed to delete widget:', e);
    }
  }, [widgets, onWidgetsChange]);

  if (widgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 animate-fade-in">
        <div className="text-5xl opacity-20">⬜</div>
        <div className="text-tx-muted text-sm text-center">
          No widgets yet —{' '}
          <span style={{ color: 'rgb(var(--color-blue))' }}>Edit Layout</span>{' '}
          then{' '}
          <span style={{ color: 'rgb(var(--color-accent))' }}>+ Add Widget</span>{' '}
          to get started.
        </div>
      </div>
    );
  }

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={gridCols}
      rowHeight={rowHeight}
      width={gridWidth}
      isDraggable={editing}
      isResizable={editing}
      draggableHandle=".drag-handle"
      onLayoutChange={handleLayoutChange}
      margin={[gap, gap]}
    >
      {widgets.map((widget) => {
        const integration = integrations.find((i) => i.id === widget.integrationId);
        const metaKey = widgetIntegrationKey(widget.type, integration);
        const meta = getServiceMeta(metaKey);

        return (
          <div key={widget.id}>
            <WidgetShell
              title={widget.title}
              serviceIcon={meta?.icon}
              serviceColor={meta?.color}
              serviceSubtitle={integration ? meta?.label : undefined}
              editing={editing}
              onDelete={() => handleDelete(widget.id)}
            >
              <WidgetRenderer widget={widget} integrations={integrations} config={config} />
            </WidgetShell>
          </div>
        );
      })}
    </GridLayout>
  );
}
