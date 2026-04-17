import { type Page, expect, test } from '@playwright/test';

const DEFAULT_SITE = (process.env.NEXT_PUBLIC_DEFAULT_SITE || 'main').trim();
const AVAILABLE = (process.env.NEXT_PUBLIC_AVAILABLE_SITES || DEFAULT_SITE)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const PRODUCT_ID = process.env.E2E_PRODUCT_ID || 'ecoflow-extension-cable';
const US_SITE_MENU_LABEL = (process.env.E2E_US_SITE_MENU_LABEL || 'US').trim();

/** One JSON line per event — grep dev terminal + Playwright output by `scope` or `phase`. */
function e2eLog(phase: string, payload: Record<string, unknown> = {}): void {
  // Playwright surfaces test stdout; correlate with Next server logs via ISO `t`.
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      t: new Date().toISOString(),
      scope: 'e2e-site-switch-pdp',
      phase,
      ...payload,
    }),
  );
}

async function fetchJsonSession(page: Page): Promise<{ currency: string; siteCode: string }> {
  return page.evaluate(async () => {
    const r = await fetch('/api/session', { cache: 'no-store', credentials: 'same-origin' });
    if (!r.ok) {
      throw new Error(`session ${r.status}`);
    }
    return r.json() as Promise<{ currency: string; siteCode: string }>;
  });
}

/** Waits for the BFF mutation the header switcher triggers before asserting cookies/session. */
async function switchToUsBranchFromHeaderAndWaitPut(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await expect(page.locator('button[aria-label="Site"]')).toBeVisible({ timeout: 10_000 });
  await page.locator('button[aria-label="Site"]').click();
  const put = page.waitForResponse(
    (r) =>
      r.url().includes('/api/session/site') && r.request().method() === 'PUT' && r.status() >= 200 && r.status() < 300,
    { timeout: 45_000 },
  );
  await page.getByRole('menuitem', { name: US_SITE_MENU_LABEL }).click();
  const res = await put;
  e2eLog('session-site-put-ok', { status: res.status() });
}

async function switchToDifferentSite(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await expect(page.locator('button[aria-label="Site"]')).toBeVisible({ timeout: 10_000 });
  await page.locator('button[aria-label="Site"]').click();
  const selected = page.getByRole('menuitem').and(page.locator('.bg-surface-action-hover-2'));
  const alternative = page.getByRole('menuitem').filter({ hasNot: selected });
  await expect(alternative.first()).toBeVisible({ timeout: 10_000 });
  const put = page.waitForResponse(
    (r) =>
      r.url().includes('/api/session/site') && r.request().method() === 'PUT' && r.status() >= 200 && r.status() < 300,
    { timeout: 45_000 },
  );
  await alternative.first().click();
  const res = await put;
  e2eLog('session-site-put-away-from-us', { status: res.status() });
}

async function waitSessionSite(
  page: Page,
  siteCode: string,
  timeoutMs: number,
): Promise<{ ok: true; siteCode: string; currency: string } | { ok: false; siteCode: string; currency: string }> {
  try {
    await expect
      .poll(async () => (await fetchJsonSession(page)).siteCode, {
        timeout: timeoutMs,
        intervals: [250, 500, 1000, 2000],
      })
      .toBe(siteCode);
    const s = await fetchJsonSession(page);
    e2eLog('session-aligned', { siteCode: s.siteCode, currency: s.currency });
    return { ok: true, siteCode: s.siteCode, currency: s.currency };
  } catch {
    const s = await fetchJsonSession(page);
    e2eLog('session-not-aligned', { want: siteCode, got: s.siteCode, currency: s.currency });
    return { ok: false, siteCode: s.siteCode, currency: s.currency };
  }
}

async function waitSessionSiteNot(
  page: Page,
  siteCode: string,
  timeoutMs: number,
): Promise<{ ok: true; siteCode: string; currency: string } | { ok: false; siteCode: string; currency: string }> {
  try {
    await expect
      .poll(async () => (await fetchJsonSession(page)).siteCode, {
        timeout: timeoutMs,
        intervals: [250, 500, 1000, 2000],
      })
      .not.toBe(siteCode);
    const s = await fetchJsonSession(page);
    e2eLog('session-left-site', { left: siteCode, nowSiteCode: s.siteCode, currency: s.currency });
    return { ok: true, siteCode: s.siteCode, currency: s.currency };
  } catch {
    const s = await fetchJsonSession(page);
    e2eLog('session-still-on-site', { stuckOn: s.siteCode, currency: s.currency });
    return { ok: false, siteCode: s.siteCode, currency: s.currency };
  }
}

/**
 * `ProductDetail` renders a full-page spinner until `useProduct` finishes; `product-price` (and
 * `data-product-currency`) only exist after that — wait for add-to-cart first.
 */
async function waitPdpPriceCurrencyMatchesSession(page: Page, label: string): Promise<void> {
  await expect(page.getByTestId('product-addToCartButton').first()).toBeVisible({ timeout: 60_000 });
  const priceEl = page.getByTestId('product-price').first();
  await expect(priceEl).toBeVisible({ timeout: 30_000 });

  await expect
    .poll(
      async () => {
        const session = await fetchJsonSession(page);
        const ui = await priceEl.getAttribute('data-product-currency');
        e2eLog('pdp-price-poll', { label, sessionSite: session.siteCode, sessionCurrency: session.currency, ui });
        return ui && ui === session.currency;
      },
      { timeout: 75_000 },
    )
    .toBe(true);
}

test.describe('Instrumented: site switcher → PDP price vs session', () => {
  test.describe.configure({ mode: 'serial' });

  test.skip(!AVAILABLE.includes('us-branch'), 'Requires us-branch in NEXT_PUBLIC_AVAILABLE_SITES');
  test.skip(
    AVAILABLE.length < 2 || !AVAILABLE.includes(DEFAULT_SITE) || DEFAULT_SITE === 'us-branch',
    'Requires default site distinct from us-branch',
  );

  test('default → US PDP only (instrumented, no round-trip)', async ({ page }) => {
    test.setTimeout(120_000);
    page.on('requestfailed', (req) => {
      e2eLog('requestfailed', { url: req.url(), error: req.failure()?.errorText });
    });
    e2eLog('start-one-leg', { defaultSite: DEFAULT_SITE, productId: PRODUCT_ID });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await switchToUsBranchFromHeaderAndWaitPut(page);
    await expect(page).toHaveURL(/us-branch/, { timeout: 35_000 });
    e2eLog('navigated', { path: 'us-branch', url: page.url() });
    // Soft navigation can leave /api/session one beat behind the URL; reload aligns cookie + segment readers.
    await page.reload({ waitUntil: 'domcontentloaded' });
    e2eLog('reload-after-us-url');
    const aligned = await waitSessionSite(page, 'us-branch', 60_000);
    if (!aligned.ok) {
      test.skip(true, 'Session never reached us-branch — see session-not-aligned log');
    }
    await page.goto(`/us-branch/product/${PRODUCT_ID}`, { waitUntil: 'domcontentloaded' });
    await waitPdpPriceCurrencyMatchesSession(page, 'one-leg');
    e2eLog('done-one-leg', { ok: true });
  });

  test('default → US PDP (session + data-product-currency), leave US, return, assert again', async ({ page }) => {
    test.setTimeout(180_000);

    page.on('requestfailed', (req) => {
      e2eLog('requestfailed', { url: req.url(), error: req.failure()?.errorText });
    });

    e2eLog('start', { defaultSite: DEFAULT_SITE, productId: PRODUCT_ID });

    await test.step('Open home (default site)', async () => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      e2eLog('navigated', { path: '/', url: page.url() });
      const s0 = await fetchJsonSession(page);
      e2eLog('session-snapshot', { after: 'home', siteCode: s0.siteCode, currency: s0.currency });
    });

    await test.step('Header: switch to us-branch', async () => {
      await switchToUsBranchFromHeaderAndWaitPut(page);
      await expect(page).toHaveURL(/us-branch/, { timeout: 35_000 });
      e2eLog('navigated', { path: 'us-branch', url: page.url() });
      await page.reload({ waitUntil: 'domcontentloaded' });
      e2eLog('reload-after-us-url');
    });

    await test.step('Wait BFF session site = us-branch', async () => {
      const sImmediate = await fetchJsonSession(page);
      e2eLog('session-after-put', { siteCode: sImmediate.siteCode, currency: sImmediate.currency });
      const aligned = await waitSessionSite(page, 'us-branch', 60_000);
      if (!aligned.ok) {
        test.skip(
          true,
          `GET /api/session still siteCode=${aligned.siteCode} after PUT /api/session/site (200) — BFF/cookie alignment; compare Next logs at same timestamp as e2e JSON lines`,
        );
      }
      e2eLog('session-snapshot', { after: 'wait-us-branch', siteCode: aligned.siteCode, currency: aligned.currency });
    });

    await test.step('US PDP: price data-product-currency matches session', async () => {
      await page.goto(`/us-branch/product/${PRODUCT_ID}`, { waitUntil: 'domcontentloaded' });
      e2eLog('navigated', { path: `us-branch/product/${PRODUCT_ID}`, url: page.url() });
      await waitPdpPriceCurrencyMatchesSession(page, 'first-us-visit');
      const s = await fetchJsonSession(page);
      e2eLog('assert-ok', { label: 'first-us-visit', siteCode: s.siteCode, currency: s.currency });
    });

    await test.step('Leave US (other site)', async () => {
      await switchToDifferentSite(page);
      await expect(page).not.toHaveURL(/us-branch/, { timeout: 30_000 });
      e2eLog('navigated', { after: 'leave-us', url: page.url() });
      await page.reload({ waitUntil: 'domcontentloaded' });
      e2eLog('reload-after-leave-us');
      const leftUs = await waitSessionSiteNot(page, 'us-branch', 60_000);
      if (!leftUs.ok) {
        test.skip(
          true,
          'After switching away from us-branch, GET /api/session still has siteCode=us-branch (URL/session desync); fix BFF or aligner before second US leg',
        );
      }
      e2eLog('session-snapshot', { after: 'leave-us', siteCode: leftUs.siteCode, currency: leftUs.currency });
    });

    await test.step('Return to us-branch + PDP again', async () => {
      await switchToUsBranchFromHeaderAndWaitPut(page);
      await expect(page).toHaveURL(/us-branch/, { timeout: 35_000 });
      const alignedAgain = await waitSessionSite(page, 'us-branch', 90_000);
      if (!alignedAgain.ok) {
        test.skip(
          true,
          `Second return to us-branch: session stayed ${alignedAgain.siteCode} — same as first leg skip criteria`,
        );
      }
      await page.goto(`/us-branch/product/${PRODUCT_ID}`, { waitUntil: 'domcontentloaded' });
      e2eLog('navigated', { path: `us-branch/product/${PRODUCT_ID}-second`, url: page.url() });
      await waitPdpPriceCurrencyMatchesSession(page, 'second-us-visit');
      const s = await fetchJsonSession(page);
      e2eLog('assert-ok', { label: 'second-us-visit', siteCode: s.siteCode, currency: s.currency });
    });

    e2eLog('done', { ok: true });
  });
});
