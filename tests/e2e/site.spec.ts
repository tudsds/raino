import { test, expect } from '@playwright/test';

test.describe('marketing site', () => {
  test('homepage loads with correct title and hero text', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Raino/);
    await expect(page.getByText('Design PCBs with Structured Intelligence')).toBeVisible();
    await expect(
      page.getByText('Raino converts fuzzy hardware intent into structured specs'),
    ).toBeVisible();
  });

  test('navigation links work for Features and Architecture', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Features' }).click();
    await expect(page).toHaveURL(/\/features/);
    await page.getByRole('link', { name: 'Architecture' }).click();
    await expect(page).toHaveURL(/\/architecture/);
  });

  test('features page loads and shows feature cards', async ({ page }) => {
    await page.goto('/features');
    await expect(page.getByRole('heading', { name: 'Features' })).toBeVisible();
    await expect(page.getByText('Natural Language Intake')).toBeVisible();
    await expect(page.getByText('Structured Specifications')).toBeVisible();
    await expect(page.getByText('KiCad Generation')).toBeVisible();
  });

  test('architecture page loads and shows diagrams', async ({ page }) => {
    await page.goto('/architecture');
    await expect(page.getByRole('heading', { name: 'System Architecture' })).toBeVisible();
    await expect(page.getByText('apps/site')).toBeVisible();
    await expect(page.getByText('packages/core')).toBeVisible();
  });

  test('footer links are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Features' }).nth(1)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Architecture' }).nth(1)).toBeVisible();
    await expect(page.getByRole('link', { name: 'GitHub' }).nth(1)).toBeVisible();
    await expect(page.getByText('MIT Licensed')).toBeVisible();
  });
});
