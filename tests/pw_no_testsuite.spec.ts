import { test, expect } from '@playwright/test';

test.only('my testink', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveURL('https://playwright.dev/');
});
