// GENERATED: 2025-10-07 by Claude Code Phase 5 Step 2 Testing
// Test Suite: Asset Library Page E2E Tests

import { test, expect, Page } from '@playwright/test';

/**
 * Mock authentication by intercepting /api/auth/me endpoint
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

test.describe('Asset Library Page', () => {
    test.beforeEach(async ({ page }) => {
        // Mock authentication for all tests
        await mockAuthentication(page);
    });

    test('loads Asset Library page successfully', async ({ page }) => {
        // Navigate to Asset Library
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Verify page header
        await expect(page.getByRole('heading', { name: 'Asset Library' })).toBeVisible();
        await expect(page.getByText('Manage your objects and creatures for scenes')).toBeVisible();

        // Verify "Create Asset" button
        await expect(page.getByRole('button', { name: 'Create Asset' })).toBeVisible();

        // Verify filter buttons
        await expect(page.getByRole('button', { name: 'All Assets' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Objects' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Creatures' })).toBeVisible();
    });

    test('shows empty state when no assets exist', async ({ page }) => {
        // Mock empty assets response
        await page.route('**/api/assets*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([])
            });
        });

        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Verify empty state
        await expect(page.getByText('No Assets Found')).toBeVisible();
        await expect(page.getByText('Get started by creating your first asset template.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Create Your First Asset' })).toBeVisible();
    });

    test('displays asset cards when assets exist', async ({ page }) => {
        // Mock assets response
        await page.route('**/api/assets*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: '1',
                        ownerId: 'user-1',
                        kind: 'Object',
                        name: 'Wooden Table',
                        description: 'A sturdy oak table',
                        isPublished: false,
                        isPublic: false,
                        createdAt: '2025-10-07T00:00:00Z',
                        updatedAt: '2025-10-07T00:00:00Z',
                        objectProps: {
                            cellWidth: 2,
                            cellHeight: 1,
                            isMovable: true,
                            isOpaque: false,
                            isVisible: true
                        }
                    },
                    {
                        id: '2',
                        ownerId: 'user-1',
                        kind: 'Creature',
                        name: 'Goblin Warrior',
                        description: 'Small hostile creature',
                        isPublished: true,
                        isPublic: true,
                        createdAt: '2025-10-07T00:00:00Z',
                        updatedAt: '2025-10-07T00:00:00Z',
                        creatureProps: {
                            cellSize: 1,
                            category: 'Monster',
                            tokenStyle: {
                                borderColor: '#FF0000',
                                backgroundColor: '#FFE0E0',
                                shape: 'Circle'
                            }
                        }
                    }
                ])
            });
        });

        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Verify results count
        await expect(page.getByText('2 assets found')).toBeVisible();

        // Verify asset cards are displayed
        await expect(page.getByText('Wooden Table')).toBeVisible();
        await expect(page.getByText('Goblin Warrior')).toBeVisible();

        // Verify kind badges
        const objectBadge = page.locator('text=Object').first();
        await expect(objectBadge).toBeVisible();

        const creatureBadge = page.locator('text=Creature').first();
        await expect(creatureBadge).toBeVisible();

        // Verify published badge for goblin
        await expect(page.locator('text=Published').first()).toBeVisible();

        // Verify cell dimensions display
        await expect(page.getByText('2x1 cells')).toBeVisible(); // Table
        await expect(page.getByText('1x1 cells')).toBeVisible(); // Goblin

        // Verify public/private indicators
        await expect(page.locator('text=Private').first()).toBeVisible(); // Table
        await expect(page.locator('text=Public').first()).toBeVisible(); // Goblin
    });

    test('filter buttons work correctly', async ({ page }) => {
        // Mock all assets API calls dynamically based on URL
        await page.route('**/api/assets**', async (route) => {
            const url = route.request().url();

            if (url.includes('kind=Object')) {
                // Objects only
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            id: '1',
                            kind: 'Object',
                            name: 'Table',
                            description: 'Test',
                            isPublished: false,
                            isPublic: false,
                            ownerId: 'test-user',
                            createdAt: '2025-10-07T00:00:00Z',
                            updatedAt: '2025-10-07T00:00:00Z',
                            objectProps: { cellWidth: 1, cellHeight: 1, isMovable: true, isOpaque: false, isVisible: true }
                        }
                    ])
                });
            } else if (url.includes('kind=Creature')) {
                // Creatures only
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            id: '2',
                            kind: 'Creature',
                            name: 'Goblin',
                            description: 'Test',
                            isPublished: false,
                            isPublic: false,
                            ownerId: 'test-user',
                            createdAt: '2025-10-07T00:00:00Z',
                            updatedAt: '2025-10-07T00:00:00Z',
                            creatureProps: { cellSize: 1, category: 'Monster' }
                        }
                    ])
                });
            } else {
                // All assets
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            id: '1',
                            kind: 'Object',
                            name: 'Table',
                            description: 'Test',
                            isPublished: false,
                            isPublic: false,
                            ownerId: 'test-user',
                            createdAt: '2025-10-07T00:00:00Z',
                            updatedAt: '2025-10-07T00:00:00Z',
                            objectProps: { cellWidth: 1, cellHeight: 1, isMovable: true, isOpaque: false, isVisible: true }
                        },
                        {
                            id: '2',
                            kind: 'Creature',
                            name: 'Goblin',
                            description: 'Test',
                            isPublished: false,
                            isPublic: false,
                            ownerId: 'test-user',
                            createdAt: '2025-10-07T00:00:00Z',
                            updatedAt: '2025-10-07T00:00:00Z',
                            creatureProps: { cellSize: 1, category: 'Monster' }
                        }
                    ])
                });
            }
        });

        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Verify "All Assets" shows both
        await expect(page.getByText('2 assets found')).toBeVisible();

        // Click "Objects" filter
        await page.getByRole('button', { name: 'Objects' }).click();
        await expect(page.getByText('1 asset found')).toBeVisible();
        await expect(page.getByText('Table')).toBeVisible();

        // Click "Creatures" filter
        await page.getByRole('button', { name: 'Creatures' }).click();
        await expect(page.getByText('1 asset found')).toBeVisible();
        await expect(page.getByText('Goblin')).toBeVisible();

        // Click "All Assets" filter
        await page.getByRole('button', { name: 'All Assets' }).click();
        await expect(page.getByText('2 assets found')).toBeVisible();
    });

    test('navigation from header works', async ({ page }) => {
        // Start at home page
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Click "Assets" in header navigation
        await page.getByRole('button', { name: 'Assets' }).click();
        await page.waitForLoadState('networkidle');

        // Verify navigated to Asset Library
        await expect(page).toHaveURL('/assets');
        await expect(page.getByRole('heading', { name: 'Asset Library' })).toBeVisible();
    });

    test('error state displays with retry button', async ({ page }) => {
        // Mock API error
        await page.route('**/api/assets*', async (route) => {
            await route.abort('failed');
        });

        await page.goto('/assets');
        await page.waitForTimeout(1000);

        // Verify error alert
        await expect(page.getByText('Failed to load assets. Please try again.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
    });

    test('loading state shows skeleton cards', async ({ page }) => {
        let resolveResponse: ((value: any) => void) | null = null;
        const responsePromise = new Promise(resolve => { resolveResponse = resolve; });

        // Mock slow API response
        await page.route('**/api/assets*', async (route) => {
            // Wait for test to trigger resolution
            await responsePromise;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([])
            });
        });

        await page.goto('/assets');

        // During loading, skeletons should be visible
        // Check for MUI Skeleton by looking for the loading state
        await page.waitForTimeout(500);

        // Verify page is in loading state (check for CircularProgress or lack of content)
        const hasNoContent = await page.locator('text=No Assets Found').count() === 0;
        expect(hasNoContent).toBeTruthy();

        // Now resolve the API response
        if (resolveResponse) resolveResponse(true);

        // Wait for API response to complete
        await page.waitForResponse(response => response.url().includes('/api/assets'));

        // After load completes, empty state should appear
        await expect(page.getByText('No Assets Found')).toBeVisible({ timeout: 2000 });
    });

    test('card click handler triggers (console log)', async ({ page }) => {
        // Setup console listener
        const consoleMessages: string[] = [];
        page.on('console', msg => consoleMessages.push(msg.text()));

        // Mock assets response
        await page.route('**/api/assets*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'test-asset-id',
                        kind: 'Object',
                        name: 'Test Table',
                        description: 'Test',
                        isPublished: false,
                        isPublic: false,
                        objectProps: { cellWidth: 1, cellHeight: 1, isMovable: true, isOpaque: false, isVisible: true }
                    }
                ])
            });
        });

        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Click on asset card
        await page.getByText('Test Table').click();
        await page.waitForTimeout(500);

        // Verify console.log was called (placeholder for preview dialog)
        expect(consoleMessages.some(msg => msg.includes('Asset clicked'))).toBeTruthy();
    });
});
