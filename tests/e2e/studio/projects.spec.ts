import { test, expect } from '@playwright/test';

test.describe('studio projects', () => {
  test('project list page renders with empty state', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Your Projects' })).toBeVisible();
    await expect(
      page.getByText('Manage your PCB designs from concept to manufacturing'),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: '+ New Project' })).toBeVisible();
    await expect(page.getByText('No projects yet')).toBeVisible();
    await expect(
      page.getByText(
        'Start your first PCB design project. Describe your hardware idea in natural language',
      ),
    ).toBeVisible();
  });

  test('project creation flow renders form and handles submission', async ({ page }) => {
    await page.goto('/projects/new');

    await expect(page.getByRole('heading', { name: 'New Project' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create a new project' })).toBeVisible();
    await expect(page.getByLabel('Project Name')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Project' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cancel' })).toBeVisible();

    await page.getByLabel('Project Name').fill('E2E Test Project');
    await page.getByLabel('Description').fill('A test project created by Playwright E2E tests');

    await page.getByRole('button', { name: 'Create Project' }).click();

    await expect(
      page
        .locator('div')
        .filter({
          hasText: /Creating|error|Failed|Unauthorized|An unexpected error occurred/i,
        })
        .first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('new project cancel link returns to dashboard', async ({ page }) => {
    await page.goto('/projects/new');
    await page.getByRole('link', { name: 'Cancel' }).click();
    await expect(page).toHaveURL('http://localhost:3001/');
    await expect(page.getByRole('heading', { name: 'Your Projects' })).toBeVisible();
  });
});
