import { expect, test } from '@playwright/test';

test.describe('Workspace Producer console', () => {
  test('landing Workspace CTA opens Producer console shell', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const workspace = page.getByRole('button', { name: /Open workspace/i }).first();
    await expect(workspace).toBeEnabled({ timeout: 10000 });
    await workspace.click();
    await expect(page).toHaveURL(/\/workspace$/);
    await expect(page.getByTestId('workspace-shell')).toBeVisible();
    await expect(page.getByText(/Good afternoon, Test\./i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Producer' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Test user')).toBeVisible();
  });
});
