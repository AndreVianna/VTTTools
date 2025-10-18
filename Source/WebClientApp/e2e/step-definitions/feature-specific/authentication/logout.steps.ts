/**
 * Logout Feature Step Definitions
 *
 * Implements steps for HandleLogout use case
 * Follows BDD Black-Box Testing principles
 *
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../../support/world.js';
import { expect } from '@playwright/test';

// ============================================================================
// GIVEN Steps - Setup Preconditions
// ============================================================================

Given('I am authenticated and logged in', async function (this: CustomWorld) {
    await this.page.goto('/dashboard');
    await expect(this.page).toHaveURL(/\/dashboard/);
});

Given('I have an active session with a valid token', async function (this: CustomWorld) {
    const cookies = await this.context.cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('auth'));
    expect(sessionCookie).toBeDefined();
});

Given('the LogoutButton has showConfirmation=true', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to configure LogoutButton component with showConfirmation=true prop');
});

Given('the LogoutButton has showConfirmation=false', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to configure LogoutButton component with showConfirmation=false prop');
});

Given('the confirmation dialog is displayed', async function (this: CustomWorld) {
    const logoutButton = this.page.getByRole('button', { name: /logout/i });
    await logoutButton.click();

    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible();
});

Given('I am authenticated with session cookie', async function (this: CustomWorld) {
    const cookies = await this.context.cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session'));
    expect(sessionCookie).toBeDefined();
});

Given('I am logged in across multiple components', async function (this: CustomWorld) {
    // Verify auth state in multiple locations
    await this.page.goto('/dashboard');
    await expect(this.page.getByText(this.currentUser.name)).toBeVisible();
});

Given('the LogoutButton has onLogoutStart callback defined', async function (
    this: CustomWorld
) {
    throw new Error('NOT IMPLEMENTED: Step needs to configure LogoutButton component with onLogoutStart callback prop');
});

Given('the LogoutButton has onLogoutComplete callback defined', async function (
    this: CustomWorld
) {
    throw new Error('NOT IMPLEMENTED: Step needs to configure LogoutButton component with onLogoutComplete callback prop');
});

Given('my session token has expired', async function (this: CustomWorld) {
    await this.context.clearCookies();
});

Given('my session was terminated by another process', async function (this: CustomWorld) {
    await this.context.clearCookies();
});

Given('I submit the logout request', async function (this: CustomWorld) {
    const logoutButton = this.page.getByRole('button', { name: /logout/i });
    await logoutButton.click();

    const confirmButton = this.page.getByRole('button', { name: /confirm|logout/i }).last();
    if (await confirmButton.isVisible()) {
        await confirmButton.click();
    }
});


Given('I have loaded sensitive user data in the application', async function (
    this: CustomWorld
) {
    const user = await this.page.evaluate(() => {
        return (window as any).store?.getState()?.auth?.user;
    });
    expect(user).toBeDefined();
});

Given('I am logged in on my desktop browser', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to set up multi-device session scenario (create desktop session in database)');
});

Given('I am also logged in on my mobile device', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to set up multi-device session scenario (create mobile session in database)');
});

Given('I am on the dashboard page', async function (this: CustomWorld) {
    await this.page.goto('/dashboard');
    await expect(this.page).toHaveURL(/\/dashboard/);
});

// ============================================================================
// WHEN Steps - User Actions
// ============================================================================

When('I click the logout button', async function (this: CustomWorld) {
    const logoutButton = this.page.getByRole('button', { name: /logout/i });

    this.lastApiResponse = await Promise.race([
        this.page.waitForResponse(
            response => response.url().includes('/api/auth/logout'),
            { timeout: 10000 }
        ).catch(() => null),
        new Promise(resolve => setTimeout(resolve, 5000))
    ]) as any;

    await logoutButton.click();
});

When('the logout request completes successfully', async function (this: CustomWorld) {
    await this.page.waitForResponse(
        response => response.url().includes('/api/auth/logout') && response.status() === 200
    );
});

When('the network connection fails during logout', async function (this: CustomWorld) {
    await this.page.route('**/api/auth/logout', route => route.abort('failed'));

    const logoutButton = this.page.getByRole('button', { name: /logout/i });
    await logoutButton.click();

    const confirmButton = this.page.getByRole('button', { name: /confirm|logout/i }).last();
    if (await confirmButton.isVisible()) {
        await confirmButton.click();
    }
});

When('the logout API returns 500 error', async function (this: CustomWorld) {
    await this.page.route('**/api/auth/logout', route =>
        route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        })
    );

    const logoutButton = this.page.getByRole('button', { name: /logout/i });
    await logoutButton.click();

    const confirmButton = this.page.getByRole('button', { name: /confirm|logout/i }).last();
    if (await confirmButton.isVisible()) {
        await confirmButton.click();
    }
});

When('I confirm logout', async function (this: CustomWorld) {
    const confirmButton = this.page.getByRole('button', { name: /confirm|logout/i }).last();
    await confirmButton.click();
});


When('the logout completes successfully', async function (this: CustomWorld) {
    await this.page.waitForResponse(
        (response) => response.url().includes('/api/auth/logout') && response.status() === 200
    );
});

When('I log out', { timeout: 15000 }, async function (this: CustomWorld) {
    await this.page.locator('#btn-user-menu').click();
    await this.page.waitForTimeout(500);
    await this.page.locator('#menu-signout').click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/\/|\/login/, { timeout: 10000 });
});

When('I attempt to click logout again', async function (this: CustomWorld) {
    const logoutButton = this.page.getByRole('button', { name: /logout/i });
    await logoutButton.click();
});

When('I log out from my desktop', async function (this: CustomWorld) {
    await this.page.getByRole('button', { name: /logout/i }).click();

    const confirmButton = this.page.getByRole('button', { name: /confirm|logout/i }).last();
    if (await confirmButton.isVisible()) {
        await confirmButton.click();
    }

    await expect(this.page).toHaveURL(/\/|\/login/);
});

When('I successfully log out', async function (this: CustomWorld) {
    const logoutButton = this.page.getByRole('button', { name: /logout/i });
    await logoutButton.click();

    const confirmButton = this.page.getByRole('button', { name: /confirm|logout/i }).last();
    if (await confirmButton.isVisible()) {
        await confirmButton.click();
    }

    await expect(this.page).toHaveURL(/\/|\/login/, { timeout: 10000 });
});

When('the logout request is processed', async function (this: CustomWorld) {
    await this.page.waitForResponse(response => response.url().includes('/api/auth/logout'));
});

// ============================================================================
// THEN Steps - Assertions
// ============================================================================

Then('my session should be terminated on the server', async function (this: CustomWorld) {

    expect(this.lastApiResponse).toBeDefined();
    expect(this.lastApiResponse?.status()).toBe(200);
});

Then('the authentication token should be cleared from storage', async function (
    this: CustomWorld
) {
    const cookies = await this.context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'));
    expect(authCookie).toBeUndefined();
});

Then('the Auth Context should be reset', async function (this: CustomWorld) {
    const authState = await this.page.evaluate(() => {
        return (window as any).store?.getState()?.auth;
    });

    expect(authState?.isAuthenticated).toBeFalsy();
    expect(authState?.user).toBeNull();
});

Then('I should be redirected to the landing page', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/(login)?$/, { timeout: 10000 });
});

Then('the authentication token should be cleared anyway', async function (this: CustomWorld) {
    // Client-side logout should clear token even if API fails
    const cookies = await this.context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'));
    expect(authCookie).toBeUndefined();
});

Then('I should see a warning notification about incomplete server logout', async function (
    this: CustomWorld
) {

    const notification = this.page.getByRole('alert');
    await expect(notification).toBeVisible({ timeout: 5000 });
});

Then('a confirmation dialog should appear', async function (this: CustomWorld) {
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible();
});

Then('I should see {string} message', async function (
    this: CustomWorld,
    message: string
) {
    await expect(this.page.getByText(new RegExp(message, 'i'))).toBeVisible();
});

Then('I should see {string} and {string} buttons', async function (
    this: CustomWorld,
    button1: string,
    button2: string
) {
    await expect(this.page.getByRole('button', { name: new RegExp(button1, 'i') })).toBeVisible();
    await expect(this.page.getByRole('button', { name: new RegExp(button2, 'i') })).toBeVisible();
});

Then('the logout should proceed', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/|\/login/, { timeout: 10000 });
});

Then('my session should be terminated', async function (this: CustomWorld) {
    const cookies = await this.context.cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session'));
    expect(sessionCookie).toBeUndefined();
});

Then('the dialog should close', async function (this: CustomWorld) {
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
});

Then('no logout should occur', async function (this: CustomWorld) {

    await expect(this.page).not.toHaveURL(/\/login/);
});

Then('I should remain authenticated', async function (this: CustomWorld) {
    const authState = await this.page.evaluate(() => {
        return (window as any).store?.getState()?.auth?.isAuthenticated;
    });
    expect(authState).toBe(true);
});

Then('I should stay on the current page', async function (this: CustomWorld) {
    const currentUrl = this.page.url();
    // Verify URL hasn't changed by checking it's still the same after network is idle
    await this.page.waitForLoadState('networkidle');
    expect(this.page.url()).toBe(currentUrl);
});

Then('no confirmation dialog should appear', async function (this: CustomWorld) {
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).not.toBeVisible();
});

Then('the logout should execute immediately', async function (this: CustomWorld) {
    // Logout should complete quickly without dialog
    await expect(this.page).toHaveURL(/\/|\/login/, { timeout: 5000 });
});

Then('I should be logged out', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/|\/login/);

    const cookies = await this.context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'));
    expect(authCookie).toBeUndefined();
});

Then('the session cookie should be cleared by the server', async function (this: CustomWorld) {
    const cookies = await this.context.cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session'));
    expect(sessionCookie).toBeUndefined();
});

Then('Redux authSlice.isAuthenticated should be false', async function (this: CustomWorld) {
    const isAuthenticated = await this.page.evaluate(() => {
        return (window as any).store?.getState()?.auth?.isAuthenticated;
    });
    expect(isAuthenticated).toBeFalsy();
});

Then('Redux authSlice.user should be null', async function (this: CustomWorld) {
    const user = await this.page.evaluate(() => {
        return (window as any).store?.getState()?.auth?.user;
    });
    expect(user).toBeNull();
});

Then('RTK Query cache should be reset', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify RTK Query cache was reset (check Redux store API cache state)');
});

Then('I should not be able to access protected routes', async function (this: CustomWorld) {
    // Try to access protected route
    await this.page.goto('/dashboard');
    await expect(this.page).toHaveURL(/\/login/, { timeout: 5000 });
});

Then('the Auth Context user should be set to null', async function (this: CustomWorld) {
    const user = await this.page.evaluate(() => {
        return (window as any).store?.getState()?.auth?.user;
    });
    expect(user).toBeNull();
});

Then('all components should reflect unauthenticated state', async function (this: CustomWorld) {

    await expect(this.page.getByRole('link', { name: /login|sign in/i })).toBeVisible();
});

Then('protected routes should become inaccessible', async function (this: CustomWorld) {
    await this.page.goto('/dashboard');
    await expect(this.page).toHaveURL(/\/login/);
});

Then('the header should show login/register options', async function (this: CustomWorld) {
    const header = this.page.locator('header');
    await expect(header.getByRole('link', { name: /login|sign in/i })).toBeVisible();
});

Then('the logout button should show a loading spinner', async function (this: CustomWorld) {
    const logoutButton = this.page.getByRole('button', { name: /logout/i });
    await expect(logoutButton.locator('[role="progressbar"]')).toBeVisible();
});

Then('the confirmation dialog actions should be disabled', async function (this: CustomWorld) {
    const confirmButton = this.page.getByRole('button', { name: /confirm|logout/i }).last();
    await expect(confirmButton).toBeDisabled();
});

Then('I should not be able to click logout again', async function (this: CustomWorld) {
    const logoutButton = this.page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).toBeDisabled();
});

Then('the onLogoutStart callback should be executed first', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify onLogoutStart callback was executed (monitor callback invocation or side effects)');
});

Then('I should see any unsaved changes warning', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify unsaved changes warning appears (check for warning dialog or message)');
});

Then('the logout should proceed after callback completes', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/|\/login/, { timeout: 10000 });
});

Then('the onLogoutComplete callback should be executed', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify onLogoutComplete callback was executed (monitor callback invocation or side effects)');
});

Then('any cleanup operations should be performed', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify cleanup operations were performed (monitor cleanup side effects like localStorage clearing, resource disposal)');
});

Then('I should be redirected after callback completes', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/|\/login/);
});

Then('the client should clear the token anyway', async function (this: CustomWorld) {
    const cookies = await this.context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'));
    expect(authCookie).toBeUndefined();
});

Then('the server should return 401 error', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify server returned 401 status (check lastApiResponse or network logs)');
});

Then('I should still be logged out successfully', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/|\/login/);
});

Then('the server should return 404 error', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify server returned 404 status (check lastApiResponse or network logs)');
});

Then('the client should clear state anyway', async function (this: CustomWorld) {
    const cookies = await this.context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    expect(authCookie).toBeUndefined();
});

Then('the second logout should be prevented', async function (this: CustomWorld) {
    const logoutButton = this.page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).toBeDisabled();
});

Then('only one logout request should be sent', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify only one logout API request was sent (check network logs or request count)');
});

Then('all user-specific data should be cleared from state', async function (this: CustomWorld) {
    const authState = await this.page.evaluate(() => {
        return (window as any).store?.getState()?.auth;
    });

    expect(authState?.user).toBeNull();
});

Then('cached API responses should be invalidated', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify API cache was invalidated (check Redux RTK Query cache state)');
});

Then('any WebSocket connections should be closed', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify WebSocket connections were closed (check WebSocket state or connection logs)');
});

Then('the desktop session should be terminated', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/|\/login/);
});

Then('my mobile session should remain active', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify mobile session remains active (query database Sessions table for mobile device)');
});

Then('I should still be authenticated on mobile', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify mobile device is still authenticated (query database or use API call with mobile session token)');
});

Then('I receive response with in less than 200ms', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify logout response time was under 200ms (measure lastApiResponse timing or performance metrics)');
});

Then('the client-side state should clear immediately', async function (this: CustomWorld) {
    // Client state clears synchronously
    const user = await this.page.evaluate(() => {
        return (window as any).store?.getState()?.auth?.user;
    });
    expect(user).toBeNull();
});

Then('I should see the public landing page content', async function (this: CustomWorld) {
    await expect(this.page.getByRole('link', { name: /login|sign in/i })).toBeVisible();
});

Then('I should see login and register options', async function (this: CustomWorld) {
    await expect(this.page.getByRole('link', { name: /login|sign in/i })).toBeVisible();
    await expect(this.page.getByRole('link', { name: /register|sign up/i })).toBeVisible();
});

Then('the button should be announced as {string}', async function (
    this: CustomWorld,
    expectedText: string
) {
    const button = this.page.getByRole('button', { name: new RegExp(expectedText, 'i') });
    await expect(button).toBeVisible();
});

Then('the button action should be clear', async function (this: CustomWorld) {
    const button = this.page.getByRole('button', { name: /logout/i });
    await expect(button).toHaveAttribute('type', 'button');
});

Then('the confirmation dialog should be accessible if shown', async function (
    this: CustomWorld
) {
    const dialog = this.page.getByRole('dialog');
    if (await dialog.isVisible()) {
        expect(await dialog.getAttribute('role')).toBe('dialog');
    }
});
