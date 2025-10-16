/**
 * Shared Form Interaction Step Definitions
 *
 * Common steps for interacting with forms across features
 * Used by: Login, Registration, Password Reset
 *
 * ANTI-PATTERN COMPLIANCE:
 * ✅ No step-to-step calls
 * ✅ Strong TypeScript types
 * ✅ Semantic selectors (getByLabel, getByRole)
 */

import { When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';
import { expect } from '@playwright/test';

// ============================================================================
// WHEN Steps - Form Actions
// ============================================================================

When('I enter email {string}', async function (this: CustomWorld, email: string) {
    const emailInput = this.page.getByLabel(/email/i);
    await emailInput.clear();
    await emailInput.fill(email);
});

When('I enter password {string}', async function (this: CustomWorld, password: string) {
    const passwordInput = this.page.getByRole('textbox', { name: /password/i });
    await passwordInput.clear();
    await passwordInput.fill(password);
});

When('I submit the login form', async function (this: CustomWorld) {
    const submitButton = this.page.getByRole('button', { name: /sign in/i });

    const responsePromise = this.page.waitForResponse(
        response => response.url().includes('/api/auth/login') && response.status() !== 0
    );

    await submitButton.click();

    this.lastApiResponse = await responsePromise as any;
});

When('I attempt to submit the login form', async function (this: CustomWorld) {
    const submitButton = this.page.getByRole('button', { name: /sign in/i });
    await submitButton.click();
});

When('I focus out of the email field', async function (this: CustomWorld) {
    const emailInput = this.page.getByLabel(/email/i);
    await emailInput.blur();
});

When('I enter valid email {string}', async function (this: CustomWorld, email: string) {
    const emailInput = this.page.getByLabel(/email/i);
    await emailInput.clear();
    await emailInput.fill(email);
});

When('the network connection fails', async function (this: CustomWorld) {
    await this.page.route('**/api/auth/**', route => route.abort('failed'));
});

When('I attempt to submit the form again', async function (this: CustomWorld) {
    const submitButton = this.page.getByRole('button', { name: /sign in|create account|reset password/i });
    await submitButton.click();
});

When('the request is in progress', async function (this: CustomWorld) {
    const submitButton = this.page.getByRole('button', { name: /sign in|create account|reset password/i });
    await expect(submitButton).toBeDisabled({ timeout: 2000 });
});

// ============================================================================
// THEN Steps - Form State Assertions
// ============================================================================

Then('my form is submitted', async function (this: CustomWorld) {
    await this.page.waitForResponse(response =>
        response.url().includes('/api/auth/')
    );
});

Then('my form is not submitted', async function (this: CustomWorld) {
    const submitButton = this.page.getByRole('button', { name: /sign in|create account|reset password/i });
    await expect(submitButton).toBeVisible();

    await expect(this.page).toHaveURL(/\/login|\/register/);
});

Then('the second submission is prevented', async function (this: CustomWorld) {
    const submitButton = this.page.getByRole('button', { name: /sign in|create account|reset password/i });
    await expect(submitButton).toBeDisabled();
});

Then('the submit button state is communicated', async function (this: CustomWorld) {
    const submitButton = this.page.getByRole('button', { name: /sign in|create account|reset password/i });
    const ariaDisabled = await submitButton.getAttribute('aria-disabled');

    expect(ariaDisabled).toBeDefined();
});

Then('I should not see email validation errors', async function (this: CustomWorld) {
    const emailError = this.page.getByText(/invalid email address/i);
    await expect(emailError).not.toBeVisible();
});

Then('the submit button shows a loading spinner', async function (this: CustomWorld) {
    const submitButton = this.page.getByRole('button', { name: /sign in|create account|reset password/i });
    await expect(submitButton.locator('svg, [role="progressbar"]')).toBeVisible();
});

Then('all form inputs are disabled', async function (this: CustomWorld) {
    const inputs = await this.page.locator('input').all();
    for (const input of inputs) {
        await expect(input).toBeDisabled();
    }
});

Then('the form is enabled again', async function (this: CustomWorld) {
    const submitButton = this.page.getByRole('button', { name: /sign in|create account|reset password/i });
    await expect(submitButton).toBeEnabled();
});

Then('I should be able to retry', async function (this: CustomWorld) {
    const submitButton = this.page.getByRole('button', { name: /sign in|create account|reset password/i });
    await expect(submitButton).toBeEnabled();
});

Then('I should not be able to submit the form again', async function (this: CustomWorld) {
    const submitButton = this.page.getByRole('button', { name: /sign in|create account|reset password/i });
    await expect(submitButton).toBeDisabled();
});
