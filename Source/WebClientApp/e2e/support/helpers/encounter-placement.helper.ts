/**
 * Encounter Placement Helper
 *
 * Helper functions for BDD step definitions:
 * - Drag assets from library to canvas
 * - Move assets on canvas
 * - Delete assets from canvas
 * - Verify asset placement and position
 *
 * CRITICAL: Black-box testing approach
 * - Interact through UI (Playwright locators)
 * - No component internals access
 * - Real browser interactions
 */

import { expect, type Page } from '@playwright/test';

/**
 * Expand encounter canvas to full view
 * @param page Playwright page
 */
export async function expandEncounterCanvas(page: Page): Promise<void> {
  // Wait for encounter editor to load
  await page.waitForSelector('[data-testid="encounter-editor-canvas"]', {
    timeout: 10000,
  });

  // Expand canvas if collapsed
  const expandButton = page.locator('button:has-text("Expand Canvas")');
  if (await expandButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await expandButton.click();
  }

  // Wait for canvas to be ready
  await page.waitForTimeout(500);
}

/**
 * Drag asset from library to canvas at specific position
 * @param page Playwright page
 * @param assetId Asset template ID
 * @param position Target position on canvas (stage coordinates)
 */
export async function dragAssetToCanvas(
  page: Page,
  assetId: string,
  position: { x: number; y: number },
): Promise<void> {
  // Locate asset in library panel
  const assetTile = page.locator(`[data-asset-id="${assetId}"]`).first();
  await expect(assetTile).toBeVisible({ timeout: 5000 });

  // Get canvas element
  const canvas = page.locator('[data-testid="encounter-editor-canvas"]');
  await expect(canvas).toBeVisible();

  // Get canvas bounding box for coordinate conversion
  const canvasBounds = await canvas.boundingBox();
  if (!canvasBounds) {
    throw new Error('Canvas bounding box not found');
  }

  // Convert stage coordinates to viewport coordinates
  // Assuming 1:1 scale for simplicity (adjust if zoom/pan implemented)

  // Drag asset from library to canvas position
  await assetTile.dragTo(canvas, {
    targetPosition: {
      x: position.x,
      y: position.y,
    },
  });

  // Wait for placement animation
  await page.waitForTimeout(300);
}

/**
 * Move placed asset on canvas to new position
 * @param page Playwright page
 * @param assetInstanceId Placed asset instance ID
 * @param position New position (stage coordinates)
 */
export async function moveAssetOnCanvas(
  page: Page,
  assetInstanceId: string,
  position: { x: number; y: number },
): Promise<void> {
  // Select asset on canvas
  const assetNode = page.locator(`[data-asset-instance-id="${assetInstanceId}"]`);
  await expect(assetNode).toBeVisible({ timeout: 5000 });

  // Click to select
  await assetNode.click();

  // Wait for selection indicator
  await page.waitForTimeout(200);

  // Get canvas for coordinate conversion
  const canvas = page.locator('[data-testid="encounter-editor-canvas"]');
  const canvasBounds = await canvas.boundingBox();
  if (!canvasBounds) {
    throw new Error('Canvas bounding box not found');
  }

  // Drag asset to new position
  await assetNode.dragTo(canvas, {
    targetPosition: {
      x: position.x,
      y: position.y,
    },
  });

  // Wait for drag to complete
  await page.waitForTimeout(300);
}

/**
 * Select asset on canvas
 * @param page Playwright page
 * @param assetInstanceId Placed asset instance ID
 */
export async function selectAssetOnCanvas(page: Page, assetInstanceId: string): Promise<void> {
  const assetNode = page.locator(`[data-asset-instance-id="${assetInstanceId}"]`);
  await expect(assetNode).toBeVisible({ timeout: 5000 });

  await assetNode.click();

  // Wait for selection
  await page.waitForTimeout(200);

  // Verify selection indicator appears
  const transformer = page.locator('.konvajs-content .transformer-anchor');
  await expect(transformer.first()).toBeVisible({ timeout: 2000 });
}

/**
 * Delete asset from canvas using keyboard (Delete key)
 * @param page Playwright page
 * @param assetInstanceId Placed asset instance ID
 */
export async function deleteAssetFromCanvas(page: Page, assetInstanceId: string): Promise<void> {
  // Select asset first
  await selectAssetOnCanvas(page, assetInstanceId);

  // Press Delete key
  await page.keyboard.press('Delete');

  // Wait for deletion animation
  await page.waitForTimeout(300);
}

/**
 * Verify asset was placed successfully (appears on canvas)
 * @param page Playwright page
 */
export async function verifyAssetPlaced(page: Page): Promise<void> {
  // Check for newly placed asset (any asset with placement indicator)
  const placedAssets = page.locator('[data-asset-instance-id]');
  await expect(placedAssets.first()).toBeVisible({ timeout: 5000 });
}

/**
 * Verify asset position on canvas
 * @param page Playwright page
 * @param assetInstanceId Placed asset instance ID
 * @param expectedPosition Expected position (stage coordinates)
 * @param tolerance Position tolerance in pixels (for snap-to-grid)
 */
export async function verifyAssetPosition(
  page: Page,
  assetInstanceId: string,
  expectedPosition: { x: number; y: number },
  tolerance: number = 5,
): Promise<void> {
  const assetNode = page.locator(`[data-asset-instance-id="${assetInstanceId}"]`);
  await expect(assetNode).toBeVisible({ timeout: 5000 });

  // Get asset position attribute (set by Konva)
  const positionAttr = await assetNode.getAttribute('data-position');
  if (!positionAttr) {
    throw new Error('Asset position attribute not found');
  }

  const [actualX, actualY] = positionAttr.split(',').map(Number);

  // Verify within tolerance (for snap-to-grid behavior)
  expect(Math.abs((actualX ?? 0) - expectedPosition.x)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs((actualY ?? 0) - expectedPosition.y)).toBeLessThanOrEqual(tolerance);
}

/**
 * Verify asset was removed from canvas
 * @param page Playwright page
 * @param assetInstanceId Placed asset instance ID
 */
export async function verifyAssetRemoved(page: Page, assetInstanceId: string): Promise<void> {
  const assetNode = page.locator(`[data-asset-instance-id="${assetInstanceId}"]`);

  // Asset should not be visible after deletion
  await expect(assetNode).not.toBeVisible({ timeout: 5000 });
}

/**
 * Get count of placed assets on canvas
 * @param page Playwright page
 * @param encounterId Encounter ID (for API query)
 * @returns Number of placed assets
 */
export async function getPlacedAssetCount(page: Page, encounterId: string): Promise<number> {
  // Query via API for accurate count
  const response = await page.request.get(`/api/encounters/${encounterId}/assets`);
  expect(response.ok()).toBeTruthy();

  const assets = await response.json();
  return assets.length;
}

/**
 * Verify grid snapping behavior
 * @param page Playwright page
 * @param position Asset position
 * @param gridSize Grid cell size
 */
export async function verifyGridSnap(_page: Page, position: { x: number; y: number }, gridSize: number): Promise<void> {
  // Position should be aligned to grid
  expect(position.x % gridSize).toBe(0);
  expect(position.y % gridSize).toBe(0);
}

/**
 * Verify asset overlap detection
 * @param page Playwright page
 * @param asset1 First asset position and size
 * @param asset2 Second asset position and size
 * @returns True if assets overlap
 */
export async function checkAssetOverlap(
  _page: Page,
  asset1: { x: number; y: number; width: number; height: number },
  asset2: { x: number; y: number; width: number; height: number },
): Promise<boolean> {
  // Simple bounding box overlap check
  const box1 = {
    left: asset1.x - asset1.width / 2,
    right: asset1.x + asset1.width / 2,
    top: asset1.y - asset1.height / 2,
    bottom: asset1.y + asset1.height / 2,
  };

  const box2 = {
    left: asset2.x - asset2.width / 2,
    right: asset2.x + asset2.width / 2,
    top: asset2.y - asset2.height / 2,
    bottom: asset2.y + asset2.height / 2,
  };

  return !(box1.right < box2.left || box1.left > box2.right || box1.bottom < box2.top || box1.top > box2.bottom);
}

/**
 * Rotate asset on canvas
 * @param page Playwright page
 * @param assetInstanceId Placed asset instance ID
 * @param rotation Target rotation in degrees
 */
export async function rotateAssetOnCanvas(page: Page, assetInstanceId: string, _rotation: number): Promise<void> {
  // Select asset
  await selectAssetOnCanvas(page, assetInstanceId);

  // Use rotation handle or properties panel
  // TODO: Implement rotation interaction when UI is ready
  // For now, this is a placeholder

  await page.waitForTimeout(200);
}

/**
 * Resize asset on canvas
 * @param page Playwright page
 * @param assetInstanceId Placed asset instance ID
 * @param size New size (width, height)
 */
export async function resizeAssetOnCanvas(
  page: Page,
  assetInstanceId: string,
  _size: { width: number; height: number },
): Promise<void> {
  // Select asset
  await selectAssetOnCanvas(page, assetInstanceId);

  // Use resize handles or properties panel
  // TODO: Implement resize interaction when UI is ready
  // For now, this is a placeholder

  await page.waitForTimeout(200);
}

/**
 * Verify asset layer (z-index)
 * @param page Playwright page
 * @param assetInstanceId Placed asset instance ID
 * @param expectedLayer Expected layer index
 */
export async function verifyAssetLayer(page: Page, assetInstanceId: string, expectedLayer: number): Promise<void> {
  const assetNode = page.locator(`[data-asset-instance-id="${assetInstanceId}"]`);
  const layerAttr = await assetNode.getAttribute('data-layer');

  expect(Number(layerAttr)).toBe(expectedLayer);
}
