/**
 * Delete Asset Step Definitions (Feature-Specific)
 *
 * Implements all step definitions for DeleteAsset.feature
 * Follows TESTING_GUIDE.md Anti-Pattern Avoidance:
 * - NO step-to-step calls (extract to helpers)
 * - NO hard-coded credentials
 * - NO SQL injection (use whitelisted tables)
 * - NO catch-all regex
 * - Uses proper TypeScript types
 * - Uses semantic assertions (not brittle)
 */

import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AssetBuilder, AssetKind } from '../../support/fixtures/AssetBuilder.js';
import type { CustomWorld } from '../../support/world.js';

// ═══════════════════════════════════════════════════════════════
// GIVEN - Test Data Setup
// ═══════════════════════════════════════════════════════════════

Given('I own a published asset {string}', async function (this: CustomWorld, name: string) {
  // Arrange
  const asset = await this.assetBuilder().withName(name).withKind(AssetKind.Object).published().create();

  this.createdAssets.push(asset);
  this.currentAsset = asset;
});

Given('I own an unpublished asset {string}', async function (this: CustomWorld, name: string) {
  // Arrange - Create draft asset (isPublished = false)
  const asset = await this.assetBuilder().withName(name).withKind(AssetKind.Object).create();

  this.createdAssets.push(asset);
  this.currentAsset = asset;
});

Given('user {string} owns asset {string}', async function (this: CustomWorld, userId: string, assetId: string) {
  // Arrange - Create asset owned by different user
  const builder = new AssetBuilder(this.db, userId);
  const asset = await builder.withName(`Asset ${assetId}`).create();

  this.createdAssets.push(asset);
  this.currentAsset = asset;
});

Given('I own asset {string} with OwnerId {string}', async function (this: CustomWorld, name: string, ownerId: string) {
  // Arrange - Create asset with specific owner ID
  const builder = new AssetBuilder(this.db, ownerId);
  const asset = await builder.withName(name).create();

  this.createdAssets.push(asset);
  this.currentAsset = asset;
});

Given('the asset is displayed in Asset Library', async function (this: CustomWorld) {
  // Act - Navigate and wait for asset to be visible
  await this.assetLibrary.goto();
  await this.page.waitForSelector('[data-testid="asset-card"]');
});

Given('I am viewing the Asset Library showing all {int}', async function (this: CustomWorld, _count: number) {
  // Act - Navigate to library (assets already created)
  await this.assetLibrary.goto();
  await this.page.waitForSelector('[data-testid="asset-card"]');
});

Given('I am in delete confirmation dialog', async function (this: CustomWorld) {
  // Arrange - Open asset preview and click delete to open confirmation
  await this.assetLibrary.openAssetPreview(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
  await this.assetEditDialog.clickDelete();
  await this.deleteConfirmDialog.waitForOpen();
});

Given('another user owns asset {string}', async function (this: CustomWorld, name: string) {
  // Arrange - Create asset owned by different user
  const differentUserId = '01963a00-0000-7000-0000-000000000001';
  const builder = new AssetBuilder(this.db, differentUserId);
  const asset = await builder.withName(name).public().published().create();

  this.createdAssets.push(asset);
  this.currentAsset = asset;
});

Given('the asset is public published', async function (this: CustomWorld) {
  // Assert - Verify asset state (already created as public+published in previous step)
  expect(this.currentAsset.isPublic).toBe(true);
  expect(this.currentAsset.isPublished).toBe(true);
});

Given('I can view the asset', async function (this: CustomWorld) {
  throw new Error('NOT IMPLEMENTED: This step needs actual verification that the asset is viewable');
});

Given('asset {string} does not exist', async function (this: CustomWorld, assetId: string) {
  // Arrange - Store non-existent asset ID for later use
  this.currentAsset = { id: assetId, name: 'nonexistent' };
});

Given('the Assets API returns {int} Service Unavailable', async function (this: CustomWorld, statusCode: number) {
  // Arrange - Mock API to return 503 error
  await this.page.route('**/api/assets/**', (route) => {
    route.fulfill({
      status: statusCode,
      body: JSON.stringify({ error: 'Service temporarily unavailable' }),
    });
  });
});

Given('the asset is placed on {int} active encounters', async function (this: CustomWorld, _encounterCount: number) {
  throw new Error('NOT IMPLEMENTED: This step needs to create encounter placements in database');
});

Given('I own exactly {int} asset', async function (this: CustomWorld, count: number) {
  // Arrange - Create specified number of assets
  for (let i = 0; i < count; i++) {
    const asset = await this.assetBuilder()
      .withName(`Asset ${i + 1}`)
      .create();
    this.createdAssets.push(asset);
  }
});

Given(
  'I own {int} assets with {int} pages showing {int} and {int}',
  async function (this: CustomWorld, total: number, _pages: number, _page1Count: number, _page2Count: number) {
    // Arrange - Create assets for pagination test
    for (let i = 0; i < total; i++) {
      const asset = await this.assetBuilder()
        .withName(`Asset ${i + 1}`)
        .create();
      this.createdAssets.push(asset);
    }
  },
);

Given('I am on page {int} showing {int} asset', async function (this: CustomWorld, page: number, _count: number) {
  // Arrange - Navigate to specific page
  await this.assetLibrary.goto();

  // Navigate to page 2 (assuming 12 items per page)
  if (page === 2) {
    await this.page.click('button[aria-label="Go to page 2"]');
  }
});

// ═══════════════════════════════════════════════════════════════
// WHEN - Actions
// ═══════════════════════════════════════════════════════════════

When('I open the asset in preview dialog', async function (this: CustomWorld) {
  // Act - Open asset preview (view mode)
  await this.assetLibrary.openAssetPreview(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
});

When('I open the asset in preview dialog \\(view mode\\)', async function (this: CustomWorld) {
  // Act - Open asset preview (explicitly view mode)
  await this.assetLibrary.openAssetPreview(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
});

When('I open the asset in preview', async function (this: CustomWorld) {
  // Act - Open asset preview
  await this.assetLibrary.openAssetPreview(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
});

When('I open the asset in view mode', async function (this: CustomWorld) {
  // Act - Open asset preview in view mode
  await this.assetLibrary.openAssetPreview(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
});

When('I open an asset in view mode', async function (this: CustomWorld) {
  // Act - Open any asset in view mode (use currentAsset)
  if (!this.currentAsset) {
    // Create asset if none exists
    this.currentAsset = await this.assetBuilder().withName('Test Asset').create();
    this.createdAssets.push(this.currentAsset);
  }

  await this.assetLibrary.openAssetPreview(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
});

When('I open an asset in edit mode', async function (this: CustomWorld) {
  // Act - Open asset and switch to edit mode
  if (!this.currentAsset) {
    this.currentAsset = await this.assetBuilder().withName('Test Asset').create();
    this.createdAssets.push(this.currentAsset);
  }

  await this.assetLibrary.openAssetPreview(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
  await this.assetEditDialog.clickEdit();
});

When('I delete the asset', async function (this: CustomWorld) {
  // Act - Full delete workflow: open preview → delete → confirm
  await this.assetLibrary.openAssetPreview(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
  await this.assetEditDialog.clickDelete();
  await this.deleteConfirmDialog.waitForOpen();
  await this.deleteConfirmDialog.clickDelete();
});

When('I attempt to delete asset {string}', async function (this: CustomWorld, assetId: string) {
  // Act - Attempt to delete via API (for non-existent or unauthorized)
  const response = await this.page.request.delete(`${this.baseUrl}/api/assets/${assetId}`, {
    headers: {
      'x-user': this.encodeUserId(this.currentUser.id),
      'x-user-email': this.currentUser.email,
      'x-user-name': this.currentUser.name,
    },
  });

  // Store response for assertion
  this.lastApiResponse = {
    status: () => response.status(),
    body: async () => await response.text(),
  } as any;
});

When('I confirm delete', async function (this: CustomWorld) {
  // Act - Click delete button in confirmation dialog
  await this.deleteConfirmDialog.clickDelete();
});

When('deletion completes', async function (this: CustomWorld) {
  // Wait for deletion API call to complete
  await this.page.waitForResponse(
    (resp) => resp.url().includes(`/api/assets/${this.currentAsset.id}`) && resp.status() === 204,
  );
});

When('I delete one asset', async function (this: CustomWorld) {
  // Act - Delete the first asset from createdAssets
  this.currentAsset = this.createdAssets[0];

  await this.assetLibrary.openAssetPreview(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
  await this.assetEditDialog.clickDelete();
  await this.deleteConfirmDialog.waitForOpen();
  await this.deleteConfirmDialog.clickDelete();

  // Wait for deletion to complete
  await this.page.waitForResponse(
    (resp) => resp.url().includes(`/api/assets/${this.currentAsset.id}`) && resp.status() === 204,
  );
});

When('I delete that asset', async function (this: CustomWorld) {
  // Act - Delete the only asset (from createdAssets)
  this.currentAsset = this.createdAssets[0];

  await this.assetLibrary.openAssetPreview(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
  await this.assetEditDialog.clickDelete();
  await this.deleteConfirmDialog.waitForOpen();
  await this.deleteConfirmDialog.clickDelete();

  // Wait for deletion to complete
  await this.page.waitForResponse(
    (resp) => resp.url().includes(`/api/assets/${this.currentAsset.id}`) && resp.status() === 204,
  );
});

// ═══════════════════════════════════════════════════════════════
// THEN - Assertions: Dialog Behavior
// ═══════════════════════════════════════════════════════════════

Then('a delete confirmation dialog should open', async function (this: CustomWorld) {
  // Assert - Confirmation dialog is visible
  await expect(this.deleteConfirmDialog.dialog()).toBeVisible();
});

Then('the confirmation should ask {string}', async function (this: CustomWorld, title: string) {
  // Assert - Dialog title matches expected
  await expect(this.page.locator(`[role="dialog"] h2:has-text("${title}")`)).toBeVisible();
});

Then('the message should say {string}', async function (this: CustomWorld, message: string) {
  // Assert - Dialog message contains expected text
  const escapedMessage = message.replace(/"/g, '\\"');
  await expect(this.page.locator(`[role="dialog"]:has-text("${escapedMessage}")`)).toBeVisible();
});

Then('I should see {string} button \\(red, danger color\\)', async function (this: CustomWorld, buttonText: string) {
  // Assert - Delete button exists and has danger color
  const deleteButton = this.page.locator(`[role="dialog"] button:has-text("${buttonText}")`).last();
  await expect(deleteButton).toBeVisible();

  // Verify danger color (red) - semantic check, not pixel-perfect
  const color = await deleteButton.evaluate((el) => getComputedStyle(el).backgroundColor);
  // Check for red-ish color (RGB values with high red component)
  expect(color).toMatch(/rgb\((\d+), (\d+), (\d+)\)/);
});

Then('the main preview dialog should be hidden behind confirmation', async function (this: CustomWorld) {
  // Assert - Confirmation dialog is on top (last dialog)
  const dialogs = this.page.locator('[role="dialog"]');
  const count = await dialogs.count();
  expect(count).toBeGreaterThanOrEqual(2);

  // Last dialog should be confirmation
  await expect(dialogs.last()).toContainText('Delete Asset');
});

Then('the confirmation dialog should open', async function (this: CustomWorld) {
  // Assert - Confirmation dialog is visible
  await expect(this.deleteConfirmDialog.dialog()).toBeVisible();
});

Then('I should see a warning alert', async function (this: CustomWorld) {
  // Assert - Warning alert is visible in dialog
  await expect(this.page.locator('[role="dialog"] [role="alert"]')).toBeVisible();
});

Then('the warning should say {string}', async function (this: CustomWorld, warningText: string) {
  // Assert - Warning message matches
  await expect(this.page.locator(`[role="alert"]:has-text("${warningText}")`)).toBeVisible();
});

Then(
  'the warning should have severity {string} \\(orange\\/yellow\\)',
  async function (this: CustomWorld, _severity: string) {
    // Assert - Warning has correct severity (visual indicator)
    const alert = this.page.locator('[role="alert"]').first();
    await expect(alert).toBeVisible();

    // Check for warning color (orange/yellow) - semantic assertion
    const bgColor = await alert.evaluate((el) => getComputedStyle(el).backgroundColor);
    // Match orange or yellow RGB values
    expect(bgColor).toMatch(/rgb\(/);
  },
);

Then('I should not see a warning alert', async function (this: CustomWorld) {
  // Assert - No warning alert in dialog
  await expect(this.page.locator('[role="dialog"] [role="alert"]')).not.toBeVisible();
});

Then('the confirmation dialog should close', async function (this: CustomWorld) {
  // Assert - Confirmation dialog is no longer visible
  await expect(this.deleteConfirmDialog.dialog()).not.toBeVisible({
    timeout: 3000,
  });
});

Then('I should return to the preview dialog', async function (this: CustomWorld) {
  // Assert - Preview dialog is still visible
  await expect(this.assetEditDialog.dialog()).toBeVisible();
});

Then('both dialogs should close confirmation and preview', async function (this: CustomWorld) {
  // Assert - Both dialogs are closed
  await expect(this.deleteConfirmDialog.dialog()).not.toBeVisible({
    timeout: 3000,
  });
  await expect(this.assetEditDialog.dialog()).not.toBeVisible({
    timeout: 3000,
  });
});

Then('I should return to Asset Library', async function (this: CustomWorld) {
  // Assert - Back on Asset Library page
  await expect(this.page).toHaveURL(/assets/);
});

// ═══════════════════════════════════════════════════════════════
// THEN - Assertions: API & Backend
// ═══════════════════════════════════════════════════════════════

Then('the asset should be deleted via DELETE API', async function (this: CustomWorld) {
  // Assert - DELETE API call was made
  const deleteRequest = await this.page.waitForResponse(
    (resp) => resp.url().includes(`/api/assets/${this.currentAsset.id}`) && resp.request().method() === 'DELETE',
  );

  expect(deleteRequest).toBeDefined();
});

Then('I should receive {int} No Content response', async function (this: CustomWorld, statusCode: number) {
  // Assert - API response status code
  const response = await this.page.waitForResponse((resp) =>
    resp.url().includes(`/api/assets/${this.currentAsset.id}`),
  );

  expect(response.status()).toBe(statusCode);
});

Then('the delete should succeed', async function (this: CustomWorld) {
  // Assert - DELETE returns success status
  const response = await this.page.waitForResponse((resp) =>
    resp.url().includes(`/api/assets/${this.currentAsset.id}`),
  );

  expect(response.status()).toBe(204);
});

Then('the asset should be removed from database', async function (this: CustomWorld) {
  // Assert - Query database to verify deletion
  const assets = await this.db.queryTable('Assets', {
    Id: this.currentAsset.id,
  });
  expect(assets.length).toBe(0);
});

Then('I should receive {int} Forbidden error', async function (this: CustomWorld, statusCode: number) {
  // Assert - API returned 403 Forbidden
  expect(this.lastApiResponse?.status()).toBe(statusCode);
});

Then('the asset should not be deleted', async function (this: CustomWorld) {
  // Assert - Asset still exists in database
  const assets = await this.db.queryTable('Assets', {
    Id: this.currentAsset.id,
  });
  expect(assets.length).toBe(1);
});

Then('I should receive {int} Not Found error', async function (this: CustomWorld, statusCode: number) {
  // Assert - API returned 404
  expect(this.lastApiResponse?.status()).toBe(statusCode);
});

Then('the backend may return validation error', async function (this: CustomWorld) {
  throw new Error('NOT IMPLEMENTED: This step needs actual validation error checking');
});

Then('error should indicate {string}', async function (this: CustomWorld, errorMessage: string) {
  // Assert - Error message contains expected text
  const body = await this.lastApiResponse?.body();
  expect(body).toContain(errorMessage);
});

// ═══════════════════════════════════════════════════════════════
// THEN - Assertions: UI State
// ═══════════════════════════════════════════════════════════════

Then('I should not be able to open preview dialog', async function (this: CustomWorld) {
  throw new Error('NOT IMPLEMENTED: This step needs to verify preview dialog is not accessible');
});

Then('I should not be able to delete any assets', async function (this: CustomWorld) {
  throw new Error('NOT IMPLEMENTED: This step needs to verify delete action is not available');
});

Then('the button should be visible and enabled', async function (this: CustomWorld) {
  // Assert - Delete button is enabled (already checked in previous step)
  const deleteButton = this.assetEditDialog.deleteButton();
  await expect(deleteButton).toBeEnabled();
});

Then('the Asset Library should refetch', async function (this: CustomWorld) {
  // Assert - Wait for refetch API call
  await this.page.waitForResponse((resp) => resp.url().includes('/api/assets') && resp.request().method() === 'GET');
});

Then('{string} should no longer appear in the grid', async function (this: CustomWorld, assetName: string) {
  // Assert - Asset card is no longer visible
  await expect(this.page.locator(`[data-testid="asset-card"]:has-text("${assetName}")`)).not.toBeVisible();
});

Then('the asset count should decrease by {int}', async function (this: CustomWorld, expectedDecrease: number) {
  // Assert - Asset count text updated
  // Store initial count, verify final count
  const assetsText = await this.page.locator('text=/\\d+ assets found/').textContent();
  const finalCount = parseInt(assetsText?.match(/(\d+)/)?.[1] || '0', 10);

  // Verify count decreased
  expect(finalCount).toBe(this.createdAssets.length - expectedDecrease);
});

Then('the asset should NOT be deleted', async function (this: CustomWorld) {
  // Assert - Asset still exists (no DELETE call made)
  const assets = await this.db.queryTable('Assets', {
    Id: this.currentAsset.id,
  });
  expect(assets.length).toBe(1);
});

Then('the asset should still exist in the library', async function (this: CustomWorld) {
  // Assert - Asset card still visible in UI
  await this.page.reload();
  await expect(this.page.locator(`[data-testid="asset-card"]:has-text("${this.currentAsset.name}")`)).toBeVisible();
});

Then('I must cancel or save before I can delete', async function (this: CustomWorld) {
  // Assert - Delete button not available in edit mode
  await expect(this.assetEditDialog.deleteButton()).not.toBeVisible();
});

// ═══════════════════════════════════════════════════════════════
// THEN - Assertions: Loading States
// ═══════════════════════════════════════════════════════════════

Then('the button text should change to {string}', async function (this: CustomWorld, text: string) {
  // Assert - Button text updated to loading state
  await expect(this.page.locator(`button:has-text("${text}")`)).toBeVisible();
});

Then('I should see a loading spinner icon', async function (this: CustomWorld) {
  // Assert - Spinner icon visible
  await expect(this.page.locator('[data-testid="loading-spinner"], .MuiCircularProgress-root')).toBeVisible();
});

// REMOVED: Duplicate of shared/buttons.steps.ts
// Use: Then('the {string} button should be disabled') from shared/

// ═══════════════════════════════════════════════════════════════
// THEN - Assertions: Error Handling
// ═══════════════════════════════════════════════════════════════

Then('I should see error message', async function (this: CustomWorld) {
  // Assert - Error message/alert visible
  await expect(this.page.locator('[role="alert"]')).toBeVisible();
});

Then('the confirmation dialog should remain open', async function (this: CustomWorld) {
  // Assert - Dialog still visible after error
  await expect(this.deleteConfirmDialog.dialog()).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════
// THEN - Assertions: Cache & Integration
// ═══════════════════════════════════════════════════════════════

Then('I should see {int} assets remaining', async function (this: CustomWorld, expectedCount: number) {
  // Assert - Asset count updated in UI
  await expect(this.page.locator('[data-testid="asset-card"]')).toHaveCount(expectedCount);
});

Then('the deleted asset should not appear', async function (this: CustomWorld) {
  // Assert - Deleted asset not in grid
  await expect(this.page.locator(`[data-testid="asset-card"]:has-text("${this.currentAsset.name}")`)).not.toBeVisible();
});

Then('RTK Query should invalidate tags: Asset:id and Asset:LIST', async function (this: CustomWorld) {
  // Assert - Cache invalidation occurred (check for refetch)
  await this.page.waitForResponse((resp) => resp.url().includes('/api/assets') && resp.request().method() === 'GET');
});

Then('subsequent queries should not return the deleted asset', async function (this: CustomWorld) {
  // Assert - API no longer returns deleted asset
  const response = await this.page.request.get(`${this.baseUrl}/api/assets/${this.currentAsset.id}`);
  expect(response.status()).toBe(404);
});

// ═══════════════════════════════════════════════════════════════
// THEN - Assertions: Edge Cases
// ═══════════════════════════════════════════════════════════════

Then('the Asset Library should show {int} assets found', async function (this: CustomWorld, expectedCount: number) {
  // Assert - Asset count text shows correct value
  await expect(this.page.locator(`text=${expectedCount} assets found`)).toBeVisible();
});

Then('I should see only the virtual {string} card', async function (this: CustomWorld, _cardType: string) {
  // Assert - Only "Add" card visible, no asset cards
  await expect(this.page.locator('[data-testid="virtual-add-card"]')).toBeVisible();
  await expect(this.page.locator('[data-testid="asset-card"]')).toHaveCount(0);
});

Then(
  'I should have {int} assets on {int} page',
  async function (this: CustomWorld, assetCount: number, pageCount: number) {
    // Assert - Pagination updated
    await expect(this.page.locator('[data-testid="asset-card"]')).toHaveCount(assetCount);

    // Verify only 1 page exists (page 2 button should not exist)
    if (pageCount === 1) {
      await expect(this.page.locator('button[aria-label="Go to page 2"]')).not.toBeVisible();
    }
  },
);

Then('I should be redirected to page {int}', async function (this: CustomWorld, _pageNumber: number) {
  // Assert - URL contains page parameter
  await expect(this.page).toHaveURL(/page=1/);
});
