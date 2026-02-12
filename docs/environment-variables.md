# Environment Variables Configuration

This document explains key configuration concepts for the Emporix Showcase application. For a complete list of all available variables with inline comments, see [`.env.template`](../.env.template).

## Getting Started

1. Copy `.env.template` to `.env`
2. Configure the required variables (see checklist below)
3. Adjust optional settings as needed

## Configuration Structure

The `.env.template` file is organized into three main sections:

### 🔴 Sensitive Configuration
Secrets, passwords, and private keys that should **never be committed** to version control.

### 🟡 Environment-Specific Configuration
Values that vary between environments (dev/staging/production) but aren't necessarily secret.

### ⚙️ General Configuration
Default settings, feature flags, and system configuration.

## Key Concepts

### Emporix API: Client-Side vs Server-Side

The application uses **two different sets of credentials** for Emporix API access:

#### Client-Side (Public/Storefront API)
- Variables: `NEXT_PUBLIC_EMPORIX_*`
- Exposed to the browser
- Use your **Storefront API Key**
- Used for public operations (browsing products, anonymous cart)

#### Server-Side (Private/Backend API)
- Variables: `NEXT_EMPORIX_*` (without `PUBLIC`)
- Kept secret on the server
- Use your **Emporix API Key**
- Used for privileged operations (order management, customer data)

### NextAuth Configuration

#### `NEXTAUTH_SECRET`
**Critical:** Generate a secure random string for session encryption.

```bash
openssl rand -base64 32
```

#### `NEXTAUTH_URL`
- **Development:** `http://localhost:3000`
- **Production:** Your actual domain (e.g., `https://shop.example.com`)

### Logging Configuration

The application uses PINO logger for structured logging. Log levels and behavior can be controlled via environment variables.

#### `NEXT_LOG_LEVEL` (Server-Side)

Controls the log level for server-side logging (API routes, Server Components, platform services):

- `trace` - Most verbose (development only)
- `debug` - Detailed debugging information (default in development)
- `info` - Informational messages (default in production)
- `warn` - Warning messages
- `error` - Error messages only
- `fatal` - Fatal errors only

**Example:**
```env
# Development - verbose logging
NEXT_LOG_LEVEL=debug

# Production - minimal logging
NEXT_LOG_LEVEL=info
```

#### `NEXT_PUBLIC_LOG_LEVEL` (Client-Side)

Controls the log level for client-side logging (browser):

- `debug` - Detailed debugging information (default in development)
- `info` - Informational messages
- `warn` - Warning messages (default in production)
- `error` - Error messages only

**Example:**
```env
# Development - show debug logs in browser console
NEXT_PUBLIC_LOG_LEVEL=debug

# Production - only show warnings and errors
NEXT_PUBLIC_LOG_LEVEL=warn
```

#### `NEXT_PUBLIC_LOG_ENABLED` (Client-Side)

Controls whether client-side logging is enabled:

- `true` - Enable client-side logging (default in development)
- `false` - Disable client-side logging (recommended for production)

**Example:**
```env
# Enable client-side logging (development)
NEXT_PUBLIC_LOG_ENABLED=true

# Disable client-side logging (production)
NEXT_PUBLIC_LOG_ENABLED=false
```

**Note:** Client-side logging is automatically enabled in development mode and disabled in production unless explicitly set.

### Debug Settings

The application includes a comprehensive API debug system that provides real-time visibility into upstream API calls in both the **server terminal** (with colorized pretty-printing) and the **browser DevTools Console** (via an SSE stream with collapsible groups).

#### `NEXT_PUBLIC_DEBUG_API_CURL`

Log a `curl` command for every upstream API call. Useful for reproducing API calls manually:

- `true` – Log curl commands (headers and query params are masked unless verbose mode is on)
- `false` – Don't log curl commands (default)

```env
NEXT_PUBLIC_DEBUG_API_CURL=true
```

#### `NEXT_PUBLIC_DEBUG_API_RESPONSE`

Controls the verbosity of API response logging. This also enables the **Browser DevTools Debug Stream** — when set to any value other than `OFF`, upstream API calls appear as collapsible groups in the browser Console (via the `ApiDebugPanel` component).

- `OFF` - No response logging, no browser debug stream (default, use in production)
- `STATUS` - Log only HTTP method + status code
- `STATUS-HEADERS` - Log status code and response headers
- `STATUS-BODY-{n}` - Log status and first N characters of response body (e.g. `STATUS-BODY-200`)
- `STATUS-BODY` - Log status and full response body (pretty-printed with ANSI colors in terminal)
- `FULL` - Log everything (status, headers, full body)

**Example:**
```env
NEXT_PUBLIC_DEBUG_API_RESPONSE=STATUS-BODY
```

**Terminal output** is formatted with `pino-pretty` and colorized JSON:
- Keys in **cyan**, string values in **yellow**, numbers in **magenta**, booleans/null in **green**
- Multi-line indented output for easy scanning

**Browser Console output** uses styled `console.groupCollapsed`:
- Color-coded by status (green 2xx, orange 4xx, red 5xx)
- Response bodies displayed via `console.dir` for full object expansion
- Response headers displayed via `console.table`

#### `NEXT_PUBLIC_DEBUG_API_ENDPOINTS`

Restrict debugging to specific endpoints to reduce noise. The value is a comma-separated list of path substrings — only URLs containing at least one of these substrings will be logged. Case-insensitive.

```env
# Debug only orders and returns
NEXT_PUBLIC_DEBUG_API_ENDPOINTS=order,return

# Debug only cart calls
NEXT_PUBLIC_DEBUG_API_ENDPOINTS=cart

# Debug all endpoints (leave empty — this is the default)
NEXT_PUBLIC_DEBUG_API_ENDPOINTS=
```

> **Tip:** This filter applies to both the terminal log and the browser debug stream. After changing, restart the dev server.

#### `NEXT_PUBLIC_DEBUG_API_VERBOSE`

Controls whether sensitive data (tokens, secrets, API keys) is shown in debug output:

- `true` – Show raw values (use only in local development)
- `false` – Mask sensitive values as `******` (default, always in production)

```env
NEXT_PUBLIC_DEBUG_API_VERBOSE=true
```

#### `NEXT_DEBUG_API_PAYLOAD`

Log request body for outgoing POST/PUT/PATCH API calls. Useful for debugging what data is being sent to external APIs:

- `true` – Log request bodies (truncated to 500 chars in masked mode)
- `false` – Don't log request bodies (default)

```env
NEXT_DEBUG_API_PAYLOAD=true
```

**Note:** This is a server-side-only variable (no `NEXT_PUBLIC_` prefix) because request payload logging only makes sense on the server where API calls are made.

#### Full API Debugging Example

```env
# Recommended dev setup for debugging specific API calls
NEXT_PUBLIC_DEBUG_API_CURL=true
NEXT_PUBLIC_DEBUG_API_RESPONSE=STATUS-BODY
NEXT_PUBLIC_DEBUG_API_ENDPOINTS=order,return
NEXT_PUBLIC_DEBUG_API_VERBOSE=false
NEXT_DEBUG_API_PAYLOAD=true
```

### Multi-Site Support

The application supports multiple sites/storefronts:

- `NEXT_PUBLIC_DEFAULT_SITE` - Default site identifier
- `NEXT_PUBLIC_AVAILABLE_SITES` - Comma-separated list of all sites
- `NEXT_PUBLIC_STORYBLOK_MULTI_SITE` - Enable folder-based multi-site in Storyblok

### Push Notifications

#### VAPID Keys

Generate VAPID keys for web push notifications:

```bash
npx web-push generate-vapid-keys
```

Set the public key in `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and the private key in `VAPID_PRIVATE_KEY`.

These variables are **optional**:

- If `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is **missing** or empty, the storefront will treat push notifications as **disabled** and will not call the notifications API endpoints for push setup or polling.
- If `NEXT_PUBLIC_DISABLE_PUSH_NOTIFICATIONS` is set to `true`, push notifications are **explicitly disabled** regardless of VAPID configuration, and the frontend will not attempt to register a service worker subscription or call the push notification API endpoints.

To completely disable push notifications in any environment, you can either:

- Set `NEXT_PUBLIC_DISABLE_PUSH_NOTIFICATIONS=true`, or
- Leave `NEXT_PUBLIC_VAPID_PUBLIC_KEY` unset (and avoid configuring the server-side VAPID keys).

### Setup API

The Setup API (`NEXT_SETUP_API_*`) provides an endpoint for initial system configuration. **Disable in production** or secure with a strong secret.

## Quick Start Checklist

Minimal configuration for local development:

- [ ] `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` - Set to `http://localhost:3000`
- [ ] `NEXT_PUBLIC_EMPORIX_TENANT` - Your Emporix tenant name
- [ ] `NEXT_PUBLIC_EMPORIX_CLIENT_ID` - Storefront API client ID
- [ ] `NEXT_PUBLIC_EMPORIX_CLIENT_SECRET` - Storefront API secret
- [ ] `NEXT_EMPORIX_CLIENT_ID` - Server API client ID
- [ ] `NEXT_EMPORIX_CLIENT_SECRET` - Server API secret

## Environment-Specific Settings

### Development
```env
# Logging
NEXT_LOG_LEVEL=debug
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_LOG_ENABLED=true

# API Debugging — full visibility with colorized terminal output + browser Console stream
NEXT_PUBLIC_DEBUG_API_CURL=true
NEXT_PUBLIC_DEBUG_API_VERBOSE=true
NEXT_PUBLIC_DEBUG_API_RESPONSE=STATUS-BODY
NEXT_DEBUG_API_PAYLOAD=true
# Optional: filter to specific endpoints to reduce noise
# NEXT_PUBLIC_DEBUG_API_ENDPOINTS=order,return
```

### Staging
```env
# Logging
NEXT_LOG_LEVEL=info
NEXT_PUBLIC_LOG_LEVEL=warn
NEXT_PUBLIC_LOG_ENABLED=false

# SEO & Debugging
NEXT_PUBLIC_ROBOTS_NOINDEX=true  # Prevent search engine indexing
NEXT_PUBLIC_DEBUG_API_RESPONSE=STATUS
```

### Production
```env
# Logging
NEXT_LOG_LEVEL=info
NEXT_PUBLIC_LOG_LEVEL=warn
NEXT_PUBLIC_LOG_ENABLED=false

# General Settings
NEXT_PUBLIC_ROBOTS_NOINDEX=false
NEXT_SETUP_API_ENABLED=false
NEXT_PUBLIC_DISABLE_PUSH_NOTIFICATIONS=false   # Set to true to fully disable web push notifications

# API Debugging — OFF in production (no debug stream, no curl logging)
NEXT_PUBLIC_DEBUG_API_CURL=false
NEXT_PUBLIC_DEBUG_API_RESPONSE=OFF
NEXT_PUBLIC_DEBUG_API_VERBOSE=false
NEXT_DEBUG_API_PAYLOAD=false
```

## Security Best Practices

1. **Never commit `.env` files** - Only commit `.env.template`
2. **Use different credentials** for each environment
3. **Rotate secrets regularly** - Especially `NEXTAUTH_SECRET` and API keys
4. **Minimize `NEXT_PUBLIC_*` usage** - Only expose what's absolutely necessary to the browser
5. **Use secret management in production** - AWS Secrets Manager, Azure Key Vault, etc.
6. **Enable security headers** - The template includes sensible defaults for CORS, CSP, etc.

## Related Documentation

- [Deployment Process](./deployment-process.md)
- [Testing Guide](./testing-guide.md)
- [Storyblok Integration](./storyblok-integration.md)