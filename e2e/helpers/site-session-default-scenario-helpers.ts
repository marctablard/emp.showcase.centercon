import { type Page, expect } from '@playwright/test';

export interface SiteRow {
  code: string;
  name: string;
}

export interface SessionJson {
  currency: string;
  siteCode: string;
}

export interface ApiCart {
  id?: string;
  currency: string;
  site: string;
  items: { quantity: number; product?: { id?: string; name?: string } }[];
}

export async function getAvailableSites(page: Page): Promise<SiteRow[]> {
  return page.evaluate(async () => {
    const r = await fetch('/api/site', { cache: 'no-store', credentials: 'same-origin' });
    if (!r.ok) throw new Error(`site ${r.status}`);
    const j = (await r.json()) as { available?: { code: string; name?: string }[] };
    return (j.available ?? []).map((s) => ({ code: s.code, name: s.name ?? s.code }));
  });
}

export function pickNaturaLike(sites: SiteRow[]): SiteRow | undefined {
  const byName = sites.find((s) => /natura/i.test(s.name));
  if (byName) return byName;
  return sites.find((s) => s.code === 'brand1');
}

export function pickShowcaseSite(sites: SiteRow[], usCode: string): SiteRow | undefined {
  return sites.find((s) => s.code === 'main') ?? sites.find((s) => s.code !== usCode);
}

export async function fetchJsonSession(page: Page): Promise<SessionJson> {
  return page.evaluate(async () => {
    const r = await fetch('/api/session', { cache: 'no-store', credentials: 'same-origin' });
    if (!r.ok) throw new Error(`session ${r.status}`);
    return r.json() as Promise<SessionJson>;
  });
}

export async function fetchCart(page: Page): Promise<ApiCart | null> {
  return page.evaluate(async () => {
    const r = await fetch('/api/cart?create=false', { cache: 'no-store', credentials: 'same-origin' });
    if (r.status === 204) return null;
    if (!r.ok) return null;
    return r.json() as Promise<ApiCart>;
  });
}

async function waitSessionSite(page: Page, siteCode: string, timeoutMs: number): Promise<void> {
  await expect.poll(async () => (await fetchJsonSession(page)).siteCode, { timeout: timeoutMs }).toBe(siteCode);
}

export async function waitSessionSiteStable(page: Page, siteCode: string): Promise<void> {
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

export async function waitHeaderCurrencyMatchesSession(page: Page, timeoutMs = 35_000): Promise<void> {
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
      { timeout: timeoutMs, intervals: [200, 400, 800] },
    )
    .toBe(true);
}

export async function ensureSiteSwitcherVisible(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await expect(page.locator('button[aria-label="Site"]')).toBeVisible({ timeout: 10_000 });
}

export async function switchToSiteFromHeader(page: Page, menuLabel: string): Promise<void> {
  await ensureSiteSwitcherVisible(page);
  await page.locator('button[aria-label="Site"]').click();
  const put = page.waitForResponse(
    (r) =>
      r.url().includes('/api/session/site') && r.request().method() === 'PUT' && r.status() >= 200 && r.status() < 300,
    { timeout: 45_000 },
  );
  await page.getByRole('menuitem', { name: menuLabel }).click();
  await put;
}

export async function gotoSiteLocaleStable(page: Page, siteCode: string, locale = 'en'): Promise<void> {
  await page.goto(`/${siteCode}/${locale}/`, { waitUntil: 'domcontentloaded' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitSessionSiteStable(page, siteCode);
  await waitHeaderCurrencyMatchesSession(page);
}

export async function searchOpenFirstPdp(page: Page, query: string): Promise<void> {
  const input = page.getByTestId('header-searchInput');
  await expect(input).toBeVisible({ timeout: 45_000 });
  await input.fill(query);
  await page.getByTestId('header-searchButton').click();
  await expect(page).toHaveURL(/browse/, { timeout: 45_000 });
  const first = page.locator('main a[href*="/product/"]').first();
  await expect(first).toBeVisible({ timeout: 60_000 });
  await first.click();
  await expect(page).toHaveURL(/\/product\//, { timeout: 60_000 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect
    .poll(
      async () =>
        (await page.locator('[data-testid="product-price"]').first().getAttribute('data-product-currency')) ?? '',
      { timeout: 75_000 },
    )
    .not.toBe('');
}

/**
 * After search results, open a PDP — prefer a result row mentioning `prefer` (e.g. 100W).
 */
export async function searchOpenPdpPreferringRowText(page: Page, query: string, prefer: RegExp): Promise<void> {
  const input = page.getByTestId('header-searchInput');
  await expect(input).toBeVisible({ timeout: 45_000 });
  await input.fill(query);
  await page.getByTestId('header-searchButton').click();
  await expect(page).toHaveURL(/browse/, { timeout: 45_000 });
  const preferred = page.locator('main a[href*="/product/"]').filter({ hasText: prefer }).first();
  if (await preferred.isVisible({ timeout: 8000 }).catch(() => false)) {
    await preferred.click();
  } else {
    const first = page.locator('main a[href*="/product/"]').first();
    await expect(first).toBeVisible({ timeout: 60_000 });
    await first.click();
  }
  await expect(page).toHaveURL(/\/product\//, { timeout: 60_000 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect
    .poll(
      async () =>
        (await page.locator('[data-testid="product-price"]').first().getAttribute('data-product-currency')) ?? '',
      { timeout: 75_000 },
    )
    .not.toBe('');
}

export async function assertPdpCurrencyAlignedWithSession(page: Page): Promise<void> {
  await waitHeaderCurrencyMatchesSession(page);
  const s = await fetchJsonSession(page);
  const pdp =
    (await page.locator('[data-testid="product-price"]').first().getAttribute('data-product-currency')) ?? null;
  if (pdp) {
    expect(pdp, 'PDP data-product-currency should match session').toBe(s.currency);
  }
}

export function productIdFromUrl(page: Page): string | null {
  const m = page.url().match(/\/product\/([^/?#]+)/);
  return m?.[1] ?? null;
}

export async function closeAddToCartModalIfOpen(page: Page): Promise<void> {
  const btn = page.getByRole('button', { name: /Continue Shopping|Weiter einkaufen/i });
  if (await btn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await btn.click();
    await expect(btn).toBeHidden({ timeout: 10_000 });
  }
}

export type AddOutcome = 'added' | 'disabled';

export async function clickAddToCartFirst(page: Page): Promise<AddOutcome> {
  const addBtn = page.getByTestId('product-addToCartButton').first();
  await expect(addBtn).toBeVisible({ timeout: 30_000 });
  if (!(await addBtn.isEnabled())) {
    return 'disabled';
  }
  await Promise.all([
    page.waitForResponse(
      (r) =>
        r.request().method() === 'POST' &&
        r.url().includes('/api/cart/') &&
        r.url().includes('/items') &&
        !/\/items\/[^/?]+(\?|$)/.test(r.url()),
      { timeout: 90_000 },
    ),
    addBtn.click(),
  ]);
  return 'added';
}

export async function expectCartContainsProductWithCurrency(
  page: Page,
  productId: string,
  expectedCurrency: string,
): Promise<void> {
  await expect
    .poll(
      async () => {
        const cart = await fetchCart(page);
        if (!cart?.items?.length) return false;
        const hit = cart.items.some((i) => i.product?.id === productId && i.quantity > 0);
        return hit && cart.currency === expectedCurrency;
      },
      { timeout: 45_000 },
    )
    .toBe(true);
}
