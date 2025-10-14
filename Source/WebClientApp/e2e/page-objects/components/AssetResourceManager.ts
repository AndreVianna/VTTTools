/**
 * Asset Resource Manager Component Page Object
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage.js';
import { KeyboardModifierHelper } from '../../support/helpers/keyboard.helper.js';

export class AssetResourceManager extends BasePage {
    readonly uploadButton = (): Locator => this.page.locator('button:has-text("Upload")');
    readonly manageButton = (): Locator => this.page.locator('button:has-text("Manage")');
    readonly managePanel = (): Locator => this.getByTestId('manage-panel');
    readonly imageCards = (): Locator => this.getByTestId('resource-image');
    readonly tokenPreview = (): Locator => this.getByTestId('token-preview');
    readonly displayPreview = (): Locator => this.getByTestId('display-preview');

    constructor(
        page: Page,
        private keyboard: KeyboardModifierHelper
    ) {
        super(page);
    }

    async uploadImage(filename: string): Promise<string> {
        await this.uploadButton().click();
        await this.page.setInputFiles('input[type="file"]', `e2e/test-data/images/${filename}`);

        const response = await this.page.waitForResponse(resp =>
            resp.url().includes('/api/resources') && resp.status() === 201
        );

        const body = await response.json();
        return body.id;
    }

    async assignRole(resourceId: string, role: 'Token' | 'Display' | 'Both'): Promise<void> {
        const selector = `[data-resource-id="${resourceId}"]`;

        switch (role) {
            case 'Token':
                await this.keyboard.altClick(selector);
                break;
            case 'Display':
                await this.keyboard.ctrlClick(selector);
                break;
            case 'Both':
                await this.keyboard.ctrlAltClick(selector);
                break;
        }
    }

    async toggleManagePanel(): Promise<void> {
        await this.manageButton().click();
    }

    async verifyImageHasRole(resourceId: string, role: string): Promise<void> {
        const image = this.page.locator(`[data-resource-id="${resourceId}"]`);
        await expect(image.locator(`[role="status"]:has-text("${role}")`)).toBeVisible();
    }

    async removeImage(index: number): Promise<void> {
        const image = this.imageCards().nth(index);
        await image.locator('button[aria-label="Remove image"]').click();
    }

    async verifyImageCount(expectedCount: number): Promise<void> {
        await expect(this.imageCards()).toHaveCount(expectedCount);
    }

    async verifyTokenPreviewVisible(): Promise<void> {
        await expect(this.tokenPreview()).toBeVisible();
    }

    async verifyDisplayPreviewVisible(): Promise<void> {
        await expect(this.displayPreview()).toBeVisible();
    }
}