import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { AppConfig } from '../types';
import { SERVICES_META } from '../config/servicesMeta';

interface Props {
  config: AppConfig;
  onClose: () => void;
  onOpenSettings: () => void;
}

interface Result {
  id: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

export function Spotlight({ config, onClose, onOpenSettings }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results: Result[] = [];

  // Integrations
  for (const int of config.integrations) {
    const meta = SERVICES_META[int.type];
    const label = int.name;
    const sub   = `${int.type} · ${int.url}`;
    if (!query || label.toLowerCase().includes(query.toLowerCase()) || int.type.includes(query.toLowerCase())) {
      results.push({
        id: int.id,
        label,
        sub,
        icon: meta?.icon ?? '🔌',
        color: meta?.color ?? '#888',
        action: () => { window.open(int.url, '_blank'); onClose(); },
      });
    }
  }

  // Settings shortcut
  if (!query || 'settings'.includes(query.toLowerCase())) {
    results.push({
      id: '__settings',
      label: 'Open Settings',
      sub: 'Integrations, themes, display options',
      icon: '⚙️',
      color: '#888',
      action: () => { onOpenSettings(); onClose(); },
    });
  }

  const clamped = Math.min(selected, Math.max(0, results.length - 1));

  useEffect(() => { setSelected(0); }, [query]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && results[clamped]) { results[clamped].action(); }
    if (e.key === 'Escape') onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-24"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'rgb(var(--color-bg-card))', border: '1px solid rgb(var(--color-bg-border))' }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'rgb(var(--color-bg-border))' }}>
          <Search size={16} style={{ color: 'rgb(var(--color-text-muted))' }} />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-sm text-tx placeholder:text-tx-muted"
            placeholder="Search integrations, settings…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono"
            style={{ background: 'rgb(var(--color-bg-border) / 0.5)', color: 'rgb(var(--color-text-muted))' }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-auto py-1">
          {results.length === 0 && (
            <div className="text-center text-sm py-8" style={{ color: 'rgb(var(--color-text-muted))' }}>
              No results for "{query}"
            </div>
          )}
          {results.map((r, i) => (
            <button
              key={r.id}
              onClick={r.action}
              onMouseEnter={() => setSelected(i)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
              style={{ background: i === clamped ? 'rgb(var(--color-accent) / 0.12)' : 'transparent' }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                style={{ background: r.color + '22', color: r.color }}>
                {r.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-tx truncate">{r.label}</div>
                <div className="text-xs truncate" style={{ color: 'rgb(var(--color-text-muted))' }}>{r.sub}</div>
              </div>
              {i === clamped && (
                <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0"
                  style={{ background: 'rgb(var(--color-accent) / 0.2)', color: 'rgb(var(--color-accent))' }}>
                  ↵
                </kbd>
              )}
            </button>
          ))}
        </div>

        <div className="px-4 py-2 border-t text-[10px] flex gap-3" style={{ borderColor: 'rgb(var(--color-bg-border))', color: 'rgb(var(--color-text-muted))' }}>
          <span>↑↓ navigate</span><span>↵ open</span><span>ESC close</span>
        </div>
      </div>
    </div>
  );
}
