import { type Page, type Request, expect, test } from '@playwright/test';

const LOGIN_EMAIL = process.env.E2E_LOGIN_EMAIL;
const LOGIN_PASSWORD = process.env.E2E_LOGIN_PASSWORD;
const CHECKOUT_SITE = process.env.E2E_CHECKOUT_SITE;
const CHECKOUT_ADDRESS_COUNTRY = process.env.E2E_CHECKOUT_ADDRESS_COUNTRY;
const CHECKOUT_ADDRESS_ZIP = process.env.E2E_CHECKOUT_ADDRESS_ZIP;
const CHECKOUT_ADDRESS_CITY = process.env.E2E_CHECKOUT_ADDRESS_CITY;
const CHECKOUT_ADDRESS_STREET = process.env.E2E_CHECKOUT_ADDRESS_STREET;
const CHECKOUT_CONTACT_NAME = process.env.E2E_CHECKOUT_CONTACT_NAME;

/**
 * Covers Bug 3 of the checkout-address-shipping-site-fixes plan:
 *   - After a successful checkout on a non-default site, the confirmation URL
 *     must keep the site prefix (e.g. `/fw-site/en/confirmation/<orderId>`).
 *   - The browser must not perform a cart reload against `siteCode=main`.
 *
 * The spec is intentionally gated behind env vars because completing a real
 * order requires back-office seed data (legal entity, address book, shipping
 * zones, payment config). Without the env vars it is skipped cleanly, matching
 * the gating pattern in `e2e/auth-site-sync.spec.ts`.
 */
test.describe('Checkout keeps site prefix after order submission', () => {
  test.skip(
    !LOGIN_EMAIL ||
      !LOGIN_PASSWORD ||
      !CHECKOUT_SITE ||
      !CHECKOUT_ADDRESS_COUNTRY ||
      !CHECKOUT_ADDRESS_ZIP ||
      !CHECKOUT_ADDRESS_CITY ||
      !CHECKOUT_ADDRESS_STREET ||
      !CHECKOUT_CONTACT_NAME,
    'Set E2E_LOGIN_EMAIL, E2E_LOGIN_PASSWORD, E2E_CHECKOUT_SITE and the E2E_CHECKOUT_ADDRESS_* vars to run the full checkout flow.',
  );

  test('confirmation URL keeps non-default site prefix and does not reload the main-site cart', async ({ page }) => {
    const defaultSiteCartReloads: string[] = [];
    const captureDefaultSiteCartCalls = (req: Request) => {
      const url = req.url();
      if (url.includes('/api/cart') && url.includes('siteCode=main')) {
        defaultSiteCartReloads.push(url);
      }
    };
    page.on('request', captureDefaultSiteCartCalls);

    await loginOnSite(page, CHECKOUT_SITE!, LOGIN_EMAIL!, LOGIN_PASSWORD!);

    await addFirstBrowseProductToCart(page, CHECKOUT_SITE!);

    await page.goto(`/${CHECKOUT_SITE}/en/cart`);
    await expect(page).toHaveURL(new RegExp(`/${CHECKOUT_SITE}/en/cart`));

    const checkoutTrigger = page.getByRole('button', { name: /checkout/i }).first();
    await expect(checkoutTrigger).toBeVisible({ timeout: 15_000 });
    await checkoutTrigger.click();

    await expect(page).toHaveURL(new RegExp(`/${CHECKOUT_SITE}/en/checkout`), { timeout: 15_000 });

    await fillShippingAddress(page, {
      contactName: CHECKOUT_CONTACT_NAME!,
      street: CHECKOUT_ADDRESS_STREET!,
      zipCode: CHECKOUT_ADDRESS_ZIP!,
      city: CHECKOUT_ADDRESS_CITY!,
      country: CHECKOUT_ADDRESS_COUNTRY!,
    });

    await expect
      .poll(
        async () => {
          const list = page.getByRole('radio').or(page.locator('[data-slot="radio-group-item"]'));
          return (await list.count()) > 0;
        },
        { timeout: 20_000 },
      )
      .toBe(true);

    const submitOrder = page.getByRole('button', { name: /submit order/i });
    await expect(submitOrder).toBeEnabled({ timeout: 20_000 });
    await submitOrder.click();

    await page.waitForURL(new RegExp(`/${CHECKOUT_SITE}/en/confirmation/`), { timeout: 30_000 });

    const confirmationUrl = new URL(page.url());
    expect(confirmationUrl.pathname).toMatch(new RegExp(`^/${CHECKOUT_SITE}/en/confirmation/[^/]+$`));

    await page.waitForLoadState('networkidle');
    page.off('request', captureDefaultSiteCartCalls);
    expect(
      defaultSiteCartReloads,
      `Unexpected main-site cart reloads after checkout: ${defaultSiteCartReloads.join(', ')}`,
    ).toHaveLength(0);
  });
});

async function loginOnSite(page: Page, site: string, email: string, password: string) {
  await page.goto(`/${site}/en/login`);

  const usernameInput = page.getByTestId('login-username');
  await expect(usernameInput).toBeVisible({ timeout: 15_000 });

  await usernameInput.fill(email);
  await page.getByTestId('login-password').fill(password);

  const submitButton = page.getByTestId('login-submitButton');
  await expect(submitButton).toBeEnabled({ timeout: 10_000 });
  await submitButton.click();

  await expect
    .poll(
      async () => {
        const sessionResponse = await page.request.get('/api/session');
        const session = (await sessionResponse.json()) as { customerId?: string };
        return session.customerId;
      },
      { timeout: 20_000 },
    )
    .not.toBe('ANONYMOUS');
}

async function addFirstBrowseProductToCart(page: Page, site: string) {
  await page.goto(`/${site}/en/browse`);
  const firstTile = page.locator('[data-testid^="product-tile"]').first();
  await expect(firstTile).toBeVisible({ timeout: 20_000 });
  await firstTile.click();
  const addToCart = page.getByRole('button', { name: /add to cart/i }).first();
  await expect(addToCart).toBeEnabled({ timeout: 15_000 });
  await addToCart.click();
}

async function fillShippingAddress(
  page: Page,
  address: { contactName: string; street: string; zipCode: string; city: string; country: string },
) {
  await page
    .getByLabel(/contact name/i)
    .first()
    .fill(address.contactName);
  await page
    .getByLabel(/^street(?!.*number)/i)
    .first()
    .fill(address.street);
  // Deliberately leave streetNumber empty to validate Bug 1 regression.
  await page
    .getByLabel(/zip code/i)
    .first()
    .fill(address.zipCode);
  await page.getByLabel(/city/i).first().fill(address.city);

  const countrySelect = page.getByRole('combobox', { name: /country/i }).first();
  await countrySelect.click();
  await page
    .getByRole('option', { name: new RegExp(address.country, 'i') })
    .first()
    .click();
}
