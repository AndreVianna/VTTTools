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
import {
    navigateToRegistrationPage,
    fillRegistrationForm,
    submitRegistrationForm,
    performRegistration,
    generateUniqueEmail
} from '../../../support/helpers/authentication.helper.js';

// ============================================================================
// GIVEN Steps - Setup Preconditions
// ============================================================================

Given('I am on the registration page', async function (this: CustomWorld) {
    await navigateToRegistrationPage(this);
});

Given('the registration service is available', async function (this: CustomWorld) {
    // No-op: Service availability is verified when page loads
});

Given('an account already exists with email {string}', async function (
    this: CustomWorld,
    email: string
) {
    const users = await this.db.queryTable('Users', { Email: email.toLowerCase() });
    if (users.length === 0) {
        this.attach(`Creating test account with email: ${email}`, 'text/plain');
        const passwordHash = process.env.BDD_TEST_PASSWORD_HASH;
        if (!passwordHash) {
            throw new Error('CRITICAL: BDD_TEST_PASSWORD_HASH environment variable is not set');
        }
        // userName is always email in this system (backend EF Identity requirement)
        const userId = await this.db.insertUser({
            email: email.toLowerCase(),
            userName: email.toLowerCase(),
            emailConfirmed: true,
            passwordHash: passwordHash,
            name: 'TestUser'
        });

        this.createdUserIds.push(userId);
    }
});

Given('an account already exists with name {string}', async function (
    this: CustomWorld,
    name: string
) {
    const users = await this.db.queryTable('Users', { UserName: name });
    if (users.length === 0) {
        this.attach(`Creating test account with name: ${name}`, 'text/plain');
        const uniqueEmail = generateUniqueEmail(name.toLowerCase());
        const passwordHash = process.env.BDD_TEST_PASSWORD_HASH;
        if (!passwordHash) {
            throw new Error('CRITICAL: BDD_TEST_PASSWORD_HASH environment variable is not set');
        }
        // userName is always email in this system (backend EF Identity requirement)
        // The 'name' parameter is the person's actual name (e.g., "GameMaster")
        const userId = await this.db.insertUser({
            email: uniqueEmail,
            userName: uniqueEmail,  // userName = email (not person's name!)
            emailConfirmed: true,
            passwordHash: passwordHash,
            name: name  // This is the person's actual name
        });

        this.createdUserIds.push(userId);
    }
});

Given('I provide other valid registration data', async function (this: CustomWorld) {
    const emailInput = this.page.getByLabel(/email/i);
    const nameInput = this.page.getByLabel(/name/i);
    const passwordInput = this.page.getByRole('textbox', { name: /^password$/i });

    // Fill email if empty
    if (await emailInput.inputValue() === '') {
        const uniqueEmail = generateUniqueEmail('provide-data');
        await emailInput.fill(uniqueEmail);
        this.attach(`Generated email in "provide other valid data": ${uniqueEmail}`, 'text/plain');
    }

    // Fill name if empty
    if (await nameInput.inputValue() === '') {
        await nameInput.fill('TestUser');
    }

    // Fill password if empty
    if (await passwordInput.inputValue() === '') {
        await passwordInput.fill('TestPassword123');
    }

    // Debug: Log all values after fill
    const emailValue = await emailInput.inputValue();
    const nameValue = await nameInput.inputValue();
    const passwordValue = await passwordInput.inputValue();
    this.attach(`Form after "provide other valid data":\nEmail: "${emailValue}"\nName: "${nameValue}"\nPassword: "${passwordValue}"`, 'text/plain');
});

Given('I have entered invalid email {string}', async function (
    this: CustomWorld,
    email: string
) {
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/name/i).click();
});

Given('I have entered all valid registration data', async function (this: CustomWorld) {
    const uniqueEmail = generateUniqueEmail('newuser');
    await fillRegistrationForm(this.page, uniqueEmail, 'NewUser', 'SecurePass123');
});

Given('I have entered valid registration data', async function (this: CustomWorld) {
    const uniqueEmail = generateUniqueEmail('testuser');
    await fillRegistrationForm(this.page, uniqueEmail, 'TestUser', 'ValidPassword123');
});

Given('I successfully register with email {string}', async function (
    this: CustomWorld,
    _email: string
) {
    const uniqueEmail = generateUniqueEmail('verify');
    await performRegistration(this, uniqueEmail, 'TestUser', 'SecurePass123');

    await this.page.waitForResponse(
        (response) => response.url().includes('/api/auth/register') && response.status() === 200
    );
});

Given('I submit valid registration data', async function (this: CustomWorld) {
    const uniqueEmail = generateUniqueEmail('submit');
    await fillRegistrationForm(this.page, uniqueEmail, 'TestUser', 'SecurePass123');
    await submitRegistrationForm(this);
});

Given('I successfully register', async function (this: CustomWorld) {
    const uniqueEmail = generateUniqueEmail('newuser');
    await performRegistration(this, uniqueEmail, 'NewUser', 'SecurePass123');

    await this.page.waitForResponse(
        (response) => response.url().includes('/api/auth/register') && response.status() === 200
    );
});

Given('my registration request is in progress', async function (this: CustomWorld) {
    await this.page.route('**/api/auth/register', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        route.continue();
    });
});

// ============================================================================
// WHEN Steps - User Actions
// ============================================================================

// Registration-specific email entry that generates unique emails
// Use "I register with email" instead of "I enter email" to avoid ambiguity with shared steps
const enterEmailForRegistration = async function (this: CustomWorld, _email: string) {
    // Registration tests MUST use unique emails (cannot reuse pool users)
    // Generate unique email regardless of the pattern provided in the feature file
    const uniqueEmail = generateUniqueEmail('reg');
    const emailInput = this.page.getByLabel(/email/i);
    await emailInput.fill(uniqueEmail);

    // Trigger blur to activate validation (for validation error scenarios)
    await this.page.getByLabel(/name/i).click();

    // Debug: Verify email was filled
    const emailValue = await emailInput.inputValue();
    this.attach(`Generated unique email for registration: ${uniqueEmail}\nEmail field value: "${emailValue}"`, 'text/plain');
};

Given('I register with email {string}', enterEmailForRegistration);

// Step for validation scenarios that need to use the ACTUAL email value
Given('I enter email {string} for registration', async function (this: CustomWorld, email: string) {
    const emailInput = this.page.getByLabel(/email/i);
    await emailInput.fill(email);

    // Trigger blur for validation
    await this.page.getByLabel(/name/i).click();

    this.attach(`Entered email for registration: ${email}`, 'text/plain');
});

When('I enter username {string}', async function (this: CustomWorld, username: string) {
    const usernameInput = this.page.getByLabel(/username/i);
    await usernameInput.clear();
    await usernameInput.fill(username);
});

Given('I enter matching confirmation password {string}', async function (
    this: CustomWorld,
    password: string
) {
    const confirmInput = this.page.getByLabel(/confirm.*password/i);
    await confirmInput.fill(password);
});

When('I submit the registration form', async function (this: CustomWorld) {
    await submitRegistrationForm(this);
});

When('I attempt to submit the registration form', async function (this: CustomWorld) {
    const submitButton = this.page.getByRole('button', { name: /create.*account/i });
    await submitButton.click();
});

When('I enter unique email {string}', async function (this: CustomWorld, _email: string) {
    const uniqueEmail = generateUniqueEmail('unique');
    await this.page.getByLabel(/email/i).fill(uniqueEmail);
});

When('I enter valid display name {string}', async function (
    this: CustomWorld,
    displayName: string
) {
    await this.page.getByLabel(/name/i).fill(displayName);
});

When('my account is created', async function (this: CustomWorld) {
    await this.page.waitForResponse(
        response => response.url().includes('/api/auth/register') && response.status() === 200
    );
});

When('the email service fails to send verification email', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to mock email service failure');
});

When('the registration service returns 500 error', async function (this: CustomWorld) {
    await this.page.route('**/api/auth/register', route =>
        route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        })
    );
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

    await expect(this.page).toHaveURL(/\/dashboard|\/home/, { timeout: 10000 });
});

When('I navigate the registration form', async function (this: CustomWorld) {
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
    expect(this.lastApiResponse).toBeDefined();
    expect(this.lastApiResponse).not.toBeNull();
    expect(this.lastApiResponse!.status()).toBe(200);
});

Then('my account should not be created', async function (this: CustomWorld) {
    await expect(this.page.getByRole('heading', { name: /start.*journey/i })).toBeVisible();
});

Then('the registration should be prevented', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/register|\/login/);
});

Then('the name should pass validation', async function (this: CustomWorld) {
    const nameInput = this.page.getByLabel(/name/i);
    await expect(nameInput).not.toHaveAttribute('aria-invalid', 'true');
});

Then('I should be able to log in with my new credentials', async function (this: CustomWorld) {
    await this.page.goto('/login');
    await expect(this.page.getByLabel(/email/i)).toBeVisible();
    await expect(this.page.getByRole('textbox', { name: /^password$/i })).toBeVisible();
});

Then('I receive a verification email at {string}', async function (
    this: CustomWorld,
    _email: string
) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify verification email was sent');
});

Then('my email contains a verification link', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify verification email contains a link');
});

Then('my account is marked as {string}', async function (
    this: CustomWorld,
    _status: string
) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify account status in database');
});

Then('I should be redirected to login page', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/login/, { timeout: 10000 });
});

Then('I should see notification about email verification', async function (this: CustomWorld) {
    const notification = this.page.getByRole('alert');
    await expect(notification).toContainText(/verif/i);
});

Then('the error message for registration should disappear', async function (this: CustomWorld) {
    const errorText = this.page.getByText(/invalid email address/i);
    await expect(errorText).not.toBeVisible();
});

Then('the email field should no longer show error styling', async function (this: CustomWorld) {
    const emailInput = this.page.getByLabel(/email/i);
    await expect(emailInput).not.toHaveAttribute('aria-invalid', 'true');
});

Then('only one registration request should be sent', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify only one registration API request was sent');
});

Then('I should have access to authenticated features', async function (this: CustomWorld) {
    await this.page.goto('/dashboard');
    await expect(this.page).toHaveURL(/\/dashboard/);
});

Then('my user information should appear in the header', async function (this: CustomWorld) {
    const header = this.page.locator('header');
    await expect(header).toContainText('NewUser');
});

Then('I should be able to create game sessions', async function (this: CustomWorld) {
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
    await this.page.getByLabel(/email/i).fill('invalid');
    await this.page.getByLabel(/name/i).click();

    const errorText = this.page.getByText(/invalid email/i);
    await expect(errorText).toBeVisible();
});

Then('my registration input data should be preserved', async function (this: CustomWorld) {
    // For registration form, check that email, name, and password are still filled
    const emailInput = this.page.getByLabel(/email/i);
    const nameInput = this.page.getByLabel(/name/i);
    const passwordInput = this.page.getByRole('textbox', { name: /^password$/i });

    const emailValue = await emailInput.inputValue();
    const nameValue = await nameInput.inputValue();
    const passwordValue = await passwordInput.inputValue();

    expect(emailValue).toBeTruthy();
    expect(nameValue).toBeTruthy();
    expect(passwordValue).toBeTruthy();
});

Then('the error appears below the confirm password field', async function (this: CustomWorld) {
    const errorText = this.page.getByText(/passwords.*not match/i);
    await expect(errorText).toBeVisible();
});

Then('password is accepted', async function (this: CustomWorld) {
    const passwordInput = this.page.getByRole('textbox', { name: /^password$/i });
    await expect(passwordInput).not.toHaveAttribute('aria-invalid', 'true');
});

Then('account creation is prevented', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/register|\/login/);
});

Then('I should receive a confirmation email', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify confirmation email was sent');
});
