import { test, expect } from '@playwright/test';

test.describe('site navigation', () => {
  test('can navigate from home to features', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Features' }).first().click();
    await expect(page).toHaveURL(/\/features/);
    await expect(page.getByRole('heading', { name: 'Features' })).toBeVisible();
  });

  test('can navigate from features to architecture', async ({ page }) => {
    await page.goto('/features');
    await page.getByRole('link', { name: 'Architecture' }).first().click();
    await expect(page).toHaveURL(/\/architecture/);
    await expect(page.getByRole('heading', { name: 'System Architecture' })).toBeVisible();
  });

  test('can navigate back to home', async ({ page }) => {
    await page.goto('/architecture');
    await page.getByRole('link', { name: 'Home' }).first().click();
    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.getByText('Design PCBs with Structured Intelligence')).toBeVisible();
  });

  test('Launch Studio button has correct href', async ({ page }) => {
    await page.goto('/');
    const studioButton = page.getByRole('link', { name: 'Launch Studio' });
    await expect(studioButton).toBeVisible();
    await expect(studioButton).toHaveAttribute('href', 'http://localhost:3001');
  });
});
