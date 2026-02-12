import pino from 'pino';
import { getServerLoggerConfig } from '@/platform/core/config/logger-config';
import { type ApiDebugEvent, debugEventBus } from './debug-event-bus';

const isDev = process.env.NODE_ENV === 'development';

// ANSI color codes for terminal output (used only in dev)
const c = {
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  green: '\x1b[32m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
} as const;

/**
 * Colorizes a pretty-printed JSON string for terminal readability.
 * Keys → cyan, string values → yellow, numbers → magenta, booleans/null → green.
 * Only applied in dev mode (pino-pretty).
 */
function colorizeJson(prettyJson: string): string {
  if (!isDev) return prettyJson;
  return prettyJson
    .replace(/"([^"\\]*(?:\\.[^"\\]*)*)"\s*:/g, `${c.cyan}"$1"${c.reset}:`) // keys
    .replace(/:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g, `: ${c.yellow}"$1"${c.reset}`) // string values
    .replace(/:\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g, `: ${c.magenta}$1${c.reset}`) // numbers
    .replace(/:\s*(true|false|null)\b/g, `: ${c.green}$1${c.reset}`); // booleans/null
}

// Lazy-initialised pino child logger for API debug logging
let _debugLogger: pino.Logger | null = null;

// Track request start times for duration calculation (dev only)
const _requestTimestamps = new Map<string, number>();

/** Generate a short unique ID for correlating request/response events */
function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Returns a lazy-initialised pino child logger for API debug/request logging.
 * Exported for use by EmporixApiInvoker and EmporixOAuthApi.
 */
export function getDebugLogger(): pino.Logger {
  if (!_debugLogger) {
    _debugLogger = pino(getServerLoggerConfig()).child({ module: 'api-debug' });
  }
  return _debugLogger;
}

// Central definition for all sensitive keys (used for headers and query params)
const SENSITIVE_KEYS_NORMALIZED = new Set(['session', 'secret', 'password', 'token', 'auth', 'api', 'client']);

/**
 * Normalizes a key by removing separators and converting to lower case.
 * e.g., 'api-key' -> 'apikey', 'Session_Id' -> 'sessionid'
 */
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[-_]/g, '');
}

/**
 * Checks if a key is considered sensitive (after normalization)
 */
function isSensitiveKey(key: string): boolean {
  const normalizedKey = normalizeKey(key);
  return Array.from(SENSITIVE_KEYS_NORMALIZED).some((root) => normalizedKey.includes(root));
}

/**
 * Decides if sensitive data should be masked (prod or not verbose)
 */
function shouldMaskSensitive(): boolean {
  const debugCurlVerbose = process.env.NEXT_PUBLIC_DEBUG_API_VERBOSE === 'true';
  const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  return isProd || !debugCurlVerbose;
}

/**
 * Masks sensitive headers (e.g. token, password, client_secret, etc.)
 * @param headers The headers object to mask
 * @returns A new headers object with sensitive values replaced by ******
 */
function maskHeaders(headers: Record<string, any>): Record<string, any> {
  const masked: Record<string, any> = {};
  for (const [key, value] of Object.entries(headers)) {
    masked[key] = isSensitiveKey(key) ? '******' : value;
  }
  return masked;
}

/**
 * Masks sensitive query parameters in a URL (e.g. token, password, client_secret, etc.)
 * @param url The URL string to mask
 * @returns The URL with sensitive query parameter values replaced by ******
 */
function maskSensitiveQueryParams(url: string): string {
  try {
    const u = new URL(url, 'http://dummy'); // base needed for relative URLs
    for (const key of u.searchParams.keys()) {
      if (isSensitiveKey(key)) {
        u.searchParams.set(key, '******');
      }
    }
    return u.pathname + (u.search ? u.search : '');
  } catch {
    // Fallback: if URL can't be parsed, return placeholder
    return '<URL not parsable>';
  }
}

/**
 * Generates a descriptive prefix for logging, combining the URL's path
 * with a deterministic hash of the full URL.
 * @param url The URL string
 * @returns A string (e.g., 'PROD-02de') for use as a log prefix
 */
function getDebugPrefix(url: string): string {
  // 1. Calculate the hash (your original, reliable logic)
  let sum = 0;
  for (let i = 0; i < url.length; i++) sum += url.charCodeAt(i);
  const hash = sum.toString(36).padStart(4, '0').slice(-4);

  // 2. Try to get the path prefix
  let pathPrefix = 'URL_'; // Default fallback if parsing fails
  try {
    const u = new URL(url, '/dummy');
    const path = u.pathname.replace(/^\//, ''); // Remove leading '/'

    if (path.length === 0) {
      pathPrefix = 'ROOT'; // Special case for root path '/'
    } else {
      pathPrefix = path.substring(0, 4).toUpperCase();
    }
  } catch {
    // Parsing failed, keep 'URL_' as the prefix
  }

  // 3. Combine them and ensure uniform length
  // e.g., 'API' becomes 'API0'
  const finalPrefix = pathPrefix.padEnd(4, '0');

  return `${finalPrefix}-${hash}`;
}

/**
 * Builds a curl command for debugging purposes (not exported)
 * @param url The request URL
 * @param options The fetch options
 * @param maskSensitive Whether to mask sensitive data in headers and query params
 * @returns The curl command as a string
 */
function buildCurl(url: string, options: RequestInit, maskSensitive: boolean = true): string {
  const maskedUrl = maskSensitive ? maskSensitiveQueryParams(url) : url;
  const headers = options.headers || {};
  const usedHeaders = maskSensitive ? maskHeaders(headers) : headers;
  const headerString = Object.entries(usedHeaders)
    .map(([key, value]) => `-H '${key}: ${value}'`)
    .join(' ');
  const methodString = options.method ? `-X ${options.method}` : '';
  const bodyString = options.body ? `-d '${options.body}'` : '';
  return `curl -v ${methodString} ${headerString} ${bodyString} '${maskedUrl}'`;
}

/**
 * Checks if the current URL matches any of the debug endpoints configured in NEXT_PUBLIC_DEBUG_API_ENDPOINTS
 * If the env var is not set, all endpoints are logged.
 * @param url The request URL
 * @returns true if the URL should be logged
 */
function shouldLogEndpoint(url: string): boolean {
  const endpoints = (process.env.NEXT_PUBLIC_DEBUG_API_ENDPOINTS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (endpoints.length === 0) return true; // No filter set, log everything
  try {
    const u = new URL(url, 'http://dummy');
    const path = u.pathname.toLowerCase();
    return endpoints.some((endpoint) => path.includes(endpoint));
  } catch {
    // If URL can't be parsed, fallback: log everything
    return true;
  }
}

/**
 * Logs a curl command if debugging is enabled (reads environment variables directly).
 * In dev mode also records a start timestamp for duration calculation.
 * @param url Target URL
 * @param options Request options
 * @returns The log prefix used for this request
 */
export function buildAndLogCurl(url: string, options: RequestInit): string {
  const debugCurl = process.env.NEXT_PUBLIC_DEBUG_API_CURL === 'true';
  const maskSensitive = shouldMaskSensitive();
  let logPrefix = '';
  if (debugCurl) {
    if (!shouldLogEndpoint(url)) return '';
    logPrefix = `[${getDebugPrefix(url)}]`;
    getDebugLogger().debug(`${logPrefix} ${buildCurl(url, options, maskSensitive)}`);
  }
  // Track request start time for the SSE debug stream (always in dev — events are buffered for replay)
  if (isDev) {
    const requestId = generateRequestId();
    _requestTimestamps.set(`${(options.method || 'GET').toUpperCase()}:${url}`, Date.now());
    // Store the requestId so logResponse can correlate
    _requestTimestamps.set(`rid:${(options.method || 'GET').toUpperCase()}:${url}`, requestId as unknown as number);
  }
  return logPrefix;
}

/**
 * Logs a fetch Response according to NEXT_PUBLIC_DEBUG_RESPONSE config.
 * @param response The fetch Response object
 * @param url The request URL
 * @param requestOptions The original request options
 * @param prefix Optional log prefix
 */
export async function logResponse(
  response: Response,
  url: string,
  requestOptions: RequestInit,
  prefix?: string,
): Promise<void> {
  const maskSensitive = shouldMaskSensitive();
  const debugResponse = (process.env.NEXT_PUBLIC_DEBUG_API_RESPONSE || 'off').toLowerCase();
  if (debugResponse === 'off') return;
  if (!shouldLogEndpoint(url)) return;

  const status = response.status;
  const isError = status >= 400;
  const logger = getDebugLogger();
  const log = isError ? logger.error.bind(logger) : logger.debug.bind(logger);
  const method = (requestOptions.method || 'GET').toUpperCase();
  const maskedUrl = maskSensitive ? maskSensitiveQueryParams(url) : url;
  const logPrefix = prefix ? `${prefix} [${method} ${status}]` : `[${method} ${status}]`;

  // Build a human-readable, pretty-printed log message
  let message = `${logPrefix} ${maskedUrl}`;

  // --- 1. Handle Headers ---
  const needsHeaders = debugResponse === 'status-headers' || debugResponse === 'full';
  let responseHeaders: Record<string, string> | undefined;
  if (needsHeaders) {
    let headers = Object.fromEntries(response.headers.entries());
    if (maskSensitive) {
      headers = maskHeaders(headers);
    }
    responseHeaders = headers;
    const prettyHeaders = JSON.stringify(headers, null, 2).replace(/\n/g, '\n    ');
    message += `\n  ${c.dim}Headers:${c.reset} ${colorizeJson(prettyHeaders)}`;
  }

  // --- 2. Handle Body (read once — the caller will consume the original, making re-clone impossible) ---
  const needsBody = debugResponse.startsWith('status-body') || debugResponse === 'full';
  let bodyText: string | undefined;
  if (needsBody) {
    try {
      bodyText = await response.clone().text();

      if (debugResponse.startsWith('status-body-')) {
        const limit = parseInt(debugResponse.split('-')[2], 10) || 200;
        message += `\n  Body (max ${limit} chars): ${bodyText.slice(0, limit)}`;
      } else {
        // Pretty-print JSON bodies; fall back to raw text for non-JSON
        try {
          const parsed = JSON.parse(bodyText);
          const prettyBody = JSON.stringify(parsed, null, 2).replace(/\n/g, '\n    ');
          message += `\n  ${c.dim}Body:${c.reset} ${colorizeJson(prettyBody)}`;
        } catch {
          message += `\n  ${c.dim}Body:${c.reset} ${bodyText}`;
        }
      }
    } catch (err) {
      message += `\n  Body error: ${err}`;
    }
  }

  // --- 3. Final Log ---
  log(message);

  // --- 4. Emit to browser debug stream (dev only, always — events are buffered for replay) ---
  if (isDev) {
    const tsKey = `${method}:${url}`;
    const ridKey = `rid:${tsKey}`;
    const startTime = _requestTimestamps.get(tsKey);
    const requestId = _requestTimestamps.get(ridKey);
    _requestTimestamps.delete(tsKey);
    _requestTimestamps.delete(ridKey);

    // Reuse headers from section 1, or compute them for the SSE event
    if (!responseHeaders && debugResponse !== 'status') {
      let hdrs = Object.fromEntries(response.headers.entries());
      if (maskSensitive) hdrs = maskHeaders(hdrs);
      responseHeaders = hdrs;
    }

    const event: ApiDebugEvent = {
      id: requestId ? String(requestId) : generateRequestId(),
      timestamp: new Date().toISOString(),
      method,
      url: maskedUrl,
      status,
      responseHeaders,
      responseBody: bodyText,
      duration: startTime ? Date.now() - startTime : undefined,
      prefix: prefix || undefined,
      isError,
    };
    debugEventBus.emit(event);
  }
}

/**
 * Logs the request payload when NEXT_DEBUG_API_PAYLOAD is enabled.
 * Only logs for methods that typically have a body (POST, PUT, PATCH).
 * @param url Target URL
 * @param options Request options
 * @param prefix Optional log prefix
 */
export function logRequestPayload(url: string, options: RequestInit, prefix: string): void {
  const debugPayload = process.env.NEXT_DEBUG_API_PAYLOAD === 'true';
  if (!debugPayload) return;
  if (!shouldLogEndpoint(url)) return;

  const method = (options.method || 'GET').toUpperCase();
  if (!['POST', 'PUT', 'PATCH'].includes(method)) return;

  const body = options.body;
  if (!body) return;

  const logger = getDebugLogger();
  const logPrefix = prefix || `[${getDebugPrefix(url)}]`;

  try {
    const bodyStr =
      typeof body === 'string' ? body : body instanceof URLSearchParams ? body.toString() : JSON.stringify(body);
    const maskSensitive = shouldMaskSensitive();
    if (maskSensitive) {
      logger.debug(
        `${logPrefix} [${method} PAYLOAD] ${bodyStr.substring(0, 500)}${bodyStr.length > 500 ? '...(truncated)' : ''}`,
      );
    } else {
      logger.debug(`${logPrefix} [${method} PAYLOAD] ${bodyStr}`);
    }
  } catch {
    logger.debug(`${logPrefix} [${method} PAYLOAD] <unserializable body>`);
  }
}

/**
 * Attaches X-Debug-Upstream-* headers to a NextResponse so that upstream
 * API call metadata is visible in the browser Network tab.
 *
 * Call this in API route handlers after the upstream call completes.
 * No-op in production or when debug response logging is off.
 *
 * @param nextResponse The NextResponse to mutate
 * @param upstreamResponse The upstream fetch Response
 * @param url The upstream URL
 * @param startTime Optional `Date.now()` captured before the fetch
 */
export function attachDebugHeaders(
  nextResponse: { headers: Headers },
  upstreamResponse: Response,
  url: string,
  startTime?: number,
): void {
  if (process.env.NODE_ENV !== 'development') return;
  const debugResponse = (process.env.NEXT_PUBLIC_DEBUG_API_RESPONSE || 'off').toLowerCase();
  if (debugResponse === 'off') return;

  const maskSensitive = shouldMaskSensitive();
  const maskedUrl = maskSensitive ? maskSensitiveQueryParams(url) : url;

  nextResponse.headers.set('X-Debug-Upstream-Url', maskedUrl);
  nextResponse.headers.set('X-Debug-Upstream-Status', String(upstreamResponse.status));
  if (startTime) {
    nextResponse.headers.set('X-Debug-Upstream-Duration', `${Date.now() - startTime}ms`);
  }
}
