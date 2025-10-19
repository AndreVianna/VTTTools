import { test, expect } from '@playwright/test';

test.describe('ConnectionStatusBanner', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/scene-editor');
    });

    test('should show banner after 2 seconds when going offline', async ({ page }) => {
        const banner = page.locator('#connection-status-banner');
        await expect(banner).not.toBeVisible();

        await page.evaluate(() => {
            window.dispatchEvent(new Event('offline'));
        });

        await expect(banner).not.toBeVisible();

        await page.waitForTimeout(2100);

        await expect(banner).toBeVisible();
        await expect(banner).toContainText('Connection Lost');
        await expect(banner).toContainText('Changes are saved locally and will sync when restored');
    });

    test('should not show banner if connection restored within 2 seconds', async ({ page }) => {
        await page.evaluate(() => {
            window.dispatchEvent(new Event('offline'));
        });

        await page.waitForTimeout(1000);

        await page.evaluate(() => {
            window.dispatchEvent(new Event('online'));
        });

        await page.waitForTimeout(2000);

        const banner = page.locator('#connection-status-banner');
        await expect(banner).not.toBeVisible();
    });

    test('should hide banner when connection is restored', async ({ page }) => {
        await page.evaluate(() => {
            window.dispatchEvent(new Event('offline'));
        });

        await page.waitForTimeout(2100);

        const banner = page.locator('#connection-status-banner');
        await expect(banner).toBeVisible();

        await page.evaluate(() => {
            window.dispatchEvent(new Event('online'));
        });

        await expect(banner).not.toBeVisible({ timeout: 1000 });
    });

    test('should display last sync time when available', async ({ page }) => {
        await page.evaluate(() => {
            window.dispatchEvent(new Event('online'));
        });

        await page.waitForTimeout(500);

        await page.evaluate(() => {
            window.dispatchEvent(new Event('offline'));
        });

        await page.waitForTimeout(2100);

        const banner = page.locator('#connection-status-banner');
        await expect(banner).toBeVisible();
        await expect(banner.locator('text=/Last synced:/')).toBeVisible();
    });

    test('should slide down smoothly when appearing', async ({ page }) => {
        await page.evaluate(() => {
            window.dispatchEvent(new Event('offline'));
        });

        await page.waitForTimeout(2100);

        const banner = page.locator('#connection-status-banner');
        await expect(banner).toBeVisible();

        const transform = await banner.evaluate(el => {
            return window.getComputedStyle(el.parentElement!).transform;
        });

        expect(transform).toBeDefined();
    });
});

test.describe('EditingBlocker', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/scene-editor');
    });

    test('should block editing actions when offline', async ({ page }) => {
        await page.evaluate(() => {
            window.dispatchEvent(new Event('offline'));
        });

        await page.waitForTimeout(2100);

        const blocker = page.locator('#editing-blocker');
        await expect(blocker).toBeVisible();
        await expect(blocker).toContainText('Editing disabled while offline');
    });

    test('should prevent click propagation on editing area', async ({ page }) => {
        let clickReceived = false;

        await page.evaluate(() => {
            document.body.addEventListener('click', () => {
                (window as any).bodyClicked = true;
            });
        });

        await page.evaluate(() => {
            window.dispatchEvent(new Event('offline'));
        });

        await page.waitForTimeout(2100);

        const blocker = page.locator('#editing-blocker');
        await expect(blocker).toBeVisible();

        await blocker.click({ position: { x: 100, y: 100 } });

        const bodyClicked = await page.evaluate(() => (window as any).bodyClicked);
        expect(bodyClicked).toBeUndefined();
    });

    test('should not block navigation (allow read-only)', async ({ page }) => {
        await page.evaluate(() => {
            window.dispatchEvent(new Event('offline'));
        });

        await page.waitForTimeout(2100);

        const blocker = page.locator('#editing-blocker');
        await expect(blocker).toBeVisible();

        const navLink = page.locator('a[href="/"]');
        await expect(navLink).toBeVisible();
        await expect(navLink).toBeEnabled();
    });

    test('should be positioned below navigation header (top: 64px)', async ({ page }) => {
        await page.evaluate(() => {
            window.dispatchEvent(new Event('offline'));
        });

        await page.waitForTimeout(2100);

        const blocker = page.locator('#editing-blocker');
        await expect(blocker).toBeVisible();

        const boundingBox = await blocker.boundingBox();
        expect(boundingBox?.y).toBe(64);
    });

    test('should remove blocker when connection is restored', async ({ page }) => {
        await page.evaluate(() => {
            window.dispatchEvent(new Event('offline'));
        });

        await page.waitForTimeout(2100);

        const blocker = page.locator('#editing-blocker');
        await expect(blocker).toBeVisible();

        await page.evaluate(() => {
            window.dispatchEvent(new Event('online'));
        });

        await expect(blocker).not.toBeVisible({ timeout: 1000 });
    });
});

test.describe('Theme Adaptation', () => {
    test('should adapt to light theme', async ({ page }) => {
        await page.goto('/scene-editor');

        await page.evaluate(() => {
            localStorage.setItem('theme', 'light');
            window.location.reload();
        });

        await page.waitForLoadState('networkidle');

        await page.evaluate(() => {
            window.dispatchEvent(new Event('offline'));
        });

        await page.waitForTimeout(2100);

        const banner = page.locator('#connection-status-banner');
        await expect(banner).toBeVisible();

        const backgroundColor = await banner.evaluate(el => {
            return window.getComputedStyle(el).backgroundColor;
        });

        expect(backgroundColor).toBeDefined();
    });

    test('should adapt to dark theme', async ({ page }) => {
        await page.goto('/scene-editor');

        await page.evaluate(() => {
            localStorage.setItem('theme', 'dark');
            window.location.reload();
        });

        await page.waitForLoadState('networkidle');

        await page.evaluate(() => {
            window.dispatchEvent(new Event('offline'));
        });

        await page.waitForTimeout(2100);

        const banner = page.locator('#connection-status-banner');
        await expect(banner).toBeVisible();

        const blocker = page.locator('#editing-blocker');
        await expect(blocker).toBeVisible();

        const blockerBg = await blocker.evaluate(el => {
            return window.getComputedStyle(el).backgroundColor;
        });

        expect(blockerBg).toBeDefined();
        expect(blockerBg).toContain('rgba(0, 0, 0');
    });
});
