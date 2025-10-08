// GENERATED: 2025-10-07 by Claude Code Phase 5 Step 3 Testing
// Test Suite: Asset Filter Panel E2E Tests

import { test, expect, Page } from '@playwright/test';

/**
 * Mock authentication
 */
async function mockAuthentication(page: Page) {
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
                },
                success: true
            })
        });
    });
}

/**
 * Mock comprehensive asset data for filtering tests
 */
async function mockAssetsWithFiltering(page: Page) {
    const allAssets = [
        // User's objects
        {
            id: '1',
            ownerId: 'test-user-id',
            kind: 'Object',
            name: 'My Table',
            description: 'User owned object',
            isPublished: false,
            isPublic: false,
            createdAt: '2025-10-07T00:00:00Z',
            updatedAt: '2025-10-07T00:00:00Z',
            objectProps: { cellWidth: 2, cellHeight: 1, isMovable: true, isOpaque: false, isVisible: true }
        },
        // User's creatures - character
        {
            id: '2',
            ownerId: 'test-user-id',
            kind: 'Creature',
            name: 'My Character',
            description: 'User owned character',
            isPublished: true,
            isPublic: true,
            createdAt: '2025-10-07T00:00:00Z',
            updatedAt: '2025-10-07T00:00:00Z',
            creatureProps: { cellSize: 1, category: 'Character' }
        },
        // User's creatures - monster
        {
            id: '3',
            ownerId: 'test-user-id',
            kind: 'Creature',
            name: 'My Monster',
            description: 'User owned monster',
            isPublished: false,
            isPublic: false,
            createdAt: '2025-10-07T00:00:00Z',
            updatedAt: '2025-10-07T00:00:00Z',
            creatureProps: { cellSize: 1, category: 'Monster' }
        },
        // Public object
        {
            id: '4',
            ownerId: 'other-user',
            kind: 'Object',
            name: 'Public Object',
            description: 'Public asset',
            isPublished: true,
            isPublic: true,
            createdAt: '2025-10-07T00:00:00Z',
            updatedAt: '2025-10-07T00:00:00Z',
            objectProps: { cellWidth: 1, cellHeight: 1, isMovable: true, isOpaque: false, isVisible: true }
        },
    ];

    await page.route('**/api/assets**', async (route) => {
        const url = route.request().url();
        let filtered = [...allAssets];

        // Filter by kind
        if (url.includes('kind=Object')) {
            filtered = filtered.filter(a => a.kind === 'Object');
        } else if (url.includes('kind=Creature')) {
            filtered = filtered.filter(a => a.kind === 'Creature');
        }

        // Filter by creature category
        if (url.includes('creatureCategory=Character')) {
            filtered = filtered.filter(a => a.kind === 'Creature' && a.creatureProps?.category === 'Character');
        } else if (url.includes('creatureCategory=Monster')) {
            filtered = filtered.filter(a => a.kind === 'Creature' && a.creatureProps?.category === 'Monster');
        }

        // Filter by owner
        if (url.includes('owner=mine')) {
            filtered = filtered.filter(a => a.ownerId === 'test-user-id');
        } else if (url.includes('owner=public')) {
            filtered = filtered.filter(a => a.isPublic);
        } else if (url.includes('owner=all')) {
            filtered = filtered.filter(a => a.ownerId === 'test-user-id' || (a.isPublic && a.isPublished));
        } else {
            // Default: mine
            filtered = filtered.filter(a => a.ownerId === 'test-user-id');
        }

        // Filter by published
        if (url.includes('published=true')) {
            filtered = filtered.filter(a => a.isPublished);
        }

        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(filtered)
        });
    });
}

test.describe('Asset Filter Panel', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthentication(page);
        await mockAssetsWithFiltering(page);
    });

    test('filter panel renders with all controls', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Verify filter panel header
        await expect(page.getByText('Filters')).toBeVisible();

        // Verify Kind filter section
        await expect(page.getByText('Asset Kind')).toBeVisible();
        await expect(page.getByLabel('All', { exact: true })).toBeVisible();
        await expect(page.getByLabel('Objects')).toBeVisible();
        await expect(page.getByLabel('Creatures')).toBeVisible();

        // Verify Ownership filter section
        await expect(page.getByText('Ownership')).toBeVisible();
        await expect(page.getByLabel('My Assets')).toBeVisible();
        await expect(page.getByLabel('Public Assets')).toBeVisible();
        await expect(page.getByLabel('All Assets')).toBeVisible();

        // Verify Status checkboxes
        await expect(page.getByText('Status')).toBeVisible();
        await expect(page.getByLabel('Published Only')).toBeVisible();
        await expect(page.getByLabel('Public Only')).toBeVisible();
    });

    test('kind filter works - Objects', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Initial load shows "My Assets" by default (3 assets)
        await expect(page.getByText(/3 assets? found/)).toBeVisible();

        // Select "Objects" kind filter
        await page.getByLabel('Objects').click();
        await page.waitForTimeout(500);

        // Should show only 1 object (My Table)
        await expect(page.getByText('1 asset found')).toBeVisible();
        await expect(page.getByText('My Table')).toBeVisible();
    });

    test('kind filter works - Creatures', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Select "Creatures" kind filter
        await page.getByLabel('Creatures').click();
        await page.waitForTimeout(500);

        // Should show 2 creatures (My Character + My Monster)
        await expect(page.getByText('2 assets found')).toBeVisible();
        await expect(page.getByText('My Character')).toBeVisible();
        await expect(page.getByText('My Monster')).toBeVisible();

        // Creature category filter should now be visible
        await expect(page.getByText('Creature Type')).toBeVisible();
        await expect(page.getByLabel('Characters')).toBeVisible();
        await expect(page.getByLabel('Monsters')).toBeVisible();
    });

    test('creature category filter works', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Select "Creatures" first
        await page.getByLabel('Creatures').click();
        await page.waitForTimeout(500);

        // Then select "Characters"
        await page.getByLabel('Characters').click();
        await page.waitForTimeout(500);

        // Should show only My Character
        await expect(page.getByText('1 asset found')).toBeVisible();
        await expect(page.getByText('My Character')).toBeVisible();
        await expect(page.getByText('My Monster')).not.toBeVisible();

        // Select "Monsters"
        await page.getByLabel('Monsters').click();
        await page.waitForTimeout(500);

        // Should show only My Monster
        await expect(page.getByText('1 asset found')).toBeVisible();
        await expect(page.getByText('My Monster')).toBeVisible();
        await expect(page.getByText('My Character')).not.toBeVisible();
    });

    test('ownership filter works - My Assets', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // "My Assets" is default - should show 3 user assets
        await expect(page.getByLabel('My Assets')).toBeChecked();
        await expect(page.getByText('3 assets found')).toBeVisible();
        await expect(page.getByText('My Table')).toBeVisible();
        await expect(page.getByText('My Character')).toBeVisible();
        await expect(page.getByText('My Monster')).toBeVisible();
    });

    test('ownership filter works - Public Assets', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Select "Public Assets"
        await page.getByLabel('Public Assets').click();
        await page.waitForTimeout(500);

        // Should show 2 public assets (My Character + Public Object)
        await expect(page.getByText('2 assets found')).toBeVisible();
        await expect(page.getByText('My Character')).toBeVisible();
        await expect(page.getByText('Public Object')).toBeVisible();
    });

    test('ownership filter works - All Assets', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Select "All Assets"
        await page.getByLabel('All Assets').click();
        await page.waitForTimeout(500);

        // Should show 4 assets (3 mine + 1 public published)
        await expect(page.getByText('4 assets found')).toBeVisible();
    });

    test('published only checkbox works', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Check "Published Only"
        await page.getByLabel('Published Only').click();
        await page.waitForTimeout(500);

        // Should show only published assets (My Character)
        await expect(page.getByText('1 asset found')).toBeVisible();
        await expect(page.getByText('My Character')).toBeVisible();
    });

    test('multiple filters combine correctly', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Filter: Creatures + My Assets + Published
        await page.getByLabel('Creatures').click();
        await page.waitForTimeout(300);
        await page.getByLabel('Published Only').click();
        await page.waitForTimeout(500);

        // Should show only My Character (published creature owned by user)
        await expect(page.getByText('1 asset found')).toBeVisible();
        await expect(page.getByText('My Character')).toBeVisible();
    });

    test('reset button appears and clears filters', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Initially no reset button (default filters)
        await expect(page.getByRole('button', { name: 'Reset' })).not.toBeVisible();

        // Apply some filters
        await page.getByLabel('Objects').click();
        await page.waitForTimeout(300);
        await page.getByLabel('Public Assets').click();
        await page.waitForTimeout(300);

        // Reset button should appear
        await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();

        // Click reset
        await page.getByRole('button', { name: 'Reset' }).click();
        await page.waitForTimeout(500);

        // Filters should reset to defaults
        await expect(page.getByLabel('All', { exact: true })).toBeChecked();
        await expect(page.getByLabel('My Assets')).toBeChecked();
        await expect(page.getByText('3 assets found')).toBeVisible();
    });

    test('creature category filter hides when kind changes from Creature', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Select Creatures
        await page.getByLabel('Creatures').click();
        await page.waitForTimeout(300);

        // Creature Type filter should be visible
        await expect(page.getByText('Creature Type')).toBeVisible();

        // Switch to Objects
        await page.getByLabel('Objects').click();
        await page.waitForTimeout(300);

        // Creature Type filter should be hidden
        await expect(page.getByText('Creature Type')).not.toBeVisible();
    });
});
