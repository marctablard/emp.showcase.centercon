import { type Locator, type Page, expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const DEFAULT_SITE = (process.env.NEXT_PUBLIC_DEFAULT_SITE || 'main').trim();
const AVAILABLE = (process.env.NEXT_PUBLIC_AVAILABLE_SITES || DEFAULT_SITE)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const PRODUCT_ID = process.env.E2E_PRODUCT_ID || 'ecoflow-extension-cable';
const US_SITE_MENU_LABEL = (process.env.E2E_US_SITE_MENU_LABEL || 'US').trim();
const OTHER_SITE_MENU_LABEL = (process.env.E2E_OTHER_SITE_MENU_LABEL || 'Showcase').trim();

const REPORT_PATH = path.join(process.cwd(), 'e2e/plan/site-cart-currency-last-run.md');

interface JourneyRow {
  step: string;
  pathname: string;
  sessionSite: string;
  sessionCurrency: string;
  headerCurrency: string | null;
  cartQty: number;
}

const nonUsSiteCode = AVAILABLE.find((s) => s !== 'us-branch');

function formatDriftSection(allRows: JourneyRow[]): string {
  const currencyMismatches = allRows.filter((r) => r.headerCurrency !== null && r.headerCurrency !== r.sessionCurrency);
  let out = `## Sync drift (header currency vs session)\n\n`;
  if (currencyMismatches.length === 0) {
    out += `_No rows where \`data-selected-currency\` differed from \`GET /api/session\` currency._\n\n`;
    return out;
  }
  out += `These snapshots were taken while the header still disagreed with session (transitional UI or \`router.refresh\` lag). The spec now **waits for alignment** before most steps — re-run should shrink this list.\n\n`;
  out += `| Step | Session ccy | Header ccy |\n|------|-------------|------------|\n`;
  for (const r of currencyMismatches) {
    out += `| ${r.step.replace(/\|/g, '/')} | ${r.sessionCurrency} | ${r.headerCurrency} |\n`;
  }
  out += `\n`;
  return out;
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

async function snapshot(page: Page, step: string): Promise<JourneyRow> {
  const s = await fetchJsonSession(page);
  const header = await page
    .getByTestId('header-currency-display')
    .getAttribute('data-selected-currency')
    .catch(() => null);
  const qty = await cartLineQuantitySum(page);
  return {
    step,
    pathname: new URL(page.url()).pathname,
    sessionSite: s.siteCode,
    sessionCurrency: s.currency,
    headerCurrency: header,
    cartQty: qty,
  };
}

async function waitSessionSite(page: Page, siteCode: string, timeoutMs: number): Promise<void> {
  await expect.poll(async () => (await fetchJsonSession(page)).siteCode, { timeout: timeoutMs }).toBe(siteCode);
}

/** URL can show `us-branch` before `GET /api/session` reflects it (aligner / cookie timing). */
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

/** Header `data-selected-currency` is driven by client session store; wait after site/currency changes. */
async function waitHeaderCurrencyMatchesSession(page: Page, timeoutMs = 35_000): Promise<void> {
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

async function openSiteMenu(page: Page): Promise<void> {
  await page.locator('button[aria-label="Site"]').click();
}

async function chooseSiteByMenuLabel(page: Page, label: string): Promise<void> {
  await openSiteMenu(page);
  await page.getByRole('menuitem', { name: label }).click();
}

/** Pick another currency from header if at least two menu items exist; no-op if only one. */
async function clickAddToCartAndExpectLine(page: Page, addBtn: Locator): Promise<void> {
  for (let attempt = 0; attempt < 2; attempt++) {
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
    try {
      await expect.poll(() => cartLineQuantitySum(page), { timeout: 25_000 }).toBeGreaterThanOrEqual(1);
      return;
    } catch {
      await page.reload({ waitUntil: 'domcontentloaded' });
    }
  }
  await expect.poll(() => cartLineQuantitySum(page), { timeout: 35_000 }).toBeGreaterThanOrEqual(1);
}

async function closeAddToCartModalIfOpen(page: Page): Promise<void> {
  const btn = page.getByRole('button', { name: /Continue Shopping|Weiter einkaufen/i });
  if (await btn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await btn.click();
    await expect(btn).toBeHidden({ timeout: 10_000 });
  }
}

async function trySwitchToAlternateCurrency(page: Page): Promise<boolean> {
  const wrap = page.getByTestId('header-currency-display');
  await expect(wrap).toBeVisible({ timeout: 20_000 });
  await wrap.getByRole('button').click();
  const items = page.getByRole('menuitem');
  const n = await items.count();
  if (n < 2) {
    await page.keyboard.press('Escape').catch(() => undefined);
    return false;
  }
  await items.nth(1).click();
  return true;
}

/** PDP adds stack quantity; cart UI shows trash only when qty ≤ 1, otherwise minus. */
async function clearProductLineFromCartUi(page: Page, productId: string): Promise<void> {
  await expect.poll(async () => cartLineQuantitySum(page), { timeout: 60_000 }).toBeGreaterThan(0);
  await expect
    .poll(
      async () => {
        const sum = await cartLineQuantitySum(page);
        if (sum === 0) {
          return 0;
        }
        const remove = page.getByTestId(`cart-item-remove-${productId}`);
        const decrease = page.getByTestId(`cart-item-decrease-${productId}`);
        if (await remove.isVisible().catch(() => false)) {
          await remove.click();
        } else if (await decrease.isVisible().catch(() => false)) {
          await decrease.click();
        }
        return await cartLineQuantitySum(page);
      },
      { timeout: 60_000, intervals: [300, 500, 800] },
    )
    .toBe(0);
}

function rowsToMarkdown(runLabel: string, rows: JourneyRow[]): string {
  const header = `| Step | Path (prefix) | Session site | Session ccy | Header ccy | Cart qty |\n|------|---------------|--------------|-------------|------------|----------|\n`;
  const lines = rows.map(
    (r) =>
      `| ${r.step.replace(/\|/g, '/')} | \`${r.pathname.slice(0, 48)}${r.pathname.length > 48 ? '…' : ''}\` | ${r.sessionSite} | ${r.sessionCurrency} | ${r.headerCurrency ?? '—'} | ${r.cartQty} |`,
  );
  return `## ${runLabel}\n\n${header}${lines.join('\n')}\n`;
}

function writeReport(
  sections: string[],
  consoleLines: string[],
  failedRequests: string[],
  allRows: JourneyRow[],
): void {
  let body = `# site-cart-currency-last-run\n\nGenerated (UTC): ${new Date().toISOString()}\n\n`;
  body += formatDriftSection(allRows);
  body += sections.join('\n');
  body += `\n## Console (errors / warnings)\n\n`;
  body += consoleLines.length ? '```\n' + consoleLines.slice(-80).join('\n') + '\n```\n' : '_None captured._\n';
  body += `\n## requestfailed\n\n`;
  body += failedRequests.length
    ? failedRequests
        .slice(-40)
        .map((u) => `- ${u}`)
        .join('\n')
    : '_None._\n';
  body += `\n\n## Known non-fatal noise (documented)\n\n`;
  body += `- **409** on cart currency update: common when session/site and cart currency disagree during transitions; store layer retries or clears cart.\n`;
  body += `- **fetchCart received cart from wrong site — discarding**: intentional guard when URL/site cookie and cart tenant diverge.\n`;
  body += `- **net::ERR_ABORTED** on \`/api/cart\`, RSC, or \`/api/debug/stream\`: navigation replaced in-flight requests (Playwright).\n`;
  body += `- **404** on Storyblok or media: environment or draft content; unrelated to journey assertions.\n`;
  fs.writeFileSync(REPORT_PATH, body, 'utf8');
  // Also mirror to stdout for terminal watchers
  process.stdout.write('\n' + body + '\n');
}

/**
 * One full pass: ≥3 site switches, ≥2 currency attempts, add cart twice, remove once.
 */
async function executeJourney(page: Page, runLabel: string): Promise<JourneyRow[]> {
  const rows: JourneyRow[] = [];

  if (nonUsSiteCode) {
    await page.goto(`/${nonUsSiteCode}/en/`);
    await waitSessionSiteStable(page, nonUsSiteCode);
    await waitHeaderCurrencyMatchesSession(page);
    rows.push(await snapshot(page, `${runLabel}: start (${nonUsSiteCode} home)`));
  } else {
    await page.goto('/');
    rows.push(await snapshot(page, `${runLabel}: open /`));
  }

  await chooseSiteByMenuLabel(page, US_SITE_MENU_LABEL);
  await expect(page).toHaveURL(/us-branch/, { timeout: 35_000 });
  await waitSessionSiteStable(page, 'us-branch');
  await waitHeaderCurrencyMatchesSession(page);
  rows.push(await snapshot(page, `${runLabel}: site → US (us-branch)`));

  await page.goto(`/us-branch/product/${PRODUCT_ID}`);
  await waitHeaderCurrencyMatchesSession(page);
  const addBtn = page.getByTestId('product-addToCartButton').first();
  await clickAddToCartAndExpectLine(page, addBtn);
  rows.push(await snapshot(page, `${runLabel}: add to cart (1st, default currency)`));
  await closeAddToCartModalIfOpen(page);

  const ccy1 = await trySwitchToAlternateCurrency(page);
  if (ccy1) {
    await page.waitForTimeout(1200);
    await waitHeaderCurrencyMatchesSession(page);
    rows.push(await snapshot(page, `${runLabel}: currency toggle #1 (after 1st add)`));
  } else {
    rows.push(await snapshot(page, `${runLabel}: currency toggle #1 (skipped — single option)`));
  }

  await chooseSiteByMenuLabel(page, OTHER_SITE_MENU_LABEL);
  await expect(page).not.toHaveURL(/us-branch/, { timeout: 30_000 });
  if (nonUsSiteCode) {
    await waitSessionSiteStable(page, nonUsSiteCode);
  }
  await waitHeaderCurrencyMatchesSession(page);
  rows.push(await snapshot(page, `${runLabel}: site → other (not us-branch)`));

  const ccy2 = await trySwitchToAlternateCurrency(page);
  if (ccy2) {
    await page.waitForTimeout(800);
    await waitHeaderCurrencyMatchesSession(page);
    rows.push(await snapshot(page, `${runLabel}: currency toggle #2`));
  } else {
    rows.push(await snapshot(page, `${runLabel}: currency toggle #2 (skipped)`));
  }

  await chooseSiteByMenuLabel(page, US_SITE_MENU_LABEL);
  await expect(page).toHaveURL(/us-branch/, { timeout: 35_000 });
  await waitSessionSiteStable(page, 'us-branch');
  await waitHeaderCurrencyMatchesSession(page);
  rows.push(await snapshot(page, `${runLabel}: site → US again`));

  await page.goto(`/us-branch/product/${PRODUCT_ID}`);
  await waitHeaderCurrencyMatchesSession(page);
  const add2 = page.getByTestId('product-addToCartButton').first();
  await clickAddToCartAndExpectLine(page, add2);
  rows.push(await snapshot(page, `${runLabel}: add to cart (2nd)`));
  await closeAddToCartModalIfOpen(page);
  await waitHeaderCurrencyMatchesSession(page);

  await chooseSiteByMenuLabel(page, OTHER_SITE_MENU_LABEL);
  await expect(page).not.toHaveURL(/us-branch/, { timeout: 30_000 });
  if (nonUsSiteCode) {
    await waitSessionSiteStable(page, nonUsSiteCode);
  }
  await waitHeaderCurrencyMatchesSession(page);
  rows.push(await snapshot(page, `${runLabel}: site → other (3rd switch)`));

  await chooseSiteByMenuLabel(page, US_SITE_MENU_LABEL);
  await expect(page).toHaveURL(/us-branch/, { timeout: 35_000 });
  await waitSessionSiteStable(page, 'us-branch');
  await waitHeaderCurrencyMatchesSession(page);
  rows.push(await snapshot(page, `${runLabel}: site → US (4th switch)`));

  await page.goto(`/us-branch/cart`);
  await waitHeaderCurrencyMatchesSession(page);
  await clearProductLineFromCartUi(page, PRODUCT_ID);
  rows.push(await snapshot(page, `${runLabel}: cleared product line on /cart`));

  return rows;
}

test.describe('Site / cart / currency journey (2 full runs)', () => {
  test.describe.configure({ mode: 'serial' });

  test.skip(!AVAILABLE.includes('us-branch'), 'Requires us-branch in NEXT_PUBLIC_AVAILABLE_SITES');
  test.skip(AVAILABLE.length < 2, 'Requires at least two sites in NEXT_PUBLIC_AVAILABLE_SITES');

  test('two full runs with site switches, currency toggles, add/remove cart', async ({ page }) => {
    test.setTimeout(600_000);

    const consoleLines: string[] = [];
    const failedRequests: string[] = [];

    page.on('console', (msg) => {
      const t = msg.type();
      if (t === 'error' || t === 'warning') {
        consoleLines.push(`[${t}] ${msg.text()}`);
      }
    });
    page.on('requestfailed', (req) => {
      failedRequests.push(`${req.failure()?.errorText ?? 'failed'} ${req.url()}`);
    });

    const sections: string[] = [];

    const nonUsSite = AVAILABLE.find((s) => s !== 'us-branch');
    const allRows: JourneyRow[] = [];

    for (const label of ['Full journey run A', 'Full journey run B'] as const) {
      const rows = await executeJourney(page, label);
      allRows.push(...rows);
      sections.push(rowsToMarkdown(label, rows));
      process.stdout.write(`\n[playwright] Completed ${label} (${rows.length} snapshots)\n`);
      if (label === 'Full journey run A' && nonUsSite) {
        await page.goto(`/${nonUsSite}/en/`);
        await waitSessionSiteStable(page, nonUsSite);
        await waitHeaderCurrencyMatchesSession(page);
      }
      await page.goto('/');
      await page.waitForTimeout(500);
    }

    writeReport(sections, consoleLines, failedRequests, allRows);
  });
});
