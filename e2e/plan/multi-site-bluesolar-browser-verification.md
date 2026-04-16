# Multi-site Bluesolar browser verification

Generated (UTC): 2026-04-16T11:06:32.133Z

## Correlation

- Match Playwright stdout JSON (if enabled) and this file with **Next.js terminal** logs (same timestamps).
- Chrome DevTools MCP was not available in this agent session; use browser DevTools Network manually for `/api/session`, `/api/cart`, `/api/session/site` if needed.

## Legend

- **Path site**: first segment of pathname (`/main/…`, `/us-branch/…`).
- **Price aligned**: `session.currency` equals header `data-selected-currency` and PDP `data-product-currency` when the latter exists.

| Step | Note | URL | Path site | Session site | Session ccy | Header ccy | PDP price ccy | Price aligned | Cart id | Cart site | Cart ccy | Cart items | Add-to-cart enabled |
|------|------|-----|-----------|--------------|-------------|------------|----------------|-----------------|---------|------------|----------|------------|---------------------|
| (init) | Loaded /api/site available count=5 | — | — | — | — | — | n/a | — | — | — | — | — |
| (sites) | main display="Showcase" | — | — | — | — | — | n/a | — | — | — | — | — |
| (sites) | us-branch display="US" | — | — | — | — | — | n/a | — | — | — | — | — |
| (sites) | brand1 display="Natura Home" | — | — | — | — | — | n/a | — | — | — | — | — |
| (sites) | dealer1 display="Möbel Weierauch" | — | — | — | — | — | n/a | — | — | — | — | — |
| (sites) | fw-site display="FW" | — | — | — | — | — | n/a | — | — | — | — | — |
| home-main | after goto+reload | http://localhost:3000/ | main | main | EUR | EUR |  | yes |  |  |  | 0 |  |
| pdp-main | after bluesolar search → first PDP | http://localhost:3000/product/bluesolar-victron-55w | main | main | EUR | EUR | EUR | yes |  |  |  | 0 | true |
| after-add-main | after add attempt (see cart items) | http://localhost:3000/product/bluesolar-victron-55w | main | main | EUR | EUR | EUR | yes | 69e0c2bd11b02c3fc3297620 | main | EUR | 1 | true |
| home-us-branch | after goto+reload | http://localhost:3000/us-branch | us-branch | us-branch | USD | USD |  | yes |  |  |  | 0 |  |
| pdp-us-branch | after bluesolar search → first PDP | http://localhost:3000/us-branch/product/bluesolar-victron-55w | us-branch | us-branch | USD | USD | USD | yes |  |  |  | 0 | true |
| after-add-us-branch | after add attempt (see cart items) | http://localhost:3000/us-branch/product/bluesolar-victron-55w | us-branch | us-branch | USD | USD | USD | yes | 69e0c2c301edf82b826cbb52 | us-branch | USD | 1 | true |
| home-brand1 | after goto+reload | http://localhost:3000/brand1 | brand1 | brand1 | CHF | CHF |  | yes |  |  |  | 0 |  |
| pdp-brand1 | after bluesolar search → first PDP | http://localhost:3000/brand1/product/bluesolar-victron-55w | brand1 | brand1 | CHF | CHF | CHF | yes |  |  |  | 0 | true |
| after-add-brand1 | after add attempt (see cart items) | http://localhost:3000/brand1/product/bluesolar-victron-55w | brand1 | brand1 | CHF | CHF | CHF | yes | 69e0c2c701edf82b826cbb53 | brand1 | CHF | 0 | true |
| home-dealer1 | after goto+reload | http://localhost:3000/dealer1 | dealer1 | dealer1 | EUR | EUR |  | yes |  |  |  | 0 |  |
| pdp-dealer1 | after bluesolar search → first PDP | http://localhost:3000/dealer1/product/bluesolar-victron-55w | dealer1 | dealer1 | EUR | EUR | EUR | yes |  |  |  | 0 | true |
| after-add-dealer1 | after add attempt (see cart items) | http://localhost:3000/dealer1/product/bluesolar-victron-55w | dealer1 | dealer1 | EUR | EUR | EUR | yes | 69e0c2ce11b02c3fc3297621 | dealer1 | EUR | 0 | true |
| home-fw-site | after goto+reload | http://localhost:3000/fw-site | fw-site | fw-site | CHF | CHF |  | yes |  |  |  | 0 |  |
| pdp-fw-site | after bluesolar search → first PDP | http://localhost:3000/fw-site/product/bluesolar-victron-55w | fw-site | fw-site | CHF | CHF | CHF | yes |  |  |  | 0 | true |
| after-add-fw-site | after add attempt (see cart items) | http://localhost:3000/fw-site/product/bluesolar-victron-55w | fw-site | fw-site | CHF | CHF | CHF | yes | 69e0c2d401edf82b826cbb54 | fw-site | CHF | 0 | true |
| script-main-start | baseline | http://localhost:3000/ | main | main | EUR | EUR |  | yes | 69e0c2bd11b02c3fc3297620 | main | EUR | 1 |  |
| script-after-add-main | added on main if enabled | http://localhost:3000/product/bluesolar-victron-55w | main | main | EUR | EUR | EUR | yes | 69e0c2bd11b02c3fc3297620 | main | EUR | 2 | true |
