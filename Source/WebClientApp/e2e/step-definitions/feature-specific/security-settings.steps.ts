import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';
import { expect } from '@playwright/test';

Given('I am on the security settings page', async function (this: CustomWorld) {
    await this.page.goto('/settings/security');
    await this.page.waitForLoadState('domcontentloaded');
});

Then('I should see {string} heading', async function (this: CustomWorld, headingText: string) {
    const heading = this.page.getByRole('heading', { name: new RegExp(headingText, 'i') });
    await expect(heading).toBeVisible();
});

Then('I should see {string} status', async function (this: CustomWorld, statusText: string) {
    const status = this.page.getByText(new RegExp(statusText, 'i'));
    await expect(status).toBeVisible();
});

Then('the password change dialog should open', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: ChangePassword dialog not yet implemented');
});

Then('the 2FA setup dialog should open', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: TwoFactorSetup dialog integration not yet implemented');
});

Then('the security settings page should load', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/settings\/security/);
    await expect(this.page.getByRole('heading', { name: /security settings/i })).toBeVisible();
});

Then('I should see security options', async function (this: CustomWorld) {
    await expect(this.page.getByRole('button', { name: /change password/i })).toBeVisible();
});

When('I attempt to navigate to {string}', async function (this: CustomWorld, url: string) {
    await this.page.goto(url);
});

Then('the URL should include returnUrl parameter', async function (this: CustomWorld) {
    const url = this.page.url();
    expect(url).toContain('returnUrl');
});
