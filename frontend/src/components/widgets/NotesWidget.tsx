import { useState, useEffect, useRef } from 'react';
import { WidgetConfig } from '../../types';
import { api } from '../../api';

interface Props {
  widget: WidgetConfig;
}

export function NotesWidget({ widget }: Props) {
  const [text, setText] = useState<string>((widget.options?.note as string) ?? '');
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setText((widget.options?.note as string) ?? '');
  }, [widget.id]);

  function handleChange(val: string) {
    setText(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await api.updateWidget(widget.id, { options: { ...widget.options, note: val } });
      } catch {}
      setSaving(false);
    }, 800);
  }

  return (
    <div className="flex-1 flex flex-col relative">
      <textarea
        className="flex-1 w-full resize-none bg-transparent text-sm outline-none leading-relaxed"
        style={{ color: 'rgb(var(--color-text))', caretColor: 'rgb(var(--color-accent))' }}
        placeholder="Write notes here…"
        value={text}
        onChange={(e) => handleChange(e.target.value)}
      />
      {saving && (
        <span className="absolute bottom-0 right-0 text-[10px] px-1"
          style={{ color: 'rgb(var(--color-text-muted))' }}>saving…</span>
      )}
    </div>
  );
}
