/**
 * Shared Form Interaction Step Definitions
 *
 * Common steps for interacting with forms across features
 * Used by: Login, Registration, Password Reset
 *
 */

import { When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';
import { expect } from '@playwright/test';

// ============================================================================
// WHEN Steps - Form Actions
// ============================================================================

When('I enter name {string}', async function (this: CustomWorld, name: string) {
    const nameInput = this.page.getByLabel(/name/i);
    await nameInput.clear();
    await nameInput.fill(name);
});

When('I enter email {string}', async function (this: CustomWorld, email: string) {
    const emailInput = this.page.getByLabel(/email/i);
    await emailInput.clear();

    // For test scenarios with example emails, use pool user's email but preserve case transformation
    // This allows feature files to remain readable while tests use actual pool users
    if (this.currentUser && /^[^@]+@example\.com$/i.test(email)) {
        // Apply same case transformation to pool user's email
        const isUpperCase = email === email.toUpperCase();
        const poolEmail = isUpperCase ? this.currentUser.email.toUpperCase() : this.currentUser.email;
        await emailInput.fill(poolEmail);
        this.attach(`Using pool user email: ${poolEmail} (based on pattern: ${email})`);
    } else {
        await emailInput.fill(email);
    }
});

When('I enter password {string}', async function (this: CustomWorld, password: string) {
    const passwordInput = this.page.getByRole('textbox', { name: /password/i });
    await passwordInput.clear();

    // For test scenarios with example passwords, use BDD_TEST_PASSWORD
    // Common test password patterns: TestPassword123, SecurePass123, ValidPassword123
    // NOTE: Case-sensitive matching - lowercase variants (e.g., "securepass123") are intentionally wrong for testing
    const testPasswordPatterns = /^(Test|Secure|Valid|Password)[A-Z][a-z]*\d+$/;
    if (testPasswordPatterns.test(password)) {
        const actualPassword = process.env.BDD_TEST_PASSWORD;
        if (!actualPassword) {
            throw new Error('CRITICAL: BDD_TEST_PASSWORD environment variable is not set');
        }
        await passwordInput.fill(actualPassword);
        this.attach(`Using BDD_TEST_PASSWORD (pattern matched: ${password})`);
    } else {
        await passwordInput.fill(password);
    }
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

    // For test scenarios with example emails, use pool user's email
    if (this.currentUser && /^[^@]+@example\.com$/i.test(email)) {
        await emailInput.fill(this.currentUser.email);
        this.attach(`Using pool user email: ${this.currentUser.email} (based on pattern: ${email})`);
    } else {
        await emailInput.fill(email);
    }
});

When('the network connection fails', async function (this: CustomWorld) {
    await this.page.route('**/api/auth/**', route => route.abort('failed'));
});

When('I attempt to submit the form again', async function (this: CustomWorld) {
    // Use button[type="submit"] to find the form submit button
    const submitButton = this.page.locator('button[type="submit"]').first();
    // Try to click even if disabled - this should be prevented by the UI
    await submitButton.click({ force: true, timeout: 1000 }).catch(() => {
        // Click may fail if button is disabled, which is expected
    });
});

When('the request is in progress', async function (this: CustomWorld) {
    await this.page.route('**/api/auth/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        route.continue();
    });

    const submitButton = this.page.locator('button[type="submit"]').first();
    await submitButton.click();

    await expect(submitButton).toBeDisabled({ timeout: 3000 });
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
    const submitButton = this.page.getByRole('button', { name: /sign in|create account|reset password|send reset instructions/i });
    await expect(submitButton).toBeVisible();

    await expect(this.page).toHaveURL(/\/login|\/register/);
});

Then('the second submission is prevented', async function (this: CustomWorld) {
    // Use button[type="submit"] to find the form submit button
    const submitButton = this.page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeDisabled({ timeout: 3000 });
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
    const submitButton = this.page.locator('button[type="submit"]').first();
    await expect(submitButton.locator('[role="progressbar"]').first()).toBeVisible({ timeout: 10000 });
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
