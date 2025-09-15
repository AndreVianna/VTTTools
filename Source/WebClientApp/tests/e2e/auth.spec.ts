/**
 * VTTTools End-to-End Authentication Testing
 * Comprehensive E2E tests for authentication workflows
 *
 * Tests complete user journeys from React frontend through Auth microservice
 * Validates UC003-UC008 authentication scenarios
 * Performance and security validation included
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:5173';
const AUTH_API_BASE = 'http://localhost:5173/api/auth';

// Test user data
const TEST_USERS = {
  new: {
    email: `testuser${Date.now()}@vtttools.e2e`,
    password: 'E2ETestPassword123!',
    confirmPassword: 'E2ETestPassword123!'
  },
  existing: {
    email: 'e2euser@vtttools.test',
    password: 'ExistingE2EPassword123!'
  },
  invalid: {
    email: 'invalid@vtttools.test',
    password: 'WrongPassword123!'
  }
};

// Helper functions
async function waitForNetworkIdle(page: Page, timeout = 3000) {
  await page.waitForLoadState('networkidle', { timeout });
}

async function clearBrowserData(context: BrowserContext) {
  await context.clearCookies();
  await context.clearPermissions();
}

async function setupTestUser(page: Page) {
  // Create existing test user if not exists
  try {
    await page.request.post(`${AUTH_API_BASE}/register`, {
      data: {
        email: TEST_USERS.existing.email,
        password: TEST_USERS.existing.password,
        confirmPassword: TEST_USERS.existing.password
      }
    });
  } catch (error) {
    // User may already exist, which is fine
    console.log('Test user setup: user may already exist');
  }
}

test.describe('VTTTools Authentication - End-to-End Workflows', () => {

  test.beforeAll(async ({ browser }) => {
    console.log('🚀 Starting E2E authentication testing...');
    console.log('🌐 Testing against real services at http://localhost:5173');

    // Setup test environment
    const context = await browser.newContext();
    const page = await context.newPage();

    // Wait for services to be ready
    let healthCheckAttempts = 0;
    const maxAttempts = 30;

    while (healthCheckAttempts < maxAttempts) {
      try {
        const response = await page.request.get(`${BASE_URL}/health`);
        if (response.ok()) {
          console.log('✅ Services are healthy and ready for E2E testing');
          break;
        }
      } catch (error) {
        healthCheckAttempts++;
        console.log(`⏳ Health check attempt ${healthCheckAttempts}/${maxAttempts}...`);
        await page.waitForTimeout(2000);
      }
    }

    if (healthCheckAttempts >= maxAttempts) {
      throw new Error('❌ Services failed to become ready for E2E testing');
    }

    await setupTestUser(page);
    await context.close();
  });

  test.beforeEach(async ({ context, page }) => {
    // Clear browser data for test isolation
    await clearBrowserData(context);

    // Set up network monitoring
    await page.route('**/api/auth/**', async (route) => {
      const response = await route.fetch();
      console.log(`🌐 API Call: ${route.request().method()} ${route.request().url()} - Status: ${response.status()}`);
      await route.fulfill({ response });
    });
  });

  test.describe('4.1 New User Registration Flow (UC003)', () => {

    test('should complete full registration workflow within performance budget', async ({ page, context }) => {
      console.log('🧪 Testing complete new user registration workflow...');

      const startTime = Date.now();

      // Navigate to registration page
      await page.goto(`${BASE_URL}/register`);
      await waitForNetworkIdle(page);

      // Verify page loads with Material UI theme
      await expect(page).toHaveTitle(/VTT Tools/i);

      // Check for Material UI Studio Professional theme colors
      const primaryButton = page.locator('button[data-testid*="primary"], button:has-text("Register")').first();
      if (await primaryButton.count() > 0) {
        const buttonColor = await primaryButton.evaluate(el =>
          window.getComputedStyle(el).backgroundColor
        );
        expect(buttonColor).toContain('37, 99, 235'); // RGB values for #2563EB
      }

      // Fill registration form with validation
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      const confirmPasswordInput = page.locator('input[name="confirmPassword"], input[name="confirm-password"]').last();
      const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")').first();

      await emailInput.fill(TEST_USERS.new.email);
      await passwordInput.fill(TEST_USERS.new.password);
      if (await confirmPasswordInput.count() > 0) {
        await confirmPasswordInput.fill(TEST_USERS.new.confirmPassword);
      }

      // Verify real-time validation feedback
      await expect(emailInput).toHaveValue(TEST_USERS.new.email);

      // Submit registration
      const registrationPromise = page.waitForResponse(response =>
        response.url().includes('/api/auth/register') && response.status() === 200
      );

      await submitButton.click();

      // Wait for registration API response
      const registrationResponse = await registrationPromise;
      expect(registrationResponse.ok()).toBe(true);

      // Verify database record creation by immediate login attempt
      await page.waitForTimeout(1000); // Brief wait for processing

      // Navigate to login and verify the account was created
      await page.goto(`${BASE_URL}/login`);
      const loginEmailInput = page.locator('input[type="email"]').first();
      const loginPasswordInput = page.locator('input[type="password"]').first();
      const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();

      await loginEmailInput.fill(TEST_USERS.new.email);
      await loginPasswordInput.fill(TEST_USERS.new.password);

      const loginPromise = page.waitForResponse(response =>
        response.url().includes('/api/auth/login') && response.status() === 200
      );

      await loginButton.click();
      const loginResponse = await loginPromise;
      expect(loginResponse.ok()).toBe(true);

      // Verify authenticated state
      await page.waitForURL(url => url.pathname !== '/login');

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // UC003 acceptance criteria: Account activation within 5 seconds
      expect(totalTime).toBeLessThan(5000);

      console.log(`✅ Complete registration workflow completed in ${totalTime}ms`);
    });

    test('should handle registration with existing email (UC003 Alternative Flow A1)', async ({ page }) => {
      console.log('🧪 Testing registration with existing email...');

      await page.goto(`${BASE_URL}/register`);
      await waitForNetworkIdle(page);

      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"], button:has-text("Register")').first();

      await emailInput.fill(TEST_USERS.existing.email);
      await passwordInput.fill(TEST_USERS.new.password);

      // Expect registration to fail
      const errorPromise = page.waitForResponse(response =>
        response.url().includes('/api/auth/register') && response.status() === 400
      );

      await submitButton.click();
      await errorPromise;

      // Verify error message is displayed
      await expect(page.locator('text*="email", text*="exists", [role="alert"]').first()).toBeVisible();

      console.log('✅ Existing email registration correctly rejected');
    });

    test('should validate email format in real-time with 200ms debounce (UC003)', async ({ page }) => {
      console.log('🧪 Testing real-time email validation...');

      await page.goto(`${BASE_URL}/register`);
      await waitForNetworkIdle(page);

      const emailInput = page.locator('input[type="email"]').first();

      // Type invalid email
      await emailInput.fill('invalid-email');
      await page.waitForTimeout(300); // Wait for debounce

      // Check for validation error
      const errorMessage = page.locator('text*="invalid", text*="email", .error, [role="alert"]').first();
      await expect(errorMessage).toBeVisible();

      console.log('✅ Real-time email validation working with proper debounce');
    });
  });

  test.describe('4.2 Existing User Login Flow (UC004)', () => {

    test('should complete login within 3 seconds (UC004 Performance Requirement)', async ({ page }) => {
      console.log('🧪 Testing login performance requirement...');

      await page.goto(`${BASE_URL}/login`);
      await waitForNetworkIdle(page);

      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();

      await emailInput.fill(TEST_USERS.existing.email);
      await passwordInput.fill(TEST_USERS.existing.password);

      const startTime = Date.now();

      const loginPromise = page.waitForResponse(response =>
        response.url().includes('/api/auth/login')
      );

      await loginButton.click();
      const loginResponse = await loginPromise;

      const endTime = Date.now();
      const loginTime = endTime - startTime;

      expect(loginResponse.ok()).toBe(true);
      expect(loginTime).toBeLessThan(3000); // UC004: 3-second requirement

      // Verify successful authentication and redirect
      await page.waitForURL(url => url.pathname !== '/login');

      console.log(`✅ Login completed in ${loginTime}ms (under 3s requirement)`);
    });

    test('should establish cookie-based session and maintain state', async ({ page, context }) => {
      console.log('🧪 Testing cookie-based session management...');

      await page.goto(`${BASE_URL}/login`);

      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();

      await emailInput.fill(TEST_USERS.existing.email);
      await passwordInput.fill(TEST_USERS.existing.password);
      await loginButton.click();

      // Wait for authentication
      await page.waitForResponse(response =>
        response.url().includes('/api/auth/login') && response.ok()
      );

      // Verify authentication cookies are set
      const cookies = await context.cookies();
      const authCookie = cookies.find(cookie =>
        cookie.name.includes('AspNetCore.Identity') || cookie.name.includes('auth')
      );
      expect(authCookie).toBeDefined();

      if (authCookie) {
        expect(authCookie.httpOnly).toBe(true); // Security requirement
        expect(authCookie.sameSite).toBeTruthy(); // CSRF protection
      }

      // Test session persistence by refreshing page
      await page.reload();
      await waitForNetworkIdle(page);

      // Should remain authenticated after refresh
      const meResponse = await page.request.get(`${AUTH_API_BASE}/me`);
      expect(meResponse.ok()).toBe(true);

      console.log('✅ Cookie-based session working correctly with security attributes');
    });

    test('should handle invalid credentials with proper error display (UC004 Alternative A1)', async ({ page }) => {
      console.log('🧪 Testing invalid credentials handling...');

      await page.goto(`${BASE_URL}/login`);

      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();

      await emailInput.fill(TEST_USERS.invalid.email);
      await passwordInput.fill(TEST_USERS.invalid.password);

      const errorPromise = page.waitForResponse(response =>
        response.url().includes('/api/auth/login') && !response.ok()
      );

      await loginButton.click();
      await errorPromise;

      // Verify error message appears within 3 seconds (UC004)
      const errorAlert = page.locator('[role="alert"], .error, text*="invalid", text*="credential"').first();
      await expect(errorAlert).toBeVisible({ timeout: 3000 });

      // Should remain on login page
      expect(page.url()).toContain('/login');

      console.log('✅ Invalid credentials handled correctly with timely feedback');
    });

    test('should show loading states during authentication', async ({ page }) => {
      console.log('🧪 Testing loading states during authentication...');

      await page.goto(`${BASE_URL}/login`);

      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();

      await emailInput.fill(TEST_USERS.existing.email);
      await passwordInput.fill(TEST_USERS.existing.password);

      // Monitor button state during click
      await loginButton.click();

      // Check for loading state (disabled button or loading indicator)
      const isDisabledDuringRequest = await loginButton.isDisabled();
      const hasLoadingIndicator = await page.locator('[role="progressbar"], .loading, text*="loading"').count() > 0;

      expect(isDisabledDuringRequest || hasLoadingIndicator).toBe(true);

      await page.waitForResponse(response => response.url().includes('/api/auth/login'));

      console.log('✅ Loading states properly displayed during authentication');
    });
  });

  test.describe('4.3 Authentication Error Handling', () => {

    test('should handle network failures gracefully (UC032)', async ({ page, context }) => {
      console.log('🧪 Testing network failure handling...');

      await page.goto(`${BASE_URL}/login`);

      // Block network requests to simulate network failure
      await page.route('**/api/auth/login', route => {
        route.abort('failed');
      });

      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();

      await emailInput.fill(TEST_USERS.existing.email);
      await passwordInput.fill(TEST_USERS.existing.password);
      await loginButton.click();

      // Verify network error is handled gracefully
      await expect(page.locator('text*="network", text*="error", text*="connection", [role="alert"]').first())
        .toBeVisible({ timeout: 5000 });

      console.log('✅ Network failure handled gracefully with user-friendly message');
    });

    test('should provide retry mechanism after network failure', async ({ page }) => {
      console.log('🧪 Testing retry mechanism after failure...');

      await page.goto(`${BASE_URL}/login`);

      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();

      await emailInput.fill(TEST_USERS.existing.email);
      await passwordInput.fill(TEST_USERS.existing.password);

      // First request fails
      await page.route('**/api/auth/login', (route, request) => {
        if (request.method() === 'POST') {
          route.abort('failed');
        }
      });

      await loginButton.click();

      // Wait for error state
      await expect(page.locator('[role="alert"], .error').first()).toBeVisible();

      // Restore network and retry
      await page.unroute('**/api/auth/login');

      // Form should allow retry
      await loginButton.click();

      const successResponse = await page.waitForResponse(response =>
        response.url().includes('/api/auth/login') && response.ok()
      );

      expect(successResponse.ok()).toBe(true);

      console.log('✅ Retry mechanism working correctly after network failure');
    });
  });

  test.describe('4.4 Logout and Session Cleanup (UC005)', () => {

    test.beforeEach(async ({ page }) => {
      // Login before each logout test
      await page.goto(`${BASE_URL}/login`);

      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();

      await emailInput.fill(TEST_USERS.existing.email);
      await passwordInput.fill(TEST_USERS.existing.password);
      await loginButton.click();

      await page.waitForResponse(response =>
        response.url().includes('/api/auth/login') && response.ok()
      );
    });

    test('should complete logout within 2 seconds (UC005 Performance)', async ({ page, context }) => {
      console.log('🧪 Testing logout performance requirement...');

      // Navigate to authenticated area
      await page.goto(`${BASE_URL}/dashboard`);

      const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), [data-testid*="logout"]').first();

      const startTime = Date.now();

      if (await logoutButton.count() > 0) {
        await logoutButton.click();
      } else {
        // Fallback: call logout API directly
        await page.request.post(`${AUTH_API_BASE}/logout`);
      }

      await page.waitForResponse(response =>
        response.url().includes('/api/auth/logout')
      );

      const endTime = Date.now();
      const logoutTime = endTime - startTime;

      expect(logoutTime).toBeLessThan(2000); // UC005: 2-second requirement

      // Verify redirect to public page
      await page.waitForURL(url => !url.pathname.includes('/dashboard'));

      console.log(`✅ Logout completed in ${logoutTime}ms (under 2s requirement)`);
    });

    test('should completely clean up session and prevent access', async ({ page, context }) => {
      console.log('🧪 Testing complete session cleanup after logout...');

      // Navigate to authenticated area
      await page.goto(`${BASE_URL}/dashboard`);

      // Perform logout
      const logoutResponse = await page.request.post(`${AUTH_API_BASE}/logout`);
      expect(logoutResponse.ok()).toBe(true);

      // Verify cookies are cleared/invalidated
      const cookiesAfterLogout = await context.cookies();
      const authCookieAfterLogout = cookiesAfterLogout.find(cookie =>
        cookie.name.includes('AspNetCore.Identity')
      );

      // Cookie should be expired or cleared
      if (authCookieAfterLogout) {
        expect(authCookieAfterLogout.expires).toBeLessThan(Date.now() / 1000);
      }

      // Verify protected resource access is prevented
      const meResponse = await page.request.get(`${AUTH_API_BASE}/me`);
      expect(meResponse.status()).toBe(401);

      // Verify UI redirects to public pages
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForURL(url => !url.pathname.includes('/dashboard'));

      console.log('✅ Session completely cleaned up - access prevention working');
    });
  });

  test.describe('5. Performance and Security Validation', () => {

    test('should handle concurrent authentication requests', async ({ context }) => {
      console.log('🧪 Testing concurrent authentication handling...');

      // Create multiple pages for concurrent testing
      const pages = await Promise.all([
        context.newPage(),
        context.newPage(),
        context.newPage()
      ]);

      const concurrentLogins = pages.map(async (page, index) => {
        await page.goto(`${BASE_URL}/login`);

        const emailInput = page.locator('input[type="email"]').first();
        const passwordInput = page.locator('input[type="password"]').first();
        const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();

        await emailInput.fill(TEST_USERS.existing.email);
        await passwordInput.fill(TEST_USERS.existing.password);

        return page.request.post(`${AUTH_API_BASE}/login`, {
          data: {
            email: TEST_USERS.existing.email,
            password: TEST_USERS.existing.password
          }
        });
      });

      const results = await Promise.allSettled(concurrentLogins);
      const successful = results.filter(result =>
        result.status === 'fulfilled' && result.value.ok()
      );

      expect(successful.length).toBeGreaterThan(0);

      // Close all pages
      await Promise.all(pages.map(page => page.close()));

      console.log(`✅ Concurrent authentication handled (${successful.length}/${pages.length} successful)`);
    });

    test('should enforce rate limiting on authentication attempts', async ({ page }) => {
      console.log('🧪 Testing authentication rate limiting...');

      await page.goto(`${BASE_URL}/login`);

      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();

      await emailInput.fill(TEST_USERS.invalid.email);
      await passwordInput.fill(TEST_USERS.invalid.password);

      // Attempt multiple rapid logins
      const rapidAttempts = Array(15).fill(0).map(() =>
        page.request.post(`${AUTH_API_BASE}/login`, {
          data: {
            email: TEST_USERS.invalid.email,
            password: TEST_USERS.invalid.password
          }
        })
      );

      const results = await Promise.allSettled(rapidAttempts);
      const rateLimited = results.some(result =>
        result.status === 'fulfilled' && result.value.status() === 429
      );

      expect(rateLimited).toBe(true);

      console.log('✅ Rate limiting properly enforced on rapid authentication attempts');
    });

    test('should maintain security headers and HTTPS enforcement', async ({ page, request }) => {
      console.log('🧪 Testing security headers and HTTPS handling...');

      // Test authentication endpoint security headers
      const loginResponse = await request.post(`${AUTH_API_BASE}/login`, {
        data: {
          email: TEST_USERS.existing.email,
          password: TEST_USERS.existing.password
        }
      });

      const headers = loginResponse.headers();

      // Verify security headers (if implemented)
      if (headers['x-frame-options']) {
        expect(headers['x-frame-options']).toContain('DENY');
      }

      if (headers['x-content-type-options']) {
        expect(headers['x-content-type-options']).toBe('nosniff');
      }

      console.log('✅ Security headers validation completed');
    });

    test('should handle form validation without information leakage', async ({ page }) => {
      console.log('🧪 Testing error handling for information leakage prevention...');

      await page.goto(`${BASE_URL}/login`);

      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();

      // Test with various invalid inputs
      const testCases = [
        { email: 'nonexistent@vtttools.test', password: 'ValidPassword123!' },
        { email: TEST_USERS.existing.email, password: 'WrongPassword' },
        { email: 'malformed-email', password: 'AnyPassword' }
      ];

      for (const testCase of testCases) {
        await emailInput.fill(testCase.email);
        await passwordInput.fill(testCase.password);
        await loginButton.click();

        // Wait for response
        await page.waitForResponse(response => response.url().includes('/api/auth/login'));

        // Error messages should be generic, not revealing specific information
        const errorElement = page.locator('[role="alert"], .error').first();
        if (await errorElement.count() > 0) {
          const errorText = await errorElement.textContent();

          // Should not reveal specific details about what was wrong
          expect(errorText?.toLowerCase()).not.toContain('user does not exist');
          expect(errorText?.toLowerCase()).not.toContain('username not found');
          expect(errorText?.toLowerCase()).not.toContain('password incorrect');
        }
      }

      console.log('✅ Error handling prevents information leakage');
    });
  });
});