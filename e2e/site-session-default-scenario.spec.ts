/**
 * Automated version of `.cursor/skills/site-session-cart-browser-flow/default-scenario.md`.
 * Run (webServer starts `npm run dev` when port 3000 is free):
 *   npx playwright test e2e/site-session-default-scenario.spec.ts --project=chromium --reporter=list
 *
 * Optional env (defaults match the documented scenario):
 *   E2E_EXPECT_CCY_SHOWCASE (default EUR), E2E_EXPECT_CCY_US (default USD), E2E_EXPECT_CCY_NATURA (default CHF)
 *   E2E_US_SITE_MENU_LABEL (default US), E2E_OTHER_SITE_MENU_LABEL (default Showcase)
 */
import { expect, test } from '@playwright/test';
import {
  assertPdpCurrencyAlignedWithSession,
  clickAddToCartFirst,
  closeAddToCartModalIfOpen,
  expectCartContainsProductWithCurrency,
  fetchCart,
  fetchJsonSession,
  getAvailableSites,
  gotoSiteLocaleStable,
  pickNaturaLike,
  pickShowcaseSite,
  productIdFromUrl,
  searchOpenFirstPdp,
  searchOpenPdpPreferringRowText,
  switchToSiteFromHeader,
  waitHeaderCurrencyMatchesSession,
  waitSessionSiteStable,
} from './helpers/site-session-default-scenario-helpers';

const US_SITE_MENU_LABEL = (process.env.E2E_US_SITE_MENU_LABEL || 'US').trim();
const OTHER_SITE_MENU_LABEL = (process.env.E2E_OTHER_SITE_MENU_LABEL || 'Showcase').trim();

const EXPECT_CCY_SHOWCASE = (process.env.E2E_EXPECT_CCY_SHOWCASE ?? 'EUR').trim();
const EXPECT_CCY_US = (process.env.E2E_EXPECT_CCY_US ?? 'USD').trim();
const EXPECT_CCY_NATURA = (process.env.E2E_EXPECT_CCY_NATURA ?? 'CHF').trim();

test.describe('Site-session default scenario (multi-site cart + PDP currency)', () => {
  test.describe.configure({ mode: 'serial' });

  test('Showcase ↔ US ↔ Natura round-trip per default-scenario.md', async ({ page }) => {
    test.setTimeout(600_000);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const sites = await getAvailableSites(page);
    const us = sites.find((s) => s.code === 'us-branch');
    const showcase = pickShowcaseSite(sites, 'us-branch');
    const natura = pickNaturaLike(sites);

    test.skip(!us || !showcase, 'Requires us-branch and a non-US showcase site (e.g. main) in /api/site');
    test.skip(!natura, 'Requires Natura-like site name or code brand1 (see pickNaturaLike)');
    if (!us || !showcase || !natura) {
      throw new Error('unreachable: skipped above');
    }

    const usRow = us;
    const usCode = usRow.code;
    const showcaseRow = showcase;
    const naturaRow = natura;

    // --- 1. Showcase (EUR): home, cart, bluesolar PDP, add ---
    await gotoSiteLocaleStable(page, showcaseRow.code);
    expect((await fetchJsonSession(page)).currency).toBe(EXPECT_CCY_SHOWCASE);

    await page.goto(`/${showcaseRow.code}/en/cart`, { waitUntil: 'domcontentloaded' });
    await waitHeaderCurrencyMatchesSession(page);

    await gotoSiteLocaleStable(page, showcaseRow.code);
    await searchOpenFirstPdp(page, 'bluesolar');
    await assertPdpCurrencyAlignedWithSession(page);
    const bluesolarId = productIdFromUrl(page);
    expect(bluesolarId).toBeTruthy();

    const addBlue = await clickAddToCartFirst(page);
    expect(addBlue, 'bluesolar PDP should allow add on showcase').toBe('added');
    await closeAddToCartModalIfOpen(page);
    await expectCartContainsProductWithCurrency(page, bluesolarId!, EXPECT_CCY_SHOWCASE);

    // --- 2. US (USD): switch, cart, 200w PDP, add ---
    await switchToSiteFromHeader(page, US_SITE_MENU_LABEL);
    await expect(page).toHaveURL(new RegExp(`/${usCode}/`), { timeout: 35_000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitSessionSiteStable(page, usCode);
    await waitHeaderCurrencyMatchesSession(page);
    expect((await fetchJsonSession(page)).currency).toBe(EXPECT_CCY_US);

    await page.goto(`/${usCode}/en/cart`, { waitUntil: 'domcontentloaded' });
    await waitHeaderCurrencyMatchesSession(page);

    await gotoSiteLocaleStable(page, usCode);
    await searchOpenFirstPdp(page, '200w');
    await assertPdpCurrencyAlignedWithSession(page);
    const id200w = productIdFromUrl(page);
    expect(id200w).toBeTruthy();

    const add200 = await clickAddToCartFirst(page);
    expect(add200, '200w PDP should allow add on US').toBe('added');
    await closeAddToCartModalIfOpen(page);
    await expectCartContainsProductWithCurrency(page, id200w!, EXPECT_CCY_US);

    // --- 3. Back to Showcase: cart, 200w PDP, bluesolar still EUR ---
    await switchToSiteFromHeader(page, OTHER_SITE_MENU_LABEL);
    await expect(page).toHaveURL(new RegExp(`/${showcaseRow.code}/`), { timeout: 35_000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitSessionSiteStable(page, showcaseRow.code);
    await waitHeaderCurrencyMatchesSession(page);
    expect((await fetchJsonSession(page)).currency).toBe(EXPECT_CCY_SHOWCASE);

    await page.goto(`/${showcaseRow.code}/en/cart`, { waitUntil: 'domcontentloaded' });
    await waitHeaderCurrencyMatchesSession(page);
    const cartShowcaseMid = await fetchCart(page);
    expect(cartShowcaseMid?.items?.some((i) => i.product?.id === bluesolarId)).toBe(true);
    expect(cartShowcaseMid?.currency).toBe(EXPECT_CCY_SHOWCASE);

    await gotoSiteLocaleStable(page, showcaseRow.code);
    await searchOpenFirstPdp(page, '200w');
    await assertPdpCurrencyAlignedWithSession(page);
    await expectCartContainsProductWithCurrency(page, bluesolarId!, EXPECT_CCY_SHOWCASE);

    // --- 4. Natura Home (CHF): optional add ---
    await switchToSiteFromHeader(page, naturaRow.name);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitSessionSiteStable(page, naturaRow.code);
    await waitHeaderCurrencyMatchesSession(page);
    expect((await fetchJsonSession(page)).currency).toBe(EXPECT_CCY_NATURA);

    await page.goto(`/${naturaRow.code}/en/cart`, { waitUntil: 'domcontentloaded' });
    await waitHeaderCurrencyMatchesSession(page);

    await gotoSiteLocaleStable(page, naturaRow.code);
    await searchOpenPdpPreferringRowText(page, 'AuroraTech Smart Solar Solution', /100\s*W/i);
    await assertPdpCurrencyAlignedWithSession(page);
    const naturaAdd = await clickAddToCartFirst(page);
    if (naturaAdd === 'added') {
      await closeAddToCartModalIfOpen(page);
      const nid = productIdFromUrl(page);
      expect(nid).toBeTruthy();
      await expectCartContainsProductWithCurrency(page, nid!, EXPECT_CCY_NATURA);
    }

    // --- 5. Showcase again: 200w PDP + bluesolar EUR ---
    await switchToSiteFromHeader(page, OTHER_SITE_MENU_LABEL);
    await expect(page).toHaveURL(new RegExp(`/${showcaseRow.code}/`), { timeout: 35_000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitSessionSiteStable(page, showcaseRow.code);
    await waitHeaderCurrencyMatchesSession(page);
    expect((await fetchJsonSession(page)).currency).toBe(EXPECT_CCY_SHOWCASE);

    await page.goto(`/${showcaseRow.code}/en/cart`, { waitUntil: 'domcontentloaded' });
    await waitHeaderCurrencyMatchesSession(page);

    await gotoSiteLocaleStable(page, showcaseRow.code);
    await searchOpenFirstPdp(page, '200w');
    await assertPdpCurrencyAlignedWithSession(page);
    await expectCartContainsProductWithCurrency(page, bluesolarId!, EXPECT_CCY_SHOWCASE);
  });
});
