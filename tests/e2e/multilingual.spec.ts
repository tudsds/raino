import { test, expect } from '@playwright/test';

const locales = [
  { code: 'en', path: '/', label: 'EN', lang: 'en' },
  { code: 'zh', path: '/zh', label: '中文', lang: 'zh' },
  { code: 'ja', path: '/ja', label: '日本語', lang: 'ja' },
  { code: 'ko', path: '/ko', label: '한국어', lang: 'ko' },
] as const;

const EVIDENCE_DIR = '.sisyphus/evidence/task-30-multilingual';

test.describe('Multi-language site', () => {
  test.setTimeout(30000);

  // 1. Visit homepage, verify default language is English
  test('homepage default language is English', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Raino/);
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBe('en');

    await expect(page.getByText('Design PCBs with Structured Intelligence')).toBeVisible();

    await page.screenshot({
      path: `${EVIDENCE_DIR}/homepage-en.png`,
      fullPage: true,
    });
  });

  // 2. Click language switcher, verify /zh loads
  test('language switcher navigates to Chinese', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: '中文' }).click();
    await expect(page).toHaveURL(/\/zh/);

    await page.screenshot({
      path: `${EVIDENCE_DIR}/homepage-zh.png`,
      fullPage: true,
    });
  });

  // 3. Click language switcher, verify /ja loads
  test('language switcher navigates to Japanese', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: '日本語' }).click();
    await expect(page).toHaveURL(/\/ja/);

    await page.screenshot({
      path: `${EVIDENCE_DIR}/homepage-ja.png`,
      fullPage: true,
    });
  });

  // 4. Click language switcher, verify /ko loads
  test('language switcher navigates to Korean', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: '한국어' }).click();
    await expect(page).toHaveURL(/\/ko/);

    await page.screenshot({
      path: `${EVIDENCE_DIR}/homepage-ko.png`,
      fullPage: true,
    });
  });

  // 5. Verify each language page has correct HTML lang attribute
  for (const locale of locales) {
    test(`HTML lang attribute is "${locale.lang}" on ${locale.path}`, async ({ page }) => {
      await page.goto(locale.path);

      const htmlLang = await page.getAttribute('html', 'lang');
      expect(htmlLang).toBe(locale.lang);
    });
  }

  // 6. Verify navbar language links work on all pages
  const pagesToCheck = ['/', '/features', '/architecture'];

  for (const pagePath of pagesToCheck) {
    test(`navbar language links present on ${pagePath || '/'}`, async ({ page }) => {
      await page.goto(pagePath);

      for (const locale of locales) {
        const link = page.getByRole('link', { name: locale.label });
        await expect(link).toBeVisible();
      }
    });
  }

  // 7. Screenshot each language variant (standalone for completeness)
  for (const locale of locales) {
    test(`screenshot of ${locale.code} locale at ${locale.path}`, async ({ page }) => {
      await page.goto(locale.path);
      await expect(page).toHaveTitle(/Raino/);

      await page.screenshot({
        path: `${EVIDENCE_DIR}/locale-${locale.code}.png`,
        fullPage: true,
      });
    });
  }
});
