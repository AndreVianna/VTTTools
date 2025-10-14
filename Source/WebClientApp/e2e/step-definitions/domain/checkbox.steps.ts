/**
 * Checkbox Step Definitions (Tier 2 - Medium Frequency)
 *
 * Reusable steps for checkbox operations
 * Frequency: 25+ uses across CreateAsset and UpdateAsset
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';
import { expect } from '@playwright/test';

When('I check {string}', async function (this: CustomWorld, checkboxName: string) {
    await this.page.check(`input[name="${checkboxName}"]`);
});

When('I uncheck {string}', async function (this: CustomWorld, checkboxName: string) {
    await this.page.uncheck(`input[name="${checkboxName}"]`);
});

When('I check {string} to {word}', async function (this: CustomWorld, checkboxName: string, value: string) {
    const shouldCheck = value === 'true';
    if (shouldCheck) {
        await this.page.check(`input[name="${checkboxName}"]`);
    } else {
        await this.page.uncheck(`input[name="${checkboxName}"]`);
    }
});

When('I keep {string} unchecked', async function (this: CustomWorld, checkboxName: string) {
    const checkbox = this.page.locator(`input[name="${checkboxName}"]`);
    const isChecked = await checkbox.isChecked();
    if (isChecked) {
        await checkbox.uncheck();
    }
});

When('I check both {string} and {string}', async function (this: CustomWorld, checkbox1: string, checkbox2: string) {
    await this.page.check(`input[name="${checkbox1}"]`);
    await this.page.check(`input[name="${checkbox2}"]`);
});

When('I keep both {string} and {string} unchecked', async function (this: CustomWorld, checkbox1: string, checkbox2: string) {
    // Ensure both are unchecked
    await this.page.uncheck(`input[name="${checkbox1}"]`);
    await this.page.uncheck(`input[name="${checkbox2}"]`);
});

When('I leave {string} unchecked', async function (this: CustomWorld) {
    // Do nothing - checkbox is already unchecked
});

Then('the {string} checkbox should be checked', async function (this: CustomWorld, checkboxName: string) {
    await expect(this.page.locator(`input[name="${checkboxName}"]`)).toBeChecked();
});

Then('the {string} checkbox should auto-check', async function (this: CustomWorld, checkboxName: string) {
    await expect(this.page.locator(`input[name="${checkboxName}"]`)).toBeChecked({ timeout: 2000 });
});

Then('the {string} checkbox should auto-uncheck', async function (this: CustomWorld, checkboxName: string) {
    await expect(this.page.locator(`input[name="${checkboxName}"]`)).not.toBeChecked({ timeout: 2000 });
});

Given('the {string} checkbox is checked', async function (this: CustomWorld, checkboxName: string) {
    await this.page.check(`input[name="${checkboxName}"]`);
});

Given('the {string} checkbox is unchecked', async function (this: CustomWorld, checkboxName: string) {
    await this.page.uncheck(`input[name="${checkboxName}"]`);
});

Given('both {string} and {string} checkboxes are checked', async function (this: CustomWorld, checkbox1: string, checkbox2: string) {
    await this.page.check(`input[name="${checkbox1}"]`);
    await this.page.check(`input[name="${checkbox2}"]`);
});

Given('both {string} and {string} checkboxes are unchecked', async function (this: CustomWorld, checkbox1: string, checkbox2: string) {
    await this.page.uncheck(`input[name="${checkbox1}"]`);
    await this.page.uncheck(`input[name="${checkbox2}"]`);
});

Given('the default {string} is checked', async function (this: CustomWorld, checkboxName: string) {
    // Verify default state
    await expect(this.page.locator(`input[name="${checkboxName}"]`)).toBeChecked();
});

Given('the default {string} is unchecked', async function (this: CustomWorld, checkboxName: string) {
    // Verify default state
    await expect(this.page.locator(`input[name="${checkboxName}"]`)).not.toBeChecked();
});
