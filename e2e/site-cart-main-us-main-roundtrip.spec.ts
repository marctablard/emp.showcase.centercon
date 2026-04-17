/**
 * Repro: add on non-US site (e.g. main), switch to us-branch, switch back — cart line qty should persist.
 */
import { type Locator, type Page, expect, test } from '@playwright/test';

const DEFAULT_SITE = (process.env.NEXT_PUBLIC_DEFAULT_SITE || 'main').trim();
const AVAILABLE = (process.env.NEXT_PUBLIC_AVAILABLE_SITES || DEFAULT_SITE)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const MAIN_SITE = AVAILABLE.find((s) => s !== 'us-branch') || DEFAULT_SITE;
const PRODUCT_ID = process.env.E2E_PRODUCT_ID || 'ecoflow-extension-cable';
const US_SITE_MENU_LABEL = (process.env.E2E_US_SITE_MENU_LABEL || 'US').trim();
const OTHER_SITE_MENU_LABEL = (process.env.E2E_OTHER_SITE_MENU_LABEL || 'Showcase').trim();

async function cartLineQuantitySum(page: Page): Promise<number> {
  return page.evaluate(async () => {
    const r = await fetch('/api/cart', { cache: 'no-store', credentials: 'same-origin' });
    if (r.status === 204) return 0;
    if (!r.ok) return 0;
    const cart = (await r.json()) as { items?: { quantity: number }[] };
    return cart.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  });
}

async function fetchJsonSession(page: Page): Promise<{ currency: string; siteCode: string; cartId?: string }> {
  return page.evaluate(async () => {
    const r = await fetch('/api/session', { cache: 'no-store', credentials: 'same-origin' });
    if (!r.ok) throw new Error(`session ${r.status}`);
    return r.json() as Promise<{ currency: string; siteCode: string; cartId?: string }>;
  });
}

async function waitSessionSite(page: Page, siteCode: string, timeoutMs = 35_000): Promise<void> {
  await expect.poll(async () => (await fetchJsonSession(page)).siteCode, { timeout: timeoutMs }).toBe(siteCode);
}

/** URL can show target site before GET /api/session reflects it (aligner / navigation timing). */
async function waitSessionSiteStable(page: Page, siteCode: string): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await waitSessionSite(page, siteCode, 22_000);
      return;
    } catch {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
    }
  }
  await waitSessionSite(page, siteCode, 25_000);
}

async function waitHeaderCurrencyMatchesSession(page: Page): Promise<void> {
  await expect
    .poll(
      async () => {
        const s = await fetchJsonSession(page);
        const header = await page
          .getByTestId('header-currency-display')
          .getAttribute('data-selected-currency')
          .catch(() => null);
        return header === s.currency && header !== null;
      },
      { timeout: 35_000, intervals: [200, 400, 800] },
    )
    .toBe(true);
}

async function openSiteMenu(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await expect(page.locator('button[aria-label="Site"]')).toBeVisible({ timeout: 10_000 });
  await page.locator('button[aria-label="Site"]').click();
}

async function chooseSiteByMenuLabel(page: Page, label: string): Promise<void> {
  await openSiteMenu(page);
  await page.getByRole('menuitem', { name: label }).click();
}

async function clickAddToCartAndExpectLine(page: Page, addBtn: Locator): Promise<void> {
  await expect(addBtn).toBeEnabled({ timeout: 60_000 });
  const responsePromise = page.waitForResponse(
    (r) =>
      r.request().method() === 'POST' &&
      r.url().includes('/api/cart/') &&
      r.url().includes('/items') &&
      !/\/items\/[^/?]+(\?|$)/.test(r.url()),
    { timeout: 55_000 },
  );
  await addBtn.click();
  const res = await responsePromise.catch(() => null);
  if (res && !res.ok()) {
    const text = await res.text().catch(() => '');
    throw new Error(`Add to cart failed: HTTP ${res.status()} ${text.slice(0, 240)}`);
  }
  await expect.poll(() => cartLineQuantitySum(page), { timeout: 35_000 }).toBeGreaterThanOrEqual(1);
}

test.describe('Main ↔ us-branch cart preservation', () => {
  test.describe.configure({ mode: 'serial' });

  test.skip(!AVAILABLE.includes('us-branch'), 'Requires us-branch in NEXT_PUBLIC_AVAILABLE_SITES');
  test.skip(AVAILABLE.length < 2, 'Requires at least two sites in NEXT_PUBLIC_AVAILABLE_SITES');

  test('add on main (non-us), switch to US, switch back — cart qty preserved', async ({ page }) => {
    test.setTimeout(300_000);

    const consoleLines: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleLines.push(`[${msg.type()}] ${msg.text()}`);
      }
    });

    await page.goto(`/${MAIN_SITE}/en/`);
    await waitSessionSiteStable(page, MAIN_SITE);
    await waitHeaderCurrencyMatchesSession(page);

    await page.goto(`/${MAIN_SITE}/en/product/${PRODUCT_ID}`);
    await waitHeaderCurrencyMatchesSession(page);
    const addBtn = page.getByTestId('product-addToCartButton').first();
    await clickAddToCartAndExpectLine(page, addBtn);

    const qtyAfterAdd = await cartLineQuantitySum(page);
    const sessionAfterAdd = await fetchJsonSession(page);
    expect(qtyAfterAdd, 'expected at least one line after add').toBeGreaterThanOrEqual(1);
    // eslint-disable-next-line no-console
    console.log('[roundtrip] after add on main', { MAIN_SITE, qtyAfterAdd, session: sessionAfterAdd });

    await chooseSiteByMenuLabel(page, US_SITE_MENU_LABEL);
    await expect(page).toHaveURL(/us-branch/, { timeout: 35_000 });
    await waitSessionSiteStable(page, 'us-branch');
    await waitHeaderCurrencyMatchesSession(page);
    const qtyOnUs = await cartLineQuantitySum(page);
    const sessionOnUs = await fetchJsonSession(page);
    // eslint-disable-next-line no-console
    console.log('[roundtrip] on us-branch', { qtyOnUs, session: sessionOnUs });

    await chooseSiteByMenuLabel(page, OTHER_SITE_MENU_LABEL);
    await expect(page).not.toHaveURL(/us-branch/, { timeout: 30_000 });
    await waitSessionSiteStable(page, MAIN_SITE);
    await waitHeaderCurrencyMatchesSession(page);

    const qtyBackOnMain = await cartLineQuantitySum(page);
    const sessionBack = await fetchJsonSession(page);
    // eslint-disable-next-line no-console
    console.log('[roundtrip] back on main', { qtyBackOnMain, qtyAfterAdd, session: sessionBack });

    if (qtyBackOnMain < qtyAfterAdd) {
      // eslint-disable-next-line no-console
      console.error('[roundtrip] console tail', consoleLines.slice(-30));
    }

    expect(
      qtyBackOnMain,
      `Cart should still have at least the lines from main after round-trip (had ${qtyAfterAdd}, now ${qtyBackOnMain}). session=${JSON.stringify(sessionBack)}`,
    ).toBeGreaterThanOrEqual(qtyAfterAdd);
  });
});
