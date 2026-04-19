import { test, expect } from '@playwright/test';

test.describe('studio auth', () => {
  test('login page renders with correct elements', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle(/Raino/);
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByText('Enter your email to receive a magic link')).toBeVisible();
    await expect(page.getByLabel('EMAIL')).toBeVisible();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send Magic Link' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible();
  });

  test('magic link form submission shows feedback', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByLabel('EMAIL');
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');

    await page.getByRole('button', { name: 'Send Magic Link' }).click();

    await expect(
      page
        .locator('div')
        .filter({
          hasText: /Check your email|Failed|error|Unauthorized|Network/i,
        })
        .first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('signup link navigates to signup page', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL(/\/signup/);
  });
});
