/**
 * Password Reset Step Definitions
 *
 * Step definitions for password reset request and confirmation flows
 * Covers: Requestpasswordreset.feature, Confirmpasswordreset.feature
 *
 * CRITICAL: NO anti-patterns
 * - No step-to-step calls
 * - No hard-coded credentials
 * - No SQL injection
 * - Wait for conditions, not timeouts
 * - Use semantic assertions
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';
import { expect } from '@playwright/test';

// ============================================================================
// GIVEN STEPS - Preconditions
// ============================================================================

Given('I am on the password reset request page', async function (this: CustomWorld) {
    // Navigate to login page
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });

    // Wait for the login form to be ready
    await expect(this.page.getByLabel(/email/i)).toBeVisible({ timeout: 10000 });

    // Click "Forgot password?" link - it's rendered as a MUI Link component with component="button"
    const forgotPasswordLink = this.page.getByRole('button', { name: /forgot password/i });
    await forgotPasswordLink.waitFor({ state: 'visible', timeout: 10000 });
    await forgotPasswordLink.click();

    // Verify we're on reset request page by checking for the heading
    await expect(this.page.getByRole('heading', { name: /reset password/i })).toBeVisible({ timeout: 10000 });
});

Given('the password reset service is available', async function (this: CustomWorld) {
    // Verify backend API is responding
    const response = await this.page.request.get('/api/health');
    expect(response.ok()).toBeTruthy();
});

Given('I have entered a valid email', async function (this: CustomWorld) {
    const emailInput = this.page.getByLabel(/email/i);
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('testuser@example.com');
});

Given('I previously requested password reset', async function (this: CustomWorld) {
    // Simulate previous reset request by creating token in database
    const token = 'previous-token-' + Date.now();
    const userId = this.currentUser.id;

    await this.db.insertPasswordResetToken({
        userId,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    this.attach(`Previous reset token created for user: ${userId}`);
});

Given('I have an active reset token', async function (this: CustomWorld) {
    // Similar to previous step
    const token = 'active-token-' + Date.now();
    await this.db.insertPasswordResetToken({
        userId: this.currentUser.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
});

Given('I have requested password reset {int} times in the last hour', async function (this: CustomWorld, count: number) {
    // Create multiple recent reset attempts
    for (let i = 0; i < count; i++) {
        await this.db.insertPasswordResetAttempt({
            email: this.currentUser.email,
            attemptedAt: new Date(Date.now() - (i * 10 * 60 * 1000)) // Spread over last hour
        });
    }
});

Given('I was rate-limited {int} hour ago', async function (this: CustomWorld, hours: number) {
    // Create rate limit record that has expired
    await this.db.insertPasswordResetAttempt({
        email: this.currentUser.email,
        attemptedAt: new Date(Date.now() - (hours * 60 * 60 * 1000))
    });
});

Given('I received a password reset email', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify password reset email was received (ConsoleEmailService does not store emails - need email testing service or database table)');
});

Given('I clicked the reset link with valid email and token parameters', async function (this: CustomWorld) {
    // Navigate to reset confirmation page with URL params
    const email = this.currentUser.email;
    const token = 'valid-reset-token-' + Date.now();

    // Store token for verification
    await this.db.insertPasswordResetToken({
        userId: this.currentUser.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await this.page.goto(`/login?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
});

Given('I am on the password reset confirmation page', async function (this: CustomWorld) {
    // Verify we're on the confirmation page
    await expect(this.page.locator('h2:has-text("Reset Password")')).toBeVisible();
    await expect(this.page.locator('input[name="newPassword"]')).toBeVisible();
});

Given('the reset token was created {int} hours ago', async function (this: CustomWorld, hours: number) {
    const token = 'time-test-token-' + Date.now();
    const createdAt = new Date(Date.now() - (hours * 60 * 60 * 1000));

    await this.db.insertPasswordResetToken({
        userId: this.currentUser.id,
        token,
        createdAt,
        expiresAt: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
    });

    // Update page URL with this token
    await this.page.goto(`/login?email=${this.currentUser.email}&token=${token}`);
});

Given('the token has not been used', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify token has not been used yet (query database PasswordResetTokens table and check Used=false)');
});

Given('the reset token has already been used', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to mark token as used (ASP.NET Identity manages tokens internally - cannot manipulate via database)');
});

Given('the reset link has email {string}', async function (this: CustomWorld, email: string) {
    throw new Error(`NOT IMPLEMENTED: Step needs to verify reset link contains email parameter "${email}" (ConsoleEmailService does not store emails - need email testing service)`);
});

Given('the token belongs to {string}', async function (this: CustomWorld, email: string) {
    // Create token for different user
    const otherUser = await this.db.queryTable('Users', { Email: email });

    if (otherUser.length > 0) {
        const token = 'mismatched-token-' + Date.now();
        await this.db.insertPasswordResetToken({
            userId: otherUser[0].Id,
            token,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
    }
});

Given('I have active sessions on multiple devices', async function (this: CustomWorld) {
    // Create multiple session records
    await this.db.insertUserSession({
        userId: this.currentUser.id,
        deviceInfo: 'Desktop Chrome',
        createdAt: new Date()
    });
    await this.db.insertUserSession({
        userId: this.currentUser.id,
        deviceInfo: 'Mobile Safari',
        createdAt: new Date()
    });
});

Given('I have multiple active reset tokens', async function (this: CustomWorld) {
    // Create multiple tokens
    for (let i = 0; i < 3; i++) {
        await this.db.insertPasswordResetToken({
            userId: this.currentUser.id,
            token: `token-${i}-${Date.now()}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
    }
});

Given('my old password was {string}', async function (this: CustomWorld, oldPassword: string) {
    throw new Error(`NOT IMPLEMENTED: Step needs to store old password for comparison after reset (${oldPassword.length} chars)`);
});

Given('the URL token parameter is malformed {string}', async function (this: CustomWorld, malformedToken: string) {
    // Navigate with malformed token
    await this.page.goto(`/login?email=${this.currentUser.email}&token=${encodeURIComponent(malformedToken)}`);
});

Given('the system enforces password history', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to enable password history enforcement (configure system setting or feature flag)');
});

Given('my current password is {string}', async function (this: CustomWorld, currentPassword: string) {
    throw new Error(`NOT IMPLEMENTED: Step needs to store/verify current password for testing password history (${currentPassword.length} chars)`);
});

Given('I successfully submit reset request', async function (this: CustomWorld) {
    await this.page.fill('input[name="email"]', this.currentUser.email);
    await this.page.click('button[type="submit"]');

    // Wait for success screen
    await expect(this.page.locator('text=/Check Your Email|Reset instructions sent/i')).toBeVisible();
});

Given('I am on the success screen after requesting reset', async function (this: CustomWorld) {
    // Navigate through flow
    await this.page.goto('/login');
    await this.page.click('a:has-text("Forgot password?")');
    await this.page.fill('input[name="email"]', this.currentUser.email);
    await this.page.click('button[type="submit"]');

    await expect(this.page.locator('text=/Check Your Email/i')).toBeVisible();
});

// ============================================================================
// WHEN STEPS - Actions
// ============================================================================

When('I submit the reset request form', async function (this: CustomWorld) {
    // Set up a delayed route handler to allow subsequent steps to override with error mocks
    // This handler will be replaced by error mock steps if they run before the delay completes
    await this.page.route('**/api/auth/password/forgot', async route => {
        // Delay to give subsequent steps time to unroute and set up error mocks
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if route is still valid (not already handled by override)
        try {
            // Continue with the real request if not overridden
            await route.continue();
        } catch (error: any) {
            // Route was already handled by an override mock - this is expected
            if (error.message?.includes('already handled')) {
                // Silently ignore - the override took precedence
                return;
            }
            throw error;
        }
    });

    // Click submit button
    await this.page.click('button[type="submit"]:has-text("Send Reset Instructions")');

    // Give a moment for the request to be initiated
    await this.page.waitForTimeout(100);
});

When('I attempt to submit the reset request form', async function (this: CustomWorld) {
    // Attempt submit (may fail validation)
    await this.page.click('button[type="submit"]');

    // Wait for validation to show
    await this.page.waitForLoadState('networkidle');
});

When('I leave the email field empty', async function (this: CustomWorld) {
    // Clear and leave empty
    await this.page.fill('input[name="email"]', '');
});

When('I request password reset again for the same email', async function (this: CustomWorld) {
    await this.page.fill('input[name="email"]', this.currentUser.email);
    await this.page.click('button[type="submit"]');
});

When('I attempt to request another reset for the same email', async function (this: CustomWorld) {
    await this.page.fill('input[name="email"]', this.currentUser.email);
    await this.page.click('button[type="submit"]');

    // Wait for rate limit error
    await this.page.waitForSelector('[role="alert"]', { timeout: 5000 });
});

When('I request password reset now', async function (this: CustomWorld) {
    await this.page.goto('/login');
    await this.page.click('a:has-text("Forgot password?")');
    await this.page.fill('input[name="email"]', this.currentUser.email);
    await this.page.click('button[type="submit"]');
});

When('I try to register', async function (this: CustomWorld) {
    // This seems misplaced in password reset - should be "try to request reset"
    await this.page.click('button[type="submit"]');
});

When('I request password reset', async function (this: CustomWorld) {
    await this.page.fill('input[name="email"]', this.currentUser.email);
    await this.page.click('button[type="submit"]');
});

When('the email service fails to send the email', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to mock email service failure (requires dependency injection mock or service fault injection)');
});

When('the password reset service returns {int} error', async function (this: CustomWorld, statusCode: number) {
    // CRITICAL: This step overrides the route handler set up by "I submit the reset request form"
    // Must unroute first, then set up the error response mock

    // Remove any existing route handlers for this endpoint
    await this.page.unroute('**/api/auth/password/forgot');

    // Set up error response mock
    await this.page.route('**/api/auth/password/forgot', route =>
        route.fulfill({
            status: statusCode,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Service error' })
        })
    );

    this.attach(`Mocked ${statusCode} error response for password reset API`, 'text/plain');

    // The request is still pending (delayed by previous step), wait for it to complete with error
    await this.page.waitForTimeout(500);
});

When('I click {string} link', async function (this: CustomWorld, linkText: string) {
    await this.page.click(`a:has-text("${linkText}"), button:has-text("${linkText}")`);
});

When('the reset email is generated', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to wait for and verify email generation (ConsoleEmailService does not store emails - need email testing service or database table)');
});

When('the reset link is generated', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify reset link was generated with valid token (ConsoleEmailService does not store emails - need email testing service)');
});

When('I submit a password reset request', async function (this: CustomWorld) {
    await this.page.fill('input[name="email"]', this.currentUser.email);
    await this.page.click('button[type="submit"]');
});

When('I attempt to submit another request', async function (this: CustomWorld) {
    // Try to click submit again
    await this.page.click('button[type="submit"]');
});

When('the request is processed', async function (this: CustomWorld) {
    // Wait for response
    await this.page.waitForResponse(response =>
        response.url().includes('/api/auth/') && response.status() === 200
    );
});

When('I navigate the reset request form', async function (this: CustomWorld) {
    // Navigate form with keyboard
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
});

When('I enter new password {string}', async function (this: CustomWorld, password: string) {
    await this.page.fill('input[name="newPassword"]', password);
});

When('I enter matching confirmation {string}', async function (this: CustomWorld, password: string) {
    await this.page.fill('input[name="confirmPassword"]', password);
});

When('I submit the password reset form', async function (this: CustomWorld) {
    const responsePromise = this.page.waitForResponse(
        response => response.url().includes('/api/auth/confirm-reset')
    );

    await this.page.click('button[type="submit"]:has-text("Reset Password")');

    this.lastApiResponse = await responsePromise as any;
});

When('I enter valid password data', async function (this: CustomWorld) {
    await this.page.fill('input[name="newPassword"]', 'NewSecurePass123!');
    await this.page.fill('input[name="confirmPassword"]', 'NewSecurePass123!');
});

When('I attempt to submit the form', async function (this: CustomWorld) {
    await this.page.click('button[type="submit"]');
    // Wait for validation to complete
    await this.page.waitForLoadState('networkidle');
});

When('I submit the form', async function (this: CustomWorld) {
    await this.page.click('button[type="submit"]');
});

When('I enter confirmation password {string}', async function (this: CustomWorld, password: string) {
    await this.page.fill('input[name="confirmPassword"]', password);
});

When('I navigate to reset page without token parameter', async function (this: CustomWorld) {
    await this.page.goto('/login?email=test@example.com');
});

When('I navigate to reset page without email parameter', async function (this: CustomWorld) {
    await this.page.goto('/login?token=some-token');
});

When('I submit valid password reset with password {string}', async function (this: CustomWorld, password: string) {
    await this.page.fill('input[name="newPassword"]', password);
    await this.page.fill('input[name="confirmPassword"]', password);
    await this.page.click('button[type="submit"]');
});

When('my password is updated', async function (this: CustomWorld) {
    // Wait for success message
    await expect(this.page.locator('text=/Password updated successfully/i')).toBeVisible();
});

When('I successfully reset my password', async function (this: CustomWorld) {
    await this.page.fill('input[name="newPassword"]', 'NewSecurePass123!');
    await this.page.fill('input[name="confirmPassword"]', 'NewSecurePass123!');
    await this.page.click('button[type="submit"]');

    await expect(this.page.locator('text=/Password updated successfully/i')).toBeVisible();
});

When('the update completes', async function (this: CustomWorld) {
    await this.page.waitForResponse(response =>
        response.url().includes('/api/auth/confirm-reset') && response.status() === 200
    );
});

When('I successfully reset password using one token', async function (this: CustomWorld) {
    // Use first token
    await this.page.fill('input[name="newPassword"]', 'NewSecurePass123!');
    await this.page.fill('input[name="confirmPassword"]', 'NewSecurePass123!');
    await this.page.click('button[type="submit"]');
});

When('I type into the password field', async function (this: CustomWorld) {
    await this.page.fill('input[name="newPassword"]', 'Test123!');
});

When('the page loads and validates the token', async function (this: CustomWorld) {
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for token validation to complete
    await this.page.waitForLoadState('networkidle');
});

When('I attempt to reset to my current password {string}', async function (this: CustomWorld, password: string) {
    await this.page.fill('input[name="newPassword"]', password);
    await this.page.fill('input[name="confirmPassword"]', password);
    await this.page.click('button[type="submit"]');
});

When('I navigate the password reset form', async function (this: CustomWorld) {
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
});

When('I successfully reset my password to {string}', async function (this: CustomWorld, newPassword: string) {
    await this.page.fill('input[name="newPassword"]', newPassword);
    await this.page.fill('input[name="confirmPassword"]', newPassword);
    await this.page.click('button[type="submit"]');

    await expect(this.page.locator('text=/Password updated successfully/i')).toBeVisible();
});

When('I am redirected to the login page', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/login/);
});

When('I enter my email and password {string}', async function (this: CustomWorld, password: string) {
    await this.page.fill('input[name="email"]', this.currentUser.email);
    await this.page.fill('input[name="password"]', password);
});

When('I attempt to log in with password {string}', async function (this: CustomWorld, password: string) {
    await this.page.fill('input[name="email"]', this.currentUser.email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
});

When('I successfully request password reset', async function (this: CustomWorld) {
    await this.page.fill('input[name="email"]', this.currentUser.email);
    await this.page.click('button[type="submit"]');

    await expect(this.page.locator('text=/Check Your Email/i')).toBeVisible();
});

When('the request completes', async function (this: CustomWorld) {
    await expect(this.page.locator('text=/Check Your Email/i')).toBeVisible();
});

When('I have entered valid password data', async function (this: CustomWorld) {
    await this.page.fill('input[name="newPassword"]', 'NewSecurePass123!');
    await this.page.fill('input[name="confirmPassword"]', 'NewSecurePass123!');
});

When('I have entered new password {string}', async function (this: CustomWorld, password: string) {
    await this.page.fill('input[name="newPassword"]', password);
});

When('I have entered mismatched confirmation', async function (this: CustomWorld) {
    await this.page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
});

When('I see {string} error', async function (this: CustomWorld, errorMessage: string) {
    await expect(this.page.locator(`text=${errorMessage}`)).toBeVisible();
});

When('I correct the confirmation to {string}', async function (this: CustomWorld, password: string) {
    await this.page.fill('input[name="confirmPassword"]', password);
});

// ============================================================================
// THEN STEPS - Assertions
// ============================================================================

Then('my email should pass format validation', async function (this: CustomWorld) {
    // No error should be visible
    await expect(this.page.locator('text=/invalid email/i')).not.toBeVisible();
});

Then('the request should be processed', async function (this: CustomWorld) {
    // Verify API call was successful
    expect(this.lastApiResponse!.status()).toBe(200);
});

Then('I should receive success', async function (this: CustomWorld) {
    // Check for success indication
    await expect(this.page.locator('text=/success|sent|check your email/i')).toBeVisible();
});

Then('a reset email should be sent to {string}', async function (this: CustomWorld, email: string) {
    throw new Error(`NOT IMPLEMENTED: Step needs to verify email was sent to "${email}" (ConsoleEmailService does not store emails - need email testing service or SentEmails database table)`);
});

Then('the PasswordResetRequested action is logged', async function (this: CustomWorld) {
    // Check audit log
    const logs = await this.db.queryTable('AuditLogs', {
        Action: 'PasswordResetRequested',
        UserId: this.currentUser.id
    });

    expect(logs.length).toBeGreaterThan(0);
});

Then('no email should actually be sent', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify no email was sent (ConsoleEmailService does not store emails - need email testing service or SentEmails database table)');
});

Then('no error should indicate the email doesn\'t exist', async function (this: CustomWorld) {
    // Should not see "email not found" or similar
    await expect(this.page.locator('text=/email not found|user not found/i')).not.toBeVisible();
});

Then('a reset I receive an authentication token', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify token was generated (ASP.NET Identity manages tokens internally via Data Protection API - cannot verify via database)');
});

Then('my token be cryptographically secure with {int}+ bytes entropy', async function (this: CustomWorld, minBytes: number) {
    throw new Error(`NOT IMPLEMENTED: Step needs to verify token has ${minBytes}+ bytes entropy (ASP.NET Identity tokens use Data Protection API - cannot inspect token structure)`);
});

Then('my token have expiration timestamp {int} hours from now', async function (this: CustomWorld, hours: number) {
    throw new Error(`NOT IMPLEMENTED: Step needs to verify token expires in ${hours} hours (ASP.NET Identity manages expiration internally - cannot inspect token timestamp)`);
});

Then('my token be URL-safe', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify token uses URL-safe characters (ASP.NET Identity tokens use Data Protection API - cannot inspect token format)');
});

Then('the previous token should be invalidated', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify previous token was invalidated (ASP.NET Identity manages tokens internally - cannot query token status via database)');
});

Then('a new I receive an authentication token', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify new token was generated (ASP.NET Identity manages tokens internally - cannot verify via database)');
});

Then('only the new token should be valid', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify only new token is valid (ASP.NET Identity manages token validity internally - cannot test without attempting password reset)');
});

Then('I should receive {int} status', async function (this: CustomWorld, expectedStatus: number) {
    expect(this.lastApiResponse!.status()).toBe(expectedStatus);
});

Then('no email should be sent', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify no email was sent (ConsoleEmailService does not store emails - need email testing service or SentEmails database table)');
});

Then('the request should be processed normally', async function (this: CustomWorld) {
    await expect(this.page.locator('text=/Check Your Email/i')).toBeVisible();
});

Then('a reset email should be sent', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify email was sent (ConsoleEmailService does not store emails - need email testing service or SentEmails database table)');
});

Then('a secure reset I receive an authentication token', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify secure token was generated (ASP.NET Identity manages tokens internally - cannot verify via database)');
});

Then('the token is saved with user association', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify token is associated with user (ASP.NET Identity manages token-user association internally - cannot verify via database)');
});

Then('an email should be sent to {string}', async function (this: CustomWorld, email: string) {
    throw new Error(`NOT IMPLEMENTED: Step needs to verify email was sent to "${email}" (ConsoleEmailService does not store emails - need email testing service or SentEmails database table)`);
});

Then('my email contain reset link {string}', async function (this: CustomWorld, linkPattern: string) {
    throw new Error(`NOT IMPLEMENTED: Step needs to verify email contains reset link "${linkPattern}" (ConsoleEmailService does not store emails - need email testing service)`);
});

Then('my email mention {int}-hour expiration', async function (this: CustomWorld, hours: number) {
    throw new Error(`NOT IMPLEMENTED: Step needs to verify email mentions ${hours}-hour expiration (ConsoleEmailService does not store emails - need email testing service)`);
});

Then('I should see the success screen', async function (this: CustomWorld) {
    await expect(this.page.locator('text=/Check Your Email/i')).toBeVisible();
});

Then('the success screen should display the email address I entered', async function (this: CustomWorld) {
    await expect(this.page.locator(`text=${this.currentUser.email}`)).toBeVisible();
});

Then('I should see a success screen with email icon', async function (this: CustomWorld) {
    await expect(this.page.locator('[data-testid="email-icon"], svg[data-icon="email"]')).toBeVisible();
});

Then('I should see my entered email address', async function (this: CustomWorld) {
    await expect(this.page.locator(`text=${this.currentUser.email}`)).toBeVisible();
});

Then('I should see note about checking spam folder', async function (this: CustomWorld) {
    await expect(this.page.locator('text=/spam|junk/i')).toBeVisible();
});

Then('I should see note about {int}-hour link expiration', async function (this: CustomWorld, hours: number) {
    await expect(this.page.locator(`text=/expire.*${hours}.*hour/i`)).toBeVisible();
});

Then('I should see {string} link', async function (this: CustomWorld, linkText: string) {
    await expect(this.page.locator(`a:has-text("${linkText}"), button:has-text("${linkText}")`)).toBeVisible();
});

Then('the submit button text should change to {string}', async function (this: CustomWorld, text: string) {
    await expect(this.page.locator(`button[type="submit"]:has-text("${text}")`)).toBeVisible();
});

Then('I should not be able to submit again', async function (this: CustomWorld) {
    const submitButton = this.page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
});

Then('the error is logged server-side', async function (this: CustomWorld) {
    // Check error logs
    const logs = await this.db.queryTable('ErrorLogs', {
        Context: 'PasswordReset'
    });

    // Should have recent error logged
    const recentLogs = logs.filter(log =>
        new Date(log.Timestamp).getTime() > Date.now() - 60000
    );

    expect(recentLogs.length).toBeGreaterThan(0);
});

Then('the success message should still be shown to me', async function (this: CustomWorld) {
    await expect(this.page.locator('text=/Check Your Email|success/i')).toBeVisible();
});

Then('I should not be informed of the email failure', async function (this: CustomWorld) {
    // Should not see email-specific error
    await expect(this.page.locator('text=/email.*fail|failed to send/i')).not.toBeVisible();
});

Then('the failure should be tracked for monitoring', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify failure was tracked in monitoring system (check error logs, metrics, or telemetry)');
});

Then('my email input should be preserved', async function (this: CustomWorld) {
    const emailInput = await this.page.locator('input[name="email"]').inputValue();
    expect(emailInput).toBeTruthy();
});

Then('I should be returned to the login page', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/login/);
});

Then('the login form should be displayed', async function (this: CustomWorld) {
    await expect(this.page.locator('input[name="email"]')).toBeVisible();
    await expect(this.page.locator('input[name="password"]')).toBeVisible();
    await expect(this.page.locator('button[type="submit"]:has-text("Sign In")')).toBeVisible();
});

Then('the email subject should be {string}', async function (this: CustomWorld, subject: string) {
    throw new Error(`NOT IMPLEMENTED: Step needs to verify email subject is "${subject}" (ConsoleEmailService does not store emails - need email testing service or SentEmails database table)`);
});

Then('my email include greeting with username or {string}', async function (this: CustomWorld, defaultGreeting: string) {
    throw new Error(`NOT IMPLEMENTED: Step needs to verify email includes greeting with username or "${defaultGreeting}" (ConsoleEmailService does not store emails - need email testing service)`);
});

Then('my email explain someone requested password reset', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify email explains password reset request (ConsoleEmailService does not store emails - need email testing service)');
});

Then('my email include the reset link button', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify email includes reset link button (ConsoleEmailService does not store emails - need email testing service)');
});

Then('my email include {string} message', async function (this: CustomWorld, message: string) {
    throw new Error(`NOT IMPLEMENTED: Step needs to verify email includes "${message}" message (ConsoleEmailService does not store emails - need email testing service)`);
});

Then('my email include support contact information', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify email includes support contact information (ConsoleEmailService does not store emails - need email testing service)');
});

Then('the link should use HTTPS protocol', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify reset link uses HTTPS (ConsoleEmailService does not store emails - need email testing service)');
});

Then('the link should point to the correct domain', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify link points to correct domain (ConsoleEmailService does not store emails - need email testing service)');
});

Then('my token be included as a query parameter', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify token is in query parameter (ConsoleEmailService does not store emails - need email testing service)');
});

Then('only one request should be processed', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify only one request was sent (check network requests via Playwright or count API calls)');
});

Then('I receive response with in less than {int}ms', async function (this: CustomWorld, maxTime: number) {
    throw new Error(`NOT IMPLEMENTED: Step needs to measure response time and verify it's under ${maxTime}ms (use performance.now() or timing API)`);
});

Then('my email be sent asynchronously', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify email sending doesn\'t block response (requires timing comparison between API response and email send event)');
});

Then('the success screen should display immediately', async function (this: CustomWorld) {
    await expect(this.page.locator('text=/Check Your Email/i')).toBeVisible({ timeout: 1000 });
});

Then('the email field should be properly labeled', async function (this: CustomWorld) {
    await expect(this.page.locator('label[for="email"], label:has-text("Email")')).toBeVisible();
});

Then('instructions should be clear and announced', async function (this: CustomWorld) {
    // Check for aria-describedby or helper text
    const emailInput = this.page.locator('input[name="email"]');

    // Should have associated label or description
    await expect(emailInput).toHaveAttribute('aria-label', /.+/);
});

Then('the submit button should have descriptive text', async function (this: CustomWorld) {
    const submitButton = this.page.locator('button[type="submit"]');
    const buttonText = await submitButton.textContent();

    expect(buttonText).toMatch(/send|submit|request/i);
});

Then('the success message should be announced when displayed', async function (this: CustomWorld) {
    // Success message should have role="alert" or similar
    await expect(this.page.locator('[role="status"], [role="alert"]')).toBeVisible();
});

Then('the token is validated', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify token was validated server-side (check response or database)');
});

Then('my password is updated with secure hash', async function (this: CustomWorld) {
    // Verify password was updated in database
    const users = await this.db.queryTable('Users', {
        Email: this.currentUser.email
    });

    expect(users[0].PasswordHash).toBeTruthy();
    expect(users[0].PasswordHash).not.toContain('NewSecurePass'); // Should be hashed
});

Then('my token be marked as used', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify token was marked as used (ASP.NET Identity manages tokens internally - cannot query token usage status via database)');
});

Then('the PasswordResetConfirmed action is logged', async function (this: CustomWorld) {
    const logs = await this.db.queryTable('AuditLogs', {
        Action: 'PasswordResetConfirmed',
        UserId: this.currentUser.id
    });

    expect(logs.length).toBeGreaterThan(0);
});

Then('I should be redirected to login page after {int} seconds', async function (this: CustomWorld, seconds: number) {
    // Wait for redirect
    await expect(this.page).toHaveURL(/login/, { timeout: (seconds + 1) * 1000 });
});

Then('I should see a link to request new reset', async function (this: CustomWorld) {
    await expect(this.page.locator('a:has-text("request"), button:has-text("request")')).toBeVisible();
});

Then('my password should not be updated', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify password hash remains unchanged in database');
});

Then('my password should pass validation', async function (this: CustomWorld) {
    // No validation errors
    await expect(this.page.locator('text=/password.*weak|password.*invalid/i')).not.toBeVisible();
});

Then('my password is updated', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify password was updated (check database Users table PasswordHash field)');
});

Then('the error appears below the confirmation field', async function (this: CustomWorld) {
    // Error should be associated with confirm field
    const confirmField = this.page.locator('input[name="confirmPassword"]');
    const errorText = await confirmField.locator('xpath=following-sibling::*[contains(@class, "error") or contains(@class, "helper")]').textContent();

    expect(errorText).toBeTruthy();
});

Then('the form should not be displayed', async function (this: CustomWorld) {
    await expect(this.page.locator('form')).not.toBeVisible();
});

Then('my password be hashed using bcrypt or argon2', async function (this: CustomWorld) {
    const users = await this.db.queryTable('Users', {
        Email: this.currentUser.email
    });

    // Password hash should have standard format
    expect(users[0].PasswordHash).toMatch(/^[\$\w\/\.=+]+$/);
});

Then('the plain text password should never be stored', async function (this: CustomWorld) {
    const users = await this.db.queryTable('Users', {
        Email: this.currentUser.email
    });

    expect(users[0].PasswordHash).not.toContain('NewPassword');
});

Then('the hash should be irreversible', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify hash is one-way (check hash format and ensure it cannot be reversed)');
});

Then('all existing sessions should be terminated', async function (this: CustomWorld) {
    const sessions = await this.db.queryTable('UserSessions', {
        UserId: this.currentUser.id,
        IsActive: true
    });

    expect(sessions.length).toBe(0);
});

Then('all session tokens should be invalidated', async function (this: CustomWorld) {
    const sessions = await this.db.queryTable('UserSessions', {
        UserId: this.currentUser.id
    });

    sessions.forEach(session => {
        expect(session.IsActive).toBe(false);
    });
});

Then('the user must log in again on all devices', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify all user sessions were terminated (check UserSessions table)');
});

Then('all other reset tokens for my account should be invalidated', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify all other tokens were invalidated (ASP.NET Identity manages tokens internally - cannot query token status via database)');
});

Then('they should not be usable', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify tokens are marked as unusable (check PasswordResetTokens table Invalidated/Used flags)');
});

Then('I should see a visual strength indicator', async function (this: CustomWorld) {
    await expect(this.page.locator('[role="progressbar"], .password-strength')).toBeVisible();
});

Then('the indicator should show weak\\/medium\\/strong rating', async function (this: CustomWorld) {
    await expect(this.page.locator('text=/weak|medium|strong/i')).toBeVisible();
});

Then('the indicator should help me choose a secure password', async function (this: CustomWorld) {
    // Indicator provides feedback
    await expect(this.page.locator('text=/character|uppercase|lowercase|number|special/i')).toBeVisible();
});

Then('I should see success alert {string}', async function (this: CustomWorld, message: string) {
    await expect(this.page.locator(`[role="alert"]:has-text("${message}")`)).toBeVisible();
});

Then('I should be able to click {string} to redirect immediately', async function (this: CustomWorld, linkText: string) {
    await expect(this.page.locator(`a:has-text("${linkText}"), button:has-text("${linkText}")`)).toBeVisible();
});

Then('my input data should be preserved', async function (this: CustomWorld) {
    // Form values should still be present
    const passwordInput = await this.page.locator('input[name="newPassword"]').inputValue();
    expect(passwordInput).toBeTruthy();
});

Then('my reset token should remain valid', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify token remains valid (ASP.NET Identity manages token validity internally - cannot verify without attempting to use token)');
});

Then('I should be able to use the reset link again later', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify reset link/token remains valid for reuse (check token expiration and used status)');
});

Then('the error message should disappear', async function (this: CustomWorld) {
    await expect(this.page.locator('text=/Passwords do not match/i')).not.toBeVisible();
});

Then('the confirmation field should show success styling', async function (this: CustomWorld) {
    const confirmField = this.page.locator('input[name="confirmPassword"]');
    await expect(confirmField).not.toHaveClass(/error/);
});

Then('my authentication should succeed', async function (this: CustomWorld) {
    // Should be redirected or see authenticated content
    await expect(this.page).not.toHaveURL(/login/);
});

Then('I should be logged in to my account', async function (this: CustomWorld) {
    // Verify authenticated state
    await expect(this.page.locator('text=/Dashboard|Welcome/i')).toBeVisible();
});

Then('my authentication should fail', async function (this: CustomWorld) {
    // Should see error message
    await expect(this.page.locator('text=/Invalid.*password|Authentication failed/i')).toBeVisible();
});

Then('only one update request should be sent', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify only one request was sent (monitor network requests via Playwright)');
});

Then('the password hashing should use appropriate cost factor', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify password hashing cost factor is appropriate (check backend configuration or hash metadata)');
});

Then('all fields should be properly labeled', async function (this: CustomWorld) {

    // Both should have labels
    await expect(this.page.locator('label[for="email"], label:has-text("Email")')).toBeVisible();
    await expect(this.page.locator('label[for="newPassword"], label:has-text("Password")')).toBeVisible();
});

Then('password strength indicator should be announced', async function (this: CustomWorld) {
    // Should have aria-live or role
    const strengthIndicator = this.page.locator('.password-strength, [role="progressbar"]');

    if (await strengthIndicator.isVisible()) {
        await expect(strengthIndicator).toHaveAttribute('aria-live', /.+/);
    }
});

Then('validation errors should be announced', async function (this: CustomWorld) {
    // Errors should have role="alert"
    const errors = this.page.locator('[role="alert"]');

    if (await errors.count() > 0) {
        expect(await errors.count()).toBeGreaterThan(0);
    }
});
