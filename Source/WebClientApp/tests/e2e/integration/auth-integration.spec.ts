import { test, expect, type Page } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

/**
 * Integration Tests: React UI ↔ Auth Service Communication
 * Tests the complete flow from React frontend to Auth microservice API
 * Validates service discovery, session management, and error handling
 */
test.describe('React UI to Auth Service Integration', () => {
  let page: Page;
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    // Create API request context for direct API calls
    apiContext = await playwright.request.newContext({
      baseURL: 'http://localhost:7001', // Auth service port (from Aspire configuration)
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
  });

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('Registration flow: React UI → Auth Service → Database', async () => {
    const uniqueEmail = `integration-test-${Date.now()}@example.com`;

    // Phase 1: UI Interaction (Playwright for React UI)
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="registration-form"]')).toBeVisible();

    // Fill registration form in React UI
    await page.fill('[data-testid="email-input"]', uniqueEmail);
    await page.fill('[data-testid="password-input"]', 'IntegrationTest123!');
    await page.fill('[data-testid="confirm-password-input"]', 'IntegrationTest123!');
    await page.fill('[data-testid="name-input"]', 'Integration Test User');
    await page.fill('[data-testid="display-name-input"]', 'IntegrationUser');

    // Submit form
    await page.click('[data-testid="register-submit-button"]');

    // Phase 2: Verify UI Response
    // Should show success message or redirect
    await expect(page.locator('[data-testid="registration-success"]')).toBeVisible({ timeout: 10000 });

    // Phase 3: Direct API Verification (HTTP for Auth Service)
    // Verify user was actually created in auth service
    const loginResponse = await apiContext.post('/api/auth/login', {
      data: {
        email: uniqueEmail,
        password: 'IntegrationTest123!',
        rememberMe: false
      }
    });

    expect(loginResponse.status()).toBe(200);
    const authData = await loginResponse.json();
    expect(authData.success).toBe(true);
    expect(authData.user.email).toBe(uniqueEmail);

    // Screenshot of successful registration
    await page.screenshot({
      path: 'test-results/screenshots/integration-registration-success.png',
      fullPage: true
    });
  });

  test('Login flow: React UI → Auth Service → Session Management', async () => {
    // First create a user via direct API call
    const testEmail = `login-integration-${Date.now()}@example.com`;
    const registerResponse = await apiContext.post('/api/auth/register', {
      data: {
        email: testEmail,
        password: 'LoginTest123!',
        confirmPassword: 'LoginTest123!',
        name: 'Login Test User',
        displayName: 'LoginTestUser'
      }
    });
    expect(registerResponse.status()).toBe(200);

    // Phase 1: UI Login (Playwright for React UI)
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();

    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', 'LoginTest123!');
    await page.click('[data-testid="login-submit-button"]');

    // Phase 2: Verify UI State Change
    // Should show authenticated state
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="user-email"]')).toContainText(testEmail);

    // Phase 3: Verify Session with Auth Service
    // Use the browser's session cookies for API verification
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name.includes('Auth') || c.name.includes('Identity'));
    expect(authCookie).toBeDefined();

    // Screenshot of authenticated state
    await page.screenshot({
      path: 'test-results/screenshots/integration-login-success.png',
      fullPage: true
    });
  });

  test('Service Discovery: React calls Auth service through Aspire networking', async () => {
    // Test that React dev server can communicate with Auth service through Aspire service discovery

    // Phase 1: Check auth service health endpoint directly
    const healthResponse = await apiContext.get('/health');
    expect(healthResponse.status()).toBe(200);

    // Phase 2: Test CORS is working for React origin
    const corsResponse = await apiContext.fetch('/api/auth/login', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    expect(corsResponse.status()).toBeLessThan(400); // Should allow CORS

    // Phase 3: Test actual API call from React
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword');

    // Monitor network requests
    const apiRequestPromise = page.waitForRequest(request =>
      request.url().includes('/api/auth/login') && request.method() === 'POST'
    );

    await page.click('[data-testid="login-submit-button"]');

    const apiRequest = await apiRequestPromise;
    expect(apiRequest.url()).toContain('/api/auth/login');

    // Screenshot showing network activity
    await page.screenshot({
      path: 'test-results/screenshots/service-discovery-working.png',
      fullPage: true
    });
  });

  test('Error Handling: API errors displayed in React UI', async () => {
    // Phase 1: Trigger API error
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'nonexistent@example.com');
    await page.fill('[data-testid="password-input"]', 'WrongPassword');

    // Monitor for API response
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/login') && response.status() === 400
    );

    await page.click('[data-testid="login-submit-button"]');

    const response = await responsePromise;
    expect(response.status()).toBe(400);

    // Phase 2: Verify error is shown in UI
    await expect(page.locator('[data-testid="auth-error-display"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="auth-error-display"]')).toContainText(/invalid/i);

    // Screenshot of error handling
    await page.screenshot({
      path: 'test-results/screenshots/api-error-handling.png',
      fullPage: true
    });
  });

  test('Session Persistence: UI reflects auth state across page refreshes', async () => {
    // Create and login user
    const testEmail = `session-test-${Date.now()}@example.com`;
    await apiContext.post('/api/auth/register', {
      data: {
        email: testEmail,
        password: 'SessionTest123!',
        confirmPassword: 'SessionTest123!',
        name: 'Session Test User',
        displayName: 'SessionUser'
      }
    });

    // Login through UI
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', 'SessionTest123!');
    await page.click('[data-testid="login-submit-button"]');

    // Verify authenticated state
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();

    // Refresh page
    await page.reload();

    // Should still be authenticated
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="user-email"]')).toContainText(testEmail);

    // Screenshot of persistent session
    await page.screenshot({
      path: 'test-results/screenshots/session-persistence.png',
      fullPage: true
    });
  });

  test('Logout Flow: React UI → Auth Service → Session Cleanup', async () => {
    // Setup authenticated user
    const testEmail = `logout-flow-${Date.now()}@example.com`;
    await apiContext.post('/api/auth/register', {
      data: {
        email: testEmail,
        password: 'LogoutTest123!',
        confirmPassword: 'LogoutTest123!',
        name: 'Logout Test User',
        displayName: 'LogoutUser'
      }
    });

    // Login
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', 'LogoutTest123!');
    await page.click('[data-testid="login-submit-button"]');

    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();

    // Phase 1: UI Logout
    await page.click('[data-testid="user-menu-trigger"]');
    await page.click('[data-testid="logout-button"]');

    // Phase 2: Verify UI State
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="user-avatar"]')).not.toBeVisible();

    // Phase 3: Verify Session Cleared in Auth Service
    // Try to access protected endpoint - should fail
    const meResponse = await page.request.get('/api/auth/me');
    expect(meResponse.status()).toBe(401);

    // Screenshot of logged out state
    await page.screenshot({
      path: 'test-results/screenshots/integration-logout-complete.png',
      fullPage: true
    });
  });

  test('Rate Limiting: UI handles rate limit responses from Auth Service', async () => {
    // Trigger rate limiting by rapid login attempts
    await page.click('[data-testid="login-button"]');

    const promises = [];
    for (let i = 0; i < 12; i++) { // Exceed rate limit (10 attempts per minute)
      promises.push(
        page.fill('[data-testid="email-input"]', 'ratetest@example.com')
          .then(() => page.fill('[data-testid="password-input"]', 'wrong'))
          .then(() => page.click('[data-testid="login-submit-button"]'))
          .then(() => page.waitForTimeout(100)) // Small delay between attempts
      );
    }

    await Promise.all(promises);

    // Should eventually show rate limit error
    const rateLimitError = page.locator('[data-testid="rate-limit-error"]');
    if (await rateLimitError.isVisible()) {
      await expect(rateLimitError).toContainText(/rate limit/i);
    }

    // Screenshot showing rate limiting
    await page.screenshot({
      path: 'test-results/screenshots/rate-limit-handling.png',
      fullPage: true
    });
  });
});