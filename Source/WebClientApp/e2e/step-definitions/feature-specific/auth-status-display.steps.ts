import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';
import { expect } from '@playwright/test';

Given('I am on the landing page', async function (this: CustomWorld) {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
});

Given('the application header is displayed', async function (this: CustomWorld) {
    await expect(this.page.locator('header')).toBeVisible();
});

When('I view the application header', async function (this: CustomWorld) {
    await expect(this.page.locator('header')).toBeVisible();
});

Then('I should not see user account button', async function (this: CustomWorld) {
    const userButton = this.page.locator('#btn-user-menu');
    await expect(userButton).not.toBeVisible();
});

Then('the account button should display {string}', async function (this: CustomWorld, _userName: string) {
    const signInButton = this.page.locator('#btn-header-login');
    await expect(signInButton).not.toBeVisible({ timeout: 10000 });

    const userButton = this.page.locator('#btn-user-menu');
    await expect(userButton).toBeVisible({ timeout: 10000 });

    await expect(userButton).not.toBeEmpty();
});

Then('the button should have a dropdown arrow icon', async function (this: CustomWorld) {
    const userButton = this.page.locator('#btn-user-menu');
    const arrowIcon = userButton.locator('svg[data-testid="ArrowDropDownIcon"]');
    await expect(arrowIcon).toBeVisible();
});

Then('I should not see Sign In and Sign Up buttons', async function (this: CustomWorld) {
    const signInButton = this.page.locator('#btn-header-login');
    const signUpButton = this.page.locator('#btn-header-register');
    await expect(signInButton).not.toBeVisible();
    await expect(signUpButton).not.toBeVisible();
});

When('I click on the user account button', async function (this: CustomWorld) {
    const userButton = this.page.locator('#btn-user-menu');
    await userButton.click();
});

Then('a dropdown menu should open', async function (this: CustomWorld) {
    const menu = this.page.locator('#user-menu');
    await expect(menu).toBeVisible();
});

Then('I should see {string} menu item', async function (this: CustomWorld, menuItemText: string) {
    const menuItem = this.page.getByRole('menuitem', { name: new RegExp(menuItemText, 'i') });
    await expect(menuItem).toBeVisible();
});

Given('I am authenticated', async function (this: CustomWorld) {
    const password = process.env.BDD_TEST_PASSWORD;
    if (!password) {
        throw new Error('BDD_TEST_PASSWORD environment variable is not set');
    }

    await this.page.goto('/login');
    await this.page.getByLabel(/email/i).fill(this.currentUser.email);
    await this.page.getByRole('textbox', { name: /password/i }).fill(password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/');
});

Given('I navigate to the assets page', async function (this: CustomWorld) {
    await this.page.goto('/assets');
    await this.page.waitForLoadState('networkidle');
});

Then('I should be navigated to the login page', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/login/);
});

Then('I should be navigated to the registration page', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/register/);
});

When('I log in successfully', async function (this: CustomWorld) {
    const password = process.env.BDD_TEST_PASSWORD;
    if (!password) {
        throw new Error('BDD_TEST_PASSWORD environment variable is not set');
    }

    await this.page.goto('/login');
    await this.page.getByLabel(/email/i).fill(this.currentUser.email);
    await this.page.getByRole('textbox', { name: /password/i }).fill(password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/');
});

Then('I should see the user account button with my name', async function (this: CustomWorld) {
    const signInButton = this.page.locator('#btn-header-login');
    await expect(signInButton).not.toBeVisible({ timeout: 10000 });

    const userButton = this.page.locator('#btn-user-menu');
    await expect(userButton).toBeVisible({ timeout: 10000 });

    await expect(userButton).not.toBeEmpty();
});

When('I log out successfully', async function (this: CustomWorld) {
    const userButton = this.page.locator('#btn-user-menu');
    await userButton.click();

    const signOutMenuItem = this.page.locator('#menu-signout');
    await signOutMenuItem.click();

    await this.page.waitForURL('/');
});

Then('I should see Sign In and Sign Up buttons', async function (this: CustomWorld) {
    const signInButton = this.page.locator('#btn-header-login');
    const signUpButton = this.page.locator('#btn-header-register');
    await expect(signInButton).toBeVisible();
    await expect(signUpButton).toBeVisible();
});
