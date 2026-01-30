# JIRA: Harden health checks against app-route amplification

## Summary
Health checks that hit the main app routes (e.g. `/`, `/{site}/{locale}`) trigger full server layout execution and multiple upstream Emporix API calls per request. This creates an amplification vector that can be caused by misconfiguration or malicious traffic and can overwhelm upstream services.

## Context (what happens today)
Main route requests execute `src/app/[site]/[locale]/layout.tsx` and call:
- `auth()` (NextAuth session evaluation)
- `getSession()` → `SessionService.getCurrent()` → `EmporixSessionContextApi.getOwnSessionContext()` plus possible update calls
- `getSite(siteCode)` → Emporix API calls for site settings, currencies, countries, regions, payment modes
- `getAvailableSites()` → calls `getSite()` for each configured site

Dedicated health endpoints (`/api/health`, `/api/ready`) are safe and do not call upstream services.

## Risk / Vulnerability
If health checks (or high‑rate unauthenticated traffic) hit app routes:
- Each request can trigger **5 upstream calls for `getSite(siteCode)`** plus **5×N calls for `getAvailableSites()`**, where **N = number of configured sites**.
- `getSession()` adds at least **1 call** to session context, with **additional writes** when defaults are applied.
- Total upstream calls per request are roughly **(5 × (1 + N)) + 1–3**, and scale linearly with health check frequency.

This is a DoS/amplification risk against upstream services and increases token refresh load because health checks do not persist cookies.

## Proposal (single ticket with subtasks)

**Title**: Prevent health checks from triggering app route data fetches  
**Type**: Story  
**Priority**: High  
**Components**: Middleware, SSR, Ops

### Acceptance Criteria
- Health checks configured for `/api/health` and `/api/ready` do not hit app routes.
- If a health check hits `/` or `/{site}/{locale}`, response is fast and does **not** call Emporix APIs.
- Logs/metrics clearly show misrouted health checks and frequency.
- No regression for normal user traffic (first‑time visitors without cookies still work).

### Subtasks
1. **Edge guard for known probe user agents**
   - Add early short‑circuit in edge middleware for common probe user agents (e.g. `kube-probe`, `Azure-HealthCheck`, `GoogleHC`) when the path is `/` or `/{site}/{locale}`.
   - Return lightweight `200` with `Cache-Control: no-store` and a warning header.

2. **Anonymous traffic rate limit for app routes**
   - Add rate limiting at edge for unauthenticated, cookie‑less requests to app routes.
   - Ensure normal first‑visit traffic is not blocked (use higher thresholds, allowlist known paths).

3. **Server‑side caching of site metadata**
   - Cache `getSite()` and `getAvailableSites()` across requests (e.g. `unstable_cache` with a short TTL).
   - Prevent repeated calls during spikes, especially for anonymous traffic.

4. **Operational guardrails**
   - Add logging/metrics for requests to app routes without cookies + probe user agents.
   - Document remediation steps in `docs/health-checks.md` and deployment templates.

## Out of scope
- Changing upstream Emporix APIs.
- Global WAF configuration (can be tracked separately).

## Notes / References
- `src/app/[site]/[locale]/layout.tsx`  
- `src/lib/ssr/site.ts`  
- `src/platform/services/site/impl/EmporixSiteService.ts`  
- `docs/health-checks.md`, `docs/api-security.md`, `docs/site-middleware.md`
