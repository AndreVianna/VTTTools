/**
 * Authentication Helper
 *
 * Provides reusable authentication workflows for BDD scenarios
 * Follows TESTING_GUIDE anti-pattern #1: Extract to helpers, not step-to-step calls
 *
 * USAGE:
 * - Import in step definitions
 * - Pass CustomWorld instance
 * - Avoid calling Cucumber steps from within steps
 */

import { Page, expect } from '@playwright/test';
import { CustomWorld } from '../world.js';

/**
 * Navigate to login page and verify it loaded
 */
export async function navigateToLoginPage(world: CustomWorld): Promise<void> {
    await world.page.goto('/login');
    await expect(world.page).toHaveURL(/\/login/);
    await expect(world.page.getByText(/welcome back/i)).toBeVisible();
}

/**
 * Navigate to registration page and verify it loaded
 */
export async function navigateToRegistrationPage(world: CustomWorld): Promise<void> {
    await world.page.goto('/register');
    await expect(world.page).toHaveURL(/\/register|\/login/);

    // If on login page, switch to registration
    const registerLink = world.page.getByRole('link', { name: /create.*account|sign up/i });
    if (await registerLink.isVisible()) {
        await registerLink.click();
    }

    await expect(world.page.getByRole('heading', { name: /start.*journey/i })).toBeVisible();
}

/**
 * Clear all authentication state (cookies, storage)
 */
export async function clearAuthState(world: CustomWorld): Promise<void> {
    await world.context.clearCookies();
    await world.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
}

/**
 * Fill login form with credentials
 */
export async function fillLoginForm(
    page: Page,
    email: string,
    password: string
): Promise<void> {
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
}

/**
 * Fill registration form with user data
 */
export async function fillRegistrationForm(
    page: Page,
    email: string,
    name: string,
    password: string
): Promise<void> {
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/name/i).fill(name);
    // Use textbox role to avoid strict mode violation with password toggle button
    await page.getByRole('textbox', { name: /^password$/i }).fill(password);
}

/**
 * Submit login form and wait for API response
 */
export async function submitLoginForm(world: CustomWorld): Promise<void> {
    const submitButton = world.page.getByRole('button', { name: /sign in/i });

    const responsePromise = world.page.waitForResponse(
        response => response.url().includes('/api/auth/login') && response.status() !== 0
    );

    await submitButton.click();
    world.lastApiResponse = await responsePromise as any;
}

/**
 * Submit registration form and wait for API response
 */
export async function submitRegistrationForm(world: CustomWorld): Promise<void> {
    // Debug: Log form state before submission
    const emailInput = world.page.getByLabel(/email/i);
    const nameInput = world.page.getByLabel(/name/i);
    const passwordInput = world.page.getByRole('textbox', { name: /^password$/i });

    const emailValue = await emailInput.inputValue();
    const nameValue = await nameInput.inputValue();
    const passwordValue = await passwordInput.inputValue();

    const submitButton = world.page.getByRole('button', { name: /create.*account/i });
    const isButtonDisabled = await submitButton.isDisabled();
    const isButtonVisible = await submitButton.isVisible();

    world.attach(`Form state before submission:
Email: "${emailValue}"
Name: "${nameValue}"
Password: "${passwordValue}"
Button visible: ${isButtonVisible}
Button disabled: ${isButtonDisabled}`, 'text/plain');

    // Check for validation errors (all error messages in form)
    const allErrors = await world.page.locator('.MuiFormHelperText-root.Mui-error').allTextContents();
    if (allErrors.length > 0) {
        world.attach(`Validation errors found: ${allErrors.join(', ')}`, 'text/plain');
    }

    // Listen for console messages to see form submission logs
    world.page.on('console', msg => {
        if (msg.type() === 'log' || msg.type() === 'error') {
            world.attach(`Browser console: [${msg.type()}] ${msg.text()}`, 'text/plain');
        }
    });

    const responsePromise = world.page.waitForResponse(
        response => response.url().includes('/api/auth/register') && response.status() !== 0,
        { timeout: 10000 }
    );

    await submitButton.click();
    world.attach('Submit button clicked, waiting for API response...', 'text/plain');

    world.lastApiResponse = await responsePromise as any;
    if (world.lastApiResponse) {
        world.attach(`API response received: ${world.lastApiResponse.status()}`, 'text/plain');
    }
}

/**
 * Complete login flow: navigate, fill, submit
 */
export async function performLogin(
    world: CustomWorld,
    email: string,
    password: string
): Promise<void> {
    await navigateToLoginPage(world);
    await fillLoginForm(world.page, email, password);
    await submitLoginForm(world);
}

/**
 * Complete registration flow: navigate, fill, submit
 */
export async function performRegistration(
    world: CustomWorld,
    email: string,
    name: string,
    password: string
): Promise<void> {
    await navigateToRegistrationPage(world);
    await fillRegistrationForm(world.page, email, name, password);
    await submitRegistrationForm(world);
}

/**
 * Verify user is authenticated (cookies and Redux state)
 */
export async function verifyAuthenticated(world: CustomWorld): Promise<void> {
    // Check cookies
    const cookies = await world.context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'));
    expect(authCookie).toBeDefined();

    // Check Redux state
    const isAuthenticated = await world.page.evaluate(() => {
        return (window as any).store?.getState()?.auth?.isAuthenticated;
    });
    expect(isAuthenticated).toBe(true);
}

/**
 * Verify user is NOT authenticated
 */
export async function verifyNotAuthenticated(world: CustomWorld): Promise<void> {
    const cookies = await world.context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'));
    expect(authCookie).toBeUndefined();
}

/**
 * Click logout button and handle confirmation dialog if present
 */
export async function performLogout(world: CustomWorld): Promise<void> {
    const logoutButton = world.page.getByRole('button', { name: /logout/i });
    await logoutButton.click();

    // Handle confirmation dialog if present
    const confirmButton = world.page.getByRole('button', { name: /confirm|logout/i }).last();
    if (await confirmButton.isVisible()) {
        await confirmButton.click();
    }

    // Wait for redirect
    await expect(world.page).toHaveURL(/\/|\/login/, { timeout: 10000 });
}

/**
 * Verify error message is displayed
 */
export async function verifyErrorMessage(page: Page, errorMessage: string): Promise<void> {
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 5000 });
    await expect(alert).toContainText(errorMessage, { ignoreCase: true });
}

/**
 * Verify form is in loading state
 */
export async function verifyLoadingState(page: Page, buttonName: string): Promise<void> {
    const submitButton = page.getByRole('button', { name: new RegExp(buttonName, 'i') });
    await expect(submitButton).toContainText('', { timeout: 1000 });
    await expect(submitButton.locator('[role="progressbar"]')).toBeVisible();
}

/**
 * Verify form inputs are disabled
 */
export async function verifyFormDisabled(page: Page): Promise<void> {
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);

    await expect(emailInput).toBeDisabled();
    await expect(passwordInput).toBeDisabled();
}

/**
 * Verify form inputs are enabled
 */
export async function verifyFormEnabled(page: Page): Promise<void> {
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);

    await expect(emailInput).toBeEnabled();
    await expect(passwordInput).toBeEnabled();
}

/**
 * Switch authentication mode on LoginPage (login/register/reset)
 */
export async function switchAuthMode(
    page: Page,
    targetMode: 'login' | 'register' | 'reset-password'
): Promise<void> {
    switch (targetMode) {
        case 'register':
            await page.getByRole('link', { name: /create.*account|sign up/i }).click();
            await expect(page.getByText(/start.*journey/i)).toBeVisible();
            break;
        case 'login':
            await page.getByRole('link', { name: /sign in|login/i }).click();
            await expect(page.getByText(/welcome back/i)).toBeVisible();
            break;
        case 'reset-password':
            await page.getByRole('link', { name: /forgot.*password/i }).click();
            await expect(page.getByText(/reset.*password/i)).toBeVisible();
            break;
    }
}

/**
 * Verify validation error appears below specific field
 */
export async function verifyFieldError(
    page: Page,
    fieldLabel: string,
    errorMessage: string
): Promise<void> {
    const field = page.getByLabel(new RegExp(fieldLabel, 'i'));
    const fieldBox = await field.boundingBox();

    const errorText = page.getByText(new RegExp(errorMessage, 'i'));
    const errorBox = await errorText.boundingBox();

    if (fieldBox && errorBox) {
        expect(errorBox.y).toBeGreaterThan(fieldBox.y);
    }

    await expect(errorText).toBeVisible();
}

/**
 * Verify user info appears in header
 */
export async function verifyUserInHeader(page: Page, userName: string): Promise<void> {
    const header = page.locator('header');
    await expect(header).toContainText(userName);
}

/**
 * Verify redirect to specific path
 */
export async function verifyRedirect(page: Page, path: string): Promise<void> {
    await expect(page).toHaveURL(new RegExp(path), { timeout: 10000 });
}

/**
 * Simulate network failure for authentication endpoint
 */
export async function simulateNetworkFailure(
    page: Page,
    endpoint: 'login' | 'register' | 'logout'
): Promise<void> {
    await page.route(`**/api/auth/${endpoint}`, route => route.abort('failed'));
}

/**
 * Simulate server error for authentication endpoint
 */
export async function simulateServerError(
    page: Page,
    endpoint: 'login' | 'register' | 'logout'
): Promise<void> {
    await page.route(`**/api/auth/${endpoint}`, route =>
        route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        })
    );
}

/**
 * Verify Redux auth state
 */
export async function verifyReduxAuthState(
    page: Page,
    expectedState: { isAuthenticated: boolean; user: any | null }
): Promise<void> {
    const authState = await page.evaluate(() => {
        return (window as any).store?.getState()?.auth;
    });

    expect(authState?.isAuthenticated).toBe(expectedState.isAuthenticated);
    if (expectedState.user === null) {
        expect(authState?.user).toBeNull();
    } else {
        expect(authState?.user).toBeDefined();
    }
}

/**
 * Verify protected route is accessible
 */
export async function verifyProtectedRouteAccessible(page: Page, path: string): Promise<void> {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(path));
    await expect(page).not.toHaveURL(/\/login/);
}

/**
 * Verify protected route redirects to login
 */
export async function verifyProtectedRouteBlocked(page: Page, path: string): Promise<void> {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
}

/**
 * Generate unique email for registration tests
 * Registration tests CANNOT reuse pool users - each registration needs unique email
 */
export function generateUniqueEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `bdd-reg-${prefix}-${timestamp}-${random}@test.local`;
}

/**
 * Perform login using pool user credentials (currentUser from hooks)
 * This is the common pattern used across most step definitions
 */
export async function performPoolUserLogin(world: CustomWorld): Promise<void> {
    const password = process.env.BDD_TEST_PASSWORD;
    if (!password) {
        throw new Error('CRITICAL: BDD_TEST_PASSWORD environment variable is not set. Check your .env file.');
    }

    await world.page.goto('/login');
    await world.page.waitForLoadState('networkidle');

    await world.page.fill('input[type="email"], input[name="email"]', world.currentUser.email);
    await world.page.fill('input[type="password"], input[name="password"]', password);
    await world.page.click('button[type="submit"], button:has-text("Sign In")');

    await world.page.waitForURL(url => !url.pathname.includes('/login') && !url.pathname.includes('/register'), { timeout: 15000 });
    await world.page.waitForLoadState('networkidle');
}
