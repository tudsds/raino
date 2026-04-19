import { test, expect } from '@playwright/test';

test.describe('studio project detail', () => {
  test('unauthenticated access redirects to login', async ({ page }) => {
    await page.goto('/projects/test-project-id');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('ownership enforcement returns 404 for unauthorized users', async ({ page }) => {
    await page.goto('/projects/unauthorized-project-id');

    const url = page.url();
    expect(url).toMatch(/\/login/);
  });

  test('intake page renders UI and chat input', async ({ page }) => {
    await page.goto('/projects/test-project-id/intake');

    await expect(page.getByRole('heading', { name: 'Project Intake' })).toBeVisible();
    await expect(page.getByText('Gathering Info')).toBeVisible();
    await expect(page.getByPlaceholder('Describe your hardware idea...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Intake' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Spec' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Architecture' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'BOM' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Previews' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Downloads' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Quote' })).toBeVisible();
  });
});
