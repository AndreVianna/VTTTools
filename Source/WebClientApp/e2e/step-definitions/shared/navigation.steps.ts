/**
 * Navigation Step Definitions (Tier 1 - High Frequency)
 *
 * Reusable steps for page navigation and transitions
 * Frequency: 20+ uses across all features
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';
import { expect } from '@playwright/test';

Given('I am on the Asset Library page', async function (this: CustomWorld) {
    await this.assetLibrary.goto();
});

Given('I am on the Asset Library page at {string}', async function (this: CustomWorld, url: string) {
    await this.page.goto(url);
});

Given('I am on the {string} tab', async function (this: CustomWorld, tabName: string) {
    await this.assetLibrary.switchToTab(tabName as 'Objects' | 'Creatures');
});

When('I switch to the {string} tab', async function (this: CustomWorld, tabName: string) {
    await this.assetLibrary.switchToTab(tabName as 'Objects' | 'Creatures');
});

When('I navigate to {string}', async function (this: CustomWorld, url: string) {
    await this.page.goto(url);
});

When('the {string} page loads', async function (this: CustomWorld, expectedTitle: string) {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector(`h1:has-text("${expectedTitle}")`, { timeout: 10000 });
});

When('I refresh the browser \\(F5\\)', async function (this: CustomWorld) {
    await this.page.reload();
});

When('I refresh the page', async function (this: CustomWorld) {
    await this.page.reload();
});

Given('I navigate to Asset Library', async function (this: CustomWorld) {
    await this.assetLibrary.goto();
});

When('the page loads', async function (this: CustomWorld) {
    await this.page.waitForLoadState('networkidle');
});

Then('I should be navigated to {string}', async function (this: CustomWorld, path: string) {
    await expect(this.page).toHaveURL(new RegExp(path));
});
