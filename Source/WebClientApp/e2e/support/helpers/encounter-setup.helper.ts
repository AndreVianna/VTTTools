/**
 * Encounter Setup Helper
 *
 * Common helper functions for setting up test encounters:
 * - Create test encounters via API
 * - Create test image resources
 * - Zoom operations for encounter canvas
 *
 * CRITICAL: NO step-to-step calls - only reusable helper functions
 */

import { expect, type Page } from '@playwright/test';
import type { CustomWorld } from '../world.js';

/**
 * Create a test encounter for the current user
 * @param world CustomWorld instance
 * @returns Encounter object with ID
 */
export async function createTestEncounter(world: CustomWorld): Promise<{ id: string; name: string }> {
  const createEncounterResponse = await world.page.request.post('/api/library/encounters', {
    data: {
      name: 'Test Encounter',
      description: 'Test encounter created for testing',
      isPublished: false,
    },
  });

  expect(createEncounterResponse.ok()).toBeTruthy();
  const encounter = await createEncounterResponse.json();

  world.currentAsset = encounter;
  world.createdAssets.push(encounter);

  return encounter;
}

/**
 * Create a test image resource for backgrounds
 * @param world CustomWorld instance
 * @returns Resource ID
 */
export async function createTestImageResource(world: CustomWorld): Promise<string> {
  const imagePath = (world.page.context() as any).testDataDir || 'e2e/test-data/images/test-background.png';

  const uploadResponse = await world.page.request.post('/api/resources', {
    multipart: {
      file: imagePath,
      resourceKind: '1', // Image kind
    },
  });

  expect(uploadResponse.ok()).toBeTruthy();
  const resource = await uploadResponse.json();

  world.uploadedResourceIds.push(resource.id);
  return resource.id;
}

/**
 * Perform mouse wheel zoom on canvas
 * @param page Playwright page
 * @param scrollCount Number of scroll events
 * @param direction Direction: 'up' (zoom in) or 'down' (zoom out)
 */
export async function zoomCanvasByScroll(page: Page, scrollCount: number, direction: 'up' | 'down'): Promise<void> {
  const canvas = page.locator('canvas').first();
  const bbox = await canvas.boundingBox();

  if (!bbox) {
    throw new Error('Canvas bounding box not found');
  }

  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;

  // Move to center of canvas
  await page.mouse.move(centerX, centerY);

  // Scroll (negative deltaY = zoom in, positive = zoom out)
  const deltaY = direction === 'up' ? -100 : 100;

  for (let i = 0; i < scrollCount; i++) {
    await page.mouse.wheel(0, deltaY);
    // Wait for zoom animation frame
    await expect(canvas).toBeVisible();
  }
}
