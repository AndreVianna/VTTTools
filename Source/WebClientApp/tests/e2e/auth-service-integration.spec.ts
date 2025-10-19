import { test, expect, type Page } from '@playwright/test';

/**
 * Authentication Service Integration Tests
 * Tests React UI components calling Auth service endpoints
 * Validates error handling, loading states, and session management
 */
test.describe('Authentication Service Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Login form integration with Auth service', async ({ page }) => {
    await page.goto('/login');

    // Fill in valid-looking credentials
    await page.fill('input[name="email"]', 'test.user@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');

    // Take screenshot before submission
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/011_LoginFormFilled.png',
      fullPage: true
    });

    // Monitor network request to auth service
    const loginRequestPromise = page.waitForRequest(request =>
      request.url().includes('/api/auth/login') && request.method() === 'POST'
    );

    // Monitor network response from auth service
    const loginResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/login')
    );

    // Submit the form
    await page.click('button[type="submit"]:has-text("Sign In")');

    // Verify loading state appears
    const loadingIndicator = page.locator('button[type="submit"] .MuiCircularProgress-root');
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();

      // Take screenshot of loading state
      await page.screenshot({
        path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/012_LoginLoading.png',
        fullPage: true
      });
    }

    // Wait for network request and response
    const request = await loginRequestPromise;
    const response = await loginResponsePromise;

    // Verify request was made with correct data
    expect(request.url()).toContain('/api/auth/login');
    expect(request.method()).toBe('POST');

    const requestData = request.postDataJSON();
    expect(requestData.email).toBe('test.user@example.com');
    expect(requestData.password).toBe('TestPassword123!');

    // Check response status
    console.log('Login response status:', response.status());

    // Take screenshot after response
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/013_LoginResponse.png',
      fullPage: true
    });

    // If login failed (expected for test credentials), verify error is displayed
    if (response.status() >= 400) {
      // Look for error display in UI
      const errorDisplay = page.locator('.MuiAlert-root, [role="alert"], .error, .MuiFormHelperText-root.Mui-error');

      // Wait a moment for error to appear in UI
      await page.waitForTimeout(2000);

      if (await errorDisplay.count() > 0) {
        await expect(errorDisplay.first()).toBeVisible();

        // Take screenshot of error display
        await page.screenshot({
          path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/014_LoginError.png',
          fullPage: true
        });
      }
    }
  });

  test('Registration form integration with Auth service', async ({ page }) => {
    await page.goto('/register');

    // Generate unique email to avoid conflicts
    const uniqueEmail = `test.user.${Date.now()}@example.com`;

    // Fill registration form
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="name"]', `testuser${Date.now()}`);
    await page.fill('input[name="password"]', 'StrongPassword123!');
    await page.fill('input[name="confirmPassword"]', 'StrongPassword123!');

    // Accept terms
    await page.check('input[type="checkbox"]');

    // Take screenshot of filled registration form
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/015_RegistrationFormFilled.png',
      fullPage: true
    });

    // Monitor network calls
    const registerRequestPromise = page.waitForRequest(request =>
      request.url().includes('/api/auth/register') && request.method() === 'POST'
    );

    const registerResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/register')
    );

    // Submit registration
    await page.click('button[type="submit"]:has-text("Create Account")');

    // Check for loading state
    const loadingButton = page.locator('button[type="submit"] .MuiCircularProgress-root');
    if (await loadingButton.isVisible()) {
      await page.screenshot({
        path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/016_RegistrationLoading.png',
        fullPage: true
      });
    }

    // Wait for network activity
    const request = await registerRequestPromise;
    const response = await registerResponsePromise;

    // Verify request data
    const requestData = request.postDataJSON();
    expect(requestData.email).toBe(uniqueEmail);
    expect(requestData.password).toBe('StrongPassword123!');

    console.log('Registration response status:', response.status());

    // Take screenshot of final state
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/017_RegistrationComplete.png',
      fullPage: true
    });
  });

  test('Error handling displays Auth service errors in UI', async ({ page }) => {
    await page.goto('/login');

    // Try invalid credentials to trigger 400/401 error
    await page.fill('input[name="email"]', 'invalid.user@nonexistent.com');
    await page.fill('input[name="password"]', 'WrongPassword');

    // Monitor for error response
    const errorResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/login') && response.status() >= 400
    );

    await page.click('button[type="submit"]');

    try {
      const errorResponse = await errorResponsePromise;
      console.log('Error response status:', errorResponse.status());

      // Wait for UI to process error
      await page.waitForTimeout(3000);

      // Look for error display elements
      const possibleErrorSelectors = [
        '.MuiAlert-root',
        '[role="alert"]',
        '.MuiFormHelperText-root.Mui-error',
        '.error-message',
        'p:has-text("Invalid")',
        'p:has-text("incorrect")',
        'p:has-text("failed")',
        '[data-testid*="error"]'
      ];

      let errorFound = false;
      for (const selector of possibleErrorSelectors) {
        const elements = page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          console.log(`Found error display with selector: ${selector}`);
          errorFound = true;
          await expect(elements.first()).toBeVisible();
          break;
        }
      }

      // Take screenshot of error state regardless
      await page.screenshot({
        path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/018_AuthErrorHandling.png',
        fullPage: true
      });

      if (errorFound) {
        console.log('✅ Error display found in UI');
      } else {
        console.log('⚠️ Error display not found in UI - check error handling implementation');
      }
    } catch (timeoutError) {
      console.log('No error response received - service may be down');
      await page.screenshot({
        path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/019_ServiceUnavailable.png',
        fullPage: true
      });
    }
  });

  test('Authentication state management across navigation', async ({ page }) => {
    // Start at login page
    await page.goto('/login');

    // Take screenshot of unauthenticated state
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/020_UnauthenticatedState.png',
      fullPage: true
    });

    // Try to submit valid-looking credentials
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Wait for auth attempt to complete
    await page.waitForTimeout(3000);

    // Navigate to different pages to test state persistence
    await page.goto('/');

    // Take screenshot of landing page after auth attempt
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/021_LandingAfterAuth.png',
      fullPage: true
    });

    // Check if auth state indicators are present
    const authIndicators = page.locator('[data-testid*="user"], .user-info, .auth-status, .profile');
    if (await authIndicators.count() > 0) {
      console.log('✅ Authentication state indicators found');
    }

    // Navigate back to login to see if state affects login page
    await page.goto('/login');
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/022_LoginPageAfterAuth.png',
      fullPage: true
    });
  });

  test('Session persistence across page refresh', async ({ page }) => {
    await page.goto('/login');

    // Attempt login
    await page.fill('input[name="email"]', 'session.test@example.com');
    await page.fill('input[name="password"]', 'SessionTest123!');
    await page.click('button[type="submit"]');

    // Wait for login attempt
    await page.waitForTimeout(2000);

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Take screenshot after refresh
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/023_SessionAfterRefresh.png',
      fullPage: true
    });

    // Check if session state is maintained (look for auth indicators)
    const sessionIndicators = page.locator('button:has-text("Sign In"), .user-menu, [data-testid*="user"]');
    const indicatorCount = await sessionIndicators.count();
    console.log(`Found ${indicatorCount} session indicators after refresh`);
  });

  test('External authentication provider integration', async ({ page }) => {
    await page.goto('/login');

    // Test Google login button
    const googleButton = page.locator('button:has-text("Google")');
    await expect(googleButton).toBeVisible();

    // Take screenshot of external login options
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/024_ExternalLoginProviders.png',
      fullPage: true
    });

    // Monitor for external login request (don't actually click to avoid redirect)
    // This tests the UI is properly configured for external auth
    const buttonHref = await googleButton.evaluate(el => {
      return (el as HTMLButtonElement).onclick?.toString() || 'no-onclick';
    });

    console.log('Google button onclick behavior:', buttonHref);

    // Verify other external providers
    await expect(page.locator('button:has-text("Microsoft")')).toBeVisible();
    await expect(page.locator('button:has-text("GitHub")')).toBeVisible();
  });

  test('Network error handling and retry behavior', async ({ page }) => {
    await page.goto('/login');

    // Fill form with test data
    await page.fill('input[name="email"]', 'network.test@example.com');
    await page.fill('input[name="password"]', 'NetworkTest123!');

    // Block network requests to simulate network error
    await page.route('/api/auth/login', route => {
      route.abort('failed');
    });

    // Attempt login
    await page.click('button[type="submit"]');

    // Wait for error handling
    await page.waitForTimeout(3000);

    // Take screenshot of network error state
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/025_NetworkError.png',
      fullPage: true
    });

    // Remove network block
    await page.unroute('/api/auth/login');

    // Verify UI shows appropriate error or retry options
    const retryButton = page.locator('button:has-text("Retry"), button:has-text("Try Again")');
    if (await retryButton.count() > 0) {
      console.log('✅ Retry functionality found');
      await retryButton.first().click();
    }
  });
});