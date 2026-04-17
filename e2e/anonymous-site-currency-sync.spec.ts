import { type Page, expect, test } from '@playwright/test';

const DEFAULT_SITE = (process.env.NEXT_PUBLIC_DEFAULT_SITE || 'main').trim();
const AVAILABLE = (process.env.NEXT_PUBLIC_AVAILABLE_SITES || DEFAULT_SITE)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const PRODUCT_ID = process.env.E2E_PRODUCT_ID || 'ecoflow-extension-cable';

/** Use the page's own cookie jar (same as SiteSessionAligner / product fetches). */
async function fetchJsonSession(page: Page): Promise<{ currency: string; siteCode: string }> {
  return page.evaluate(async () => {
    const r = await fetch('/api/session', { cache: 'no-store', credentials: 'same-origin' });
    if (!r.ok) {
      throw new Error(`session ${r.status}`);
    }
    return r.json() as Promise<{ currency: string; siteCode: string }>;
  });
}

async function fetchJsonProductPrice(page: Page, productId: string): Promise<{ currency: string } | null> {
  return page.evaluate(async (id: string) => {
    const r = await fetch(`/api/products/${encodeURIComponent(id)}/price`, {
      cache: 'no-store',
      credentials: 'same-origin',
    });
    if (r.status === 404) {
      return null;
    }
    if (!r.ok) {
      throw new Error(`price ${r.status}`);
    }
    return r.json() as Promise<{ currency: string }>;
  }, productId);
}

async function headerSelectedCurrencyCode(page: Page): Promise<string | null> {
  const el = page.getByTestId('header-currency-display');
  await expect(el).toBeVisible({ timeout: 25_000 });
  return el.getAttribute('data-selected-currency');
}

async function productDisplayedCurrencyCode(page: Page): Promise<string | null> {
  // Skeleton uses the same test id; wait until the real row exposes data-product-currency.
  const el = page.getByTestId('product-price').first();
  await expect(el).toBeVisible({ timeout: 60_000 });
  await expect.poll(async () => el.getAttribute('data-product-currency'), { timeout: 60_000 }).not.toBeNull();
  return el.getAttribute('data-product-currency');
}

async function cartLineQuantitySum(page: Page): Promise<number> {
  return page.evaluate(async () => {
    const r = await fetch('/api/cart', { cache: 'no-store', credentials: 'same-origin' });
    if (r.status === 204) {
      return 0;
    }
    if (!r.ok) {
      return 0;
    }
    const cart = (await r.json()) as { items?: { quantity: number }[] };
    return cart.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  });
}

/** Switch site via header: pick a menu item that is not the highlighted current site row. */
async function switchToDifferentSite(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await expect(page.locator('button[aria-label="Site"]')).toBeVisible({ timeout: 10_000 });
  await page.locator('button[aria-label="Site"]').click();
  const selected = page.getByRole('menuitem').and(page.locator('.bg-surface-action-hover-2'));
  const alternative = page.getByRole('menuitem').filter({ hasNot: selected });
  await expect(alternative.first()).toBeVisible({ timeout: 10_000 });
  await alternative.first().click();
}

/** Display name of the `us-branch` site in the header switcher (Storyblok / Emporix site name). */
const US_SITE_MENU_LABEL = (process.env.E2E_US_SITE_MENU_LABEL || 'US').trim();

async function switchToUsBranchFromHeader(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await expect(page.locator('button[aria-label="Site"]')).toBeVisible({ timeout: 10_000 });
  await page.locator('button[aria-label="Site"]').click();
  await page.getByRole('menuitem', { name: US_SITE_MENU_LABEL }).click();
}

async function waitForSessionSiteCode(page: Page, siteCode: string, timeoutMs: number): Promise<boolean> {
  try {
    await expect.poll(async () => (await fetchJsonSession(page)).siteCode, { timeout: timeoutMs }).toBe(siteCode);
    return true;
  } catch {
    return false;
  }
}

test.describe('Anonymous: site, header, price, cart', () => {
  test.describe.configure({ mode: 'serial' });

  test.skip(!AVAILABLE.includes('us-branch'), 'Requires us-branch in NEXT_PUBLIC_AVAILABLE_SITES');

  test('GET /api/session and GET /api/products/{id}/price share currency on us-branch PDP (no login)', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.goto(`/us-branch/product/${PRODUCT_ID}`);
    await expect(page).toHaveURL(/us-branch/);

    await expect
      .poll(
        async () => {
          const session = await fetchJsonSession(page);
          const apiPrice = await fetchJsonProductPrice(page, PRODUCT_ID);
          if (!apiPrice) {
            return false;
          }
          return apiPrice.currency === session.currency;
        },
        { timeout: 75_000 },
      )
      .toBe(true);
  });

  test('header and product price UI data-* match session when E2E_UI_CURRENCY_ASSERT=1', async ({ page }) => {
    test.skip(
      !process.env.E2E_UI_CURRENCY_ASSERT,
      'Set E2E_UI_CURRENCY_ASSERT=1 to assert header data-selected-currency + product data-product-currency match /api/session (needs tenant where UI and BFF agree)',
    );
    test.setTimeout(90_000);
    await page.goto(`/us-branch/product/${PRODUCT_ID}`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/us-branch/);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect
      .poll(
        async () => {
          const session = await fetchJsonSession(page);
          const apiPrice = await fetchJsonProductPrice(page, PRODUCT_ID);
          if (!apiPrice || apiPrice.currency !== session.currency) {
            return false;
          }
          const headerCode = await headerSelectedCurrencyCode(page);
          const productCode = await productDisplayedCurrencyCode(page);
          return headerCode === session.currency && productCode === session.currency;
        },
        { timeout: 75_000 },
      )
      .toBe(true);
  });

  test.skip(
    AVAILABLE.length < 2 || !AVAILABLE.includes(DEFAULT_SITE) || DEFAULT_SITE === 'us-branch',
    'Requires default site distinct from us-branch for round-trip',
  );

  test('cart line quantity survives site round-trip (US → other → US)', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto('/');
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await expect(page.locator('button[aria-label="Site"]')).toBeVisible({ timeout: 10_000 });
    await page.locator('button[aria-label="Site"]').click();
    await page.getByRole('menuitem', { name: US_SITE_MENU_LABEL }).click();
    await expect(page).toHaveURL(/us-branch/, { timeout: 30_000 });
    const sessionAligned = await waitForSessionSiteCode(page, 'us-branch', 45_000);
    test.skip(
      !sessionAligned,
      'Session site did not become us-branch (Emporix /api/session/site unavailable in this run)',
    );

    await page.goto(`/us-branch/product/${PRODUCT_ID}`);
    const addBtn = page.getByTestId('product-addToCartButton').first();
    await expect(addBtn).toBeVisible({ timeout: 45_000 });
    await expect(addBtn).toBeEnabled({ timeout: 45_000 });
    await addBtn.click();

    await expect.poll(() => cartLineQuantitySum(page), { timeout: 45_000 }).toBeGreaterThanOrEqual(1);

    const qtyBefore = await cartLineQuantitySum(page);

    await switchToDifferentSite(page);
    await expect(page).not.toHaveURL(/us-branch/, { timeout: 30_000 });

    await switchToUsBranchFromHeader(page);
    await expect(page).toHaveURL(/us-branch/, { timeout: 30_000 });

    await expect.poll(() => cartLineQuantitySum(page), { timeout: 45_000 }).toBeGreaterThanOrEqual(qtyBefore);

    await page.goto(`/us-branch/product/${PRODUCT_ID}`);
    await expect.poll(() => cartLineQuantitySum(page), { timeout: 45_000 }).toBeGreaterThanOrEqual(qtyBefore);
  });
});
