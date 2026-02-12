'use client';

/* eslint-disable no-console -- This component intentionally logs to the browser console for DevTools debugging */
import { useEffect, useRef } from 'react';

interface ApiDebugEvent {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  requestBody?: string;
  duration?: number;
  prefix?: string;
  isError?: boolean;
}

// Style constants for console output
const STYLES = {
  method: 'color: #8be9fd; font-weight: bold',
  status2xx: 'color: #50fa7b; font-weight: bold',
  status4xx: 'color: #ffb86c; font-weight: bold',
  status5xx: 'color: #ff5555; font-weight: bold',
  url: 'color: #bd93f9',
  duration: 'color: #6272a4; font-style: italic',
  label: 'color: #f1fa8c; font-weight: bold',
  reset: '',
} as const;

function getStatusStyle(status?: number): string {
  if (!status) return STYLES.reset;
  if (status >= 500) return STYLES.status5xx;
  if (status >= 400) return STYLES.status4xx;
  return STYLES.status2xx;
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function logEventToConsole(event: ApiDebugEvent): void {
  const statusStyle = getStatusStyle(event.status);
  const durationStr = event.duration ? ` (${event.duration}ms)` : '';
  const prefixStr = event.prefix ? `${event.prefix} ` : '';
  const groupLabel = `%c⬆ API %c${event.method} %c${event.status ?? '?'} %c${prefixStr}${event.url}%c${durationStr}`;

  // Use groupCollapsed for non-errors, group for errors
  const groupFn = event.isError ? console.group : console.groupCollapsed;
  groupFn(groupLabel, STYLES.label, STYLES.method, statusStyle, STYLES.url, STYLES.duration);

  // Response headers
  if (event.responseHeaders && Object.keys(event.responseHeaders).length > 0) {
    console.groupCollapsed('%cResponse Headers', STYLES.label);
    console.table(event.responseHeaders);
    console.groupEnd();
  }

  // Response body — try to pretty-print as JSON
  if (event.responseBody) {
    const parsed = tryParseJson(event.responseBody);
    if (parsed !== null) {
      console.groupCollapsed('%cResponse Body (JSON)', STYLES.label);
      console.dir(parsed, { depth: 10 });
      console.groupEnd();
    } else {
      console.groupCollapsed('%cResponse Body (text)', STYLES.label);
      console.log(event.responseBody);
      console.groupEnd();
    }
  }

  // Request body
  if (event.requestBody) {
    const parsed = tryParseJson(event.requestBody);
    if (parsed !== null) {
      console.groupCollapsed('%cRequest Body (JSON)', STYLES.label);
      console.dir(parsed, { depth: 10 });
      console.groupEnd();
    } else {
      console.groupCollapsed('%cRequest Body (text)', STYLES.label);
      console.log(event.requestBody);
      console.groupEnd();
    }
  }

  console.groupEnd();
}

/**
 * Invisible dev-only component that connects to the server-side debug
 * event stream (SSE) and pretty-prints upstream API calls in the
 * browser DevTools console.
 *
 * Renders nothing to the DOM.
 *
 * Enable by setting NEXT_PUBLIC_DEBUG_API_RESPONSE to any value other
 * than 'off' (e.g. STATUS, STATUS-BODY, FULL).
 */
export function ApiDebugPanel(): null {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only connect in development and when debug is enabled
    const debugResponse = (process.env.NEXT_PUBLIC_DEBUG_API_RESPONSE || 'off').toLowerCase();
    if (debugResponse === 'off') return;

    let isMounted = true;

    function connect(): void {
      if (!isMounted) return;

      const es = new EventSource('/api/debug/stream');
      eventSourceRef.current = es;

      es.addEventListener('connected', () => {
        console.log(
          '%c🔌 API Debug Stream connected — upstream API calls will appear here',
          'color: #50fa7b; font-weight: bold',
        );
      });

      es.addEventListener('debug', (e: MessageEvent) => {
        try {
          const event: ApiDebugEvent = JSON.parse(e.data);
          logEventToConsole(event);
        } catch {
          // Ignore malformed events
        }
      });

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        // Reconnect after 5 seconds
        if (isMounted) {
          reconnectTimerRef.current = setTimeout(connect, 5_000);
        }
      };
    }

    connect();

    return () => {
      isMounted = false;
      eventSourceRef.current?.close();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, []);

  return null;
}
