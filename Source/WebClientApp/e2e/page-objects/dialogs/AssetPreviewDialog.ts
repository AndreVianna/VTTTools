/**
 * Asset Preview Dialog Page Object
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage.js';

export class AssetPreviewDialog extends BasePage {
    readonly dialog = (): Locator => this.page.locator('[role="dialog"]');
    readonly editButton = (): Locator => this.page.locator('button:has-text("Edit")');
    readonly deleteButton = (): Locator => this.page.locator('button:has-text("Delete")');
    readonly closeButton = (): Locator => this.page.locator('button:has-text("Close")');
    readonly saveButton = (): Locator => this.page.locator('button:has-text("Save Changes")');
    readonly cancelButton = (): Locator => this.page.locator('button:has-text("Cancel")');

    constructor(page: Page) {
        super(page);
    }

    async waitForOpen(): Promise<void> {
        await expect(this.dialog()).toBeVisible({ timeout: 5000 });
    }

    async clickEdit(): Promise<void> {
        await this.editButton().click();
    }

    async clickDelete(): Promise<void> {
        await this.deleteButton().click();
    }

    async clickSave(): Promise<void> {
        await this.saveButton().click();
        await this.waitForApiResponse('/api/assets', 204);
    }
}
