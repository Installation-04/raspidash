import { COLOR_SLOTS, getTheme, hexToRgb, rgbToHex } from '../../themes';

interface Props {
  themeId: string;
  customColors: Record<string, string>;
  onChange: (colors: Record<string, string>) => void;
  onReset: () => void;
}

export function ColorsTab({ themeId, customColors, onChange, onReset }: Props) {
  const base = getTheme(themeId);
  const hasOverrides = Object.keys(customColors).length > 0;

  const getHex = (key: string): string => {
    // customColors stores hex values
    if (customColors[key]) return customColors[key];
    return rgbToHex(base.vars[key] || '128 128 128');
  };

  const handleChange = (key: string, hex: string) => {
    onChange({ ...customColors, [key]: hex });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-tx-muted uppercase tracking-wider font-medium">Custom Colors</div>
        {hasOverrides && (
          <button onClick={onReset} className="text-xs text-accent-red hover:underline">
            Reset to theme defaults
          </button>
        )}
      </div>
      <div className="text-xs text-tx-muted">
        Overrides the selected theme. Changes apply instantly.
      </div>
      <div className="flex flex-col gap-2">
        {COLOR_SLOTS.map(({ key, label }) => {
          const hex = getHex(key);
          const isOverridden = !!customColors[key];
          return (
            <div key={key} className="flex items-center gap-3">
              <label className="relative cursor-pointer">
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-8 h-8 rounded-lg border-2 cursor-pointer appearance-none overflow-hidden"
                  style={{ borderColor: isOverridden ? 'rgb(var(--color-accent))' : 'rgb(var(--color-bg-border))' }}
                />
              </label>
              <div className="flex-1">
                <div className={`text-sm ${isOverridden ? 'text-tx' : 'text-tx-muted'}`}>{label}</div>
                <div className="text-xs text-tx-muted font-mono">{hex}</div>
              </div>
              {isOverridden && (
                <button
                  className="text-xs text-tx-muted hover:text-accent-red"
                  onClick={() => {
                    const next = { ...customColors };
                    delete next[key];
                    onChange(next);
                  }}
                >
                  ↩
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
