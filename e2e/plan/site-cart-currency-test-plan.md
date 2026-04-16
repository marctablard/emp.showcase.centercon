# Site switching, currency, and cart — manual & automated test plan

**Goal:** After each Playwright iteration, session site/currency, header, cart API, and UI stay coherent across **multiple site switches**, **currency changes**, and **add/remove cart lines**.

**Prerequisites**

- [ ] Dev server on `http://localhost:3000` (`npm run dev` or `npm run dev:next`)
- [ ] `NEXT_PUBLIC_AVAILABLE_SITES` includes `us-branch` and at least one other site (e.g. `main`)
- [ ] `E2E_PRODUCT_ID` set to a product that exists on **us-branch** (default: `ecoflow-extension-cable`)
- [ ] Optional: `E2E_US_SITE_MENU_LABEL` (default `US`), `E2E_OTHER_SITE_MENU_LABEL` (default `Showcase`) match header switcher labels

**Automated spec:** `npx playwright test e2e/site-cart-currency-journey.spec.ts --project=chromium --reporter=list`  
**Round-trip preservation (main → US → main, add on main):** `npx playwright test e2e/site-cart-main-us-main-roundtrip.spec.ts --project=chromium --reporter=list` — uses `waitSessionSiteStable` (reload retries) so `GET /api/session` matches the URL site after header switches.  
**Last run artifact:** `e2e/plan/site-cart-currency-last-run.md` (overwritten each successful run)

---

## Iteration log (fill after each Playwright run)

| Run # | Date/time | Command | Result (pass/fail) | Notes |
|-------|-----------|---------|--------------------|-------|
| 1 | 2026-04-15 (UTC) | `npx playwright test e2e/site-cart-currency-journey.spec.ts --project=chromium --reporter=list` | pass | Dev server restarted (port 3000 cleared); Run A + Run B in one spec; artifact `site-cart-currency-last-run.md` |
| 2 | 2026-04-15 (UTC) | same (re-run after spec fixes) | pass | Modal dismissed before currency; add before first currency toggle; reset to non-`us-branch` between A→B; no strict `PUT` wait on site click |
| 3 | 2026-04-15 (UTC) | `npx playwright test e2e/site-cart-currency-journey.spec.ts --project=chromium --reporter=list` | pass | Sync: start on `/{nonUs}/en/` + `waitHeaderCurrencyMatchesSession` after site/currency steps; `waitSessionSiteStable` after switch to other; add-to-cart waits on `POST /api/cart/.../items` + retry; report adds **Sync drift** section + **Known non-fatal noise** |
| 4 | 2026-04-16 (UTC) | `npx playwright test e2e/site-cart-main-us-main-roundtrip.spec.ts --project=chromium --reporter=list` | pass | Add on `main` → Site **US** → Site **Showcase** → back on `main`: `GET /api/cart` line qty preserved (`1`). First run without `waitSessionSiteStable` timed out (`GET /api/session` still `main` while URL was `us-branch` ~35s). On `us-branch`, observed **cart qty 0** in API poll while session `cartId` matched main-era id — per-site cart resolution; mini-cart on US can read empty until user adds on US. |
| 5 | 2026-04-16 (UTC) | `npx playwright test e2e/site-cart-currency-journey.spec.ts --project=chromium --reporter=list` | pass | Reused existing dev on `:3000`; Run A + Run B (~4.3m); **Sync drift** empty; console noise: 409 cart currency, 404s, `ERR_ABORTED` on cart/RSC/debug stream per `site-cart-currency-last-run.md` known-non-fatal list. |

---

## Run A — step checklist (mirror automated “Full journey run A”)

Track **URL path** (site segment), **`GET /api/session`** (`siteCode`, `currency`), **header** `data-selected-currency`, **`GET /api/cart`** line qty.

| # | Step | Expected checks |
|---|------|-----------------|
| A1 | Open `/` | Page loads; note session |
| A2 | Header **Site** → choose **US** (or `E2E_US_SITE_MENU_LABEL`) | URL contains `us-branch`; session `siteCode` → `us-branch` within ~45s |
| A3 | Header **Währungen** → pick a **different** currency (if 2+ options) | Session `currency` changes; header `data-selected-currency` matches |
| A4 | Open `/us-branch/product/<E2E_PRODUCT_ID>` | PDP loads; add-to-cart **enabled** |
| A5 | **Add to cart** (first primary button) | `GET /api/cart` line qty ≥ 1 |
| A6 | Header **Site** → **other** site (e.g. Showcase / main) | URL no longer `us-branch`; cart may reset (document behaviour) |
| A7 | Header **Währungen** → another currency (if available) | Session currency updated |
| A8 | Header **Site** → **US** again | URL `us-branch`; session aligned |
| A9 | **Add to cart** again on same PDP (refresh if needed) | Cart qty ≥ previous or stable per tenant rules |
| A10 | Open `/us-branch/cart` | Line visible |
| A11 | **Remove** line (`cart-item-remove-<productId>`) | `GET /api/cart` qty 0 or line gone |

- [x] A1  
- [x] A2  
- [x] A3  
- [x] A4  
- [x] A5  
- [x] A6  
- [x] A7  
- [x] A8  
- [x] A9  
- [x] A10  
- [x] A11  

---

## Run B — step checklist (second full pass; “Full journey run B”)

Repeat the same flow to catch ordering / cache races (same table as Run A).

| # | Step | Expected checks |
|---|------|-----------------|
| B1–B11 | Same as A1–A11 | Same expectations |

- [x] B1 … B11 completed (tick when whole run B passes)

---

## Browser DevTools (human or MCP)

During manual runs or while debugging Playwright:

- [ ] **Console:** no unhandled errors; note `store-sync:` / `cart-store:` / `session-store:` **debug** lines in development
- [ ] **Network:** `PUT /api/session/site`, `PUT /api/session/currency`, `GET /api/session`, `GET /api/cart`, `POST /api/cart/.../items` — status 2xx; no unexpected 400 on session/cart
- [ ] **Application → Cookies:** `emp-site` (or configured site cookie) matches URL site after switches

---

## Playwright-only diagnostics (enabled in journey spec)

- Browser **console** messages collected and printed under `## Console (errors/warnings)` in `site-cart-currency-last-run.md`
- **Failed requests** (`requestfailed`) appended to the same file
