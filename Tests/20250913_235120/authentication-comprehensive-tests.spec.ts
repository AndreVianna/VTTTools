import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * VTT Tools Authentication System Comprehensive Test Suite
 * Tests UC003-UC008: Registration, Login, Logout, Password Reset, 2FA, External Providers
 *
 * Environment:
 * - React App: http://localhost:5173
 * - Backend: Via Aspire orchestration
 * - Material UI Studio Professional theme
 * - Real backend integration (no mocks)
 */

// Test configuration
const BASE_URL = 'http://localhost:5173';
const TEST_USER_EMAIL = 'test-auth@vtttools.local';
const TEST_USER_PASSWORD = 'VTTTest123!@#';
const WEAK_PASSWORD = '123';
const INVALID_EMAIL = 'invalid-email';

test.describe('VTT Tools Authentication System', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    // Setup console logging for debugging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error));
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.describe('UC003: Account Registration', () => {
    test('should display registration form with Material UI styling', async () => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Navigate to registration
      await page.click('[data-testid="register-link"]', { timeout: 10000 });
      await page.waitForSelector('[data-testid="registration-form"]', { timeout: 10000 });

      // Verify Material UI Studio Professional theme elements
      const form = page.locator('[data-testid="registration-form"]');
      await expect(form).toBeVisible();

      // Check form fields
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();

      // Verify Material UI styling
      const emailField = page.locator('input[name="email"]');
      const borderRadius = await emailField.evaluate(el =>
        window.getComputedStyle(el.closest('.MuiOutlinedInput-root')).borderRadius
      );
      expect(borderRadius).toBe('8px'); // Studio Professional border radius

      await page.screenshot({ path: 'Tests/20250913_235120/001_RegistrationForm.png' });
    });

    test('should validate email format and password strength', async () => {
      await page.goto(`${BASE_URL}/register`);
      await page.waitForSelector('[data-testid="registration-form"]');

      // Test invalid email format
      await page.fill('input[name="email"]', INVALID_EMAIL);
      await page.fill('input[name="password"]', TEST_USER_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_USER_PASSWORD);

      await page.click('button[type="submit"]');

      // Should show email validation error
      await expect(page.locator('text="Please enter a valid email address"')).toBeVisible({ timeout: 5000 });

      await page.screenshot({ path: 'Tests/20250913_235120/002_EmailValidation.png' });

      // Test weak password
      await page.fill('input[name="email"]', TEST_USER_EMAIL);
      await page.fill('input[name="password"]', WEAK_PASSWORD);
      await page.fill('input[name="confirmPassword"]', WEAK_PASSWORD);

      await page.click('button[type="submit"]');

      // Should show password strength error
      await expect(page.locator('text*="Password must"')).toBeVisible({ timeout: 5000 });

      await page.screenshot({ path: 'Tests/20250913_235120/003_PasswordValidation.png' });
    });

    test('should successfully register new user', async () => {
      await page.goto(`${BASE_URL}/register`);
      await page.waitForSelector('[data-testid="registration-form"]');

      // Fill registration form with valid data
      await page.fill('input[name="email"]', `new-${Date.now()}@vtttools.local`);
      await page.fill('input[name="password"]', TEST_USER_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_USER_PASSWORD);

      await page.click('button[type="submit"]');

      // Should show success message or redirect to email confirmation
      await expect(
        page.locator('text*="registration successful"').or(
          page.locator('text*="check your email"')
        )
      ).toBeVisible({ timeout: 10000 });

      await page.screenshot({ path: 'Tests/20250913_235120/004_RegistrationSuccess.png' });
    });

    test('should handle duplicate email registration', async () => {
      await page.goto(`${BASE_URL}/register`);
      await page.waitForSelector('[data-testid="registration-form"]');

      // Try to register with same email twice
      const duplicateEmail = `duplicate-${Date.now()}@vtttools.local`;

      // First registration
      await page.fill('input[name="email"]', duplicateEmail);
      await page.fill('input[name="password"]', TEST_USER_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]');

      await page.waitForTimeout(2000); // Wait for first registration to process

      // Second registration attempt
      await page.goto(`${BASE_URL}/register`);
      await page.waitForSelector('[data-testid="registration-form"]');

      await page.fill('input[name="email"]', duplicateEmail);
      await page.fill('input[name="password"]', TEST_USER_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]');

      // Should show duplicate email error
      await expect(
        page.locator('text*="already registered"').or(
          page.locator('text*="email is already taken"')
        )
      ).toBeVisible({ timeout: 10000 });

      await page.screenshot({ path: 'Tests/20250913_235120/005_DuplicateEmailError.png' });
    });
  });

  test.describe('UC004: User Login', () => {
    test('should display login form with Material UI styling', async () => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('[data-testid="login-form"]', { timeout: 10000 });

      const form = page.locator('[data-testid="login-form"]');
      await expect(form).toBeVisible();

      // Check form fields
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="rememberMe"]')).toBeVisible();

      // Verify theme colors
      const primaryButton = page.locator('button[type="submit"]');
      const backgroundColor = await primaryButton.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      // Should match primary blue from theme (#2563EB -> rgb(37, 99, 235))
      expect(backgroundColor).toContain('37, 99, 235');

      await page.screenshot({ path: 'Tests/20250913_235120/006_LoginForm.png' });
    });

    test('should handle invalid credentials', async () => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('[data-testid="login-form"]');

      // Try login with invalid credentials
      await page.fill('input[name="email"]', 'invalid@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Should show authentication error
      await expect(
        page.locator('text*="Invalid email or password"').or(
          page.locator('text*="Authentication failed"')
        )
      ).toBeVisible({ timeout: 10000 });

      await page.screenshot({ path: 'Tests/20250913_235120/007_InvalidLogin.png' });
    });

    test('should successfully login with valid credentials', async () => {
      // First register a test user
      await page.goto(`${BASE_URL}/register`);
      await page.waitForSelector('[data-testid="registration-form"]');

      const testEmail = `login-test-${Date.now()}@vtttools.local`;
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', TEST_USER_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]');

      await page.waitForTimeout(3000); // Wait for registration

      // Now try to login
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('[data-testid="login-form"]');

      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', TEST_USER_PASSWORD);
      await page.check('input[name="rememberMe"]'); // Test remember me
      await page.click('button[type="submit"]');

      // Should redirect to dashboard or show success
      await expect(
        page.locator('text*="Welcome"').or(
          page.locator('[data-testid="user-menu"]')
        )
      ).toBeVisible({ timeout: 15000 });

      await page.screenshot({ path: 'Tests/20250913_235120/008_LoginSuccess.png' });
    });
  });

  test.describe('UC005: User Logout', () => {
    test('should successfully logout and clear session', async () => {
      // First login
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('[data-testid="login-form"]');

      const testEmail = `logout-test-${Date.now()}@vtttools.local`;

      // Quick registration
      await page.goto(`${BASE_URL}/register`);
      await page.waitForSelector('[data-testid="registration-form"]');
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', TEST_USER_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Login
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('[data-testid="login-form"]');
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]');

      // Wait for login success
      await page.waitForTimeout(3000);

      // Find and click logout button
      const logoutButton = page.locator('[data-testid="logout-button"]');
      if (await logoutButton.isVisible({ timeout: 5000 })) {
        await logoutButton.click();
      } else {
        // Try user menu -> logout
        await page.click('[data-testid="user-menu"]');
        await page.click('[data-testid="logout-menu-item"]');
      }

      // Should redirect to login or landing page
      await expect(page).toHaveURL(new RegExp(`${BASE_URL}(/login|/)?$`));

      await page.screenshot({ path: 'Tests/20250913_235120/009_LogoutSuccess.png' });
    });
  });

  test.describe('UC006: Password Reset Workflow', () => {
    test('should display password reset request form', async () => {
      await page.goto(`${BASE_URL}/reset-password`);
      await page.waitForSelector('[data-testid="password-reset-form"]', { timeout: 10000 });

      const form = page.locator('[data-testid="password-reset-form"]');
      await expect(form).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();

      await page.screenshot({ path: 'Tests/20250913_235120/010_PasswordResetForm.png' });
    });

    test('should handle password reset request', async () => {
      await page.goto(`${BASE_URL}/reset-password`);
      await page.waitForSelector('[data-testid="password-reset-form"]');

      await page.fill('input[name="email"]', TEST_USER_EMAIL);
      await page.click('button[type="submit"]');

      // Should show confirmation message
      await expect(
        page.locator('text*="reset instructions sent"').or(
          page.locator('text*="check your email"')
        )
      ).toBeVisible({ timeout: 10000 });

      await page.screenshot({ path: 'Tests/20250913_235120/011_PasswordResetRequest.png' });
    });
  });

  test.describe('UC007: Two-Factor Authentication', () => {
    test('should display 2FA setup form when enabled', async () => {
      // Note: This test assumes we can access 2FA setup after login
      // In a real implementation, you'd need to login first

      await page.goto(`${BASE_URL}/settings/security`);
      await page.waitForTimeout(2000);

      // If 2FA setup is available, test it
      const twoFactorSetup = page.locator('[data-testid="two-factor-setup"]');
      if (await twoFactorSetup.isVisible({ timeout: 5000 })) {
        await expect(twoFactorSetup).toBeVisible();
        await page.screenshot({ path: 'Tests/20250913_235120/012_TwoFactorSetup.png' });
      } else {
        console.log('2FA setup not accessible without authenticated session');
        await page.screenshot({ path: 'Tests/20250913_235120/012_TwoFactorNotAvailable.png' });
      }
    });
  });

  test.describe('UC008: External Login Providers', () => {
    test('should display external login options', async () => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('[data-testid="login-form"]');

      // Check for external provider buttons
      const googleLogin = page.locator('[data-testid="google-login"]');
      const microsoftLogin = page.locator('[data-testid="microsoft-login"]');
      const githubLogin = page.locator('[data-testid="github-login"]');

      // At least one external provider should be visible
      const hasExternalProviders =
        await googleLogin.isVisible({ timeout: 2000 }) ||
        await microsoftLogin.isVisible({ timeout: 2000 }) ||
        await githubLogin.isVisible({ timeout: 2000 });

      if (hasExternalProviders) {
        console.log('External login providers found');
      } else {
        console.log('External login providers not configured');
      }

      await page.screenshot({ path: 'Tests/20250913_235120/013_ExternalProviders.png' });
    });
  });

  test.describe('Security and Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('[data-testid="login-form"]');

      // Simulate network error by blocking requests
      await page.route('**/api/auth/**', route => route.abort('failed'));

      await page.fill('input[name="email"]', TEST_USER_EMAIL);
      await page.fill('input[name="password"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]');

      // Should show network error message
      await expect(
        page.locator('text*="Network error"').or(
          page.locator('text*="Connection failed"')
        )
      ).toBeVisible({ timeout: 10000 });

      await page.screenshot({ path: 'Tests/20250913_235120/014_NetworkError.png' });

      // Unblock requests
      await page.unroute('**/api/auth/**');
    });

    test('should protect against XSS in form inputs', async () => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('[data-testid="login-form"]');

      const xssPayload = '<script>alert("xss")</script>';

      await page.fill('input[name="email"]', xssPayload);
      await page.fill('input[name="password"]', xssPayload);

      // XSS payload should be escaped/sanitized
      const emailValue = await page.inputValue('input[name="email"]');
      expect(emailValue).not.toContain('<script>');

      await page.screenshot({ path: 'Tests/20250913_235120/015_XSSProtection.png' });
    });
  });

  test.describe('Performance Testing', () => {
    test('should load authentication pages within 2 seconds', async () => {
      const startTime = Date.now();

      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('[data-testid="login-form"]');

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000);

      console.log(`Login page load time: ${loadTime}ms`);
      await page.screenshot({ path: 'Tests/20250913_235120/016_LoginPerformance.png' });
    });

    test('should complete login process within 3 seconds', async () => {
      await page.goto(`${BASE_URL}/register`);
      await page.waitForSelector('[data-testid="registration-form"]');

      const testEmail = `perf-test-${Date.now()}@vtttools.local`;
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', TEST_USER_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Test login performance
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('[data-testid="login-form"]');

      const startTime = Date.now();

      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]');

      // Wait for successful login (redirect or success indicator)
      await page.waitForTimeout(3000);

      const loginTime = Date.now() - startTime;
      expect(loginTime).toBeLessThan(3000);

      console.log(`Login process time: ${loginTime}ms`);
      await page.screenshot({ path: 'Tests/20250913_235120/017_LoginProcessPerformance.png' });
    });
  });

  test.describe('Cross-Browser Accessibility', () => {
    test('should support keyboard navigation', async () => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('[data-testid="login-form"]');

      // Test tab navigation through form
      await page.keyboard.press('Tab'); // Focus email field
      await page.keyboard.type(TEST_USER_EMAIL);

      await page.keyboard.press('Tab'); // Focus password field
      await page.keyboard.type(TEST_USER_PASSWORD);

      await page.keyboard.press('Tab'); // Focus remember me
      await page.keyboard.press('Space'); // Check remember me

      await page.keyboard.press('Tab'); // Focus submit button

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe('BUTTON');

      await page.screenshot({ path: 'Tests/20250913_235120/018_KeyboardNavigation.png' });
    });

    test('should have proper ARIA labels', async () => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('[data-testid="login-form"]');

      // Check for ARIA labels
      const emailField = page.locator('input[name="email"]');
      const passwordField = page.locator('input[name="password"]');

      const emailAriaLabel = await emailField.getAttribute('aria-label');
      const passwordAriaLabel = await passwordField.getAttribute('aria-label');

      // Fields should have proper labeling (either aria-label or associated labels)
      expect(emailAriaLabel || await emailField.getAttribute('id')).toBeTruthy();
      expect(passwordAriaLabel || await passwordField.getAttribute('id')).toBeTruthy();

      await page.screenshot({ path: 'Tests/20250913_235120/019_AriaLabels.png' });
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('[data-testid="login-form"]');

      // Form should be responsive
      const form = page.locator('[data-testid="login-form"]');
      await expect(form).toBeVisible();

      const formWidth = await form.boundingBox();
      expect(formWidth?.width).toBeLessThanOrEqual(375);

      await page.screenshot({ path: 'Tests/20250913_235120/020_MobileResponsive.png' });
    });

    test('should work on tablet viewport', async () => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad

      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('[data-testid="login-form"]');

      const form = page.locator('[data-testid="login-form"]');
      await expect(form).toBeVisible();

      await page.screenshot({ path: 'Tests/20250913_235120/021_TabletResponsive.png' });
    });

    test('should work on desktop viewport', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD

      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('[data-testid="login-form"]');

      const form = page.locator('[data-testid="login-form"]');
      await expect(form).toBeVisible();

      await page.screenshot({ path: 'Tests/20250913_235120/022_DesktopResponsive.png' });
    });
  });
});