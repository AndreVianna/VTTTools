/**
 * Asset Create Dialog Page Object
 *
 * Encapsulates Asset Create Dialog interactions
 */

import { expect, type Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage.js';

export class AssetCreateDialog extends BasePage {
  readonly dialog = (): Locator => this.page.locator('[role="dialog"]');
  readonly dialogTitle = (): Locator => this.dialog().locator('h2');
  readonly tabObject = (): Locator => this.page.locator('button[role="tab"]:has-text("Object")');
  readonly tabMonster = (): Locator => this.page.locator('button[role="tab"]:has-text("Monster")');
  readonly nameInput = (): Locator => this.page.locator('input[name="name"]');
  readonly descriptionInput = (): Locator => this.page.locator('textarea[name="description"]');
  readonly createButton = (): Locator => this.page.locator('button:has-text("Create Asset")');
  readonly cancelButton = (): Locator => this.page.locator('button:has-text("Cancel")');
  readonly identityAccordion = (): Locator => this.page.locator('button:has-text("Identity & Basics")');
  readonly propertiesAccordion = (): Locator => this.page.locator('button:has-text("Properties")');

  async waitForOpen(): Promise<void> {
    await expect(this.dialog()).toBeVisible({ timeout: 5000 });
  }

  async waitForClose(): Promise<void> {
    await expect(this.dialog()).not.toBeVisible({ timeout: 5000 });
  }

  async selectTab(tabName: 'Object' | 'Monster'): Promise<void> {
    const tab = tabName === 'Object' ? this.tabObject() : this.tabMonster();
    await tab.click();
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput().fill(name);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionInput().fill(description);
  }

  async expandAccordion(accordionName: string): Promise<void> {
    const header = this.page.locator(`button:has-text("${accordionName}")`);
    const isExpanded = await header.getAttribute('aria-expanded');

    if (isExpanded !== 'true') {
      await header.click();
    }
  }

  async setSize(width: number, height: number): Promise<void> {
    await this.fillInput('width', width.toString());
    await this.fillInput('height', height.toString());
  }

  async clickCreate(): Promise<void> {
    await this.createButton().click();
    await this.waitForApiResponse('/api/assets', 201);
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton().click();
  }

  async verifyCreateButtonEnabled(): Promise<void> {
    await expect(this.createButton()).toBeEnabled();
  }

  async verifyCreateButtonDisabled(): Promise<void> {
    await expect(this.createButton()).toBeDisabled();
  }
}
