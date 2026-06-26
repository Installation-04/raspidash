import { useEffect, useRef, useCallback } from 'react';

type MessageHandler = (data: any) => void;

export function useWebSocket(onMessage: MessageHandler) {
  const ws = useRef<WebSocket | null>(null);
  const handler = useRef(onMessage);
  const retryCount = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout>>();
  const unmounted = useRef(false);
  handler.current = onMessage;

  const connect = useCallback(() => {
    if (unmounted.current) return;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${protocol}://${window.location.host}/ws`;
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      retryCount.current = 0;
    };

    ws.current.onmessage = (e) => {
      try {
        handler.current(JSON.parse(e.data));
      } catch {}
    };

    ws.current.onclose = () => {
      if (unmounted.current) return;
      // Exponential backoff with jitter: base 3s, max 30s
      const base = Math.min(3000 * 2 ** retryCount.current, 30000);
      const delay = base + Math.random() * 3000;
      retryCount.current += 1;
      retryTimer.current = setTimeout(connect, delay);
    };

    ws.current.onerror = () => {
      ws.current?.close();
    };
  }, []);

  useEffect(() => {
    unmounted.current = false;
    connect();
    return () => {
      unmounted.current = true;
      clearTimeout(retryTimer.current);
      ws.current?.close();
    };
  }, [connect]);
}
