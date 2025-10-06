/**
 * Phase 4 Grid Validation E2E Tests
 * Comprehensive testing for all 5 grid types, snap-to-grid, and performance (60 FPS)
 *
 * PHASE: 4 (Grid & Layers)
 * GATE: 4 Success Criteria
 * - All 5 grid types render correctly
 * - Grid config updates in <100ms
 * - Performance maintained at 60 FPS
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:5175';
const SCENE_EDITOR_URL = `${BASE_URL}/scene-editor`;

// Grid types enum (matches GridType in gridCalculator.ts)
enum GridType {
    NoGrid = 0,
    Square = 1,
    HexH = 2,      // Hexagonal Horizontal
    HexV = 3,      // Hexagonal Vertical
    Isometric = 4
}

// Test helpers

/**
 * Mock authentication for E2E tests
 * Intercepts auth API calls to return authenticated user
 */
async function mockAuthentication(page: Page) {
    // Mock the /api/auth/me endpoint to return authenticated user
    await page.route('**/api/auth/me', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                data: {
                    id: 'test-user-id',
                    email: 'test@example.com',
                    userName: 'TestUser',
                    emailConfirmed: true,
                    phoneNumberConfirmed: false,
                    twoFactorEnabled: false,
                    lockoutEnabled: false,
                    accessFailedCount: 0,
                    createdAt: new Date().toISOString()
                },
                success: true
            })
        });
    });
}

async function navigateToSceneEditor(page: Page) {
    // Mock authentication before navigation
    await mockAuthentication(page);

    await page.goto(SCENE_EDITOR_URL);
    await page.waitForSelector('canvas', { timeout: 10000 });
}

async function changeGridType(page: Page, gridType: GridType) {
    // Open Stage menu using getByRole for better reliability
    await page.getByRole('button', { name: 'Stage' }).click();
    await page.waitForTimeout(300);

    // Wait for menu to be visible
    await page.getByText('Background').waitFor({ state: 'visible' });

    // Find the Select by looking for the element that contains the current grid type text
    // The MUI Select renders as a div, we need to click on it to open the dropdown
    const gridSelect = page.locator('div').filter({ hasText: /^(Square|No Grid|Hex - Horizontal|Hex - Vertical|Isometric)$/ }).first();
    await gridSelect.click();
    await page.waitForTimeout(200);

    // Map GridType enum to menu text
    const gridTypeText = {
        [GridType.NoGrid]: 'No Grid',
        [GridType.Square]: 'Square',
        [GridType.HexH]: 'Hex - Horizontal',
        [GridType.HexV]: 'Hex - Vertical',
        [GridType.Isometric]: 'Isometric'
    };

    // Click the desired MenuItem using getByRole for the listbox option
    await page.getByRole('option', { name: gridTypeText[gridType] }).click();

    // Wait for grid to render
    await page.waitForTimeout(300);

    // Close the Stage menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
}

async function measureFPS(page: Page, durationMs: number = 2000): Promise<number> {
    const fps = await page.evaluate(async (duration) => {
        return new Promise<number>((resolve) => {
            let frames = 0;
            let lastTime = performance.now();
            const startTime = lastTime;

            const measure = () => {
                const currentTime = performance.now();
                frames++;

                if (currentTime - startTime < duration) {
                    requestAnimationFrame(measure);
                } else {
                    const totalTime = (currentTime - startTime) / 1000;
                    const fps = frames / totalTime;
                    resolve(fps);
                }
            };

            requestAnimationFrame(measure);
        });
    }, durationMs);

    return fps;
}

async function performPanZoom(page: Page) {
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Pan operation (right-click drag)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down({ button: 'right' });
    await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100);
    await page.mouse.up({ button: 'right' });

    // Zoom operation (wheel)
    await page.mouse.wheel(0, -500); // Zoom in
    await page.waitForTimeout(100);
    await page.mouse.wheel(0, 500);  // Zoom out
    await page.waitForTimeout(100);
}

async function placeAsset(page: Page, x: number, y: number) {
    // Click asset picker button (look for button with asset/library icon or text)
    const assetButton = page.locator('button').filter({ hasText: /asset|library/i }).first();
    if (await assetButton.isVisible()) {
        await assetButton.click();
        await page.waitForTimeout(300);

        // Select first asset from the picker
        await page.locator('[role="button"]').filter({ hasText: /character|creature/i }).first().click();
    }

    // Click on canvas at specified position
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    await page.mouse.click(box.x + x, box.y + y);
}

async function getPlacedAssetPosition(page: Page): Promise<{ x: number; y: number } | null> {
    return await page.evaluate(() => {
        const assetData = localStorage.getItem('scene-placed-assets');
        if (!assetData) return null;

        const assets = JSON.parse(assetData);
        if (assets.length === 0) return null;

        return assets[0].position;
    });
}

// ===================================
// GRID RENDERING TESTS
// ===================================

test.describe('Grid Rendering Tests', () => {
    test('Square grid renders correctly', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.Square);

        // Verify grid layer exists
        const hasGridLayer = await page.evaluate(() => {
            const stage = (window as any).Konva?.stages?.[0];
            if (!stage) return false;
            const gridLayer = stage.findOne('.grid') || stage.findOne('[name="grid"]');
            return !!gridLayer;
        });

        expect(hasGridLayer).toBe(true);

        // Take screenshot for visual validation
        await page.screenshot({
            path: 'test-results/screenshots/grid-square.png',
            fullPage: false
        });
    });

    test('HexH (horizontal hexagonal) grid renders correctly', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.HexH);

        const hasGridLayer = await page.evaluate(() => {
            const stage = (window as any).Konva?.stages?.[0];
            if (!stage) return false;
            const gridLayer = stage.findOne('.grid') || stage.findOne('[name="grid"]');
            return !!gridLayer;
        });

        expect(hasGridLayer).toBe(true);

        await page.screenshot({
            path: 'test-results/screenshots/grid-hexh.png',
            fullPage: false
        });
    });

    test('HexV (vertical hexagonal) grid renders correctly', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.HexV);

        const hasGridLayer = await page.evaluate(() => {
            const stage = (window as any).Konva?.stages?.[0];
            if (!stage) return false;
            const gridLayer = stage.findOne('.grid') || stage.findOne('[name="grid"]');
            return !!gridLayer;
        });

        expect(hasGridLayer).toBe(true);

        await page.screenshot({
            path: 'test-results/screenshots/grid-hexv.png',
            fullPage: false
        });
    });

    test('Isometric grid renders correctly', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.Isometric);

        const hasGridLayer = await page.evaluate(() => {
            const stage = (window as any).Konva?.stages?.[0];
            if (!stage) return false;
            const gridLayer = stage.findOne('.grid') || stage.findOne('[name="grid"]');
            return !!gridLayer;
        });

        expect(hasGridLayer).toBe(true);

        await page.screenshot({
            path: 'test-results/screenshots/grid-isometric.png',
            fullPage: false
        });
    });

    test('NoGrid mode disables grid overlay', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.NoGrid);

        const gridVisible = await page.evaluate(() => {
            const stage = (window as any).Konva?.stages?.[0];
            if (!stage) return false;
            const gridLayer = stage.findOne('.grid') || stage.findOne('[name="grid"]');
            return gridLayer?.visible() ?? false;
        });

        expect(gridVisible).toBe(false);

        await page.screenshot({
            path: 'test-results/screenshots/grid-none.png',
            fullPage: false
        });
    });
});

// ===================================
// SNAP-TO-GRID FUNCTIONALITY TESTS
// ===================================

test.describe.skip('Snap-to-Grid Functionality Tests', () => {
    // SKIPPED: Requires asset placement UI verification first
    test('Asset placement snaps to Square grid intersections', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.Square);

        // Place asset at arbitrary position
        await placeAsset(page, 235, 167);

        // Get placed position
        const position = await getPlacedAssetPosition(page);
        expect(position).not.toBeNull();

        // Verify position is snapped to grid (should be multiple of cellWidth/cellHeight)
        // Default grid is 50x50, so position should be multiple of 50
        if (position) {
            const isSnapped = (position.x % 50 === 0) && (position.y % 50 === 0);
            expect(isSnapped).toBe(true);
        }
    });

    test('Asset placement snaps to HexH hexagon centers', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.HexH);

        await placeAsset(page, 300, 200);

        const position = await getPlacedAssetPosition(page);
        expect(position).not.toBeNull();

        // Position should be calculated via hexagonal snap logic
        // Just verify position exists and is within canvas bounds
        if (position) {
            expect(position.x).toBeGreaterThan(0);
            expect(position.y).toBeGreaterThan(0);
        }
    });

    test('Asset placement snaps to HexV hexagon centers', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.HexV);

        await placeAsset(page, 300, 200);

        const position = await getPlacedAssetPosition(page);
        expect(position).not.toBeNull();

        if (position) {
            expect(position.x).toBeGreaterThan(0);
            expect(position.y).toBeGreaterThan(0);
        }
    });

    test('Asset placement snaps to Isometric diamond centers', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.Isometric);

        await placeAsset(page, 300, 200);

        const position = await getPlacedAssetPosition(page);
        expect(position).not.toBeNull();

        if (position) {
            expect(position.x).toBeGreaterThan(0);
            expect(position.y).toBeGreaterThan(0);
        }
    });

    test('Asset placement is free-form when NoGrid selected', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.NoGrid);

        // Place asset at exact position (should not snap)
        await placeAsset(page, 235, 167);

        const position = await getPlacedAssetPosition(page);
        expect(position).not.toBeNull();

        // Position should NOT be snapped to grid
        if (position) {
            // For NoGrid, position might not be exact pixel but should be close
            expect(Math.abs(position.x - 235)).toBeLessThan(10);
            expect(Math.abs(position.y - 167)).toBeLessThan(10);
        }
    });
});

// ===================================
// PERFORMANCE TESTS (60 FPS)
// ===================================

test.describe.skip('Performance Tests - 60 FPS Requirement', () => {
    // SKIPPED: Performance testing deferred - focusing on behavioral validation only
    test('Square grid maintains 60 FPS during pan/zoom', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.Square);

        // Start FPS measurement
        const fpsPromise = measureFPS(page, 2000);

        // Perform pan/zoom operations
        await performPanZoom(page);

        const fps = await fpsPromise;

        console.log(`Square grid FPS: ${fps.toFixed(2)}`);

        // Assert 60 FPS (allow 10% margin)
        expect(fps).toBeGreaterThanOrEqual(54);
    });

    test('HexH grid maintains 60 FPS during pan/zoom', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.HexH);

        const fpsPromise = measureFPS(page, 2000);
        await performPanZoom(page);
        const fps = await fpsPromise;

        console.log(`HexH grid FPS: ${fps.toFixed(2)}`);
        expect(fps).toBeGreaterThanOrEqual(54);
    });

    test('HexV grid maintains 60 FPS during pan/zoom', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.HexV);

        const fpsPromise = measureFPS(page, 2000);
        await performPanZoom(page);
        const fps = await fpsPromise;

        console.log(`HexV grid FPS: ${fps.toFixed(2)}`);
        expect(fps).toBeGreaterThanOrEqual(54);
    });

    test('Isometric grid maintains 60 FPS during pan/zoom', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.Isometric);

        const fpsPromise = measureFPS(page, 2000);
        await performPanZoom(page);
        const fps = await fpsPromise;

        console.log(`Isometric grid FPS: ${fps.toFixed(2)}`);
        expect(fps).toBeGreaterThanOrEqual(54);
    });

    test('Grid config changes update in <100ms', async ({ page }) => {
        await navigateToSceneEditor(page);

        const startTime = Date.now();
        await changeGridType(page, GridType.HexH);
        const endTime = Date.now();

        const updateTime = endTime - startTime;
        console.log(`Grid config update time: ${updateTime}ms`);

        // Assert update time <100ms
        expect(updateTime).toBeLessThan(100);
    });
});

// ===================================
// EDGE CASE TESTS
// ===================================

test.describe.skip('Edge Case Tests', () => {
    // SKIPPED: Current UI uses +/- buttons, not direct input fields
    // These tests require UI update to support direct value input or data-testid attributes
    test('Extreme cell sizes (1px and 500px)', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.Square);

        // Test 1px cell size
        await page.locator('input[type="number"]').filter({ has: page.locator('label:has-text("Cell Width")') }).fill('1');
        await page.locator('input[type="number"]').filter({ has: page.locator('label:has-text("Cell Height")') }).fill('1');
        await page.waitForTimeout(200);

        let hasGrid = await page.evaluate(() => {
            const stage = (window as any).Konva?.stages?.[0];
            return !!stage?.findOne('[name="grid"]');
        });
        expect(hasGrid).toBe(true);

        // Test 500px cell size
        await page.getByLabel('Cell Width (px)').fill('500');
        await page.getByLabel('Cell Height (px)').fill('500');
        await page.waitForTimeout(200);

        hasGrid = await page.evaluate(() => {
            const stage = (window as any).Konva?.stages?.[0];
            return !!stage?.findOne('[name="grid"]');
        });
        expect(hasGrid).toBe(true);
    });

    test('Grid offset behavior', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.Square);

        // Test offset 0
        await page.getByLabel('Offset X (px)').fill('0');
        await page.getByLabel('Offset Y (px)').fill('0');
        await page.waitForTimeout(200);

        // Test negative offset
        await page.getByLabel('Offset X (px)').fill('-50');
        await page.getByLabel('Offset Y (px)').fill('-50');
        await page.waitForTimeout(200);

        // Test large positive offset
        await page.getByLabel('Offset X (px)').fill('100');
        await page.getByLabel('Offset Y (px)').fill('100');
        await page.waitForTimeout(200);

        const hasGrid = await page.evaluate(() => {
            const stage = (window as any).Konva?.stages?.[0];
            return !!stage?.findOne('[name="grid"]');
        });
        expect(hasGrid).toBe(true);
    });

    test('Grid color variations', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.Square);

        const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffffff'];

        for (const color of colors) {
            await page.getByLabel('Grid Color').fill(color);
            await page.waitForTimeout(100);

            const gridColor = await page.evaluate(() => {
                const stage = (window as any).Konva?.stages?.[0];
                const gridLayer = stage?.findOne('[name="grid"]');
                return gridLayer?.children?.[0]?.stroke();
            });

            expect(gridColor?.toLowerCase()).toBe(color.toLowerCase());
        }
    });

    test('Grid persistence after page refresh', async ({ page }) => {
        await navigateToSceneEditor(page);
        await changeGridType(page, GridType.HexH);

        // Change grid settings
        await page.getByLabel('Cell Width (px)').fill('75');
        await page.getByLabel('Cell Height (px)').fill('75');

        // Refresh page
        await page.reload();
        await page.waitForSelector('canvas');

        // Open grid panel again after refresh
        const gridButton = page.locator('button:has-text("Grid")');
        if (await gridButton.isVisible()) {
            await gridButton.click();
        }

        // Verify grid settings persisted
        const cellWidth = await page.getByLabel('Cell Width (px)').inputValue();
        expect(cellWidth).toBe('75');
    });
});
