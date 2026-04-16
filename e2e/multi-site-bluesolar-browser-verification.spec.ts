/**
 * Manual-style browser verification: multi-site search → PDP price vs header/session → cart.
 * Writes a timestamped markdown report under e2e/plan/ for correlation with Next server logs.
 *
 * Run (dev server on :3000):
 *   npx playwright test e2e/multi-site-bluesolar-browser-verification.spec.ts --project=chromium
 */
import { type Page, expect, test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPORT_PATH = path.join(process.cwd(), 'e2e/plan/multi-site-bluesolar-browser-verification.md');

type Snap = {
  step: string;
  note: string;
  href: string;
  pathSite: string;
  sessionSite: string | null;
  sessionCcy: string | null;
  headerCcy: string | null;
  pdpCcy: string | null;
  priceAligned: 'yes' | 'no' | 'n/a';
  cartId: string | null;
  cartSite: string | null;
  cartCcy: string | null;
  cartItems: number;
  addToCartEnabled: boolean | null;
};

async function fetchSnap(page: Page, step: string, note: string): Promise<Snap> {
  const raw = await page.evaluate(
    async ({ stepArg, noteArg }: { stepArg: string; noteArg: string }) => {
      const sessionR = await fetch('/api/session', { cache: 'no-store', credentials: 'same-origin' });
      const session = sessionR.ok ? ((await sessionR.json()) as { siteCode?: string; currency?: string }) : null;
      let cart: {
        id?: string;
        site?: string;
        currency?: string;
        totalPrice?: { currency?: string };
        items?: { quantity: number }[];
      } | null = null;
      const cartR = await fetch('/api/cart?create=false', { cache: 'no-store', credentials: 'same-origin' });
      if (cartR.status === 200) {
        cart = (await cartR.json()) as typeof cart;
      }
      const segs = window.location.pathname.split('/').filter(Boolean);
      const pathSite = (segs[0] === 'product' ? session?.siteCode : segs[0]) ?? session?.siteCode ?? '';
      const headerEl = document.querySelector('[data-testid="header-currency-display"]');
      const headerCcy = headerEl?.getAttribute('data-selected-currency') ?? null;
      const priceEl = document.querySelector('[data-testid="product-price"]');
      const pdpCcy = priceEl?.getAttribute('data-product-currency');
      const btn = document.querySelector('[data-testid="product-addToCartButton"]') as HTMLButtonElement | null;
      const sc = session?.currency ?? null;
      const ss = session?.siteCode ?? null;
      let priceAligned: 'yes' | 'no' | 'n/a' = 'n/a';
      if (sc && headerCcy && pdpCcy) {
        priceAligned = sc === headerCcy && sc === pdpCcy ? 'yes' : 'no';
      } else if (sc && headerCcy && !pdpCcy) {
        priceAligned = sc === headerCcy ? 'yes' : 'no';
      }
      return {
        step: stepArg,
        note: noteArg,
        href: window.location.href,
        pathSite,
        sessionSite: ss,
        sessionCcy: sc,
        headerCcy,
        pdpCcy: pdpCcy ?? null,
        priceAligned,
        cartId: cart?.id ?? null,
        cartSite: cart?.site ?? null,
        cartCcy: cart?.currency ?? cart?.totalPrice?.currency ?? null,
        cartItems: cart?.items?.reduce((a, i) => a + i.quantity, 0) ?? 0,
        addToCartEnabled: btn ? !btn.disabled : null,
      };
    },
    { stepArg: step, noteArg: note },
  );
  return raw as Snap;
}

function appendReport(lines: string[]): void {
  fs.appendFileSync(REPORT_PATH, `${lines.join('\n')}\n`, 'utf8');
}

function initReport(): void {
  const header = `# Multi-site Bluesolar browser verification

Generated (UTC): ${new Date().toISOString()}

## Correlation

- Match Playwright stdout JSON (if enabled) and this file with **Next.js terminal** logs (same timestamps).
- Chrome DevTools MCP was not available in this agent session; use browser DevTools Network manually for \`/api/session\`, \`/api/cart\`, \`/api/session/site\` if needed.

## Legend

- **Path site**: first segment of pathname (\`/main/…\`, \`/us-branch/…\`).
- **Price aligned**: \`session.currency\` equals header \`data-selected-currency\` and PDP \`data-product-currency\` when the latter exists.

| Step | Note | URL | Path site | Session site | Session ccy | Header ccy | PDP price ccy | Price aligned | Cart id | Cart site | Cart ccy | Cart items | Add-to-cart enabled |
|------|------|-----|-----------|--------------|-------------|------------|----------------|-----------------|---------|------------|----------|------------|---------------------|
`;
  fs.writeFileSync(REPORT_PATH, header, 'utf8');
}

function row(s: Snap): string {
  const esc = (v: string | number | boolean | null | undefined) =>
    String(v ?? '')
      .replace(/\|/g, '\\|')
      .replace(/\r?\n/g, ' ');
  return `| ${esc(s.step)} | ${esc(s.note)} | ${esc(s.href)} | ${esc(s.pathSite)} | ${esc(s.sessionSite)} | ${esc(s.sessionCcy)} | ${esc(s.headerCcy)} | ${esc(s.pdpCcy)} | ${esc(s.priceAligned)} | ${esc(s.cartId)} | ${esc(s.cartSite)} | ${esc(s.cartCcy)} | ${esc(s.cartItems)} | ${esc(s.addToCartEnabled)} |`;
}

async function getAvailableSites(page: Page): Promise<{ code: string; name: string }[]> {
  return page.evaluate(async () => {
    const r = await fetch('/api/site', { cache: 'no-store', credentials: 'same-origin' });
    if (!r.ok) throw new Error(`site ${r.status}`);
    const j = (await r.json()) as { available?: { code: string; name?: string }[] };
    return (j.available ?? []).map((s) => ({ code: s.code, name: s.name ?? s.code }));
  });
}

async function gotoSiteHome(page: Page, siteCode: string): Promise<void> {
  await page.goto(`/${siteCode}/`, { waitUntil: 'domcontentloaded' });
  await page.reload({ waitUntil: 'domcontentloaded' });
}

async function switchToSiteFromHeader(page: Page, menuLabel: string): Promise<void> {
  await page.locator('button[aria-label="Site"]').click();
  const put = page.waitForResponse(
    (r) =>
      r.url().includes('/api/session/site') && r.request().method() === 'PUT' && r.status() >= 200 && r.status() < 300,
    { timeout: 45_000 },
  );
  await page.getByRole('menuitem', { name: menuLabel }).click();
  await put;
}

async function searchBluesolarOpenFirstPdp(page: Page): Promise<void> {
  const input = page.getByTestId('header-searchInput');
  await expect(input).toBeVisible({ timeout: 45_000 });
  await input.fill('bluesolar');
  await page.getByTestId('header-searchButton').click();
  await expect(page).toHaveURL(/browse/, { timeout: 45_000 });
  const first = page.locator('main a[href*="/product/"]').first();
  await expect(first).toBeVisible({ timeout: 60_000 });
  await first.click();
  await expect(page).toHaveURL(/\/product\//, { timeout: 60_000 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect
    .poll(
      async () => {
        const el = page.locator('[data-testid="product-price"]').first();
        return (await el.getAttribute('data-product-currency')) ?? '';
      },
      { timeout: 75_000 },
    )
    .not.toBe('');
}

async function waitSessionSite(page: Page, siteCode: string): Promise<void> {
  await expect
    .poll(
      async () => {
        const r = await page.evaluate(async () => {
          const res = await fetch('/api/session', { cache: 'no-store', credentials: 'same-origin' });
          if (!res.ok) return '';
          const j = (await res.json()) as { siteCode?: string };
          return j.siteCode ?? '';
        });
        return r;
      },
      { timeout: 90_000 },
    )
    .toBe(siteCode);
}

function pickNaturaLike(sites: { code: string; name: string }[]): { code: string; name: string } | undefined {
  const byName = sites.find((s) => /natura/i.test(s.name));
  if (byName) return byName;
  return sites.find((s) => s.code === 'brand1');
}

test.describe('Browser verification: multi-site bluesolar → report md', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(600_000);

  test('journey + write e2e/plan/multi-site-bluesolar-browser-verification.md', async ({ page }) => {
    initReport();

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const sites = await getAvailableSites(page);
    appendReport([
      `| (init) | Loaded /api/site available count=${sites.length} | — | — | — | — | — | n/a | — | — | — | — | — |`,
    ]);
    appendReport(
      sites.map((s) => `| (sites) | ${s.code} display="${s.name}" | — | — | — | — | — | n/a | — | — | — | — | — |`),
    );

    const us = sites.find((s) => s.code === 'us-branch') ?? sites.find((s) => /us/i.test(s.code));
    const main = sites.find((s) => s.code === 'main') ?? sites[0];
    const natura = pickNaturaLike(sites);
    test.skip(!us || !main, 'Requires main + us-branch in tenant / NEXT_PUBLIC_AVAILABLE_SITES');
    test.skip(!natura, 'Requires a Natura-like site (name contains Natura) or brand1 in /api/site available');

    // --- Per-site: home → search → PDP snapshot (add only on main + us to limit noise) ---
    for (const s of sites) {
      await gotoSiteHome(page, s.code);
      await waitSessionSite(page, s.code);
      let snap = await fetchSnap(page, `home-${s.code}`, 'after goto+reload');
      appendReport([row(snap)]);

      await searchBluesolarOpenFirstPdp(page);
      snap = await fetchSnap(page, `pdp-${s.code}`, 'after bluesolar search → first PDP');
      appendReport([row(snap)]);

      const addBtn = page.getByTestId('product-addToCartButton').first();
      if (await addBtn.isEnabled()) {
        try {
          await Promise.all([
            page.waitForResponse(
              (r) => r.url().includes('/api/cart/') && r.url().includes('/items') && r.request().method() === 'POST',
              { timeout: 90_000 },
            ),
            addBtn.click(),
          ]);
        } catch (e) {
          appendReport([
            `| add-error-${s.code} | ${String(e instanceof Error ? e.message : e)} | ${(await fetchSnap(page, '', '')).href} | — | — | — | — | — | n/a | — | — | — | — | — |`,
          ]);
        }
        snap = await fetchSnap(page, `after-add-${s.code}`, 'after add attempt (see cart items)');
        appendReport([row(snap)]);
      } else {
        appendReport([
          `| after-add-${s.code} | add disabled (no price / not purchasable) | ${snap.href} | ${snap.pathSite} | ${snap.sessionSite} | ${snap.sessionCcy} | ${snap.headerCcy} | ${snap.pdpCcy} | ${snap.priceAligned} | ${snap.cartId} | ${snap.cartSite} | ${snap.cartCcy} | ${snap.cartItems} | false |`,
        ]);
      }
    }

    // --- User script: start main, add, US ↔ main cart check ---
    await gotoSiteHome(page, main.code);
    await waitSessionSite(page, main.code);
    appendReport([row(await fetchSnap(page, 'script-main-start', 'baseline'))]);

    await searchBluesolarOpenFirstPdp(page);
    const addMain = page.getByTestId('product-addToCartButton').first();
    if (await addMain.isEnabled()) {
      await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes('/api/cart/') && r.url().includes('/items') && r.request().method() === 'POST',
          { timeout: 90_000 },
        ),
        addMain.click(),
      ]).catch(() => {});
    }
    appendReport([row(await fetchSnap(page, 'script-after-add-main', 'added on main if enabled'))]);

    await switchToSiteFromHeader(page, us!.name);
    await expect(page).toHaveURL(/us-branch/, { timeout: 35_000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitSessionSite(page, 'us-branch');
    appendReport([row(await fetchSnap(page, 'script-on-us', 'after switch to US'))]);

    await switchToSiteFromHeader(page, main.name);
    await expect
      .poll(
        async () => {
          const u = page.url();
          return !u.includes('/us-branch/');
        },
        { timeout: 35_000 },
      )
      .toBe(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitSessionSite(page, main.code);
    appendReport([row(await fetchSnap(page, 'script-back-main', 'cart should still reflect main site cart'))]);

    // --- US again: search + add ---
    await switchToSiteFromHeader(page, us!.name);
    await expect(page).toHaveURL(/us-branch/, { timeout: 35_000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitSessionSite(page, 'us-branch');
    await searchBluesolarOpenFirstPdp(page);
    const addUs = page.getByTestId('product-addToCartButton').first();
    if (await addUs.isEnabled()) {
      await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes('/api/cart/') && r.url().includes('/items') && r.request().method() === 'POST',
          { timeout: 90_000 },
        ),
        addUs.click(),
      ]).catch(() => {});
    }
    appendReport([row(await fetchSnap(page, 'script-us-second-add', 'second add on US PDP'))]);

    // --- Natura-like site ---
    await switchToSiteFromHeader(page, natura!.name);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitSessionSite(page, natura!.code);
    appendReport([row(await fetchSnap(page, 'script-on-natura', `site ${natura!.code}`))]);

    await searchBluesolarOpenFirstPdp(page);
    appendReport([row(await fetchSnap(page, 'script-natura-pdp', 'PDP on Natura-like; add may be disabled'))]);

    // --- Back to US: cart still has US lines ---
    await switchToSiteFromHeader(page, us!.name);
    await expect(page).toHaveURL(/us-branch/, { timeout: 35_000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitSessionSite(page, 'us-branch');
    appendReport([row(await fetchSnap(page, 'script-final-us', 'final US cart check'))]);

    appendReport([
      '',
      '## Summary',
      '',
      '- Separate carts per site are implied when `cart.site` matches the active session site after each switch; compare **Cart id** across rows.',
      '- If **Price aligned** is `no` after a switch, reload once (this script already reloads after navigations that commonly desync session vs URL).',
      '',
    ]);
  });
});
