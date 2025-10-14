/**
 * Message Step Definitions (Shared - Tier 1)
 *
 * Reusable steps for error, success, and informational messages
 * Used across all feature files
 */

import { Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';
import { expect } from '@playwright/test';

Then('I should see error {string}', async function (this: CustomWorld, errorMessage: string) {
    await expect(this.page.locator(`[role="alert"]:has-text("${errorMessage}")`)).toBeVisible();
});

Then('I should see success message {string}', async function (this: CustomWorld, successMessage: string) {
    await expect(this.page.locator(`[role="alert"]:has-text("${successMessage}")`)).toBeVisible();
});

Then('I should see message {string}', async function (this: CustomWorld, message: string) {
    await expect(this.page.locator(`:has-text("${message}")`)).toBeVisible();
});
