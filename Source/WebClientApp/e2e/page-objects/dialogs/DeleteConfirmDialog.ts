/**
 * Delete Confirmation Dialog Page Object
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage.js';

export class DeleteConfirmDialog extends BasePage {
    readonly dialog = (): Locator => this.page.locator('[role="dialog"]').last();
    readonly deleteButton = (): Locator => this.dialog().locator('button:has-text("Delete")');
    readonly cancelButton = (): Locator => this.dialog().locator('button:has-text("Cancel")');

    constructor(page: Page) {
        super(page);
    }

    async waitForOpen(): Promise<void> {
        await expect(this.dialog()).toBeVisible({ timeout: 5000 });
    }

    async clickDelete(): Promise<void> {
        await this.deleteButton().click();
        await this.waitForApiResponse('/api/assets', 204);
    }

    async clickCancel(): Promise<void> {
        await this.cancelButton().click();
    }
}
