/**
 * Asset Library Page Object
 *
 * Encapsulates Asset Library page interactions and assertions
 */

import { expect, type Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage.js';

export class AssetLibraryPage extends BasePage {
  // Locators as getters (lazy evaluation)
  readonly title = (): Locator => this.page.locator('h1:has-text("Asset Library")');
  readonly subtitle = (): Locator => this.page.locator('text=Manage your objects and creatures');
  readonly tabObjects = (): Locator => this.page.locator('button[role="tab"]:has-text("Objects")');
  readonly tabCreatures = (): Locator => this.page.locator('button[role="tab"]:has-text("Creatures")');
  readonly searchBar = (): Locator => this.page.locator('input[placeholder*="Search"]');
  readonly filterPanel = (): Locator => this.getByTestId('asset-filter-panel');
  readonly virtualAddCard = (): Locator => this.getByTestId('virtual-add-card');
  readonly assetCards = (): Locator => this.getByTestId('asset-card');
  readonly pagination = (): Locator => this.page.locator('[aria-label="pagination"]');
  readonly resultsCount = (): Locator => this.page.locator('text=/\\d+ assets? found/');

  // Navigation
  async goto(): Promise<void> {
    await super.goto('/assets');
    await this.waitForLoad();
  }

  async navigate(): Promise<void> {
    await this.goto();
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForSelector('[data-testid="asset-card"], [data-testid="virtual-add-card"]', {
      timeout: 5000,
    });
  }

  // Tab operations
  async switchToTab(tabName: 'Objects' | 'Creatures'): Promise<void> {
    const tab = tabName === 'Objects' ? this.tabObjects() : this.tabCreatures();
    await tab.click();
    await this.waitForLoad();
  }

  async verifyTabSelected(tabName: 'Objects' | 'Creatures'): Promise<void> {
    const tab = tabName === 'Objects' ? this.tabObjects() : this.tabCreatures();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
  }

  // Search
  async search(query: string): Promise<void> {
    await this.searchBar().fill(query);
  }

  async clearSearch(): Promise<void> {
    await this.searchBar().clear();
  }

  // Asset cards
  async clickAssetCard(assetName: string): Promise<void> {
    await this.page.click(`[data-testid="asset-card"]:has-text("${assetName}")`);
  }

  async openAssetPreview(assetName: string): Promise<void> {
    await this.clickAssetCard(assetName);
    // Wait for preview dialog to open
    await this.page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  }

  async verifyAssetCardVisible(assetName: string): Promise<void> {
    await expect(this.page.locator(`[data-testid="asset-card"]:has-text("${assetName}")`)).toBeVisible();
  }

  async verifyAssetCardCount(expectedCount: number): Promise<void> {
    await expect(this.assetCards()).toHaveCount(expectedCount);
  }

  // Virtual Add card
  async clickVirtualAddCard(): Promise<void> {
    await this.virtualAddCard().click();
  }

  async clickAddAsset(): Promise<void> {
    await this.clickVirtualAddCard();
    await this.page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  }

  async verifyVirtualAddCardLabel(expectedLabel: string): Promise<void> {
    await expect(this.virtualAddCard()).toContainText(expectedLabel);
  }

  // Pagination
  async clickPage(pageNumber: number): Promise<void> {
    await this.pagination().locator(`button:has-text("${pageNumber}")`).click();
    await this.waitForLoad();
  }

  async verifyPaginationText(expected: string): Promise<void> {
    await expect(this.pagination()).toContainText(expected);
  }

  async verifyResultsCount(expected: string): Promise<void> {
    await expect(this.resultsCount()).toHaveText(expected);
  }

  // Filters
  async setOwnershipFilter(mine: boolean, others: boolean): Promise<void> {
    if (mine) {
      await this.checkCheckbox('showMine');
    } else {
      await this.uncheckCheckbox('showMine');
    }

    if (others) {
      await this.checkCheckbox('showOthers');
    } else {
      await this.uncheckCheckbox('showOthers');
    }
  }

  async setVisibilityFilter(publicAssets: boolean, privateAssets: boolean): Promise<void> {
    if (publicAssets) {
      await this.checkCheckbox('showPublic');
    } else {
      await this.uncheckCheckbox('showPublic');
    }

    if (privateAssets) {
      await this.checkCheckbox('showPrivate');
    } else {
      await this.uncheckCheckbox('showPrivate');
    }
  }

  async setStatusFilter(published: boolean, draft: boolean): Promise<void> {
    if (published) {
      await this.checkCheckbox('showPublished');
    } else {
      await this.uncheckCheckbox('showPublished');
    }

    if (draft) {
      await this.checkCheckbox('showDraft');
    } else {
      await this.uncheckCheckbox('showDraft');
    }
  }
}
