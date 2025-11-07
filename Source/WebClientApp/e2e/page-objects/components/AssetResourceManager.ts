/**
 * Asset Resource Manager Component Page Object
 *
 * Updated for new schema:
 * - Tokens section (multiple tokens, default selection)
 * - Portrait section (single portrait)
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage.js';
import { KeyboardModifierHelper } from '../../support/helpers/keyboard.helper.js';

export class AssetResourceManager extends BasePage {
    readonly uploadButton = (): Locator => this.page.locator('[data-testid="tokens-section"] button:has-text("Upload")');
    readonly manageButton = (): Locator => this.page.locator('button:has-text("Manage")');
    readonly managePanel = (): Locator => this.getByTestId('manage-panel');

    readonly tokenCards = (): Locator => this.page.locator('[data-testid^="token-"]');
    readonly portraitPreview = (): Locator => this.getByTestId('portrait-preview');
    readonly portraitUploadButton = (): Locator => this.page.locator('[data-testid="portrait-section"] button:has-text("Upload")');
    readonly portraitRemoveButton = (): Locator => this.page.locator('[data-testid="portrait-section"] button:has-text("Remove")');

    constructor(
        page: Page,
        private keyboard: KeyboardModifierHelper
    ) {
        super(page);
    }

    async uploadToken(filename: string): Promise<string> {
        await this.uploadButton().click();
        await this.page.setInputFiles('input[type="file"]', `e2e/test-data/images/${filename}`);

        const response = await this.page.waitForResponse(resp =>
            resp.url().includes('/api/resources') && resp.status() === 201
        );

        const body = await response.json();
        return body.id;
    }

    async setDefaultToken(tokenId: string): Promise<void> {
        await this.page.locator(`[data-testid="token-${tokenId}"] input[type="radio"]`).check();
    }

    async getDefaultToken(): Promise<string | null> {
        const checked = await this.page.locator('[data-testid^="token-"] input[type="radio"]:checked').first();
        if (!await checked.isVisible()) return null;

        const tokenCard = await checked.locator('..').locator('[data-testid^="token-"]').first();
        const testId = await tokenCard.getAttribute('data-testid');
        return testId?.replace('token-', '') || null;
    }

    async uploadPortrait(filename: string): Promise<string> {
        await this.portraitUploadButton().click();
        await this.page.setInputFiles('input[type="file"]', `e2e/test-data/images/${filename}`);

        const response = await this.page.waitForResponse(resp =>
            resp.url().includes('/api/resources') && resp.status() === 201
        );

        const body = await response.json();
        return body.id;
    }

    async removePortrait(): Promise<void> {
        await this.portraitRemoveButton().click();
    }

    async hasPortrait(): Promise<boolean> {
        return await this.portraitPreview().isVisible();
    }

    async toggleManagePanel(): Promise<void> {
        await this.manageButton().click();
    }

    async removeToken(tokenId: string): Promise<void> {
        const tokenCard = this.page.locator(`[data-testid="token-${tokenId}"]`);
        await tokenCard.locator('button[aria-label="Remove token"]').click();
    }

    async verifyTokenCount(expectedCount: number): Promise<void> {
        await expect(this.tokenCards()).toHaveCount(expectedCount);
    }

    async verifyDefaultTokenSet(tokenId: string): Promise<void> {
        const radioButton = this.page.locator(`[data-testid="token-${tokenId}"] input[type="radio"]`);
        await expect(radioButton).toBeChecked();
    }

    async verifyPortraitVisible(): Promise<void> {
        await expect(this.portraitPreview()).toBeVisible();
    }

    async verifyPortraitNotVisible(): Promise<void> {
        await expect(this.portraitPreview()).not.toBeVisible();
    }
}
