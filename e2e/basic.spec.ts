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
  
  // The delete button has a Trash2 icon
  await page.locator('button:has(svg.lucide-trash2)').click();
  // Confirm dialog
  await page.click('button:has-text("Confirm")');

  // Check toast and empty state
  await expect(page.locator('text=Transaction deleted')).toBeVisible();
  await expect(page.locator('text=No transactions in this range')).toBeVisible();
});

test('can edit a transaction and check modal polish', async ({ page }) => {
  // 1. Add a transaction
  await page.fill('input[placeholder="0.00"]', '50.00');
  await page.fill('textarea', 'Original Note');
  await page.click('button[type="submit"]');

  // 2. Go to History and open details
  await page.click('nav button:has-text("History")');
  await page.click('text=Original Note');

  // 3. Verify detail modal doesn't have redundant cancel button at the bottom
  // (The close 'X' button is present, but not the redundant 'Cancel' button)
  const cancelBtn = page.locator('.modal-overlay button:has-text("Cancel")');
  await expect(cancelBtn).not.toBeVisible();

  // 4. Enter edit mode
  await page.click('button:has-text("Edit")');
  
  // 5. Verify "Update" button instead of "Add Transaction"
  const updateBtn = page.locator('button[type="submit"]');
  await expect(updateBtn).toHaveText('Update');

  // 6. Verify modal height (class [95dvh])
  const modalContent = page.locator('.modal-overlay > div');
  await expect(modalContent).toHaveClass(/max-h-\[95dvh\]/);

  // 7. Perform update
  await page.fill('textarea', 'Updated Note');
  await updateBtn.click();

  // 8. Verify update was successful
  await expect(page.locator('text=Transaction updated')).toBeVisible();
  await expect(page.locator('text=Updated Note').first()).toBeVisible();
});

test('can switch language', async ({ page }) => {
  await page.click('nav button:has-text("Settings")');
  await page.selectOption('select', 'it-IT');
  
  // Navigation labels should change
  // "Add" -> "Aggiungi", "History" -> "Storia"
  await expect(page.locator('nav button:has-text("Aggiungi")')).toBeVisible();
  await expect(page.locator('nav button:has-text("Storia")')).toBeVisible();
});
