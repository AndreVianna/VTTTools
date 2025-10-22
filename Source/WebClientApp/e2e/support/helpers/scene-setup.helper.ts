/**
 * Scene Setup Helper
 *
 * Common helper functions for setting up test scenes:
 * - Create test scenes via API
 * - Create test image resources
 * - Zoom operations for scene canvas
 *
 * CRITICAL: NO step-to-step calls - only reusable helper functions
 */

import { Page, expect } from '@playwright/test';
import { CustomWorld } from '../world.js';

/**
 * Create a test scene for the current user
 * @param world CustomWorld instance
 * @returns Scene object with ID
 */
export async function createTestScene(world: CustomWorld): Promise<{ id: string; name: string }> {
    const createSceneResponse = await world.page.request.post('/api/library/scenes', {
        data: {
            name: 'Test Scene',
            description: 'Test scene created for testing',
            isPublished: false
        }
    });

    expect(createSceneResponse.ok()).toBeTruthy();
    const scene = await createSceneResponse.json();

    world.currentAsset = scene;
    world.createdAssets.push(scene);

    return scene;
}

/**
 * Create a test image resource for backgrounds
 * @param world CustomWorld instance
 * @returns Resource ID
 */
export async function createTestImageResource(world: CustomWorld): Promise<string> {
    const imagePath = (world.page.context() as any)['testDataDir'] || 'e2e/test-data/images/test-background.png';

    const uploadResponse = await world.page.request.post('/api/resources', {
        multipart: {
            file: imagePath,
            resourceKind: '1' // Image kind
        }
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
export async function zoomCanvasByScroll(
    page: Page,
    scrollCount: number,
    direction: 'up' | 'down'
): Promise<void> {
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
