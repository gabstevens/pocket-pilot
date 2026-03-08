import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('can add and delete a transaction', async ({ page }) => {
  // 1. Add a transaction
  // The amount input is type="text" but has inputMode="decimal"
  await page.fill('input[placeholder="0.00"]', '123.45');
  await page.fill('textarea', 'E2E Test Lunch');
  
  // Submit button
  await page.click('button[type="submit"]');

  // Check toast (informative version)
  // The app uses t('common.added') which is "Transaction added"
  await expect(page.locator('text=Transaction added: -123.45 USD')).toBeVisible();

  // 2. Go to History
  // Navigation buttons are in the bottom nav
  await page.click('nav button:has-text("History")');
  await expect(page.locator('text=E2E Test Lunch')).toBeVisible();
  
  // Check amount in history
  const historyItem = page.locator('.card').filter({ hasText: 'E2E Test Lunch' });
  await expect(historyItem.locator('text=123.45')).toBeVisible();

  // 3. Open details and delete
  await historyItem.click();
  // The modal shows "DETAILS" at the top
  await expect(page.locator('text=DETAILS')).toBeVisible();
  
  // The delete button has hardcoded text "DELETE" next to an icon
  await page.click('button:has-text("DELETE")');
  // Confirm dialog
  await page.click('button:has-text("Confirm")');

  // Check toast and empty state
  await expect(page.locator('text=Transaction deleted')).toBeVisible();
  await expect(page.locator('text=No transactions in this range')).toBeVisible();
});

test('can switch language', async ({ page }) => {
  await page.click('nav button:has-text("Settings")');
  await page.selectOption('select', 'it-IT');
  
  // Navigation labels should change
  // "Add" -> "Aggiungi", "History" -> "Storia"
  await expect(page.locator('nav button:has-text("Aggiungi")')).toBeVisible();
  await expect(page.locator('nav button:has-text("Storia")')).toBeVisible();
});
