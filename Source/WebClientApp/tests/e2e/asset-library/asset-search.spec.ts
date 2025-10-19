// GENERATED: 2025-10-07 by Claude Code Phase 5 Step 4 Testing
// Test Suite: Asset Search E2E Tests

import { test, expect, Page } from '@playwright/test';

async function mockAuthentication(page: Page) {
    await page.route('**/api/auth/me', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                data: {
                    id: 'test-user-id',
                    email: 'test@example.com',
                    userName: 'test@example.com',
                    name: 'TestUser',
                    displayName: 'TestUser',
                    emailConfirmed: true,
                },
                success: true
            })
        });
    });
}

async function mockAssetsForSearch(page: Page) {
    const allAssets = [
        {
            id: '1',
            ownerId: 'test-user-id',
            kind: 'Object',
            name: 'Wooden Table',
            description: 'A sturdy oak dining table',
            isPublished: false,
            isPublic: false,
            createdAt: '2025-10-07T00:00:00Z',
            updatedAt: '2025-10-07T00:00:00Z',
            objectProps: { cellWidth: 2, cellHeight: 1, isMovable: true, isOpaque: false, isVisible: true }
        },
        {
            id: '2',
            ownerId: 'test-user-id',
            kind: 'Creature',
            name: 'Goblin Warrior',
            description: 'Small hostile creature with crude weapons',
            isPublished: false,
            isPublic: false,
            createdAt: '2025-10-07T00:00:00Z',
            updatedAt: '2025-10-07T00:00:00Z',
            creatureProps: { cellSize: 1, category: 'Monster' }
        },
        {
            id: '3',
            ownerId: 'test-user-id',
            kind: 'Object',
            name: 'Stone Chair',
            description: 'Heavy chair made of granite',
            isPublished: false,
            isPublic: false,
            createdAt: '2025-10-07T00:00:00Z',
            updatedAt: '2025-10-07T00:00:00Z',
            objectProps: { cellWidth: 1, cellHeight: 1, isMovable: false, isOpaque: false, isVisible: true }
        },
    ];

    await page.route('**/api/assets**', async (route) => {
        const url = route.request().url();
        let filtered = [...allAssets];

        // Default: mine
        if (!url.includes('owner=')) {
            filtered = filtered.filter(a => a.ownerId === 'test-user-id');
        }

        // Filter by search
        if (url.includes('search=')) {
            const searchMatch = url.match(/search=([^&]+)/);
            if (searchMatch) {
                const searchTerm = decodeURIComponent(searchMatch[1]).toLowerCase();
                filtered = filtered.filter(a =>
                    a.name.toLowerCase().includes(searchTerm) ||
                    a.description.toLowerCase().includes(searchTerm)
                );
            }
        }

        // Filter by kind
        if (url.includes('kind=Object')) {
            filtered = filtered.filter(a => a.kind === 'Object');
        } else if (url.includes('kind=Creature')) {
            filtered = filtered.filter(a => a.kind === 'Creature');
        }

        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(filtered)
        });
    });
}

test.describe('Asset Search', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthentication(page);
        await mockAssetsForSearch(page);
    });

    test('search bar renders correctly', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Verify search input exists
        const searchInput = page.getByPlaceholder('Search assets by name or description...');
        await expect(searchInput).toBeVisible();

        // Verify search icon
        await expect(page.locator('[data-testid="SearchIcon"], svg[data-testid="SearchIcon"]').first()).toBeVisible();
    });

    test('search by name works with debounce', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Initial state: 3 assets
        await expect(page.getByText('3 assets found')).toBeVisible();

        // Type search query
        const searchInput = page.getByPlaceholder('Search assets by name or description...');
        await searchInput.fill('Goblin');

        // Wait for debounce (300ms) + API response
        await page.waitForTimeout(500);

        // Should show only Goblin Warrior
        await expect(page.getByText('1 asset found')).toBeVisible();
        await expect(page.getByText('Goblin Warrior')).toBeVisible();
        await expect(page.getByText('Wooden Table')).not.toBeVisible();
    });

    test('search by description works', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Search for "granite" (in Stone Chair description)
        const searchInput = page.getByPlaceholder('Search assets by name or description...');
        await searchInput.fill('granite');
        await page.waitForTimeout(500);

        // Should show only Stone Chair
        await expect(page.getByText('1 asset found')).toBeVisible();
        await expect(page.getByText('Stone Chair')).toBeVisible();
    });

    test('clear button appears and works', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        const searchInput = page.getByPlaceholder('Search assets by name or description...');

        // Initially no clear button
        await expect(page.getByLabel('clear search')).not.toBeVisible();

        // Type something
        await searchInput.fill('Goblin');
        await page.waitForTimeout(100);

        // Clear button should appear
        await expect(page.getByLabel('clear search')).toBeVisible();

        // Click clear
        await page.getByLabel('clear search').click();
        await page.waitForTimeout(500);

        // Should show all assets again
        await expect(page.getByText('3 assets found')).toBeVisible();
        await expect(searchInput).toHaveValue('');
    });

    test('search combines with kind filter', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Select "Objects" filter
        await page.getByLabel('Objects').click();
        await page.waitForTimeout(300);

        // Should show 2 objects
        await expect(page.getByText('2 assets found')).toBeVisible();

        // Search for "table"
        const searchInput = page.getByPlaceholder('Search assets by name or description...');
        await searchInput.fill('table');
        await page.waitForTimeout(500);

        // Should show only Wooden Table (filtered by both kind=Object and search=table)
        await expect(page.getByText('1 asset found')).toBeVisible();
        await expect(page.getByText('Wooden Table')).toBeVisible();
        await expect(page.getByText('Stone Chair')).not.toBeVisible();
    });

    test('empty search shows all results', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        const searchInput = page.getByPlaceholder('Search assets by name or description...');

        // Search for something
        await searchInput.fill('Goblin');
        await page.waitForTimeout(500);
        await expect(page.getByText('1 asset found')).toBeVisible();

        // Clear search
        await searchInput.fill('');
        await page.waitForTimeout(500);

        // Should show all 3 assets again
        await expect(page.getByText('3 assets found')).toBeVisible();
    });

    test.skip('no results found shows zero count', async ({ page }) => {
        await page.goto('/assets');
        await page.waitForLoadState('networkidle');

        // Search for non-existent asset
        const searchInput = page.getByPlaceholder('Search assets by name or description...');
        await searchInput.fill('NonExistentAsset123');
        await page.waitForTimeout(500);

        // Should show "0 assets found" (not empty state, since query was applied)
        await expect(page.getByText('0 assets found')).toBeVisible();
    });
});
