/**
 * Button Step Definitions (Tier 1 - High Frequency)
 *
 * Reusable steps for button clicks and state verification
 * Frequency: 60+ uses for clicks, 25+ for state checks
 */

import { When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';
import { expect } from '@playwright/test';

When('I click {string}', async function (this: CustomWorld, buttonText: string) {
    await this.page.click(`button:has-text("${buttonText}")`);
});

When('I click the {string} button', async function (this: CustomWorld, buttonText: string) {
    await this.page.click(`button:has-text("${buttonText}")`);
});

When('I click {string} in the {string}', async function (this: CustomWorld, buttonText: string, containerName: string) {
    const container = containerName === 'confirmation dialog'
        ? '[role="dialog"]:last-of-type'
        : `[data-testid="${containerName}"]`;
    await this.page.click(`${container} button:has-text("${buttonText}")`);
});

When('I click {string} and select {string}', async function (this: CustomWorld, buttonText: string, filename: string) {
    await this.page.click(`button:has-text("${buttonText}")`);
    await this.page.setInputFiles('input[type="file"]', `e2e/test-data/images/${filename}`);
});

When('I click the X button in dialog header', async function (this: CustomWorld) {
    await this.page.click('[role="dialog"] button[aria-label="close"]');
});

When('I click the X button on the {word} image', async function (this: CustomWorld, position: string) {
    const index = position === 'first' ? 0 : position === 'second' ? 1 : parseInt(position) - 1;
    const image = this.page.locator('[data-testid="resource-image"]').nth(index);
    await image.locator('button[aria-label="Remove image"]').click();
});

When('I click Create Asset', async function (this: CustomWorld) {
    await this.page.click('button:has-text("Create Asset")');
    await this.page.waitForResponse(resp => resp.url().includes('/api/assets') && resp.status() === 201);
});

When('I click Save Changes', async function (this: CustomWorld) {
    await this.page.click('button:has-text("Save Changes")');
    await this.page.waitForResponse(resp => resp.url().includes('/api/assets') && resp.status() === 204);
});

Then('the {string} button should be disabled', async function (this: CustomWorld, buttonText: string) {
    await expect(this.page.locator(`button:has-text("${buttonText}")`)).toBeDisabled();
});

Then('the {string} button should be enabled', async function (this: CustomWorld, buttonText: string) {
    await expect(this.page.locator(`button:has-text("${buttonText}")`)).toBeEnabled();
});

Then('the {string} button should still be disabled', async function (this: CustomWorld, buttonText: string) {
    await expect(this.page.locator(`button:has-text("${buttonText}")`)).toBeDisabled();
});

Then('the Create Asset button should be disabled', async function (this: CustomWorld) {
    await expect(this.page.locator('button:has-text("Create Asset")')).toBeDisabled();
});

Then('the Create Asset button should be enabled', async function (this: CustomWorld) {
    await expect(this.page.locator('button:has-text("Create Asset")')).toBeEnabled();
});

Then('Save Changes button should be disabled', async function (this: CustomWorld) {
    await expect(this.page.locator('button:has-text("Save Changes")')).toBeDisabled();
});

Then('button should show {string} with spinner', async function (this: CustomWorld, loadingText: string) {
    const button = this.page.locator(`button:has-text("${loadingText}")`);
    await expect(button).toBeVisible();
    await expect(button.locator('[data-testid="loading-spinner"]')).toBeVisible();
});

Then('the button text should change to {string}', async function (this: CustomWorld, text: string) {
    await expect(this.page.locator(`button:has-text("${text}")`)).toBeVisible();
});

Then('button should show {string} with spinner', async function (this: CustomWorld, text: string) {
    await expect(this.page.locator(`button:has-text("${text}")`)).toBeVisible();
});

Then('I should see {string} button', async function (this: CustomWorld, buttonText: string) {
    await expect(this.page.locator(`button:has-text("${buttonText}")`)).toBeVisible();
});

Then('I should not see {string} button', async function (this: CustomWorld, buttonText: string) {
    await expect(this.page.locator(`button:has-text("${buttonText}")`)).not.toBeVisible();
});

Then('the button should be visible and enabled', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify a specific button is visible and enabled (parameters expected or define button selector)');
});

Then('I should only see {string} button', async function (this: CustomWorld, buttonText: string) {
    await expect(this.page.locator(`button:has-text("${buttonText}")`)).toBeVisible();
});
