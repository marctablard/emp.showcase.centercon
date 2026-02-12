/**
 * Server-side event bus for API debug events.
 * Used to relay upstream API request/response info to the browser via SSE.
 *
 * DEV ONLY — the bus is a no-op singleton in production.
 */

type DebugEventListener = (event: ApiDebugEvent) => void;

export interface ApiDebugEvent {
  /** Unique request identifier */
  id: string;
  /** ISO timestamp */
  timestamp: string;
  /** HTTP method */
  method: string;
  /** Upstream URL (masked if sensitive) */
  url: string;
  /** HTTP status code */
  status?: number;
  /** Response headers (masked if sensitive) */
  responseHeaders?: Record<string, string>;
  /** Response body text */
  responseBody?: string;
  /** Request payload (masked/truncated if sensitive) */
  requestBody?: string;
  /** Duration in ms */
  duration?: number;
  /** Log prefix (e.g., [PROD-02de]) */
  prefix?: string;
  /** Whether this was an error response (status >= 400) */
  isError?: boolean;
}

const isDev = process.env.NODE_ENV === 'development';

/** Maximum number of recent events to buffer for replay on new SSE connections */
const REPLAY_BUFFER_SIZE = 50;

class DebugEventBus {
  private listeners = new Set<DebugEventListener>();
  private recentEvents: ApiDebugEvent[] = [];

  /**
   * Subscribe to debug events.
   * Returns an unsubscribe function.
   */
  subscribe(listener: DebugEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit a debug event to all subscribers and buffer it for replay.
   * Events are always buffered so SSR calls (which happen before any
   * browser connects) can be replayed when the EventSource connects.
   * No-op in production.
   */
  emit(event: ApiDebugEvent): void {
    if (!isDev) return;

    // Always buffer — SSR events happen before any browser connects
    this.recentEvents.push(event);
    if (this.recentEvents.length > REPLAY_BUFFER_SIZE) {
      this.recentEvents.shift();
    }

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // Swallow errors in listeners to avoid affecting the main flow
      }
    }
  }

  /**
   * Get buffered events for replay on new SSE connections.
   */
  getRecentEvents(): ApiDebugEvent[] {
    return [...this.recentEvents];
  }

  /** Number of active subscribers (for diagnostics) */
  get subscriberCount(): number {
    return this.listeners.size;
  }
}

/**
 * Singleton debug event bus.
 * Uses globalThis to ensure a single instance across all Next.js server contexts
 * (RSC layer, API routes, middleware) — without this, Next.js dev mode may create
 * separate module instances for each layer, breaking the replay buffer.
 */
const globalForDebug = globalThis as typeof globalThis & { __debugEventBus?: DebugEventBus };

export const debugEventBus = (globalForDebug.__debugEventBus ??= new DebugEventBus());
