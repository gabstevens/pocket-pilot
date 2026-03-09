import { test, expect } from '@playwright/test';

test.describe('Category Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to be ready
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should add, edit and delete a category', async ({ page }) => {
    // 1. Navigate to Settings
    await page.click('nav button:has-text("Settings")');
    await expect(page.locator('h1')).toContainText(/settings/i);

    // 2. Add New Category
    // Initial Add Category button in settings list
    await page.click('.card button:has-text("Add Category")');
    await expect(page.locator('h2')).toContainText(/category/i);

    await page.fill('input[placeholder="Category Name"]', 'Personal Test');
    
    // Select a color (e.g., Red)
    await page.click('button[aria-label="Select red color"]');
    
    // Select an icon (e.g., Heart)
    await page.click('button[aria-label="Select HeartPulse icon"]');
    
    // Click the Add Category button inside the modal
    await page.click('.dialog-content button:has-text("Add Category")');

    // Verify it exists in settings list (it's transformed to uppercase in UI)
    await expect(page.locator('text=PERSONAL TEST')).toBeVisible();

    // 3. Edit Category
    // Find the row containing "PERSONAL TEST"
    const row = page.locator('div.flex.items-center.justify-between').filter({ hasText: 'PERSONAL TEST' });
    await row.locator('button[aria-label="Edit category"]').click();
    
    await expect(page.locator('h2')).toContainText(/edit/i);
    await page.fill('input[value="Personal Test"]', 'Personal Updated');
    
    // Change color to Green
    await page.click('button[aria-label="Select green color"]');
    // Click the Edit button inside the modal (label changes for edit mode)
    await page.click('.dialog-content button:has-text("Edit")'); 

    await expect(page.locator('text=PERSONAL UPDATED')).toBeVisible();
    await expect(page.locator('text=PERSONAL TEST')).not.toBeVisible();

    // 4. Delete Category
    const updatedRow = page.locator('div.flex.items-center.justify-between').filter({ hasText: 'PERSONAL UPDATED' });
    await updatedRow.locator('button[aria-label="Delete category"]').click();

    // Confirm dialog
    await page.click('button:has-text("Confirm")');

    await expect(page.locator('text=PERSONAL UPDATED')).not.toBeVisible();
  });

  test('should block deletion if category is in use', async ({ page }) => {
    // 1. Add a transaction with "Food" category
    await page.click('nav button:has-text("Add")');
    await page.fill('input[placeholder="0.00"]', '50');
    // Food is default, just submit
    await page.click('button:has-text("Add Transaction")');

    // 2. Try to delete "Food" in settings
    await page.click('nav button:has-text("Settings")');
    // Food is displayed as "FOOD"
    const foodRow = page.locator('div.flex.items-center.justify-between').filter({ hasText: 'FOOD' });
    await foodRow.locator('button[aria-label="Delete category"]').click();

    // Expect error toast or alert
    await expect(page.locator('.toast-error')).toBeVisible();
  });
});
