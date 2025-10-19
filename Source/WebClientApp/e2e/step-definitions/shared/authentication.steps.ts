/**
 * Authentication Step Definitions (Tier 1 - High Frequency)
 *
 * Reusable steps for user authentication and authorization
 * Frequency: Used in Background of all features
 */

import { Given, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';
import { expect } from '@playwright/test';
import { performPoolUserLogin } from '../../support/helpers/authentication.helper.js';

Given('I am authenticated as a Game Master', { timeout: 30000 }, async function (this: CustomWorld) {
    await performPoolUserLogin(this);
});

Given('I am authenticated with user ID {string}', async function (this: CustomWorld, userId: string) {
    this.currentUser.id = userId;
});

Given('I am not authenticated', async function (this: CustomWorld) {
    // Clear authentication state without destroying the page
    await this.context.clearCookies();

    // Wait for page to be in a stable state before evaluating
    await this.page.waitForLoadState('domcontentloaded');

    await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
});

Given('I am authenticated as user {string}', async function (this: CustomWorld, userId: string) {
    this.currentUser.id = userId;
});

Given('an account exists with email {string}', async function (this: CustomWorld, email: string) {
    if (!this.currentUser) {
        throw new Error('No pool user assigned. The Before hook should have assigned a user from the pool.');
    }

    const users = await this.db.queryTable('Users', { Id: this.currentUser.id });
    if (users.length === 0) {
        const passwordHash = process.env.BDD_TEST_PASSWORD_HASH;
        if (!passwordHash) {
            throw new Error('CRITICAL: BDD_TEST_PASSWORD_HASH environment variable is not set.');
        }

        this.attach(`Pool user ${this.currentUser.email} was missing, recreating it...`, 'text/plain');

        const newUserId = await this.db.insertUser({
            email: this.currentUser.email,
            userName: this.currentUser.email,
            emailConfirmed: true,
            passwordHash,
            displayName: this.currentUser.name
        });

        this.currentUser.id = newUserId;
        this.attach(`Pool user recreated with ID: ${newUserId}`, 'text/plain');
    }

    this.attach(`Test account email pattern: ${email} → using pool user: ${this.currentUser.email}`);
});

Given('no account exists with email {string}', async function (this: CustomWorld, email: string) {
    const users = await this.db.queryTable('Users', { Email: email.toLowerCase() });
    if (users.length > 0) {
        throw new Error(`Account with email ${email} already exists in database`);
    }
});

Then('I should be redirected to {string}', async function (this: CustomWorld, url: string) {
    await expect(this.page).toHaveURL(new RegExp(url));
});

Then('I should be redirected to login', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/login/);
});
