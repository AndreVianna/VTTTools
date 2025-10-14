/**
 * Authentication Step Definitions (Tier 1 - High Frequency)
 *
 * Reusable steps for user authentication and authorization
 * Frequency: Used in Background of all features
 */

import { Given, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';
import { expect } from '@playwright/test';

Given('I am authenticated as a Game Master', { timeout: 30000 }, async function (this: CustomWorld) {
    // User is already assigned from pool in Before hook
    // Just perform login with pool user credentials
    const password = process.env.BDD_TEST_PASSWORD;
    if (!password) {
        throw new Error('CRITICAL: BDD_TEST_PASSWORD environment variable is not set. Check your .env file.');
    }

    await this.page.goto('/login');
    await this.page.waitForTimeout(1000); // See login page

    await this.page.fill('input[type="email"], input[name="email"]', this.currentUser.email);
    await this.page.fill('input[type="password"], input[name="password"]', password);
    await this.page.waitForTimeout(1000); // See form filled

    await this.page.click('button[type="submit"], button:has-text("Sign In")');
    await this.page.waitForTimeout(2000); // See submit result

    await this.page.waitForURL(url => !url.pathname.includes('/login') && !url.pathname.includes('/register'), { timeout: 10000 });
});

Given('I am authenticated with user ID {string}', async function (this: CustomWorld, userId: string) {
    this.currentUser.id = userId;
    // Update context headers if needed
});

Given('I am authenticated with displayName {string}', { timeout: 30000 }, async function (this: CustomWorld, _displayName: string) {
    // Note: displayName parameter is for test readability - actual displayName comes from pool user
    // This step performs same login as "I am authenticated as a Game Master"
    const password = process.env.BDD_TEST_PASSWORD;
    if (!password) {
        throw new Error('CRITICAL: BDD_TEST_PASSWORD environment variable is not set.');
    }

    await this.page.goto('/login');
    await this.page.fill('input[type="email"], input[name="email"]', this.currentUser.email);
    await this.page.fill('input[type="password"], input[name="password"]', password);
    await this.page.click('button[type="submit"], button:has-text("Sign In")');

    // Wait for backend to process login and redirect
    await this.page.waitForTimeout(2000);

    // Verify redirect completed
    await this.page.waitForURL(url => !url.pathname.includes('/login') && !url.pathname.includes('/register'), { timeout: 10000 });
});

Given('I am not authenticated', async function (this: CustomWorld) {
    // Clear authentication state without destroying the page
    await this.context.clearCookies();
    await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
    // Page remains at current URL, just auth cleared
});

Given('I am authenticated as user {string}', async function (this: CustomWorld, userId: string) {
    this.currentUser.id = userId;
});

Then('I should be redirected to {string}', async function (this: CustomWorld, url: string) {
    await expect(this.page).toHaveURL(new RegExp(url));
});

Then('I should be redirected to login', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/login/);
});
