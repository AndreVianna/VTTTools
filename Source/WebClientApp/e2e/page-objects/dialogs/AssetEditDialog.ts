/**
 * Asset Edit Dialog Page Object
 * Multi-modal dialog supporting view, edit, and delete operations
 */

import { expect, type Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage.js';

export class AssetEditDialog extends BasePage {
  readonly dialog = (): Locator => this.page.locator('[role="dialog"]');
  readonly editButton = (): Locator => this.page.locator('button:has-text("Edit")');
  readonly deleteButton = (): Locator => this.page.locator('button:has-text("Delete")');
  readonly closeButton = (): Locator => this.page.locator('button:has-text("Close")');
  readonly saveButton = (): Locator => this.page.locator('button:has-text("Save Changes")');
  readonly cancelButton = (): Locator => this.page.locator('button:has-text("Cancel")');

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
