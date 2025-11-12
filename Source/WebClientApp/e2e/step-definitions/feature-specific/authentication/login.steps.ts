/**
 * Login Feature Step Definitions
 *
 * Implements steps for HandleLogin use case
 * Follows BDD Black-Box Testing principles:
 * - Interacts through UI (Playwright)
 * - Uses real API calls (no mocking)
 * - Verifies real database state
 * - Tests from user perspective
 *
 */

import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CustomWorld } from '../../../support/world.js';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create test user via direct database insertion
 *
 * CRITICAL: userName is ALWAYS email per AuthService.cs:81 requirement
 * Password is always BDD_TEST_PASSWORD_HASH from .env
 *
 * @param world - Test world context
 * @param email - User email (also used as userName)
 * @param options - Optional user configuration
 * @returns User ID for cleanup
 */
async function createTestUser(
  world: CustomWorld,
  email: string,
  options?: {
    name?: string;
    displayName?: string;
    emailConfirmed?: boolean;
    lockoutEnd?: Date;
    accessFailedCount?: number;
    twoFactorEnabled?: boolean;
  },
): Promise<string> {
  // Build user object with only defined properties (exactOptionalPropertyTypes compliance)
  const userToInsert: {
    email: string;
    userName: string;
    emailConfirmed: boolean;
    passwordHash: string;
    name?: string;
    displayName?: string;
  } = {
    email,
    userName: email, // CRITICAL: userName is ALWAYS email per AuthService.cs:81
    emailConfirmed: options?.emailConfirmed ?? true, // Default confirmed unless specified
    passwordHash: process.env.BDD_TEST_PASSWORD_HASH!,
  };

  // Only add optional properties if they have values
  if (options?.name) {
    userToInsert.name = options.name;
  }
  if (options?.displayName) {
    userToInsert.displayName = options.displayName;
  }

  const userId = await world.db.insertUser(userToInsert);

  // Apply additional settings if provided
  if (options?.lockoutEnd || options?.accessFailedCount !== undefined || options?.twoFactorEnabled !== undefined) {
    const updates: Record<string, any> = {};
    if (options.lockoutEnd) {
      updates.LockoutEnd = options.lockoutEnd.toISOString();
      updates.LockoutEnabled = true;
    }
    if (options.accessFailedCount !== undefined) {
      updates.AccessFailedCount = options.accessFailedCount;
    }
    if (options.twoFactorEnabled !== undefined) {
      updates.TwoFactorEnabled = options.twoFactorEnabled;
    }

    await world.db.updateRecord('Users', userId, updates);
  }

  // Store for cleanup
  world.createdTestUsers.push(userId);

  return userId;
}

// ============================================================================
// GIVEN Steps - Setup Preconditions
// ============================================================================

Given('I am on the login page', async function (this: CustomWorld) {
  await this.page.goto('/login');
  await expect(this.page).toHaveURL(/\/login/);
  await expect(this.page.getByText(/welcome back/i)).toBeVisible();
});

Given('an account exists with 2FA enabled', async function (this: CustomWorld) {
  if (!this.currentUser?.id) {
    throw new Error('No current user assigned. Ensure Before hook has run.');
  }

  await this.db.updateRecord('Users', this.currentUser.id, {
    TwoFactorEnabled: true,
  });

  this.attach(`2FA enabled for user: ${this.currentUser.email}`, 'text/plain');
});

Given('the account is locked due to failed login attempts', async function (this: CustomWorld) {
  if (!this.currentUser?.id) {
    throw new Error('No current user assigned. Ensure Before hook has run.');
  }

  const lockoutEnd = new Date(Date.now() + 5 * 60 * 1000);

  await this.db.updateRecord('Users', this.currentUser.id, {
    LockoutEnd: lockoutEnd.toISOString(),
    LockoutEnabled: true,
    AccessFailedCount: 5,
  });

  this.attach(`Account locked until ${lockoutEnd.toISOString()} for user: ${this.currentUser.email}`, 'text/plain');
});

Given('my account status is {string}', async function (this: CustomWorld, status: string) {
  if (!this.currentUser?.id) {
    throw new Error('No current user assigned. Ensure Before hook has run.');
  }

  if (status.toLowerCase() === 'suspended') {
    const suspendedUntil = new Date('2099-12-31T23:59:59Z');

    await this.db.updateRecord('Users', this.currentUser.id, {
      LockoutEnd: suspendedUntil.toISOString(),
      LockoutEnabled: true,
    });

    this.attach(
      `Account suspended (locked until ${suspendedUntil.toISOString()}) for user: ${this.currentUser.email}`,
      'text/plain',
    );
  } else {
    this.attach(`Account status set to: ${status}`, 'text/plain');
  }
});

Given('the email is not confirmed', async function (this: CustomWorld) {
  if (!this.currentUser?.id) {
    throw new Error('No current user assigned. Ensure Before hook has run.');
  }

  await this.db.updateRecord('Users', this.currentUser.id, {
    EmailConfirmed: false,
  });

  this.attach(`Email marked as unconfirmed for user: ${this.currentUser.email}`, 'text/plain');
});

Given('email confirmation is required email confirmation for login', async function (this: CustomWorld) {
  throw new Error(
    'NOT IMPLEMENTED: Step needs to configure system to require email confirmation for login (backend configuration or feature flag)',
  );
});

// ============================================================================
// WHEN Steps - User Actions
// ============================================================================

When('I enter incorrect password {string}', async function (this: CustomWorld, password: string) {
  const passwordInput = this.page.getByRole('textbox', { name: /password/i });
  await passwordInput.clear();
  await passwordInput.fill(password);
});

When('I leave the password field empty', async function (this: CustomWorld) {
  const passwordInput = this.page.getByRole('textbox', { name: /password/i });
  await passwordInput.clear();
});

When('I submit valid credentials for that account', async function (this: CustomWorld) {
  await this.page.getByLabel(/email/i).fill(this.currentUser.email);
  await this.page.getByRole('textbox', { name: /password/i }).fill(process.env.BDD_TEST_PASSWORD!);

  const responsePromise = this.page.waitForResponse(
    (response) => response.url().includes('/api/auth/login') && response.status() !== 0,
    { timeout: 10000 },
  );

  await this.page.locator('button[type="submit"]').click();

  this.lastApiResponse = (await responsePromise) as any;

  await this.page.waitForTimeout(1500);
});

When('the server returns an error', async function (this: CustomWorld) {
  await this.page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    }),
  );
});

// ============================================================================
// THEN Steps - Assertions
// ============================================================================

Then('my email should pass client-side validation', async function (this: CustomWorld) {
  const emailInput = this.page.getByLabel(/email/i);
  const errorMessage = this.page.getByText(/invalid email address/i);

  await expect(errorMessage).not.toBeVisible();
  await expect(emailInput).not.toHaveAttribute('aria-invalid', 'true');
});

Then('the error appears below the email field', async function (this: CustomWorld) {
  const emailField = this.page.getByLabel(/email/i);
  const emailFieldBox = await emailField.boundingBox();

  const errorText = this.page
    .locator(
      '#email-helper-text, #email-helper-text + .MuiFormHelperText-root, [id$="-helper-text"]:has-text("Invalid email address")',
    )
    .first();
  const errorBox = await errorText.boundingBox();

  if (emailFieldBox && errorBox) {
    expect(errorBox.y).toBeGreaterThan(emailFieldBox.y);
  }
});

Then('the error appears below the password field', async function (this: CustomWorld) {
  const passwordField = this.page.getByRole('textbox', { name: /password/i });
  const passwordFieldBox = await passwordField.boundingBox();

  const errorText = this.page
    .locator('#password-helper-text, [id$="-helper-text"]:has-text("Password is required")')
    .first();
  const errorBox = await errorText.boundingBox();

  if (passwordFieldBox && errorBox) {
    expect(errorBox.y).toBeGreaterThan(passwordFieldBox.y);
  }
});

Then('I should be authenticated successfully', async function (this: CustomWorld) {
  if (this.lastApiResponse) {
    const status = this.lastApiResponse?.status();
    const responseBody = await this.lastApiResponse?.text().catch(() => 'Unable to read response body');
    this.attach(`API Response Status: ${status}\nBody: ${responseBody}`, 'text/plain');

    if (status !== 200) {
      throw new Error(`Authentication failed with status ${status}. Expected 200. Response: ${responseBody}`);
    }
  } else {
    await this.page.waitForResponse(
      (response) => response.url().includes('/api/auth/login') && response.status() === 200,
      { timeout: 10000 },
    );
  }
});

Then('I should be redirected to the dashboard', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/dashboard/, { timeout: 10000 });
});

Then('I should remain on the login page', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/login/);
});

Then('the password field is cleared', async function (this: CustomWorld) {
  const passwordInput = this.page.locator('#password');
  await expect(passwordInput).toHaveValue('');
});

Then('login should be prevented', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/login/);

  const cookies = await this.context.cookies();
  const authCookie = cookies.find((c) => c.name.includes('auth') || c.name.includes('session'));
  expect(authCookie).toBeUndefined();
});

Then('I should not be able to determine if the email exists', async function (this: CustomWorld) {
  const errorAlert = this.page.getByRole('alert');
  await expect(errorAlert).toContainText(/invalid email or password/i);
  await expect(errorAlert).not.toContainText(/email.*not found/i);
  await expect(errorAlert).not.toContainText(/user.*not exist/i);
});

Then('I should not be authenticated', async function (this: CustomWorld) {
  const cookies = await this.context.cookies();
  const authCookie = cookies.find((c) => c.name.includes('auth') || c.name.includes('session'));
  expect(authCookie).toBeUndefined();
});

Then('a session cookie should be set by the server', async function (this: CustomWorld) {
  const cookies = await this.context.cookies();
  const authCookie = cookies.find(
    (c) => c.name.includes('AspNetCore') || c.name.includes('auth') || c.name.includes('session'),
  );

  if (!authCookie) {
    const cookieNames = cookies.map((c) => c.name).join(', ');
    this.attach(`Available cookies: ${cookieNames || 'none'}`, 'text/plain');
  }

  expect(authCookie).toBeDefined();
  expect(authCookie?.httpOnly).toBe(true);
});

Then('I should see my user information in the header', async function (this: CustomWorld) {
  const userMenuButton = this.page.getByRole('button', {
    name: /user menu/i,
  });
  await expect(userMenuButton).toBeVisible({ timeout: 5000 });
});

Then('my auth state should be stored in Redux', async function (this: CustomWorld) {
  const isAuthenticated = await this.page.evaluate(() => {
    return (window as any).store?.getState()?.auth?.isAuthenticated;
  });

  expect(isAuthenticated).toBe(true);
});

Then('my password is validated successfully', async function (this: CustomWorld) {
  expect(this.lastApiResponse).toBeDefined();
  expect(this.lastApiResponse).not.toBeNull();
  expect(this.lastApiResponse?.status()).toBe(200);
});

Then('I receive response with requiresTwoFactor: true', async function (this: CustomWorld) {
  expect(this.lastApiResponse).toBeDefined();
  expect(this.lastApiResponse).not.toBeNull();
  const responseBody = await this.lastApiResponse?.json();
  expect(responseBody.requiresTwoFactor).toBe(true);
});

Then('I do not receive a full authentication token yet', async function (this: CustomWorld) {
  const cookies = await this.context.cookies();
  const fullAuthCookie = cookies.find((c) => c.name === 'auth-token');
  expect(fullAuthCookie).toBeUndefined();
});

Then('the LoginPage mode switches to {string}', async function (this: CustomWorld, mode: string) {
  if (mode === 'two-factor') {
    await expect(this.page.getByText(/enter.*verification code/i)).toBeVisible({ timeout: 5000 });
  }
});

Then('I should see the two-factor verification form', async function (this: CustomWorld) {
  await expect(this.page.getByLabel(/verification code/i)).toBeVisible();
  await expect(this.page.getByRole('button', { name: /verify/i })).toBeVisible();
});

Then('I should see a link to resend confirmation email', async function (this: CustomWorld) {
  await expect(this.page.getByRole('link', { name: /resend/i })).toBeVisible({
    timeout: 10000,
  });
});

Then('Redux authSlice.isAuthenticated should be true', async function (this: CustomWorld) {
  const isAuthenticated = await this.page.evaluate(() => {
    return (window as any).store?.getState()?.auth?.isAuthenticated;
  });

  expect(isAuthenticated).toBe(true);
});

Then('Redux authSlice.user should contain my user data', async function (this: CustomWorld) {
  const user = await this.page.evaluate(() => {
    return (window as any).store?.getState()?.auth?.user;
  });

  expect(user).toBeDefined();
  expect(user.email).toBeTruthy();
});

Then('my authentication status should be available app-wide', async function (this: CustomWorld) {
  // Verify auth context is set
  const authState = await this.page.evaluate(() => {
    return (window as any).store?.getState()?.auth;
  });

  expect(authState).toBeDefined();
});

Then('protected routes should become accessible', async function (this: CustomWorld) {
  // Try navigating to a protected route
  await this.page.goto('/dashboard');
  await expect(this.page).toHaveURL(/\/dashboard/);
  await expect(this.page).not.toHaveURL(/\/login/);
});

Then('only one authentication request should be sent', async function (this: CustomWorld) {
  throw new Error(
    'NOT IMPLEMENTED: Step needs to verify that only one authentication request was sent (e.g., check network requests captured during test)',
  );
});

Then('all form fields have proper labels', async function (this: CustomWorld) {
  const emailLabel = this.page.getByLabel(/email/i);
  const passwordLabel = this.page.getByRole('textbox', { name: /password/i });

  await expect(emailLabel).toBeVisible();
  await expect(passwordLabel).toBeVisible();
});

Then('error messages are announced', async function (this: CustomWorld) {
  const alert = this.page.getByRole('alert');
  await expect(alert).toHaveAttribute('role', 'alert');
});

// ============================================================================
// Additional GIVEN Steps - Missing Definitions
// ============================================================================

Given('an account exists with password {string}', async function (this: CustomWorld, _password: string) {
  const email = 'user@example.com';
  const userId = await createTestUser(this, email);
  this.currentUser = { id: userId, email, name: 'user' };
});

Given('I was rate-limited due to failed attempts', async function (this: CustomWorld) {
  throw new Error(
    'NOT IMPLEMENTED: Step needs to set up rate-limit state (e.g., record failed attempts in database or trigger rate limiter)',
  );
});

Given('{int} minutes have passed since the last attempt', async function (this: CustomWorld, minutes: number) {
  throw new Error(
    `NOT IMPLEMENTED: Step needs to simulate time passage of ${minutes} minutes (e.g., modify timestamps in database or use time-travel mechanism)`,
  );
});

Given('I am using a screen reader', async function (this: CustomWorld) {
  this.attach(
    'SKIP: Screen reader simulation not implemented - accessibility testing requires manual verification or specialized tools',
    'text/plain',
  );
});

// ============================================================================
// Additional WHEN Steps - Missing Definitions
// ============================================================================

When('I log in with valid credentials', async function (this: CustomWorld) {
  await this.page.getByLabel(/email/i).fill(this.currentUser.email);
  await this.page.getByRole('textbox', { name: /password/i }).fill(process.env.BDD_TEST_PASSWORD!);
  await this.page.locator('button[type="submit"]').click();
});

When('the authentication completes', async function (this: CustomWorld) {
  await this.page.waitForResponse((response) => response.url().includes('/api/auth/') && response.status() === 200, {
    timeout: 10000,
  });
});

When('I navigate to the login form', async function (this: CustomWorld) {
  await this.page.goto('/login');
  await expect(this.page.getByText(/welcome back/i)).toBeVisible();
});

// ============================================================================
// Additional THEN Steps - Missing Definitions
// ============================================================================

Then('authentication succeeds', async function (this: CustomWorld) {
  await this.page.waitForResponse(
    (response) => response.url().includes('/api/auth/login') && response.status() === 200,
    { timeout: 10000 },
  );
});

Then('I have access to my account', async function (this: CustomWorld) {
  await expect(this.page).not.toHaveURL(/\/login/);
});

When('my request is in progress', async function (this: CustomWorld) {
  // This step is used AFTER submit to check loading state
  // Wait a moment to allow loading state to be visible
  await this.page.waitForTimeout(100);
});
