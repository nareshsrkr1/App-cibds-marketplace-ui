import { expect, test } from '@playwright/test';

test.describe('Landing visual smoke', () => {
  test('landing page shows hero brand and proof metrics at desktop width', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.getByLabel('Primary').getByText('CIB Data Services', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Data that moves the');
    await expect(page.getByText('Physical datasets')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Browse catalogue' }).first()).toBeDisabled();
  });

  test('landing remains usable at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.getByLabel('Primary').getByText('Data Marketplace', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
