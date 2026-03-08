import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('can add and delete a transaction', async ({ page }) => {
  // 1. Add a transaction
  await page.fill('input[type="text"]', '123.45');
  await page.fill('textarea', 'E2E Test Lunch');
  // Use text-color button for '+' if needed, but here we default to Expense
  await page.click('button:has-text("Add Transaction")');

  // Check toast (informative version)
  await expect(page.locator('text=Transaction added: -123.45 USD')).toBeVisible();

  // 2. Go to History
  await page.click('button:has-text("History")');
  await expect(page.locator('text=E2E Test Lunch')).toBeVisible();
  
  // Use specific selector for the amount in history list to avoid toast ambiguity
  // Or just wait for the toast to disappear, but specific is better.
  const historyItem = page.locator('.card').filter({ hasText: 'E2E Test Lunch' });
  await expect(historyItem.locator('text=123.45')).toBeVisible();

  // 3. Open details and delete
  await historyItem.click();
  await expect(page.locator('text=DETAILS')).toBeVisible();
  
  await page.click('button:has-text("DELETE")');
  // Confirm dialog
  await page.click('button:has-text("Confirm")');

  // Check toast and empty state
  await expect(page.locator('text=Transaction deleted')).toBeVisible();
  await expect(page.locator('text=No transactions in this range')).toBeVisible();
});

test('can switch language', async ({ page }) => {
  await page.click('button:has-text("Settings")');
  await page.selectOption('select', 'it-IT');
  
  // Navigation labels should change
  await expect(page.locator('button:has-text("Aggiungi")')).toBeVisible();
  await expect(page.locator('button:has-text("Storia")')).toBeVisible();
});
