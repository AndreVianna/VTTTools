/**
 * Visibility Step Definitions (Tier 1 - High Frequency)
 *
 * Reusable steps for verifying element visibility
 * Frequency: 80+ uses across all features
 */

import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CustomWorld } from '../../support/world.js';

Then('I should see {string}', async function (this: CustomWorld, text: string) {
  await expect(this.page.locator(`text=${text}`)).toBeVisible();
});

Then('I should see the {string}', async function (this: CustomWorld, text: string) {
  await expect(this.page.locator(`text=${text}`)).toBeVisible();
});

Then('I should see the page title {string}', async function (this: CustomWorld, title: string) {
  await expect(this.page.locator(`h1:has-text("${title}")`)).toBeVisible();
});

Then('I should see the subtitle {string}', async function (this: CustomWorld, subtitle: string) {
  await expect(this.page.locator(`text=${subtitle}`)).toBeVisible();
});

Then('I should not see {string}', async function (this: CustomWorld, text: string) {
  await expect(this.page.locator(`text=${text}`)).not.toBeVisible();
});

Then('I should see {int} cards', async function (this: CustomWorld, count: number) {
  await expect(this.page.locator('[data-testid="asset-card"], [data-testid="virtual-add-card"]')).toHaveCount(count);
});

Then(
  'I should see {int} cards total \\({int} {string} card + {int} asset cards\\)',
  async function (this: CustomWorld, totalCount: number, _addCount: number, _addType: string, _assetCount: number) {
    await expect(this.page.locator('[data-testid="asset-card"], [data-testid="virtual-add-card"]')).toHaveCount(
      totalCount,
    );
  },
);

Then('I should see {int} asset cards \\({word}\\)', async function (this: CustomWorld, count: number, _names: string) {
  await expect(this.page.locator('[data-testid="asset-card"]')).toHaveCount(count);
});

Then('I should see {string} assets found', async function (this: CustomWorld, count: string) {
  await expect(this.page.locator(`text=${count} assets found`)).toBeVisible();
});

Then('I should not see {string} or {string}', async function (this: CustomWorld, text1: string, text2: string) {
  await expect(this.page.locator(`text=${text1}`)).not.toBeVisible();
  await expect(this.page.locator(`text=${text2}`)).not.toBeVisible();
});

Then('the {string} tab should be selected', async function (this: CustomWorld, tabName: string) {
  await expect(this.page.locator(`button[role="tab"]:has-text("${tabName}")`)).toHaveAttribute('aria-selected', 'true');
});

Then('the {string} tab should be selected by default', async function (this: CustomWorld, tabName: string) {
  await expect(this.page.locator(`button[role="tab"]:has-text("${tabName}")`)).toHaveAttribute('aria-selected', 'true');
});

Then('I should see the virtual {string} card as the first card', async function (this: CustomWorld, cardLabel: string) {
  await expect(this.page.locator(`text="${cardLabel}"`).first()).toBeVisible();
});

Then('I should see the search bar', async function (this: CustomWorld) {
  await expect(this.page.locator('input[placeholder*="Search"]')).toBeVisible();
});

Then('I should see the filter panel on the left', async function (this: CustomWorld) {
  await expect(this.page.locator('text="Filters"').first()).toBeVisible();
});

Then('I should see a success notification', async function (this: CustomWorld) {
  await expect(this.page.locator('[role="alert"]')).toBeVisible();
});

Then('I should see all my assets', async function (this: CustomWorld) {
  // Wait for assets to load
  await this.page.waitForSelector('[data-testid="asset-card"]');
});

Then('I should only see the virtual {string} card', async function (this: CustomWorld, _cardLabel: string) {
  await expect(this.page.locator('[data-testid="virtual-add-card"]')).toBeVisible();
  await expect(this.page.locator('[data-testid="asset-card"]')).toHaveCount(0);
});

Then('I should see no asset cards', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="asset-card"]')).toHaveCount(0);
});

Then('I should see an error alert {string}', async function (this: CustomWorld, errorMessage: string) {
  await expect(this.page.locator(`[role="alert"]:has-text("${errorMessage}")`)).toBeVisible();
});

Then('I should see a {string} button', async function (this: CustomWorld, buttonText: string) {
  await expect(this.page.locator(`button:has-text("${buttonText}")`)).toBeVisible();
});

Then('{string} should be visible', async function (this: CustomWorld, element: string) {
  await expect(this.page.locator(`text=${element}`)).toBeVisible();
});

Then('{string} should not be visible', async function (this: CustomWorld, element: string) {
  await expect(this.page.locator(`text=${element}`)).not.toBeVisible();
});

Then('I should see name and description fields', async function (this: CustomWorld) {
  await expect(this.page.locator('input[name="name"]')).toBeVisible();
  await expect(this.page.locator('textarea[name="description"]')).toBeVisible();
});

Then('I should see isPublic and isPublished checkboxes', async function (this: CustomWorld) {
  await expect(this.page.locator('input[name="isPublic"]')).toBeVisible();
  await expect(this.page.locator('input[name="isPublished"]')).toBeVisible();
});

Then('the {string} should be visible', async function (this: CustomWorld, text: string) {
  await expect(this.page.locator(`text=${text}`)).toBeVisible();
});
