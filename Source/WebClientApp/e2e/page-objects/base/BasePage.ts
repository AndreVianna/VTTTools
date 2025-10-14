/**
 * Base Page - Common Page Object Methods
 *
 * Provides shared functionality for all page objects
 */

import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
    constructor(protected page: Page) {}

    /**
     * Navigate to URL
     */
    async goto(url: string): Promise<void> {
        await this.page.goto(url);
    }

    /**
     * Wait for page load
     */
    async waitForLoad(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Wait for network idle
     */
    async waitForNetworkIdle(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Get element by text
     */
    getByText(text: string): Locator {
        return this.page.locator(`text=${text}`);
    }

    /**
     * Get element by role
     */
    getByRole(role: string, options?: { name?: string }): Locator {
        return this.page.getByRole(role as any, options);
    }

    /**
     * Get element by test ID
     */
    getByTestId(testId: string): Locator {
        return this.page.locator(`[data-testid="${testId}"]`);
    }

    /**
     * Click button by text
     */
    async clickButton(text: string): Promise<void> {
        await this.page.click(`button:has-text("${text}")`);
    }

    /**
     * Fill input by name
     */
    async fillInput(name: string, value: string): Promise<void> {
        await this.page.fill(`input[name="${name}"]`, value);
    }

    /**
     * Check checkbox
     */
    async checkCheckbox(name: string): Promise<void> {
        await this.page.check(`input[name="${name}"]`);
    }

    /**
     * Uncheck checkbox
     */
    async uncheckCheckbox(name: string): Promise<void> {
        await this.page.uncheck(`input[name="${name}"]`);
    }

    /**
     * Verify element is visible
     */
    async verifyVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible();
    }

    /**
     * Verify element is not visible
     */
    async verifyNotVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).not.toBeVisible();
    }

    /**
     * Verify text is present
     */
    async verifyText(text: string): Promise<void> {
        await expect(this.page.locator(`text=${text}`)).toBeVisible();
    }

    /**
     * Wait for API response
     */
    async waitForApiResponse(urlPattern: string, status?: number): Promise<void> {
        await this.page.waitForResponse(resp =>
            resp.url().includes(urlPattern) &&
            (status === undefined || resp.status() === status)
        );
    }
}
