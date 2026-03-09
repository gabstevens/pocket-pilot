import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('transaction detail modal should be above bottom navigation', async ({ page }) => {
  // 1. Add a transaction
  await page.fill('input[placeholder="0.00"]', '100');
  await page.fill('textarea', 'Layering test');
  await page.click('button[type="submit"]');

  // 2. Go to History
  await page.click('nav button:has-text("History")');
  const historyItem = page.locator('button').filter({ hasText: 'Layering test' });
  await expect(historyItem).toBeVisible();

  // 3. Open details
  await historyItem.click();
  const modalOverlay = page.locator('.modal-overlay');
  await expect(modalOverlay).toBeVisible();

  // 4. Verify layering with computed styles
  const layering = await page.evaluate(() => {
    const modal = document.querySelector('.modal-overlay');
    const bottomNav = document.querySelector('.bottom-nav');
    
    if (!modal || !bottomNav) return null;

    const modalZ = parseInt(window.getComputedStyle(modal).zIndex);
    const navZ = parseInt(window.getComputedStyle(bottomNav).zIndex);

    return { modalZ, navZ };
  });

  expect(layering).not.toBeNull();
  if (layering) {
    expect(layering.modalZ).toBeGreaterThan(layering.navZ);
  }

  // 5. Visual Check - try to click the close button of the modal
  // If the navbar was on top, it might intercept clicks depending on layout
  const closeButton = modalOverlay.locator('button:has(svg)');
  await expect(closeButton).toBeVisible();
  await closeButton.click();
  await expect(modalOverlay).not.toBeVisible();
});
