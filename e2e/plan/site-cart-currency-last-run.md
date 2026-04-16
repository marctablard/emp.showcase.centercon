# site-cart-currency-last-run

Generated (UTC): 2026-04-16T09:14:25.143Z

## Sync drift (header currency vs session)

_No rows where `data-selected-currency` differed from `GET /api/session` currency._

## Full journey run A

| Step | Path (prefix) | Session site | Session ccy | Header ccy | Cart qty |
|------|---------------|--------------|-------------|------------|----------|
| Full journey run A: start (main home) | `/` | main | EUR | EUR | 0 |
| Full journey run A: site → US (us-branch) | `/us-branch` | us-branch | USD | USD | 0 |
| Full journey run A: add to cart (1st, default currency) | `/us-branch/product/ecoflow-extension-cable` | us-branch | USD | USD | 1 |
| Full journey run A: currency toggle #1 (after 1st add) | `/us-branch/product/ecoflow-extension-cable` | us-branch | CHF | CHF | 1 |
| Full journey run A: site → other (not us-branch) | `/` | main | EUR | EUR | 0 |
| Full journey run A: currency toggle #2 | `/` | main | USD | USD | 0 |
| Full journey run A: site → US again | `/us-branch` | us-branch | USD | USD | 1 |
| Full journey run A: add to cart (2nd) | `/us-branch/product/ecoflow-extension-cable` | us-branch | USD | USD | 2 |
| Full journey run A: site → other (3rd switch) | `/` | main | EUR | EUR | 0 |
| Full journey run A: site → US (4th switch) | `/us-branch` | us-branch | USD | USD | 2 |
| Full journey run A: cleared product line on /cart | `/us-branch/cart` | us-branch | USD | USD | 0 |

## Full journey run B

| Step | Path (prefix) | Session site | Session ccy | Header ccy | Cart qty |
|------|---------------|--------------|-------------|------------|----------|
| Full journey run B: start (main home) | `/` | main | EUR | EUR | 0 |
| Full journey run B: site → US (us-branch) | `/us-branch` | us-branch | USD | USD | 0 |
| Full journey run B: add to cart (1st, default currency) | `/us-branch/product/ecoflow-extension-cable` | us-branch | USD | USD | 1 |
| Full journey run B: currency toggle #1 (after 1st add) | `/us-branch/product/ecoflow-extension-cable` | us-branch | CHF | CHF | 1 |
| Full journey run B: site → other (not us-branch) | `/` | main | EUR | EUR | 0 |
| Full journey run B: currency toggle #2 | `/` | main | USD | USD | 0 |
| Full journey run B: site → US again | `/us-branch` | us-branch | USD | USD | 1 |
| Full journey run B: add to cart (2nd) | `/us-branch/product/ecoflow-extension-cable` | us-branch | USD | USD | 2 |
| Full journey run B: site → other (3rd switch) | `/` | main | EUR | EUR | 0 |
| Full journey run B: site → US (4th switch) | `/us-branch` | us-branch | USD | USD | 2 |
| Full journey run B: cleared product line on /cart | `/us-branch/cart` | us-branch | USD | USD | 0 |

## Console (errors / warnings)

```
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[warning] Image with src "https://res.cloudinary.com/saas-ag/image/upload/v1750687630/showcase/media/68595f8dc82dd92755ee6fde" was detected as the Largest Contentful Paint (LCP). Please add the `loading="eager"` property if this image is above the fold.
Read more: https://nextjs.org/docs/app/api-reference/components/image#loading
[warning] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
[warning] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
[error] Failed to load resource: the server responded with a status of 409 (Conflict)
[error] {time: 1776330725742, level: 50, err: Object, msg: Error updating cart currency}
[error] Failed to load resource: the server responded with a status of 409 (Conflict)
[error] {time: 1776330726295, level: 50, err: Object, msg: Error updating cart currency}
[warning] {time: 1776330727231, level: 40, productId: ecoflow-extension-cable, currency: EUR, sessionCurrency: EUR}
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[warning] {time: 1776330777614, level: 40, cartSite: us-branch, sessionSiteCode: main, msg: fetchCart received cart whose site does not match session site — discarding}
[warning] Image with src "https://res.cloudinary.com/saas-ag/image/upload/v1750687630/showcase/media/68595f8dc82dd92755ee6fde" was detected as the Largest Contentful Paint (LCP). Please add the `loading="eager"` property if this image is above the fold.
Read more: https://nextjs.org/docs/app/api-reference/components/image#loading
[warning] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
[warning] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
[warning] {time: 1776330782237, level: 40, productId: ecoflow-extension-cable, currency: EUR, sessionCurrency: EUR}
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[warning] {time: 1776330809019, level: 40, currency: EUR, siteCode: main, attempts: 3}
[warning] {time: 1776330809253, level: 40, cartSite: us-branch, sessionSiteCode: main, msg: fetchCart received cart whose site does not match session site — discarding}
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[warning] Image with src "https://res.cloudinary.com/saas-ag/image/upload/v1750687630/showcase/media/68595f8dc82dd92755ee6fde" was detected as the Largest Contentful Paint (LCP). Please add the `loading="eager"` property if this image is above the fold.
Read more: https://nextjs.org/docs/app/api-reference/components/image#loading
[warning] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
[warning] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
[error] Failed to load resource: the server responded with a status of 409 (Conflict)
[error] {time: 1776330823470, level: 50, err: Object, msg: Error updating cart currency}
[error] Failed to load resource: the server responded with a status of 409 (Conflict)
[error] {time: 1776330824046, level: 50, err: Object, msg: Error updating cart currency}
[warning] {time: 1776330824941, level: 40, productId: ecoflow-extension-cable, currency: EUR, sessionCurrency: EUR}
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[warning] {time: 1776330851741, level: 40, cartSite: us-branch, sessionSiteCode: main, msg: fetchCart received cart whose site does not match session site — discarding}
[warning] Image with src "https://res.cloudinary.com/saas-ag/image/upload/v1750687630/showcase/media/68595f8dc82dd92755ee6fde" was detected as the Largest Contentful Paint (LCP). Please add the `loading="eager"` property if this image is above the fold.
Read more: https://nextjs.org/docs/app/api-reference/components/image#loading
[warning] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
[warning] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
```

## requestfailed

- net::ERR_ABORTED http://localhost:3000/?_rsc=18bqc
- net::ERR_ABORTED http://localhost:3000/api/debug/stream
- net::ERR_ABORTED http://localhost:3000/?_rsc=18bqc
- net::ERR_ABORTED http://localhost:3000/api/debug/stream
- net::ERR_ABORTED http://localhost:3000/?_rsc=18bqc
- net::ERR_ABORTED http://localhost:3000/us-branch
- net::ERR_ABORTED http://localhost:3000/us-branch?_rsc=14vea
- net::ERR_ABORTED http://localhost:3000/api/debug/stream
- net::ERR_ABORTED http://localhost:3000/us-branch?_rsc=14vea
- net::ERR_ABORTED http://localhost:3000/us-branch?_rsc=14vea
- net::ERR_ABORTED http://localhost:3000/api/debug/stream
- net::ERR_ABORTED http://localhost:3000/?_rsc=18bqc
- net::ERR_ABORTED http://localhost:3000/api/debug/stream
- net::ERR_ABORTED http://localhost:3000/us-branch?_rsc=14vea
- net::ERR_ABORTED http://localhost:3000/api/debug/stream
- net::ERR_ABORTED http://localhost:3000/us-branch?_rsc=14vea
- net::ERR_ABORTED http://localhost:3000/api/debug/stream
- net::ERR_ABORTED http://localhost:3000/us-branch/product/ecoflow-extension-cable?_rsc=1adsw
- net::ERR_ABORTED http://localhost:3000/
- net::ERR_ABORTED http://localhost:3000/?_rsc=18bqc
- net::ERR_ABORTED http://localhost:3000/api/debug/stream
- net::ERR_ABORTED http://localhost:3000/?_rsc=18bqc
- net::ERR_ABORTED http://localhost:3000/?_rsc=18bqc
- net::ERR_ABORTED http://localhost:3000/?_rsc=18bqc
- net::ERR_ABORTED http://localhost:3000/api/debug/stream
- net::ERR_ABORTED http://localhost:3000/us-branch?_rsc=14vea
- net::ERR_ABORTED http://localhost:3000/api/debug/stream
- net::ERR_ABORTED http://localhost:3000/us-branch?_rsc=14vea
- net::ERR_ABORTED http://localhost:3000/api/debug/stream
- net::ERR_ABORTED http://localhost:3000/
- net::ERR_ABORTED http://localhost:3000/?_rsc=18bqc
- net::ERR_ABORTED http://localhost:3000/api/debug/stream
- net::ERR_ABORTED http://localhost:3000/?_rsc=18bqc
- net::ERR_ABORTED http://localhost:3000/?_rsc=18bqc
- net::ERR_ABORTED http://localhost:3000/us-branch?_rsc=14vea
- net::ERR_ABORTED http://localhost:3000/api/debug/stream
- net::ERR_ABORTED http://localhost:3000/us-branch?_rsc=14vea
- net::ERR_ABORTED http://localhost:3000/us-branch?_rsc=14vea
- net::ERR_ABORTED http://localhost:3000/api/debug/stream
- net::ERR_ABORTED http://localhost:3000/api/debug/stream

## Known non-fatal noise (documented)

- **409** on cart currency update: common when session/site and cart currency disagree during transitions; store layer retries or clears cart.
- **fetchCart received cart from wrong site — discarding**: intentional guard when URL/site cookie and cart tenant diverge.
- **net::ERR_ABORTED** on `/api/cart`, RSC, or `/api/debug/stream`: navigation replaced in-flight requests (Playwright).
- **404** on Storyblok or media: environment or draft content; unrelated to journey assertions.
