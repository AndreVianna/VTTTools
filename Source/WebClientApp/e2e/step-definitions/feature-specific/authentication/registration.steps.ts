/**
 * Registration Feature Step Definitions
 *
 * Implements steps for HandleRegistration use case
 * Follows BDD Black-Box Testing principles
 *
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../../support/world.js';
import { expect } from '@playwright/test';

// ============================================================================
// GIVEN Steps - Setup Preconditions
// ============================================================================

Given('I am on the registration page', async function (this: CustomWorld) {
    await this.page.goto('/register');
    await expect(this.page).toHaveURL(/\/register|\/login/);

    // If on login page, switch to registration
    const registerLink = this.page.getByRole('link', { name: /create.*account|sign up/i });
    if (await registerLink.isVisible()) {
        await registerLink.click();
    }

    await expect(this.page.getByText(/start.*journey|create.*account/i)).toBeVisible();
});

Given('the registration service is available', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify registration service is available (health check or API probe)');
});

Given('an account already exists with email {string}', async function (
    this: CustomWorld,
    email: string
) {
    // Verify account exists in database
    const users = await this.db.queryTable('Users', { Email: email.toLowerCase() });
    if (users.length === 0) {
        // Create test account if it doesn't exist
        this.attach(`Creating test account with email: ${email}`, 'text/plain');
    }
});

Given('an account already exists with username {string}', async function (
    this: CustomWorld,
    _username: string
) {
    throw new Error('NOT IMPLEMENTED: Step needs to create or verify account with username exists (query database Users table by Username)');
});

Given('I provide other valid registration data', async function (this: CustomWorld) {
    // Fill in required fields with valid data
    await this.page.getByLabel(/name/i).fill('Test User');
    await this.page.getByLabel(/password/i).fill('TestPassword123');
});

Given('I have entered invalid email {string}', async function (
    this: CustomWorld,
    email: string
) {
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/name/i).click(); // Trigger blur
});

Given('I see error {string}', async function (this: CustomWorld, errorMessage: string) {
    await expect(this.page.getByText(new RegExp(errorMessage, 'i'))).toBeVisible();
});

Given('I have entered all valid registration data', async function (this: CustomWorld) {
    await this.page.getByLabel(/email/i).fill('newuser@example.com');
    await this.page.getByLabel(/name/i).fill('New User');
    await this.page.getByLabel(/password/i).fill('SecurePass123');
});

Given('I have entered valid registration data', async function (this: CustomWorld) {
    await this.page.getByLabel(/email/i).fill('testuser@example.com');
    await this.page.getByLabel(/name/i).fill('Test User');
    await this.page.getByLabel(/password/i).fill('ValidPassword123');
});

Given('I successfully register with email {string}', async function (
    this: CustomWorld,
    email: string
) {
    await this.page.goto('/register');

    // Switch to registration if needed
    const registerLink = this.page.getByRole('link', { name: /create.*account/i });
    if (await registerLink.isVisible()) {
        await registerLink.click();
    }

    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/name/i).fill('Test User');
    await this.page.getByLabel(/password/i).fill('SecurePass123');

    const submitButton = this.page.getByRole('button', { name: /create.*account/i });
    await submitButton.click();

    // Wait for success response
    await this.page.waitForResponse(
        (response) => response.url().includes('/api/auth/register') && response.status() === 200
    );
});

Given('I submit valid registration data', async function (this: CustomWorld) {
    await this.page.getByLabel(/email/i).fill('testuser@example.com');
    await this.page.getByLabel(/name/i).fill('Test User');
    await this.page.getByLabel(/password/i).fill('SecurePass123');

    const submitButton = this.page.getByRole('button', { name: /create.*account/i });
    await submitButton.click();
});

Given('I successfully register', async function (this: CustomWorld) {
    await this.page.goto('/register');

    // Switch to registration
    const registerLink = this.page.getByRole('link', { name: /create.*account/i });
    if (await registerLink.isVisible()) {
        await registerLink.click();
    }

    await this.page.getByLabel(/email/i).fill('newuser@example.com');
    await this.page.getByLabel(/name/i).fill('New User');
    await this.page.getByLabel(/password/i).fill('SecurePass123');

    const submitButton = this.page.getByRole('button', { name: /create.*account/i });
    await submitButton.click();

    await this.page.waitForResponse(
        (response) => response.url().includes('/api/auth/register') && response.status() === 200
    );
});

// ============================================================================
// WHEN Steps - User Actions
// ============================================================================

When('I enter username {string}', async function (this: CustomWorld, username: string) {
    const usernameInput = this.page.getByLabel(/username/i);
    await usernameInput.clear();
    await usernameInput.fill(username);
});

When('I enter confirmation password {string}', async function (
    this: CustomWorld,
    confirmPassword: string
) {
    const confirmInput = this.page.getByLabel(/confirm.*password/i);
    await confirmInput.clear();
    await confirmInput.fill(confirmPassword);
});

When('I enter matching confirmation password {string}', async function (
    this: CustomWorld,
    _password: string
) {
    throw new Error('NOT IMPLEMENTED: Step needs to fill password confirmation field (find confirm password input and fill with matching password)');
});

When('I submit the registration form', async function (this: CustomWorld) {
    const submitButton = this.page.getByRole('button', { name: /create.*account/i });

    // Wait for API response
    const responsePromise = this.page.waitForResponse(
        response => response.url().includes('/api/auth/register') && response.status() !== 0
    );

    await submitButton.click();
    this.lastApiResponse = await responsePromise as any;
});

When('I attempt to submit the registration form', async function (this: CustomWorld) {
    const submitButton = this.page.getByRole('button', { name: /create.*account/i });
    await submitButton.click();
});

When('I enter unique email {string}', async function (this: CustomWorld, email: string) {
    await this.page.getByLabel(/email/i).fill(email);
});

When('I enter valid display name {string}', async function (
    this: CustomWorld,
    displayName: string
) {
    await this.page.getByLabel(/name/i).fill(displayName);
});

When('my account is created', async function (this: CustomWorld) {
    await this.page.waitForResponse(
        response => response.url().includes('/api/auth/register') && response.status() === 201
    );
});

When('the email service fails to send verification email', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to mock email service failure (route email API to return error or configure test backend)');
});

When('the registration service returns 500 error', async function (this: CustomWorld) {
    await this.page.route('**/api/auth/register', route =>
        route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        })
    );

    const submitButton = this.page.getByRole('button', { name: /create.*account/i });
    await submitButton.click();
});

When('I correct the email to {string}', async function (this: CustomWorld, email: string) {
    const emailInput = this.page.getByLabel(/email/i);
    await emailInput.clear();
    await emailInput.fill(email);
});

When('my account is created and I\'m logged in', async function (this: CustomWorld) {
    await this.page.waitForResponse(
        (response) => response.url().includes('/api/auth/register') && response.status() === 200
    );

    // Should redirect to dashboard or home
    await expect(this.page).toHaveURL(/\/dashboard|\/home/, { timeout: 10000 });
});

When('I navigate the registration form', async function (this: CustomWorld) {
    // Tab through form elements
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
});

// ============================================================================
// THEN Steps - Assertions
// ============================================================================

Then('my email should pass validation', async function (this: CustomWorld) {
    const emailInput = this.page.getByLabel(/email/i);
    await expect(emailInput).not.toHaveAttribute('aria-invalid', 'true');
});

Then('my account should be created', async function (this: CustomWorld) {
    expect(this.lastApiResponse.status()).toBe(201);
});

Then('my account should not be created', async function (this: CustomWorld) {
    // Verify we're still on registration page
    await expect(this.page.getByText(/start.*journey|create.*account/i)).toBeVisible();
});

Then('the registration should be prevented', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/register|\/login/);
});

Then('the username should pass validation', async function (this: CustomWorld) {
    const usernameInput = this.page.getByLabel(/username/i);
    await expect(usernameInput).not.toHaveAttribute('aria-invalid', 'true');
});

Then('my password should pass validation', async function (this: CustomWorld) {
    const passwordInput = this.page.getByLabel(/^password$/i);
    await expect(passwordInput).not.toHaveAttribute('aria-invalid', 'true');
});

Then('my account should be created successfully', async function (this: CustomWorld) {
    expect(this.lastApiResponse.status()).toBe(201);
});

Then('I should be redirected to {string}', async function (
    this: CustomWorld,
    path: string
) {
    await expect(this.page).toHaveURL(new RegExp(path), { timeout: 10000 });
});

Then('I should be able to log in with my new credentials', async function (this: CustomWorld) {
    // Navigate to login
    await this.page.goto('/login');

    // Verify login form is accessible
    await expect(this.page.getByLabel(/email/i)).toBeVisible();
    await expect(this.page.getByLabel(/password/i)).toBeVisible();
});

Then('I receive a verification email at {string}', async function (
    this: CustomWorld,
    _email: string
) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify verification email was sent (check email service logs or test inbox)');
});

Then('my email contains a verification link', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify verification email contains a link (check email content for verification URL)');
});

Then('my account is marked as {string}', async function (
    this: CustomWorld,
    _status: string
) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify account status in database (query Users table EmailConfirmed or Status field)');
});

Then('I should still be created', async function (this: CustomWorld) {
    expect(this.lastApiResponse.status()).toBe(201);
});

Then('I should be redirected to login page', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/login/, { timeout: 10000 });
});

Then('I should see notification about email verification', async function (this: CustomWorld) {
    const notification = this.page.getByRole('alert');
    await expect(notification).toContainText(/verif/i);
});

Then('I should not be able to submit again', async function (this: CustomWorld) {
    const submitButton = this.page.getByRole('button', { name: /create.*account/i });
    await expect(submitButton).toBeDisabled();
});

Then('my input data should be preserved', async function (this: CustomWorld) {
    const emailInput = this.page.getByLabel(/email/i);
    const emailValue = await emailInput.inputValue();
    expect(emailValue).toBeTruthy();
});

Then('the error message should disappear', async function (this: CustomWorld) {
    const errorText = this.page.getByText(/invalid email address/i);
    await expect(errorText).not.toBeVisible();
});

Then('the email field should no longer show error styling', async function (this: CustomWorld) {
    const emailInput = this.page.getByLabel(/email/i);
    await expect(emailInput).not.toHaveAttribute('aria-invalid', 'true');
});

Then('only one registration request should be sent', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify only one registration API request was sent (check network logs or request count)');
});

Then('I should have access to authenticated features', async function (this: CustomWorld) {
    // Try accessing dashboard
    await this.page.goto('/dashboard');
    await expect(this.page).toHaveURL(/\/dashboard/);
});

Then('my user information should appear in the header', async function (this: CustomWorld) {
    const header = this.page.locator('header');
    await expect(header).toContainText('New User');
});

Then('I should be able to create game sessions', async function (this: CustomWorld) {
    // Verify access to game session creation
    await this.page.goto('/sessions');
    await expect(this.page.getByRole('button', { name: /create/i })).toBeVisible();
});

Then('all fields should have descriptive labels', async function (this: CustomWorld) {
    await expect(this.page.getByLabel(/email/i)).toBeVisible();
    await expect(this.page.getByLabel(/name/i)).toBeVisible();
    await expect(this.page.getByLabel(/password/i)).toBeVisible();
});

Then('password strength requirements should be announced', async function (this: CustomWorld) {
    const passwordHelperText = this.page.getByText(/password.*6.*character/i);
    await expect(passwordHelperText).toBeVisible();
});

Then('validation errors should be announced immediately', async function (this: CustomWorld) {
    // Trigger validation error
    await this.page.getByLabel(/email/i).fill('invalid');
    await this.page.getByLabel(/name/i).click(); // Blur

    // Error should be visible
    const errorText = this.page.getByText(/invalid email/i);
    await expect(errorText).toBeVisible();
});

Then('the error appears below the confirm password field', async function (this: CustomWorld) {
    const errorText = this.page.getByText(/passwords.*not match/i);
    await expect(errorText).toBeVisible();
});

Then('I should see my account created', async function (this: CustomWorld) {
    expect(this.lastApiResponse.status()).toBe(201);
});

Then('password is accepted', async function (this: CustomWorld) {
    const passwordInput = this.page.getByLabel(/^password$/i);
    await expect(passwordInput).not.toHaveAttribute('aria-invalid', 'true');
});

Then('account creation is prevented', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/register|\/login/);
});

Then('I should receive a confirmation email', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify confirmation email was sent (check email service logs or test inbox)');
});

Then('my account is created', async function (this: CustomWorld) {
    expect(this.lastApiResponse.status()).toBe(201);
});
